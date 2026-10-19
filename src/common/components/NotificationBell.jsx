import React, { useState, useRef, useEffect } from "react";
import { Bell, MessageSquare } from "lucide-react";
import { Link } from "react-router-dom";
import { useNotifications, useUnreadCount, useMarkAsRead, useMarkAllAsRead } from "../../features/notifications/hooks/useNotifications";

export default function NotificationBell() {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { data: notifications = [], isLoading } = useNotifications();
  const { data: unreadCount = 0 } = useUnreadCount();
  const { mutate: markAsRead } = useMarkAsRead();
  const { mutate: markAllAsRead } = useMarkAllAsRead();

  useEffect(() => {
    if (!open) return;
    const onClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [open]);

  const handleNotificationClick = (notif) => {
    if (!notif.read_at) {
      markAsRead(notif.id);
    }
    setOpen(false);
  };

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((v) => !v)}
        className="relative p-2 rounded-full hover:bg-black/5 transition-colors"
        aria-label="Notificaciones"
      >
        <Bell className="w-5 h-5 text-slate-700" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center px-1 animate-pulse">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 max-w-[calc(100vw-2rem)] bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden z-50">
          <div className="flex items-center justify-between p-4 bg-slate-50 border-b border-slate-100">
            <h3 className="font-bold text-slate-900">Notificaciones</h3>
            {unreadCount > 0 && (
              <button
                onClick={() => markAllAsRead()}
                className="text-xs font-bold text-blue-600 hover:underline"
              >
                Marcar todas como leídas
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {isLoading ? (
              <p className="p-4 text-sm text-slate-500 text-center">Cargando...</p>
            ) : notifications.length === 0 ? (
              <div className="p-8 text-center">
                <Bell className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No tenés notificaciones</p>
              </div>
            ) : (
              notifications.map((notif) => (
                <Link
                  key={notif.id}
                  to="/dashboard"
                  onClick={() => handleNotificationClick(notif)}
                  className={`block p-4 border-b border-slate-100 hover:bg-slate-50 transition-colors ${
                    !notif.read_at ? "bg-blue-50/50" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="w-9 h-9 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm text-slate-800">
                        {notif.data?.message || "Nueva notificación"}
                      </p>
                      {notif.data?.search_description && (
                        <p className="text-xs text-slate-600 mt-1 truncate">
                          "{notif.data.search_description}"
                        </p>
                      )}
                      <p className="text-[10px] text-slate-400 mt-1">
                        {notif.created_at}
                      </p>
                    </div>
                    {!notif.read_at && (
                      <span className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0 mt-2" />
                    )}
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}