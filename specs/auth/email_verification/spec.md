# Spec: Verificación de email (coherencia con backend)

**Área:** `auth` (+ dependencia backend)
**Estado:** ✅ implementada
**Fuentes relacionadas:** [.ai/product/README.md](../../../.ai/product/README.md) · `Backend-Inmobiliaria/.ai/contracts/api-contract.md`

---

## 1. Objetivo y valor
El backend ya envía el correo de verificación al registrarse y, al hacer clic, verifica y **redirige al front** (`{FRONTEND_URL}/email-verified?status=success|already`). Pero el front no tiene esa página de aterrizaje, no ofrece reenvío, y **no puede saber si el usuario está verificado** porque `UserResource` no expone el estado. Esto cierra el flujo end-to-end.

## 2. Dependencia backend (bloqueante)
`UserResource` debe exponer el estado de verificación (`is_verified` booleano + `email_verified_at`). Sin esto el front no puede detectar cuentas sin verificar. Cambio en el repo backend (rama aparte).

## 3. Reglas y comportamiento
- El link de verificación apunta **al backend** (firmado, vence 60 min); el backend verifica y redirige al front. **El front NO llama al endpoint de verify** — solo aterriza en `/email-verified` y lee `?status`.
- Reenvío: `POST /auth/email/verification-notification` (requiere `auth:sanctum`, throttled). Solo tiene sentido para usuarios logueados no verificados.
- Enforcement (bloquear acciones de no verificados) sigue siendo **decisión de producto pendiente** — fuera de alcance. Acá solo se informa/facilita, no se bloquea.

## 4. Actores y accesos
Cualquier usuario recién registrado (logueado, no verificado). La página `/email-verified` es pública (puede aterrizar sin sesión).

## 5. Contrato de API que consume
- Aterrizaje: `GET {FRONTEND_URL}/email-verified?status=success|already` (redirección del backend; no es una llamada del front).
- Reenvío: `POST /auth/email/verification-notification` → `200` (o `429` throttled).
- `GET /auth/me` / login / register → `user.is_verified` (bool), `user.email_verified_at` (ISO|null).

## 6. Capa de datos / estado
- `useAuthStore`: nueva acción `resendVerification()` → `api.post("/auth/email/verification-notification")`. (El store es capa de estado; el boundary permite que importe api.)
- El `user` del store ya trae `is_verified`/`email_verified_at` (spread en `enrichUser`).

## 7. UI
- **`EmailVerifiedPage`** (`features/auth/pages`) + ruta pública `/email-verified`: lee `?status` → mensaje ("¡Correo verificado!" / "Tu correo ya estaba verificado") + CTA a `/login` o `/dashboard`. Sin `?status` → mensaje neutro.
- **`EmailVerificationBanner`** (`common/components`): si `isAuthenticated && !user.is_verified` → banner con botón "Reenviar correo" (usa `resendVerification` + toast). Se renderiza en `Layout`.

## 8. Casos borde
- `status` desconocido/ausente → mensaje neutro, no rompe.
- Reenvío `429` (throttled) → toast "Esperá unos minutos antes de reintentar".
- Usuario ya verificado → el banner no aparece.
- Sin sesión en `/email-verified` → igual muestra el mensaje (CTA a login).

## 9. Criterios de aceptación
1. Backend `UserResource` expone `is_verified` + `email_verified_at`; contrato actualizado.
2. Ruta `/email-verified` renderiza el estado correcto por `?status`.
3. Banner visible solo para logueados no verificados; reenvío funciona con feedback (toast).
4. `npm run lint` verde (nada nuevo entra a `LEGACY`; página/componente/boundary limpios).

## 10. Fuera de alcance
- Enforcement de no-verificados (decisión de producto).
- Manejo de link vencido/ inválido con aterrizaje bonito (hoy el backend responde 403; mejora futura del backend).
- Reescritura de `RegisterPage` (solo, opcional, un aviso "revisá tu correo" post-registro).
