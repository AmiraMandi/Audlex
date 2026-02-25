# ⚠️ ACCIÓN REQUERIDA: Configurar Planes Anuales

## 🎯 ¿Qué hacer ahora?

Acabas de actualizar tu código para soportar **planes mensuales + anuales con 20% descuento**.

Para que funcione, necesitas crear los productos anuales en Stripe y agregar sus Price IDs.

---

## ✅ Pasos Inmediatos

### 1. Crear Planes Anuales en Stripe (15 minutos)

Sigue la guía completa en: [`STRIPE_ANNUAL_SETUP.md`](STRIPE_ANNUAL_SETUP.md)

**Resumen rápido:**
1. Ir a [Stripe Products](https://dashboard.stripe.com/test/products)
2. Para cada producto existente (Starter, Business, Enterprise, Consultora):
   - Click "Add another price"
   - Precio: Ver tabla abajo
   - Billing period: **Yearly**
   - Copiar Price ID

### 2. Agregar Price IDs al `.env.local`

```bash
# Planes anuales (AGREGAR ESTOS 4)
STRIPE_PRICE_STARTER_ANNUAL=price_xxx_copiar_de_stripe
STRIPE_PRICE_BUSINESS_ANNUAL=price_xxx_copiar_de_stripe
STRIPE_PRICE_ENTERPRISE_ANNUAL=price_xxx_copiar_de_stripe
STRIPE_PRICE_CONSULTORA_ANNUAL=price_xxx_copiar_de_stripe
```

### 3. Reiniciar servidor

```bash
npm run dev
```

---

## 💰 Tabla de Precios Anuales

| Plan | Precio Anual | Equivalente Mensual | Descuento |
|------|--------------|---------------------|-----------|
| Starter | **€660/año** | €55/mes | 20% (€168) |
| Business | **€1,910/año** | €159/mes | 20% (€478) |
| Enterprise | **€4,790/año** | €399/mes | 20% (€1,198) |
| Consultora | **€3,350/año** | €279/mes | 20% (€838) |

---

## 🧪 Cómo Probar

1. **Ir a:** http://localhost:3000
2. **Toggle:** Cambiar entre "Mensual" ↔ "Anual"
3. **Verificar:** 
   - Precio cambia
   - Badge "Ahorra 20%" aparece en anual
   - Texto "facturado anualmente" visible
4. **Checkout:** Click "Empezar" → Registrarse → Checkout
5. **Stripe:** Verificar en checkout que precio sea correcto

---

## 📊 Lo que se implementó

### ✅ Frontend
- [x] **PricingToggle**: Componente switch mensual/anual con animación
- [x] **Landing actualizado**: Calcula precios dinámicamente
- [x] **Visual mejorado**: Badge de ahorro, precio por mes destacado

### ✅ Backend
- [x] **API checkout**: Maneja `isAnnual` parameter
- [x] **Webhook**: Procesa tanto monthly como annual Price IDs
- [x] **Stripe config**: PLANS con priceIdMonthly/Annual

### ✅ UX Flow
- [x] **PricingButton**: Guarda billing period en localStorage
- [x] **PendingPlanHandler**: Restaura billing period después de registro
- [x] **Backwards compatible**: Soporta formato legacy

### ✅ Documentación
- [x] **STRIPE_ANNUAL_SETUP.md**: Guía paso a paso
- [x] **.env.example**: Variables actualizadas
- [x] **TODO_ANNUAL.md**: Este archivo

---

## 🚨 Si no configuras esto

**El toggle aparecerá pero los checkouts fallarán** con error:
```
"Plan inválido" / "Invalid plan"
```

Porque las variables `STRIPE_PRICE_*_ANNUAL` no existen.

---

## ⏱️ Tiempo estimado

- **Crear productos en Stripe:** 10 min
- **Copiar Price IDs:** 2 min
- **Probar:** 5 min
- **Total:** 17 minutos

---

## 🎁 Beneficios

### Para el negocio:
- 💰 **30-40% de clientes** eligen anual (estadística industria)
- 🏦 **Cash flow upfront** (€1,910 vs €199)
- ⬇️ **Menor churn** (70% menos cancelaciones en anuales)
- 💳 **Ahorro comisiones** Stripe (~€7/año por cliente)

### Para el cliente:
- 💵 **Ahorra 20%** (€168 - €1,198 según plan)
- 🔒 **Precio fijado** 12 meses
- 📧 **Menos emails** de cobro

---

## 📞 Ayuda

Si tienes problemas:
1. Leer [`STRIPE_ANNUAL_SETUP.md`](STRIPE_ANNUAL_SETUP.md) sección Troubleshooting
2. Verificar logs en terminal del webhook
3. Revisar Stripe Dashboard → Events

---

**Última actualización:** 24/02/2026
