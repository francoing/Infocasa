# Bug-card: Re-subir la misma imagen tras borrarla no muestra preview

**Área:** `property`
**Tier:** 2 · Bugfix
**Estado:** ✅ resuelta

---

## 1. Síntoma
En el formulario de propiedad (crear/editar), al **subir** fotos, **borrarlas** y volver a **elegir las mismas** con el selector de archivos, no aparece el preview (como sí pasó la primera vez). Reproduce: `/dashboard/properties/create` (o `edit/:id`) → subir imagen por clic → borrarla del grid → clic y elegir el mismo archivo → no se agrega ni previsualiza.

## 2. Causa raíz
Componente `src/features/property/components/ImageUploader.jsx`:
- **Principal:** el `<input type="file">` nunca resetea su `value`. Los navegadores **no disparan `onChange`** si se re-selecciona el mismo archivo que ya figura en el input → `handleFileInput` no corre → nada se agrega. (Por drag&drop sí funciona porque no pasa por el `value` del input.)
- **Secundaria (fuga):** `previewSrc` llamaba `URL.createObjectURL(file)` en **cada render** sin revocar nunca → un blob nuevo por render (memory leak). No causa el síntoma, pero está en la misma ruta de preview.

## 3. Fix
- `handleFileInput`: `e.target.value = ""` tras procesar → permite volver a elegir el mismo archivo (re-dispara `onChange`).
- Preview estable sin fuga: cache `File → objectURL` en un `useRef` (se crea una vez por archivo) y se revocan todos al desmontar (`useEffect` cleanup).

## 4. Capa afectada
- [x] Componente / Página (`src/features/property/components/ImageUploader.jsx`)

## 5. Verificación
- [x] `npm run lint` verde
- [ ] Test Vitest (no necesario: fix de UI/DOM, jsdom no fiable local)
- [x] Verificado por build (`vite build`) y reproducción manual del flujo subir→borrar→re-subir
