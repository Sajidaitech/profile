-- ================================================================
-- SAJID MEHMOOD PORTFOLIO — SUPABASE POSTGRESQL SCHEMA
-- Version: 1.0  |  Date: June 2026
-- ================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- TABLE: profile
CREATE TABLE public.profile (
  id                  UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  full_name           TEXT        NOT NULL,
  headline            TEXT        NOT NULL,
  tagline             TEXT,
  location            TEXT        NOT NULL DEFAULT 'Doha, Qatar',
  timezone            TEXT        NOT NULL DEFAULT 'Asia/Qatar',
  availability_status TEXT        NOT NULL DEFAULT 'available' CHECK (availability_status IN ('available','busy','not_looking')),
  availability_note   TEXT,
  years_experience    SMALLINT    NOT NULL DEFAULT 0,
  incidents_resolved  INT         NOT NULL DEFAULT 0,
  systems_managed     INT         NOT NULL DEFAULT 0,
  industry_verticals  SMALLINT    NOT NULL DEFAULT 0,
  photo_url           TEXT,
  logo_url            TEXT,
  resume_url          TEXT,
  email               TEXT        NOT NULL,
  phone_whatsapp      TEXT,
  phone_call          TEXT,
  linkedin_url        TEXT,
  whatsapp_message    TEXT,
  seo_description     TEXT,
  seo_keywords        TEXT[],
  og_title            TEXT,
  og_description      TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.profile IS 'Single-row canonical owner identity. Use UPDATE, never INSERT a second row.';
CREATE UNIQUE INDEX idx_profile_single_row ON public.profile ((true));

-- TABLE: about_sections
CREATE TABLE public.about_sections (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order   SMALLINT    NOT NULL DEFAULT 0,
  section_key  TEXT        NOT NULL UNIQUE,
  title        TEXT,
  body         TEXT        NOT NULL,
  is_visible   BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_about_order ON public.about_sections (sort_order);

-- TABLE: work_experience
CREATE TABLE public.work_experience (
  id               UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order       SMALLINT    NOT NULL DEFAULT 0,
  job_title        TEXT        NOT NULL,
  company_name     TEXT        NOT NULL,
  company_division TEXT,
  location         TEXT,
  employment_type  TEXT        NOT NULL DEFAULT 'Full-Time' CHECK (employment_type IN ('Full-Time','Part-Time','Contract','Internship','Project Deployment','Freelance')),
  date_start       DATE        NOT NULL,
  date_end         DATE,
  is_current       BOOLEAN     NOT NULL DEFAULT false,
  tab_label        TEXT,
  tab_icon         TEXT,
  header_icon      TEXT,
  accent_color     TEXT        DEFAULT '#C8A96E',
  responsibilities JSONB       NOT NULL DEFAULT '[]',
  stats            JSONB       DEFAULT '[]',
  projects         JSONB       DEFAULT '[]',
  experience_letters JSONB     DEFAULT '[]',
  recommendation   JSONB,
  is_visible       BOOLEAN     NOT NULL DEFAULT true,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_experience_order  ON public.work_experience (sort_order);
CREATE INDEX idx_experience_dates  ON public.work_experience (date_start DESC);
CREATE INDEX idx_experience_resp   ON public.work_experience USING GIN (responsibilities);
CREATE INDEX idx_experience_stats  ON public.work_experience USING GIN (stats);

-- TABLE: education
CREATE TABLE public.education (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order   SMALLINT    NOT NULL DEFAULT 0,
  tab_key      TEXT        NOT NULL UNIQUE,
  degree_type  TEXT        NOT NULL,
  field        TEXT        NOT NULL,
  institution  TEXT        NOT NULL,
  location     TEXT,
  date_start   DATE,
  date_end     DATE,
  grade        TEXT,
  description  TEXT,
  modules      TEXT[],
  url          TEXT,
  is_visible   BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_education_order ON public.education (sort_order);

-- TABLE: certifications
CREATE TABLE public.certifications (
  id            UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order    SMALLINT    NOT NULL DEFAULT 0,
  icon          TEXT        NOT NULL DEFAULT 'fa-certificate',
  badge_text    TEXT        NOT NULL,
  badge_class   TEXT        NOT NULL DEFAULT 'cc-badge--verified',
  title         TEXT        NOT NULL,
  issuer        TEXT        NOT NULL,
  issue_date    TEXT,
  category      TEXT        NOT NULL,
  description   TEXT,
  credential_id TEXT,
  url           TEXT,
  is_featured   BOOLEAN     NOT NULL DEFAULT false,
  is_visible    BOOLEAN     NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_certifications_order ON public.certifications (sort_order);
CREATE INDEX idx_certifications_category ON public.certifications (category);
CREATE INDEX idx_certifications_featured ON public.certifications (is_featured) WHERE is_featured = true;

-- TABLE: skill_categories
CREATE TABLE public.skill_categories (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order SMALLINT    NOT NULL DEFAULT 0,
  slug       TEXT        NOT NULL UNIQUE,
  icon       TEXT        NOT NULL,
  title      TEXT        NOT NULL,
  subtitle   TEXT,
  color      TEXT        NOT NULL DEFAULT '#2c5f9e',
  span_full  BOOLEAN     NOT NULL DEFAULT false,
  is_visible BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_skill_cats_order ON public.skill_categories (sort_order);

-- TABLE: skills
CREATE TABLE public.skills (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  category_id UUID        NOT NULL REFERENCES public.skill_categories (id) ON DELETE CASCADE,
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  icon        TEXT        NOT NULL,
  name        TEXT        NOT NULL,
  color       TEXT        NOT NULL DEFAULT '#2c5f9e',
  proficiency SMALLINT    CHECK (proficiency BETWEEN 0 AND 100),
  is_visible  BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_skills_category ON public.skills (category_id);
CREATE INDEX idx_skills_order    ON public.skills (category_id, sort_order);

-- TABLE: projects
CREATE TABLE public.projects (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  icon        TEXT        NOT NULL DEFAULT 'fa-folder',
  sector_tag  TEXT        NOT NULL,
  title       TEXT        NOT NULL,
  challenge   TEXT        NOT NULL,
  solution    TEXT        NOT NULL,
  impact      TEXT        NOT NULL,
  tools       TEXT[]      NOT NULL DEFAULT '{}',
  letter_text TEXT,
  letter_url  TEXT,
  tags        TEXT[]      DEFAULT '{}',
  is_featured BOOLEAN     NOT NULL DEFAULT false,
  is_visible  BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_projects_order    ON public.projects (sort_order);
CREATE INDEX idx_projects_sector   ON public.projects (sector_tag);
CREATE INDEX idx_projects_featured ON public.projects (is_featured) WHERE is_featured = true;
CREATE INDEX idx_projects_tools    ON public.projects USING GIN (tools);

-- TABLE: gallery_items
CREATE TABLE public.gallery_items (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order  SMALLINT    NOT NULL DEFAULT 0,
  title       TEXT        NOT NULL,
  description TEXT,
  image_url   TEXT        NOT NULL,
  thumb_url   TEXT,
  project_ref TEXT,
  tags        TEXT[]      DEFAULT '{}',
  is_visible  BOOLEAN     NOT NULL DEFAULT true,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_gallery_order ON public.gallery_items (sort_order);

-- TABLE: testimonials
CREATE TABLE public.testimonials (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order   SMALLINT    NOT NULL DEFAULT 0,
  recommender_name     TEXT  NOT NULL,
  recommender_role     TEXT  NOT NULL,
  recommender_initials TEXT  NOT NULL,
  recommender_linkedin TEXT,
  quote        TEXT        NOT NULL,
  accent_color TEXT        DEFAULT '#C8A96E',
  source       TEXT        NOT NULL DEFAULT 'linkedin' CHECK (source IN ('linkedin','email','verbal','written')),
  is_verified  BOOLEAN     NOT NULL DEFAULT true,
  is_visible   BOOLEAN     NOT NULL DEFAULT true,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_testimonials_order ON public.testimonials (sort_order);

-- TABLE: social_links
CREATE TABLE public.social_links (
  id         UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  sort_order SMALLINT    NOT NULL DEFAULT 0,
  platform   TEXT        NOT NULL UNIQUE,
  label      TEXT        NOT NULL,
  url        TEXT        NOT NULL,
  icon_class TEXT,
  color      TEXT,
  is_primary BOOLEAN     NOT NULL DEFAULT false,
  is_visible BOOLEAN     NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_social_order   ON public.social_links (sort_order);
CREATE INDEX idx_social_primary ON public.social_links (is_primary) WHERE is_primary = true;

-- TABLE: resume_versions
CREATE TABLE public.resume_versions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  version_label  TEXT        NOT NULL,
  file_url       TEXT        NOT NULL,
  file_name      TEXT        NOT NULL,
  is_active      BOOLEAN     NOT NULL DEFAULT false,
  download_count BIGINT      NOT NULL DEFAULT 0,
  notes          TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX idx_resume_active ON public.resume_versions (is_active) WHERE is_active = true;

-- TABLE: blog_posts
CREATE TABLE public.blog_posts (
  id           UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  slug         TEXT        NOT NULL UNIQUE,
  title        TEXT        NOT NULL,
  excerpt      TEXT,
  body         TEXT,
  cover_url    TEXT,
  tags         TEXT[]      DEFAULT '{}',
  status       TEXT        NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','published','archived')),
  published_at TIMESTAMPTZ,
  view_count   BIGINT      NOT NULL DEFAULT 0,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX idx_blog_status ON public.blog_posts (status);

-- TABLE: contact_messages
CREATE TABLE public.contact_messages (
  id              UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  message_type    TEXT        NOT NULL DEFAULT 'contact' CHECK (message_type IN ('contact','gate_visit','quick_connect')),
  sender_name     TEXT        NOT NULL,
  sender_email    TEXT,
  sender_phone    TEXT,
  sender_company  TEXT,
  subject         TEXT,
  message         TEXT,
  source_section  TEXT,
  visitor_ip      TEXT,
  user_agent      TEXT,
  referrer        TEXT,
  status          TEXT        NOT NULL DEFAULT 'new' CHECK (status IN ('new','read','replied','archived','spam')),
  admin_notes     TEXT,
  replied_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- TABLE: visitor_sessions
CREATE TABLE public.visitor_sessions (
  id             UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  visitor_name   TEXT,
  session_token  TEXT        UNIQUE,
  user_agent     TEXT,
  referrer       TEXT,
  country_code   TEXT,
  city           TEXT,
  device_type    TEXT        CHECK (device_type IN ('mobile','tablet','desktop','unknown')),
  page_views     SMALLINT    NOT NULL DEFAULT 1,
  sections_seen  TEXT[]      DEFAULT '{}',
  cta_clicked    TEXT[],
  duration_secs  INT,
  gate_completed BOOLEAN     NOT NULL DEFAULT false,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_seen_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ================================================================
-- AUTO UPDATED_AT TRIGGER CONFIG
-- ================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DO $$
DECLARE
  t TEXT;
BEGIN
  FOREACH t IN ARRAY ARRAY[
    'profile','about_sections','work_experience','education',
    'certifications','skill_categories','skills','projects',
    'gallery_items','testimonials','social_links','resume_versions',
    'blog_posts','contact_messages','visitor_sessions'
  ]
  LOOP
    EXECUTE format(
      'CREATE TRIGGER trg_%s_updated_at BEFORE UPDATE ON public.%s FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();',
      t, t
    );
  END LOOP;
END;
$$;

-- ATOMIC COUNTERS VIA RPC
CREATE OR REPLACE FUNCTION public.increment_resume_download(resume_id UUID)
RETURNS VOID LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE public.resume_versions SET download_count = download_count + 1 WHERE id = resume_id;
END;
$$;