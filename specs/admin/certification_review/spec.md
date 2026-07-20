# Spec: Revisión del documento de certificación (admin)

**Área:** `admin`
**Estado:** 🚧 en implementación
**Fuentes:** `.ai/contracts/api-contract.md` (`certification_document_url` privado) · `PropertyResource.php` · auditoría de gobernanza 2026-07-17

## 1. Problema
El admin puede **aprobar/rechazar** la certificación de un alquiler temporario (`CertificationActions` en `AdminPage`), pero **no puede ver el documento** que subió el dueño: decide a ciegas. El dato ya viaja (`certification_document_url` → `certificationDocumentUrl` en `property.mappers`, expuesto por el backend solo a owner/admin vía `canSeePrivate`), pero ninguna vista lo renderiza.

## 2. Alcance
Agregar una **sección de revisión** del documento antes de moderar. No se toca el backend (ya expone el campo y el endpoint `PATCH /admin/properties/{id}/verify`).

- Botón "Revisar" (reemplaza los dos íconos sueltos) visible cuando `certificationStatus === "pending"`.
- Abre un **modal** que muestra el documento embebido:
  - imagen (`.jpg/.jpeg/.png/.webp/.gif`) → `<img>`;
  - PDF u otro → `<iframe>` con fallback "Abrir en pestaña nueva".
  - sin documento (`null`) → aviso "El dueño no adjuntó documento".
- Dentro del modal: **Aprobar** (publica) y **Rechazar** (vuelve a borrador, notifica), reusando `moderateCertification(id, status)`. El modal se cierra al moderar.

> **Corrección (2026-07-20):** el panel admin **real** es `DashboardPage` (ruta `/admin` → `Navigate` a `/dashboard`). `features/admin/AdminPage.jsx` + `useAdminData.js` eran **código muerto** (nunca renderizados) — ahí vivía la moderación de certificación original, por eso **nunca fue accesible**. Se **eliminó** ese código muerto y la feature se cableó en el flujo del Dashboard.

## 3. Cambios técnicos
- **`src/features/dashboard/certification.helpers.js`** (nuevo): `isImageUrl(url)` (pura).
- **`src/features/dashboard/components/CertificationReviewModal.jsx`** (nuevo): modal de preview + acciones. Recibe `property`, `onModerate`, `onClose`, `disabled`.
- **`src/features/dashboard/components/CertificationCell.jsx`** (nuevo): botón "Revisar" + estado local de apertura + monta el modal.
- **`src/features/dashboard/components/CertificationsTab.jsx`** (nuevo): tab admin con la cola de pendientes (estilo dashboard).
- **`src/hooks/useDashboardQueries.js`**: deriva `pendingCertifications` de `adminProperties` (ya mapeadas con `mapProperty`).
- **`src/hooks/useDashboardMutations.js`**: `moderateCertification(id, status)` (`PATCH /admin/properties/{id}/verify`) + `isModerating`.
- **`src/features/dashboard/components/DashboardTabs.jsx`**: pestaña "Certificaciones" (admin) con badge del nº de pendientes.
- **`src/features/dashboard/pages/DashboardPage.jsx`**: `case "certifications"` en el switch de tabs.
- **Eliminado (código muerto):** `src/features/admin/**` (AdminPage) y `src/hooks/useAdminData.js`; import lazy de `AdminPage` retirado de `AppRouter`.

## 4. Invariantes (sin regresión)
- La moderación sigue usando el mismo endpoint/mutación (`PATCH /admin/properties/{id}/verify`, invalida `admin_properties`/`properties`).
- El botón solo aparece para certificaciones `pending`; el resto de la tabla queda igual.
- No se expone el documento a roles sin permiso (el backend ya lo filtra; el front solo muestra lo que recibe).

## 5. Criterios de aceptación
1. Con una propiedad `temporary_rent` en `pending`, el admin abre el modal y ve el documento (imagen embebida o PDF en iframe; fallback a link).
2. Aprobar/Rechazar desde el modal modera y cierra; la tabla se refresca.
3. `npm run lint` verde; `AdminPage` bajo el límite de página. `vite build` compila.

## 6. Fuera de alcance
- Historial de moderaciones / motivo de rechazo con texto libre (hoy el rechazo no manda motivo).
- Zoom/rotación del documento.
