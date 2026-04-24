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
  pending: "🕒 PENDING",
  sold: "✅ SOLD",
  canceled: "❌ CANCELED",
};

function buildMarkup(status: string) {
  if (status === "pending") {
    return {
      inline_keyboard: [
        [
          { text: "✅ Mark as Sold", callback_data: "status:sold" },
          { text: "❌ Mark as Canceled", callback_data: "status:canceled" },
        ],
      ],
    };
  }
  // Final states have no buttons
  return { inline_keyboard: [] };
}

function appendOrReplaceStatus(originalText: string, statusLine: string): string {
  // Strip any prior "Status:" line we appended so repeated clicks don't stack
  const cleaned = originalText
    .split("\n")
    .filter((l) => !l.startsWith("📌 Status:"))
    .join("\n")
    .replace(/\n+$/g, "");
  return `${cleaned}\n\n📌 Status: <b>${statusLine}</b>`;
}

async function tg(method: string, payload: unknown, lovableKey: string, tgKey: string) {
  const res = await fetch(`${GATEWAY_URL}/${method}`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${lovableKey}`,
      "X-Connection-Api-Key": tgKey,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    console.error(`Telegram ${method} failed`, res.status, body);
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
    return new Response(
      JSON.stringify({ error: "Telegram not configured" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }

  // Drain all pending callback queries
  let processed = 0;
  let offset: number | undefined = undefined;
  // Loop a few times in case there are >100 pending updates
  for (let i = 0; i < 5; i++) {
    const res: { ok: boolean; result?: Update[] } = await tg(
      "getUpdates",
      {
        offset,
        timeout: 0,
        limit: 100,
        allowed_updates: ["callback_query"],
      },
      LOVABLE_API_KEY,
      TELEGRAM_API_KEY
    );

    const updates = res.result ?? [];
    if (updates.length === 0) break;

    for (const u of updates) {
      const cb = u.callback_query;
      if (!cb || !cb.data || !cb.message) continue;
      const [, status] = cb.data.split(":");
      if (!status || !STATUS_LABELS[status]) {
        await tg(
          "answerCallbackQuery",
          { callback_query_id: cb.id },
          LOVABLE_API_KEY,
          TELEGRAM_API_KEY
        );
        continue;
      }

      const newText = appendOrReplaceStatus(cb.message.text ?? "", STATUS_LABELS[status]);
      const markup = buildMarkup(status);

      await tg(
        "editMessageText",
        {
          chat_id: cb.message.chat.id,
          message_id: cb.message.message_id,
          text: newText,
          parse_mode: "HTML",
          reply_markup: markup,
        },
        LOVABLE_API_KEY,
        TELEGRAM_API_KEY
      );

      await tg(
        "answerCallbackQuery",
        {
          callback_query_id: cb.id,
          text: `Marked as ${STATUS_LABELS[status]}`,
        },
        LOVABLE_API_KEY,
        TELEGRAM_API_KEY
      );

      processed++;
    }

    // Advance offset to ack these updates
    offset = updates[updates.length - 1].update_id + 1;
    if (updates.length < 100) break;
  }

  return new Response(JSON.stringify({ ok: true, processed }), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
}
