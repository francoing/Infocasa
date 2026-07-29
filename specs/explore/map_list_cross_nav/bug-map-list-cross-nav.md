# Bug-card: Cruce de navegación mapa ↔ listado conservando la búsqueda

> **Plantilla TIER 2.** Mejora puntual de navegación entre dos vistas existentes.

**Área:** `explore` + `search`
**Tier:** 2 · Bugfix / Mejora puntual
**Estado:** ✅ resuelta

---

## 1. Síntoma
Estando en el **mapa** (`/explore/:operation`) no hay forma de saltar al **listado**
con la misma búsqueda, ni al revés desde el listado (`/search`) al mapa. El usuario
que buscó una zona pierde el contexto al cambiar de vista.

## 2. Causa raíz
No es un bug de datos ni de contrato: falta el puente de navegación. Las dos vistas
ya comparten operación y ubicación por URL, pero en distinto idioma:
- Explore: operación en el path (`Comprar`/`Alquilar`/`Temporario`) + `location`/`lat`/`lng`/`bbox`.
- Search: `operation` = `sale`/`rent`/`temporary_rent` + `location` (texto, sin coords).

## 3. Fix
- `explore.helpers.js` (nuevo): `exploreToSearchUrl({ operationApi, location })` → `/search?...`.
- `search.helpers.js`: `searchToExploreUrl(filters)` → `/explore/{Op}?location=...` (mapa inverso; default `Comprar` si la operación es "Todas").
- `ExplorePage.jsx`: botón **"Ver propiedades en listado"** debajo del mapa.
- `SearchFilters.jsx`: botón **"Ver en el mapa"** bajo el título "Filtros", antes de "Restablecer"; `SearchPage` lo cablea con `navigate(searchToExploreUrl(...))`.

**Limitación conocida:** Listado→Mapa no lleva coords (el listado no las guarda), así
que el mapa abre con la operación correcta y el buscador precargado, pero sin zoom fino
hasta reseleccionar en el autocomplete. Aceptable.

## 4. Capa afectada
- [x] Componente / Página (`src/features/`) + helpers puros

## 5. Verificación
- [x] `npm run lint` verde
- [x] Test Vitest — helpers `exploreToSearchUrl` / `searchToExploreUrl` + botón de filtros
- [x] `PROJECT-MAP.md` actualizado
