# Bug-card: La tarjeta de propiedad no muestra video ni quién publica

**Área:** `property`
**Tier:** 2 · Mejora puntual
**Estado:** ✅ resuelta

---

## 1. Síntoma
En los listados, `PropertyCard` no indica si la propiedad tiene video ni muestra la foto de perfil (dueño directo o inmobiliaria) de quien publica; solo dice "Inmob: {nombre}". En portales de referencia la tarjeta muestra íconos de contenido (video, plano) y el logo del anunciante sobre la foto.

## 2. Causa raíz
Componente: `PropertyCard` no renderizaba `property.videos` ni el avatar de `property.owner`, aunque `buildProperty` (mapper) ya los expone (`videos`, `owner`).

## 3. Fix
- `src/common/components/PropertyCard.jsx`: nuevo sub-componente `MediaBottomBar` (franja inferior de la foto) con ícono de video —solo si hay videos `ready` con `url`, igual que `PropertyVideos`— junto a la etiqueta de condición, y avatar redondo de `owner.avatar_url` a la derecha. Helpers puros `hasVideo` y `sellerAvatar`. La etiqueta de condición pasa a la franja (antes absoluta abajo-izquierda).
- El plano queda fuera (etapa 2: requiere campo en backend y en el formulario).

## 4. Capa afectada
- [x] Componente / Página (`src/common/components/PropertyCard.jsx`)

## 5. Verificación
- [x] `npm run lint` verde
- [x] Test Vitest (`src/test/components/PropertyCard.test.jsx`)
- [x] `PROJECT-MAP.md` actualizado
- [ ] **Backend:** exponer `avatar_url` en `owner` de `PropertyResource` y cargar `videos` en los listados (hoy no vienen: la tarjeta queda sin ícono ni avatar hasta entonces)
