-- ============================================================
-- Audlex — Supabase Setup SQL
-- ============================================================
-- Ejecuta este SQL en el SQL Editor de Supabase después de
-- correr `npm run db:push` para crear las tablas.
-- ============================================================

-- Habilitar RLS en todas las tablas
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

-- ============================================================
-- Función helper: obtener organization_id del usuario actual
-- ============================================================
CREATE OR REPLACE FUNCTION auth.user_org_id()
RETURNS uuid AS $$
  SELECT organization_id
  FROM users
  WHERE auth_provider_id = auth.uid()::text
  LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- ============================================================
-- POLICIES: Organizations
-- ============================================================
CREATE POLICY "Users can view own organization"
  ON organizations FOR SELECT
  USING (id = auth.user_org_id());

CREATE POLICY "Owners can update organization"
  ON organizations FOR UPDATE
  USING (id = auth.user_org_id())
  WITH CHECK (id = auth.user_org_id());

-- ============================================================
-- POLICIES: Users
-- ============================================================
CREATE POLICY "Users can view members of own org"
  ON users FOR SELECT
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth_provider_id = auth.uid()::text);

-- ============================================================
-- POLICIES: AI Systems
-- ============================================================
CREATE POLICY "Users can view own org systems"
  ON ai_systems FOR SELECT
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Users can create systems in own org"
  ON ai_systems FOR INSERT
  WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "Users can update own org systems"
  ON ai_systems FOR UPDATE
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Users can delete own org systems"
  ON ai_systems FOR DELETE
  USING (organization_id = auth.user_org_id());

-- ============================================================
-- POLICIES: Risk Assessments
-- ============================================================
CREATE POLICY "Users can view own org assessments"
  ON risk_assessments FOR SELECT
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Users can create assessments"
  ON risk_assessments FOR INSERT
  WITH CHECK (organization_id = auth.user_org_id());

-- ============================================================
-- POLICIES: Documents
-- ============================================================
CREATE POLICY "Users can view own org documents"
  ON documents FOR SELECT
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Users can create documents"
  ON documents FOR INSERT
  WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "Users can update own org documents"
  ON documents FOR UPDATE
  USING (organization_id = auth.user_org_id());

-- ============================================================
-- POLICIES: Compliance Items
-- ============================================================
CREATE POLICY "Users can view own org compliance items"
  ON compliance_items FOR SELECT
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Users can create compliance items"
  ON compliance_items FOR INSERT
  WITH CHECK (organization_id = auth.user_org_id());

CREATE POLICY "Users can update own org compliance items"
  ON compliance_items FOR UPDATE
  USING (organization_id = auth.user_org_id());

-- ============================================================
-- POLICIES: Alerts
-- ============================================================
CREATE POLICY "Users can view own org alerts"
  ON alerts FOR SELECT
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Users can update own org alerts"
  ON alerts FOR UPDATE
  USING (organization_id = auth.user_org_id());

-- ============================================================
-- POLICIES: Audit Log (solo lectura)
-- ============================================================
CREATE POLICY "Users can view own org audit log"
  ON audit_log FOR SELECT
  USING (organization_id = auth.user_org_id());

-- ============================================================
-- POLICIES: Whitelabel Config
-- ============================================================
CREATE POLICY "Users can view own org whitelabel config"
  ON whitelabel_config FOR SELECT
  USING (organization_id = auth.user_org_id());

CREATE POLICY "Owners can manage whitelabel config"
  ON whitelabel_config FOR ALL
  USING (organization_id = auth.user_org_id());

-- ============================================================
-- STORAGE: Bucket para documentos generados
-- ============================================================
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT DO NOTHING;

-- Policy: solo usuarios autenticados de la misma org
CREATE POLICY "Users can access own org documents"
  ON storage.objects FOR ALL
  USING (
    bucket_id = 'documents'
    AND auth.role() = 'authenticated'
  );

-- ============================================================
-- TRIGGER: auto-actualizar updated_at
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_updated_at_organizations
  BEFORE UPDATE ON organizations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_users
  BEFORE UPDATE ON users
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_ai_systems
  BEFORE UPDATE ON ai_systems
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_documents
  BEFORE UPDATE ON documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER set_updated_at_whitelabel_config
  BEFORE UPDATE ON whitelabel_config
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
