# Spec: {Nombre de la feature}

> **Plantilla de especificación (Capa 3 · SDD por feature — Frontend).**
> Copiar a `specs/{area}/{feature}/spec.md` y completar TODAS las secciones antes de escribir código.
> Borrar estas líneas de ayuda y los ejemplos `<!-- -->` al completar.

**Área:** `{home | search | explore | property | auth | dashboard | admin | profile | share}`
**Estado:** ⬜ borrador · 🟦 aprobada · ✅ implementada
**Fuentes relacionadas:** [.ai/product/README.md](../../.ai/product/README.md) (negocio, backend) · `Backend-Inmobiliaria/.ai/contracts/api-contract.md` (contrato)

---

## 1. Objetivo y valor
<!-- Qué problema del usuario resuelve y para qué rol. Por qué existe. -->

## 2. Reglas y comportamiento
<!-- Las invariantes de ESTA feature en el front. Qué debe pasar siempre y qué NO.
     Referenciar el product compartido cuando aplique una regla global (ej. "destacadas primero lo ordena el backend"). -->

## 3. Actores y accesos
<!-- Qué roles ven/usan esto. Si es ruta protegida, qué `allowedRoles` en ProtectedRoute. -->

## 4. Contrato de API que consume
<!-- Qué endpoints del backend usa (del api-contract.md), con params y shape esperado.
     Ej: GET /properties/search?currency=USD&price_min=... → data[].price = { amount, currency } -->

## 5. Capa de datos (hooks) y estado
<!-- Qué hook(s) en src/hooks/ se crean/tocan, query keys, y qué estado de cliente (store) hace falta. -->

## 6. UI / UX
<!-- Pantallas/componentes, estados de carga/vacío/error, textos en español. -->

## 7. Casos borde
<!-- Nulos/vacíos, sin resultados, sin permiso, campos privados ausentes (coordinates/cert doc),
     token expirado, doble submit, paginación. -->

## 8. Criterios de aceptación
<!-- Checklist verificable; cada ítem mapea idealmente a un test Vitest.
     1. …
     N. `npm run lint` + `npm run test` en verde. -->

## 9. Fuera de alcance
<!-- Qué NO entra. Evita scope creep. -->
