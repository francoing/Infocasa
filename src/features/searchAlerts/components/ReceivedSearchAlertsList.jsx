import React from 'react';
import { useReceivedSearchAlerts } from '../hooks/useSearchAlerts';
import { Link } from 'react-router-dom';
import { Mail, MessageCircle } from 'lucide-react';
import { useAuthStore } from '../../../store/useAuthStore';

export default function ReceivedSearchAlertsList() {
  const { data: alerts, isLoading } = useReceivedSearchAlerts();
  const user = useAuthStore((state) => state.user);

  if (isLoading) return <p className="text-sm text-slate-500 py-4">Cargando clientes interesados...</p>;

  const alertsArray = Array.isArray(alerts) ? alerts : (alerts?.data ?? []);

  if (alertsArray.length === 0) {
    return <p className="text-sm text-slate-500 py-8 text-center bg-slate-50 rounded-xl border border-dashed border-slate-300">No tenés clientes interesados por ahora. ¡Seguí publicando!</p>;
  }

  // ─── Datos del publicador (inmobiliaria/dueño) ───────────────────
  const inmoName = user?.name || 'una inmobiliaria';
  const inmoEmail = user?.email || '';
  const inmoPhone = user?.phone_area && user?.phone_number
    ? `${user.phone_area} ${user.phone_number}`
    : null;
  const inmoAvatar = user?.avatar_url || null;

  // Link público de la propiedad (asumiendo el mismo dominio del front)
  const propertyUrl = (propertyId) => `${window.location.origin}/property/${propertyId}`;

  // ─── WhatsApp ────────────────────────────────────────────────────
  const buildWhatsAppLink = (alert) => {
    const phone = alert.buyer_phone ? alert.buyer_phone.replace(/\D/g, '') : null;
    if (!phone) return null;

    let cleanPhone = phone;
    if (cleanPhone.startsWith('0')) cleanPhone = cleanPhone.substring(1);
    if (!cleanPhone.startsWith('549') && !cleanPhone.startsWith('54')) {
      cleanPhone = '549' + cleanPhone;
    }

    const operationLabel = alert.alert_operation === 'rent' ? 'alquilar' : 'comprar';

    const message = [
      `¡Hola ${alert.buyer_name || ''}! 👋`,
      ``,
      `Vi tu búsqueda en InfoCasa para ${operationLabel} y creo que tengo la propiedad que estás buscando. 🏡`,
      ``,
      `🔑 *${alert.property_title}*`,
      ``,
      alert.alert_description ? `📝 Vos buscabas: "${alert.alert_description}"` : null,
      ``,
      `Soy ${inmoName} y me encantaría mostrártela.`,
      `👉 Mirá las fotos acá: ${propertyUrl(alert.property_id)}`,
      ``,
      `¿Coordinamos una visita esta semana? Respondeme este mensaje y te paso todos los detalles.`,
      ``,
      `¡Espero tu respuesta! 🤝`,
    ].filter(Boolean).join('\n');

    return `https://wa.me/${cleanPhone}?text=${encodeURIComponent(message)}`;
  };

  // ─── Email (Gmail directo) ───────────────────────────────────────
  const buildEmailBody = (alert) => {
    const operationLabel = alert.alert_operation === 'rent' ? 'alquilar' : 'comprar';

    const lines = [
      `Hola ${alert.buyer_name || ''},`,
      ``,
      `Mi nombre es ${inmoName} y te escribo desde InfoCasa porque vi tu aviso de búsqueda para ${operationLabel}.`,
      ``,
      `🎯 Creo que tengo la propiedad ideal para vos:`,
      `"${alert.property_title}"`,
      ``,
      alert.alert_description ? `📝 Vi que estabas buscando: "${alert.alert_description}"` : null,
      ``,
      `👉 Podés ver las fotos y todos los detalles acá:`,
      `${propertyUrl(alert.property_id)}`,
      ``,
      `¿Qué te parece si coordinamos una visita esta semana? Respondeme este mail o escribime por WhatsApp y lo vemos.`,
      ``,
      `¡Saludos!`,
      ``,
      `──────────────`,
      `${inmoName}`,
      inmoPhone ? `📱 ${inmoPhone}` : null,
      inmoEmail ? `✉️ ${inmoEmail}` : null,
      `🌐 InfoCasa`,
    ].filter(Boolean).join('\n');

    return lines;
  };

  const buildGmailLink = (alert) => {
    if (!alert.buyer_email) return null;

    const subject = `🏡 ${inmoName} tiene una propiedad que estás buscando`;
    const body = buildEmailBody(alert);

    const params = new URLSearchParams({
      view: 'cm',
      fs: '1',
      to: alert.buyer_email,
      su: subject,
      body: body,
    });

    return `https://mail.google.com/mail/?${params.toString()}`;
  };

  return (
    <div className="space-y-4">
      {alertsArray.map((alert) => {
        const whatsappLink = buildWhatsAppLink(alert);
        const gmailLink = buildGmailLink(alert);

        return (
          <div key={alert.id} className="p-5 bg-white border border-slate-200 rounded-xl shadow-sm">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold bg-amber-100 text-amber-700 px-2 py-1 rounded-full uppercase">
                Cliente busca: {alert.alert_operation === 'rent' ? 'Alquiler' : 'Venta'}
              </span>
              <span className="text-xs text-slate-400">{alert.created_at}</span>
            </div>

            {alert.buyer_name && (
              <p className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-1">
                Cliente: {alert.buyer_name}
              </p>
            )}

            <p className="text-sm text-slate-700 font-medium mb-3">
              {alert.alert_description || 'Sin detalles adicionales'}
            </p>

            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg mb-3">
              Coincide con tu propiedad:{' '}
              <Link to={`/property/${alert.property_id}`} className="text-blue-600 font-bold hover:underline">
                {alert.property_title}
              </Link>
            </div>

            <div className="flex gap-2 pt-3 border-t border-slate-100">
              {whatsappLink && (
                <a
                  href={whatsappLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-emerald-500 text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-emerald-600 transition"
                >
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
              {gmailLink && (
                <a
                  href={gmailLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-2 bg-blue-600 text-white px-3 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition"
                >
                  <Mail className="w-4 h-4" /> Email
                </a>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
