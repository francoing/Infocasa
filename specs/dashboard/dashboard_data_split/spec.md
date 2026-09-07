# Spec: Partir useDashboardData en sub-hooks (queries + mutations + helpers)

**Área:** `dashboard` (capa de datos)
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` · auditoría de sanidad 2026-07-15 (paydown #10)

## 1. Objetivo
`useDashboardData` (352 líneas) era un hook monolítico: 8 queries + 7 mutations + estado de UI en una sola función, con las 3 deudas (`complexity`, `max-lines`, `max-lines-per-function`). Descomponerlo en sub-hooks composables → sacarlo **entero** del LEGACY.

## 2. Cortes
- **`dashboardData.helpers.js`** (puro): `getRoles(user)` (admin/publisher/buyer), `mapLead(l)` (normaliza lead; lookup de estado), `buildLeadParams(...)` (params de filtro), `isDashboardLoading(isBuyer, flags)` (combina loading por rol — saca esa complejidad del hook de queries).
- **`useDashboardQueries(user, roles, filters)`**: las 8 lecturas (favoritos, consultas enviadas/recibidas, propiedades, usuarios/propiedades admin, plan/planes) + `loading`. Habilita por rol.
- **`useDashboardMutations({ reducción + checkout })`**: las 7 escrituras (reducir precio, borrar propiedad, quitar favorito, estado/borrado de usuario, estado/respuesta de lead) + `handleReducePrice`/`handleAssignPlan`.
- **`useDashboardData`**: orquestador — roles + estado de UI/filtros + compone queries y mutations → devuelve la API plana que consume `DashboardPage` (misma forma exacta).

## 3. Invariantes (sin cambio de comportamiento)
- Misma API pública del hook (todas las keys que destructura `DashboardPage`).
- Mismas queries/mutations, mismos query keys e invalidaciones, mismos toasts.
- `mapLead`/`mapProperty` producen el mismo shape; `loading` combina igual que antes (incluye admin queries).

## 4. Criterios de aceptación
1. `useDashboardData.js` fuera del LEGACY; los sub-hooks < 250 líneas y < complejidad 20. `npm run lint` verde.
2. `vite build` compila.
3. El dashboard (buyer/seller/admin) funciona igual: listados, filtros, reducción de precio, respuestas, moderación, planes.

## 5. Fuera de alcance
- `useProperties`/`usePropertyDetail` → specs aparte.
