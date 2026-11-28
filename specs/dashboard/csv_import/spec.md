# Spec: Importar propiedades desde CSV (panel)

**Área:** `dashboard`
**Estado:** ✅ implementada (2026-11-28)
**Fuentes relacionadas:** [.ai/product/README.md](../../../.ai/product/README.md) (negocio, backend) · `Backend-Inmobiliaria/.ai/contracts/api-contract.md` → "Importación por CSV" · backend spec `properties/csv_import`

---

## 1. Objetivo y valor

Que un dueño o inmobiliaria cargue muchas propiedades de una vez desde una planilla, sin pasar por el formulario una por una. Pensado para quien migra su cartera desde otro sitio.

## 2. Reglas y comportamiento

- El botón **"Publicar propiedad"** del panel abre un menú con **"Crear publicación"** (el formulario de siempre, `/dashboard/properties/create`) e **"Importar desde CSV"** (abre el modal). Sin plan o sin cupo, el botón queda deshabilitado como antes.
- El menú de usuario suma "Importar desde CSV" → `/dashboard?import=csv`, que abre el modal.
- Las reglas de negocio las aplica el backend (borradores, dedupe por `external_id`, cupo del plan, localidad a nivel ciudad). El front solo las explica en la mini-guía y muestra el resultado.
- Al terminar la importación se refrescan "Mis propiedades" (`me_properties`) y el cupo (`publication_quota`), porque los borradores cuentan para el plan.

## 3. Actores y accesos

Usuarios logueados que no son `buyer` ni `admin` (los mismos que ven "Publicar propiedad"). El backend responde `403` a un buyer igual.

## 4. Contrato de API que consume

- `GET properties/import/template` — link directo de descarga (pública).
- `POST properties/import` — multipart `file` → `202` `{ data: PropertyImport }`; `422` (`errors.file`), `409` (ya hay una en curso), `429` (throttle).
- `GET properties/imports/{id}` — estado + `counts` + `rows`.

## 5. Capa de datos (hooks) y estado

- `src/api/propertyImports.js` (módulo de endpoints) → `src/hooks/usePropertyImport.js`: `useUploadPropertyImport` (mutation; traduce errores con `uploadErrorMessage`) y `usePropertyImportStatus(id)` (query `["property_import", id]` con `refetchInterval` de 3 s mientras `queued|processing`).
- Helpers puros en `src/hooks/propertyImport.helpers.js` (activo, resumen, filas con problemas/avisos, progreso).
- Estado de UI: `showCsvImport` y `csvImportId` en `DashboardPage` (sin store). Cerrar el modal no cancela nada; al reabrirlo se sigue viendo la importación.

## 6. UI / UX

- Menú: accesible por teclado (Enter/Espacio abre, flechas ↑/↓, Escape cierra y devuelve el foco), cierra con click o touch afuera, ancho completo en mobile.
- Modal: X arriba a la derecha, Escape y click en el fondo cierran. Mini-guía: 4 pasos, botón "Descargar plantilla", secciones plegables (columnas obligatorias abierta por defecto, opcionales, reglas del archivo, qué pasa al importar).
- Subida: drop zone + "Elegir archivo" (`.csv`), botón "Importar" deshabilitado sin archivo, error del backend en un aviso rojo.
- Progreso: "Importando… (N de M)" con barra; aviso de que puede tardar por las fotos y que se puede cerrar.
- Resultado: tarjetas (creadas como borrador, ya importadas, con errores, frenadas por límite del plan, avisos de fotos), lista de filas que no se importaron con sus motivos y lista de importadas con avisos; "Importar otro archivo".

## 7. Casos borde

- Encabezados inválidos, archivo vacío o > 500 filas → mensaje del backend (`422`).
- Importación ya en curso → mensaje del backend (`409`).
- Demasiadas subidas → "Hiciste muchas importaciones seguidas…" (`429`).
- Importación `failed` → se muestra el error del backend y el resumen parcial.

## 8. Criterios de aceptación

1. El menú abre, navega con teclado, cierra con Escape/click afuera y "Importar desde CSV" abre el modal (`PublishPropertyMenu.test.jsx`).
2. El modal muestra la guía y el link a la plantilla, y se cierra con la X y con Escape (`CsvImportModal.test.jsx`).
3. Subir un archivo muestra "Importando…", consulta el estado y al terminar muestra el resumen y las filas con errores; refresca `me_properties` y `publication_quota`.
4. Un error del backend se muestra en el modal.
5. `npm run lint`, `npm run test`, `npm run knip`, `npm run map:check` y `npm run build` en verde.

## 9. Fuera de alcance

- Elegir inmobiliaria (`agency_id`) desde el modal: hoy se importa para el usuario.
- Historial de importaciones en el panel (`GET me/property-imports` existe en el backend, no se consume todavía).
- Editar o mapear columnas en el front (el formato es fijo: plantilla v1).
