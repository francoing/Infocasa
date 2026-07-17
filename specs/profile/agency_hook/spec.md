# Spec: Sacar las llamadas de inmobiliaria de ProfilePage al hook useAgencies

**Área:** `profile`
**Estado:** ✅ implementada
**Fuentes:** `.ai/context/architecture.md` (boundary UI→api) · auditoría de sanidad 2026-07-15 (paydown #1 del ratchet)

## 1. Objetivo
`ProfilePage.jsx` toca el cliente HTTP directo en `handleAgencySubmit` (`api.post('/agencies')` y `api.put('/agencies/{id}')`), violando el boundary "la UI no importa `api/api.js`" (por eso está en el ratchet con `no-restricted-imports`). Mover esas 2 llamadas a la capa de datos (`useAgencies`) y **sacar `no-restricted-imports` del LEGACY** de este archivo → el boundary queda **enforced** sobre `ProfilePage`.

> Alcance acotado: **solo** se cierra la violación de boundary. Los otros pecados del archivo (591 líneas, complejidad) siguen en el ratchet y se saldan en una spec aparte de split de presentación.

## 2. Reglas / contrato (backend, ya existente)
- `POST /agencies` — crea la inmobiliaria del usuario. `PUT /agencies/{id}` — actualiza. Ambas devueltas por `AgencyController` (validación 422 con `errors`).

## 3. Implementación (front-only)
- **`hooks/useAgencies.js`**: agregar dos funciones async **puras** (solo tocan `api`, sin `queryClient` para no introducir el anti-patrón `rules-of-hooks` que ya arrastra `useProperties`):
  - `createAgency(data)` → `POST /agencies`, devuelve `res.data`.
  - `updateAgency(id, data)` → `PUT /agencies/{id}`, devuelve `res.data`.
- **`features/profile/pages/ProfilePage.jsx`**:
  - Quitar `import { api } from '@/api/api'`.
  - Importar `createAgency, updateAgency` de `@/hooks/useAgencies`.
  - `handleAgencySubmit`: usar `updateAgency(user.agency.id, agencyForm)` si hay id, si no `createAgency(agencyForm)`. El resto igual (toast, `refreshUser()`, manejo 422).
- **`.eslintrc.cjs`**: en `LEGACY`, la entrada de `ProfilePage.jsx` pasa de `['complexity','max-lines','max-lines-per-function','no-restricted-imports']` a `['complexity','max-lines','max-lines-per-function']`.

## 4. Casos borde
- Sin `user.agency.id` → crea; con id → actualiza (misma lógica que hoy).
- Error 422 → el componente sigue desglosando `err.data.errors` (las funciones dejan propagar el error de `api`).
- La invalidación de la lista `["agencies"]` no aplica: `ProfilePage` no la renderiza; `refreshUser()` ya trae la agency embebida actualizada.

## 5. Criterios de aceptación
1. `ProfilePage.jsx` no importa `api/api.js` (grep vacío).
2. `no-restricted-imports` **enforced** sobre `ProfilePage` (removido del LEGACY) y `npm run lint` verde.
3. Crear/actualizar inmobiliaria sigue funcionando (mismo toast + refresh).

## 6. Fuera de alcance
- Split de presentación de `ProfilePage` (591 líneas) → spec aparte.
- Invalidación de caches de react-query desde el hook (requiere resolver el patrón de `queryClient` sin romper `rules-of-hooks`).
