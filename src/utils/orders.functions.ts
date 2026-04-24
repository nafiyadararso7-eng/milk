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
      `🥛 <b>MILK ORDER</b>\n\n` +
      `👤 <b>Name:</b> ${escapeHtml(data.name)}\n` +
      `📞 <b>Phone:</b> ${escapeHtml(data.phone)}\n` +
      `📦 <b>Quantity:</b> ${data.quantity} L\n` +
      `💰 <b>Total Price:</b> ${data.price} Birr\n` +
      `📍 <b>Location:</b> ${escapeHtml(data.location)} ${data.locationType === "gps" ? "(GPS)" : ""}\n\n` +
      `🚨 <i>New order received – please contact customer immediately</i>`;

    const res = await fetch("https://connector-gateway.lovable.dev/telegram/sendMessage", {
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
              { text: "🕒 Mark as Pending", callback_data: "status:pending" },
              { text: "✅ Mark as Sold", callback_data: "status:sold" },
            ],
            [{ text: "❌ Mark as Canceled", callback_data: "status:canceled" }],
          ],
        },
      }),
    });

    const body = await res.json();
    if (!res.ok || !body.ok) {
      console.error("Telegram send failed:", res.status, body);
      throw new Error(`Failed to send order (${res.status})`);
    }

    // Best-effort: drain any pending status-button clicks so older order
    // messages get their status updated without needing a separate cron.
    drainCallbacksInBackground(LOVABLE_API_KEY, TELEGRAM_API_KEY).catch((e) =>
      console.error("drainCallbacks error", e)
    );

    return { success: true };
  });

async function drainCallbacksInBackground(lovableKey: string, tgKey: string) {
  const GATEWAY = "https://connector-gateway.lovable.dev/telegram";
  const STATUS: Record<string, string> = {
    pending: "🕒 PENDING",
    sold: "✅ SOLD",
    canceled: "❌ CANCELED",
  };
  const buildMarkup = (status: string) =>
    status === "pending"
      ? {
          inline_keyboard: [
            [
              { text: "✅ Mark as Sold", callback_data: "status:sold" },
              { text: "❌ Mark as Canceled", callback_data: "status:canceled" },
            ],
          ],
        }
      : { inline_keyboard: [] };

  const tg = async (method: string, payload: unknown) => {
    const r = await fetch(`${GATEWAY}/${method}`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${lovableKey}`,
        "X-Connection-Api-Key": tgKey,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });
    return r.json().catch(() => ({}));
  };

  let offset: number | undefined;
  for (let i = 0; i < 3; i++) {
    const res: { result?: Array<{ update_id: number; callback_query?: any }> } =
      await tg("getUpdates", {
        offset,
        timeout: 0,
        limit: 100,
        allowed_updates: ["callback_query"],
      });
    const updates = res.result ?? [];
    if (updates.length === 0) break;

    for (const u of updates) {
      const cb = u.callback_query;
      if (!cb?.data || !cb.message) continue;
      const [, status] = String(cb.data).split(":");
      if (status && STATUS[status]) {
        const orig: string = cb.message.text ?? "";
        const cleaned = orig
          .split("\n")
          .filter((l: string) => !l.startsWith("📌 Status:"))
          .join("\n")
          .replace(/\n+$/g, "");
        const newText = `${cleaned}\n\n📌 Status: <b>${STATUS[status]}</b>`;
        await tg("editMessageText", {
          chat_id: cb.message.chat.id,
          message_id: cb.message.message_id,
          text: newText,
          parse_mode: "HTML",
          reply_markup: buildMarkup(status),
        });
      }
      await tg("answerCallbackQuery", {
        callback_query_id: cb.id,
        text: status && STATUS[status] ? `Marked as ${STATUS[status]}` : "",
      });
    }

    offset = updates[updates.length - 1].update_id + 1;
    if (updates.length < 100) break;
  }
}

function escapeHtml(s: string) {
  return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}
