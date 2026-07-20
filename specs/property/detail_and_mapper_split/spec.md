# Spec: Adelgazar usePropertyDetail y mapProperty (helpers puros)

**Área:** `property` (capa de datos)
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` · auditoría de sanidad 2026-07-15 (paydown #11)

## 1. Objetivo
Cerrar las 2 últimas deudas de hooks del ratchet:
- `usePropertyDetail` violaba `max-lines-per-function` (la función del hook superaba 150 líneas por los configs inline de queries/mutations).
- `mapProperty` (en `useProperties`) violaba `complexity` (**50**): decenas de fallbacks `||`/`??`/`?.` por campo en un solo objeto.

## 2. Cambios
- **`usePropertyDetail.helpers.js`** (nuevo): `DEFAULT_LEAD_FORM`, `rankRelatedProperties(allProps, base)` (scoring de relacionadas, antes inline en el queryFn) y `optimisticToggleFavorite(queryClient, id)` (update optimista del cache). `usePropertyDetail` los usa → su función baja de ~182 a ~130 líneas.
- **`property.mappers.js`** (nuevo): mappers por grupo (`mapCore`, `mapDimensions`, `mapClassification`, `mapMedia`, `mapAttributes`, `mapMeta`, `mapImageUrl`, `mapLocationStr`) + `buildProperty(item)` que los ensambla. Cada función queda < complejidad 20. El label de operación pasa a lookup map.
- **`useProperties.js`**: `mapProperty` ahora es `if (!p) return null; return buildProperty(p.data ? p.data : p)` — se mantiene exportado desde acá (sin tocar imports en el resto del código).

## 3. Invariantes (sin cambio de comportamiento)
- `mapProperty` produce **exactamente** el mismo shape (mismos campos, mismos fallbacks; `operation` sale→Venta / rent→Alquiler / development→Desarrollo / else→Venta).
- `usePropertyDetail` expone la misma API; relacionadas rankeadas igual; favorito optimista idéntico; envío de lead igual.

## 4. Criterios de aceptación
1. `useProperties.js` y `usePropertyDetail.js` fuera del LEGACY; todas las funciones < complejidad 20 y < 150 líneas. `npm run lint` verde.
2. `vite build` compila.
3. Detalle de propiedad, relacionadas, favoritos y listados se ven/comportan igual.

## 5. Fuera de alcance
- `PropertyCard` (complexity), `HomePage` y `SearchPage` (tamaño) — últimos 3 del ratchet, specs aparte.
