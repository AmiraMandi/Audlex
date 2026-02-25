# 📅 Planes Anuales en Stripe - Guía de Configuración

## 🎯 Objetivo

Añadir planes anuales con **20% de descuento** para todos los productos.

---

## 📊 Tabla de Precios

| Plan | Mensual | Anual (20% OFF) | Ahorro/año |
|------|---------|-----------------|------------|
| **Starter** | €69/mes (€828/año) | €660/año (€55/mes) | €168 |
| **Business** | €199/mes (€2,388/año) | €1,910/año (€159/mes) | €478 |
| **Enterprise** | €499/mes (€5,988/año) | €4,790/año (€399/mes) | €1,198 |
| **Consultora** | €349/mes (€4,188/año) | €3,350/año (€279/mes) | €838 |

---

## ✅ Paso 1: Crear Productos Anuales en Stripe

### Para cada plan (Starter, Business, Enterprise, Consultora):

1. **Ir a Stripe Dashboard** → [Products](https://dashboard.stripe.com/test/products)

2. **Encontrar el producto existente** (ej: "Audlex - Starter")

3. **Agregar nuevo precio:**
   - Click en **"Add another price"** (o "+ New" en la sección Pricing)
   
4. **Configurar precio anual:**
   ```
   Pricing model: Standard pricing ✓
   
   Price: [ver tabla arriba]
   - Starter: €660
   - Business: €1,910
   - Enterprise: €4,790
   - Consultora: €3,350
   
   Billing period: Recurring ✓
   
   Frecuencia: Yearly ✓ (Cada 12 meses)
   
   Payment type:
   ☑ Charge automatically (recomendado)
   ☐ Send invoice
   
   Description (opcional):
   "Annual plan - Save 20% compared to monthly"
   ```

5. **Guardar (Save)**

6. **Copiar Price ID:**
   - El nuevo Price ID empieza con `price_...`
   - Ejemplo: `price_1T3zABCDEFGHIJKLMNOP`
   - **⚠️ IMPORTANTE:** Este es diferente del mensual

---

## ✅ Paso 2: Actualizar Variables de Entorno

### En tu `.env.local`:

```bash
# Planes mensuales (YA CONFIGURADOS)
STRIPE_PRICE_STARTER=price_1T3zcNPjHCygywqxEQEmqnSF
STRIPE_PRICE_BUSINESS=price_1T3zklPjHCygywqxWpz8SBJB
STRIPE_PRICE_ENTERPRISE=price_1T3zlMPjHCygywqxxv2jdUTK
STRIPE_PRICE_CONSULTORA=price_1T3zm8PjHCygywqxz3mmZPp4

# Planes anuales (NUEVOS - copiar de Stripe)
STRIPE_PRICE_STARTER_ANNUAL=price_xxx
STRIPE_PRICE_BUSINESS_ANNUAL=price_xxx
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_xxx
STRIPE_PRICE_CONSULTORA_ANNUAL=price_xxx
```

---

## ✅ Paso 3: Verificar Configuración

### Script de verificación:

```bash
node scripts/verify-stripe.js
```

Debería mostrar:
```
✓ STRIPE_PRICE_STARTER
✓ STRIPE_PRICE_BUSINESS
✓ STRIPE_PRICE_ENTERPRISE
✓ STRIPE_PRICE_CONSULTORA
✓ STRIPE_PRICE_STARTER_ANNUAL
✓ STRIPE_PRICE_BUSINESS_ANNUAL
✓ STRIPE_PRICE_ENTERPRISE_ANNUAL
✓ STRIPE_PRICE_CONSULTORA_ANNUAL

✓✓✓ TODO CORRECTO ✓✓✓
```

---

## ✅ Paso 4: Probar Checkout

### 4.1 Iniciar servidor + webhook:

**Terminal 1:**
```bash
npm run dev
```

**Terminal 2:**
```bash
.\stripe-cli\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe
```

### 4.2 Test mensual:

1. Ir a http://localhost:3000
2. Dejar toggle en **"Mensual"**
3. Click "Empezar" en Business (€199/mes)
4. Registrarse
5. En Stripe Checkout ver: **€199.00 EUR per month**
6. Pagar con: 4242 4242 4242 4242

### 4.3 Test anual:

1. Ir a http://localhost:3000
2. Cambiar toggle a **"Anual"**
3. Debería mostrar:
   ```
   €159/mes
   €1,910 facturado anualmente
   ✓ Ahorras €478/año
   ```
4. Click "Empezar" en Business
5. Registrarse
6. En Stripe Checkout ver: **€1,910.00 EUR per year**
7. Pagar con: 4242 4242 4242 4242

### 4.4 Verificar webhook:

En Terminal 2 deberías ver:
```
[200] POST /api/webhooks/stripe [evt_xxx]
checkout.session.completed
```

En Dashboard verificar plan "business" activo.

---

## 🔧 Troubleshooting

### Error: "Plan inválido"
- ✅ Verificar que todos los Price IDs estén en `.env.local`
- ✅ Reiniciar servidor después de cambiar `.env.local`

### Webhook no se recibe:
- ✅ Verificar Stripe CLI ejecutándose
- ✅ Verificar puerto correcto (3000)
- ✅ Ver logs en Terminal 2

### Precio incorrecto en Stripe Checkout:
- ✅ Verificar Price ID correcto (mensual vs anual)
- ✅ En Stripe Dashboard → Events → Ver detalles del evento
- ✅ Verificar `line_items[0].price.id`

---

## 📊 Análisis Financiero

### Ventajas del plan anual:

**Para el negocio:**
- 💰 Cash flow upfront (€1,910 vs €199)
- ⬇️ Menor churn (cliente ya pagó el año)
- 💳 Menos comisiones Stripe:
  - Mensual: 12 pagos × (1.5% + €0.25) = ~€36/año
  - Anual: 1 pago × (1.5% + €0.25) = ~€29/año
  - **Ahorro: €7/año por cliente**
- 📈 Mayor LTV

**Para el cliente:**
- 💵 Ahorra 20% (€478 en Business)
- 🔒 Precio fijado por 12 meses
- 📧 Menos emails de cobro

### Proyección (100 clientes Business):

| Métrica | Solo Mensual | Mensual + Anual (30% anual) |
|---------|--------------|----------------------------|
| **MRR** | €19,900 | €13,930 + €4,775* = €18,705 |
| **Cash upfront** | €19,900 | €13,930 + €57,300 = €71,230 |
| **Churn mensual** | ~5% | ~3% (anuales no cancelan) |
| **Comisiones Stripe/año** | €3,600 | €2,520 |

*€4,775 = €57,300 / 12 meses (amortización)

---

## 🚀 Próximos Pasos

1. ✅ Crear 4 precios anuales en Stripe
2. ✅ Copiar Price IDs a `.env.local`
3. ✅ Verificar con `node scripts/verify-stripe.js`
4. ✅ Probar checkout mensual
5. ✅ Probar checkout anual
6. ✅ Verificar webhook funciona para ambos
7. ✅ Deploy a producción

---

## 📝 Notas Importantes

- **Webhooks:** El mismo webhook maneja mensual y anual (getPlanMapping actualizado)
- **Cambio de plan:** Usuario puede cambiar de mensual → anual (y viceversa) desde Customer Portal
- **Facturación prorrateada:** Stripe maneja automáticamente si cambias en medio del ciclo
- **Reembolsos:** Stripe permite reembolso parcial/total desde Dashboard

---

**Última actualización:** 24/02/2026  
**Autor:** GitHub Copilot
