# Spec: Filtros avanzados de búsqueda (coherencia con el contrato)

**Área:** `search`
**Estado:** 🚧 en implementación
**Fuentes:** `.ai/contracts/api-contract.md` §`GET properties/search` · `PropertySearchRequest.php` (backend) · auditoría de gobernanza 2026-07-17

## 1. Problema
El backend (`PropertySearchRequest`) valida ~20 filtros de búsqueda, pero el front (`SearchPage` + `useProperties`) solo cablea 7: `location`(→city), `minPrice`, `maxPrice`, `currency`, `type` (hardcodeado a Casa/Departamento), `agencyId`, `operation`, `sort`. Quedan sin exponer filtros que el usuario final pide: **provincia, departamento, ambientes, dormitorios, cochera, condición, mascotas, uso profesional**, y el **tipo de propiedad real** (hoy hay solo 2 tipos fijos por código, no los del backend). Es drift de coherencia funcional back↔front: el contrato ofrece, el front ignora.

## 2. Alcance
Cablear en la UI de búsqueda los filtros que el backend **ya** soporta (no se toca el backend):

| Filtro UI | Param backend | Fuente de opciones |
| :--- | :--- | :--- |
| Provincia | `province` | distinct de `/locations` (via `usePropertyFormRefs`) |
| Departamento | `department` | cascada de provincia sobre `/locations` |
| Tipo de propiedad | `property_type_id` | `/property-types` (reemplaza el hardcode Casa/Departamento) |
| Ambientes (mín) | `rooms_min` | select 1..5+ |
| Dormitorios (mín) | `bedrooms_min` | select 1..5+ |
| Cocheras (mín) | `parking_spaces_min` | select 1..3+ |
| Condición | `condition` | `new\|under_construction\|good\|to_refurbish` |
| Acepta mascotas | `pets_allowed` | checkbox (solo se envía si `true`) |
| Uso profesional | `professional_use` | checkbox (solo se envía si `true`) |

Se **conservan** los filtros actuales (location/city Geoapify, precio, moneda, inmobiliaria, operación, orden) con el mismo comportamiento.

## 3. Cambios técnicos
- **`src/hooks/properties.query.js`** (nuevo): `buildSearchQueryString(filters)` puro y **table-driven** (mapa filtro→param) → mantiene la complejidad de `useProperties` baja al sumar ~10 params. Conserva la lógica de `per_page` (6 con paginación, 12 sin) y el default de operación/moneda.
- **`src/hooks/useProperties.js`**: el `queryFn` usa `buildSearchQueryString`; se elimina el armado inline de params.
- **`src/features/search/search.helpers.js`** (nuevo): `DEFAULT_FILTERS`, `readFilters(searchParams)`, `filtersToUrlParams(filters)` (solo no-vacíos), `deriveLocationOptions(locations, province, department)` (provincias/departamentos distinct en cascada).
- **`src/features/search/components/SearchFilters.jsx`** (nuevo): toda la barra lateral de filtros (incluye el autocompletado Geoapify de ciudad, que hoy vive inline en `SearchPage`). Recibe `form`, `setField`, `onApply`, `onReset` y los datos de referencia.
- **`src/features/search/pages/SearchPage.jsx`**: pasa a un único estado `form` (draft) + `readFilters(searchParams)` (committed) y delega la barra a `SearchFilters` → la página queda fina. **Sale de `LEGACY`** (`max-lines-per-function`).

## 4. Invariantes (sin regresión)
- Comportamiento actual idéntico para los 7 filtros preexistentes (incluido el mapeo `Casa/Departamento`→id como compat de URLs `?type=` viejas cuando no viene `propertyTypeId`).
- El **orden lo sigue imponiendo el backend** (destacadas primero); el front nunca reordena. `sort` sigue siendo secundario (`price_asc|price_desc`).
- Moneda nativa sin conversión; si el usuario no elige, el backend aplica default por operación.
- Filtros vacíos no se agregan a la URL ni a la query.

## 5. Criterios de aceptación
1. Los 9 filtros nuevos modifican la query a `/properties/search` con el param correcto; provincia→departamento cascadea; tipos de propiedad salen del backend.
2. `npm run lint` verde con `SearchPage` **fuera de `LEGACY`**; todas las funciones bajo complejidad 20 / 200 líneas.
3. `vite build` compila.
4. Reset limpia todos los filtros (viejos y nuevos).

## 6. Fuera de alcance
- Paridad del **mock** (`VITE_USE_MOCK`): el mock solo interpreta city/operation/property_type_id/price; los filtros nuevos pasan de largo en modo mock (dev). Se puede extender aparte.
- Filtro `features[]` (amenities multi-select) y `neighborhood`: se dejan para una segunda iteración (mayor UI); el builder ya los soporta si se agregan a la UI.
- Rango de ambientes/dormitorios con máximo (`rooms_max`, `bedrooms_max`): por ahora solo mínimo.
