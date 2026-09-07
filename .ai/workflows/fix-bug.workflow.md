# FIX BUG WORKFLOW (REACT)

## Propósito
Arreglar bugs del frontend sin degradar la arquitectura ni driftear con el contrato del backend.

## Pasos

## STEP 0 — REPRODUCIR
- Leer `PROJECT-MAP.md` para ubicar la feature/ruta afectada.
- Reproducir el bug (pasos concretos: ruta, rol, acción). Si es de datos, verificar contra `Backend-Inmobiliaria/.ai/contracts/api-contract.md` — puede ser drift de contrato, no un bug de UI.

## STEP 1 — TEST QUE FALLA (si aplica)
- Escribir un test Vitest que reproduzca el fallo (rojo). Para bugs de lógica de hook/componente vale la pena; para ajustes visuales puede omitirse.

## STEP 2 — FIX MÍNIMO
- Corregir en la capa correcta:
  - dato/serverstate mal → el **hook** (`src/hooks/`).
  - estado de cliente/filtros → el **store** (`src/store/`).
  - presentación → el **componente**.
- Respetar las prohibiciones de `.ai/context/architecture.md` (nada de `fetch` en componentes, sin lógica en JSX).

## STEP 3 — VERIFICAR
- `npm run lint` + `npm run test` en verde.

## STEP 4 — SYNC
- Si el bug era drift de contrato, anotarlo en `PROJECT-MAP.md` (Deuda conocida) y avisar para corregir el backend.
- Actualizar `PROJECT-MAP.md` si cambió algo del estado.
