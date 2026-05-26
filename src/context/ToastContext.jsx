import React, { createContext, useState, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, AlertCircle, X, Info } from "lucide-react";

export const ToastContext = createContext(null);

export const ToastProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = "info") => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      removeToast(id);
    }, 4000);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const value = {
    toast: {
      success: (msg) => addToast(msg, "success"),
      error: (msg) => addToast(msg, "error"),
      info: (msg) => addToast(msg, "info"),
    }
  };

  const getToastIcon = (type) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-500" />;
      default:
        return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  const getToastClass = (type) => {
    switch (type) {
      case "success":
        return "bg-emerald-50 border-emerald-200 text-emerald-950";
      case "error":
        return "bg-rose-50 border-rose-200 text-rose-950";
      default:
        return "bg-blue-50 border-blue-200 text-blue-950";
    }
  };

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-5 right-5 z-[9999] flex flex-col gap-3 pointer-events-none max-w-sm w-full px-4 sm:px-0">
        <AnimatePresence>
          {toasts.map((t) => (
            <motion.div
              key={t.id}
              initial={{ opacity: 0, y: 50, scale: 0.9 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              className={`pointer-events-auto flex items-start gap-3 p-4 rounded-2xl border shadow-lg backdrop-blur-md ${getToastClass(t.type)}`}
            >
              <div className="flex-shrink-0 mt-0.5">{getToastIcon(t.type)}</div>
              <div className="flex-grow text-xs font-semibold leading-relaxed">{t.message}</div>
              <button 
                onClick={() => removeToast(t.id)} 
                className="flex-shrink-0 text-slate-400 hover:text-slate-600 transition-colors p-0.5"
              >
                <X className="w-4 h-4" />
              </button>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </ToastContext.Provider>
  );
};
