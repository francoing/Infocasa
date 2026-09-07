# PROJECT MAP — Frontend (Front-inmob / InfoCasa)

> ⏱ **Última sincronización: 2026-08-25** — actualizar al terminar cualquier feature (Regla de oro #5).

> **Capa 4 (Estado real).** Fuente de verdad del ESTADO del frontend. El código manda sobre este mapa.
> Sincronizar tras cada feature (STEP 7 de `.ai/workflows/create-feature.workflow.md`).
> Para el QUÉ del negocio ver la capa compartida (`.ai/product/README.md` → backend); para el CÓMO técnico ver `.ai/context/`.
>
> Última sincronización: 2026-07-15 (gestión de imágenes al editar: borrar + reordenar/portada).

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
│                            useAdminData, useDashboardData, useAuth, useAgencies, usePropertyFormRefs,
│                            useGeoapifyPlaces, useUserProvince, useToast
├── common/components/    ← Layout, AdminLayout, PropertyCard, PlanBadge, PlanStatusCard, ToastContainer,
│                            WhatsAppButton, Loader, Logo, EmailVerificationBanner
├── router/               ← AppRouter (rutas) + ProtectedRoute (auth + allowedRoles)
├── lib/                  ← utils.js (clsx/tailwind-merge) · queryClient.js (singleton react-query)
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

**Vitest + Testing Library sobre `happy-dom`** (entorno en `vite.config.js`). **Gate duro en CI** (`npm run test`). Hoy: `components/CheckoutModal`, `components/PlanStatusCard`, `components/SearchFilters`, `components/Loader`, `components/LocationGateModal`, `hooks/usePlans`, `hooks/useUserProvince`, `hooks/useHomeSearch`, `store/useAuthStore`, `helpers/crossNav`, `helpers/userProvince`, `helpers/locationSearch`, `setup.js` (90 tests). **Regla:** funcionalidad importante nueva (botón con lógica, componente, hook, helper) suma test — ver `.ai/policies/architecture-policies.yaml` → `testing.reglas`. Cobertura a ampliar en hooks de datos críticos (ver deuda).


## Deuda técnica / drift conocido

### Ciclo 2026-08-19 (páginas legales)
- ✅ **Términos y Condiciones + Política de Privacidad** — feature `features/legal/` con dos rutas públicas (`/terminos-y-condiciones`, `/politica-de-privacidad`) linkeadas desde el footer de `Layout`. Contenido **estático** (sin datos/API ni lógica de negocio): `LegalDoc` (shell + primitivos `Section/Clause/P/UL/OL/Note`), páginas `TermsPage`/`PrivacyPage`, y `content/sharedLegal.jsx` (`DatosIdentificatorios` + `TituloIV` reusados por ambas). Refleja el documento legal "Integral V3.0". **Pendiente del ANEXO (no implementado aún):** links legales también en registro/checkout/carga de aviso, tooltip de "Domicilio Certificado", disclaimers al pie de calculadoras/simuladores y formularios de contacto, botón de arrepentimiento, y trazabilidad de aceptación (backend).

### Ciclo 2026-08-10 (marca en los preloads)
- ✅ **Preloads unificados con el isotipo de Infocasa** — `Loader` (`common/components/Loader.jsx`) es la **única fuente** para estados de carga de página/sección: isotipo de marca con `animate-heartbeat`. Nuevo prop `inline` (+ `className`/`label`) para cargar una sección dentro de un layout sin ocupar toda la pantalla. Se reemplazaron los spinners genéricos (`Loader2`) y el texto bespoke "Cargando propiedad premium…" por `<Loader>` en: `PropertyDetailPage`, `ExplorePage`, `SearchPage`, `FeaturedProperties` (home), `DashboardPage`, `EditPropertyPage`, `PropertyForm` (loadingRefs). Los spinners **chicos dentro de botones/inputs** (submit, autocomplete "Buscando…") **siguen con `Loader2`** (no son preloads). Test: `components/Loader`.

### Ciclo 2026-07-28 (UX + mobile + mapa)
- ✅ **Navegación: botón "Volver" global** — `common/components/BackButton.jsx` (vuelve a la página anterior; si no hay historial, va al home). En `Layout` (todas las rutas menos home, dentro del header) y en el header mobile de `AdminLayout`. Se **quitó el enlace "Todas las Propiedades"** del header; su función pasó al buscador del home.
- ✅ **Home: buscador con dos salidas** — "Listado de propiedades" (submit/Enter → `/search` con filtros) y "Buscar en Mapa" (→ `/explore`). `useHomeSearch` separa acciones `list`/`map`. **El gate de ubicación SOLO se abre cuando NO hay dirección cargada** (input vacío y provincia sin verificar en la sesión): con dirección cargada navega directo a resultados sin pedir permiso. Se **quitó el select "Precio"**. El **Tipo** ahora usa `property_type_id` real (mismos ids que el panel de filtros) → queda seleccionado al llegar a `/search`.
- ✅ **Gate de ubicación endurecido** (bug-card `home/location-gate`) — `useUserProvince` distingue `denied` (permiso denegado por el navegador) de `blocked` (fuera de Tucumán/Santiago del Estero): el modal muestra copia propia ("Permiso de ubicación denegado") en vez de la de fuera de zona. `LocationGateModal` **bloquea el backdrop durante `checking`** (solo cierra en `blocked | denied | error`) para evitar la race con el callback de `getCurrentPosition` (antes se perdía el resultado `allowed` con el modal cerrado). Cerrar el gate **ya no resetea la pestaña de operación** (`useHomeSearch` sin `setOperation("")` en `handleGateClose`). Tests nuevos: `hooks/useUserProvince`, `hooks/useHomeSearch`, `components/LocationGateModal`.
- ✅ **Mapa (`/explore`) centrado en la búsqueda** — el home y el buscador del propio mapa pasan `lat/lng/bbox` (Geoapify; `useGeoapifyPlaces` ahora expone `bbox`) por la URL; `ExplorePage` arma un `focus` y `ProvinceMap` (componente `MapView`) hace **zoom al bbox/centro** en vez de a todo el país. El buscador del mapa **hace zoom** (ya no navega a `/search`) y viene **precargado** con lo buscado en el home.
- ✅ **Autocomplete de búsqueda por INVENTARIO** (reemplaza Geoapify) — `useLocationSearch` (+ helper `buildLocationSuggestions`, con test) sugiere en el home y en el filtro **solo ubicaciones con propiedades publicadas** (`/locations.properties_count > 0`), con sus coords reales. Resuelve dos bugs: el autocomplete no dependía de la key/dominio (fallaba en QA) y sugería lugares cuyo nombre no matcheaba el `city` real (→ 0 resultados). El **zoom** del mapa resuelve las coords por inventario (`findLocationFocus`, con test) cuando no vienen en la URL — se retiró `useGeoapifyGeocode`. Geoapify queda solo para creación de propiedad + gate de ubicación. Spec `explore/inventory_location_autocomplete` (front) / `properties/locations_property_count` (back).
- ✅ **Paridad de filtros listado ↔ mapa** — `/explore` pasó a ser **filter-driven por query params** (mismo esquema que `/search`; `/explore/:operation` queda como compat que siembra la operación). El mapa reusa `SearchFilters` (sidebar + drawer) y trae marcadores con **`useProperties(filters)`** (se retiró `useExploreProperties`). "Aplicar Filtros" re-busca en el mapa; el botón de cruce dice **"Ver listado"** (mapa) / **"Ver en el mapa"** (listado) y "Aplicar" quedó **debajo** del cruce. `searchToExploreUrl`/`exploreToSearchUrl` conservan **todos** los filtros; **"Todas las operaciones" funciona en el mapa**. Spec `explore/map_filters_parity`.
- ✅ **Sugeridas relacionadas con la propiedad vista** — el pool se acota a **misma operación + provincia** (`buildRelatedFilters`) vía `/properties/search` y se rankea por afinidad, en vez de traer `/properties` sin filtros (antes un temporario sugería ventas de otra zona).
- ✅ **Consulta (lead) precargada con el usuario logueado** — `usePropertyDetail` + `leadFormForUser` completan nombre/email/teléfono si hay sesión (solo campos vacíos; se re-precarga tras enviar).
- ✅ **`certification_document_url` = URL firmada temporal** — el backend endureció el archivo (disco privado + ruta `signed`); el front lo consume igual en `<img>`/`<iframe>` (la firma va en la query). Si expira, recargar el detalle.
- ✅ **Ajustes mobile-first** — overflow horizontal del detalle (breadcrumb que empujaba el ancho), flechas del lightbox visibles en touch (antes `opacity-0 group-hover`), y control de orden del listado (etiqueta oculta + flecha propia centrada) en mobile.

### Ciclo 2026-07-29 (cruce mapa ↔ listado)
- ✅ **Navegación cruzada mapa ↔ listado** — botón **"Ver propiedades en listado"** debajo del mapa (`ExplorePage` → `/search` con operación+ubicación vía `exploreToSearchUrl`) y botón **"Ver en el mapa"** en el panel de filtros, bajo el título "Filtros" antes de "Restablecer" (`SearchFilters`/`SearchPage` → `/explore/:op` vía `searchToExploreUrl`). Helpers puros nuevos: `features/explore/explore.helpers.js`, `searchToExploreUrl` en `search.helpers`. Ambos con test (`test/helpers/crossNav`, `test/components/SearchFilters`).
- ✅ **Ubicación del filtro → zoom en el mapa** — el autocomplete del filtro (`LocationAutocomplete`) ahora expone `onPick` con las coords de la sugerencia; `SearchFilters` las guarda y el botón "Ver en el mapa" arma un intent con `lat/lng/bbox` (solo si el texto sigue coincidiendo con lo elegido). `searchToExploreUrl` emite esas coords → el mapa hace zoom (mismo shape de URL que el home). Sin elegir sugerencia (texto suelto) → sin zoom fino, como antes (sin regresión).
- ✅ **Fix gate de ubicación por acentos** — Geoapify devuelve la provincia sin acento ("Tucuman") y la comparación exacta marcaba **fuera de zona** a usuarios de Tucumán. `useUserProvince.helpers.js` (nuevo: `normalizeProvince`/`isAllowedProvince`, con test) normaliza acentos/casing y tolera prefijo "Provincia de …"; `useUserProvince` usa el helper.

### Histórico
- ✅ **Moneda nativa / `price_usd` retirado** (spec `search/currency_native`). La búsqueda filtra por `currency` (`SearchPage` → `useProperties`, default por operación en el backend); creación/edición/reducción mandan solo `price_amount`/`price_currency`. Se eliminó la conversión inventada (`ARS/1000`).
- ✅ **`useFilterStore` eliminado** (era código muerto).
- ✅ **`sort` por precio ahora funciona** como orden **secundario** (backend `sort=price_asc|price_desc`; destacadas siguen primero). Spec `search/search_coherence`.
- ✅ **Filtro por inmobiliaria funciona** (`agency_id`; el estado `userId` se renombró a `agencyId`). Spec `search/search_coherence`.
- ✅ **Moderación de certificación (admin)** — aprobar/rechazar temporarias desde el AdminPage. Spec `admin/certification_moderation`.
- ✅ **Subida de imágenes arreglada** — se persisten vía `POST /properties/{id}/images` (antes se perdían). Spec `property/image_upload`.
- ✅ **Gestión de imágenes al editar** — borrar (`DELETE /images/{id}`) y reordenar/portada por drag (`PUT /images/order`). `PropertyForm` preserva `{id,url}` de las existentes; `ImageUploader` reordena; `EditPropertyPage` aplica borrado → upload → orden. Spec `property/image_management`.
- 🟢 **`ProfilePage` duplicado** — existe en `features/auth/pages/` y `features/profile/pages/`; el router usa el de `profile/`. El de `auth/` es código muerto (candidato a borrar).
- 🟢 **`.env` con `VITE_GEOAPIFY_API_KEY` versionada** — key de front (pública), pero conviene revisar restricción por dominio.
- 🟡 **`npm run test` — toolchain a medio arreglar.** `vitest` bajado de `^4.1.7` (incompatible con vite 5) a **`^2.1.9`** → `package-lock.json` regenerado y `npm ci` **vuelve a funcionar** (esbuild 0.21.5 alineado). Pero **jsdom** sigue fallando en el entorno **local** (Windows, `node_modules` inconsistente por instalaciones superpuestas / `EPERM`): `SyntaxError` cargando un archivo generado de jsdom. Muy probablemente **local-only** → verificar el paso de tests en CI limpio (Linux); si pasa, quitar `continue-on-error` de `ci.yml` y volverlo gate duro. Si también falla en CI, alinear jsdom.

### Backlog de reconciliación de la fitness function (ratchet)
La fitness function (ESLint) arrancó verde vía **ratchet**: 16 archivos con deuda preexistente listados en `.eslintrc.cjs` (`LEGACY`). El gate **bloquea violaciones nuevas**; estas se saldan por spec y se sacan de `LEGACY` al refactorizar. **No agregar entradas nuevas.** Auditoría de sanidad 2026-07-15 arrancó el paydown: quedan **9**.

- **Boundary (UI→api directo)** — mover la llamada a un hook: `PropertyCard`, `ExplorePage`, `CreatePropertyPage`. *(Ya salieron: `SearchPage`+`ProfilePage` vía `useAgencies` (spec `profile/agency_hook`); `PropertyForm` vía `usePropertyFormRefs` (spec `property/form_refs_hook`).)*
- **rules-of-hooks** — ✅ **categoría saldada.** `PropertyCard`/`PropertyMap`/`ProvinceMap`: hooks antes del `return` condicional (crash real; spec `quality/hooks_order_fix`). `useLeads`/`usePlans`/`useProperties`: el hack `getQueryClient` (que además **rompía la invalidación de cache** en las funciones exportadas de `useProperties`) → `useQueryClient()` incondicional + singleton en `src/lib/queryClient.js` (spec `quality/query_client_singleton`).
- **Tamaño/complejidad (componentes/hooks gigantes)** — `PropertyForm` (1068), `DashboardPage` (981), `ProfilePage` (591), `HomePage` (524), `useDashboardData`, `useProperties`, `usePropertyDetail`. *(✅ `PropertyDetailPage` salió entero: partido en `components/detail/` — spec `property/detail_split`.)*

## Gobernanza
- `.ai/` — gobernanza propia del front (`context`, `policies`, `workflows`). Producto = compartido (pointer al backend).
- Fitness function: **ESLint con dientes** (`.eslintrc.cjs` lee `.ai/policies/architecture-policies.yaml`; reglas en `error` + `--max-warnings 0`). Corre en CI (`.github/workflows/ci.yml`) y en `.githooks/pre-commit`.
- Comandos clave: `npm run lint` · `npm run test` · `npm run dev`.
