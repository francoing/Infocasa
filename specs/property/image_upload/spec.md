# Spec: Subida de imágenes (arreglar flujo roto)

**Área:** `property`
**Estado:** ✅ implementada
**Fuentes:** `Backend-Inmobiliaria/.ai/contracts/api-contract.md` (§Properties, images)

## 1. Objetivo
Hoy `PropertyForm` manda los archivos de imagen como `images[]` en el POST de la propiedad, pero el backend **no procesa** imágenes ahí → **las imágenes nuevas no se guardan**. El backend sí las acepta en el endpoint dedicado `POST /properties/{id}/images` (clave `files`, multipart). Cerrar el flujo: crear/editar propiedad → subir los archivos nuevos a `/images`.

## 2. Reglas (backend)
- `POST /properties/{id}/images` acepta `files[]` (`image`, máx 5 MB) **o** `urls[]`. La primera imagen sin cover se marca `is_cover`.
- El POST/PUT de la propiedad **no** maneja imágenes.

## 3. Implementación (front-only)
- `PropertyForm.handleSubmit`: dejar de meter `images[]` en el FormData de la propiedad; pasar los **Files nuevos** como 2º argumento → `onSubmit(fd, imageFiles)`.
- `useProperties`: nueva `uploadPropertyImages(propertyId, files)` → `POST /properties/{id}/images` con `files[]` + invalida caches.
- `CreatePropertyPage` / `EditPropertyPage`: tras crear/actualizar, si hay `imageFiles`, subirlas a `/images`.

## 4. Casos borde
- Sin archivos nuevos → no se llama `/images`.
- Al editar, las imágenes existentes (URLs) no se re-suben (ya están); solo suben los Files nuevos.
- Error al subir imágenes → toast, pero la propiedad ya quedó creada (no se revierte).

## 5. Criterios de aceptación
1. Crear una propiedad con fotos → las fotos quedan persistidas (via `/images`).
2. Editar y agregar fotos → se suman.
3. No hay doble-upload (los Files ya no van en el POST de la propiedad). `npm run lint` verde.

## 6. Fuera de alcance (follow-up)
- **Borrar** imágenes existentes al editar (`DELETE /images/{id}`) y **reordenar** (`PUT /images/order`): requieren que el form trackee los IDs de imagen (hoy la galería guarda solo URLs). Queda como mejora aparte.
