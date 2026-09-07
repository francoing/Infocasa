# ARCHITECTURE CONTRACT — REACT FEATURE-BASED (STRICT)

> **Relación con la base genérica de React:** este documento **especializa** las buenas prácticas genéricas de React/Vite para ESTE proyecto. Ante conflicto, **este archivo gana**.
> Espeja el contrato DDD del backend (`Backend-Inmobiliaria/.ai/context/architecture.md`), traducido a idioma React.

## Propósito

Definir las reglas de arquitectura del frontend. Cualquier dev o agente de IA que modifique este código debe adherir estrictamente a estos patrones para prevenir degradación, acoplamiento y drift con el contrato del backend.

---

## Principios base

- **Flujo por capas:** el flujo estándar debe seguir:
  ```txt
  Route → Page (features/{area}/pages) → Component (features/{area}/components)
        → Hook (react-query, capa de datos) → api/api.js (único cliente HTTP) → Backend /api/v1
  ```
- **Aislamiento UI ↔ datos:** los componentes/páginas **nunca** llaman a `api/api.js` ni hacen `fetch` directo. Toda lectura/escritura de datos pasa por un **hook** en `src/hooks/`. (Equivale a "no queries en controllers" del backend.)
- **Separación de estado:**
  - **Estado de servidor** (todo lo que viene del backend) lo posee **TanStack Query**. **Nunca** se copia una respuesta del backend dentro de un store Zustand.
  - **Estado de cliente** (token, filtros de búsqueda, toasts, UI efímera) vive en **Zustand**.
- **Cliente HTTP único:** existe un solo `api/api.js`. Nada de `fetch` suelto ni instancias paralelas.

---

## Estructura (feature-based modular)

Cada feature de negocio vive en `src/features/{area}/`:

```txt
src/features/{area}/
├── pages/        # Rutas montables (una por entrada del router)
└── components/   # Componentes propios de esa feature
```

Infra transversal:
```txt
src/api/        # Cliente HTTP único (api.js)
src/hooks/      # Capa de datos (react-query) — el ÚNICO lugar que toca api.js
src/store/      # Zustand (estado de cliente)
src/router/     # AppRouter + ProtectedRoute
src/common/     # Componentes compartidos entre features
src/lib/        # Helpers puros (sin estado, sin HTTP)
```

### Responsabilidades por capa

**1. Pages** — punto de entrada de una ruta. Componen componentes y hooks; no contienen lógica de negocio ni llamadas HTTP. Se registran en `router/AppRouter.jsx`.

**2. Components** — presentación + interacción. Reciben datos por props o los leen de un hook. **Sin lógica de negocio en el JSX** (derivar/computar en el hook o en `lib/utils.js`).

**3. Hooks (`src/hooks/`)** — la capa de datos. Envuelven `useQuery`/`useMutation`, definen las **query keys**, y son el único módulo que importa `api/api.js`. Acá vive el mapeo al contrato del backend.

**4. Stores (`src/store/`)** — solo estado de cliente. `useAuthStore` (sesión), `useFilterStore` (filtros), `useToastStore` (toasts). No guardar acá datos de servidor.

**5. Router** — `AppRouter` mapea rutas → pages; `ProtectedRoute` gatea por `isAuthenticated` + `allowedRoles`.

---

## Prohibiciones estrictas

1. **No `api.*` ni `fetch` fuera de `hooks/`.** Componentes y páginas acceden a datos solo vía hooks. *(Enforced: `no-restricted-imports` prohíbe importar `api/api.js` fuera de `src/hooks/**`.)*
2. **No duplicar estado de servidor en Zustand.** React Query es el dueño; Zustand es solo cliente.
3. **No lógica de negocio en JSX.** Cálculos, formateos y reglas van en hooks o `lib/`.
4. **No re-implementar ordenamiento de resultados.** El backend ordena (destacadas primero, INVIOLABLE). El front respeta el orden recibido; el `sort` de cliente no puede ocultar destacadas.
5. **No hardcodear el shape de la API.** El contrato es `Backend-Inmobiliaria/.ai/contracts/api-contract.md`. Ej: `price` es `{ amount, currency }`, no un número; la búsqueda toma `currency`.

---

## Contrato con el backend

- El límite back↔front está documentado en `Backend-Inmobiliaria/.ai/contracts/api-contract.md`. **El front lo consume, no lo edita.**
- Ante un desajuste (el front necesita algo que el contrato no da): se abre un cambio en el **backend**, no se parchea el front adivinando.
