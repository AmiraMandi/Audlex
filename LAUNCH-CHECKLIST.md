# 🚀 LAUNCH CHECKLIST - Audlex

**Estado actual:** 82% Completado  
**Ready for:** Test Mode Testing  
**Not ready for:** Live Production

---

## 🟢 FASE 1: Testing Exhaustivo (2-3 días)

### Funcionalidades Core
- [ ] **Flujo completo nuevo usuario**
  - [ ] Landing → Seleccionar plan
  - [ ] Registro
  - [ ] Auto-redirect a Stripe
  - [ ] Pago test (4242 4242 4242 4242)
  - [ ] Webhook procesa correctamente
  - [ ] Dashboard con plan correcto
  - [ ] Onboarding funciona
  
- [ ] **CRUD Sistemas IA**
  - [ ] Crear sistema
  - [ ] Editar sistema
  - [ ] Eliminar sistema
  - [ ] Ver detalles
  
- [ ] **Clasificador**
  - [ ] Clasificar sistema como high-risk
  - [ ] Clasificar sistema como limited-risk
  - [ ] Ver explicación detallada
  
- [ ] **Documentos**
  - [ ] Generar PDF
  - [ ] Generar DOCX
  - [ ] Descargar funcionando
  - [ ] Contenido correcto
  
- [ ] **Checkout & Billing**
  - [ ] Upgrade plan (free → starter)
  - [ ] Upgrade plan (starter → business)
  - [ ] Customer Portal funciona
  - [ ] Cancelar suscripción
  - [ ] Webhook past_due maneja correctamente

### Multi-user
- [ ] Invitar usuario (email)
- [ ] Usuario acepta invitación
- [ ] Probar permisos viewer (solo lectura)
- [ ] Probar permisos member (CRUD sistemas)
- [ ] Probar permisos admin (billing, usuarios)
- [ ] Probar permisos owner (eliminar org)

### UX/UI
- [ ] Responsive mobile (iPhone, Android)
- [ ] Responsive tablet (iPad)
- [ ] Dark mode funciona en todas las vistas
- [ ] Navbar sticky funciona
- [ ] Search modal (Cmd+K / Ctrl+K)
- [ ] AI Assistant responde correctamente
- [ ] Toasts/notificaciones visuales

### Cross-browser
- [ ] Chrome Desktop
- [ ] Safari Desktop
- [ ] Firefox
- [ ] Edge
- [ ] Chrome Mobile
- [ ] Safari Mobile (iOS)

### Performance
- [ ] Lighthouse Desktop > 90
- [ ] Lighthouse Mobile > 85
- [ ] LCP < 2.5s
- [ ] FID < 100ms
- [ ] CLS < 0.1

### Security
- [ ] Rate limiting funciona (intentar 100 requests rápidos)
- [ ] Session expira correctamente
- [ ] Protected routes redirigen a login
- [ ] Webhook signature verification funciona
- [ ] No consoles.log con datos sensibles

---

## 🟡 FASE 2: Infraestructura (1-3 días)

### Domain
- [ ] Comprar audlex.com (Namecheap/GoDaddy)
- [ ] Configurar DNS A record → 76.76.21.21
- [ ] Configurar DNS CNAME → cname.vercel-dns.com
- [ ] Esperar propagación (check: whatsmydns.net)
- [ ] Verificar SSL activo (https://audlex.com)

### Email
- [ ] Ir a Resend → Add Domain
- [ ] Copiar registros DNS (TXT, MX)
- [ ] Agregar en DNS provider
- [ ] Esperar verificación (hasta 24h)
- [ ] Test: enviar email desde dashboard

### Analytics
- [ ] `npm install @vercel/analytics`
- [ ] Agregar `<Analytics />` en layout.tsx
- [ ] Deploy
- [ ] Verificar eventos en Vercel Dashboard

### Deploy Vercel
- [ ] Crear proyecto en Vercel
- [ ] Conectar repo GitHub
- [ ] Configurar env variables (copiar de .env.local)
- [ ] Deploy
- [ ] Verificar build success
- [ ] Test básico en audlex.com

### Stripe Webhook Production
- [ ] Stripe Dashboard → Webhooks → Add endpoint
- [ ] URL: https://audlex.com/api/webhooks/stripe
- [ ] Events: checkout.session.completed, customer.subscription.*
- [ ] Copiar signing secret
- [ ] Actualizar STRIPE_WEBHOOK_SECRET en Vercel
- [ ] Redeploy
- [ ] Test webhook con evento real

---

## 🔴 FASE 3: Go Live (1-2 semanas)

### Legal (Opcional pero recomendado)
- [ ] Contratar abogado especializado
- [ ] Revisar Términos y Condiciones
- [ ] Revisar Política de Privacidad
- [ ] Agregar SLA (Service Level Agreement)
- [ ] Agregar DPA (Data Processing Agreement)
- [ ] Firmar documentos

### Stripe Live Mode
- [ ] Stripe Dashboard → Complete profile
  - [ ] Upload ID/Passport
  - [ ] Proof of address
  - [ ] Tax information (CIF/NIF)
  - [ ] Business details
  - [ ] Bank account
- [ ] Submit for review
- [ ] ESPERAR aprobación (2-3 días)
- [ ] Una vez aprobado:
  - [ ] Crear productos en LIVE mode
    - [ ] Starter €69/mes → copiar price_xxx
    - [ ] Business €199/mes → copiar price_xxx
    - [ ] Enterprise €499/mes → copiar price_xxx
    - [ ] Consultora €349/mes → copiar price_xxx
  - [ ] Obtener claves live (pk_live_..., sk_live_...)
  - [ ] Actualizar .env en Vercel
  - [ ] Redeploy

### Marketing Soft Launch
- [ ] Email a beta testers (10-20 personas)
- [ ] Post en LinkedIn
- [ ] Post en Twitter/X
- [ ] Post en comunidades relevantes (SomosNLP, etc)
- [ ] Monitor primeros usuarios 24/7 (primeros 3 días)

### Monitoring
- [ ] Configurar alertas de errores (opcional: Sentry)
- [ ] Dashboard de métricas (Vercel Analytics)
- [ ] Monitor Stripe Dashboard para pagos
- [ ] Monitor support tickets diariamente

---

## ✅ Success Criteria

### Technical
- ✅ Uptime > 99.9% (primera semana)
- ✅ Error rate < 1%
- ✅ Response time < 500ms (p95)
- ✅ Zero payment failures (primeros 10 pagos)

### Business (primer mes)
- 🎯 10 suscripciones pagadas
- 🎯 €1,000 MRR
- 🎯 100 registros totales
- 🎯 10% conversion rate

---

## 🚨 Rollback Plan

Si algo sale mal en producción:

1. **Problema crítico de pagos:**
   - Desactivar botones de checkout (feature flag)
   - Mostrar mensaje "Mantenimiento temporal"
   - Investigar logs en Vercel
   - Verificar webhook endpoint

2. **Base de datos corrupta:**
   - Restaurar último backup de Supabase
   - Verificar integridad de datos
   - Re-run migrations si necesario

3. **Performance issues:**
   - Verificar Vercel Functions logs
   - Check database query performance
   - Activar caching si necesario
   - Scale up Supabase plan temporalmente

4. **Security breach:**
   - Rotar TODAS las claves inmediatamente
   - Forzar logout de todos los usuarios
   - Audit logs detallado
   - Notificar usuarios afectados (GDPR)

---

## 📞 Contactos de Emergencia

- **Vercel Support:** vercel.com/support (chat 24/7)
- **Stripe Support:** stripe.com/support (email/chat)
- **Supabase Support:** supabase.com/support

---

## 🎯 Próximo Paso Inmediato

**AHORA:** Empezar Fase 1 - Testing Exhaustivo  
**Tiempo estimado:** 2-3 días  
**Objetivo:** Verificar que TODAS las funcionalidades funcionan en test mode

**Comando para iniciar:**
```bash
cd C:\Audit\Audlex-project
npm run dev
# En otra terminal:
.\stripe-cli\stripe.exe listen --forward-to localhost:3000/api/webhooks/stripe
```

**Test inicial:**
1. Ir a http://localhost:3000
2. Click "Empezar" en plan Business
3. Registrarse con email nuevo
4. Debería redirigir a Stripe Checkout
5. Usar tarjeta test: 4242 4242 4242 4242, CVC: 123, fecha: 12/34
6. Completar pago
7. Verificar en terminal que webhook se recibe
8. Dashboard debería mostrar plan "Business"

---

**Última actualización:** 23/02/2026
