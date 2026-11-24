# Spec: Medición de conversiones (GTM + dataLayer)

**Área:** `auth | property | profile | dashboard` (transversal)
**Estado:** ✅ implementada (2026-11-24, pendiente de validar en QA)
**Fuentes relacionadas:** guía "Infocasa: implementación del tracking" (2026-11-24) · backend spec `monetization/conversion_tracking` · `Backend-Inmobiliaria/.ai/contracts/api-contract.md`

---

## 1. Objetivo y valor
Medir registros, compras de InfoMonedas, planes pagos, consultas y clics a WhatsApp en Google Ads, GA4, Meta y TikTok sin contar nada dos veces, para que las campañas optimicen hacia ventas.

## 2. Reglas y comportamiento
1. **Un solo contenedor**: `index.html` carga **solo** Google Tag Manager `GTM-5W5C5Z79`. No hay `gtag`, `fbq` ni `ttq` en el código: Ads, GA4, Meta Pixel y TikTok se configuran en GTM.
2. La app solo empuja eventos `ic_*` al `dataLayer` vía `src/lib/tracking.js`.
3. Vistas de página: las resuelve GTM (activador de historial para Meta, medición mejorada de GA4). **No** hay tracker de rutas en React.
4. **Registro sin valor**: `ic_sign_up { account_type, method, event_id }`. Se dispara en **todos** los registros exitosos (antes solo los que venían de landing).
5. **Solo pagos de Mercado Pago llevan monto** (ARS real, el `payment.amount` que devuelve verify = `transaction_amount` de MP). `event_id = mp_<payment_id>` (el backend manda el mismo a la Conversions API de Meta). Un pago se mide **una vez por navegador** (`localStorage ic_tracked_pay_<id>`). Nunca se mide un pago sin confirmar (rama de error de verify, pendientes, rechazados).
6. Consulta: `ic_lead` en el `onSuccess` de `POST /leads`. WhatsApp: `ic_whatsapp` al tocar el botón flotante (único WhatsApp del sitio; desde una ficha lleva `property_id`).
7. Al crear una preferencia de pago se mandan las cookies `_fbp`/`_fbc` (si existen) para mejorar la coincidencia en Meta.
8. Medir nunca rompe la UI (try/catch).

| Evento | Cuándo | Parámetros |
| :--- | :--- | :--- |
| `ic_sign_up` | `POST /auth/register` OK | `account_type` (buyer/owner/agent), `method`, `event_id` |
| `ic_purchase` | verify de InfoMonedas aprobado | `transaction_id`, `event_id` (`mp_<id>`), `value`, `currency`, `item_name`, `item_category` |
| `ic_subscribe` | verify de plan con suscripción activa | ídem |
| `ic_lead` | `POST /leads` OK | `property_id`, `method: form`, `event_id` |
| `ic_whatsapp` | clic en el botón de WhatsApp | `property_id?`, `page_path`, `method: whatsapp`, `event_id` |

## 3. Actores y accesos
Todos los visitantes. Sin rutas nuevas.

## 4. Contrato de API que consume
- `GET /infocoins/purchase/verify` y `GET /subscriptions/mercadopago/verify` → `payment: { id, amount, currency, name } | null`.
- `POST /infocoins/purchase/preference` y `POST /subscriptions/mercadopago/preference` → body suma `fbp?`, `fbc?`.

## 5. Capa de datos (hooks) y estado
- `useInfocoinPaymentResult` (useInfocoinPurchase.js): mide al verificar OK. `useInfocoinCheckout` manda cookies de Meta.
- `useMercadoPagoReturn`: mide en `onVerified` (no en `onVerifyError`). `usePlans.payWithMercadoPago` manda cookies de Meta.
- `usePropertyDetail`: `trackLead` en el `onSuccess` del lead.
- Helpers puros en `lib/tracking.js` (`approvedPaymentConversion`, `trackPayment`, …). Sin estado nuevo.

## 6. UI / UX
Sin cambios visibles.

## 7. Casos borde
Storage bloqueado (se mide igual, sin dedup local), recarga de `/payment/success` (no repite), verify sin `payment` (no mide), cookies de Meta ausentes (no se mandan).

## 8. Criterios de aceptación
1. `index.html` sin gtag ni Meta Pixel; con GTM en `<head>` y `<noscript>` en `<body>`.
2. Tests `helpers/tracking`: sign_up sin valor, purchase/subscribe con `mp_<id>`, dedup, lead, whatsapp, `approvedPaymentConversion`.
3. `npm run lint` + `knip` + `map:check` + `test` en verde.

## 9. Fuera de alcance
Configuración del contenedor GTM (la carga el dueño), textos del sitio (mensaje geográfico, contactos), Events API de TikTok/Google por servidor.
