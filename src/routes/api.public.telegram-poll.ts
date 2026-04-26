import { createFileRoute } from "@tanstack/react-router";

const GATEWAY_URL = "https://connector-gateway.lovable.dev/telegram";

type CallbackQuery = {
  id: string;
  data?: string;
  message?: {
    message_id: number;
    chat: { id: number };
    text?: string;
  };
  from?: { first_name?: string; username?: string };
};

type Update = {
  update_id: number;
  callback_query?: CallbackQuery;
};

const STATUS_LABELS: Record<string, string> = {
  pending: "PENDING",
  sold: "SOLD",
  canceled: "CANCELED",
};

function buildMarkup(status: string) {
  if (status === "pending") {
    return {
      inline_keyboard: [
        [
          { text: "Mark as Sold", callback_data: "status:sold" },
          { text: "Mark as Canceled", callback_data: "status:canceled" },
        ],
      ],
    };
  }

  return { inline_keyboard: [] };
}

function appendOrReplaceStatus(originalText: string, statusLine: string): string {
  const cleaned = originalText
    .split("\n")
    .filter((line) => !line.startsWith("Status:"))
    .join("\n")
    .replace(/\n+$/g, "");

  return `${cleaned}\n\nStatus: <b>${statusLine}</b>`;
}

async function tg(method: string, payload: unknown, lovableKey: string, tgKey: string) {
  const response = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": tgKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await response.json().catch(() => ({}));

  if (!response.ok) {
    console.error(`Telegram ${method} failed`, response.status, body);
  }

  return body;
}

export const Route = createFileRoute("/api/public/telegram-poll")({
  server: {
    handlers: {
      GET: handler,
      POST: handler,
    },
  },
});

async function handler() {
  const LOVABLE_API_KEY = process.env.LOVABLE_API_KEY;
  const TELEGRAM_API_KEY = process.env.TELEGRAM_API_KEY;

  if (!LOVABLE_API_KEY || !TELEGRAM_API_KEY) {
    return new Response(JSON.stringify({ error: "Telegram not configured" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }

  let processed = 0;
  let offset: number | undefined;

  for (let i = 0; i < 5; i++) {
    const response: { ok: boolean; result?: Update[] } = await tg(
      "getUpdates",
      {
        offset,
        timeout: 0,
        limit: 100,
        allowed_updates: ["callback_query"],
      },
      LOVABLE_API_KEY,
      TELEGRAM_API_KEY,
    );

    const updates = response.result ?? [];
    if (updates.length === 0) break;

    for (const update of updates) {
      const callback = update.callback_query;
      if (!callback || !callback.data || !callback.message) continue;

      const [, status] = callback.data.split(":");
      if (!status || !STATUS_LABELS[status]) {
        await tg(
          "answerCallbackQuery",
          { callback_query_id: callback.id },
          LOVABLE_API_KEY,
          TELEGRAM_API_KEY,
        );
        continue;
      }

      const newText = appendOrReplaceStatus(callback.message.text ?? "", STATUS_LABELS[status]);
      const markup = buildMarkup(status);

      await tg(
        "editMessageText",
        {
          chat_id: callback.message.chat.id,
          message_id: callback.message.message_id,
          text: newText,
          parse_mode: "HTML",
          reply_markup: markup,
        },
        LOVABLE_API_KEY,
        TELEGRAM_API_KEY,
      );

      await tg(
        "answerCallbackQuery",
        {
          callback_query_id: callback.id,
          text: `Marked as ${STATUS_LABELS[status]}`,
        },
        LOVABLE_API_KEY,
        TELEGRAM_API_KEY,
      );

      processed++;
    }

    offset = updates[updates.length - 1].update_id + 1;
    if (updates.length < 100) break;
  }

  return new Response(JSON.stringify({ ok: true, processed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
