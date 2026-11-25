# Spec: InfoCasa Guía — directorio comercial (Etapa 1, front)

**Área:** `guide` (nueva) + `dashboard` (panel del anunciante y admin)
**Estado:** ✅ implementada (2026-11-25, pendiente de validar en QA)
**Fuentes relacionadas:** backend spec `guide/directory` · `Backend-Inmobiliaria/.ai/contracts/api-contract.md` → sección "InfoCasa Guía"

---

## 1. Objetivo y valor
Sección nueva **INFOCASA GUÍA**: directorio de profesionales, oficios, comercios y empresas de construcción y
hogar, con buscador, categorías, rubros, fichas y perfiles propios. Comparte sesión, diseño y componentes con
el sitio, pero **no se mezcla con las propiedades** (rutas `/guia/*`, hooks y endpoints `guide/*` propios).

## 2. Reglas y comportamiento
1. Entrada **"InfoCasa Guía"** en el nav del header (desktop y mobile) y en el footer.
2. `/guia`: buscador (texto + localidad), las 4 categorías con sus rubros y conteos (`GET guide/categories`), CTA "Publicá gratis en la Guía".
3. `/guia/buscar`: resultados paginados con filtros por **query params** (`q`, `category`, `trade`, `province`, `city`, `works_in`, `neighborhood`, `home_service`, `has_store`, `page`). El orden lo da el backend (no se reordena: en Etapa 2 vendrán los destacados primero). "Cerca mío" usa la geolocalización del navegador (`lat`/`lng`/`radius_km`).
4. `/guia/publicacion/:slug`: ficha con galería, descripción, rubro, cobertura, horarios, video (YouTube/Vimeo embebido), botones de contacto y formulario de **consulta** / **pedir presupuesto** (`type=budget`). Registra una visita (`POST .../view`) una vez por sesión del navegador.
5. `/guia/:slug`: perfil público del anunciante con todas sus publicaciones visibles.
6. Contacto: WhatsApp reusa `WhatsAppButton` (variante en línea) y el evento **`ic_whatsapp`** con `section: "guia"` + `guide_listing_id`/`guide_advertiser_id`. También llamar, email, web, redes y **compartir** (Web Share API o copia del link `share_url` del back, que tiene OG).
7. Títulos/meta por página (`useDocumentMeta`: `document.title` + `meta[name=description]`).
8. **Panel del anunciante** = pestaña "InfoCasa Guía" del dashboard (todos los roles; `?tab=guia` la abre). Sin perfil muestra el alta (con aceptación de términos). Con perfil, sub-pestañas: **Mi perfil** · **Mis publicaciones** (estado, motivo de rechazo, pausar/activar, duplicar, editar, eliminar) · **Consultas recibidas** (marcar leída) · **Visitas** (contador por publicación). "Mi suscripción" y "Estadísticas" no se muestran (Etapa 2).
9. Alta/edición de publicación en `/dashboard/guia/publicaciones/nueva` y `/dashboard/guia/publicaciones/:id/editar`: rubro (deriva la categoría), título, descripción, fotos (subir/ordenar/borrar), video, contacto (vacío = hereda del perfil), ubicación, cobertura (provincia entera o lista de localidades), atención a domicilio / local / solo en local, horarios por día. **Vista previa** de la ficha antes de enviar. "Guardar borrador" o "Enviar a revisión".
10. **Admin** (pestaña "InfoCasa Guía" del dashboard admin): publicaciones con filtro de estado y aprobar / rechazar (con motivo) / suspender / eliminar; anunciantes con suspender/reactivar; ABM de categorías y rubros (crear, renombrar, activar/desactivar).
11. Visitante sin cuenta que toca "Publicá en la Guía" → registro actual y al terminar vuelve al panel de la Guía (`state.next`).
12. Datos solo vía hooks (`src/hooks/useGuide*.js`) → `src/api/guide.js` → `api.js`.

## 3. Actores y accesos
| Ruta | Acceso |
| :--- | :--- |
| `/guia`, `/guia/buscar`, `/guia/:slug`, `/guia/publicacion/:slug` | pública |
| `/dashboard/guia/publicaciones/nueva`, `/dashboard/guia/publicaciones/:id/editar` | `auth` (owner/agent/admin/buyer) |
| pestaña "InfoCasa Guía" del dashboard | `auth`; admin ve la administración |

## 4. Contrato de API que consume
Todo el bloque `guide/*` del contrato del backend (públicas, `guide/me/*`, `guide/admin/*`). Shapes `GuideListing`,
`GuideAdvertiser`, `GuideInquiry` mapeados a camelCase en `hooks/guide.mappers.js`.

## 5. Casos borde
- Ficha/perfil no visible → `404` → estado "No encontramos esta publicación".
- Sin perfil: `GET guide/me/advertiser` → `data: null` → formulario de alta (no error).
- Errores `422` se muestran por campo (mensajes del backend en español).
- Fotos: máx. 10; las nuevas se suben después de guardar (la publicación necesita id).
- Búsqueda sin resultados → empty state con link a limpiar filtros.
- Geolocalización denegada → aviso, sin romper la búsqueda.

## 6. UX y mensajes
Textos en español rioplatense, mismo diseño (Tailwind, `Loader`, `Pagination`, toasts). Responsive: grilla 1/2/3 columnas.

## 7. Criterios de aceptación (tests)
1. Mappers y armado de query/payload (`hooks/guideMappers`, `hooks/guideQuery`).
2. Hooks de datos (`hooks/useGuide`): endpoints correctos e invalidaciones.
3. `ic_whatsapp` con sección guía (`helpers/tracking`).
4. Componentes clave: `GuideListingCard`, `GuideContactButtons`, `GuideInquiryForm`, `GuideStatusBadge`.
5. lint, test, build y knip en verde.

## 8. Fuera de alcance
Etapa 2 (suscripciones, pagos, destacados, estadísticas) y Etapa 3 (mapa, favoritos, calificaciones, denuncias, notificaciones).
