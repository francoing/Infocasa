# PROJECT MAP — Frontend (Front-inmob / InfoCasa)

> ⏱ **Última sincronización: 2026-07-28** — actualizar al terminar cualquier feature (Regla de oro #5).

> **Capa 4 (Estado real).** Fuente de verdad del ESTADO del frontend. El código manda sobre este mapa.
> Sincronizar tras cada feature (STEP 7 de `.ai/workflows/create-feature.workflow.md`).
> Para el QUÉ del negocio ver la capa compartida (`.ai/product/README.md` → backend); para el CÓMO técnico ver `.ai/context/`.

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
├── features/{home,search,explore,property,auth,dashboard,profile,share}/{pages,components}   ← admin vive dentro de dashboard (no hay feature `admin`)
├── store/                ← Zustand: useAuthStore · useToastStore
├── hooks/                ← capa de datos (react-query): useProperties, usePropertyDetail, usePlans,
│                            useDashboardData (queries/mutations), useAuth, useAgencies, usePropertyFormRefs,
│                            usePropertyForm, useMercadoPagoReturn, useFavorites, useExploreProperties, usePublications,
│                            useHomeSearch, useGeoapifyPlaces, useUserProvince, useGeocodeSearch, useToast
│                            (+ helpers puros: property.mappers, properties.query, usePropertyDetail.helpers, dashboardData.helpers)
├── common/components/    ← Layout, AdminLayout, PropertyCard, PlanStatusCard, ToastContainer,
│                            WhatsAppButton, Loader, Logo, FooterLogo, EmailVerificationBanner, BackButton, UserMenu, PasswordInput
├── router/               ← AppRouter (rutas) + ProtectedRoute (auth + allowedRoles)
├── lib/                  ← utils.js (clsx/tailwind-merge) · queryClient.js (singleton react-query)
├── data/provincias.json  ← datos estáticos de provincias
├── mock/                 ← mockApi + handlers/searchProperties + data (switch por VITE_USE_MOCK)
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
Fuente de verdad: `Backend-Inmobiliaria/.ai/contracts/api-contract.md`. **Coherencia verificable:** `npm run api:surface -- --contract <ruta al api-contract.md>` lista la superficie real del front (endpoints en `hooks/`+`store/`) y la diffea contra el contrato (drift en ambas direcciones; matching por endpoint, no por query params). Endpoints que el front consume hoy:
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
**Vitest + Testing Library sobre `happy-dom`** (entorno en `vite.config.js`). **Gate duro en CI** (`npm run test`). Hoy: `components/CheckoutModal`, `components/PlanStatusCard`, `hooks/usePlans`, `store/useAuthStore`, `setup.js` (36 tests). Cobertura a ampliar en hooks de datos críticos (ver deuda).

## Deuda técnica / drift conocido

### Ciclo 2026-07-28 (UX + mobile + mapa)
- ✅ **Navegación: botón "Volver" global** — `common/components/BackButton.jsx` (vuelve a la página anterior; si no hay historial, va al home). En `Layout` (todas las rutas menos home, dentro del header) y en el header mobile de `AdminLayout`. Se **quitó el enlace "Todas las Propiedades"** del header; su función pasó al buscador del home.
- ✅ **Home: buscador con dos salidas** — "Listado de propiedades" (submit/Enter → `/search` con filtros) y "Buscar en Mapa" (→ `/explore`). `useHomeSearch` separa acciones `list`/`map` (respeta el gate de ubicación). Se **quitó el select "Precio"**. El **Tipo** ahora usa `property_type_id` real (mismos ids que el panel de filtros) → queda seleccionado al llegar a `/search`.
- ✅ **Mapa (`/explore`) centrado en la búsqueda** — el home y el buscador del propio mapa pasan `lat/lng/bbox` (Geoapify; `useGeoapifyPlaces` ahora expone `bbox`) por la URL; `ExplorePage` arma un `focus` y `ProvinceMap` (componente `MapView`) hace **zoom al bbox/centro** en vez de a todo el país. El buscador del mapa **hace zoom** (ya no navega a `/search`) y viene **precargado** con lo buscado en el home.
- ✅ **Sugeridas relacionadas con la propiedad vista** — el pool se acota a **misma operación + provincia** (`buildRelatedFilters`) vía `/properties/search` y se rankea por afinidad, en vez de traer `/properties` sin filtros (antes un temporario sugería ventas de otra zona).
- ✅ **Consulta (lead) precargada con el usuario logueado** — `usePropertyDetail` + `leadFormForUser` completan nombre/email/teléfono si hay sesión (solo campos vacíos; se re-precarga tras enviar).
- ✅ **`certification_document_url` = URL firmada temporal** — el backend endureció el archivo (disco privado + ruta `signed`); el front lo consume igual en `<img>`/`<iframe>` (la firma va en la query). Si expira, recargar el detalle.
- ✅ **Ajustes mobile-first** — overflow horizontal del detalle (breadcrumb que empujaba el ancho), flechas del lightbox visibles en touch (antes `opacity-0 group-hover`), y control de orden del listado (etiqueta oculta + flecha propia centrada) en mobile.

### Histórico
- ✅ **Moneda nativa / `price_usd` retirado** (spec `search/currency_native`). La búsqueda filtra por `currency` (`SearchPage` → `useProperties`, default por operación en el backend); creación/edición/reducción mandan solo `price_amount`/`price_currency`. Se eliminó la conversión inventada (`ARS/1000`).
- ✅ **`useFilterStore` eliminado** (era código muerto).
- ✅ **`sort` por precio ahora funciona** como orden **secundario** (backend `sort=price_asc|price_desc`; destacadas siguen primero). Spec `search/search_coherence`.
- ✅ **Filtro por inmobiliaria funciona** (`agency_id`; el estado `userId` se renombró a `agencyId`). Spec `search/search_coherence`.
- ✅ **Moderación + revisión de certificación (admin) — en el DashboardPage.** ⚠️ Corrección: la moderación original vivía en `features/admin/AdminPage.jsx`, que era **código muerto** (`/admin` → `Navigate` a `/dashboard`); **nunca fue accesible**. Se eliminó ese código muerto (`features/admin/**` + `useAdminData.js` + import lazy en `AppRouter`) y la feature se cableó en el panel real: nueva pestaña **"Certificaciones"** en `DashboardTabs` (admin, con badge del nº de pendientes) → `CertificationsTab` lista la cola (`pendingCertifications`, derivada en `useDashboardQueries`). Cada fila abre `CertificationReviewModal` con preview del documento (imagen `<img>` / PDF `<iframe>` / fallback link) + aprobar/rechazar (`moderateCertification` en `useDashboardMutations`, `PATCH /admin/properties/{id}/verify`). El dato ya llegaba (`certificationDocumentUrl`, backend `canSeePrivate`). Spec `admin/certification_review`.
- ✅ **Subida de imágenes arreglada** — se persisten vía `POST /properties/{id}/images` (antes se perdían). Spec `property/image_upload`.
- ✅ **Gestión de imágenes al editar** — borrar (`DELETE /images/{id}`) y reordenar/portada por drag (`PUT /images/order`). `PropertyForm` preserva `{id,url}` de las existentes; `ImageUploader` reordena; `EditPropertyPage` aplica borrado → upload → orden. Spec `property/image_management`.
- ✅ **Filtros avanzados de búsqueda** — el front cablea los filtros que el backend ya soportaba y estaban sin exponer: `province`, `department` (cascada desde `/locations`), `property_type_id` (tipos reales, no hardcode), `rooms_min`, `bedrooms_min`, `parking_spaces_min`, `condition`, `pets_allowed`, `professional_use`. `useProperties` arma la query vía `properties.query.js` (`buildSearchQueryString`, table-driven); UI en `SearchFilters`/`LocationAutocomplete`. Spec `search/advanced_filters`. *(Pendiente 2ª iteración: `features[]` amenities + `neighborhood` + rangos con máximo.)*
- ✅ **`ProfilePage` duplicado eliminado** — se borró el muerto `features/auth/pages/ProfilePage.jsx` (el router usa el de `profile/`). Spec `quality/governance_enforcement`.
- ✅ **Boundary de red con dientes + `fetch` de Nominatim movido a hook** — el `fetch` directo de `MapLocationSelector` pasó a `useGeocodeSearch` (capa de datos); el linter ahora prohíbe `fetch(`/`XMLHttpRequest` en `features/**`+`common/**` (`no-restricted-syntax`), no solo el import de `api/api.js`. Spec `quality/governance_enforcement`.
- ✅ **Código muerto barrido + guardia `knip`** — se sumó `knip` como gate de CI y en su primera corrida detectó y se eliminaron: 5 archivos huérfanos (`PlanBadge`, `hooks/index.js` barrel, `useLeads`, `mock/data/cities.js`, `theme/aceTheme.js`), 2 exports muertos (`getPublisherById`, `deleteProperty` en `useProperties`) y 3 exports innecesarios de-exportados. Se declaró `js-yaml` (usaba `.eslintrc.cjs` sin estar en `package.json`). Spec `quality/deadcode_guard`.
- 🟢 **`.env` con `VITE_GEOAPIFY_API_KEY` versionada** — key de front (pública), pero conviene revisar restricción por dominio.
- ✅ **`npm run test` — VUELTO a ser gate duro (CI).** Se migró el entorno de `jsdom` → **`happy-dom`** (sin binario nativo → sin el EPERM intermitente de Windows que lo había sacado del CI). La suite (36 tests) corre estable local y en CI. Sigue vigente el objetivo de **ampliar cobertura** en los hooks de datos críticos (`useAuth`, `useProperties`, `useLeads`, `usePlans`); ver `.ai/policies/architecture-policies.yaml` sección `testing`. **Nuevo test → parte del trabajo, no opcional.**

### Backlog de reconciliación de la fitness function (ratchet)
La fitness function (ESLint) arrancó verde vía **ratchet**: 16 archivos con deuda preexistente listados en `.eslintrc.cjs` (`LEGACY`). El gate **bloquea violaciones nuevas**; estas se saldan por spec y se sacan de `LEGACY` al refactorizar. **✅ RATCHET SALDADO (0):** los 16 se refactorizaron; `LEGACY = {}` está **vacío** → la fitness function ya **no tiene excepciones**, todo el código cumple los límites. Los 2 últimos: `PropertyCard` (complexity) → helpers `conditionBadge`/`locationText` + sub-componentes `CardMedia`/`CardPrice`/`CardTags`/`CardFeatures`; `HomePage` (524 líneas) → `useHomeSearch` (hook) + `HomeHero`/`HomeSearchBox`/`FeaturedProperties`/`HomeBenefits`/`HomeCTA` (spec `home/homepage_split`). Regla: **no reintroducir entradas** a `LEGACY`.

- **Boundary (UI→api directo)** — ✅ **categoría saldada.** `SearchPage`+`ProfilePage` vía `useAgencies` (spec `profile/agency_hook`); `PropertyForm` vía `usePropertyFormRefs` (spec `property/form_refs_hook`); `PropertyCard`→`useFavorites`, `ExplorePage`→`useExploreProperties`, `CreatePropertyPage`→`usePublications` (spec `quality/boundary_cleanup`). El boundary UI→api queda **enforced** en toda la capa UI.
- **rules-of-hooks** — ✅ **categoría saldada.** `PropertyCard`/`PropertyMap`/`ProvinceMap`: hooks antes del `return` condicional (crash real; spec `quality/hooks_order_fix`). `useLeads`/`usePlans`/`useProperties`: el hack `getQueryClient` (que además **rompía la invalidación de cache** en las funciones exportadas de `useProperties`) → `useQueryClient()` incondicional + singleton en `src/lib/queryClient.js` (spec `quality/query_client_singleton`).
- **Tamaño/complejidad** — ✅ **categoría saldada (ratchet en 0).** *(salieron enteros: `PropertyCard` → helpers + sub-componentes y `HomePage` → `useHomeSearch` + secciones (spec `home/homepage_split`); `SearchPage` → `components/SearchFilters` + `components/LocationAutocomplete` + `search.helpers` (spec `search/advanced_filters`); `PropertyDetailPage` → `components/detail/` (spec `property/detail_split`); `ProfilePage` (591→200) → `components/` + `useMercadoPagoReturn` (spec `profile/profile_split`); `DashboardPage` (981→204) → `components/` (spec `dashboard/dashboard_split`); `PropertyForm` (1068→95) → `usePropertyForm` + `propertyForm.helpers` + `components/form/` (spec `property/property_form_split`); `useDashboardData` (352→51) → sub-hooks (spec `dashboard/dashboard_data_split`); `usePropertyDetail` + `mapProperty` → helpers puros (spec `property/detail_and_mapper_split`).)*

## Gobernanza
- `.ai/` — gobernanza propia del front (`context`, `policies`, `workflows`). Producto = compartido (pointer al backend).
- Fitness function: **ESLint con dientes** (`.eslintrc.cjs` lee `.ai/policies/architecture-policies.yaml`; reglas en `error` + `--max-warnings 0`; **`LEGACY` vacío → sin excepciones**). Boundary de red en `features/**`+`common/**`: prohíbe importar `api/api.js` (`no-restricted-imports`) **y** `fetch(`/`new XMLHttpRequest()` (`no-restricted-syntax`). Corre en CI (`.github/workflows/ci.yml`) y en `.githooks/pre-commit` (que invoca eslint vía `node` directo, no `npm run`, para no depender de bash en Windows).
- **Guardia de código muerto: `knip`** (`knip.json`) — gate duro en CI (`npm run knip`). Detecta archivos, exports y dependencias huérfanos (lo que dejó pasar `AdminPage`/`ProfilePage` muertos). Debe quedar **limpio**.
- **Coherencia contrato↔front:** `npm run api:surface` (script `scripts/api-surface.mjs`) + checklist en STEP 3.5 del workflow. Extrae la superficie de API real y la diffea contra el contrato del backend. No es gate de CI (el contrato vive en otro repo); es la ritualización del chequeo que faltaba (causa raíz de los filtros de search ausentes).
- **Exactitud del PROJECT-MAP con dientes: `npm run map:check`** (`scripts/project-map-check.mjs`) — **gate duro** en CI y pre-commit. Deriva del código rutas/hooks/stores/componentes comunes y **falla si alguno no figura en este archivo**. Chequea PRESENCIA por nombre (no un touch → no se gamea bumpeando la fecha; no valida la descripción, eso sigue siendo criterio humano). Nace de que el mapa driftó (`BackButton`/`FooterLogo` quedaron fuera).
- Comandos clave: `npm run lint` · `npm run knip` · `npm run map:check` · `npm run api:surface` · `npm run test` · `npm run dev`.
