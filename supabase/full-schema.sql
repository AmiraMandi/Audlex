-- ============================================================
-- Audlex — Schema SQL completo
-- ============================================================
-- Ejecutar en Supabase SQL Editor (https://supabase.com/dashboard)
-- Ir a: SQL Editor → New query → Pegar todo → Run
-- ============================================================

-- ============================================================
-- ENUMS
-- ============================================================

CREATE TYPE org_size AS ENUM ('micro', 'small', 'medium', 'large');
CREATE TYPE plan AS ENUM ('free', 'starter', 'business', 'enterprise', 'consultora');
CREATE TYPE user_role AS ENUM ('owner', 'admin', 'member', 'viewer');
CREATE TYPE ai_system_status AS ENUM ('active', 'planned', 'retired');
CREATE TYPE risk_level AS ENUM ('unacceptable', 'high', 'limited', 'minimal');
CREATE TYPE document_type AS ENUM (
  'risk_management', 'technical_file', 'impact_assessment', 'data_governance',
  'human_oversight', 'post_market_monitoring', 'activity_logging',
  'conformity_declaration', 'instructions_for_use', 'transparency_notice',
  'content_labeling_policy', 'ai_usage_policy', 'ai_inventory'
);
CREATE TYPE document_status AS ENUM ('draft', 'review', 'approved', 'expired');
CREATE TYPE compliance_status AS ENUM ('pending', 'in_progress', 'completed', 'not_applicable');
CREATE TYPE alert_type AS ENUM ('deadline', 'regulation_update', 'compliance_gap', 'document_expiry', 'system_review');
CREATE TYPE alert_severity AS ENUM ('info', 'warning', 'critical');

-- ============================================================
-- TABLES
-- ============================================================

-- Organizations (multi-tenant)
CREATE TABLE organizations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  cif_nif TEXT,
  sector TEXT,
  sector_description TEXT,
  size org_size NOT NULL DEFAULT 'micro',
  country TEXT NOT NULL DEFAULT 'ES',
  website TEXT,
  plan plan NOT NULL DEFAULT 'free',
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  max_ai_systems INTEGER NOT NULL DEFAULT 1,
  max_users INTEGER NOT NULL DEFAULT 1,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Users
CREATE TABLE users (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  role user_role NOT NULL DEFAULT 'member',
  auth_provider_id TEXT NOT NULL UNIQUE,
  avatar_url TEXT,
  last_login_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- AI Systems
CREATE TABLE ai_systems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  provider TEXT,
  provider_model TEXT,
  category TEXT NOT NULL,
  purpose TEXT NOT NULL,
  data_types JSONB,
  data_volume TEXT,
  affected_persons JSONB,
  number_of_affected TEXT,
  sector_use TEXT,
  is_autonomous_decision BOOLEAN DEFAULT false,
  has_human_oversight BOOLEAN DEFAULT true,
  deployment_date DATE,
  status ai_system_status NOT NULL DEFAULT 'active',
  notes TEXT,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Risk Assessments
CREATE TABLE risk_assessments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  risk_level risk_level NOT NULL,
  is_prohibited BOOLEAN NOT NULL DEFAULT false,
  prohibition_reason TEXT,
  applicable_articles JSONB,
  obligations JSONB,
  assessment_data JSONB,
  assessment_score INTEGER,
  recommendations JSONB,
  assessed_by UUID REFERENCES users(id),
  version INTEGER NOT NULL DEFAULT 1,
  assessed_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Documents
CREATE TABLE documents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_system_id UUID REFERENCES ai_systems(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type document_type NOT NULL,
  title TEXT NOT NULL,
  content JSONB,
  file_url TEXT,
  file_format TEXT DEFAULT 'pdf',
  status document_status NOT NULL DEFAULT 'draft',
  approved_by UUID REFERENCES users(id),
  approved_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ,
  version INTEGER NOT NULL DEFAULT 1,
  created_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Compliance Items
CREATE TABLE compliance_items (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  ai_system_id UUID NOT NULL REFERENCES ai_systems(id) ON DELETE CASCADE,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  article TEXT NOT NULL,
  requirement TEXT NOT NULL,
  category TEXT,
  status compliance_status NOT NULL DEFAULT 'pending',
  evidence_url TEXT,
  evidence_document_id UUID REFERENCES documents(id),
  notes TEXT,
  due_date DATE,
  completed_at TIMESTAMPTZ,
  completed_by UUID REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Alerts
CREATE TABLE alerts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  type alert_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity alert_severity NOT NULL DEFAULT 'info',
  is_read BOOLEAN NOT NULL DEFAULT false,
  action_url TEXT,
  related_entity_type TEXT,
  related_entity_id UUID,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Audit Log
CREATE TABLE audit_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL REFERENCES organizations(id),
  user_id UUID REFERENCES users(id),
  action TEXT NOT NULL,
  entity_type TEXT NOT NULL,
  entity_id UUID,
  changes JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Whitelabel Config
CREATE TABLE whitelabel_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID NOT NULL UNIQUE REFERENCES organizations(id) ON DELETE CASCADE,
  brand_name TEXT NOT NULL,
  logo_url TEXT,
  primary_color VARCHAR(7) DEFAULT '#2563EB',
  secondary_color VARCHAR(7) DEFAULT '#1E40AF',
  custom_domain TEXT,
  email_from TEXT,
  footer_text TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Consultora Clients
CREATE TABLE consultora_clients (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  consultora_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  client_org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- ============================================================
-- RLS (Row Level Security)
-- ============================================================

ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_systems ENABLE ROW LEVEL SECURITY;
ALTER TABLE risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE compliance_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE whitelabel_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE consultora_clients ENABLE ROW LEVEL SECURITY;

-- Helper function (in public schema since auth schema is restricted)
CREATE OR REPLACE FUNCTION public.user_org_id()
RETURNS uuid AS $$
  SELECT organization_id
  FROM public.users
  WHERE auth_provider_id = auth.uid()::text
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Organizations policies
CREATE POLICY "Users can view own organization" ON organizations FOR SELECT USING (id = public.user_org_id());
CREATE POLICY "Owners can update organization" ON organizations FOR UPDATE USING (id = public.user_org_id()) WITH CHECK (id = public.user_org_id());

-- Users policies
CREATE POLICY "Users can view members of own org" ON users FOR SELECT USING (organization_id = public.user_org_id());
CREATE POLICY "Users can update own profile" ON users FOR UPDATE USING (auth_provider_id = auth.uid()::text);

-- AI Systems policies
CREATE POLICY "Users can view own org systems" ON ai_systems FOR SELECT USING (organization_id = public.user_org_id());
CREATE POLICY "Users can create systems in own org" ON ai_systems FOR INSERT WITH CHECK (organization_id = public.user_org_id());
CREATE POLICY "Users can update own org systems" ON ai_systems FOR UPDATE USING (organization_id = public.user_org_id());
CREATE POLICY "Users can delete own org systems" ON ai_systems FOR DELETE USING (organization_id = public.user_org_id());

-- Risk Assessments policies
CREATE POLICY "Users can view own org assessments" ON risk_assessments FOR SELECT USING (organization_id = public.user_org_id());
CREATE POLICY "Users can create assessments" ON risk_assessments FOR INSERT WITH CHECK (organization_id = public.user_org_id());

-- Documents policies
CREATE POLICY "Users can view own org documents" ON documents FOR SELECT USING (organization_id = public.user_org_id());
CREATE POLICY "Users can create documents" ON documents FOR INSERT WITH CHECK (organization_id = public.user_org_id());
CREATE POLICY "Users can update own org documents" ON documents FOR UPDATE USING (organization_id = public.user_org_id());

-- Compliance Items policies
CREATE POLICY "Users can view own org compliance items" ON compliance_items FOR SELECT USING (organization_id = public.user_org_id());
CREATE POLICY "Users can create compliance items" ON compliance_items FOR INSERT WITH CHECK (organization_id = public.user_org_id());
CREATE POLICY "Users can update own org compliance items" ON compliance_items FOR UPDATE USING (organization_id = public.user_org_id());

-- Alerts policies
CREATE POLICY "Users can view own org alerts" ON alerts FOR SELECT USING (organization_id = public.user_org_id());
CREATE POLICY "Users can update own org alerts" ON alerts FOR UPDATE USING (organization_id = public.user_org_id());

-- Audit Log policies
CREATE POLICY "Users can view own org audit log" ON audit_log FOR SELECT USING (organization_id = public.user_org_id());

-- Whitelabel policies
CREATE POLICY "Users can view own org whitelabel config" ON whitelabel_config FOR SELECT USING (organization_id = public.user_org_id());
CREATE POLICY "Owners can manage whitelabel config" ON whitelabel_config FOR ALL USING (organization_id = public.user_org_id());

-- ============================================================
-- STORAGE
-- ============================================================

INSERT INTO storage.buckets (id, name, public) VALUES ('documents', 'documents', false) ON CONFLICT DO NOTHING;

CREATE POLICY "Users can access own org documents" ON storage.objects FOR ALL USING (bucket_id = 'documents' AND auth.role() = 'authenticated');

-- ============================================================
-- TRIGGERS: auto-update updated_at
-- ============================================================

CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_organizations BEFORE UPDATE ON organizations FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_users BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_ai_systems BEFORE UPDATE ON ai_systems FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_documents BEFORE UPDATE ON documents FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER set_updated_at_whitelabel_config BEFORE UPDATE ON whitelabel_config FOR EACH ROW EXECUTE FUNCTION update_updated_at();
