# Spec: Búsqueda con moneda nativa + retiro de `price_usd`

**Área:** `search` (+ `property`, `dashboard` colaterales)
**Estado:** ✅ implementada
**Fuentes relacionadas:** [.ai/product/README.md](../../../.ai/product/README.md) · `Backend-Inmobiliaria/.ai/contracts/api-contract.md`

---

## 1. Objetivo y valor
Cerrar el drift back↔front del precio. El backend jubiló `price_usd` y ahora maneja **dos monedas nativas sin conversión** (`price_amount` + `price_currency`), con búsqueda filtrable por `currency` (default por operación). El front todavía manda/lee `price_usd` e **inventa una conversión** (`ARS/1000`), y su búsqueda no puede filtrar por moneda. Esto corrige la incoherencia más visible (precios) para todos los roles.

## 2. Reglas y comportamiento
- **Sin conversión.** El front nunca convierte ARS↔USD. Se elimina todo cálculo de `price_usd` (incluido `ARS/1000`).
- **`price_amount` + `price_currency` son la única verdad.** Se lee `price.amount`/`price.currency` del contrato; se escribe `price_amount`/`price_currency`.
- **Filtro de moneda en búsqueda.** El usuario puede elegir moneda (USD/ARS) o dejar "automática" → el backend aplica su default por operación (venta/desarrollo→USD, alquiler→ARS). Solo se manda `currency` si el usuario eligió una.
- **El orden lo impone el backend** (destacadas primero). El `sort` de cliente no altera eso (fuera de alcance arreglar el sort).

## 3. Actores y accesos
Búsqueda: pública (todos los roles). Creación/edición de precio: owner/agent/admin. Reducción de precio (dashboard): dueño de la propiedad.

## 4. Contrato de API que consume
- `GET /properties/search?currency=USD|ARS&price_min=&price_max=&…` → `data[].price = { amount, currency }`.
- `POST/PUT /properties` (multipart) → `price_amount`, `price_currency` (**sin** `price_usd`).
- `PATCH /properties/{id}` (reducción) → `{ price_amount }` (**sin** `price_usd`).

## 5. Capa de datos (hooks) y estado
- `useProperties.mapProperty`: `price` lee solo `price.amount`; drop `price.usd`/`price_usd`.
- `useProperties` (query builder): agrega `currency` cuando viene en filtros.
- `useDashboardData.reducePriceMutation`: body solo `price_amount`.
- `PropertyForm` submit: drop `priceUsdVal` y `fd.append("price_usd")`.
- Nuevo hook `useAgencies` (mueve el `api.get("/agencies")` que hoy vive en `SearchPage` → respeta boundary UI→api).
- Estado: `SearchPage` gana `currency` (searchParams). `useFilterStore` es **código muerto** (no lo usa nadie) → fuera de alcance, se anota para borrar.

## 6. UI / UX
- `SearchPage`: selector de moneda junto al rango de precio → "Automática" (default, no manda `currency`), "USD (dólares)", "ARS (pesos)". Persistido en la URL.

## 7. Casos borde
- `currency` vacío → se omite el param (backend decide por operación).
- Propiedad sin `price.amount` → `price` cae a 0 (mock/legacy).
- Reducción de precio a un valor mayor → el backend lo maneja; el front solo manda `price_amount`.

## 8. Criterios de aceptación
1. No queda ninguna referencia a `price_usd` ni `price.usd` en `src/` (fuera de mock histórico).
2. La búsqueda envía `currency` cuando el usuario lo elige y lo omite cuando es "automática".
3. `PropertyForm` y la reducción de precio mandan solo `price_amount`/`price_currency`.
4. `SearchPage` ya no importa `api/api` directo (via `useAgencies`) → sale de `LEGACY` para `no-restricted-imports`.
5. `npm run lint` en verde.

## 9. Fuera de alcance
- Refactor de tamaño de `SearchPage`/`PropertyForm` (siguen en `LEGACY` por `max-lines`).
- Arreglar el `sort` de cliente (no ordena nada hoy) y el filtro `userId`/inmobiliaria (no se envía al backend).
- Borrar `useFilterStore` muerto (anotado en PROJECT-MAP).
- Toolchain de tests (vitest roto).
