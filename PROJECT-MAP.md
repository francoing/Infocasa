# PROJECT MAP — Frontend (Front-inmob / InfoCasa)

> **Capa 4 (Estado real).** Fuente de verdad del ESTADO del frontend. El código manda sobre este mapa.
> Sincronizar tras cada feature (STEP 7 de `.ai/workflows/create-feature.workflow.md`).
> Para el QUÉ del negocio ver la capa compartida (`.ai/product/README.md` → backend); para el CÓMO técnico ver `.ai/context/`.
>
> Última sincronización: 2026-07-14 (reconciliación inicial contra el código + bootstrap de gobernanza).

## Stack / Entorno
- **React 18** + **Vite 5** · SPA. Rutas: **React Router 6** (lazy + code splitting).
- Estado de **servidor**: **TanStack Query** (react-query). Estado de **cliente**: **Zustand**.
- Estilos: **Tailwind** (+ clsx / tailwind-merge). Animación: framer-motion. Iconos: lucide-react.
- Mapas: **Leaflet** + react-leaflet + markercluster.
- Tests: **Vitest** + Testing Library. Lint: **ESLint** (`--max-warnings 0`).
- Deploy: **Vercel**. Rama actual: `QA`.

## Estructura (`src/`)
```
src/
├── api/api.js            ← ÚNICO cliente HTTP. Proxy mock/real (VITE_USE_MOCK), base /api/v1, Bearer de useAuthStore
├── features/{home,search,explore,property,auth,dashboard,admin,profile,share}/{pages,components}
├── store/                ← Zustand: useAuthStore · useFilterStore · useToastStore
├── hooks/                ← capa de datos (react-query): useProperties, usePropertyDetail, useLeads, usePlans,
│                            useAdminData, useDashboardData, useAuth, useAgencies, useGeoapifyPlaces, useUserProvince, useToast
├── common/components/    ← Layout, AdminLayout, PropertyCard, PlanBadge, PlanStatusCard, ToastContainer,
│                            WhatsAppButton, Loader, Logo
├── router/               ← AppRouter (rutas) + ProtectedRoute (auth + allowedRoles)
├── lib/utils.js          ← helpers (clsx/tailwind-merge)
├── data/provincias.json  ← datos estáticos de provincias
├── mock/                 ← mockApi + handlers/searchProperties + data (switch por VITE_USE_MOCK)
├── theme/                ← tema
└── test/                 ← Vitest (components, hooks, store, setup)
```

## Rutas (`src/router/AppRouter.jsx`)
| Ruta | Página | Acceso |
| :--- | :--- | :--- |
| `/` | HomePage | pública |
| `/search` | SearchPage | pública |
| `/property/:id` | PropertyDetailPage | pública |
| `/explore/:operation` | ExplorePage (mapa) | pública |
| `/share/:propertyId?` | SharePage | pública |
| `/login` `/register` `/forgot-password` `/reset-password` | Auth pages | pública |
| `/profile` | ProfilePage | `auth` (cualquier rol) |
| `/dashboard` | DashboardPage | owner / agent / admin / buyer |
| `/dashboard/properties/create` | CreatePropertyPage | owner / agent / admin |
| `/dashboard/properties/edit/:id` | EditPropertyPage | owner / agent / admin |
| `/admin` | → redirige a `/dashboard` | — |
| `*` | HomePage (fallback) | — |

`ProtectedRoute` valida `isAuthenticated` + `allowedRoles.includes(user.role)`.

## Estado (Zustand `store/`)
- **`useAuthStore`** — `token`, `user`, `isAuthenticated`, `loading`. Fuente del Bearer para `api.js` y de `role` para `ProtectedRoute`.
- **`useFilterStore`** — filtros de búsqueda: `location, minPrice, maxPrice, type, userId, sort, page`.
- **`useToastStore`** — cola de toasts.

## Capa de datos (`hooks/`, react-query)
Un hook por área de datos; **todas** las llamadas a la API pasan por acá (nunca desde componentes). Query keys: `["properties"]`, `["property", id]`, `["me_properties", ...]`, `["me_favorites"]`, `["leads", ...]`, `["sent_leads", ...]`, `["admin_properties"]`, `["admin_users"]`, `["admin_leads"]`, `["plans", role]`, `["userPlan", id]`, `["auth_me"]`.

## Contrato con backend (`/api/v1`)
Fuente de verdad: `Backend-Inmobiliaria/.ai/contracts/api-contract.md`. Endpoints que el front consume hoy:
- **Auth/perfil:** `auth/me`, `me/properties`, `me/favorites` (+ login/register/logout/forgot/reset vía `useAuth`).
- **Properties:** `properties`, `properties/{id}`, `properties/search`, `properties` (POST/PUT/PATCH/DELETE), `/{id}/view`, `/{id}/favorite`.
- **Leads:** `leads`, `leads/sent`, `leads` (POST), `leads/{id}` (PATCH), `leads/{id}/reply`.
- **Admin:** `admin/properties`, `users`, `users/{id}/status`, `users/{id}` (DELETE).
- **Monetización:** `plans`, `subscriptions`, `subscriptions/mercadopago/preference`, `subscriptions/mercadopago/verify`.

## Servicios externos
- **Geoapify** — autocompletado de lugares (`useGeoapifyPlaces`, `VITE_GEOAPIFY_API_KEY`).
- **Leaflet** — mapas / clustering (Home, Explore, PropertyMap, MapLocationSelector).
- **MercadoPago** — checkout vía `preference` del backend (CheckoutModal).
- **Vercel** — hosting/deploy.

## Tests (`src/test/`)
`components/CheckoutModal`, `components/PlanStatusCard`, `hooks/usePlans`, `store/useAuthStore`, `setup.js`. Cobertura fina (a ampliar).

## Deuda técnica / drift conocido
- ✅ **Moneda nativa / `price_usd` retirado** (spec `search/currency_native`). La búsqueda filtra por `currency` (`SearchPage` → `useProperties`, default por operación en el backend); creación/edición/reducción mandan solo `price_amount`/`price_currency`. Se eliminó la conversión inventada (`ARS/1000`).
- 🟢 **`useFilterStore` es código muerto** — no lo consume nadie (la búsqueda va por `SearchPage`+searchParams). Candidato a borrar.
- 🟡 **`sort` de cliente vs "destacadas primero".** El orden lo impone el backend (INVIOLABLE); el `sort` del front hoy no ordena nada (no se envía ni se aplica) — arreglar/eliminar.
- 🟡 **Filtro `userId`/inmobiliaria** en `SearchPage` no se envía al backend (`useProperties` no lo agrega al query). Latente.
- 🟢 **`ProfilePage` duplicado** — existe en `features/auth/pages/` y `features/profile/pages/`; el router usa el de `profile/`. El de `auth/` es código muerto (candidato a borrar).
- 🟢 **`.env` con `VITE_GEOAPIFY_API_KEY` versionada** — key de front (pública), pero conviene revisar restricción por dominio.
- 🟡 **`npm run test` roto por toolchain** — vitest 4.1.7 + jsdom 29 no compila bajo Node 22 (`SyntaxError` en `ElementCSSInlineStyle-impl.js`). Preexistente (no lo causó la gobernanza). El gate de CI se apoya en `npm run lint`; arreglar el stack de test (alinear versiones vitest/jsdom/node) para reactivar el paso de tests.

### Backlog de reconciliación de la fitness function (ratchet)
La fitness function (ESLint) arrancó verde vía **ratchet**: 16 archivos con deuda preexistente están listados en `.eslintrc.cjs` (`LEGACY`). El gate **bloquea violaciones nuevas**; estas se saldan por spec y se sacan de `LEGACY` al refactorizar. **No agregar entradas nuevas.**

- **Boundary (UI→api directo)** — mover la llamada a un hook: `PropertyCard`, `ExplorePage`, `ProfilePage`, `PropertyForm`, `CreatePropertyPage`. *(`SearchPage` ya salió: usa `useAgencies`.)*
- **rules-of-hooks (posibles bugs reales, prioridad)** — `PropertyCard`, `ProvinceMap`, `PropertyMap` (`useState`/`useQueryClient` condicional o fuera de hook), `useLeads`, `usePlans`, `useProperties`.
- **Tamaño/complejidad (componentes/hooks gigantes)** — `PropertyForm` (993 líneas), `ProfilePage` (546), `PropertyDetailPage` (508), `HomePage` (468), `DashboardPage`, `useDashboardData`, `useProperties`, `usePropertyDetail`.

## Gobernanza
- `.ai/` — gobernanza propia del front (`context`, `policies`, `workflows`). Producto = compartido (pointer al backend).
- Fitness function: **ESLint con dientes** (`.eslintrc.cjs` lee `.ai/policies/architecture-policies.yaml`; reglas en `error` + `--max-warnings 0`). Corre en CI (`.github/workflows/ci.yml`) y en `.githooks/pre-commit`.
- Comandos clave: `npm run lint` · `npm run test` · `npm run dev`.
