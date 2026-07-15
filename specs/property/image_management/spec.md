# Spec: Gestión de imágenes existentes al editar (borrar + reordenar)

**Área:** `property`
**Estado:** ✅ implementada
**Fuentes:** `Backend-Inmobiliaria/.ai/contracts/api-contract.md` (§Properties, images) · follow-up de `property/image_upload`

## 1. Objetivo
La spec `property/image_upload` cerró la **subida** de imágenes nuevas, pero al **editar** una propiedad no se podían **borrar** ni **reordenar** las imágenes ya persistidas: la galería del form guardaba solo las URLs (sin ID), así que quitar una imagen existente no hacía nada en el backend (quedaba huérfana la acción) y no había forma de cambiar cuál es la portada. Cerrar ese hueco funcional.

## 2. Reglas (backend, ya existentes)
- `DELETE /properties/{id}/images/{imageId}` (204). Si se borró la portada, el backend promueve la siguiente por `order_index` a portada. Autoriza vía `isEditableBy`.
- `PUT /properties/{id}/images/order` con `{ image_ids: number[] }`. Reordena por `order_index` y marca **la primera del array como portada** (`is_cover`). Valida que todos los IDs pertenezcan a la propiedad. Autoriza vía `isEditableBy`.
- `POST /properties/{id}/images` (ya usado) devuelve las imágenes creadas **en el orden enviado**, cada una con `id` → permite mapear los Files nuevos a sus IDs para el reorden final.

## 3. Implementación (front-only)
- **`useProperties.js`**: agregar
  - `deletePropertyImage(propertyId, imageId)` → `DELETE .../images/{imageId}` + invalida caches.
  - `updatePropertyImagesOrder(propertyId, imageIds)` → `PUT .../images/order` `{ image_ids }` + invalida caches.
  - `uploadPropertyImages` devuelve el **array de imágenes creadas** (`res.data`) para poder mapear Files→IDs.
- **`ImageUploader.jsx`**: cada item de la galería puede ser un `File` (nuevo) **o** un objeto `{ id, url, is_cover }` (existente) además del string suelto (compat). `src` resuelve los 3 casos. Reordenar por **drag & drop** (HTML5 `draggable`) reescribe el array vía `onChange`. La 1ª posición muestra el badge "Principal".
- **`PropertyForm.jsx`**:
  - `initialData.images` → galería de objetos `{ id, url, is_cover }` (antes solo `img.url`).
  - Guardar los IDs existentes iniciales para diffear borrados.
  - En `handleSubmit`, además de `fd` + `newFiles`, pasar `imageOps = { deletedImageIds, order, changed }` como 3er arg:
    - `deletedImageIds` = IDs iniciales que ya no están en la galería.
    - `order` = galería en orden de display, cada item `{ type: 'existing', id }` o `{ type: 'new' }`.
    - `changed` = hubo borrados, archivos nuevos, o cambió el orden relativo de los existentes.
- **`EditPropertyPage.jsx`** (`handleSubmit(fd, newFiles, imageOps)`), tras `updateProperty`:
  1. Borrar: por cada `deletedImageIds` → `deletePropertyImage`.
  2. Subir nuevas → obtener sus IDs (en orden).
  3. Si `imageOps.changed` y hay ≥1 imagen final → construir el array final de IDs recorriendo `order` (existentes usan su `id`; los `new` consumen los IDs subidos en orden) y llamar `updatePropertyImagesOrder`. Esto fija orden + portada exactamente como la UI.
- **`CreatePropertyPage.jsx`**: sin cambios de contrato (no hay imágenes existentes; ignora `imageOps`).

## 4. Casos borde
- Editar sin tocar imágenes → sin borrados, sin nuevas, `changed=false` → no se llama delete/order.
- Borrar la portada → el backend promueve la siguiente; si además se reordena, `updateOrder` fija la portada definitiva (gana el orden de la UI).
- Quitar una imagen existente y volver a arrastrar otra a la posición 0 → esa queda portada.
- Fallo al borrar/reordenar una imagen → toast, pero la propiedad ya se actualizó (no se revierte).
- Subir Files nuevos + reordenar en el mismo submit → primero suben (IDs), luego se aplica el orden con todos los IDs.

## 5. Criterios de aceptación
1. Editar y quitar una imagen existente → desaparece de verdad (backend 204). 
2. Arrastrar una imagen existente a la 1ª posición → queda como portada (`is_cover`) tras guardar.
3. Subir nuevas + reordenar en un mismo guardado → orden final coherente con la UI.
4. Editar sin tocar fotos → no dispara delete/order. `npm run lint` verde.

## 6. Fuera de alcance
- Recorte/edición de imagen. Compresión en cliente. Reordenar por teclado (accesibilidad) — mejora aparte.
