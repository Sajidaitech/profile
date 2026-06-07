// ============================================================
// CONFIG
// ============================================================
const SUPABASE_URL      = 'https://tbdgrhekycgfdeatxjnq.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRiZGdyaGVreWNnZmRlYXR4am5xIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzkzOTE5MzEsImV4cCI6MjA5NDk2NzkzMX0.HP48nehewf5HajLukSkLdJwuqiUTmbnfdcAk6x8_UEU';
// ADMIN_PASSWORD removed — authentication is now handled by Supabase Auth
// (email + password login). The admin user must be created in:
//   Supabase Dashboard → Authentication → Users → Add user
// Use your own email and a strong password. The anon key is safe here;
// the authenticated JWT that Supabase issues after login is what grants
// the dashboard access to admin-only RLS policies.
const GCC_COUNTRIES     = ['Qatar','UAE','Saudi Arabia','Kuwait','Bahrain','Oman'];

// ============================================================
// THEME
// ============================================================
(function() {
  const saved = localStorage.getItem('dash-theme') || 'dark';
  applyTheme(saved);
})();

function applyTheme(mode) {
  document.documentElement.setAttribute('data-theme', mode);
  localStorage.setItem('dash-theme', mode);
  const icon  = document.getElementById('theme-icon');
  const label = document.getElementById('theme-label');
  if (icon && label) {
    icon.textContent  = mode === 'light' ? '🌙' : '☀️';
    label.textContent = mode === 'light' ? 'Dark' : 'Light';
  }
}

document.getElementById('theme-btn').addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme') || 'dark';
  applyTheme(current === 'dark' ? 'light' : 'dark');
});


// ============================================================


// ============================================================
// DASHBOARD
// ============================================================
// ── SQL schema is in the QR SESSION MANAGEMENT block above ──

let db;
let _dashboardInitialized = false;

function initDashboard() {
  if (_dashboardInitialized) return;
  _dashboardInitialized = true;

  db = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false }
  });

  loadAll();

  // ── Refresh button with spinner feedback ──────────────────
  const refreshBtn = document.getElementById('refresh-btn');
  refreshBtn.addEventListener('click', async () => {
    // Prevent double-clicks
    if (refreshBtn.classList.contains('spinning')) return;
    refreshBtn.classList.add('spinning');
    refreshBtn.querySelector('.btn-icon').textContent = '↻';
    try {
      await loadAll();
    } finally {
      refreshBtn.classList.remove('spinning');
    }
  });

  // ── Select All button ─────────────────────────────────────
  document.getElementById('select-all-btn').addEventListener('click', () => {
    const masterCb = document.getElementById('master-cb');
    const allChecked = allRowCheckboxes().every(cb => cb.checked);
    allRowCheckboxes().forEach(cb => {
      cb.checked = !allChecked;
      cb.closest('tr').classList.toggle('selected', !allChecked);
    });
    masterCb.checked = !allChecked;
    masterCb.indeterminate = false;
    updateSelectionUI();
  });

  // ── Master checkbox (thead) ───────────────────────────────
  document.getElementById('master-cb').addEventListener('change', (e) => {
    allRowCheckboxes().forEach(cb => {
      cb.checked = e.target.checked;
      cb.closest('tr').classList.toggle('selected', e.target.checked);
    });
    updateSelectionUI();
  });

  // ── Delete Selected ───────────────────────────────────────
  document.getElementById('delete-sel-btn').addEventListener('click', () => {
    const ids = selectedIds();
    if (!ids.length) return;
    openModal(
      `Delete ${ids.length} visitor${ids.length > 1 ? 's' : ''}?`,
      `You are about to permanently delete <strong style="color:var(--ink)">${ids.length} row${ids.length > 1 ? 's' : ''}</strong> from the visitors table. This cannot be undone.`,
      async () => { await deleteRows(ids); }
    );
  });

  // ── Modal cancel ──────────────────────────────────────────
  document.getElementById('modal-cancel-btn').addEventListener('click', closeModal);
  document.getElementById('delete-modal').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });

  // ── Realtime subscription ─────────────────────────────────
  db.channel('dash-live')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'visitors' }, loadAll)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'online_visitors' }, updateOnlineBadge)
    .subscribe();

  // ── Review Moderation ─────────────────────────────────────
  initReviews();

  // ── Login Audit Log ───────────────────────────────────────
  initAuditLog();
}

async function loadAll() {
  await Promise.all([loadSummary(), loadRecentVisitors(), updateOnlineBadge()]);
}

// ── Summary via RPC ─────────────────────────────────────────
async function loadSummary() {
  const { data, error } = await db.rpc('get_analytics_summary');
  if (error) { console.error('get_analytics_summary error:', error.message); return; }

  setText('kpi-total',     fmt(data.total));
  setText('kpi-today',     fmt(data.today));
  setText('kpi-week',      fmt(data.this_week));
  setText('kpi-month',     fmt(data.this_month));
  setText('kpi-returning', fmt(data.returning));
  setText('kpi-duration',  data.avg_duration ? fmtDur(data.avg_duration) : '—');

  renderBarChart('chart-country', data.by_country,  '#0066FF');
  renderBarChart('chart-source',  data.by_source,   '#8B5CF6');
  renderBarChart('chart-device',  data.by_device,   '#10B981');
  renderBarChart('chart-browser', data.by_browser,  '#F59E0B');
}

// ── Online badge ─────────────────────────────────────────────
async function updateOnlineBadge() {
  const { data } = await db.rpc('get_online_count');
  document.getElementById('online-badge').textContent =
    `${data || 0} online now`;
}

// ── Recent visitors table ────────────────────────────────────
// FIX: LEFT JOIN visitor_profiles to get name + location as fallback
// when the visitors row was inserted before the gate was submitted.
async function loadRecentVisitors() {
  // Query visitors table; also pull from visitor_profiles via fingerprint
  // so that even rows inserted before name entry show the correct name.
  const { data, error } = await db
    .from('visitors')
    .select(`
      id,
      session_id,
      visitor_name,
      country,
      city,
      source,
      device,
      device_model,
      browser,
      os,
      duration,
      is_returning,
      visit_count,
      fingerprint,
      created_at
    `)
    .order('created_at', { ascending: false })
    .limit(100);

  if (error) {
    console.error('loadRecentVisitors error:', error.message);
    return;
  }

  // FIX: For any row missing visitor_name or country, fetch from visitor_profiles
  // by fingerprint so the dashboard always shows the best available data.
  const missingFps = [...new Set(
    data
      .filter(v => (!v.visitor_name || !v.country || v.country === 'Unknown') && v.fingerprint)
      .map(v => v.fingerprint)
  )];

  let profileMap = {};
  if (missingFps.length) {
    const { data: profiles } = await db
      .from('visitor_profiles')
      .select('fingerprint,visitor_name,country,city')
      .in('fingerprint', missingFps);
    if (profiles) {
      profiles.forEach(p => { profileMap[p.fingerprint] = p; });
    }
  }

  const tbody = document.getElementById('visitors-tbody');
  if (!data.length) {
    tbody.innerHTML = '<tr><td colspan="11" style="text-align:center;padding:32px;color:var(--ink-3);">No visitors yet</td></tr>';
    return;
  }

  // Merge profile data into visitor rows where needed
  const rows = data.map(v => {
    const p = profileMap[v.fingerprint] || {};
    return {
      ...v,
      visitor_name: v.visitor_name || p.visitor_name || null,
      country:      (v.country && v.country !== 'Unknown') ? v.country : (p.country || v.country),
      city:         (v.city    && v.city    !== 'Unknown') ? v.city    : (p.city    || v.city),
    };
  });

  tbody.innerHTML = rows.map(v => {
    const isGCC  = GCC_COUNTRIES.includes(v.country);
    const loc    = [v.city, v.country].filter(x => x && x !== 'Unknown').join(', ') || '—';
    const when   = timeAgo(new Date(v.created_at));
    const dur    = v.duration > 0 ? fmtDur(v.duration) : '—';
    const source = v.source || 'Direct';
    const vc     = v.visit_count || 1;
    const visitsCell = vc > 1
      ? `<span style="font-weight:600;color:var(--green);">${vc}</span> <span class="tag tag-gcc" style="font-size:10px;">returning</span>`
      : `<span style="color:var(--ink-3);">1</span>`;

    const nameCell = v.visitor_name
      ? `<td style="font-weight:600;color:var(--ink);">${esc(v.visitor_name)}</td>`
      : `<td style="color:var(--ink-3);">—</td>`;

    return `<tr data-id="${esc(v.id)}">
      <td class="cb-col"><input type="checkbox" class="row-cb" data-id="${esc(v.id)}"></td>
      ${nameCell}
      <td class="td-country">${esc(loc)}${isGCC ? ' 🇶🇦' : ''}</td>
      <td><span class="tag tag-source">${esc(source)}</span>${isGCC ? ' <span class="tag tag-gcc">GCC</span>' : ''}</td>
      <td><span class="tag">${esc(v.device || '—')}</span><br><span style="font-size:11px;color:var(--ink-3);">${esc(v.device_model || '')}</span></td>
      <td>${esc(v.browser || '—')}</td>
      <td>${esc(v.os || '—')}</td>
      <td style="font-family:var(--ff-mono);font-size:12px;">${dur}</td>
      <td style="font-size:12px;">${visitsCell}</td>
      <td style="color:var(--ink-3);font-size:12px;">${when}</td>
      <td>
        <button class="btn btn-danger"
                style="padding:4px 10px;font-size:11px;"
                onclick="confirmDeleteOne('${esc(v.id)}', ${JSON.stringify(esc(v.visitor_name || 'this visitor'))})">
          🗑
        </button>
      </td>
    </tr>`;
  }).join('');

  // Re-attach per-row checkbox listeners after re-render
  document.querySelectorAll('.row-cb[data-id]').forEach(cb => {
    cb.addEventListener('change', () => {
      cb.closest('tr').classList.toggle('selected', cb.checked);
      updateSelectionUI();
    });
  });

  // Reset master checkbox and selection state
  document.getElementById('master-cb').checked = false;
  document.getElementById('master-cb').indeterminate = false;
  updateSelectionUI();
}


// ============================================================
// SELECTION HELPERS
// ============================================================

function allRowCheckboxes() {
  return [...document.querySelectorAll('.row-cb[data-id]')];
}

function selectedIds() {
  return allRowCheckboxes()
    .filter(cb => cb.checked)
    .map(cb => cb.dataset.id);
}

function updateSelectionUI() {
  const all      = allRowCheckboxes();
  const checked  = all.filter(cb => cb.checked);
  const n        = checked.length;
  const masterCb = document.getElementById('master-cb');
  const badge    = document.getElementById('sel-count-badge');
  const delBtn   = document.getElementById('delete-sel-btn');
  const selAllBtn = document.getElementById('select-all-btn');

  // Master checkbox state
  if (n === 0) {
    masterCb.checked = false;
    masterCb.indeterminate = false;
  } else if (n === all.length) {
    masterCb.checked = true;
    masterCb.indeterminate = false;
  } else {
    masterCb.checked = false;
    masterCb.indeterminate = true;
  }

  // Badge
  if (n > 0) {
    badge.style.display = 'inline-block';
    badge.textContent   = `${n} selected`;
  } else {
    badge.style.display = 'none';
  }

  // Delete button
  delBtn.disabled = n === 0;

  // Select All button label
  const allChecked = all.length > 0 && all.every(cb => cb.checked);
  selAllBtn.innerHTML = allChecked ? '☐ Deselect All' : '☑ Select All';
}


// ============================================================
// DELETE LOGIC
// ============================================================

function confirmDeleteOne(id, nameLabel) {
  openModal(
    `Delete visitor?`,
    `Remove <strong style="color:var(--ink)">${nameLabel}</strong> from the visitors table? This cannot be undone.`,
    async () => { await deleteRows([id]); }
  );
}

window.confirmDeleteOne = confirmDeleteOne; // expose for inline onclick

async function deleteRows(ids) {
  if (!ids.length) return;

  // ── Why RPC instead of .delete()? ────────────────────────────────────────
  // The visitors table has RLS enabled. The anon key has no DELETE policy,
  // so a direct .delete() call silently deletes 0 rows (Supabase returns no
  // error but also deletes nothing when RLS blocks the operation).
  //
  // Solution: call a SECURITY DEFINER Postgres function that runs as the
  // table owner and therefore bypasses RLS entirely. You MUST run the SQL
  // below once in your Supabase SQL Editor before delete will work:
  //
  //   CREATE OR REPLACE FUNCTION delete_visitors(p_ids uuid[])
  //   RETURNS integer
  //   LANGUAGE plpgsql
  //   SECURITY DEFINER
  //   AS $$
  //   DECLARE
  //     deleted_count integer;
  //   BEGIN
  //     DELETE FROM visitors WHERE id = ANY(p_ids);
  //     GET DIAGNOSTICS deleted_count = ROW_COUNT;
  //     RETURN deleted_count;
  //   END;
  //   $$;
  //
  //   -- Allow anon to call this function:
  //   GRANT EXECUTE ON FUNCTION delete_visitors(uuid[]) TO anon;
  // ─────────────────────────────────────────────────────────────────────────

  const { data, error } = await db.rpc('delete_visitors', { p_ids: ids });

  if (error) {
    console.error('Delete error:', error.message);

    // Friendly hint if the RPC simply doesn't exist yet
    if (error.message.includes('Could not find') || error.message.includes('function') || error.code === 'PGRST202') {
      showToast('⚠️ Run the delete_visitors SQL in Supabase first — see comments in code', 'err');
    } else {
      showToast(`❌ Delete failed: ${error.message}`, 'err');
    }
    return;
  }

  const n = typeof data === 'number' ? data : ids.length;
  showToast(`✓ Deleted ${n} row${n !== 1 ? 's' : ''}`, 'ok');
  await loadAll();
}


// ============================================================
// MODAL
// ============================================================
let _modalCallback = null;

function openModal(title, body, onConfirm) {
  document.getElementById('modal-title').innerHTML = title;
  document.getElementById('modal-body').innerHTML  = body;
  _modalCallback = onConfirm;
  document.getElementById('delete-modal').classList.add('open');

  // Wire confirm once
  const confirmBtn = document.getElementById('modal-confirm-btn');
  confirmBtn.onclick = async () => {
    confirmBtn.disabled = true;
    confirmBtn.textContent = 'Deleting…';
    closeModal();
    if (_modalCallback) await _modalCallback();
    confirmBtn.disabled = false;
    confirmBtn.textContent = 'Yes, Delete';
    _modalCallback = null;
  };
}

function closeModal() {
  document.getElementById('delete-modal').classList.remove('open');
}


// ============================================================
// TOAST
// ============================================================
let _toastTimer;

function showToast(msg, type = '') {
  const el = document.getElementById('toast');
  el.textContent = msg;
  el.className   = 'show' + (type ? ' toast-' + type : '');
  clearTimeout(_toastTimer);
  _toastTimer = setTimeout(() => { el.className = ''; }, 3000);
}


// ============================================================
// BAR CHART RENDERER
// ============================================================
function renderBarChart(containerId, items, color) {
  const el = document.getElementById(containerId);
  if (!el || !items) return;

  const max = Math.max(...items.map(i => i.cnt), 1);
  el.innerHTML = items.map(item => `
    <div class="bar-row">
      <span class="bar-label" title="${esc(item.country || item.source || item.device || item.browser || item.os || '?')}">
        ${esc(item.country || item.source || item.device || item.browser || item.os || '?')}
      </span>
      <div class="bar-track">
        <div class="bar-fill" style="width:${(item.cnt / max * 100).toFixed(1)}%;background:${color};"></div>
      </div>
      <span class="bar-count">${item.cnt}</span>
    </div>
  `).join('');
}


// ============================================================
// REVIEW MODERATION
// Reads from / writes to the `reviews` table.
// Uses the same `db` Supabase client initialised in initDashboard().
// ============================================================

// ── Config ──────────────────────────────────────────────────
// Reviews project — uses the PUBLIC ANON key (not service_role).
// Admin actions (UPDATE status, DELETE) are authorised by RLS policies
// "admin_can_update_reviews" and "admin_can_delete_reviews" which check
// auth.role() = 'authenticated'.  The admin logs in via Supabase Auth
// (email+password) in initDashboard(), so those policies allow all writes.
// Service-role key is NOT used anywhere in this file.
const REVIEWS_URL      = 'https://ruiqfkzuqxxbyvycvsfo.supabase.co';
const REVIEWS_ANON_KEY = 'sb_publishable_B2lglqFpDltoMmz-RYQ_oA_UIDiWHNI';
// ↑ Supabase → Project Settings → API → anon (public)  — safe to expose.

let revDb = null;

function getRevDb() {
  if (revDb) return revDb;
  // Reuse the authenticated session established in initDashboard() login.
  // If the admin is signed in, Supabase automatically attaches the JWT to
  // every request, satisfying the RLS "authenticated" role check.
  revDb = window.supabase.createClient(REVIEWS_URL, REVIEWS_ANON_KEY, {
    auth: {
      persistSession:    true,   // keep session across page reloads
      autoRefreshToken:  true,   // refresh JWT before it expires
      storageKey:        'reviews-admin-session'
    }
  });
  return revDb;
}

// ── State ────────────────────────────────────────────────────
let _revFilter = 'pending'; // current tab

// ── Init: wire filter tabs + refresh button ──────────────────
function initReviews() {
  // Tab clicks
  document.querySelectorAll('.rev-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      _revFilter = tab.dataset.filter;
      document.querySelectorAll('.rev-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadReviews();
    });
  });

  // Refresh button
  document.getElementById('rev-refresh-btn').addEventListener('click', async () => {
    const btn = document.getElementById('rev-refresh-btn');
    btn.classList.add('spinning');
    await loadReviews();
    btn.classList.remove('spinning');
  });

  // Sync the reviews client's auth session from the analytics auth client
  // so RLS "authenticated" policies are satisfied for UPDATE / DELETE.
  _authClient.auth.getSession().then(({ data }) => {
    if (data && data.session) {
      getRevDb().auth.setSession({
        access_token:  data.session.access_token,
        refresh_token: data.session.refresh_token
      });
    }
  });

  // Initial load
  loadReviews();
  loadReviewStats();

  // ── Realtime: auto-refresh grid + stats when any review changes ──
  getRevDb()
    .channel('admin-reviews-live')
    .on('postgres_changes', {
      event: '*',
      schema: 'public',
      table: 'reviews'
    }, () => {
      loadReviews();
      loadReviewStats();
    })
    .subscribe();
}

// ── Load reviews based on current filter ─────────────────────
async function loadReviews() {
  const grid = document.getElementById('rev-grid');

  // Show skeletons
  grid.innerHTML = [1,2,3].map(() => `
    <div class="rev-skeleton-card">
      <div style="display:flex;justify-content:space-between;">
        <div class="rev-skeleton" style="width:38%;height:14px;"></div>
        <div class="rev-skeleton" style="width:20%;height:14px;"></div>
      </div>
      <div class="rev-skeleton" style="width:55%;height:12px;margin-top:4px;"></div>
      <div class="rev-skeleton" style="width:100%;height:56px;margin-top:4px;"></div>
      <div style="display:flex;gap:8px;margin-top:8px;">
        <div class="rev-skeleton" style="flex:1;height:30px;border-radius:9px;"></div>
        <div class="rev-skeleton" style="flex:1;height:30px;border-radius:9px;"></div>
        <div class="rev-skeleton" style="width:38px;height:30px;border-radius:9px;"></div>
      </div>
    </div>`).join('');

  const rdb = getRevDb();
  let query = rdb.from('reviews').select('id, name, review, rating, status, created_at');

  if (_revFilter !== 'all') {
    query = query.eq('status', _revFilter);
  }
  query = query.order('created_at', { ascending: false });

  const { data, error } = await query;

  if (error) {
    grid.innerHTML = `<div class="rev-empty"><span style="font-size:28px;">⚠️</span><p>Error: ${esc(error.message)}</p></div>`;
    return;
  }

  if (!data || !data.length) {
    grid.innerHTML = `<div class="rev-empty"><span style="font-size:32px;">📭</span><p>No ${_revFilter === 'all' ? '' : _revFilter + ' '}reviews yet.</p></div>`;
    return;
  }

  grid.innerHTML = data.map(r => renderRevCard(r)).join('');

  // Wire button listeners
  grid.querySelectorAll('[data-rev-id]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id     = btn.dataset.revId;
      const action = btn.dataset.revAction;
      handleRevAction(id, action);
    });
  });

  // Refresh stats after loading
  loadReviewStats();
}

// ── Render a single review card ───────────────────────────────
function renderRevCard(r) {
  const n          = Math.max(1, Math.min(5, r.rating || 5));
  const starsHTML  = `<span class="rev-stars-filled">${'★'.repeat(n)}</span>`
                   + `<span class="rev-stars-empty">${'★'.repeat(5 - n)}</span>`;
  const dateStr    = new Date(r.created_at).toLocaleDateString('en-GB', {
    year: 'numeric', month: 'short', day: 'numeric'
  });
  const timeStr    = new Date(r.created_at).toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit'
  });
  const status     = r.status || 'pending';
  const safeId     = esc(r.id);

  // Contextual buttons based on current status
  let actionBtns = '';
  if (status !== 'approved') {
    actionBtns += `<button class="rev-btn rev-btn-approve" data-rev-id="${safeId}" data-rev-action="approve" title="Approve this review — it will appear on the portfolio">✅ Approve</button>`;
  }
  if (status !== 'rejected') {
    actionBtns += `<button class="rev-btn rev-btn-reject" data-rev-id="${safeId}" data-rev-action="reject" title="Reject — hidden from portfolio">❌ Reject</button>`;
  }
  actionBtns += `<button class="rev-btn rev-btn-delete" data-rev-id="${safeId}" data-rev-action="delete" title="Permanently delete this review">🗑</button>`;

  return `
    <div class="rev-card" data-status="${esc(status)}" id="rev-card-${safeId}">
      <div class="rev-card-header">
        <div class="rev-card-meta">
          <span class="rev-card-name">${esc(r.name || 'Anonymous')}</span>
          <span class="rev-card-date">${dateStr} · ${timeStr}</span>
        </div>
        <span class="rev-status-badge ${esc(status)}">${esc(status)}</span>
      </div>
      <div class="rev-card-stars" aria-label="${n} out of 5 stars">${starsHTML}</div>
      <p class="rev-card-text">"${esc(r.review || '')}"</p>
      <div class="rev-card-actions">${actionBtns}</div>
    </div>`;
}

// ── Handle approve / reject / delete ─────────────────────────
async function handleRevAction(id, action) {
  const card = document.getElementById(`rev-card-${id}`);
  const btns = card ? card.querySelectorAll('.rev-btn') : [];
  btns.forEach(b => b.disabled = true);

  // ── FACE ID GATE — required for approve action ───────────
  if (action === 'approve') {
    const faceOk = await faceIDGate('approve this review');
    if (!faceOk) {
      showToast('❌ Face ID authentication failed — approval denied.', 'err');
      btns.forEach(b => b.disabled = false);
      return;
    }
  }
  // ─────────────────────────────────────────────────────────

  const rdb = getRevDb();

  if (action === 'approve') {
    const { error } = await rdb
      .from('reviews')
      .update({ status: 'approved' })
      .eq('id', id);

    if (error) { showToast(`❌ Approve failed: ${error.message}`, 'err'); btns.forEach(b => b.disabled = false); return; }
    showToast('✅ Review approved — now visible on portfolio', 'ok');
    // Animate card out then reload
    if (card) { card.style.opacity = '0'; card.style.transform = 'scale(.95)'; card.style.transition = 'all .25s ease'; }
    setTimeout(() => loadReviews(), 300);

  } else if (action === 'reject') {
    const { error } = await rdb
      .from('reviews')
      .update({ status: 'rejected' })
      .eq('id', id);

    if (error) { showToast(`❌ Reject failed: ${error.message}`, 'err'); btns.forEach(b => b.disabled = false); return; }
    showToast('❌ Review rejected — hidden from portfolio', 'ok');
    if (card) { card.style.opacity = '0'; card.style.transform = 'scale(.95)'; card.style.transition = 'all .25s ease'; }
    setTimeout(() => loadReviews(), 300);

  } else if (action === 'delete') {
    openModal(
      'Delete review?',
      `Permanently remove this review by <strong style="color:var(--ink)">${esc(card?.querySelector('.rev-card-name')?.textContent || 'this visitor')}</strong>? This cannot be undone.`,
      async () => {
        const { error } = await rdb
          .from('reviews')
          .delete()
          .eq('id', id);

        if (error) { showToast(`❌ Delete failed: ${error.message}`, 'err'); btns.forEach(b => b.disabled = false); return; }
        showToast('🗑 Review permanently deleted', 'ok');
        if (card) { card.style.opacity = '0'; card.style.transform = 'scale(.95)'; card.style.transition = 'all .25s ease'; }
        setTimeout(() => loadReviews(), 300);
      }
    );
    btns.forEach(b => b.disabled = false);
  }
}

// ── Load stats for the stats pills ───────────────────────────
async function loadReviewStats() {
  const rdb = getRevDb();
  const { data } = await rdb.from('reviews').select('status');
  if (!data) return;

  const pending  = data.filter(r => r.status === 'pending').length;
  const approved = data.filter(r => r.status === 'approved').length;
  const rejected = data.filter(r => r.status === 'rejected').length;

  const ep = document.getElementById('rs-pending');
  const ea = document.getElementById('rs-approved');
  const er = document.getElementById('rs-rejected');
  if (ep) ep.textContent  = `⏳ ${pending} Pending`;
  if (ea) ea.textContent  = `✅ ${approved} Approved`;
  if (er) er.textContent  = `❌ ${rejected} Rejected`;
}

// ── initReviews() is called at the end of showDashboard() via initDashboard ─
// initDashboard already calls initReviews() — no patch needed here.
// (initReviews is wired at the bottom of initDashboard body above)


// ============================================================
// AUDIT LOG DASHBOARD — Read + Render
// ─────────────────────────────────────────────────────────────
// Reads from login_audit_log and renders in the dashboard table.
// Uses the authenticated `db` client (dashboard-only access).
// Realtime subscription keeps the table live without refresh.
// ============================================================

let _auditFilter = 'all';

function initAuditLog() {
  // Wire filter tabs
  document.querySelectorAll('[data-audit-filter]').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('[data-audit-filter]').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      _auditFilter = btn.dataset.auditFilter;
      loadAuditLog();
    });
  });

  // Wire refresh button
  const refreshBtn = document.getElementById('audit-refresh-btn');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', async () => {
      if (refreshBtn.classList.contains('spinning')) return;
      refreshBtn.classList.add('spinning');
      refreshBtn.querySelector('.btn-icon').textContent = '↻';
      try { await Promise.all([loadAuditLog(), loadAuditStats()]); }
      finally { refreshBtn.classList.remove('spinning'); }
    });
  }

  // Initial load
  loadAuditLog();
  loadAuditStats();

  // ── Realtime: live-update the table on new entries ────────
  db.channel('audit-log-live')
    .on('postgres_changes', {
      event:  'INSERT',
      schema: 'public',
      table:  AUDIT_LOG_TABLE,
    }, () => {
      loadAuditLog();
      loadAuditStats();
    })
    .subscribe();
}

// ── Load and render audit entries ────────────────────────────
async function loadAuditLog() {
  const tbody = document.getElementById('audit-tbody');
  if (!tbody) return;

  // Skeleton rows
  tbody.innerHTML = [1,2,3].map(() => `
    <tr>
      ${Array(9).fill('<td><div class="rev-skeleton" style="height:13px;width:85%;border-radius:4px;"></div></td>').join('')}
    </tr>
  `).join('');

  let query = db
    .from(AUDIT_LOG_TABLE)
    .select('id,timestamp,session_id,browser,device,platform,country,ip,result,login_method')
    .order('timestamp', { ascending: false })
    .limit(200);

  if (_auditFilter !== 'all') {
    query = query.eq('result', _auditFilter);
  }

  const { data, error } = await query;

  if (error) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--red,#ff6b6b);">⚠️ ${esc(error.message)}</td></tr>`;
    return;
  }

  if (!data || !data.length) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align:center;padding:32px;color:var(--ink-3);">No ${_auditFilter === 'all' ? '' : _auditFilter + ' '}login attempts yet.</td></tr>`;
    return;
  }

  tbody.innerHTML = data.map(r => renderAuditRow(r)).join('');
}

// ── Render a single audit table row ──────────────────────────
function renderAuditRow(r) {
  // Timestamp — two-line: date + time
  const ts   = new Date(r.timestamp);
  const date = ts.toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' });
  const time = ts.toLocaleTimeString('en-GB', { hour:'2-digit', minute:'2-digit', second:'2-digit' });

  // Result badge
  const resultCfg = {
    approved: { bg: 'rgba(52,199,89,.12)',  border: 'rgba(52,199,89,.28)',  color: 'rgba(52,199,89,.95)',  icon: '✅' },
    rejected: { bg: 'rgba(255,69,58,.12)',  border: 'rgba(255,69,58,.28)',  color: 'rgba(255,100,90,.95)', icon: '❌' },
    expired:  { bg: 'rgba(255,170,0,.10)',  border: 'rgba(255,170,0,.25)',  color: 'rgba(255,185,50,.90)', icon: '⏱' },
  };
  const rc = resultCfg[r.result] || resultCfg.rejected;
  const resultBadge = `<span style="
    display:inline-flex;align-items:center;gap:4px;
    padding:3px 9px;border-radius:20px;font-size:11px;font-weight:600;letter-spacing:.02em;
    background:${rc.bg};border:1px solid ${rc.border};color:${rc.color};
  ">${rc.icon} ${esc(r.result)}</span>`;

  // Method badge
  const methodCfg = {
    qr:             { bg: 'rgba(90,130,255,.12)', border: 'rgba(90,130,255,.28)', color: 'rgba(120,160,255,.90)', label: '📱 QR' },
    password:       { bg: 'rgba(160,90,255,.12)', border: 'rgba(160,90,255,.28)', color: 'rgba(180,120,255,.90)', label: '🔑 Password' },
    session_resume: { bg: 'rgba(255,255,255,.07)', border: 'rgba(255,255,255,.14)', color: 'var(--ink-3)',         label: '↩ Resume' },
  };
  const mc = methodCfg[r.login_method] || methodCfg.password;
  const methodBadge = `<span style="
    display:inline-flex;align-items:center;gap:3px;
    padding:3px 8px;border-radius:20px;font-size:11px;font-weight:500;
    background:${mc.bg};border:1px solid ${mc.border};color:${mc.color};
  ">${mc.label}</span>`;

  // Session ID — truncated with tooltip
  const sidShort = r.session_id
    ? `<span title="${esc(r.session_id)}" style="font-family:'DM Mono',monospace;font-size:11px;color:var(--ink-3);cursor:default;">${esc(r.session_id.slice(0,8))}…</span>`
    : `<span style="color:var(--ink-4);">—</span>`;

  // IP — monospace
  const ipCell = r.ip
    ? `<span style="font-family:'DM Mono',monospace;font-size:11px;">${esc(r.ip)}</span>`
    : `<span style="color:var(--ink-4);">—</span>`;

  // Row colour hint by result
  const rowStyle = r.result === 'approved'
    ? 'background:rgba(52,199,89,.03);'
    : r.result === 'rejected'
    ? 'background:rgba(255,69,58,.03);'
    : '';

  return `<tr style="${rowStyle}">
    <td style="white-space:nowrap;">
      <div style="font-size:12px;color:var(--ink-2);">${esc(date)}</div>
      <div style="font-size:11px;color:var(--ink-4);font-family:'DM Mono',monospace;">${esc(time)}</div>
    </td>
    <td>${sidShort}</td>
    <td>${methodBadge}</td>
    <td>${resultBadge}</td>
    <td style="font-size:12px;">${esc(r.browser || '—')}</td>
    <td style="font-size:12px;">${esc(r.device  || '—')}</td>
    <td style="font-size:12px;">${esc(r.platform|| '—')}</td>
    <td style="font-size:12px;">${esc(r.country || '—')}</td>
    <td>${ipCell}</td>
  </tr>`;
}

// ── Load stats pills ──────────────────────────────────────────
async function loadAuditStats() {
  const { data } = await db
    .from(AUDIT_LOG_TABLE)
    .select('result');
  if (!data) return;

  const total    = data.length;
  const approved = data.filter(r => r.result === 'approved').length;
  const rejected = data.filter(r => r.result === 'rejected').length;
  const expired  = data.filter(r => r.result === 'expired').length;

  const et = document.getElementById('as-total');
  const ea = document.getElementById('as-approved');
  const er = document.getElementById('as-rejected');
  const ex = document.getElementById('as-expired');
  if (et) et.textContent = `🛡 ${total} Total`;
  if (ea) ea.textContent = `✅ ${approved} Approved`;
  if (er) er.textContent = `❌ ${rejected} Rejected`;
  if (ex) ex.textContent = `⏱ ${expired} Expired`;
}

// ─── END AUDIT LOG DASHBOARD ──────────────────────────────────


// ============================================================
// HELPERS
// ============================================================







function setText(id, val) {
  const el = document.getElementById(id);
  if (el) el.textContent = val;
}

function fmt(n) { return (n || 0).toLocaleString(); }

// Format seconds → "45s", "2m 13s", "1h 4m"
function fmtDur(s) {
  if (!s || s <= 0) return '—';
  s = Math.round(s);
  if (s < 60)   return s + 's';
  if (s < 3600) return Math.floor(s / 60) + 'm ' + (s % 60) + 's';
  return Math.floor(s / 3600) + 'h ' + Math.floor((s % 3600) / 60) + 'm';
}

function esc(str) {
  return String(str || '')
    .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;');
}

function timeAgo(date) {
  const diff = Math.floor((Date.now() - date) / 1000);
  if (diff < 60)     return diff + 's ago';
  if (diff < 3600)   return Math.floor(diff / 60) + 'm ago';
  if (diff < 86400)  return Math.floor(diff / 3600) + 'h ago';
  return Math.floor(diff / 86400) + 'd ago';
}
