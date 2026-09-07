# Bug-card: El select "Ubicación" del form de propiedad aparece vacío

**Área:** `property`
**Tier:** 2 · Bugfix
**Estado:** ✅ resuelta

---

## 1. Síntoma
Al crear/editar una propiedad, el select **"Ubicación"** (`location_id`) queda **vacío** ("Selecciona ubicación...") aunque la provincia y el departamento tengan localidades cargadas. Como el campo es **`required`** (y el backend exige `location_id`), **bloquea la creación**. Reproduce: Provincia = Tucumán, Departamento = Yerba Buena, **Zona = Zona Este** → select vacío (aunque existen `Marcos Paz` y `Barrio El Corte` en Yerba Buena).

## 2. Causa raíz
`src/hooks/usePropertyForm.js` — `filteredLocations` (y el effect de reset de `location_id`) filtraban las ubicaciones por un **keyword derivado del nombre de la zona** (`getZoneKeyword`: "Zona Este" → `"este"`), exigiendo que el `neighborhood` **contenga** esa palabra. Los barrios no se llaman según el punto cardinal de su zona → el filtro los descartaba a todos. Acoplamiento incorrecto: `zone_id` es un campo **independiente**, no debe filtrar las ubicaciones.

Qué es el campo: `location_id` referencia un registro normalizado de `Location` (`{province, department, city, neighborhood}`) que el backend requiere (`StorePropertyRequest`: `location_id required, exists:locations,id`). Es legítimo; solo estaba mal filtrado.

## 3. Fix
- `usePropertyForm.js`: `filteredLocations` filtra **solo por provincia + departamento**; se quita el filtro por `zoneKeyword`.
- El effect que resetea `location_id` deja de considerar la zona (y `formData.zone_id` sale de sus deps).
- Se elimina el helper `getZoneKeyword` (queda muerto) de `propertyForm.helpers.js` y su import.

## 4. Capa afectada
- [x] Hook (`src/hooks/usePropertyForm.js`) — + helper puro

## 5. Verificación
- [x] `npm run lint` verde
- [x] `vite build` OK
- [x] Con Tucumán/Yerba Buena el select ahora ofrece `Marcos Paz, Yerba Buena` y `Barrio El Corte, Yerba Buena` (independiente de la zona elegida)
