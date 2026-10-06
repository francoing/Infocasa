# Bug-card: El popup del mapa siempre muestra la foto genérica

**Área:** `explore`
**Tier:** 2 · Bugfix / Mejora puntual
**Estado:** ✅ resuelta

---

## 1. Síntoma
En `/explore` (y en el mapa del home), al abrir el popup de cualquier propiedad la miniatura es
**siempre la misma foto de stock** (Unsplash), aunque la propiedad tenga fotos cargadas.

Reproducir: `/explore` → click en cualquier pin → la imagen del popup no es de la propiedad.

## 2. Causa raíz
Capa **hook** (mapper), drift de contrato.

`buildPopupHtml` toma la miniatura de `property.images?.[0]?.url || property.imageUrl`. Pero el
mapa consume `GET /properties/map`, cuyo payload liviano **no trae `images[]`**. Entonces
`buildMapMarker` → `buildProperty(item)` → `mapImageUrl(item)` no encuentra imágenes y devuelve
`FALLBACK_IMAGE`. Resultado: todo pin terminaba con la foto genérica.

El backend agregó al payload del mapa **`image_url`**: la primera foto en el orden de la galería
(menor `order_index`), URL absoluta, o `null` si no hay fotos
(`Backend-Inmobiliaria/.ai/contracts/api-contract.md` → "GET properties/map — shape").

## 3. Fix
- `src/hooks/property.mappers.js` → `buildMapMarker` mapea `imageUrl: item.image_url || FALLBACK_IMAGE`.
  Sin foto (`null`) se mantiene la genérica, igual que las cards del resto de la app.
- Compatible con deploy desfasado: si el backend todavía no manda `image_url`, el popup queda
  como antes (genérica), sin romperse.

## 4. Capa afectada
- [x] Hook (`src/hooks/`)
- [ ] Store (`src/store/`)
- [ ] Componente / Página (`src/features/` o `src/common/`)
- [ ] Router (`src/router/`)

## 5. Verificación
- [x] `npm run lint` verde
- [x] Test Vitest `src/test/hooks/propertyMappers.test.js`: usa `image_url`; `null` y ausente →
  genérica; conserva coordenadas/`exact`; y **el HTML del popup contiene la miniatura real**.
  Escrito primero y verificado en rojo contra el código anterior (2 fallas), verde con el fix.
- [x] `PROJECT-MAP.md` actualizado
