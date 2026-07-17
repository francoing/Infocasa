# TRIAGE — ¿Qué tier es mi trabajo?

> **Leer ANTES de arrancar cualquier tarea.** La clasificación determina el proceso.
> Responder las preguntas en orden; la primera que matchee define el tier.

---

## Árbol de decisión

```
¿El cambio toca una capacidad nueva que el usuario no tenía antes?
│
├─ SÍ → ¿Requiere un endpoint nuevo o un cambio en el api-contract.md?
│         ├─ SÍ → TIER 3 (Feature con contrato nuevo)
│         └─ NO → ¿Toca más de 1 hook o más de 2 componentes?
│                  ├─ SÍ → TIER 3 (Feature)
│                  └─ NO → TIER 2 (Mejora puntual)
│
└─ NO → ¿El cambio tiene lógica de negocio / estado / mapeo de datos?
          ├─ SÍ → TIER 2 (Bugfix / Mejora puntual)
          └─ NO → TIER 1 (Hotfix / Tweak)
```

---

## TIER 1 — Hotfix / Tweak

**Ejemplos:** ajuste de estilo, texto cambiado, fix de tipeo, prop añadida a un componente existente sin lógica nueva, corrección de ruta, cambio de color/layout.

**Proceso:**
1. Hacer el cambio.
2. `npm run lint` → verde.
3. Commit.
4. Actualizar `PROJECT-MAP.md` si cambió algo de rutas/hooks/stores (1 línea). Si no cambió nada estructural, omitir.

**Sin spec. Sin bug-card.**

---

## TIER 2 — Bugfix / Mejora puntual

**Ejemplos:** un hook mal mapeado al contrato, un estado que no se resetea, un edge case no manejado, un componente que hace fetch directo (boundary), mejora de UX en feature existente.

**Proceso:**
1. Completar una **bug-card** (`.ai/workflows/bug-card.template.md`) en `specs/{area}/{feature}/bug-{nombre}.md`.
2. Fix en la capa correcta (hook / store / componente — nunca mezclar).
3. `npm run lint` → verde.
4. Test Vitest si la lógica del fix es no trivial (opcional para bugs visuales).
5. Actualizar `PROJECT-MAP.md` (sección Deuda si era deuda conocida).

**Sin spec completa.**

---

## TIER 3 — Feature

**Ejemplos:** nueva ruta, nueva pantalla, nuevo hook que consume un endpoint, integración con servicio externo, flujo completo nuevo (ej: moderación, checkout, gestión de imágenes).

**Proceso:** workflow completo en `.ai/workflows/create-feature.workflow.md` (STEP 0 al STEP 6).

**STOP RULE:** no escribir código sin `spec.md` alineada.

---

## Regla anti-tier-inflation

> Si dudás entre TIER 2 y TIER 3, preguntate: **¿el usuario va a notar una capacidad nueva o solo algo que antes estaba roto/feo?**
> - Roto/feo → TIER 2.
> - Capacidad nueva → TIER 3.

No usar TIER 3 para justificar más tiempo. No usar TIER 1 para evitar la bug-card cuando hay lógica real.
