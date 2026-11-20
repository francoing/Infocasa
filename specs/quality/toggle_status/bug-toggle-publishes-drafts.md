# Bug-card: El botón "Publicar" del panel publicaba borradores sin moderación

**Área:** `quality` (dashboard: mis propiedades)
**Tier:** 2 · Mejora puntual
**Estado:** ✅ resuelta

---

## 1. Síntoma
En "Mis propiedades", toda propiedad no publicada mostraba el botón "Publicar" y la etiqueta "Pausada", aunque fuera un borrador o estuviera en revisión. Al tocarlo, el backend la pasaba a `published` sin aprobación del admin.

## 2. Causa raíz
`PropertyRow` usaba `status === "published"` como único criterio (todo lo demás = "pausada"), y el backend `toggle-status` aceptaba cualquier estado.

## 3. Fix
- Backend: `toggle-status` solo `published` ↔ `paused`, otros → `422`; permiso por `isEditableBy` (spec `properties/toggle_status_guard`).
- `PropertyRow`: el botón solo se muestra en `published`/`paused` (tooltip "Reanudar publicación" en pausadas) y la etiqueta usa el estado real (`STATUS_LABELS`).

## 4. Capa afectada
- [x] Componente / página

## 5. Verificación
- [x] Test Vitest `src/test/components/PropertyRow.test.jsx`
- [x] `npm run lint`, `npm run knip`, `npm run map:check`, `vite build` verdes
- [x] `PROJECT-MAP.md` actualizado
