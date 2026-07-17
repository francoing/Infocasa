# Spec: Coherencia de búsqueda (sort secundario + filtro agencia + limpieza)

**Área:** `search` (+ backend)
**Estado:** ✅ implementada
**Fuentes:** `Backend-Inmobiliaria/.ai/contracts/api-contract.md` + business-rules "Búsqueda"

## 1. Objetivo
El front tiene dos controles muertos (no los envía / el backend no los soporta): **ordenar por precio** y **filtrar por inmobiliaria**. Y un store **muerto** (`useFilterStore`). Cerrar la incoherencia haciéndolos funcionales y limpiando.

## 2. Reglas
- **Orden (INVIOLABLE):** destacadas siempre primero (prioridad de publicación DESC). El `sort` por precio es **secundario**: ordena *dentro* de la misma prioridad (reemplaza el desempate por `created_at`). Nunca puede hacer que una no-destacada aparezca antes que una destacada.
- **Filtro por agencia:** `agency_id` filtra `properties.agency_id`. Es un filtro más, no altera el orden.

## 3. Backend (dependencia)
- `PropertySearchRequest`: `agency_id` (`nullable|integer|exists:agencies,id`), `sort` (`nullable|in:price_asc,price_desc`).
- `PropertySearchController`: filtro `agency_id`; ordenamiento pasa a `prioridad DESC → [price_amount ASC|DESC si sort] → created_at DESC`.
- Contrato + business-rules actualizados.

## 4. Front
- `useProperties`: enviar `agency_id` (del filtro de inmobiliaria) y `sort` cuando corresponda.
- `SearchPage`: renombrar el estado `userId`→`agencyId` (hoy guarda `agency.id` pero se llama userId — confuso); el `sort` ya existe y ahora sí se envía.
- **Borrar `useFilterStore`** (código muerto, no lo usa nadie).

## 5. Casos borde
- `sort` ausente/otro valor → orden por defecto (created_at como desempate).
- `agency_id` inexistente → `422` (validación `exists`).
- El sort nunca precede a las destacadas (test backend lo cubre).

## 6. Criterios de aceptación
1. `GET /search?sort=price_asc` ordena por precio ascendente **dentro** de destacadas-primero.
2. `GET /search?agency_id=X` filtra por agencia.
3. Front envía ambos; `useFilterStore` eliminado.
4. Tests backend verdes (incl. que destacadas siguen primero con sort). `npm run lint` verde.

## 7. Fuera de alcance
- Otros criterios de orden (por fecha explícita, relevancia).
