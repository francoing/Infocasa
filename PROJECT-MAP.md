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
├── store/                ← Zustand: useAuthStore · useToastStore
├── hooks/                ← capa de datos (react-query): useProperties, usePropertyDetail, useLeads, usePlans,
│                            useAdminData, useDashboardData, useAuth, useAgencies, useGeoapifyPlaces, useUserProvince, useToast
├── common/components/    ← Layout, AdminLayout, PropertyCard, PlanBadge, PlanStatusCard, ToastContainer,
│                            WhatsAppButton, Loader, Logo, EmailVerificationBanner
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
| `/email-verified` | EmailVerifiedPage (aterrizaje del backend, lee `?status`) | pública |
| `/profile` | ProfilePage | `auth` (cualquier rol) |
| `/dashboard` | DashboardPage | owner / agent / admin / buyer |
| `/dashboard/properties/create` | CreatePropertyPage | owner / agent / admin |
| `/dashboard/properties/edit/:id` | EditPropertyPage | owner / agent / admin |
| `/admin` | → redirige a `/dashboard` | — |
| `*` | HomePage (fallback) | — |

`ProtectedRoute` valida `isAuthenticated` + `allowedRoles.includes(user.role)`.

## Estado (Zustand `store/`)
- **`useAuthStore`** — `token`, `user`, `isAuthenticated`, `loading`. Fuente del Bearer para `api.js` y de `role` para `ProtectedRoute`. Acción `resendVerification`.
- **`useToastStore`** — cola de toasts.

> La búsqueda **no** usa store: `SearchPage` maneja sus filtros por `searchParams` → `useProperties`. (El viejo `useFilterStore` era código muerto → eliminado.)

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
- ✅ **`useFilterStore` eliminado** (era código muerto).
- ✅ **`sort` por precio ahora funciona** como orden **secundario** (backend `sort=price_asc|price_desc`; destacadas siguen primero). Spec `search/search_coherence`.
- ✅ **Filtro por inmobiliaria funciona** (`agency_id`; el estado `userId` se renombró a `agencyId`). Spec `search/search_coherence`.
- ✅ **Moderación de certificación (admin)** — aprobar/rechazar temporarias desde el AdminPage. Spec `admin/certification_moderation`.
- ✅ **Subida de imágenes arreglada** — se persisten vía `POST /properties/{id}/images` (antes se perdían). Spec `property/image_upload`.
- 🟡 **Follow-up imágenes**: borrar/reordenar imágenes existentes al editar (`DELETE /images/{id}`, `PUT /images/order`) — requiere que `PropertyForm`/`ImageUploader` trackeen los IDs de imagen (hoy solo URLs). Pendiente.
- 🟢 **`ProfilePage` duplicado** — existe en `features/auth/pages/` y `features/profile/pages/`; el router usa el de `profile/`. El de `auth/` es código muerto (candidato a borrar).
- 🟢 **`.env` con `VITE_GEOAPIFY_API_KEY` versionada** — key de front (pública), pero conviene revisar restricción por dominio.
- 🟡 **`npm run test` — toolchain a medio arreglar.** `vitest` bajado de `^4.1.7` (incompatible con vite 5) a **`^2.1.9`** → `package-lock.json` regenerado y `npm ci` **vuelve a funcionar** (esbuild 0.21.5 alineado). Pero **jsdom** sigue fallando en el entorno **local** (Windows, `node_modules` inconsistente por instalaciones superpuestas / `EPERM`): `SyntaxError` cargando un archivo generado de jsdom. Muy probablemente **local-only** → verificar el paso de tests en CI limpio (Linux); si pasa, quitar `continue-on-error` de `ci.yml` y volverlo gate duro. Si también falla en CI, alinear jsdom.

### Backlog de reconciliación de la fitness function (ratchet)
La fitness function (ESLint) arrancó verde vía **ratchet**: 16 archivos con deuda preexistente están listados en `.eslintrc.cjs` (`LEGACY`). El gate **bloquea violaciones nuevas**; estas se saldan por spec y se sacan de `LEGACY` al refactorizar. **No agregar entradas nuevas.**

- **Boundary (UI→api directo)** — mover la llamada a un hook: `PropertyCard`, `ExplorePage`, `ProfilePage`, `PropertyForm`, `CreatePropertyPage`. *(`SearchPage` ya salió: usa `useAgencies`.)*
- **rules-of-hooks (posibles bugs reales, prioridad)** — `PropertyCard`, `ProvinceMap`, `PropertyMap` (`useState`/`useQueryClient` condicional o fuera de hook), `useLeads`, `usePlans`, `useProperties`.
- **Tamaño/complejidad (componentes/hooks gigantes)** — `PropertyForm` (993 líneas), `ProfilePage` (546), `PropertyDetailPage` (508), `HomePage` (468), `DashboardPage`, `useDashboardData`, `useProperties`, `usePropertyDetail`.

## Gobernanza
- `.ai/` — gobernanza propia del front (`context`, `policies`, `workflows`). Producto = compartido (pointer al backend).
- Fitness function: **ESLint con dientes** (`.eslintrc.cjs` lee `.ai/policies/architecture-policies.yaml`; reglas en `error` + `--max-warnings 0`). Corre en CI (`.github/workflows/ci.yml`) y en `.githooks/pre-commit`.
- Comandos clave: `npm run lint` · `npm run test` · `npm run dev`.
