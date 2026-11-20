# Bug-card: Los módulos de `src/api/` se saltean el boundary "datos solo por hooks"

**Área:** `quality` (infocoins, searchAlerts)
**Tier:** 2 · Mejora puntual
**Estado:** ✅ resuelta

---

## 1. Síntoma
`PackageStorePage` y `PaymentResultPage` importaban `@/api/infocoins` y llamaban a la API directo, aunque la regla de oro #4 dice que ningún componente/página habla con la API. El lint no lo marcaba. Además `useSearchAlerts` vivía en `features/searchAlerts/hooks/` y los hooks de infomonedas (`useWallet`, `usePackages`, `useAssignInfocoins`) usaban `useState/useEffect`: sin cache compartido, el saldo no se actualizaba en otras pantallas tras comprar o asignar.

## 2. Causa raíz
Boundary del linter: `no-restricted-imports` solo bloqueaba `**/api/api`. Los módulos de endpoints nuevos (`api/infocoins.js`, `api/searchAlerts.js`) envuelven `api.js` pero no estaban cubiertos, así que eran un atajo legal desde la UI.

## 3. Fix
- `.eslintrc.cjs`: el patrón pasa a `**/api/*` + `@/api/*` (todo `src/api/` solo desde `src/hooks/`).
- `src/hooks/useInfocoinPurchase.js` (nuevo): `useInfocoinCheckout` (preferencia de MP + compra pendiente) y `useInfocoinPaymentResult` (verify a la vuelta, limpia la compra pendiente, invalida la billetera). Lógica pura en `src/hooks/infocoinPurchase.helpers.js`.
- `PackageStorePage` / `PaymentResultPage`: consumen esos hooks; ya no importan `src/api/`.
- `useWallet`, `usePackages`, `useAssignInfocoins`: migrados a react-query con la misma API pública.
- `useSearchAlerts` movido a `src/hooks/`.
- `architecture.md`, `architecture-policies.yaml` y `PROJECT-MAP.md` documentan los módulos de endpoints.

## 4. Capa afectada
- [x] Hook (`src/hooks/`)

## 5. Verificación
- [x] `npm run lint` verde (y antes del fix marcaba exactamente las 2 páginas)
- [x] Test Vitest (`src/test/helpers/infocoinPurchase.test.js`, `src/test/hooks/useInfocoins.test.js`)
- [x] `npm run knip` y `npm run map:check` verdes
- [x] `PROJECT-MAP.md` actualizado
