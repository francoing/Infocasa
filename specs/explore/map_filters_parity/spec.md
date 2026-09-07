# Spec: Paridad de filtros listado ↔ mapa

**Área:** `explore` + `search`
**Tier:** 3 · Feature
**Estado:** ✅ implementada

---

## 1. Problema / objetivo
El listado (`/search`) filtra con un panel completo; el mapa (`/explore`) solo mostraba todas
las propiedades de una operación (sin filtros). Se quiere **paridad bidireccional**:
- Desde el listado se puede "Ver en el mapa" con los **mismos filtros**.
- Desde el mapa se puede "Ver listado" con los **mismos filtros**.
- Cambiar filtros en **cualquiera** de las dos vistas re-busca en esa vista.

## 2. Diseño
- **Filtros compartidos por query params** (mismo esquema `readFilters`/`filtersToUrlParams`).
  Ambas vistas leen y escriben los mismos parámetros.
- **`/explore` pasa a ser filter-driven** (query params). Se mantiene `/explore/:operation`
  como **ruta de compatibilidad** (enlaces viejos): si la URL no trae `operation`, se siembra
  desde el segmento de la ruta.
- **Datos del mapa**: `useProperties(filters)` (mismo endpoint `/properties/search` que el
  listado) en vez de `useExploreProperties(op)`. → **"Todas las operaciones" funciona en el mapa.**
- **Cruce = conservar el query string, cambiar la ruta**:
  - listado → mapa: `/explore?<mismos params>` (+ coords para zoom si se eligió sugerencia).
  - mapa → listado: `/search?<mismos params>`.
- **UI del panel de filtros** (`SearchFilters`, reusado en ambas vistas):
  - Botón de cruce arriba: **"Ver en el mapa"** en el listado, **"Ver listado"** en el mapa.
  - **"Aplicar Filtros"** se ubica **debajo** del botón de cruce.
  - En el mapa: sidebar en desktop, drawer en mobile (igual que el listado).
- **Zoom**: el mapa centra por `focus` (coords en la URL) o geocodificando la `location`
  (hook `useGeoapifyGeocode`, ya existente). Una sola caja de ubicación: la del filtro.

## 3. Fuera de alcance
- Clustering/paginación avanzada del mapa (sigue con `per_page` alto).
- Mostrar en el mapa un resumen textual de resultados (solo marcadores).

## 4. Verificación
- Buscar en el listado con filtros → "Ver en el mapa" → mismos resultados en el mapa.
- En el mapa, cambiar filtros + "Aplicar" → el mapa re-busca.
- "Ver listado" desde el mapa → listado con los mismos filtros.
- "Todas las operaciones" → el mapa muestra las 3 operaciones.
- Gates: lint · knip · map:check · test · build.
