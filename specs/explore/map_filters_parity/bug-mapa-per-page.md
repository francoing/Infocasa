# Bug-card: El mapa muestra solo 12 propiedades aunque haya más

**Área:** `explore`
**Tier:** 2 · Bugfix / Mejora puntual
**Estado:** ✅ resuelta

---

## 1. Síntoma
En `/explore` (mapa) el usuario tiene 17 propiedades publicadas pero el mapa muestra
solo 12 marcadores (y el contador "N propiedades en la zona" también dice 12). Reproducir:
ir al mapa con inventario > 12 propiedades publicadas en la zona visible.

## 2. Causa raíz
Hook / construcción de query. `buildSearchQueryString` (`src/hooks/properties.query.js`)
aplica `per_page=12` cuando no viene `page`. El mapa (`ExplorePage`) llama a
`useProperties(filters)` sin `page`, así que siempre pedía `per_page=12` y el backend
cortaba el resto. Contradice el diseño del mapa: la spec `map_filters_parity` §3 dice que
el mapa "sigue con `per_page` alto" (no pagina, muestra todos los marcadores de la zona).

## 3. Fix
- `properties.query.js`: nueva rama — si viene `filters.perPage` (y no `page`), usa ese
  `per_page` en vez del default 12. El default de 12 (Home) y el paginado de 6 (`/search`)
  quedan igual.
- `ExplorePage.jsx`: pasa `perPage: 200` a `useProperties` (el mapa no pagina).

## 4. Capa afectada
- [x] Hook (`src/hooks/`)
- [ ] Store (`src/store/`)
- [x] Componente / Página (`src/features/` o `src/common/`)
- [ ] Router (`src/router/`)

## 5. Verificación
- [x] `npm run lint` verde
- [x] Test Vitest — `src/test/hooks/propertiesQuery.test.js` cubre default 12, paginado 6,
  y el `perPage` alto del mapa (+ prioridad de `page` sobre `perPage`)
- [x] `PROJECT-MAP.md` actualizado (nota del per_page del mapa)

> Nota: el fix asume que las propiedades faltantes están **publicadas** y **con
> coordenadas**. El buscador público (`/properties/search`) no trae borradores/pendientes,
> y el mapa descarta las que no tienen `latitude/longitude` (`ProvinceMap`). Si el backend
> caps el `per_page` por debajo de 200, ese tope manda y habría que ajustarlo allá.
