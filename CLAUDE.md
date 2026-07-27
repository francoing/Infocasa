# CLAUDE.md — Router de gobernanza (Frontend)

> Índice de navegación para agentes de IA en el **frontend** (React). **No contiene contenido**, sólo enruta a la fuente correcta.
> Espeja el modelo de gobernanza del backend (`Backend-Inmobiliaria/CLAUDE.md`). El detalle vive en los archivos enlazados.

## PASO 0 — Clasificá el trabajo antes de cualquier otra cosa

> **Obligatorio.** El tier define el proceso. No saltear.

| Tier | ¿Cuándo? | Proceso |
| :--- | :--- | :--- |
| **TIER 1** · Hotfix/Tweak | Solo estilo, texto, prop, layout — sin lógica nueva | lint → commit → PROJECT-MAP si cambia estructura |
| **TIER 2** · Bugfix/Mejora | Lógica existente corregida o mejorada, sin feature nueva | bug-card → fix → lint → PROJECT-MAP |
| **TIER 3** · Feature | Capacidad nueva, ruta nueva, endpoint nuevo | spec completa → workflow create-feature |

→ Ver árbol de decisión completo: [.ai/workflows/triage.md](.ai/workflows/triage.md)

---

## Qué leer según lo que vayas a hacer

| Necesito… | Voy a… |
| :--- | :--- |
| Saber el **estado real** del front (rutas, features, stores, hooks) | [PROJECT-MAP.md](PROJECT-MAP.md) — **leer SIEMPRE primero** |
| Entender el **negocio** (visión, actores, reglas) | **capa compartida** → [.ai/product/README.md](.ai/product/README.md) (apunta al backend, canónico) |
| Conocer el **contrato de API** (rutas, shapes, filtros) | `Backend-Inmobiliaria/.ai/contracts/api-contract.md` — **el front consume, no edita** |
| Respetar la **arquitectura** (capas React, prohibiciones) | [.ai/context/architecture.md](.ai/context/architecture.md) |
| Aplicar **convenciones** de código/estilo | [.ai/context/conventions.md](.ai/context/conventions.md) |
| Conocer **límites medibles** (tamaño, complejidad, boundaries) | [.ai/policies/architecture-policies.yaml](.ai/policies/architecture-policies.yaml) |
| **Clasificar el trabajo** (¿qué tier?) | [.ai/workflows/triage.md](.ai/workflows/triage.md) — **PASO 0 siempre** |
| **Arreglar un bug / mejora puntual** (TIER 2) | copiar [.ai/workflows/bug-card.template.md](.ai/workflows/bug-card.template.md) → `specs/{area}/{feature}/bug-{nombre}.md` |
| **Implementar una feature** (TIER 3, paso a paso) | [.ai/workflows/create-feature.workflow.md](.ai/workflows/create-feature.workflow.md) |
| Escribir una **spec** nueva (TIER 3) | copiar [.ai/workflows/spec.template.md](.ai/workflows/spec.template.md) → `specs/{area}/{feature}/spec.md` |
| **Auditar la salud de la gobernanza** | [.ai/GOVERNANCE-HEALTH.md](.ai/GOVERNANCE-HEALTH.md) — completar cada ~4 semanas |

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

1. **Clasificá el trabajo primero** (triage.md). El tier determina todo lo que sigue.
2. **Leé `PROJECT-MAP.md` antes de tocar nada**; no re-explores todo el repo salvo que sea necesario.
3. **Spec/bug-card antes que código.** TIER 3 → spec completa (STOP RULE). TIER 2 → bug-card. TIER 1 → sin doc.
4. **Datos solo por `hooks/`.** Ningún componente/página llama a `api/api.js` ni hace `fetch` directo (ver `.ai/context/architecture.md`).
5. **Actualizá `PROJECT-MAP.md`** al terminar (es lo primero que driftea; el pre-commit te lo recuerda).
6. Antes de finalizar: `npm run lint` (fitness function — el gate duro). Tests: deuda declarada, no gate aún (ver PROJECT-MAP.md).
7. **Armá PR según el criterio** (ver [conventions.md](.ai/context/conventions.md) → "Criterio para armar PR"): directo a `QA` si el cambio es ≤3 archivos y 1 módulo; **PR** si es más grande, cruza módulos, o toca contrato de API / seguridad-auth / deploy-infra. **`production` solo por promoción vía PR.**
