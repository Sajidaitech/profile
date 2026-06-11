// ============================================================
// supabase/functions/admin-reviews/index.ts
// sajidmk.com · Reviews project Edge Function
//
// PURPOSE
// ───────
// Proxy for all privileged admin operations on the `reviews` table.
// The service_role key NEVER appears in any client-side file.
// It is only available here as the auto-injected Deno env var
// SUPABASE_SERVICE_ROLE_KEY (set automatically by Supabase for every
// Edge Function in the project).
//
// AUTH MODEL
// ──────────
// The caller (admin-dashboard.html) sends a pre-shared API key in the
// Authorization header:  Authorization: Bearer <ADMIN_API_KEY>
//
// ADMIN_API_KEY is:
//   · Generated once with:  openssl rand -hex 32
//   · Stored in Supabase Dashboard → Edge Functions → admin-reviews → Secrets
//     as ADMIN_API_KEY   (never committed to git or put in client code)
//   · Also stored in admin-dashboard.html's JS as REVIEWS_ADMIN_API_KEY
//     (this is acceptable — the key has zero Supabase permissions; it only
//     gates this one Edge Function, which you can revoke/rotate instantly
//     without touching the database)
//
// DEPLOY
// ──────
//   1. supabase functions deploy admin-reviews --project-ref ruiqfkzuqxxbyvycvsfo
//   2. supabase secrets set ADMIN_API_KEY=<your-generated-key> \
//        --project-ref ruiqfkzuqxxbyvycvsfo
//   3. The function URL will be:
//      https://ruiqfkzuqxxbyvycvsfo.supabase.co/functions/v1/admin-reviews
// ============================================================

import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const SUPABASE_URL          = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_SERVICE_KEY  = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const ADMIN_API_KEY         = Deno.env.get('ADMIN_API_KEY')!;

// Allowed origins — add your domain here
const ALLOWED_ORIGINS = [
  'https://sajidmk.com',
  'https://www.sajidmk.com',
];

function corsHeaders(origin: string | null): Record<string, string> {
  const allowed = origin && ALLOWED_ORIGINS.includes(origin)
    ? origin
    : ALLOWED_ORIGINS[0];
  return {
    'Access-Control-Allow-Origin':  allowed,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

Deno.serve(async (req: Request) => {
  const origin = req.headers.get('origin');

  // ── CORS preflight ────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders(origin) });
  }

  if (req.method !== 'POST') {
    return new Response('Method not allowed', {
      status: 405,
      headers: corsHeaders(origin),
    });
  }

  // ── Auth check ────────────────────────────────────────────
  const authHeader = req.headers.get('Authorization') || '';
  const token      = authHeader.replace(/^Bearer\s+/i, '');

  if (!token || token !== ADMIN_API_KEY) {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }

  // ── Parse body ────────────────────────────────────────────
  let body: { action?: string; id?: string; filter?: string };
  try {
    body = await req.json();
  } catch {
    return new Response(JSON.stringify({ error: 'Invalid JSON' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }

  const { action, id, filter } = body;

  // ── Service-role client (server-side only) ─────────────────
  const db = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { persistSession: false, autoRefreshToken: false },
  });

  try {
    // ── ACTIONS ───────────────────────────────────────────────

    if (action === 'list') {
      // Returns all reviews (or filtered by status)
      let query = db
        .from('reviews')
        .select('id, name, review, rating, status, created_at')
        .order('created_at', { ascending: false });

      if (filter && filter !== 'all') {
        query = query.eq('status', filter);
      }

      const { data, error } = await query;
      if (error) throw error;
      return jsonResponse({ data }, origin);
    }

    if (action === 'stats') {
      // Returns status counts for all reviews
      const { data, error } = await db
        .from('reviews')
        .select('status');
      if (error) throw error;
      return jsonResponse({ data }, origin);
    }

    if (action === 'approve') {
      if (!id) return badRequest('Missing id', origin);
      const { error } = await db
        .from('reviews')
        .update({ status: 'approved' })
        .eq('id', id);
      if (error) throw error;
      return jsonResponse({ ok: true }, origin);
    }

    if (action === 'reject') {
      if (!id) return badRequest('Missing id', origin);
      const { error } = await db
        .from('reviews')
        .update({ status: 'rejected' })
        .eq('id', id);
      if (error) throw error;
      return jsonResponse({ ok: true }, origin);
    }

    if (action === 'delete') {
      if (!id) return badRequest('Missing id', origin);
      const { error } = await db
        .from('reviews')
        .delete()
        .eq('id', id);
      if (error) throw error;
      return jsonResponse({ ok: true }, origin);
    }

    return badRequest('Unknown action', origin);

  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error('[admin-reviews]', msg);
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
    });
  }
});

function jsonResponse(body: unknown, origin: string | null): Response {
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}

function badRequest(msg: string, origin: string | null): Response {
  return new Response(JSON.stringify({ error: msg }), {
    status: 400,
    headers: { 'Content-Type': 'application/json', ...corsHeaders(origin) },
  });
}
