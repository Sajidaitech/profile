/**
 * Reviews Worker
 * -----------------------------------------------------------------------
 * Endpoints:
 *   POST /api/reviews/submit    -> accept a new pending review, notify Telegram
 *   GET  /api/reviews/approved  -> return only approved reviews (public)
 *   POST /telegram-webhook      -> handles Approve/Reject button presses
 *
 * Storage: a single KV key ("reviews") holding a JSON array of review
 * objects. Fine for a low-traffic personal site; avoids needing KV list().
 *
 * Required bindings (set in wrangler.toml / dashboard):
 *   KV namespace: REVIEWS_KV
 * Required secrets (set via `wrangler secret put <NAME>`):
 *   TELEGRAM_BOT_TOKEN     - from @BotFather
 *   TELEGRAM_CHAT_ID       - chat/user id that receives moderation messages
 *   TELEGRAM_WEBHOOK_SECRET- random string, must match the secret_token
 *                            used when registering the webhook with Telegram
 * Optional:
 *   ALLOWED_ORIGIN         - e.g. "https://www.sajidmk.com" (defaults to "*")
 * -----------------------------------------------------------------------
 */

const MAX_NAME_LEN = 80;
const MAX_ROLE_LEN = 100;
const MAX_MESSAGE_LEN = 800;
const MAX_STORED_REVIEWS = 500; // hard cap so KV value never grows unbounded

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const cors = corsHeaders(env);

    if (request.method === "OPTIONS") {
      return new Response(null, { headers: cors });
    }

    try {
      if (url.pathname === "/api/reviews/submit" && request.method === "POST") {
        return await handleSubmit(request, env, cors);
      }
      if (url.pathname === "/api/reviews/approved" && request.method === "GET") {
        return await handleApproved(env, cors);
      }
      if (url.pathname === "/telegram-webhook" && request.method === "POST") {
        return await handleTelegramWebhook(request, env);
      }
    } catch (err) {
      console.error("Unhandled error:", err);
      return jsonResponse({ error: "Internal error" }, 500, cors);
    }

    return jsonResponse({ error: "Not found" }, 404, cors);
  },
};

function corsHeaders(env) {
  return {
    "Access-Control-Allow-Origin": env.ALLOWED_ORIGIN || "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };
}

function jsonResponse(body, status, extraHeaders) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...(extraHeaders || {}) },
  });
}

async function getReviews(env) {
  const raw = await env.REVIEWS_KV.get("reviews");
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function saveReviews(env, reviews) {
  // Keep the array from growing forever — drop oldest once past the cap.
  const trimmed = reviews.slice(-MAX_STORED_REVIEWS);
  await env.REVIEWS_KV.put("reviews", JSON.stringify(trimmed));
}

function escapeHtml(str) {
  return String(str).replace(/[&<>"']/g, (c) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;",
  }[c]));
}

// ---------- Submit ----------

async function handleSubmit(request, env, cors) {
  let body;
  try {
    body = await request.json();
  } catch {
    return jsonResponse({ error: "Invalid JSON" }, 400, cors);
  }

  const name = String(body.name || "").trim().slice(0, MAX_NAME_LEN);
  const role = String(body.role || "").trim().slice(0, MAX_ROLE_LEN);
  const message = String(body.message || "").trim().slice(0, MAX_MESSAGE_LEN);
  const rating = parseInt(body.rating, 10);

  if (name.length < 2) return jsonResponse({ error: "Name too short" }, 400, cors);
  if (message.length < 5) return jsonResponse({ error: "Message too short" }, 400, cors);
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return jsonResponse({ error: "Invalid rating" }, 400, cors);
  }

  const review = {
    id: crypto.randomUUID(),
    name,
    role: role || null,
    message,
    rating,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const reviews = await getReviews(env);
  reviews.push(review);
  await saveReviews(env, reviews);

  await notifyTelegram(env, review);

  return jsonResponse({ ok: true }, 200, cors);
}

// ---------- Approved (public) ----------

async function handleApproved(env, cors) {
  const reviews = await getReviews(env);
  const approved = reviews
    .filter((r) => r.status === "approved")
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .map((r) => ({
      name: r.name,
      role: r.role,
      message: r.message,
      rating: r.rating,
      createdAt: r.createdAt,
    }));

  return jsonResponse({ reviews: approved }, 200, {
    ...cors,
    "Cache-Control": "public, max-age=60",
  });
}

// ---------- Telegram ----------

async function telegramApi(env, method, payload) {
  const res = await fetch(`https://api.telegram.org/bot${env.TELEGRAM_BOT_TOKEN}/${method}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    console.error(`Telegram API ${method} failed:`, await res.text());
  }
  return res;
}

function reviewSummaryText(review) {
  const stars = "★".repeat(review.rating) + "☆".repeat(5 - review.rating);
  return (
    `📝 New review pending approval\n\n` +
    `Name: ${review.name}\n` +
    (review.role ? `Role: ${review.role}\n` : "") +
    `Rating: ${stars}\n\n` +
    `"${review.message}"`
  );
}

async function notifyTelegram(env, review) {
  if (!env.TELEGRAM_BOT_TOKEN || !env.TELEGRAM_CHAT_ID) {
    console.warn("Telegram not configured; skipping notification.");
    return;
  }
  await telegramApi(env, "sendMessage", {
    chat_id: env.TELEGRAM_CHAT_ID,
    text: reviewSummaryText(review),
    reply_markup: {
      inline_keyboard: [[
        { text: "✅ Approve", callback_data: `approve:${review.id}` },
        { text: "❌ Reject", callback_data: `reject:${review.id}` },
      ]],
    },
  });
}

async function handleTelegramWebhook(request, env) {
  // Verify the request actually came from Telegram.
  const secret = request.headers.get("X-Telegram-Bot-Api-Secret-Token");
  if (!env.TELEGRAM_WEBHOOK_SECRET || secret !== env.TELEGRAM_WEBHOOK_SECRET) {
    return new Response("Forbidden", { status: 403 });
  }

  const update = await request.json().catch(() => null);
  const callback = update && update.callback_query;
  if (!callback || !callback.data) {
    return new Response("ok"); // ignore anything that isn't a button press
  }

  const [action, id] = callback.data.split(":");
  if ((action !== "approve" && action !== "reject") || !id) {
    return new Response("ok");
  }

  const reviews = await getReviews(env);
  const review = reviews.find((r) => r.id === id);

  if (!review) {
    await telegramApi(env, "answerCallbackQuery", {
      callback_query_id: callback.id,
      text: "Review not found (already handled?).",
    });
    return new Response("ok");
  }

  review.status = action === "approve" ? "approved" : "rejected";
  await saveReviews(env, reviews);

  await telegramApi(env, "answerCallbackQuery", {
    callback_query_id: callback.id,
    text: action === "approve" ? "Approved ✅" : "Rejected ❌",
  });

  // Edit the original message so it's clear this one's been handled.
  if (callback.message) {
    const verb = action === "approve" ? "✅ APPROVED" : "❌ REJECTED";
    await telegramApi(env, "editMessageText", {
      chat_id: callback.message.chat.id,
      message_id: callback.message.message_id,
      text: `${verb}\n\n${reviewSummaryText(review)}`,
    });
  }

  return new Response("ok");
}
