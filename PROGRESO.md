# Audlex — Estado del Proyecto y Progreso

> Última actualización: 25 de febrero de 2026
> Autor del desarrollo: Amira Mandi

---

## 🎯 Objetivo del Proyecto

**Audlex** es una plataforma SaaS que permite a empresas españolas y europeas cumplir con el **Reglamento Europeo de Inteligencia Artificial (EU AI Act - Reglamento UE 2024/1689)**.

### Propuesta de valor
- **Target principal**: Consultorías, asesorías y PYMEs en España
- **Problema que resuelve**: El EU AI Act entra en vigor el 2 de agosto de 2026 con multas de hasta 35M€. Las empresas no saben si les aplica ni cómo cumplir.
- **Solución**: Plataforma self-service que guía paso a paso: inventariar sistemas IA → clasificar riesgo → generar documentación → monitorizar compliance.

### Diferenciadores vs competencia
- 100% en español, adaptado al mercado español (CIF/NIF, sectores CNAE)
- Precio accesible vs competidores (Holistic AI ~$50K/año, Credo AI ~$100K/año)
- Modelo consultora con white-label (único en el mercado español)
- Basado en el texto literal del reglamento + guías de AESIA

---

## 🛠️ Stack Tecnológico

| Capa | Tecnología |
|------|-----------|
| Framework | Next.js 15 (App Router, React 19, TypeScript) |
| Estilos | Tailwind CSS v4 (usa `@theme` en globals.css) |
| Base de datos | PostgreSQL vía Supabase |
| ORM | Drizzle ORM |
| Autenticación | Supabase Auth (Email + Google OAuth) |
| Pagos | Stripe (Checkout, Portal, Webhooks) |
| Email | Resend |
| Charts | Recharts |
| Docs | @react-pdf/renderer, docx |
| Estado | Zustand, React Query |
| Forms | react-hook-form + Zod |
| UI | lucide-react (iconos), class-variance-authority, sonner (toasts) |
| Deploy | Vercel (target) |

---

## ✅ Lo que está HECHO (implementado y funcional)

### 1. Landing Page / Marketing
- **Página principal completa** con hero, funcionalidades, pasos, precios, sección consultoras, CTA final
- **Responsive** y con diseño profesional
- **SEO** con metadata

### 2. Autenticación
- **Registro** con email/contraseña (`/registro`)
- **Login** con email/contraseña (`/login`)
- **Google OAuth** (configurado en código, requiere credenciales de Google Cloud)
- **Middleware** de protección de rutas (`/dashboard/*` requiere auth)
- **Callback y signout** endpoints (`/api/auth/callback`, `/api/auth/signout`)
- **Auto-creación** de organización y usuario en DB al registrarse (server action)

### 3. Base de Datos (Supabase PostgreSQL)
- **9 tablas**: organizations, users, ai_systems, risk_assessments, documents, compliance_items, alerts, audit_log, whitelabel_config, consultora_clients
- **12 enums**: org_size, plan, user_role, ai_system_status, risk_level, document_type (13 tipos), document_status, compliance_status, alert_type, alert_severity
- **RLS (Row Level Security)**: Policies para multi-tenancy (cada org ve solo sus datos)
- **Triggers**: auto-update de `updated_at`
- **Storage bucket**: para documentos generados
- **Schema SQL**: `supabase/full-schema.sql` (ejecutado exitosamente)

### 4. Dashboard Layout
- **Sidebar** con navegación: Dashboard, Inventario IA, Clasificador, Documentación, Checklist, Informes
- **Contador regresivo** hasta el 2 de agosto de 2026
- **Header** con breadcrumb, dropdown de alertas/notificaciones, avatar de usuario, theme toggle
- **Mobile responsive**: hamburger menu + drawer slide-out con animación (client component `MobileSidebar`)
- **Active route highlighting** en mobile sidebar con `usePathname()`

### 5. Dashboard Principal (`/dashboard`)
- **KPI Cards** con datos reales de la DB: sistemas IA, score compliance, documentos, días restantes
- **Acciones rápidas**: añadir sistema, clasificar riesgo, generar documentación
- **Estado vacío** de bienvenida para nuevos usuarios (el que ves en la captura)
- **Server Component** que llama a `getDashboardStats()`

### 6. Inventario de Sistemas IA (`/dashboard/inventario`)
- **Listado** de sistemas con tabla: nombre, categoría, riesgo, estado, acciones
- **Estado vacío** con grid de sistemas comunes para registrar rápidamente
- **Formulario de creación** (`/dashboard/inventario/nuevo`) con wizard de 3 pasos:
  - Paso 1: Datos básicos (nombre, descripción, proveedor, modelo, categoría, propósito)
  - Paso 2: Datos y alcance (tipos de datos, personas afectadas, volumen)
  - Paso 3: Detalles técnicos (decisiones autónomas, supervisión humana, fecha, estado)
- **Eliminación** de sistemas con confirmación
- **Badges** de riesgo y estado

### 7. Clasificador de Riesgo (`/dashboard/clasificador`)
- **Motor de clasificación completo** (`src/lib/ai-act/classifier.ts`, 777 líneas):
  - 25 preguntas organizadas en 5 bloques temáticos
  - Clasificación determinista basada en el texto del reglamento
  - Detección de sistemas prohibidos (Art. 5)
  - Generación automática de obligaciones con artículos, plazos y prioridades
- **UI interactiva** con progreso visual, respuestas Sí/No
- **Preguntas adaptativas** (se muestran según respuestas anteriores)
- **Resultado visual** con nivel de riesgo, artículos aplicables, obligaciones
- **Persistencia** en DB vía `runClassification()` server action
- **Enlace** directo a documentación tras clasificar

### 8. Documentación (`/dashboard/documentacion`)
- **Motor de generación** (`src/lib/documents/generators.ts`, ~700 líneas) con 10 tipos de documentos:
  1. Evaluación de Impacto (FRIA) — Art. 27
  2. Sistema de Gestión de Riesgos — Art. 9
  3. Ficha Técnica — Art. 11 + Anexo IV
  4. Declaración de Conformidad UE — Art. 47
  5. Protocolo de Supervisión Humana — Art. 14
  6. Aviso de Transparencia — Art. 50
  7. Plan de Gobernanza de Datos — Art. 10
  8. Plan de Monitorización Post-Mercado — Art. 72
  9. Política de Uso de IA — Organizacional
  10. Inventario de Sistemas IA — Art. 4
- **UI con pestañas**: "Generar documentos" / "Mis documentos"
- **Selector de sistema**, grid de plantillas con icons, badges de riesgo requerido, tiempo estimado
- **Preview modal** con contenido markdown
- **Descarga** como archivo .md
- **Gestión de estado**: borrador, revisión, aprobado, expirado

### 9. Checklist de Compliance (`/dashboard/checklist`)
- **Generación automática** de requisitos basados en la clasificación del sistema
- **Agrupación por categoría** (gestión de riesgos, transparencia, etc.)
- **Secciones colapsables** con progreso por categoría
- **Filtro** por estado: todos, pendientes, en progreso, completados
- **Cambio de estado** con dropdown y click-to-toggle
- **Barra de progreso** global con porcentaje
- **Upload de evidencia**: botón de Paperclip por ítem, subida a Supabase Storage (PDF, DOCX, PNG, JPG, TXT, max 10MB)
- **Badge de evidencia**: indicador verde "Evidencia adjunta" cuando un ítem tiene documento

### 10. Informes (`/dashboard/informes`)
- **5 KPI cards**: sistemas, clasificados, compliance%, documentos, días restantes
- **PieChart donut** de distribución de riesgo con colores semánticos
- **PieChart** de estado de compliance
- **BarChart horizontal** de compliance por sistema
- **BarChart vertical** de documentos por tipo
- **Exportar informe** como markdown
- **Banner de alerta** cuando quedan < 180 días

### 11. Configuración (`/dashboard/configuracion`)
- **4 pestañas**: Organización, Plan/Facturación, Equipo, Seguridad
- **Formulario de organización**: nombre, CIF/NIF, sector (15 opciones), tamaño, web
- **Plan actual** con info de límites (sistemas, usuarios)
- **Botón de upgrade** y portal de facturación Stripe (conectado a `/api/checkout` y `/api/portal`)
- **Pestaña Equipo**: invitar miembros por email con selector de rol, lista de miembros con avatar/nombre/email/rol, cambiar rol, eliminar miembro, badge de propietario con Crown
- **Seguridad**: cambio de contraseña, sesiones activas, registro de actividad
- **Zona peligrosa**: eliminar cuenta

### 12. Sistema de Alertas/Notificaciones
- **Dropdown en header** con conteo de no leídas
- **Lista de alertas** con iconos por severidad (info, warning, error, success)
- **Marcar como leída** individual y "marcar todas leídas"
- **Tiempo relativo** ("hace 5m", "hace 2h", "hace 1d")

### 13. Stripe (Pagos)
- **Librería Stripe** (`src/lib/stripe/index.ts`) con definición de 4 planes
- **Checkout endpoint** (`/api/checkout`) — crea sesiones de pago
- **Portal endpoint** (`/api/portal`) — gestión de suscripción
- **Webhook** (`/api/webhooks/stripe`) — procesa eventos: checkout.completed, subscription.updated, subscription.deleted
- **Actualización automática** de plan en DB tras pago

### 14. Email (Resend)
- **5 plantillas** HTML con diseño branded:
  1. Welcome — al registrarse
  2. Clasificación completada — con nivel de riesgo y obligaciones
  3. Documento generado — con enlace a documentación
  4. Recordatorio de deadline — con sistemas y documentos pendientes
  5. Alerta genérica — con severidad
- **Layout base** responsive con header, contenido, footer

### 15. Componentes UI Reutilizables
- `Button` — variantes, tamaños, estado loading (CVA)
- `Input` — con label, error, hint
- `Textarea` — mismo patrón
- `Select` — con ChevronDown, opciones
- `Card` — Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter
- `Badge` — variantes + RiskBadge + StatusBadge helpers
- `Modal` — backdrop, escape, scroll lock, tamaños
- `ProgressBar` — colores, tamaños, label opcional
- `Tabs` — con iconos y contadores
- `Feedback` — EmptyState, Alert, LoadingSpinner

### 16. Server Actions (`src/app/actions.ts`)
- getCurrentUser(), getCurrentOrganization(), updateOrganization()
- getAiSystems(), createAiSystem(), deleteAiSystem()
- runClassification(), getLatestAssessment(), getAssessments()
- generateAndSaveDocument(), getDocuments(), updateDocumentStatus(), deleteDocument()
- generateComplianceItems(), getComplianceItems(), updateComplianceItemStatus()
- getDashboardStats()
- getAlerts(), markAlertRead(), createAlert()
- getTeamMembers(), inviteTeamMember(), updateTeamMemberRole(), removeTeamMember()
- logAction() — audit log automático
- **RBAC**: todas las acciones de escritura protegidas con `assertPermission()`

### 17. Páginas Legales (`/legal/*`)
- **Política de Privacidad** (`/legal/privacidad`): 11 secciones RGPD completas (responsable, datos, base legal, finalidades, destinatarios, transferencias, conservación, derechos, seguridad, autoridad, cambios)
- **Política de Cookies** (`/legal/cookies`): tablas de cookies esenciales, de preferencia y de terceros (Stripe, Supabase)
- **Términos y Condiciones** (`/legal/terminos`): condiciones de uso del servicio
- **Layout compartido** con navegación entre páginas legales y footer

### 18. Banner de Consentimiento de Cookies
- **RGPD-compliant**: dos botones — "Aceptar todas" / "Solo necesarias"
- **Persistencia**: guarda en `localStorage` y cookie
- **Aparición diferida**: se muestra tras 1 segundo
- **Componente**: `src/components/ui/cookie-banner.tsx`, integrado en `layout.tsx` raíz

### 19. Sección de Seguridad en Landing Page
- **4 tarjetas**: Cifrado end-to-end, Servidores en la UE, Cumplimiento RGPD, Log de auditoría
- **Iconos**: Lock, Server, ShieldCheck, Eye
- Posicionada entre Features y Pricing

### 20. Internacionalización (i18n)
- **Sistema de diccionarios**: `src/lib/i18n/translations.ts` con tipo `Locale = "es" | "en"`
- **Función `t(locale, key)`** con soporte para placeholders `{variable}`
- **Language Switcher**: componente dropdown con icono Globe, persiste en `localStorage`
- **Landing page** completamente traducible (ES/EN): hero, nav, features, pricing, CTAs
- **Arquitectura**: Landing es client component (`landing-page.tsx`) envuelto en server wrapper (`page.tsx`) para metadata SSR

### 21. Modo Demo (`/demo`)
- **5 preguntas interactivas** sin necesidad de registro: categoría, autonomía, personas afectadas, dominio, datos
- **Clasificador simplificado inline** (`classifyDemo()`) — no requiere base de datos
- **Resultado visual**: nivel de riesgo con color, score/100, razones, obligaciones aplicables
- **CTA**: enlace a registro tras ver resultado
- **Enlace desde landing**: botón "Probar demo" en hero y nav

### 22. Página Sobre Nosotros (`/sobre-nosotros`)
- **Misión y Visión** con tarjetas
- **4 valores**: Rigor técnico, Accesibilidad, Privacidad, Impacto europeo
- **Sección "¿Por qué Audlex?"** con gradiente
- **Contacto**: hola@Audlex.es
- **Enlace desde landing nav**

### 23. Sistema RBAC (Control de Acceso por Roles)
- **Módulo**: `src/lib/rbac.ts`
- **Jerarquía de roles**: owner > admin > member > viewer
- **18 permisos** organizados por categoría (read, create, update, delete, manage)
- **Funciones**: `hasMinRole()`, `hasPermission()`, `assertPermission()`
- **Integrado** en server actions: createAiSystem, deleteAiSystem, updateOrganization, deleteDocument, inviteTeamMember, etc.

### 24. Gestión de Equipo e Invitaciones
- **Server actions**: getTeamMembers(), inviteTeamMember(), updateTeamMemberRole(), removeTeamMember()
- **Validaciones**: límite de usuarios según plan, no puede eliminar al owner, RBAC enforced
- **Email de invitación** al invitar nuevo miembro
- **Audit log** automático en cada acción de equipo
- **UI en Configuración**: pestaña "Equipo" completa

### 25. Cron de Recordatorios de Deadline
- **Endpoint**: `/api/cron/reminders` (GET con auth `CRON_SECRET`)
- **Lógica**: busca compliance items pendientes con fecha próxima (< 30 días), agrupa por organización, crea alertas, envía emails a owners/admins
- **Configurado en Vercel**: `vercel.json` con cron semanal (lunes 9:00 AM)

### 26. Exportación PDF/DOCX
- **Endpoint**: `/api/documents/export` (POST)
- **PDF**: generación con `@react-pdf/renderer`
- **DOCX**: generación con librería `docx`
- **Integrado** en la UI de documentación

### 27. User Provisioning
- **Endpoint**: `/api/auth/provision` — auto-crea organización y usuario en DB al registrarse
- **Flujo**: register → Supabase Auth → callback → provision → redirect to dashboard

### 28. Audit Log
- **Función `logAction()`** integrada en todas las server actions de escritura
- **Registra**: userId, organizationId, action, entityType, entityId, details, timestamp
- **Acciones trackeadas**: user.invited, user.removed, user.role_changed, system.created, system.deleted, document.generated, etc.

---

## ⚠️ Lo que FALTA por hacer

### Prioridad ALTA (necesario para producción)

1. **Variables de entorno de producción** — Configurar Stripe keys reales, Resend API key, dominio propio
2. **Validación Zod en formularios** — El formulario de creación de sistemas no valida con schema Zod
3. **Página de detalle de sistema IA** (`/dashboard/inventario/[id]`) — Ver/editar sistema, ver clasificación, documentos y checklist asociados
4. **Reset password UI** — Flujo de "olvidé mi contraseña"
5. **Onboarding guiado** — Wizard post-registro: "1. Datos de tu empresa → 2. Añade tu primer sistema → 3. Clasifica"

### Prioridad MEDIA (para diferenciarse)

6. **Tests** — No hay tests unitarios ni E2E:
   - Tests del clasificador (jest)
   - Tests de server actions
   - Tests E2E con Playwright
7. **Audit Log UI** — Página para visualizar la tabla `audit_log` (los datos se escriben pero no hay interfaz)
8. **Dashboard de consultora** — Multi-cliente con tabla `consultora_clients` (tabla existe, falta UI)
9. **Sistema de búsqueda/filtro avanzado** — En inventario, documentos, checklist
10. **Breadcrumbs dinámicos** — El header muestra "Dashboard" fijo, debería cambiar según la página

### Prioridad BAJA (nice-to-have)

11. **White-label completo** — La tabla `whitelabel_config` existe, falta aplicar colores/logo dinámicamente
12. **API pública REST** — Para integraciones enterprise
13. **SSO / SAML** — Para enterprise
14. **i18n ampliado** — Extender traducciones al dashboard (actualmente solo landing en EN), añadir portugués
15. **PWA / notificaciones push**
16. **Rate limiting** en API routes

---

## 🗄️ Estructura de Archivos Clave

```
src/
├── app/
│   ├── actions.ts                          # Server actions (CRUD + equipo + RBAC)
│   ├── globals.css                         # Tailwind v4 con @theme tokens
│   ├── layout.tsx                          # Root layout + CookieBanner
│   ├── page.tsx                            # Landing page wrapper (SSR metadata)
│   ├── api/
│   │   ├── auth/callback/route.ts          # Supabase auth callback
│   │   ├── auth/provision/route.ts         # User provisioning (auto-crear org+user)
│   │   ├── auth/signout/route.ts           # Logout
│   │   ├── checkout/route.ts               # Stripe checkout session
│   │   ├── portal/route.ts                 # Stripe billing portal
│   │   ├── documents/export/route.ts       # Exportación PDF/DOCX
│   │   ├── evidence/route.ts               # Upload de evidencia a Supabase Storage
│   │   ├── cron/reminders/route.ts         # Cron semanal de recordatorios
│   │   └── webhooks/stripe/route.ts        # Stripe webhook handler
│   ├── auth/login/page.tsx                 # Login page
│   ├── auth/registro/page.tsx              # Register page
│   ├── dashboard/
│   │   ├── layout.tsx                      # Dashboard layout (sidebar + header + MobileSidebar)
│   │   ├── page.tsx                        # Dashboard principal (KPIs)
│   │   ├── inventario/page.tsx             # Lista de sistemas IA
│   │   ├── inventario/nuevo/page.tsx       # Formulario nuevo sistema
│   │   ├── clasificador/page.tsx           # Clasificador de riesgo
│   │   ├── documentacion/page.tsx          # Generador de documentos
│   │   ├── checklist/page.tsx              # Checklist de compliance + evidence upload
│   │   ├── informes/page.tsx               # Informes con gráficos
│   │   └── configuracion/page.tsx          # Ajustes (org, plan, equipo, seguridad)
│   ├── demo/page.tsx                       # Demo clasificador sin registro
│   ├── legal/
│   │   ├── layout.tsx                      # Layout compartido legal
│   │   ├── privacidad/page.tsx             # Política de privacidad RGPD
│   │   ├── cookies/page.tsx                # Política de cookies
│   │   └── terminos/page.tsx               # Términos y condiciones
│   └── sobre-nosotros/page.tsx             # Página "Sobre nosotros"
├── components/
│   ├── ui/
│   │   ├── button.tsx, input.tsx, card.tsx  # Componentes base (CVA)
│   │   ├── badge.tsx, modal.tsx, tabs.tsx   # UI avanzada
│   │   ├── progress-bar.tsx, feedback.tsx   # Indicadores
│   │   ├── theme-toggle.tsx                # Toggle dark/light mode
│   │   ├── cookie-banner.tsx               # Banner RGPD de cookies
│   │   └── language-switcher.tsx           # Selector ES/EN con Globe
│   ├── marketing/
│   │   └── landing-page.tsx                # Landing completa (client component, i18n)
│   ├── dashboard/
│   │   ├── alerts-dropdown.tsx             # Notificaciones
│   │   ├── delete-system-button.tsx        # Botón eliminar sistema
│   │   └── mobile-sidebar.tsx              # Sidebar móvil (drawer animado)
│   └── forms/
│       └── ai-system-form.tsx              # Wizard 3 pasos crear sistema
├── lib/
│   ├── utils.ts                            # cn(), formatDate(), daysUntilDeadline()
│   ├── rbac.ts                             # RBAC: roles, permisos, assertPermission()
│   ├── ai-act/classifier.ts               # Motor de clasificación (777 líneas)
│   ├── i18n/translations.ts               # Diccionario ES/EN + función t()
│   ├── db/
│   │   ├── index.ts                        # Conexión Drizzle
│   │   └── schema.ts                       # Schema completo (347 líneas)
│   ├── documents/generators.ts             # 10 generadores de documentos (~700 líneas)
│   ├── email/index.ts                      # 5 plantillas Resend
│   ├── stripe/index.ts                     # Stripe lazy client + plans + checkout/portal
│   └── supabase/
│       ├── client.ts                       # Browser client
│       ├── middleware.ts                   # Session refresh
│       └── server.ts                       # Server + Admin clients
├── middleware.ts                           # Route protection
└── types/                                  # TypeScript types

vercel.json                                 # Cron config (reminders cada lunes 9:00)
```

---

## 🔧 Variables de Entorno (.env.local)

```env
# Supabase (✅ configurado)
NEXT_PUBLIC_SUPABASE_URL=https://rweuktcvajjambvecioy.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbG...
SUPABASE_SERVICE_ROLE_KEY=eyJhbG...
DATABASE_URL=postgresql://postgres.rweuktcvajjambvecioy:***@aws-1-eu-west-1.pooler.supabase.com:5432/postgres

# Stripe (❌ pendiente de configurar)
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
STRIPE_PRICE_STARTER=
STRIPE_PRICE_BUSINESS=
STRIPE_PRICE_ENTERPRISE=
STRIPE_PRICE_CONSULTORA=

# Resend (❌ pendiente de configurar)
RESEND_API_KEY=

# App
NEXT_PUBLIC_APP_URL=http://localhost:3001
```

---

## 💰 Análisis de Precios

### Precios actuales en la landing (puestos por el README original):

| Plan | Precio | Target | Límites |
|------|--------|--------|---------|
| **Free** | 0€ | Probar | 1 sistema, clasificación básica |
| **Starter** | 99€/mes | Autónomos, micro | 5 sistemas, 2 usuarios, docs completos |
| **Business** | 299€/mes | PYMEs | 25 sistemas, 5 usuarios, alertas, dashboard |
| **Enterprise** | 799€/mes | Grandes empresas | Ilimitado, API, SSO, soporte prioritario |
| **Consultora** | 499€/mes + 30€/cliente | Consultorías | Multi-cliente, white-label |

### ¿Son razonables? — MI ANÁLISIS:

**Para el mercado español, los precios son DEMASIADO ALTOS** para la fase actual. Recomiendo:

#### Precios recomendados para lanzamiento:

| Plan | Precio actual | Precio recomendado | Justificación |
|------|--------------|-------------------|--------------|
| Free | 0€ | 0€ ✅ | Perfecto para captación |
| Starter | 99€/mes | **49€/mes** | Una PYME española no paga 99€/mes por una herramienta que no conoce. A 49€ la barrera de entrada es baja. |
| Business | 299€/mes | **149€/mes** | Sigue siendo competitivo vs contratar un consultor (2.000-5.000€). |
| Enterprise | 799€/mes | **399€/mes** | Las empresas grandes negocian siempre. Mejor precio base bajo y upsell. |
| Consultora | 499€+30/cliente | **299€/mes + 19€/cliente** | Las consultorías quieren margen. Si cobran 500€/cliente al mes y les cuesta 19€, el margen es brutal → lo adoptan. |

#### Referencia de competidores internacionales:
- **Holistic AI**: ~$50.000/año (solo grandes empresas)
- **Credo AI**: ~$100.000/año (enterprise)
- **TrailMap.ai**: ~$25.000/año
- **Napiera**: consultoría por proyecto (~10.000-30.000€)

#### Estrategia recomendada:
1. **Lanzar con precios bajos** para captar los primeros 50-100 clientes
2. **Ofrecer "early adopter" pricing** con descuento del 50% el primer año
3. **Subir precios** para nuevos clientes cuando tengas tracción y testimonios
4. **El plan Free con 1 sistema** es perfecto como lead magnet — muchas empresas querrán más tras probar
5. **El plan Consultora es el más rentable** — una consultora con 20 clientes = 299€ + 380€ = 679€/mes pero cobra 10.000€/mes a sus clientes

#### Nota importante sobre los precios en el código:
Los precios en la landing page están hardcodeados en el componente de marketing. Los precios de Stripe se configuran en el dashboard de Stripe y se mapean con los `STRIPE_PRICE_*` env vars. Puedes cambiar los precios que quieras sin tocar código — solo la landing y Stripe.

---

## 🚀 Cómo ejecutar el proyecto

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Rellenar con tus credenciales de Supabase, Stripe y Resend

# 3. Crear tablas en Supabase
# Copiar contenido de supabase/full-schema.sql en SQL Editor de Supabase → Run

# 4. Ejecutar en desarrollo
npm run dev
# → http://localhost:3000

# 5. Build de producción
npm run build

# 6. Deploy en Vercel
vercel deploy
```

---

## 📊 Estimación de Completitud (actualizado 25 feb 2026)

| Área | Completitud | Notas |
|------|------------|-------|
| Landing/Marketing | 100% | Hero, features, pricing, security, i18n ES/EN, demo link |
| Páginas legales | 100% | Privacidad, cookies, términos |
| Sobre nosotros | 100% | Misión, visión, valores, contacto |
| Cookie banner RGPD | 100% | Aceptar/rechazar, persistencia |
| Auth | 100% | Login, registro, reset-password, update-password, verify-email |
| Base de datos | 95% | Schema + RLS + triggers. Faltan tablas para integraciones |
| Inventario IA | 100% | CRUD completo + detalle + edición + gráficas |
| Clasificador | 100% | 24 preguntas, 4 niveles riesgo, bilingüe |
| Demo classifier | 100% | 5 preguntas, sin auth |
| Documentación | 100% | Generación 10 tipos + exportación PDF/DOCX + gráficas |
| Checklist | 100% | Upload evidencia, filtros, gráficas de progreso |
| Informes | 100% | Recharts completo con 4 gráficos |
| Dashboard | 100% | KPIs, alertas, actividad reciente, 4 gráficos Recharts |
| Configuración | 95% | Org, plan, equipo, seguridad. Falta UI integraciones |
| Alertas | 85% | Dropdown + cron. Falta UI de preferencias de notificación |
| Pagos (Stripe) | 90% | Checkout, portal, webhook. Faltan annual price IDs en env validation |
| Email (Resend) | 100% | 5 plantillas + 7 tipos notificación bilingüe |
| Integraciones | 60% | Jira/Slack/Teams CONSTRUIDAS pero NO CONECTADAS a la UI |
| PDF Export (jsPDF) | 60% | Servicio construido pero no wired (se usa HTML-to-print) |
| RBAC | 100% | 4 roles, 20 permisos, enforced en actions |
| Team management | 100% | Invitar, cambiar rol, eliminar |
| i18n | 95% | ES/EN completo en landing + dashboard. 2,960+ claves |
| Mobile responsive | 100% | Sidebar drawer con hamburger |
| Cron/Reminders | 100% | Vercel cron semanal |
| Audit log | 100% | Escritura + UI de visualización |
| Dark mode | 100% | Toggle con localStorage |
| Blog | 100% | 3 artículos, rutas dinámicas [slug] |
| Trust center | 100% | Seguridad, compliance, procesamiento datos |
| SEO | 100% | robots.ts, sitemap.ts, Open Graph, Twitter cards |
| Tests | 20% | 3 test files (classifier, env, types). Falta E2E/integration |
| **TOTAL ESTIMADO** | **~93%** | Listo para beta. Integraciones desconectadas bajan el % |

---

## 🔍 AUDITORÍA COMPLETA — 25 febrero 2026

### Inventario de archivos del proyecto

**Código fuente (`src/`):**
| Directorio | Archivos | Líneas aprox. | Estado |
|-----------|----------|--------------|--------|
| `app/actions.ts` | 1 | 1,418 | ✅ Monolito — candidato a refactorizar |
| `app/dashboard/` | 14 páginas + 4 layouts | ~4,500 | ✅ Todas funcionales |
| `app/api/` | 14 rutas | ~1,800 | ✅ 12 funcionales, 2 carpetas vacías |
| `app/auth/` | 5 páginas | ~600 | ✅ Completo |
| `app/` (público) | blog, demo, legal, trust, sobre-nosotros | ~2,000 | ✅ |
| `components/dashboard/` | 11 componentes | ~2,500 | ✅ |
| `components/ui/` | 14 componentes | ~1,200 | ✅ |
| `components/marketing/` | 5 componentes | ~1,500 | ✅ |
| `lib/` | 15 archivos de servicios | ~5,500 | ⚠️ Ver problemas abajo |
| `types/` | 1 archivo | 120 | ✅ |
| `__tests__/` | 3 test files | 413 | ⚠️ Cobertura baja |
| **TOTAL** | **~80 archivos** | **~21,500 líneas** | |

### 🔴 Problemas CRÍTICOS (bloquean producción)

| # | Problema | Archivo | Impacto |
|---|---------|---------|---------|
| 1 | **Rate limiter en memoria** — usa `Map` + `setInterval` en middleware. En Vercel serverless cada invocación tiene su propia memoria, así que el rate limiting NO funciona. | `src/middleware.ts` | 🔴 Seguridad: sin rate limiting real en producción |
| 2 | **Newsletter sin persistencia** — `console.log` como almacenamiento. Los suscriptores se pierden. | `src/app/api/newsletter/route.ts` | 🔴 Pérdida de leads |

### ⚠️ Problemas IMPORTANTES (no bloquean pero deben resolverse)

| # | Problema | Archivo(s) | Solución propuesta |
|---|---------|-----------|-------------------|
| 1 | **actions.ts monolito** (1,418 líneas, 40+ funciones) | `src/app/actions.ts` | Dividir en módulos: systems-actions.ts, documents-actions.ts, compliance-actions.ts, team-actions.ts |
| 2 | **Integraciones construidas pero no conectadas** — Jira, Slack, Teams, notification-service, jsPDF generator. ~1,500 líneas sin importar en ningún sitio. | `src/lib/integrations/`, `src/lib/notifications/`, `src/lib/pdf/` | Crear UI de configuración en `/dashboard/configuracion` o eliminar hasta que se necesiten |
| 3 | **Precio anual Stripe sin validar** — `STRIPE_PRICE_*_ANNUAL` usados con `!` (non-null assertion) pero no en schema de validación de env.ts | `src/lib/stripe/index.ts`, `src/lib/env.ts` | Añadir al schema Zod |
| 4 | **Fecha "2026-08-02" hardcodeada** en 8 archivos distintos | Múltiples | Extraer a constante en utils.ts y referenciar desde ahí |
| 5 | **Soporte sin persistencia** — tickets solo se envían por email + console.log, si falla el email se pierden | `src/app/api/support/route.ts` | Crear tabla `support_tickets` o integrar con helpdesk |
| 6 | **Evidence upload fallback** — si el bucket de Supabase Storage no existe, guarda URL `evidence://` falsa | `src/app/api/evidence/route.ts` | Crear bucket automáticamente o fallar gracefully |
| 7 | **`@react-pdf/renderer` sin usar** — está en package.json pero nunca se importa (se usa jsPDF/HTML-to-print) | `package.json` | Eliminar dependencia |
| 8 | **Carpetas vacías** | `src/app/marketing/`, `src/app/api/ai-systems/`, `src/app/api/assessments/` | Eliminar |

### 🟢 Lo que está BIEN

| Aspecto | Detalle |
|---------|---------|
| **TypeScript estricto** | 0 errores de compilación. `strict: true` en tsconfig |
| **Validación Zod** | Variables de entorno validadas al arrancar |
| **RBAC completo** | 4 roles, 20 permisos, enforced en todas las server actions |
| **Audit log** | Todas las acciones de escritura generan log inmutable |
| **i18n bilingüe** | ~2,960 claves ES/EN cubriendo toda la UI |
| **SEO** | robots.ts, sitemap.ts, Open Graph meta, Twitter cards |
| **RGPD** | Cookie banner, política de privacidad, términos |
| **Security headers** | CSP, HSTS, X-Frame-Options, X-Content-Type-Options |
| **Schema robusto** | 10 tablas, 10 enums, relaciones con FK, cascading deletes, JSONB para datos flexibles |
| **Exports** | PDF (HTML-to-print) + DOCX funcionales |

### 📋 Tablas DB que FALTAN (para features construidas)

| Tabla propuesta | Propósito | Prioridad |
|----------------|----------|-----------|
| `integration_configs` | Guardar tokens/webhooks de Jira, Slack, Teams por organización | Media |
| `notification_preferences` | Preferencias de notificación por usuario (qué recibir, frecuencia) | Media |
| `newsletter_subscribers` | Persistir emails de suscriptores del newsletter | Alta |
| `support_tickets` | Tracking de tickets de soporte | Baja |

### 🧪 Tests existentes

| Test | Cobertura | Estado |
|------|-----------|--------|
| `classifier.test.ts` | Motor de clasificación (prohibido, alto, limitado, mínimo) | ✅ 214 líneas |
| `env.test.ts` | Validación de variables de entorno | ✅ 59 líneas |
| `types.test.ts` | Validación compile-time de tipos | ✅ 140 líneas |
| Server actions | — | ❌ Sin tests |
| API routes | — | ❌ Sin tests |
| Componentes React | — | ❌ Sin tests |
| E2E | — | ❌ Sin tests |

---

## 🔐 AUDITORÍA DE SEGURIDAD — API Keys

### Estado actual de secretos

| Archivo | Contiene secretos | ¿Está en .gitignore? | Estado |
|---------|-------------------|---------------------|--------|
| `.env.local` | ✅ Supabase keys, Stripe keys, webhook secret, DB URL | ✅ SÍ (`.env*.local`) | ✅ SEGURO |
| `.env.example` | ❌ Solo placeholders (`xxx`, `your-secret-here`) | N/A (se debe subir) | ✅ SEGURO |
| Código fuente (*.ts) | ❌ Solo `process.env.*` | N/A | ✅ SEGURO |
| Markdown docs | ❌ Solo ejemplos genéricos (`sk_live_xxx`) | N/A | ✅ SEGURO |

### Secretos en `.env.local` (NO se subirán)
- `DATABASE_URL` — URL de PostgreSQL con password
- `NEXT_PUBLIC_SUPABASE_URL` — URL pública de Supabase (no es secreto, es público)
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Anon key (público por diseño, RLS protege los datos)
- `SUPABASE_SERVICE_ROLE_KEY` — 🔴 **SECRETO CRÍTICO** - acceso admin sin RLS
- `STRIPE_SECRET_KEY` — 🔴 **SECRETO CRÍTICO** - modo test actual (`sk_test_...`)
- `STRIPE_WEBHOOK_SECRET` — 🔴 **SECRETO** - verificación de webhooks
- `STRIPE_PRICE_*` — IDs de precios (no son secretos per se)
- `RESEND_API_KEY` — 🟡 No presente aún en .env.local
- `CRON_SECRET` — 🟡 No presente aún en .env.local

### Verificación de `.gitignore`
```
✅ .env           → ignorado
✅ .env*.local    → ignorado (cubre .env.local, .env.development.local, etc.)
✅ node_modules/  → ignorado
✅ .next/         → ignorado
✅ /build         → ignorado
✅ *.pem          → ignorado
✅ .vercel        → ignorado
```

### ⚡ VEREDICTO: Las API keys están SEGURAS para subir a GitHub/GitLab.
No hay ningún secreto hardcodeado en el código fuente. `.env.local` está correctamente en `.gitignore`.

---

## 📝 Historial de Sesiones

### Sesión 1 — 20 febrero 2026 (Base del proyecto)
1. Análisis del proyecto y READMEs existentes
2. Auditoría de completitud real (~35-40% al inicio)
3. Implementación de componentes UI (8 componentes)
4. Formulario de creación de sistemas IA (wizard 3 pasos)
5. Conexión inventario a datos reales de DB
6. Persistencia de clasificaciones en DB
7. Motor de generación de documentos (10 tipos)
8. Página de documentación con generar/gestionar/preview
9. Todas las server actions (CRUD completo)
10. Página de checklist de compliance
11. Página de informes con recharts (4 gráficos)
12. Página de configuración (3 pestañas)
13. Dashboard con datos reales (reemplazado mockData)
14. Stripe checkout + portal endpoints
15. Sistema de email con Resend (5 plantillas)
16. Dropdown de alertas/notificaciones
17. Configuración de Supabase (credenciales, schema SQL, tablas creadas)
18. Fix de errores de compilación (imports, tipos, JSX duplicado)
19. Resolución de problemas de conexión DB (IPv6 → Session Pooler)

### Sesión 2 — 20 febrero 2026 (Dark mode + Visual polish)
20. Implementación de dark-mode-default con CSS custom properties
21. Modernización del landing page
22. Fix de corrupción UTF-8 causada por PowerShell (7 caracteres reparados)
23. Swap a light-default con opt-in dark mode (tonos zinc suaves)

### Sesión 3 — 21 febrero 2026 (5 gaps críticos)
24. Auditoría técnica: "¿está todo listo?" → identificados 5 gaps críticos
25. **User provisioning** (`/api/auth/provision`): auto-crear org + user en DB al registrarse
26. **Exportación PDF/DOCX** (`/api/documents/export`): endpoint con @react-pdf/renderer y docx
27. **Emails en flujos**: wiring de sendWelcomeEmail, sendClassificationEmail, etc. en server actions
28. **Audit log**: función logAction() integrada en todas las acciones de escritura
29. **Stripe wiring**: botones de checkout y portal conectados a APIs en configuración

### Sesión 4 — 21 febrero 2026 (Análisis competitivo)
30. Análisis competitivo de https://www.audit-ai.ai/es
31. Conclusión: audit-ai.ai hace auditorías ISO, no EU AI Act — complementarios, no competidores
32. Identificación de 11 gaps a implementar vs mejores prácticas del mercado

### Sesión 5 — 22 febrero 2026 (11 features del análisis competitivo)
33. **Páginas legales**: privacidad RGPD completa, política de cookies con tablas, términos y condiciones
34. **Cookie consent banner**: RGPD-compliant con aceptar/rechazar, localStorage + cookie
35. **Sección de seguridad** en landing: 4 tarjetas (cifrado, UE, RGPD, audit log)
36. **Upload de evidencia** en checklist: endpoint API + Supabase Storage + UI con Paperclip
37. **i18n ES/EN**: sistema de diccionarios, language switcher, landing traducible
38. **Modo demo** (`/demo`): clasificador interactivo de 5 preguntas sin registro
39. **Sobre nosotros** (`/sobre-nosotros`): misión, visión, valores, contacto
40. **RBAC**: módulo de roles/permisos, enforced en todas las server actions
41. **Team management**: invitar por email, cambiar rol, eliminar, con límites de plan
42. **Cron de recordatorios**: endpoint + vercel.json semanal lunes 9AM
43. **Mobile sidebar**: hamburger menu + drawer animado con overlay
44. **Build fixes**:
    - JSX `config!.icon` → variable `ConfigIcon` en demo page
    - Next.js 15 `searchParams` Promise type en inventario/nuevo
    - `size` enum type mismatch en updateOrganization
    - Duplicate RBAC property eliminado
    - `sendAlertEmail` parameter names corregidos
    - Supabase cookieHandler implicit `any` types tipados
    - Stripe lazy initialization (`getStripe()`) para evitar errores en build
    - `force-dynamic` en todas las API routes
45. ✅ **Build exitoso**: 21 páginas compiladas sin errores

### Sesión 6 — 23-24 febrero 2026 (Features avanzadas enterprise)
46. **Dashboard completo** con datos reales, 4 gráficos Recharts (risk pie, category bar, docs bar, compliance bar)
47. **Dashboard-content.tsx reescrito** (489 líneas): KPIs dinámicos, actividad reciente, alertas, responsive
48. **Seed de datos de test** (`scripts/seed-test-data.ts`): 5 sistemas IA, 5 evaluaciones, 7 documentos, 10 items, 5 alertas
49. **Email Notification Service** (`src/lib/notifications/email-service.ts`, 333 líneas):
    - 7 tipos: deadline_warning, document_expiring, compliance_overdue, regulation_deadline, team_assignment, compliance_completed, system_classified
    - Templates bilingües ES/EN completos con HTML profesional
50. **Integración Jira** (`src/lib/integrations/jira.ts`, 216 líneas):
    - REST API v3, crear issues desde requisitos, sincronización bidireccional, webhooks
51. **Integración Slack** (`src/lib/integrations/slack.ts`, 302 líneas):
    - Incoming webhooks, Block Kit formatting, 4 tipos de notificación
52. **Integración Teams** (`src/lib/integrations/teams.ts`, 364 líneas):
    - Adaptive Cards v1.4, notificaciones por canal, formato rico
53. **PDF Export Service** (`src/lib/pdf/generator.ts`, 286 líneas):
    - jsPDF con portada, tabla de contenidos, headers/footers, paginación
54. **Gráficas avanzadas multi-vista**:
    - Inventory charts (4 visualizaciones: riesgo pie, timeline, categoría bar, estado pie)
    - Checklist charts (3 viz: timeline completitud, categoría horizontal bar, stats)
    - Document charts (4 viz: timeline generación, tipos bar, estado bar, stat cards)
55. **60+ claves de traducción** añadidas para todas las nuevas features (ES/EN)
56. **Bug fixes compilación**:
    - JSX parsing error en inventory-content.tsx (closing tag extra)
    - System status enum mismatch inventory-charts.tsx ("production" → "active/planned/retired")
    - Category null handling en checklist-charts.tsx (string → string | null)
    - Email template indexing con type assertions
    - 18 claves duplicadas eliminadas en dashboard-translations.ts
57. ✅ **Build exitoso**: 0 errores TypeScript

### Sesión 7 — 25 febrero 2026 (Auditoría completa + preparación repo)
58. **Auditoría técnica completa** del proyecto (este documento)
59. Análisis de seguridad de API keys
60. Preparación para subida a repositorio Git

---

## 🔄 Changelog Técnico (resumen de cambios por archivo)

### Archivos NUEVOS (sesiones 3-5)
| Archivo | Descripción |
|---------|------------|
| `src/app/api/auth/provision/route.ts` | User provisioning endpoint |
| `src/app/api/documents/export/route.ts` | Exportación PDF/DOCX |
| `src/app/api/evidence/route.ts` | Upload evidencia a Supabase Storage |
| `src/app/api/cron/reminders/route.ts` | Cron semanal recordatorios |
| `src/app/demo/page.tsx` | Demo clasificador sin registro |
| `src/app/legal/layout.tsx` | Layout compartido legal |
| `src/app/legal/privacidad/page.tsx` | Política de privacidad |
| `src/app/legal/cookies/page.tsx` | Política de cookies |
| `src/app/legal/terminos/page.tsx` | Términos y condiciones |
| `src/app/sobre-nosotros/page.tsx` | Sobre nosotros |
| `src/components/ui/cookie-banner.tsx` | Banner RGPD cookies |
| `src/components/ui/language-switcher.tsx` | Selector ES/EN |
| `src/components/marketing/landing-page.tsx` | Landing como client component (i18n) |
| `src/components/dashboard/mobile-sidebar.tsx` | Sidebar móvil drawer |
| `src/lib/rbac.ts` | Sistema RBAC (roles, permisos) |
| `src/lib/i18n/translations.ts` | Diccionario i18n ES/EN |
| `vercel.json` | Cron config para Vercel |

### Archivos MODIFICADOS (sesiones 3-5)
| Archivo | Cambios |
|---------|---------|
| `src/app/actions.ts` | +RBAC, +team actions, +logAction, +email wiring |
| `src/app/layout.tsx` | +CookieBanner import |
| `src/app/page.tsx` | Reescrito como wrapper SSR de landing-page.tsx |
| `src/app/dashboard/layout.tsx` | +MobileSidebar import y componente |
| `src/app/dashboard/checklist/page.tsx` | +Evidence upload UI |
| `src/app/dashboard/configuracion/page.tsx` | +Pestaña Equipo, fix size types |
| `src/app/dashboard/inventario/nuevo/page.tsx` | Fix searchParams Promise type (Next 15) |
| `src/app/api/checkout/route.ts` | +force-dynamic |
| `src/app/api/portal/route.ts` | +force-dynamic |
| `src/app/api/webhooks/stripe/route.ts` | Lazy stripe init, getPlanMapping() |
| `src/app/api/auth/signout/route.ts` | +force-dynamic |
| `src/app/api/auth/callback/route.ts` | +force-dynamic |
| `src/lib/stripe/index.ts` | Lazy init `getStripe()` vs module-level |
| `src/lib/supabase/middleware.ts` | Fix implicit any en cookiesToSet |
| `src/lib/supabase/server.ts` | Fix implicit any en cookiesToSet |
