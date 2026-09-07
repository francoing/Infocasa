# Bug-card: "features.0 is invalid" al crear propiedad

**Área:** `property`
**Tier:** 2 · Bugfix
**Estado:** ✅ resuelta

---

## 1. Síntoma
Al crear una propiedad, el backend rechaza con `422`: *"The selected features.0 is invalid. (and 1 more error)"*. Ocurre al tildar ciertos "extras" (p. ej. Jardín, Quincho).

## 2. Causa raíz
Dos defectos combinados en el manejo de features:
1. **Catálogo hardcodeado divergente.** `TechnicalDetailsSection` ofrecía una lista fija `EXTRAS` (`jardin, pileta, parrilla, quincho, balcon, terraza, lavadero, patio, azotea, fondo`) que togglea en `formData.features`. Pero `property_features` (backend) solo tiene 11 nombres válidos (`pileta, balcon, terraza, apto_credito, patio, parrilla, seguridad, gimnasio, sum, calefaccion, aire_acondicionado`). Tildar `jardin/quincho/lavadero/azotea/fondo` mandaba nombres inexistentes → falla `features.*` = `exists:property_features,name`.
2. **La sección de amenities real nunca se mostraba.** `usePropertyFormRefs` leía `availableFeatures: featRes.data?.data` (un nivel de más; el endpoint devuelve `{data:[...]}` igual que locations/types/zones). Quedaba `[]`, y `AmenitiesSection` solo renderiza si `availableFeatures.length > 0` → oculta. Así, la única fuente de features era la lista hardcodeada inválida.

## 3. Fix
- `usePropertyFormRefs.js`: `availableFeatures: featRes.data || []` (alineado con locations/types/zones) → cargan las 11 features reales y `AmenitiesSection` se muestra.
- `TechnicalDetailsSection.jsx`: se elimina la lista `EXTRAS` y su bloque de toggles (y el prop `onFeatureToggle`). Las features se eligen **solo** en `AmenitiesSection`, driveada por el catálogo del backend → imposible mandar un nombre inválido.
- `PropertyForm.jsx`: se quita `onFeatureToggle` del `TechnicalDetailsSection`.

## 4. Capa afectada
- [x] Hook (`src/hooks/usePropertyFormRefs.js`) + Componentes (`form/TechnicalDetailsSection`, `PropertyForm`)

## 5. Verificación
- [x] `npm run lint` verde
- [x] `vite build` OK
- [x] Confirmado contra la DB real: `property_features` tiene 11 nombres; `AmenitiesSection` ahora los ofrece y son todos válidos para `exists:property_features,name`

## 6. Nota / deuda
El backend tiene columnas booleanas `has_grill/has_quincho/has_swimming_pool/has_garden` que el front **no** envía (buildPropertyPayload no las incluye). Si se quiere soportar "quincho/jardín" como destacados, es una feature aparte (mapearlos a esos `has_*`), no parte de este fix.
