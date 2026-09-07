# Spec: QueryClient singleton + cerrar el hack getQueryClient (rules-of-hooks + bug real)

**Área:** `quality` (capa de datos)
**Estado:** ✅ implementada
**Fuentes:** `react-hooks/rules-of-hooks` · `.ai/context/architecture.md` (server state en react-query) · auditoría de sanidad 2026-07-15 (paydown #5)

## 1. Objetivo
`useProperties`/`useLeads`/`usePlans` usan un hack para obtener el QueryClient:
```js
const getQueryClient = () => { try { return useQueryClient(); } catch { return new QueryClient(); } };
```
Llamar `useQueryClient()` dentro de una función normal / try-catch viola `rules-of-hooks`. Pero en `useProperties` hay además un **bug real**: las funciones **exportadas** (`createProperty`, `updateProperty`, `deleteProperty`, `uploadPropertyImages`, `deletePropertyImage`, `updatePropertyImagesOrder`, `getPropertyById`) se ejecutan en event handlers **fuera del render** → `useQueryClient()` lanza → el `catch` devuelve un `new QueryClient()` **huérfano** → `invalidateQueries` sobre ese cliente **no toca el cache real**. Resultado: **la lista no se refresca** tras crear/editar/borrar/subir imágenes (queda stale hasta un refetch por otra vía).

## 2. Diseño
Dos casos distintos, dos soluciones:
- **Funciones fuera de render** (las exportadas de `useProperties`): necesitan el **cliente único** de la app. Se extrae a un módulo (`src/lib/queryClient.js`) y se importa. Así invalidan el **mismo** cache que ven los componentes.
- **Hooks que corren en render** (`useLeads`, `usePlans`, y el cuerpo del hook `useProperties`): `useQueryClient()` **siempre** funciona bajo el `QueryClientProvider` → basta llamarlo **incondicionalmente** (sin try/catch). Esto quita la violación **sin** cambiar de qué cliente dependen → **no rompe el aislamiento de cache de los tests** (que montan su propio `QueryClient` por wrapper).

## 3. Implementación
- **`src/lib/queryClient.js`** (nuevo): exporta `queryClient` (singleton) con las mismas `defaultOptions` que hoy tiene `App.jsx` (`refetchOnWindowFocus:false`, `retry:1`, `staleTime:5min`).
- **`App.jsx`**: importa `{ queryClient }` en vez de crear el suyo.
- **`useProperties.js`**: borra `getQueryClient`; importa el singleton; el hook y las funciones exportadas usan ese `queryClient`. Quita `useQueryClient`/`QueryClient` de imports.
- **`useLeads.js`**: `const queryClient = useQueryClient();` (incondicional). Quita `getQueryClient` y `QueryClient`.
- **`usePlans.js`**: reemplaza el `let queryClient; try{...}catch{...}` por `const queryClient = useQueryClient();`. Quita `QueryClient` del import.
- **`.eslintrc.cjs`**: `useLeads` y `usePlans` salen **enteros** del LEGACY; `useProperties` pierde `react-hooks/rules-of-hooks` (queda `complexity`).

## 4. Invariantes / riesgos
- El singleton **es** el cliente del `Provider` → dentro de componentes `useQuery` y las invalidaciones apuntan al mismo objeto. Comportamiento idéntico, salvo que **ahora sí** se invalida (fix del bug).
- Tests de `usePlans`: siguen usando el cliente de su wrapper (porque el hook usa `useQueryClient()` del contexto, no el singleton) → sin fugas de cache entre tests.

## 5. Criterios de aceptación
1. Ningún `try/catch` alrededor de `useQueryClient`; ninguna llamada a hooks fuera de render.
2. `useLeads`/`usePlans` fuera del LEGACY; `useProperties` sin `rules-of-hooks`. `npm run lint` verde.
3. Tras crear/editar/borrar una propiedad, la lista (`me_properties`/`properties`) se refresca sin recargar la página.

## 6. Fuera de alcance
- `complexity` de `useProperties` (mapProperty + useProperties son grandes) → deuda aparte.
