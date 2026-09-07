# Bug-card: La ubicación del filtro no hace zoom en el mapa

**Área:** `search` (+ `explore`)
**Tier:** 2 · Mejora
**Estado:** ✅ resuelta

---

## 1. Síntoma
En el panel de filtros (`/search`) elijo una ubicación en el autocomplete y toco
**"Ver en el mapa"**: el mapa abre con la operación correcta pero **no hace zoom** a esa
zona (muestra todo). La búsqueda de ubicación del filtro no se traslada al mapa.

## 2. Causa raíz
`LocationAutocomplete` ya usa Geoapify (la sugerencia trae `lat`/`lon`/`bbox`), pero en
`pick()` se quedaba **solo con el texto** (`onChange(s.city || s.state || s.value)`) y
descartaba las coords. Sin coords, `searchToExploreUrl` solo podía pasar `location` (texto)
y el mapa (`readFocus`) necesita `lat/lng/bbox` para hacer zoom. No es un bug de datos: el
contrato de URL del mapa (`location`+`lat`+`lng`+`bbox`) ya funciona desde el home.

## 3. Fix (reusa el shape de URL ya probado del home)
- `LocationAutocomplete`: callback **opcional** `onPick(sugerencia)` (el `onChange` de texto
  queda igual → no rompe usos actuales).
- `SearchFilters`: guarda las coords de la sugerencia elegida (`selectedPlace`) y arma el
  "intent" del mapa al tocar "Ver en el mapa". Usa coords solo si el texto sigue coincidiendo
  con la selección (si el usuario editó el texto luego de elegir, se descartan).
- `search.helpers.js`: `searchToExploreUrl` extendido para emitir `lat/lng/bbox` si están.
  Sin coords → salida idéntica a antes (tests previos intactos).
- `ExplorePage`: sin cambios (ya consume `lat/lng/bbox`).

**Límite inherente:** el zoom requiere **elegir una sugerencia** (las coords vienen de ahí).
Texto tipeado sin elegir → mapa sin zoom fino, como hoy. Sin regresión.

## 4. Capa afectada
- [x] Componente (`SearchFilters`, `LocationAutocomplete`) + helper puro (`search.helpers`)

## 5. Verificación
- [x] `npm run lint` · `npm run knip` · `npm run map:check` verdes
- [x] Test Vitest — `searchToExploreUrl` con lat/lng/bbox (y sin coords = comportamiento previo)
- [x] `PROJECT-MAP.md` actualizado
