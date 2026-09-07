# CLAUDE.md — Router de gobernanza (Frontend)

> Índice de navegación para agentes de IA en el **frontend** (React). **No contiene contenido**, sólo enruta a la fuente correcta.
> Espeja el modelo de gobernanza del backend (`Backend-Inmobiliaria/CLAUDE.md`). El detalle vive en los archivos enlazados.

## Qué leer según lo que vayas a hacer

| Necesito… | Voy a… |
| :--- | :--- |
| Saber el **estado real** del front (rutas, features, stores, hooks) | [PROJECT-MAP.md](PROJECT-MAP.md) — **leer SIEMPRE primero** |
| Entender el **negocio** (visión, actores, reglas) | **capa compartida** → [.ai/product/README.md](.ai/product/README.md) (apunta al backend, canónico) |
| Conocer el **contrato de API** (rutas, shapes, filtros) | `Backend-Inmobiliaria/.ai/contracts/api-contract.md` — **el front consume, no edita** |
| Respetar la **arquitectura** (capas React, prohibiciones) | [.ai/context/architecture.md](.ai/context/architecture.md) |
| Aplicar **convenciones** de código/estilo | [.ai/context/conventions.md](.ai/context/conventions.md) |
| Conocer **límites medibles** (tamaño, complejidad, boundaries) | [.ai/policies/architecture-policies.yaml](.ai/policies/architecture-policies.yaml) |
| **Implementar una feature** (paso a paso) | [.ai/workflows/create-feature.workflow.md](.ai/workflows/create-feature.workflow.md) |
| **Arreglar un bug** | [.ai/workflows/fix-bug.workflow.md](.ai/workflows/fix-bug.workflow.md) |
| Escribir una **spec** nueva | copiar [.ai/workflows/spec.template.md](.ai/workflows/spec.template.md) → `specs/{area}/{feature}/spec.md` |

## Capas del sistema de gobernanza

```
Capa 1 · GOBERNANZA (el CÓMO, estable)     → .ai/context · .ai/policies · .ai/workflows
Capa 2 · PRODUCTO   (el QUÉ del negocio)    → COMPARTIDO: Backend .ai/product/ (canónico) — ver .ai/product/README.md
Capa 3 · SPECS      (QUÉ por feature)       → specs/{area}/{feature}/spec.md
Capa 4 · ESTADO     (memoria viva)          → PROJECT-MAP.md
```

## El ecosistema (back ↔ front)

- **`product/` es único y vive en el backend.** El front NO lo duplica: lo consume vía [.ai/product/README.md](.ai/product/README.md). Las reglas de negocio, actores y visión son las mismas para ambos.
- **El contrato de API** (`Backend-Inmobiliaria/.ai/contracts/api-contract.md`) es el límite. El backend lo mantiene; el front lo **respeta**. Si algo del front no calza con el contrato, el contrato manda (o se abre un cambio en el backend).
- **El orden de resultados lo impone el backend** (destacadas primero, INVIOLABLE). El front nunca reordena para ocultarlas.

## Jerarquía de fuentes de verdad (ante conflicto)

```
Código real  >  PROJECT-MAP.md  >  api-contract.md (backend)  >  specs/{feature}/spec.md  >  product (backend)  >  .ai/context
```

## Reglas de oro

1. **Leé `PROJECT-MAP.md` antes de tocar nada**; no re-explores todo el repo salvo que sea necesario.
2. **Spec antes que código.** No implementar sin `spec.md` alineada (STOP RULE del workflow). `plan.md`/`tasks.md` son opcionales (solo épicas grandes).
3. **Datos solo por `hooks/`.** Ningún componente/página llama a `api/api.js` ni hace `fetch` directo (ver `.ai/context/architecture.md`).
4. **Actualizá `PROJECT-MAP.md`** al terminar una feature (STEP 7). Es lo primero que driftea.
5. Antes de finalizar cambios: `npm run lint` (fitness function con dientes) + `npm run test`.
