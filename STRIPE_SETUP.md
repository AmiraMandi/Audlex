# 💳 Guía Completa de Configuración de Stripe para Audlex

Esta guía te llevará paso a paso por la configuración completa de Stripe para tu aplicación SaaS.

## 📋 Resumen de lo que necesitas

- ✅ Cuenta de Stripe (test o producción)
- ✅ 4 productos configurados (Starter, Business, Enterprise, Consultora)
- ✅ Webhook configurado
- ✅ Variables de entorno actualizadas

---

## 💰 Comisiones de Stripe

Stripe cobra una comisión por cada transacción procesada:

### Tarjetas Europeas
- **1.5% + €0.25** por transacción exitosa
- Aplica a tarjetas emitidas en el Espacio Económico Europeo (EEE)

### Tarjetas No Europeas
- **2.9% + €0.25** por transacción exitosa
- Aplica a tarjetas emitidas fuera del EEE

### Ejemplo de cálculo

Si un cliente paga **€69/mes** (plan Starter) con tarjeta europea:
- Precio: €69.00
- Comisión Stripe: €69 × 1.5% + €0.25 = **€1.29**
- **Recibes: €67.71**

### Pagos recurrentes
- ✅ Los cobros mensuales automáticos **no tienen costos adicionales**
- ✅ Stripe intenta reintentar pagos fallidos automáticamente (sin cargo extra)
- ✅ No hay cuota mensual ni costos setup

### Otros aspectos importantes
- **Sin costos ocultos**: Solo pagas por transacciones exitosas
- **Transferencias bancarias**: Gratis (normalmente 2-7 días hábiles)
- **Disputas**: €15 por disputa/chargeback (se devuelve si ganas)
- **Conversión de moneda**: 2% adicional si cobras en múltiples monedas

### 💸 Cuándo recibes el dinero

Stripe transfiere el dinero a tu cuenta bancaria automáticamente:

- **Primera transferencia**: 7-14 días después del primer pago (verificación inicial)
- **Transferencias regulares**: Cada 2-7 días (configurable en Dashboard)
- **Horario**: Procesa transferencias de lunes a viernes
- **Sin mínimos**: No hay cantidad mínima para transferir

📍 **Configura tu cuenta bancaria**: Dashboard → Settings → Bank accounts and scheduling

📊 **Calculadora**: Para calcular tus ingresos netos, usa la fórmula:
```
Ingresos netos = (Precio × 0.985) - €0.25
```

### 💵 Ingresos netos por plan (tarjetas europeas)

| Plan | Precio | Comisión Stripe | **Recibes** | % Neto |
|------|--------|-----------------|-------------|--------|
| Starter | €69/mes | €1.29 | **€67.71** | 98.1% |
| Business | €199/mes | €3.24 | **€195.76** | 98.4% |
| Enterprise | €499/mes | €7.74 | **€491.26** | 98.5% |
| Consultora | €349/mes | €5.49 | **€343.51** | 98.4% |

⚠️ **Nota**: Con tarjetas no europeas (2.9%), las comisiones son mayores:
- Starter: €2.25 → recibes €66.75
- Business: €6.02 → recibes €192.98

🔗 Más info: [Stripe Pricing - European cards](https://stripe.com/es/pricing)

---

## 🚀 Paso 1: Crear Cuenta en Stripe

1. Ve a [stripe.com](https://stripe.com) y regístrate
2. Completa la verificación de identidad (necesario para producción)
3. Activa el **Modo Test** (toggle arriba a la derecha) para desarrollo

---

## 💰 Paso 2: Crear los 4 Productos

### Producto 1: Starter (€69/mes)

1. Ve a **Products** → **+ Add Product**
2. Rellena:
   - **Name**: `Audlex Starter`
   - **Description**: `Plan para pequeñas empresas - Hasta 5 sistemas de IA`
   - **Image**: (opcional) sube el logo de Audlex
3. En **Pricing**:
   - **Pricing model**: `Recurring` (para suscripciones)
   - **Price**: `69.00 EUR`
   - **Billing period**: `Monthly`
4. Clic en **Save product**
5. **IMPORTANTE**: Copia el **Price ID** (empieza con `price_xxx`)
   - Lo necesitarás para `STRIPE_PRICE_STARTER`

### Producto 2: Business (€199/mes)

1. **+ Add Product**
2. Rellena:
   - **Name**: `Audlex Business`
   - **Description**: `Plan para empresas en crecimiento - Hasta 25 sistemas de IA`
3. **Pricing**:
   - **Pricing model**: `Recurring`
   - **Price**: `199.00 EUR`
   - **Billing period**: `Monthly`
4. **Save** y copia el **Price ID** → `STRIPE_PRICE_BUSINESS`

### Producto 3: Enterprise (€499/mes)

1. **+ Add Product**
2. Rellena:
   - **Name**: `Audlex Enterprise`
   - **Description**: `Plan para grandes empresas - Sistemas ilimitados`
3. **Pricing**:
   - **Pricing model**: `Recurring`
   - **Price**: `499.00 EUR`
   - **Billing period**: `Monthly`
4. **Save** y copia el **Price ID** → `STRIPE_PRICE_ENTERPRISE`

### Producto 4: Consultora (€349/mes)

1. **+ Add Product**
2. Rellena:
   - **Name**: `Audlex Consultora`
   - **Description**: `Plan multi-cliente para consultoras - Clientes ilimitados`
3. **Pricing**:
   - **Pricing model**: `Recurring`
   - **Price**: `349.00 EUR`
   - **Billing period**: `Monthly`
4. **Save** y copia el **Price ID** → `STRIPE_PRICE_CONSULTORA`

---

## 🔔 Paso 3: Configurar Webhook

Los webhooks permiten que Stripe notifique a tu app cuando un pago se completa o una suscripción cambia.

### En Desarrollo (localhost)

1. Instala Stripe CLI:
   ```bash
   # Windows (con Scoop)
   scoop install stripe
   
   # O descarga desde: https://stripe.com/docs/stripe-cli
   ```

2. Autentica:
   ```bash
   stripe login
   ```

3. Escucha eventos en local:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

4. Copia el **webhook signing secret** (empieza con `whsec_xxx`) → `STRIPE_WEBHOOK_SECRET`

### En Producción

1. Ve a **Developers** → **Webhooks** → **+ Add endpoint**
2. **Endpoint URL**: `https://audlex.com/api/webhooks/stripe`
3. **Select events to listen to**:
   - ✓ `checkout.session.completed`
   - ✓ `customer.subscription.updated`
   - ✓ `customer.subscription.deleted`
4. Clic en **Add endpoint**
5. En la página del webhook, revela el **Signing secret** → `STRIPE_WEBHOOK_SECRET`

---

## 🔑 Paso 4: Obtener API Keys

### Modo Test (desarrollo)

1. Ve a **Developers** → **API keys**
2. Copia:
   - **Publishable key** (empieza con `pk_test_xxx`) → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (clic en **Reveal test key**, empieza con `sk_test_xxx`) → `STRIPE_SECRET_KEY`

### Modo Live (producción)

1. Activa el **Live mode** (toggle arriba)
2. Ve a **Developers** → **API keys**
3. Copia:
   - **Publishable key** (`pk_live_xxx`)
   - **Secret key** (`sk_live_xxx`)

⚠️ **IMPORTANTE**: Nunca comitees las claves secretas en Git.

---

## ⚙️ Paso 5: Actualizar Variables de Entorno

Edita tu archivo `.env.local`:

```env
# --- Stripe (Test Mode) ---
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51xxx...
STRIPE_SECRET_KEY=sk_test_51xxx...
STRIPE_WEBHOOK_SECRET=whsec_xxx...

# Price IDs (copiados de cada producto)
STRIPE_PRICE_STARTER=price_1xxx_starter
STRIPE_PRICE_BUSINESS=price_1xxx_business
STRIPE_PRICE_ENTERPRISE=price_1xxx_enterprise
STRIPE_PRICE_CONSULTORA=price_1xxx_consultora
```

**Para producción en Vercel:**

1. Ve a tu proyecto en [vercel.com](https://vercel.com)
2. **Settings** → **Environment Variables**
3. Añade las mismas variables pero con los valores de **Live mode**

---

## ✅ Paso 6: Verificar Configuración

Ejecuta el script de verificación:

```bash
npm run stripe:verify
```

O manualmente:

```bash
node scripts/verify-stripe.js
```

Esto comprobará:
- ✓ Claves de API válidas
- ✓ Los 4 productos existen
- ✓ Webhook configurado correctamente

---

## 🧪 Paso 7: Probar el Flujo Completo

### Tarjetas de prueba de Stripe

Usa estas tarjetas en **Modo Test**:

| Tarjeta | Número | Resultado |
|---------|--------|-----------|
| **Éxito** | `4242 4242 4242 4242` | ✅ Pago exitoso |
| **Rechazada** | `4000 0000 0000 0002` | ❌ Tarjeta rechazada |
| **3D Secure** | `4000 0027 6000 3184` | 🔐 Requiere autenticación |

- **Fecha de expiración**: Cualquier fecha futura (ej: `12/34`)
- **CVC**: Cualquier 3 dígitos (ej: `123`)
- **ZIP**: Cualquier código postal

### Flujo de prueba

1. Arranca tu app local:
   ```bash
   npm run dev
   stripe listen --forward-to localhost:3000/api/webhooks/stripe
   ```

2. Ve a la landing page → **Ver Precios**

3. Selecciona un plan (ej: Starter)

4. Haz clic en **Contratar**

5. En el checkout de Stripe:
   - Email: tu email de prueba
   - Tarjeta: `4242 4242 4242 4242`
   - Expira: `12/34`
   - CVC: `123`

6. Completa el pago

7. Deberías ser redirigido a `/dashboard`

8. Verifica en Stripe Dashboard → **Payments** que el pago aparece

9. Verifica en tu base de datos que la organización tiene:
   - `subscription_status = 'active'`
   - `plan_type = 'starter'`
   - `max_systems = 5`

---

## 🔍 Troubleshooting

### Error: "Invalid API Key"

- Verifica que copiaste la clave completa (sin espacios)
- Asegúrate de usar `sk_test_xxx` en desarrollo
- Revisa que la variable está en `.env.local` (no en `.env.example`)

### Webhook no se dispara

- **Local**: Asegúrate de que `stripe listen` está corriendo
- **Producción**: Verifica que la URL del webhook es correcta y accesible
- Revisa los logs en **Developers → Webhooks → [tu endpoint] → Logs**

### El plan no se asigna correctamente

- Verifica que los **Price IDs** en `.env.local` coinciden con los de Stripe Dashboard
- Revisa los logs del servidor en la consola
- Comprueba que el webhook llegó correctamente: `api/webhooks/stripe` debe loggear el evento

### Error 400 en webhook

- El `STRIPE_WEBHOOK_SECRET` puede estar mal
- Revela el signing secret en Stripe Dashboard y vuelve a copiarlo

---

## 📊 Monitoreo en Producción

### Métricas clave a revisar

1. **Dashboard** → **Overview**:
   - MRR (Monthly Recurring Revenue)
   - Nuevos clientes
   - Churn rate

2. **Payments** → **Failed payments**:
   - Configura reintentos automáticos
   - Añade emails de aviso

3. **Billing** → **Subscriptions**:
   - Monitorea cancelaciones
   - Configura emails de renovación

### Alertas recomendadas

En **Developers** → **Webhooks** → **[tu endpoint]** → **Settings**:
- ✓ Email cuando el webhook falla 3+ veces seguidas

---

## 🚀 Próximos Pasos

Después de configurar Stripe:

1. ✅ Probar todos los planes en modo test
2. ✅ Configurar emails de Stripe (Dashboard → Settings → Emails)
3. ✅ Activar Smart Retries para pagos fallidos
4. ✅ Configurar facturación automática
5. ✅ Revisar con un abogado los términos de servicio
6. ✅ Cambiar a Live mode para producción

---

## 📚 Recursos Útiles

- [Stripe Testing](https://stripe.com/docs/testing)
- [Webhooks Guide](https://stripe.com/docs/webhooks)
- [Subscription Best Practices](https://stripe.com/docs/billing/subscriptions/overview)
- [Stripe CLI Docs](https://stripe.com/docs/stripe-cli)

---

## 💬 ¿Problemas?

Si tienes dudas, revisa:
1. Los logs del servidor: `npm run dev` (consola)
2. Stripe Dashboard → **Developers** → **Events** (todos los eventos)
3. Stripe Dashboard → **Webhooks** → Logs

¿Necesitas ayuda? Crea un issue en el repositorio.
