# Bug-card: Location gate falla por acentos (marca "fuera de zona" estando en Tucumán)

**Área:** `home`
**Tier:** 2 · Bugfix
**Estado:** ✅ resuelta

---

## 1. Síntoma
Un usuario **en Tucumán** activa la ubicación y el modal le dice *"Actualmente te
encuentras en **Tucuman** … solo disponible para Tucumán y Santiago del Estero"* →
lo bloquea como **fuera de zona**. La pista: la provincia detectada aparece **sin acento**.

## 2. Causa raíz
`useUserProvince.js` comparaba con igualdad exacta de strings:
`ALLOWED_PROVINCES.includes(province)`. Geoapify (reverse geocoding) devuelve
`"Tucuman"` sin acento (o variantes de casing / `"Provincia de Tucumán"`), y la lista
tenía `"Tucumán"` con acento → nunca matchea → `status: "blocked"`.

## 3. Fix
- `useUserProvince.helpers.js` (nuevo): `normalizeProvince` (quita diacríticos + lower + trim)
  e `isAllowedProvince` (compara normalizado; tolera prefijo tipo "Provincia de …").
- `useUserProvince.js`: usa `isAllowedProvince(province)` en vez de `includes` exacto.

## 4. Capa afectada
- [x] Hook (`src/hooks/`) + helper puro

## 5. Verificación
- [x] `npm run lint` verde
- [x] Test Vitest — `normalizeProvince` / `isAllowedProvince` (Tucuman/Tucumán/casing/fuera)
- [x] `PROJECT-MAP.md` actualizado
