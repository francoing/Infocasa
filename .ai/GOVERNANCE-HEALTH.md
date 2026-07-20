# GOVERNANCE HEALTH — Checklist de salud

> Completar al inicio de un ciclo de trabajo o cada ~4 semanas.
> Tarda < 10 minutos. Si algo está en rojo → abrí una deuda en `PROJECT-MAP.md`.
> Fecha de última auditoría: _(completar)_

---

## 1. Gate de CI (el diente real)

- [ ] `npm run lint` pasa en verde localmente (`--max-warnings 0`)
- [ ] CI pasa en la rama `QA` (GitHub Actions)
- [ ] `LEGACY` en `.eslintrc.cjs` tiene **≤ 3 entradas** (objetivo: 0 — actualmente: 3)
  - Si hay entradas nuevas → STOP: no se agrega deuda nueva, se refactoriza.

---

## 2. PROJECT-MAP

- [ ] "Última sincronización" tiene < 2 semanas
- [ ] No hay rutas en `AppRouter.jsx` que no estén en el mapa
- [ ] No hay hooks en `src/hooks/` que no estén listados en el mapa
- [ ] No hay stores en `src/store/` que no estén listados en el mapa
- [ ] Sección "Deuda técnica" no tiene ítems sin estado claro (✅ / 🟢 / 🟡 / 🔴)

---

## 3. Specs

- [ ] No hay features implementadas sin su `spec.md` marcada ✅
- [ ] No hay specs en estado 🟦 (aprobada) sin implementación desde hace > 4 semanas
- [ ] No hay bugs recurrentes sin su `bug-{nombre}.md` en `specs/{area}/{feature}/`

---

## 4. Contrato back ↔ front

- [ ] El `api-contract.md` del backend fue revisado en el último mes
- [ ] No hay endpoints que el front consuma que no estén en el contrato
- [ ] Si hay drift conocido → está declarado en PROJECT-MAP.md ("Deuda técnica")

---

## 5. Tests (deuda declarada — no gate aún)

- [ ] `npm run test` pasa localmente **o** la falla está documentada en PROJECT-MAP.md
- [ ] Criterio para volver a meterlo como gate duro:
  - Cobertura ≥ 80% en hooks críticos (`useAuth`, `useProperties`, `useLeads`, `usePlans`)
  - jsdom toolchain estable en Windows y CI Linux

---

## 6. Workflows y gobernanza

- [ ] Nuevos agentes/devs pueden clasificar trabajo solo con `triage.md` sin preguntar
- [ ] El pre-commit hook está activo (`git config core.hooksPath .githooks` corrido en este clon)
- [ ] No hay archivos en `.ai/` que contradigan el código real (gobernanza no driftó)

---

## Historial de auditorías

| Fecha | Quién | Ítems en rojo | Acción tomada |
| :--- | :--- | :--- | :--- |
| _(completar)_ | _(vos)_ | _(lista)_ | _(qué se abrió)_ |
