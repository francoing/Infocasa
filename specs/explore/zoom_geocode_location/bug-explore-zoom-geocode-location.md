# Bug-card: El mapa no hace zoom a la ubicación buscada (sin coords / "Todas las operaciones")

**Área:** `explore`
**Tier:** 2 · Bugfix
**Estado:** ✅ resuelta

---

## 1. Síntoma
En la búsqueda, con **"Todas las operaciones"** + un lugar (ej. "Termas"), el mapa muestra
**todo** en vez de centrarse en esa zona. Con una operación específica parecía funcionar.

## 2. Causa raíz
`ExplorePage` armaba el `focus` **solo** desde `lat`/`lng` en la URL (`readFocus`). Si llegaba
una `location` por **texto sin coords** (búsqueda que no eligió sugerencia, o el fallback de
"Todas" → "Comprar" en `searchToExploreUrl`), `focus` quedaba **null** → `ProvinceMap`/`MapView`
cae a `fitBounds(todos los marcadores)` = "mapa entero". La correlación con "Todas" es indirecta:
al mapear a "Comprar", el set de marcadores es más amplio y el encuadre se ve como todo el país.

## 3. Fix
- `useGeoapifyGeocode` (hook nuevo) + `useGeoapifyGeocode.helpers` (`parseFirstGeocode`, con test):
  geocoding directo one-shot (texto → `{lat,lng,bbox}`), cacheado y cancelable.
- `ExplorePage`: si `focus` es null y hay `location` (texto), geocodifica y usa `effectiveFocus =
  focus || geocodedFocus`. Con coords en la URL no llama a Geoapify. Ahora el mapa **siempre**
  centra en el lugar buscado, sin importar la operación ni cómo llegó.

> Nota separada (no es este bug): "Todas" en el filtro mapea a `/explore/Comprar` (la vista de
> mapa exige una operación). El zoom ya funciona; si se quiere mostrar las 3 operaciones juntas
> en el mapa es otra feature.

## 4. Capa afectada
- [x] Hook (`src/hooks/`) + Página (`ExplorePage`)

## 5. Verificación
- [x] `npm run lint` · `knip` · `map:check` · `test` (53) · `build` verdes
- [x] Test de `parseFirstGeocode` (resultado, bbox ausente/mal formado, sin coords)
- [x] `PROJECT-MAP.md` actualizado (+ reconciliado el hook fantasma `useGeocodeSearch`)
