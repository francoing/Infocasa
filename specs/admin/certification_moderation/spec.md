# Spec: Moderación de certificación (admin)

**Área:** `admin`
**Estado:** ✅ implementada
**Fuentes:** [.ai/product/README.md](../../../.ai/product/README.md) · `Backend-Inmobiliaria/.ai/contracts/api-contract.md` (§Admin) + business-rules "Certificación"

## 1. Objetivo
El backend permite a un admin aprobar/rechazar propiedades de alquiler temporario (`temporary_rent`) que requieren certificación, pero el front solo las **lista** (`GET /admin/properties`) y nunca llama a `PATCH /admin/properties/{id}/verify`. Un admin no puede moderar desde el front. Esto lo cierra.

## 2. Reglas (del backend)
- Endpoint: `PATCH /admin/properties/{id}/verify`, body `{ status: "approved" | "rejected" }`, solo admin.
- **Aprobar** → `certification_status=approved`, `is_certified=true`, `status=published`.
- **Rechazar** → `certification_status=rejected`, `is_certified=false`, `status=draft`, y el backend **mail al dueño** (`PropertyRejectedMail`).
- Solo aplica a las que están **pendientes**: `certification_status === 'pending'` (temporarias en `status=pending_approval`).

## 3. Capa de datos
`useAdminData`: nueva `moderateCertificationMutation` → `api.patch('/admin/properties/{id}/verify', { status })`; en éxito invalida `["admin_properties"]` + `["properties"]` y toast. Exponer `moderateCertification(id, status)`.

## 4. UI
En la tabla/lista de propiedades del `AdminPage`, para las que tienen `certificationStatus === 'pending'`: mostrar botones **Aprobar** / **Rechazar** (con confirmación en rechazo). Feedback por toast. Las ya moderadas muestran su estado (`approved`/`rejected`), sin botones.

## 5. Casos borde
- Doble click / mutación en curso → deshabilitar botones mientras `isPending`.
- No-pendiente → sin botones.
- Error backend → toast de error, no cambia UI.

## 6. Criterios de aceptación
1. `moderateCertification` pega al endpoint correcto con `{ status }`.
2. Botones visibles solo para pendientes; aprobar publica, rechazar manda a draft (se refleja al invalidar).
3. `npm run lint` verde, nada nuevo a `LEGACY`.

## 7. Fuera de alcance
- Vista previa del documento de certificación (ya llega `certificationDocumentUrl`; enlace simple opcional).
