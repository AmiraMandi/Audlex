# ✅ Checklist Rápido: Configuración de Stripe

Usa este checklist para verificar que has completado todos los pasos.

## 📋 Antes de empezar

- [ ] Cuenta de Stripe creada
- [ ] Modo Test activado (para desarrollo)
- [ ] Stripe CLI instalado (opcional, para webhooks locales)
- [ ] **Precios definidos** considerando comisiones de Stripe (1.5% + €0.25)

> 💡 **Tip**: Si quieres recibir €70 netos, cobra €71.50 (€70 + comisión)

---

## 💰 Productos en Stripe Dashboard

Ve a **Products** y crea:

- [ ] **Audlex Starter** - €69/mes
  - [ ] Price ID copiado → `STRIPE_PRICE_STARTER`
  
- [ ] **Audlex Business** - €199/mes
  - [ ] Price ID copiado → `STRIPE_PRICE_BUSINESS`
  
- [ ] **Audlex Enterprise** - €499/mes
  - [ ] Price ID copiado → `STRIPE_PRICE_ENTERPRISE`
  
- [ ] **Audlex Consultora** - €349/mes
  - [ ] Price ID copiado → `STRIPE_PRICE_CONSULTORA`

---

## 🔑 API Keys

Ve a **Developers → API keys**:

- [ ] **Publishable key** copiada → `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- [ ] **Secret key** copiada → `STRIPE_SECRET_KEY`

---

## 🔔 Webhook

### Para desarrollo local:

```bash
stripe listen --forward-to localhost:3000/api/webhooks/stripe
```

- [ ] Webhook secret copiado → `STRIPE_WEBHOOK_SECRET`

### Para producción:

Ve a **Developers → Webhooks → Add endpoint**:

- [ ] URL configurada: `https://audlex.com/api/webhooks/stripe`
- [ ] Eventos seleccionados:
  - [ ] `checkout.session.completed`
  - [ ] `customer.subscription.updated`
  - [ ] `customer.subscription.deleted`
- [ ] Signing secret copiado → `STRIPE_WEBHOOK_SECRET`

---

## ⚙️ Variables de Entorno

En `.env.local`:

```env
# Stripe (Test Mode)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Price IDs
STRIPE_PRICE_STARTER=price_...
STRIPE_PRICE_BUSINESS=price_...
STRIPE_PRICE_ENTERPRISE=price_...
STRIPE_PRICE_CONSULTORA=price_...
```

- [ ] Todas las variables configuradas
- [ ] Archivo `.env.local` guardado
- [ ] Servidor reiniciado (`npm run dev`)

---

## ✅ Verificación

```bash
npm run stripe:verify
```

- [ ] Script ejecutado sin errores
- [ ] Todas las verificaciones pasadas (✓)

---

## 🧪 Prueba de Pago (Test Mode)

1. **Arrancar dev server**:
   ```bash
   # Terminal 1
   npm run dev
   
   # Terminal 2 (webhook listener)
   npm run stripe:listen
   ```

   - [ ] Ambos terminales corriendo

2. **Hacer un pago de prueba**:
   - [ ] Ir a `localhost:3000` → Ver precios
   - [ ] Seleccionar un plan
   - [ ] Usar tarjeta: `4242 4242 4242 4242`
   - [ ] Completar checkout
   - [ ] Redirigido a `/dashboard`

3. **Verificar en Stripe Dashboard**:
   - [ ] Pago aparece en **Payments**
   - [ ] Cliente aparece en **Customers**
   - [ ] Suscripción activa en **Subscriptions**

4. **Verificar en tu base de datos**:
   - [ ] Organización tiene `subscription_status = 'active'`
   - [ ] Plan asignado correctamente
   - [ ] Límites actualizados (`max_systems`, `max_users`)

---

## 🚀 Para Producción

Cuando vayas a producción:

- [ ] Cambiar a **Live mode** en Stripe
- [ ] Crear los 4 productos de nuevo en Live mode
- [ ] Copiar los nuevos Price IDs (empiezan con `price_live_`)
- [ ] Copiar API keys de Live mode (`pk_live_`, `sk_live_`)
- [ ] Configurar webhook de producción
- [ ] Actualizar variables en Vercel
- [ ] Probar un pago real (¡cuidado, se cobrará de verdad!)

---

## 📝 Notas

- ⚠️ **NUNCA** comitees `.env.local` a Git
- 🔒 Las claves secretas (`sk_...`) son **privadas**
- 🧪 Usa tarjetas de prueba solo en Test mode
- 💰 En Live mode, los pagos son **reales**

---

## 🆘 Ayuda

Si algo falla:

1. Ver [STRIPE_SETUP.md](STRIPE_SETUP.md) (guía completa)
2. Revisar logs del servidor: consola de `npm run dev`
3. Revisar eventos en Stripe Dashboard → **Developers → Events**
4. Revisar logs de webhook → **Developers → Webhooks → [tu endpoint]**

---

✅ **Todo listo cuando todos los checkboxes estén marcados**
