// ============================================================
// SAJID MEHMOOD PORTFOLIO — SUPABASE CLIENT LAYER
// supabase-client.js  v1.0  |  June 2026
//
// PURPOSE:
//   Replaces all hardcoded data arrays in script.js with
//   live Supabase queries. Exposes a global `PortfolioData`
//   API consumed by the existing render functions.
//
// SECURITY:
//   - Only the anon (public) key is used here — safe to ship
//   - Service-role key NEVER lives in frontend code
//   - RLS policies on the DB enforce read-only anon access
//   - Admin writes go through admin-dashboard.html (auth'd user)
//
// HOW TO USE:
//   1. Replace YOUR_ANON_KEY below with your Supabase anon key
//      (found in Project Settings → API → anon public)
//   2. Add this script AFTER the Supabase CDN script in index.html:
//      <script src="supabase-client.js" defer></script>
//   3. This file must load BEFORE script.js
//      So order in <head> should be:
//        <script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/..." defer></script>
//        <script src="supabase-client.js" defer></script>
//        <script src="script.js" defer></script>
// ============================================================

(function () {
  'use strict';

  // ── CONFIG ──────────────────────────────────────────────────
  // The anon key is read from localStorage (set via the admin dashboard setup screen).
  // Fallback: paste your eyJhbGci… anon key directly below if you prefer.
  var SUPABASE_URL      = 'https://ruiqfkzuqxxbyvycvsfo.supabase.co';
  // ↓ OPTIONAL direct fallback — paste your eyJhbGci… key here (leave blank to use localStorage)
  var SUPABASE_ANON_KEY_FALLBACK = '';

  function _resolveAnonKey() {
    var stored = (typeof localStorage !== 'undefined') ? localStorage.getItem('sm_admin_anon_key') : '';
    var key = stored || SUPABASE_ANON_KEY_FALLBACK;
    if (!key || !key.startsWith('eyJ')) {
      console.warn('[PortfolioData] No valid Supabase anon key found. ' +
        'Open admin-dashboard.html first and paste your key (eyJhbGci…), ' +
        'or set SUPABASE_ANON_KEY_FALLBACK in supabase-client.js.');
      return null;
    }
    return key;
  }

  // ── INIT CLIENT ─────────────────────────────────────────────
  var db;
  function getClient() {
    if (db) return db;
    if (typeof window.supabase === 'undefined') {
      console.error('[PortfolioData] Supabase SDK not loaded yet.');
      return null;
    }
    var key = _resolveAnonKey();
    if (!key) return null;
    db = window.supabase.createClient(SUPABASE_URL, key);
    return db;
  }

  // ── HELPERS ─────────────────────────────────────────────────
  function handleError(label, error) {
    console.warn('[PortfolioData] ' + label + ':', error.message || error);
  }

  // Generic fetch with error wrapping; returns [] on failure
  async function fetchTable(table, options) {
    var client = getClient();
    if (!client) return [];
    try {
      var query = client.from(table).select(options.select || '*');
      if (options.filter)  options.filter.forEach(function(f)  { query = query.eq(f[0], f[1]); });
      if (options.order)   options.order.forEach(function(o)   { query = query.order(o[0], { ascending: o[1] !== false }); });
      if (options.limit)   query = query.limit(options.limit);
      var { data, error } = await query;
      if (error) { handleError(table, error); return []; }
      return data || [];
    } catch (e) {
      handleError(table, e);
      return [];
    }
  }

  async function fetchSingle(table, options) {
    var rows = await fetchTable(table, Object.assign({ limit: 1 }, options));
    return rows[0] || null;
  }

  // ── LOADING STATE HELPERS ───────────────────────────────────
  function setLoading(selector, on) {
    var els = document.querySelectorAll(selector);
    els.forEach(function(el) {
      if (on) {
        el.classList.add('data-loading');
        if (!el.querySelector('.supabase-spinner')) {
          var sp = document.createElement('div');
          sp.className = 'supabase-spinner';
          sp.innerHTML = '<div class="sp-ring"></div>';
          el.appendChild(sp);
        }
      } else {
        el.classList.remove('data-loading');
        var sp = el.querySelector('.supabase-spinner');
        if (sp) sp.remove();
      }
    });
  }

  // Inject spinner CSS if not already present
  (function injectSpinnerCSS() {
    if (document.getElementById('supabase-spinner-css')) return;
    var s = document.createElement('style');
    s.id = 'supabase-spinner-css';
    s.textContent = [
      '.supabase-spinner{position:absolute;inset:0;display:flex;align-items:center;justify-content:center;z-index:10;pointer-events:none;}',
      '.sp-ring{width:32px;height:32px;border:3px solid rgba(255,255,255,.15);border-top-color:rgba(255,255,255,.7);border-radius:50%;animation:sp-spin .7s linear infinite;}',
      '@keyframes sp-spin{to{transform:rotate(360deg)}}',
      '.data-loading{position:relative;min-height:80px;}'
    ].join('');
    document.head.appendChild(s);
  })();

  // ============================================================
  // PUBLIC API — window.PortfolioData
  // ============================================================
  var PortfolioData = {

    // ── PROFILE ───────────────────────────────────────────────
    async getProfile() {
      return await fetchSingle('profile', {});
    },

    async applyProfile() {
      var p = await this.getProfile();
      if (!p) return;

      // Hero name / headline
      var heroName = document.getElementById('heroName');
      var heroHead = document.getElementById('heroHeadline');
      var heroTag  = document.getElementById('heroTagline');
      if (heroName) heroName.textContent = p.full_name;
      if (heroHead) heroHead.textContent = p.headline;
      if (heroTag)  heroTag.textContent  = p.tagline || '';

      // KPI stat counters — look for data-stat attributes
      var statMap = {
        years_experience: '[data-stat="years"]',
        incidents_resolved: '[data-stat="incidents"]',
        systems_managed: '[data-stat="systems"]',
        industry_verticals: '[data-stat="verticals"]'
      };
      Object.keys(statMap).forEach(function(key) {
        var els = document.querySelectorAll(statMap[key]);
        els.forEach(function(el) {
          var target = parseInt(p[key], 10) || 0;
          el.setAttribute('data-count', target);
          el.textContent = target;
        });
      });

      // SEO meta tags
      if (p.seo_description) {
        var metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) metaDesc.setAttribute('content', p.seo_description);
      }
      if (p.og_title) {
        var ogTitle = document.querySelector('meta[property="og:title"]');
        if (ogTitle) ogTitle.setAttribute('content', p.og_title);
      }

      // Contact links
      if (p.email) {
        document.querySelectorAll('[data-contact="email"]').forEach(function(el) {
          el.href = 'mailto:' + p.email;
          if (el.querySelector('.contact-val')) el.querySelector('.contact-val').textContent = p.email;
        });
      }
      if (p.phone_whatsapp) {
        var clean = p.phone_whatsapp.replace(/\D/g, '');
        document.querySelectorAll('[data-contact="whatsapp"]').forEach(function(el) {
          el.href = 'https://wa.me/' + clean + (p.whatsapp_message ? '?text=' + encodeURIComponent(p.whatsapp_message) : '');
        });
      }
      if (p.linkedin_url) {
        document.querySelectorAll('[data-contact="linkedin"]').forEach(function(el) {
          el.href = p.linkedin_url;
        });
      }
      if (p.availability_status) {
        document.querySelectorAll('[data-avail]').forEach(function(el) {
          el.setAttribute('data-avail', p.availability_status);
        });
      }

      return p;
    },

    // ── PROJECTS ──────────────────────────────────────────────
    async getProjects() {
      return await fetchTable('projects', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    // Converts DB row → shape expected by script.js loadProjects()
    projectsToLegacy(rows) {
      return rows.map(function(p) {
        return {
          icon:      p.icon || 'fa-folder',
          sector:    p.sector_tag,
          title:     p.title,
          challenge: p.challenge,
          solution:  p.solution,
          impact:    p.impact,
          tools:     p.tools || [],
          letter: p.letter_url ? { text: p.letter_text || 'Experience Letter', url: p.letter_url } : null
        };
      });
    },

    // ── WORK EXPERIENCE ───────────────────────────────────────
    async getExperience() {
      return await fetchTable('work_experience', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    experienceToLegacy(rows) {
      return rows.map(function(e) {
        var start = e.date_start ? new Date(e.date_start) : null;
        var end   = e.is_current ? null : (e.date_end ? new Date(e.date_end) : null);
        var fmtDate = function(d) {
          if (!d) return '';
          return d.toLocaleDateString('en-GB', { month: 'short', year: 'numeric' });
        };
        var dateStr = (start ? fmtDate(start) : '') + ' – ' + (e.is_current ? 'Present' : fmtDate(end));

        var responsibilities = Array.isArray(e.responsibilities) ? e.responsibilities : [];
        var stats    = Array.isArray(e.stats)    ? e.stats    : [];
        var projects = Array.isArray(e.projects) ? e.projects : [];
        var letters  = Array.isArray(e.experience_letters) ? e.experience_letters : [];
        var rec      = e.recommendation || null;

        return {
          date:             dateStr,
          title:            e.job_title,
          type:             e.employment_type,
          company:          e.company_name + (e.company_division ? ' · ' + e.company_division : '') + (e.location ? ' · ' + e.location : ''),
          tabLabel:         e.tab_label || e.company_name,
          tabIcon:          e.tab_icon  || 'fa-building',
          headerIcon:       e.header_icon || 'fa-building',
          accentColor:      e.accent_color || '#C8A96E',
          responsibilities: responsibilities,
          stats:            stats,
          projects:         projects,
          letters:          letters,
          recommendation:   rec
        };
      });
    },

    // ── SKILLS / ARSENAL ──────────────────────────────────────
    async getSkillCategories() {
      return await fetchTable('skill_categories', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    async getSkills() {
      return await fetchTable('skills', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    async getArsenal() {
      var [cats, skills] = await Promise.all([this.getSkillCategories(), this.getSkills()]);
      return cats.map(function(cat) {
        return {
          id:       cat.slug,
          icon:     cat.icon,
          title:    cat.title,
          subtitle: cat.subtitle || '',
          color:    cat.color,
          span:     cat.span_full,
          tools: skills
            .filter(function(s) { return s.category_id === cat.id; })
            .map(function(s) {
              return { icon: s.icon, name: s.name, color: s.color, proficiency: s.proficiency };
            })
        };
      });
    },

    // ── CERTIFICATIONS ────────────────────────────────────────
    async getCertifications() {
      return await fetchTable('certifications', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    certificationsToLegacy(rows) {
      return rows.map(function(c) {
        return {
          icon:      c.icon,
          badge:     c.badge_text,
          badgeClass: c.badge_class,
          title:     c.title,
          issuer:    c.issuer,
          date:      c.issue_date || '',
          category:  c.category,
          desc:      c.description || '',
          url:       c.url || ''
        };
      });
    },

    // ── TESTIMONIALS ──────────────────────────────────────────
    async getTestimonials() {
      return await fetchTable('testimonials', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    // ── EDUCATION ─────────────────────────────────────────────
    async getEducation() {
      return await fetchTable('education', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    // ── SOCIAL LINKS ──────────────────────────────────────────
    async getSocialLinks() {
      return await fetchTable('social_links', {
        filter: [['is_visible', true]],
        order: [['sort_order', true]]
      });
    },

    // ── RESUME ────────────────────────────────────────────────
    async getActiveResume() {
      return await fetchSingle('resume_versions', {
        filter: [['is_active', true]]
      });
    },

    async incrementResumeDownload(resumeId) {
      var client = getClient();
      if (!client || !resumeId) return;
      try {
        await client.rpc('increment_resume_download', { resume_id: resumeId });
      } catch(e) {
        handleError('increment_resume_download', e);
      }
    },

    // ── BLOG POSTS ────────────────────────────────────────────
    async getBlogPosts() {
      return await fetchTable('blog_posts', {
        filter: [['status', 'published']],
        order: [['published_at', false]]
      });
    },

    // ── CONTACT FORM SUBMIT ───────────────────────────────────
    async submitContactMessage(payload) {
      var client = getClient();
      if (!client) return { success: false, error: 'Client not ready' };
      try {
        var { error } = await client.from('contact_messages').insert([{
          message_type:   payload.type       || 'contact',
          sender_name:    payload.name,
          sender_email:   payload.email      || null,
          sender_phone:   payload.phone      || null,
          sender_company: payload.company    || null,
          subject:        payload.subject    || null,
          message:        payload.message    || null,
          source_section: payload.section    || null,
          user_agent:     navigator.userAgent,
          referrer:       document.referrer  || null,
          status:         'new'
        }]);
        if (error) { handleError('submitContactMessage', error); return { success: false, error: error.message }; }
        return { success: true };
      } catch(e) {
        handleError('submitContactMessage', e);
        return { success: false, error: e.message };
      }
    },

    // ── VISITOR SESSION ───────────────────────────────────────
    async logVisitorSession(data) {
      var client = getClient();
      if (!client) return null;
      try {
        var { data: row, error } = await client
          .from('visitor_sessions')
          .insert([{
            visitor_name: data.name    || null,
            session_token: data.token  || null,
            user_agent:   navigator.userAgent,
            referrer:     document.referrer || null,
            device_type:  data.deviceType || 'unknown',
            gate_completed: data.gateCompleted || false
          }])
          .select('id')
          .single();
        if (error) { handleError('logVisitorSession', error); return null; }
        return row ? row.id : null;
      } catch(e) {
        handleError('logVisitorSession', e);
        return null;
      }
    },

    // ── BOOTSTRAP: load everything and patch script.js globals ──
    async bootstrap() {
      // Wait for DOM + Supabase SDK
      if (typeof window.supabase === 'undefined') {
        console.warn('[PortfolioData] Supabase SDK not yet available — ensure CDN script loads first.');
        return;
      }

      // Fetch all data in parallel
      var [
        profile, projects, experience, arsenal,
        certs, testimonials, education, social, resume
      ] = await Promise.all([
        this.getProfile(),
        this.getProjects(),
        this.getExperience(),
        this.getArsenal(),
        this.getCertifications(),
        this.getTestimonials(),
        this.getEducation(),
        this.getSocialLinks(),
        this.getActiveResume()
      ]);

      // ── Patch script.js global arrays (used by render functions) ──
      if (projects.length)    window.projectsData    = this.projectsToLegacy(projects);
      if (experience.length)  window.experienceData  = this.experienceToLegacy(experience);
      if (arsenal.length)     window.arsenalData     = arsenal;
      if (certs.length)       window.certData        = this.certificationsToLegacy(certs);

      // Patch testimonials (used by the slider)
      if (testimonials.length) window.RECOMMENDATIONS = testimonials.map(function(t) {
        return {
          quote:       t.quote,
          name:        t.recommender_name,
          title:       t.recommender_role,
          initials:    t.recommender_initials,
          linkedin:    t.recommender_linkedin || '',
          accentColor: t.accent_color || '#C8A96E'
        };
      });

      // Apply profile to DOM
      if (profile) {
        window._portfolioProfile = profile;
        await this.applyProfile();
      }

      // Store resume reference for download handler
      if (resume) {
        window._activeResume = resume;
        // Patch any download buttons
        document.querySelectorAll('[data-action="download-cv"]').forEach(function(el) {
          el.addEventListener('click', function() {
            PortfolioData.incrementResumeDownload(resume.id);
            window.open(resume.file_url, '_blank', 'noopener');
          });
        });
      }

      // Social links — patch FAB / footer
      if (social.length) {
        window._socialLinks = social;
        social.forEach(function(s) {
          document.querySelectorAll('[data-social="' + s.platform + '"]').forEach(function(el) {
            el.href = s.url;
          });
        });
      }

      console.log('[PortfolioData] Bootstrap complete — all data loaded from Supabase.');

      // Dispatch event so script.js can re-render if needed
      document.dispatchEvent(new CustomEvent('portfolioDataReady', { detail: {
        profile, projects, experience, arsenal, certs, testimonials, education, social, resume
      }}));
    }
  };

  // ── EXPORT ──────────────────────────────────────────────────
  window.PortfolioData = PortfolioData;

  // Auto-bootstrap after DOM + SDK are ready
  function tryBootstrap() {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', function() {
        setTimeout(function() { PortfolioData.bootstrap(); }, 100);
      });
    } else {
      setTimeout(function() { PortfolioData.bootstrap(); }, 100);
    }
  }

  tryBootstrap();

})();
