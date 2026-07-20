# Bug-card: {Título del bug o mejora}

> **Plantilla TIER 2.** Copiar a `specs/{area}/{feature}/bug-{nombre}.md`.
> Completar en < 5 minutos. Si tomás más, probablemente es TIER 3 — usá `spec.template.md`.

**Área:** `{home | search | explore | property | auth | dashboard | admin | profile | share}`
**Tier:** 2 · Bugfix / Mejora puntual
**Estado:** ⬜ abierta · ✅ resuelta

---

## 1. Síntoma
<!-- Qué falla o qué está mal. Pasos para reproducir (ruta, rol, acción). -->

## 2. Causa raíz
<!-- En qué capa está el problema: hook / store / componente / router / contrato.
     Si es drift de contrato (el front asumió un shape que el backend no da), decirlo. -->

## 3. Fix
<!-- Qué se cambia y en qué archivo. Una oración por cambio. -->

## 4. Capa afectada
<!-- Marcar la que corresponde. Solo una. -->
- [ ] Hook (`src/hooks/`)
- [ ] Store (`src/store/`)
- [ ] Componente / Página (`src/features/` o `src/common/`)
- [ ] Router (`src/router/`)

## 5. Verificación
- [ ] `npm run lint` verde
- [ ] Test Vitest (solo si la lógica del fix es no trivial)
- [ ] `PROJECT-MAP.md` actualizado si cambió algo estructural
