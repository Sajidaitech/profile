-- ================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ================================================================
ALTER TABLE public.profile             ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.about_sections      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.work_experience     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.education           ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.certifications      ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skill_categories    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.skills              ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.projects            ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items       ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.testimonials        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.social_links        ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions     ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.blog_posts          ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.contact_messages    ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visitor_sessions    ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read_profile"          ON public.profile          FOR SELECT TO anon USING (true);
CREATE POLICY "public_read_about"            ON public.about_sections   FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_experience"       ON public.work_experience  FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_education"        ON public.education        FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_certifications"   ON public.certifications   FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_skill_categories" ON public.skill_categories FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_skills"           ON public.skills           FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_projects"         ON public.projects         FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_gallery"          ON public.gallery_items    FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_testimonials"     ON public.testimonials     FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_social_links"     ON public.social_links     FOR SELECT TO anon USING (is_visible = true);
CREATE POLICY "public_read_blog_posts"       ON public.blog_posts       FOR SELECT TO anon USING (status = 'published');
CREATE POLICY "public_read_active_resume"    ON public.resume_versions  FOR SELECT TO anon USING (is_active = true);

CREATE POLICY "public_insert_contact_message" ON public.contact_messages
  FOR INSERT TO anon WITH CHECK (message_type IN ('contact','gate_visit','quick_connect') AND status = 'new' AND admin_notes IS NULL AND replied_at IS NULL);

CREATE POLICY "public_insert_session" ON public.visitor_sessions FOR INSERT TO anon WITH CHECK (true);

-- FULL OWNER ADMIN BYPASS FOR AUTHENTICATED SYSTEM USERS
CREATE POLICY "owner_all_profile"          ON public.profile          FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_about"            ON public.about_sections   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_experience"       ON public.work_experience  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_education"        ON public.education        FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_certifications"   ON public.certifications   FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_skill_categories" ON public.skill_categories FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_skills"           ON public.skills           FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_projects"         ON public.projects         FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_gallery"          ON public.gallery_items    FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_testimonials"     ON public.testimonials     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_social"           ON public.social_links     FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_resume"           ON public.resume_versions  FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_blog"             ON public.blog_posts       FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_messages"         ON public.contact_messages FOR ALL TO authenticated USING (true) WITH CHECK (true);
CREATE POLICY "owner_all_sessions"         ON public.visitor_sessions FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- ================================================================
-- INITIAL CONTENT DATA SEEDING
-- ================================================================
INSERT INTO public.profile (
  full_name, headline, tagline, location, timezone, email, phone_whatsapp, linkedin_url, years_experience, incidents_resolved, systems_managed, industry_verticals
) VALUES (
  'Sajid Mehmood', 'IT Support Engineer | CCNA Certified', 'Four years enterprise infrastructure...', 'Doha, Qatar', 'Asia/Qatar', 'INFO@SAJIDMK.COM', '+97466969598', 'https://www.linkedin.com/in/sajid-mk-1b3954333', 4, 500, 600, 3
);

INSERT INTO public.social_links (sort_order, platform, label, url, icon_class, color, is_primary) VALUES
  (1, 'whatsapp', 'WhatsApp', 'https://wa.me/97466969598', 'fab fa-whatsapp', '#25D366', true),
  (2, 'linkedin', 'LinkedIn', 'https://www.linkedin.com/in/sajid-mk-1b3954333', 'fab fa-linkedin-in', '#0A66C2', true);

INSERT INTO public.skill_categories (sort_order, slug, icon, title, subtitle, color, span_full) VALUES
  (1, 'infrastructure', 'fa-server', 'Infrastructure', 'Core Systems', '#2c5f9e', false),
  (2, 'networking', 'fa-network-wired', 'Networking', 'CCNA Standard', '#2c5f9e', false);

INSERT INTO public.testimonials (sort_order, recommender_name, recommender_role, recommender_initials, quote, is_verified) VALUES
  (1, 'Rayees Abdullah', 'Senior IT Engineer', 'RA', 'Sajid demonstrated exceptional technical skill...', true);