# Spec: Partir ProfilePage (split de presentación + extraer lógica de MercadoPago)

**Área:** `profile`
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` (un componente por responsabilidad; lógica fuera del JSX) · auditoría de sanidad 2026-07-15 (paydown #7)

## 1. Objetivo
`ProfilePage.jsx` (591 líneas) arrastra las 3 deudas de tamaño/complejidad del ratchet. Dos causas:
1. **Complejidad**: el `useEffect` de retorno de MercadoPago (parseo de query params + ramas approved/failure/pending + activación) es el sink.
2. **Tamaño**: 4 secciones grandes de JSX (avatar, planes, y 3 formularios).

Sacarla **entera** del LEGACY: extraer la lógica de MP a un hook y las secciones a componentes presentacionales.

## 2. Cambios
- **`hooks/useMercadoPagoReturn.js`** (nuevo): encapsula el efecto de retorno de MP. Recibe `verifyMercadoPagoPayment`. Internaliza `useSearchParams`/`useQueryClient`/`useToast`/`useAuthStore`. **Se simplifica** con helpers de módulo `readMpParams(sp)` y `stripMpParams(sp)` para que el efecto quede bajo complejidad 20 (no basta con mover: hay que bajar la complejidad, porque `hooks/**` también la mide).
- **`features/profile/components/`** (nuevos, presentacionales):
  - `ProfileAvatarCard.jsx` — avatar + rol + upload. Props `{ user, loadingAvatar, onAvatarChange }`. Rol e iniciales por lookup/helper (sin ternarios anidados).
  - `SubscriptionPlans.jsx` (+ `PlanCard` interno) — grilla de planes. Props `{ plans, user, onChoose }`. Los ternarios de estilo viven en `PlanCard`.
  - `PersonalInfoForm.jsx` — Props `{ form, setForm, loading, onSubmit }`.
  - `AgencyForm.jsx` — Props `{ form, setForm, loading, onSubmit }`.
  - `PasswordForm.jsx` — Props `{ form, setForm, loading, onSubmit }`.
- **`ProfilePage.jsx`**: queda como orquestación — hooks de datos, estado de los forms, los handlers (lógica: usan `updateProfile`/`updatePassword`/`updateAvatar`/`createAgency`/`updateAgency`), y compone los componentes. Llama `useMercadoPagoReturn(verifyMercadoPagoPayment)`.
- **`.eslintrc.cjs`**: `ProfilePage` sale **entero** del LEGACY.

## 3. Invariantes (sin cambio de comportamiento)
- Mismo markup/estilos, mismos handlers y validaciones (422 → desglose de `errors`).
- El efecto de MP corre igual (una vez, on-mount): limpia los query params, verifica el pago, activa la suscripción, refresca user/cache y toasts.
- El form de inmobiliaria sigue solo para `role === 'agent'`; el `CheckoutModal` igual.

## 4. Criterios de aceptación
1. `ProfilePage.jsx` fuera del LEGACY (sin `complexity`/`max-lines`/`max-lines-per-function`); todos los componentes/hook nuevos bajo umbral. `npm run lint` verde.
2. Perfil, contraseña, avatar, inmobiliaria y planes funcionan igual; el retorno de MP activa la suscripción.

## 5. Fuera de alcance
- Unificar la lógica de forms en un hook genérico de formularios → mejora futura.
- `ProfilePage` duplicado en `features/auth/pages/` (código muerto) → borrado aparte.
