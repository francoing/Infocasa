# Spec: Plano y video en la tarjeta del marketplace

**Área:** `property` · `common/PropertyCard`
**Tier:** 3 (feature)
**Estado:** ✅ implementada
**Backend:** spec `Backend-Inmobiliaria/specs/properties/floor_plan/spec.md` (campo `floor_plan` / `floor_plan_url`)

---

## 1. Objetivo
Que las tarjetas de propiedades del marketplace muestren los íconos de **plano** y **video** cuando la propiedad los tiene, y que al apretarlos se abra un pop-up con el plano o el video. Para eso, quien publica puede subir un plano (imagen, opcional) al crear o editar.

## 2. Reglas
- El botón de plano aparece solo si la propiedad tiene `floorPlanUrl`; el de video solo si tiene al menos un video `ready` con `url` (mismo criterio que `PropertyVideos`).
- Apretar un botón abre el pop-up y **no** navega a la ficha; el resto de la tarjeta sigue navegando.
- El pop-up muestra el video (con selector si hay varios) o la imagen del plano. Cierra con X, clic en el fondo o Escape.
- El plano es opcional, una sola imagen JPG/PNG/WEBP de hasta 10 MB (se valida antes de enviar y el backend vuelve a validar).
- Al editar: el plano cargado se ve como vista previa; se puede reemplazar o quitar. Quitarlo envía `remove_floor_plan=1`.

## 3. Datos (contrato)
- `POST /properties` y `PUT /properties/{id}` (multipart): `floor_plan` (archivo) y, al editar, `remove_floor_plan`.
- `PropertyResource.floor_plan_url` (string | null) → mapper `floorPlanUrl`.

## 4. Componentes
- `common/components/PropertyMediaModal.jsx` (nuevo, portal).
- `common/components/PropertyCard.jsx` (botones en `MediaBottomBar`).
- `features/property/components/form/FloorPlanSection.jsx` (nuevo) en `PropertyForm`.
- `hooks/usePropertyForm.js` (`useFloorPlanField`), `features/property/propertyForm.helpers.js`, `hooks/property.mappers.js`.

## 5. Criterios de aceptación
1. Con plano, la tarjeta muestra el botón de plano; sin plano, no.
2. Con video listo, la tarjeta muestra el botón de video; con video procesando o sin video, no.
3. Apretar plano o video abre el pop-up correspondiente sin navegar.
4. El formulario de crear y editar tiene la sección de plano, opcional, y rechaza archivos que no son imagen o pesan más de 10 MB.
5. Tests: `components/PropertyCard`, `helpers/floorPlan`, `hooks/propertyMappers`.

## 6. Fuera de alcance
Íconos de 3D, iluminación y ubicación de la referencia; mostrar el plano en la ficha de detalle.
