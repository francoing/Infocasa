# Spec: Split de HomePage + PropertyCard (cerrar ratchet a 0)

**Área:** `home` / `quality`
**Estado:** ✅ implementada
**Fuentes:** `.ai/policies/architecture-policies.yaml` · auditoría de gobernanza 2026-07-20

## 1. Objetivo
Saldar las **2 últimas** entradas del ratchet (`.eslintrc.cjs` → `LEGACY`), dejándolo en **0** (sin excepciones):
- `PropertyCard` violaba `complexity` (muchos `&&`/ternarios en el render).
- `HomePage` violaba `max-lines` (524) y `max-lines-per-function` (render de ~320 líneas con lógica de búsqueda embebida).

## 2. Cambios
### PropertyCard (`src/common/components/PropertyCard.jsx`)
- Helpers puros: `conditionBadge(condition)` (lookup, reemplaza ternario anidado), `locationText(property)`, `symbol(currency)`.
- Sub-componentes: `CardMedia` (imagen + badges + favorito), `CardPrice`, `CardTags` (inmobiliaria/mascotas/prof), `CardFeatures` (con `Feature`). Cada función queda < complejidad 20. Markup idéntico.

### HomePage (`src/features/home/`)
- **`hooks/useHomeSearch.js`** (nuevo): estado del formulario, autocompletado Geoapify, gate de ubicación (una sola vez) y navegación a `/search`/`/explore`. Extrae `buildSearchUrl`/`mapOperationToApi`.
- **`components/HomeSearchBox.jsx`**: la caja de búsqueda (tabs, ubicación con sugerencias, tipo/precio, submit).
- **`components/HomeHero.jsx`**: hero (título, stats, `HomeSearchBox`, `LocationGateModal`). Llama `useHomeSearch`.
- **`components/FeaturedProperties.jsx`**, **`HomeBenefits.jsx`**, **`HomeCTA.jsx`**: secciones extraídas.
- **`pages/HomePage.jsx`**: solo composición (`useProperties` para destacadas + las 4 secciones).
- **Código muerto eliminado**: `SelectGroup`, consts `ROOMS`/`BATHROOMS`, estados `locationTags`/`rooms`/`bathrooms`/`step`/`filterModalOpen` y sus handlers (definidos pero nunca renderizados).

## 3. Invariantes (sin regresión)
- Home se ve y comporta igual: hero, buscador con gate de ubicación (sessionStorage `infocasa_location_verified`), destacadas (primeras 6), beneficios y CTA. Mismo markup/estilos.
- La navegación de búsqueda arma la misma URL (`operation`/`location`/`type`/`maxPrice`), incluida la compat de `?type=` que consume `SearchPage`.

## 4. Criterios de aceptación
1. `LEGACY = {}` en `.eslintrc.cjs`; `npm run lint` (eslint) verde con **cero** excepciones. `vite build` compila.
2. Todas las funciones bajo sus límites (component cx 20 / mlpf 200 / max-lines 300; hook mlpf 150 / max-lines 250; page max-lines 400).

## 5. Fuera de alcance
- Siguientes pasos de gobernanza: `knip` (código muerto) en CI, coherencia contrato↔front, gate de tests real.
