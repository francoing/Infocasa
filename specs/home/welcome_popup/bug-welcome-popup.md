# Bug-card: Pop up de bienvenida en el Home con invitación al Plan Fundador

**Área:** `home`
**Tier:** 2 · Bugfix / Mejora puntual (1 componente nuevo, sin endpoint ni hook nuevo)
**Estado:** ✅ resuelta

---

## 1. Síntoma
Al entrar al Home no hay ninguna bienvenida ni se difunde el Plan Fundador (landing `/plan-fundador`), que solo se descubre por link directo.

## 2. Causa raíz
No existía el componente. Mejora de UX en el Home (sin cambios de contrato).

## 3. Fix
- `features/home/components/WelcomeModal.jsx`: modal con logo, bienvenida a Infocasa y tarjeta del Plan Fundador (200 propiedades, 6 meses sin costo) con CTA "Quiero mi Plan Fundador" → `/plan-fundador`, más "Seguir explorando" y X.
- Se muestra **una vez por navegador** (flag `infocasa_welcome_seen` en localStorage; cualquier cierre lo marca) y **solo a visitantes sin sesión** (`/plan-fundador` redirige a `/profile` si hay usuario).
- `features/home/pages/HomePage.jsx`: monta `<WelcomeModal enabled={!user} />`.

## 4. Capa afectada
- [x] Componente / Página (`src/features/`)

## 5. Verificación
- [ ] `npm run lint` verde
- [x] Test Vitest `components/WelcomeModal`
- [x] `PROJECT-MAP.md` actualizado
