# CREATE FEATURE WORKFLOW (REACT SDD)

## Propósito

Implementar features del frontend siguiendo **Spec-Driven Development (SDD)**, en paridad con el workflow del backend.

## Fuentes de verdad (leer en este orden antes de empezar)

1. **Estado** — `PROJECT-MAP.md` (raíz): estado real del front. Leer PRIMERO; el código manda si difieren.
2. **Contrato** — `Backend-Inmobiliaria/.ai/contracts/api-contract.md`: rutas y shapes del backend. El front consume, no inventa.
3. **Producto (compartido)** — `.ai/product/README.md` → backend `.ai/product/`: el QUÉ del negocio (actores, reglas).
4. **Gobernanza** — `.ai/context/{architecture,conventions}.md` + `.ai/policies/architecture-policies.yaml`: el CÓMO (capas React, estilo, límites).

Jerarquía ante conflicto: **Código > PROJECT-MAP > api-contract (backend) > specs/{feature}/spec.md > product > .ai/context**.

---

# PASOS

## STEP 0 — SPEC
- Escribir/verificar `specs/{area}/{feature}/spec.md` copiando `.ai/workflows/spec.template.md`.
- Completar TODAS las secciones (reglas, contrato de API que consume, casos borde, UX, criterios de aceptación).
- Referenciar el `api-contract.md` del backend para el shape; no re-describir reglas globales de negocio (viven en el product compartido).
- **STOP RULE:** no escribir código hasta que la spec esté alineada.

## STEP 1 — DISEÑO (OPCIONAL — épicas grandes / inciertas)
- Solo si hay incertidumbre real (varias pantallas, estado complejo, integración nueva): crear `plan.md`.
- Para features acotadas, la `spec.md` alcanza.

## STEP 2 — ORDEN DE IMPLEMENTACIÓN (inner-to-outer)
1. **Capa de datos** — hook en `src/hooks/` (`useX.js`): `useQuery`/`useMutation`, query keys, mapeo al contrato. Es el ÚNICO lugar que toca `api/api.js`.
2. **Estado de cliente** — slice/campo en un store Zustand (`src/store/`) solo si hace falta (filtros, UI). No guardar datos de servidor.
3. **UI** — componentes en `features/{area}/components/` y página en `features/{area}/pages/`. Sin lógica de negocio en JSX.
4. **Routing** — registrar la página en `router/AppRouter.jsx` (+ `allowedRoles` en `ProtectedRoute` si es protegida).
5. **Tests** — Vitest + Testing Library en `src/test/` (hook y/o componente).

## STEP 3 — FITNESS FUNCTION
- `npm run lint` — aplica los límites de `architecture-policies.yaml` + el boundary (api solo en hooks). Si falla, corregir antes de seguir. NO bajar reglas para "pasar".

## STEP 4 — TESTS
- `npm run test` (Vitest). Deben pasar.

## STEP 5 — REVIEW
- Self-review contra `.ai/context/architecture.md` y el contrato. El gate objetivo lo dan `npm run lint` + `npm run test`.

## STEP 6 — SYNC ESTADO
- Marcar la spec como ✅.
- Actualizar `PROJECT-MAP.md`: rutas/stores/hooks nuevos o cambiados, y mover el drift resuelto de la sección "Deuda conocida".
- Si el trabajo reveló que el **contrato** del backend está mal/incompleto, avisar para corregirlo en el backend (no parchear el front adivinando).
