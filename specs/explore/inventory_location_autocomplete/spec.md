# Spec: Autocomplete de búsqueda por inventario (reemplaza Geoapify)

**Área:** `search` + `home` + `explore`
**Tier:** 3 · Feature
**Estado:** ✅ implementada

---

## Problema
El autocomplete de ubicación (home + filtro) usaba **Geoapify**:
1. Dependía de la key/dominio → en QA/localhost no devolvía nada ("no me da resultados").
2. Sugería lugares genéricos que podían no tener propiedades, y cuyo nombre **no matcheaba**
   el `city` real de la propiedad → al buscar, 0 resultados.

## Diseño
Autocomplete sobre el **inventario real** de ubicaciones (`/locations`), que ya trae coords.
- **Backend** (repo `Backend-Inmobiliaria`, spec `properties/locations_property_count`):
  `/locations` expone `properties_count` (publicadas).
- **`useLocationSearch`** (hook, drop-in de `useGeoapifyAutocomplete`): local sobre las
  `/locations` cacheadas; sugiere solo lugares con `properties_count > 0` (si el backend aún
  no manda el campo, no filtra → rollout). Helper `buildLocationSuggestions` (con test).
- **Valor de la sugerencia** = `city` (matchea el filtro `location → city LIKE` del backend) +
  `label` "Ciudad, Provincia" para el dropdown + coords para el zoom.
- **Zoom del mapa**: `findLocationFocus` (helper, con test) resuelve coords por texto desde el
  inventario cuando no vienen en la URL. Se retiró `useGeoapifyGeocode`.

## Alcance de Geoapify (lo que NO cambia)
Geoapify sigue **solo** para: creación de propiedad (`MapLocationSelector`/`geocodeAddress`,
geocodifica direcciones arbitrarias) y el gate de ubicación (`useUserProvince`, reverse geocode).

## Verificación
- Tests: `buildLocationSuggestions` (filtra sin-propiedades, dedupe, acentos, rollout) y
  `findLocationFocus` (match exacto/contiene, sin coords).
- Manual: tipear en el home/filtro sugiere lugares con propiedades; al elegir y buscar, hay
  resultados; el mapa hace zoom a la zona.
- Gates: lint · knip · map:check · test · build.
