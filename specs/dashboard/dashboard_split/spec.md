# Spec: Partir DashboardPage en componentes por tab

**Área:** `dashboard`
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` (un componente por responsabilidad) · auditoría de sanidad 2026-07-15 (paydown #8)

## 1. Objetivo
`DashboardPage.jsx` (981 líneas) es un god-page tabbeado con las 3 deudas de tamaño/complejidad. Todo el estado de datos ya vive en `useDashboardData`; la página es un enorme árbol de JSX con una cadena de ternarios por tab. Partir cada tab (y las piezas compartidas duplicadas) en componentes presentacionales → sacarla **entera** del LEGACY.

## 2. Cortes (nuevos en `features/dashboard/components/`)
Piezas compartidas (eliminan duplicación):
- `leadStatus.js` — lookup map del badge de estado de lead (estaba duplicado como ternario anidado en 2 tabs).
- `LeadFilters.jsx` — barra de filtros estado/desde/hasta + limpiar (duplicada en "consultas enviadas" y "consultas recibidas").

Tabs (presentacionales, reciben datos + callbacks por props):
- `DashboardStats.jsx` — fila de stats (variante buyer vs seller).
- `DashboardTabs.jsx` — barra de tabs (según rol).
- `FavoritesTab.jsx` — lista de favoritos.
- `SentLeadsTab.jsx` — consultas enviadas (+ `LeadFilters`).
- `PropertiesTab.jsx` (+ `PropertyRow.jsx`) — propiedades con filtros y panel de reducción de precio.
- `AdminUsersTab.jsx` — tabla de usuarios.
- `AdminPropertiesTab.jsx` — tabla de moderación.
- `LeadsTab.jsx` — consultas recibidas (+ `LeadFilters`, form de respuesta inline).
- `PlanPickerModal.jsx` — modal de selección de plan.

`DashboardPage` queda como orquestación: `useDashboardData`, estado de UI local (tab activo, expand, respuesta, filtros locales, plan seleccionado), handlers, y compone lo anterior. La selección de tab pasa de cadena de ternarios a un `switch`.

## 3. Invariantes (sin cambio de comportamiento)
- Mismo markup/estilos, mismos datos y callbacks del hook.
- Tabs por rol iguales (buyer: favoritos/consultas; seller: propiedades/leads; admin: +usuarios/+moderación).
- Filtros, reducción de precio (con `window.confirm` en borrados), respuesta a leads, cambio de estado y modales de plan/checkout: idénticos.
- Los precios que hoy muestran `USD` hardcodeado se mantienen igual (no es alcance de esta spec cambiarlos).

## 4. Criterios de aceptación
1. `DashboardPage.jsx` fuera del LEGACY (sin `complexity`/`max-lines`/`max-lines-per-function`); todos los componentes nuevos bajo umbral. `npm run lint` verde.
2. `vite build` compila (imports resuelven, JSX válido).
3. Dashboard funciona igual para buyer, seller y admin.

## 5. Fuera de alcance
- `useDashboardData` (hook sobredimensionado) → spec aparte.
- Cambiar el `USD` hardcodeado en las filas → mejora aparte (coherencia de moneda).
