# Bug-card: El front ofrecía "renovación automática" que no existía

**Área:** `quality` (monetización: perfil, dashboard, checkout)
**Tier:** 2 · Mejora puntual (cambio de regla de negocio decidido por producto el 2026-11-20)
**Estado:** ✅ resuelta

---

## 1. Síntoma
El perfil y el dashboard mostraban "Renovación Automática: Activada" con botones "Pausar/Reactivar", y los precios decían "/mes". Pero el cobro es un pago único de Checkout Pro: nunca hubo un cobro recurrente real (el comando del backend no estaba agendado y no tenía un token de tarjeta válido). El usuario podía creer que su plan se renovaba solo y quedarse sin plan al vencer.

## 2. Causa raíz
El backend creaba la suscripción con `auto_renew = true` y exponía `PATCH subscriptions/toggle-auto-renew`, que solo cambiaba un flag. El front lo mostraba como si fuera real.

## 3. Fix
- Producto decidió: **suscripción = pago único, no se renueva**. Backend: spec `monetization/mercadopago_hardening` (quita el endpoint y el campo `auto_renew`).
- `src/common/components/OneTimePaymentNote.jsx` (nuevo): aviso "Pago único: el plan no se renueva automáticamente." (texto en `ONE_TIME_PAYMENT_TEXT`).
- `SubscriptionStatusCard` y `PlanStatusCard`: sin toggle; muestran el aviso en planes pagos.
- `CheckoutModal`, `SubscriptionPlans`, `PlanPickerModal`: aviso + precio "por 30 días" en vez de "/mes".
- Se borró `useToggleAutoRenew` (`src/hooks/useQrStats.js`) y la prop `isAutoRenew` de `DashboardPage`/`DashboardStats`.

## 4. Capa afectada
- [x] Componente / página
- [x] Hook (`src/hooks/`)

## 5. Verificación
- [x] Tests Vitest: `components/CheckoutModal`, `components/PlanStatusCard`, `components/SubscriptionStatusCard` (nuevo)
- [x] `npm run lint`, `npm run knip`, `npm run map:check`, `vite build` verdes
- [x] `PROJECT-MAP.md` actualizado
