# Audlex — Cumplimiento del EU AI Act

Plataforma SaaS para que PYMEs y consultoras cumplan con el Reglamento Europeo de Inteligencia Artificial (EU AI Act) antes del 2 de agosto de 2026.

## Stack

- **Frontend:** Next.js 15 + TypeScript + Tailwind CSS v4 + shadcn/ui
- **ORM:** Drizzle ORM
- **Backend:** Supabase (PostgreSQL + Auth + Storage)
- **Pagos:** Stripe
- **Email:** Resend
- **Deploy:** Vercel

## Setup rápido

### 1. Clonar e instalar

```bash
git clone <tu-repo>
cd audlex
npm install
```

### 2. Configurar Supabase

1. Crea un proyecto en [supabase.com](https://supabase.com) (región: Frankfurt / EU)
2. Ve a **Settings → API** y copia:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
3. Ve a **Settings → Database** y copia la connection string para `DATABASE_URL`
4. En **Authentication → Providers**, habilita Google OAuth (opcional)
5. En **Authentication → URL Configuration**, añade:
   - Site URL: `http://localhost:3000`
   - Redirect URLs: `http://localhost:3000/api/auth/callback`

### 3. Variables de entorno

```bash
cp .env.example .env.local
# Edita .env.local con tus valores
```

### 4. Crear tablas

```bash
npm run db:push
```

### 5. Configurar RLS y Storage

Abre el **SQL Editor** de Supabase y ejecuta `supabase/setup.sql`.

### 6. Configurar Stripe

**📖 Ver [STRIPE_SETUP.md](STRIPE_SETUP.md) para la guía completa paso a paso**

Resumen rápido:

1. **Crear productos** en [Stripe Dashboard](https://dashboard.stripe.com/products):
   - Starter (€69/mes) → copia el Price ID
   - Business (€199/mes) → copia el Price ID
   - Enterprise (€499/mes) → copia el Price ID
   - Consultora (€349/mes) → copia el Price ID

2. **Configurar webhook** en Developers → Webhooks:
   - URL: `https://tu-dominio.com/api/webhooks/stripe`
   - Eventos: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`

3. **Añadir variables a .env.local**:
   ```env
   NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_xxx
   STRIPE_SECRET_KEY=sk_test_xxx
   STRIPE_WEBHOOK_SECRET=whsec_xxx
   STRIPE_PRICE_STARTER=price_xxx
   STRIPE_PRICE_BUSINESS=price_xxx
   STRIPE_PRICE_ENTERPRISE=price_xxx
   STRIPE_PRICE_CONSULTORA=price_xxx
   ```

4. **Verificar configuración**:
   ```bash
   npm run stripe:verify
   ```

5. **Probar en local** (requiere Stripe CLI):
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2
   npm run stripe:listen
   ```

### 7. Arrancar

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Despliegue en Vercel

1. Push a GitHub
2. Importa el proyecto en [vercel.com](https://vercel.com)
3. Añade las variables de entorno en Settings → Environment Variables
4. Deploy automático

**Importante:** Actualiza las Redirect URLs en Supabase con tu dominio de Vercel:
- `https://audlex.com/api/auth/callback`
- `https://*-tu-proyecto.vercel.app/api/auth/callback`

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   ├── login/page.tsx              # Login
│   ├── registro/page.tsx           # Registro
│   ├── dashboard/
│   │   ├── layout.tsx              # Layout con sidebar
│   │   ├── page.tsx                # Dashboard principal
│   │   ├── inventario/page.tsx     # Inventario de sistemas IA
│   │   ├── clasificador/page.tsx   # Clasificador de riesgo
│   │   ├── documentacion/          # Generador de documentos
│   │   ├── checklist/              # Checklist de compliance
│   │   └── informes/               # Informes y exportación
│   ├── api/
│   │   ├── auth/                   # Auth callbacks
│   │   └── webhooks/stripe/        # Stripe webhooks
│   └── actions.ts                  # Server actions (CRUD)
├── lib/
│   ├── ai-act/
│   │   └── classifier.ts          # ⭐ Motor de clasificación de riesgo
│   ├── db/
│   │   ├── schema.ts              # Schema Drizzle (todas las tablas)
│   │   └── index.ts               # Conexión a DB
│   ├── supabase/
│   │   ├── server.ts              # Cliente Supabase server
│   │   ├── client.ts              # Cliente Supabase browser
│   │   └── middleware.ts          # Middleware auth
│   ├── utils.ts                   # Utilidades generales
│   └── stripe/                    # Stripe helpers
└── middleware.ts                   # Next.js middleware
```

## Roadmap

- [x] Arquitectura y schema
- [x] Landing page
- [x] Auth (email + Google)
- [x] Dashboard layout
- [x] Motor de clasificación de riesgo
- [x] Inventario de sistemas IA
- [x] Cuestionario interactivo
- [ ] Generador de documentos PDF/DOCX
- [ ] Checklist interactivo
- [ ] Dashboard con métricas
- [ ] Integración Stripe completa
- [ ] Alertas y notificaciones
- [ ] White-label para consultoras
- [ ] Blog SEO

## Licencia

Propietario — Todos los derechos reservados.
