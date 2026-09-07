import React, { useRef } from "react";
import { Camera, Loader2 } from "lucide-react";

const ROLE_LABELS = { owner: "Dueño", agent: "Agente" };

/** Card lateral: avatar (con upload), nombre, email y rol. */
export default function ProfileAvatarCard({ user, loadingAvatar, onAvatarChange }) {
  const fileInputRef = useRef(null);
  const initials = user?.name ? user.name.substring(0, 2).toUpperCase() : "U";

  return (
    <div className="md:col-span-1">
      <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col items-center text-center">
        <div className="relative mb-6">
          <div className="w-32 h-32 rounded-full overflow-hidden border-4 border-white shadow-xl bg-slate-100 flex items-center justify-center">
            {user?.avatar_url ? (
              <img src={user.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
            ) : (
              <span className="text-4xl font-black text-slate-300 tracking-widest">{initials}</span>
            )}
            {loadingAvatar && (
              <div className="absolute inset-0 bg-white/70 flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
              </div>
            )}
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={loadingAvatar}
            className="absolute bottom-0 right-0 p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-all shadow-lg active:scale-95 disabled:opacity-50"
          >
            <Camera className="w-5 h-5" />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={onAvatarChange}
            accept="image/jpeg,image/png,image/jpg,image/webp"
            className="hidden"
          />
        </div>
        <h3 className="font-bold text-slate-900 text-lg">{user?.name}</h3>
        <p className="text-slate-500 text-sm font-medium">{user?.email}</p>
        <div className="mt-4 px-4 py-1.5 bg-blue-50 text-blue-600 text-xs font-bold uppercase tracking-widest rounded-full">
          {ROLE_LABELS[user?.role] || "Comprador"}
        </div>
      </div>
    </div>
  );
}
