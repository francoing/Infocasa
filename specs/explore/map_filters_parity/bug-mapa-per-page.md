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
Hook / construcción de query. El mapa (`ExplorePage`) usaba `useProperties(filters)` →
`GET /properties/search`, que **pagina** (`per_page=12` cuando no viene `page`). Así el
mapa traía solo 12 aunque hubiera más. Forzar `per_page` alto no sirve: el backend valida
un tope y devuelve **422** con `per_page=200`.

## 3. Fix (endpoint dedicado del backend)
El backend agregó `GET /properties/map`: mismos query params de filtro que el listado,
**sin** `page`/`per_page`, devuelve TODO lo que matchea de una. Cada item trae
`coordinates.{lat,lng,exact}`.
- `properties.query.js`: se extrae `buildFilterParts` (filtros sin paginación), reusado por
  `buildSearchQueryString` (listado, paginado) y el nuevo `buildMapQueryString` (mapa, sin paginar).
- `property.mappers.js`: `buildMapMarker` mapea `coordinates.lat/lng` a `latitude/longitude`
  y expone `coordinatesExact` (`exact === false` = zona/barrio, no dirección exacta).
- `useProperties.js`: nuevo hook `useMapProperties(filters)` → `/properties/map`.
- `ExplorePage.jsx`: usa `useMapProperties` (ya no `useProperties` + `per_page`).
- `ProvinceMap.jsx`: direcciones exactas = pin rojo clusterizado; aproximadas = área
  (círculo ámbar) + pin ámbar fuera del cluster, con aviso "Ubicación aproximada (zona)".

## 4. Capa afectada
- [x] Hook (`src/hooks/`)
- [ ] Store (`src/store/`)
- [x] Componente / Página (`src/features/` o `src/common/`)
- [ ] Router (`src/router/`)

## 5. Verificación
- [x] `npm run lint` verde
- [x] Test Vitest — `src/test/hooks/propertiesQuery.test.js` cubre paginado (search) vs.
  sin paginar (map)
- [x] `PROJECT-MAP.md` actualizado (endpoint `/properties/map`, hook `useMapProperties`)

> Nota: el buscador/mapa público no trae borradores/pendientes, y el mapa descarta las que
> no tienen coordenadas. Si faltan propiedades **publicadas y con coordenadas**, revisar el
> backend de `/properties/map`.
