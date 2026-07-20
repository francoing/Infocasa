# Bug-card: El edit de propiedad no pre-llena varios campos

**Área:** `property`
**Tier:** 2 · Bugfix
**Estado:** ✅ resuelta

---

## 1. Síntoma
Al **editar** una publicación, el formulario no trae los valores guardados de: **servicios y amenities** (features), **cocheras/garajes** (parking), **año de edificación**, y los checks **acepta mascotas** y **uso profesional**.

## 2. Causa raíz
Dos orígenes:
1. **Mismatch de nombres (front).** `mapInitialToForm` leía `initialData.parking_spaces / construction_year / pets_allowed / professional_use` (snake_case), pero el mapper de propiedad (`buildProperty` → `mapAttributes`) produce **camelCase**: `parkingSpaces / constructionYear / petsAllowed / professionalUse`. → siempre vacío/false.
2. **Features no venían del backend.** `PropertyController@show` hacía `load(['location','propertyType','zone','user','agency','priceHistories','images'])` **sin `features`**. Como `PropertyResource` expone `features` con `whenLoaded('features')`, el detalle omitía la clave → `initialData.features` `undefined` → amenities sin pre-seleccionar.

## 3. Fix
- **Front** (`propertyForm.helpers.js`): `mapInitialToForm` lee camelCase con fallback snake: `initialData.parkingSpaces ?? initialData.parking_spaces`, etc. (idem construction_year, pets_allowed, professional_use).
- **Backend** (`PropertyController@show`, repo `Backend-Inmobiliaria`): se agrega `'features'` al `load(...)` → el detalle incluye las features y el front las pre-selecciona (`features: initialData.features.map(f => f.name)`).

## 4. Capa afectada
- [x] Helper del form (`src/features/property/propertyForm.helpers.js`) + Backend (`PropertyController@show`)

## 5. Verificación
- [x] `npm run lint` + `vite build` (front) verdes
- [x] `pint` + `architecture_check` (backend) verdes
- [x] `GET /properties/47` ahora devuelve `features:[{name:"pileta"},...]`; el edit pre-selecciona amenities, cocheras, año, mascotas y uso profesional
