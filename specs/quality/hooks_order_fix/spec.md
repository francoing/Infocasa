# Spec: Corregir orden de hooks (early-return antes de hooks) — bugs reales

**Área:** `quality` (transversal)
**Estado:** ✅ implementada
**Fuentes:** `react-hooks/rules-of-hooks` · auditoría de sanidad 2026-07-15 (paydown #4 del ratchet)

## 1. Objetivo
Tres componentes llaman hooks **después** de un `return null` condicional, violando las Reglas de Hooks. No es estilo: si la condición del guard cambia entre renders del mismo componente, el número de hooks cambia y React lanza *"Rendered more hooks than during the previous render"* (crash / estado corrupto). Mover los hooks **arriba** de los guards. Cierra 3 entradas `react-hooks/rules-of-hooks` del ratchet.

## 2. Bugs (concretos)
- **`ProvinceMap.jsx`** — `useEffect` (handler global del popup) está tras `if (!properties || length===0) return null` y `if (markers.length===0) return null`. Los resultados de búsqueda cargan async (**vacío → poblado**): en el primer render el `useEffect` se saltea, en el segundo corre → **el conteo de hooks cambia → crash**. El más peligroso (condición realmente variable).
- **`PropertyMap.jsx`** — `useState(false)` (hover) tras `if (!latitude || !longitude) return null`. Al reusarse la instancia entre propiedades con/sin coordenadas, rompe el orden.
- **`PropertyCard.jsx`** — `useToast()` + 2 `useState` tras `if (!property) return null`.

## 3. Implementación (reordenar; sin cambio de comportamiento)
- **ProvinceMap**: mover el `useEffect` de `window.__mapPropertyClick` al tope del componente (antes de los guards). Depende solo de `onPropertyClick`; registrar el handler siempre es inocuo.
- **PropertyMap**: declarar `const [hovering, setHovering] = useState(false)` como primera línea; el guard de coordenadas va después.
- **PropertyCard**: subir `useToast()` + `useState(isFavorited)` + `useState(loading)` arriba del guard. El init pasa a `property?.isFavorited || false` (no romper si `property` es null antes del guard).
- **`.eslintrc.cjs`** (aprieta el ratchet):
  - `PropertyMap.jsx` y `ProvinceMap.jsx`: sale su **única** entrada (`react-hooks/rules-of-hooks`) → **fuera del LEGACY por completo**.
  - `PropertyCard.jsx`: se quita `react-hooks/rules-of-hooks`; quedan `complexity` + `no-restricted-imports` (deuda aparte).

## 4. Invariantes
- Mismo render visible. Los guards siguen devolviendo `null` en los mismos casos; solo se ejecutan **después** de declarar los hooks.
- `react-hooks/rules-of-hooks` es `error` global: al salir del LEGACY, queda **enforced** sobre estos archivos.

## 5. Criterios de aceptación
1. Los 3 componentes declaran todos sus hooks antes de cualquier `return`.
2. `PropertyMap` y `ProvinceMap` fuera del LEGACY; `PropertyCard` sin `rules-of-hooks`. `npm run lint` verde.
3. Comportamiento visual idéntico (card de favoritos, mapa de propiedad, mapa de provincias con clustering).

## 6. Fuera de alcance
- El hack `getQueryClient` (try/`useQueryClient`/catch) en `useProperties`/`useLeads`/`usePlans` → spec aparte (requiere singleton de QueryClient).
- `complexity`/`no-restricted-imports` de `PropertyCard` → deuda separada.
