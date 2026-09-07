# Spec: Partir PropertyDetailPage en sub-componentes de presentación

**Área:** `property`
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` (un componente por responsabilidad; lógica fuera del JSX) · auditoría de sanidad 2026-07-15 (paydown #3 del ratchet)

## 1. Objetivo
`PropertyDetailPage.jsx` (537 líneas) es un **gigante de presentación**: 0 `useState`, 0 handlers propios — todo el estado viene de `usePropertyDetail(id)`. Su deuda (`complexity`, `max-lines`, `max-lines-per-function` en el LEGACY) es puramente JSX monolítico. Partirlo en sub-componentes presentacionales → sale **entero** del LEGACY (a diferencia de #1/#2, que solo cerraron boundary). Refactor mecánico, sin tocar lógica.

## 2. Cortes (nuevos en `features/property/components/detail/`)
Cada uno es presentacional (recibe props, sin acceso a datos):
- `PropertyGalleryGrid.jsx` — grilla de 5 imágenes + badge "Precio Reducido". Props: `{ images, hasPriceDrop, onOpen(index) }`.
- `PropertyGalleryLightbox.jsx` — lightbox fullscreen (framer-motion). Props: `{ images, activeImage, setActiveImage, onClose }`.
- `PropertySpecs.jsx` — specs rápidos (dorm/baños/sup/tipo). Props: `{ property }`.
- `PropertyTechnicalDetails.jsx` — ficha técnica + amenities. Props: `{ property }`. Calcula `hasTech`/`hasFeatures` adentro; devuelve `null` si no hay nada.
- `PropertyPriceBox.jsx` — caja de precio + rebaja. Props: `{ property }`.
- `PropertyContactForm.jsx` — publisher + form de lead. Props: `{ publisher, formData, setFormData, onSubmit, isSubmitting, submitSuccess, setSubmitSuccess, submitError }`.

La página queda como **composición**: breadcrumbs/acciones (share/favorite), título, descripción, sección de mapa, y los 6 sub-componentes + relacionadas.

## 3. Mejora de complejidad (no solo mover líneas)
La ficha técnica tenía cadenas de ternarios anidados para traducir `condition`/`disposition`/`orientation` (cada una ~3-4 ramas → inflaban la complejidad ciclomática). Se reemplazan por **lookup maps** (`const CONDITION_LABELS = {...}` → `MAP[x] || x`): complejidad cero, más legible, un solo lugar por dominio de valores.

## 4. Invariantes (no cambia comportamiento)
- Mismo markup/estilos y mismo cableado del hook. Solo se mueve JSX a hijos.
- El orden "destacadas primero" y cualquier lógica siguen en el backend/hook — la UI no reordena nada.
- La galería/lightbox comparten `activeImage`/`showGallery` del hook (state levantado en la página, pasado por props).

## 5. Criterios de aceptación
1. `PropertyDetailPage.jsx` sale **completo** del `LEGACY` en `.eslintrc.cjs` (sin `complexity`/`max-lines`/`max-lines-per-function`).
2. `npm run lint` verde con la página y los 6 hijos bajo los umbrales de `component`/`page`.
3. La página de detalle se ve y funciona igual (galería, lightbox, ficha, contacto, relacionadas).

## 6. Fuera de alcance
- `PropertyMap` (ya es su propio componente; su deuda `rules-of-hooks` es otra spec).
- Cambios de diseño/UX. Solo reestructuración.
