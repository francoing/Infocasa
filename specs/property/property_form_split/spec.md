# Spec: Partir PropertyForm (hook de control + helpers puros + secciones)

**Área:** `property`
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` (lógica fuera del JSX; un componente por responsabilidad) · auditoría de sanidad 2026-07-15 (paydown #9)

## 1. Objetivo
`PropertyForm.jsx` (1068 líneas) era el peor god-component: estado + 3 efectos + ~11 handlers + cascada derivada + un `handleSubmit` que arma el multipart + JSX de ~10 secciones. Arrastraba las 3 deudas (`complexity`, `max-lines`, `max-lines-per-function`). Sacarlo **entero** del LEGACY separando lógica, transformación y presentación.

## 2. Cortes
- **`features/property/propertyForm.helpers.js`** (puro): `INITIAL_STATE`, `mapInitialToForm` (edición), `buildPropertyPayload` (multipart, con `appendIfSet` + lookup `OPERATION_BY_STATUS` para no inflar complejidad), `buildImageOps` (ver spec `property/image_management`), `getZoneKeyword`, `findClosestLocation`. La transformación pesada vive acá → el hook queda fino.
- **`hooks/usePropertyForm.js`**: controlador del form — estado, 3 efectos (poblar / derivar provincia-depto / reset de ubicación), handlers, cascada derivada (provincias/departamentos/ubicaciones filtradas) y `handleSubmit` (valida → arma payload → `onSubmit`). Compone `usePropertyFormRefs` (datos). Bajo 250 líneas / complejidad 20.
- **`features/property/components/form/`** (presentacionales): `MainInfoSection`, `TechnicalDetailsSection` (+extras), `ConditionSection`, `LocationSection` (cascada + mapa), `ExpensesSection`, `CertificationSection`, `AmenitiesSection`, `PublicationTypeSelector`.
- **`PropertyForm.jsx`**: composición fina (llama `usePropertyForm`, arma las columnas con las secciones). 1068 → 95 líneas.

## 3. Invariantes (sin cambio de comportamiento)
- Mismo markup/estilos; mismo payload multipart al backend (mismas keys, mismas condiciones de `append`).
- Cascada provincia→departamento→ubicación idéntica (incluye reset al cambiar filtros y auto-completado por clic en el mapa).
- Validaciones iguales (provincia, departamento, comprobante obligatorio en Alquiler Temporario).
- Gestión de imágenes (subir/borrar/reordenar) intacta vía `buildImageOps`.
- Certificación solo en Alquiler Temporario; selector de tipo de publicación solo al crear.

## 4. Criterios de aceptación
1. `PropertyForm.jsx` fuera del LEGACY; hook < 250 líneas y componentes < 300, todo bajo complejidad 20. `npm run lint` verde.
2. `vite build` compila (imports resuelven, JSX válido).
3. Crear y editar propiedad funcionan igual (todas las secciones, mapa, certificación, imágenes).

## 5. Fuera de alcance
- `usePropertyFormRefs` (ya extraído en spec `property/form_refs_hook`).
- Rediseño de UX del formulario.
