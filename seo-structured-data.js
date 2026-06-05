// ============================================================
// SAJID MEHMOOD PORTFOLIO — STRUCTURED DATA (JSON-LD)
// seo-structured-data.js  v2.0  |  June 2026
//
// Injects schema.org JSON-LD structured data for:
//   - Person (primary identity card)
//   - ProfilePage
//   - BreadcrumbList
//   - Website with SearchAction
//
// Also updates meta tags from Supabase profile data if available.
//
// Place this script in <head> AFTER the Supabase SDK scripts,
// or let it self-update on portfolioDataReady.
// ============================================================

(function () {
  'use strict';

  // ── BASE SCHEMA (static defaults, overridden by Supabase data) ──
  var BASE = {
    name:       'Sajid Mehmood',
    jobTitle:   'IT Support Engineer',
    headline:   'CCNA Certified IT Support Engineer | Aviation & Healthcare in Qatar | Government Immigration — UAE',
    url:        'https://sajidmk.com',
    email:      'info@sajidmk.com',
    phone:      '+97466969598',
    whatsapp:   'https://wa.me/97466969598',
    linkedin:   'https://www.linkedin.com/in/sajid-mk-1b3954333',
    location:   'Doha, Qatar',
    country:    'QA',
    image:      'https://sajidmk.com/photo.jpg',
    logo:       'https://sajidmk.com/logo.png',
    description:'CCNA Certified IT Support Engineer with 4+ years of enterprise infrastructure experience across aviation and healthcare sectors in Qatar, and government immigration systems in the UAE. Skilled in network infrastructure, server management, and end-to-end IT deployments.',
    skills:     ['CCNA', 'IT Support', 'Network Infrastructure', 'Windows Server', 'Active Directory', 'ITSM', 'ManageEngine ServiceDesk', 'TCP/IP', 'VPN', 'Structured Cabling']
  };

  // ── SCHEMA BUILDERS ─────────────────────────────────────────
  function buildPersonSchema(data) {
    return {
      '@context': 'https://schema.org',
      '@type': 'Person',
      '@id': data.url + '/#person',
      name: data.name,
      jobTitle: data.jobTitle,
      description: data.description,
      url: data.url,
      email: 'mailto:' + data.email,
      telephone: data.phone,
      image: {
        '@type': 'ImageObject',
        url: data.image,
        contentUrl: data.image
      },
      address: {
        '@type': 'PostalAddress',
        addressLocality: 'Doha',
        addressCountry: data.country || 'QA'
      },
      sameAs: [
        data.linkedin,
        data.whatsapp
      ].filter(Boolean),
      knowsAbout: data.skills,
      hasCredential: [
        {
          '@type': 'EducationalOccupationalCredential',
          name: 'Cisco Certified Network Associate (CCNA)',
          credentialCategory: 'Professional Certification',
          recognizedBy: {
            '@type': 'Organization',
            name: 'Cisco Systems'
          }
        }
      ],
      alumniOf: [
        {
          '@type': 'CollegeOrUniversity',
          name: 'Middlesex University Dubai',
          sameAs: 'https://www.mdx.ac.uk'
        }
      ]
    };
  }

  function buildProfilePageSchema(data) {
    return {
      '@context': 'https://schema.org',
      '@type': 'ProfilePage',
      '@id': data.url + '/#profilepage',
      mainEntity: { '@id': data.url + '/#person' },
      name: data.name + ' — IT Support Engineer Portfolio',
      description: data.description,
      url: data.url,
      image: data.image,
      inLanguage: 'en',
      dateModified: new Date().toISOString().split('T')[0],
      publisher: {
        '@type': 'Person',
        '@id': data.url + '/#person'
      },
      breadcrumb: {
        '@type': 'BreadcrumbList',
        itemListElement: [
          {
            '@type': 'ListItem',
            position: 1,
            name: 'Home',
            item: data.url
          }
        ]
      }
    };
  }

  function buildWebsiteSchema(data) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      '@id': data.url + '/#website',
      url: data.url,
      name: data.name + ' — IT Support Engineer',
      description: data.description,
      publisher: {
        '@type': 'Person',
        '@id': data.url + '/#person'
      },
      inLanguage: 'en'
    };
  }

  // ── INJECT SCHEMAS ──────────────────────────────────────────
  function injectSchema(schema, id) {
    var existing = document.getElementById(id);
    if (existing) existing.parentNode.removeChild(existing);

    var script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = id;
    script.textContent = JSON.stringify(schema, null, 2);
    document.head.appendChild(script);
  }

  function injectAllSchemas(data) {
    injectSchema(buildPersonSchema(data),      'schema-person');
    injectSchema(buildProfilePageSchema(data), 'schema-profilepage');
    injectSchema(buildWebsiteSchema(data),     'schema-website');
  }

  // ── META TAG UPDATER ────────────────────────────────────────
  function upsertMeta(attr, attrValue, content) {
    var selector = 'meta[' + attr + '="' + attrValue + '"]';
    var el = document.querySelector(selector);
    if (!el) {
      el = document.createElement('meta');
      el.setAttribute(attr, attrValue);
      document.head.appendChild(el);
    }
    el.setAttribute('content', content);
  }

  function updateMetaTags(data) {
    var title = data.name + ' — CCNA IT Support Engineer | Qatar';
    var desc  = data.description;

    document.title = title;
    upsertMeta('name',     'description',           desc);
    upsertMeta('property', 'og:title',              title);
    upsertMeta('property', 'og:description',        desc);
    upsertMeta('property', 'og:url',                data.url);
    upsertMeta('property', 'og:image',              data.image);
    upsertMeta('property', 'og:type',               'profile');
    upsertMeta('property', 'og:locale',             'en_GB');
    upsertMeta('property', 'profile:first_name',    data.name.split(' ')[0]);
    upsertMeta('property', 'profile:last_name',     data.name.split(' ').slice(1).join(' '));
    upsertMeta('property', 'profile:username',      'sajidmk');
    upsertMeta('name',     'twitter:card',          'summary_large_image');
    upsertMeta('name',     'twitter:title',         title);
    upsertMeta('name',     'twitter:description',   desc);
    upsertMeta('name',     'twitter:image',         data.image);
    upsertMeta('name',     'keywords',              data.skills.join(', ') + ', IT Support Qatar, CCNA Engineer Doha');
    upsertMeta('name',     'author',                data.name);

    // Canonical link
    var canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.rel = 'canonical';
      document.head.appendChild(canonical);
    }
    canonical.href = data.url;

    // Hreflang for English
    if (!document.querySelector('link[hreflang="en"]')) {
      var hreflang = document.createElement('link');
      hreflang.rel = 'alternate';
      hreflang.setAttribute('hreflang', 'en');
      hreflang.href = data.url;
      document.head.appendChild(hreflang);
    }
  }

  // ── PROFILE OVERRIDE ────────────────────────────────────────
  // Merge Supabase profile data with BASE defaults
  function mergeProfile(supabaseProfile) {
    if (!supabaseProfile) return BASE;
    return {
      name:        supabaseProfile.full_name        || BASE.name,
      jobTitle:    supabaseProfile.headline         || BASE.jobTitle,
      headline:    supabaseProfile.headline         || BASE.headline,
      url:         BASE.url,
      email:       supabaseProfile.email            || BASE.email,
      phone:       supabaseProfile.phone_whatsapp   || BASE.phone,
      whatsapp:    'https://wa.me/' + (supabaseProfile.phone_whatsapp || BASE.phone).replace(/\D/g, ''),
      linkedin:    supabaseProfile.linkedin_url     || BASE.linkedin,
      location:    supabaseProfile.location         || BASE.location,
      country:     'QA',
      image:       supabaseProfile.photo_url        || BASE.image,
      logo:        supabaseProfile.logo_url         || BASE.logo,
      description: supabaseProfile.seo_description  || BASE.description,
      skills:      supabaseProfile.seo_keywords     || BASE.skills
    };
  }

  // ── ACCESSIBILITY ────────────────────────────────────────────
  // Add missing ARIA attributes that affect accessibility scores
  function improveAccessibility() {
    // Add lang attribute if missing (required for screen readers)
    if (!document.documentElement.getAttribute('lang')) {
      document.documentElement.setAttribute('lang', 'en');
    }

    // Add role="main" to <main> if missing
    var main = document.querySelector('main');
    if (main && !main.getAttribute('role')) main.setAttribute('role', 'main');

    // Ensure all images have alt text (non-empty for meaningful images)
    document.querySelectorAll('img').forEach(function (img) {
      if (!img.hasAttribute('alt')) {
        // Decorative images get empty alt; meaningful ones get filename as fallback
        var src = img.getAttribute('src') || '';
        var isDecorative = img.getAttribute('role') === 'presentation' ||
                           img.getAttribute('aria-hidden') === 'true';
        img.setAttribute('alt', isDecorative ? '' : src.replace(/^.*\//, '').replace(/\.[^.]+$/, '').replace(/[-_]/g, ' '));
      }
    });

    // Add skip-to-main link if not present (screen reader + keyboard users)
    if (!document.getElementById('skip-to-main')) {
      var skip = document.createElement('a');
      skip.id = 'skip-to-main';
      skip.href = '#home';
      skip.className = 'sr-skip-link';
      skip.textContent = 'Skip to main content';
      var skipStyle = document.createElement('style');
      skipStyle.textContent = '.sr-skip-link{position:absolute;top:-40px;left:0;background:#C8A96E;color:#1a0e00;padding:8px 16px;z-index:100000;font-family:"DM Sans",system-ui,sans-serif;font-size:14px;font-weight:600;border-radius:0 0 8px 0;transition:top 0.2s;}.sr-skip-link:focus{top:0;}';
      document.head.appendChild(skipStyle);
      document.body.insertBefore(skip, document.body.firstChild);
    }

    // Ensure all interactive elements have accessible names
    document.querySelectorAll('button:not([aria-label]):not([aria-labelledby])').forEach(function (btn) {
      if (!btn.textContent.trim()) {
        btn.setAttribute('aria-label', 'Button');
      }
    });

    // Add focus-visible polyfill style (keyboard navigation indicator)
    if (!document.getElementById('focus-visible-css')) {
      var fvStyle = document.createElement('style');
      fvStyle.id = 'focus-visible-css';
      fvStyle.textContent = ':focus-visible{outline:2px solid #C8A96E!important;outline-offset:3px!important;}:focus:not(:focus-visible){outline:none!important;}';
      document.head.appendChild(fvStyle);
    }
  }

  // ── INIT ────────────────────────────────────────────────────
  function init() {
    // Run with base data immediately
    injectAllSchemas(BASE);
    updateMetaTags(BASE);
    improveAccessibility();

    // Re-run when Supabase profile is available
    document.addEventListener('portfolioDataReady', function (e) {
      if (e.detail && e.detail.profile) {
        var merged = mergeProfile(e.detail.profile);
        injectAllSchemas(merged);
        updateMetaTags(merged);
      }
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  window.SEO = {
    update: function (profileData) {
      var merged = mergeProfile(profileData);
      injectAllSchemas(merged);
      updateMetaTags(merged);
    },
    improveAccessibility: improveAccessibility
  };

})();
