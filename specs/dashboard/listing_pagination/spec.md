# Spec: Paginación de los listados del dashboard

**Área:** `dashboard`
**Estado:** 🟦 aprobada
**Fuentes relacionadas:** [.ai/product/README.md](../../../.ai/product/README.md) (negocio, backend) · `Backend-Inmobiliaria/.ai/contracts/api-contract.md` (contrato)

---

## 1. Objetivo y valor

Ningún listado del panel (`/dashboard`) tiene paginador, **pero todos sus endpoints ya vienen paginados desde el backend**. El front descarta `links`/`meta` y renderiza solo `data`, así que hoy **muestra la primera página y oculta el resto sin avisar**:

| Listado | Endpoint | Backend | Tope real hoy |
| :--- | :--- | :--- | :--- |
| Mis Propiedades | `GET me/properties` | `PropertyController::userProperties` | **15** |
| Consultas recibidas | `GET leads` | `LeadController::index` | **15** (admin: 50) |
| Consultas enviadas | `GET leads/sent` | `LeadController::sent` | **15** |
| Favoritos | `GET me/favorites` | `FavoriteController::index` | **15** |
| Usuarios (admin) | `GET users` | `UserController::index` | **20** |
| Propiedades (admin) | `GET admin/properties` | `PropertyController::adminIndex` | **15** |

No es solo una UI faltante: es **pérdida silenciosa de datos**. Un owner con 20 propiedades ve 15 y cree que tiene 15; un admin con 100 usuarios administra 20.

Efecto colateral: `DashboardStats` y `PlanStatusCard` calculan sus contadores con `.length` del array recibido, así que "Propiedades Totales", "Consultas Recibidas", "Favoritos Guardados" y el uso del plan (`usage`) **muestran el tamaño de la página, no el total**. Pasar a `meta.total` los corrige.

## 2. Reglas y comportamiento

1. **La paginación es server-side.** El front manda `?page=N` y consume `meta` de la respuesta. Nunca se traen todos los registros para paginar en cliente.
2. **El backend ya acepta `page`** (lo lee el paginador de Laravel). **No requiere cambio de backend ni de `api-contract.md`.**
3. **`per_page` lo decide el backend** (15/20/50 fijos por endpoint). El front **no** lo manda ni lo asume: el tamaño de página sale de `meta.per_page`.
4. **Cambiar de filtro resetea a la página 1.** Quedarse en la página 5 tras filtrar puede caer fuera de rango y mostrar vacío.
5. **Cada listado tiene su propia página**, independiente de las demás pestañas.
6. **Los contadores totales salen de `meta.total`**, no de `items.length`.
7. **Un solo paginador para todos los listados** (`common/components/Pagination.jsx`). No se duplica markup por pestaña.
8. **Si hay una sola página, el paginador no se renderiza** (no ensucia listados chicos).
9. El orden lo sigue imponiendo el backend (`latest()`); el front no reordena.

## 3. Actores y accesos

Ruta `/dashboard` (`ProtectedRoute`, `allowedRoles: owner | agent | admin | buyer`). Por rol:

- **buyer** → Favoritos, Consultas enviadas.
- **owner / agent** → Mis Propiedades, Consultas recibidas.
- **admin** → Propiedades (moderación), Usuarios, Consultas recibidas, Certificaciones.

## 4. Contrato de API que consume

Sin endpoints nuevos. Todos responden con el paginador de Laravel (`api-contract.md`, sección Convenciones):

```json
{ "data": [ ... ], "links": { ... },
  "meta": { "current_page": 1, "last_page": 4, "per_page": 15, "total": 52, "from": 1, "to": 15 } }
```

Params que agrega el front: **`page`** (entero ≥ 1) en `me/properties`, `leads`, `leads/sent`, `me/favorites`, `users`, `admin/properties`, junto a los filtros ya existentes.

## 5. Capa de datos (hooks) y estado

- **`dashboardData.helpers.js`** — helper puro nuevo `readPaginated(res, mapFn)`: devuelve `{ items, meta }` normalizado y tolera respuestas **sin** paginar (array plano → `meta` derivada con `total = items.length`, `lastPage = 1`), para no romper el mock ni un endpoint que deje de paginar.
- **`useDashboardQueries.js`** — cada query suma su `page` a la **query key** (para que react-query cachee por página) y al request. Devuelve además `{listado}Meta` por listado. Se agrega `placeholderData` para que al cambiar de página no parpadee el layout.
- **`useDashboardData.js`** — estado de cliente nuevo: una página por listado + sus setters. Se resetea a 1 cuando cambian los filtros que afectan a ese listado.
- **`useProperties.js`** — `getPropertiesByUser` acepta `page` y devuelve `{items, meta}`.
- **Query keys:** `["me_properties", search, status, operation, page]`, `["leads", status, from, to, page]`, `["sent_leads", …, page]`, `["me_favorites", page]`, `["admin_users", page]`, `["admin_properties", page]`.

El estado de página es **estado de cliente efímero** → vive en el hook con `useState`, no en la URL (consistente con cómo el dashboard ya maneja tabs y filtros) y no en Zustand.

## 6. UI / UX

**`common/components/Pagination.jsx`** (componente nuevo, compartido):
- Botones **Anterior / Siguiente** + números de página con elipsis cuando hay muchas (ventana alrededor de la actual, siempre primera y última).
- Leyenda "Mostrando X–Y de Z" a la izquierda.
- Página actual resaltada; Anterior deshabilitado en la 1 y Siguiente en la última.
- Accesible: `<nav aria-label="Paginación">`, `aria-current="page"` en la actual, `aria-label` en cada botón.
- Mobile-first: en pantallas chicas solo Anterior/Siguiente + "Página X de Y".
- Textos en español.

Se renderiza **al pie** de cada listado, dentro de su tab. Estados vacío/carga se mantienen como están.

## 7. Casos borde

- **Una sola página** (`last_page <= 1`) → no se renderiza el paginador.
- **Lista vacía** → sin paginador; se mantiene el mensaje de vacío actual.
- **Respuesta sin `meta`** (mock, o endpoint que deje de paginar) → `readPaginated` deriva una meta de 1 página; el paginador no aparece. Sin crash.
- **Filtrar estando en página > 1** → vuelve a página 1 (regla 4).
- **Borrar el último ítem de la última página** → react-query refetchea; si la página queda fuera de rango el backend devuelve `data: []`. Se corrige volviendo a página 1 cuando `current_page > last_page`.
- **Cambiar de pestaña** → cada listado conserva su propia página (no se resetea).
- `meta.total` ausente → los contadores caen a `items.length` (comportamiento actual).

## 8. Criterios de aceptación

1. Con más de una página, cada listado muestra el paginador al pie y permite navegar.
2. Navegar de página dispara un request con `?page=N` y renderiza los ítems de esa página.
3. Con una sola página (o lista vacía) el paginador **no** se renderiza.
4. Aplicar o limpiar filtros vuelve a la página 1.
5. "Propiedades Totales", "Consultas Recibidas", "Favoritos Guardados" y "Consultas Realizadas" muestran `meta.total`, no el tamaño de página.
6. `PlanStatusCard` recibe `usage` = total real de propiedades.
7. `readPaginated` normaliza tanto `{data, meta}` como un array plano — con test Vitest.
8. `Pagination` renderiza el rango correcto, deshabilita los extremos y se oculta con 1 página — con test Vitest.
9. `npm run lint` · `npm run knip` · `npm run map:check` · `npm run test` en verde.

## 9. Fuera de alcance

- **Selector de "items por página"** — `per_page` está hardcodeado en el backend (salvo leads, que lo deriva del rol). Exponerlo requiere cambio de backend + contrato.
- **Persistir la página en la URL** (`?page=`) — el dashboard no sincroniza ningún estado a la URL hoy; hacerlo es un cambio transversal aparte.
- **Paginar la pestaña Certificaciones** — `pendingCertifications` se deriva filtrando `adminProperties` **en el cliente**, así que solo ve las pendientes de la página actual de `admin/properties`. Es un defecto **preexistente** que la paginación no introduce ni puede resolver bien desde el front: necesita que el backend exponga la cola filtrada (`admin/properties?certification_status=pending` o endpoint propio). **Queda registrado como deuda en PROJECT-MAP.**
- Scroll infinito / virtualización.
- Paginar `/search` y `/explore` (listados públicos, fuera del dashboard).
