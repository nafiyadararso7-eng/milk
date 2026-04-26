import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const orderSchema = z.object({
  name: z.string().trim().min(1).max(100),
  phone: z.string().trim().min(5).max(30),
  quantity: z.number().min(0.25).max(10),
  price: z.number().min(0).max(10000),
  location: z.string().trim().min(1).max(500),
  locationType: z.enum(["gps", "manual"]),
});

type TelegramCallbackQuery = {
  id: string;
  data?: string;
  message?: {
    message_id: number;
    chat: { id: number | string };
    text?: string;
  };
};

type TelegramUpdate = {
  update_id: number;
  callback_query?: TelegramCallbackQuery;
};

export const submitOrder = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => orderSchema.parse(input))
  .handler(async ({ data }) => {
    const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
    const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;
    const TELEGRAM_CHAT_ID = process.env.TELEGRAM_CHAT_ID;

    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY not configured");
    if (!TELEGRAM_API_KEY) throw new Error("TELEGRAM_API_KEY not configured");
    if (!TELEGRAM_CHAT_ID) throw new Error("TELEGRAM_CHAT_ID not configured");

    const text =
      `<b>MILK ORDER</b>\n\n` +
      `<b>Name:</b> ${escapeHtml(data.name)}\n` +
      `<b>Phone:</b> ${escapeHtml(data.phone)}\n` +
      `<b>Quantity:</b> ${data.quantity} L\n` +
      `<b>Total Price:</b> ${data.price} Birr\n` +
      `<b>Location:</b> ${escapeHtml(data.location)} ${data.locationType === "gps" ? "(GPS)" : ""}\n\n` +
      `<i>New order received - please contact customer immediately</i>`;

    const response = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "X-Connection-Api-Key": TELEGRAM_API_KEY,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        chat_id: TELEGRAM_CHAT_ID,
        text,
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              { text: "Mark as Pending", callback_data: "status:pending" },
              { text: "Mark as Sold", callback_data: "status:sold" },
            ],
            [{ text: "Mark as Canceled", callback_data: "status:canceled" }],
          ],
        },
      }),
    });

    const body = await response.json();
    if (!response.ok || !body.ok) {
      console.error("Telegram send failed:", response.status, body);
      throw new Error(`Failed to send order (${response.status})`);
    }

    drainCallbacksInBackground(LOVABLE_API_KEY, TELEGRAM_API_KEY).catch((error) =>
      console.error("drainCallbacks error", error),
    );

    return { success: true };
  });

async function drainCallbacksInBackground(lovableKey: string, tgKey: string) {
  const gateway = "https://connector-gateway.lovable.dev/telegram";
  const statusLabels: Record<string, string> = {
    pending: "PENDING",
    sold: "SOLD",
    canceled: "CANCELED",
  };

  const buildMarkup = (status: string) =>
    status === "pending"
      ? {
          inline_keyboard: [
            [
              { text: "Mark as Sold", callback_data: "status:sold" },
              { text: "Mark as Canceled", callback_data: "status:canceled" },
            ],
          ],
        }
      : { inline_keyboard: [] };

  const tg = async (method: string, payload: unknown) => {
    const response = await fetch(`${gateway}/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": tgKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    return response.json().catch(() => ({}));
  };

  let offset: number | undefined;

  for (let i = 0; i < 3; i++) {
    const response: { result?: TelegramUpdate[] } = await tg("getUpdates", {
      offset,
      timeout: 0,
      limit: 100,
      allowed_updates: ["callback_query"],
    });
    const updates = response.result ?? [];

    if (updates.length === 0) break;

    for (const update of updates) {
      const callback = update.callback_query;
      if (!callback?.data || !callback.message) continue;

      const [, status] = String(callback.data).split(":");
      if (status && statusLabels[status]) {
        const originalText = callback.message.text ?? "";
        const cleanedText = originalText
          .split("\n")
          .filter((line: string) => !line.startsWith("Status:"))
          .join("\n")
          .replace(/\n+$/g, "");
        const newText = `${cleanedText}\n\nStatus: <b>${statusLabels[status]}</b>`;

        await tg("editMessageText", {
          chat_id: callback.message.chat.id,
          message_id: callback.message.message_id,
          text: newText,
          parse_mode: "HTML",
          reply_markup: buildMarkup(status),
        });
      }

      await tg("answerCallbackQuery", {
        callback_query_id: callback.id,
        text: status && statusLabels[status] ? `Marked as ${statusLabels[status]}` : "",
      });
    }

    offset = updates[updates.length - 1].update_id + 1;
    if (updates.length < 100) break;
  }
}

function escapeHtml(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
