const KEY = "ic_just_registered";

// Se llama justo antes de navegar a /welcome
export function markJustRegistered() {
  try {
    sessionStorage.setItem(KEY, "1");
  } catch {
    /* sin storage: no se mide, pero no rompe */
  }
}

// Devuelve true UNA sola vez por registro (y borra la marca)
export function consumeJustRegistered() {
  try {
    const ok = sessionStorage.getItem(KEY) === "1";
    sessionStorage.removeItem(KEY);
    return ok;
  } catch {
    return false;
  }
}

export function trackRegistration() {
  try {
    if (typeof window.gtag === "function") {
      window.gtag("event", "conversion", {
        send_to: "AW-18569699611/cRLWCJCkzbYdEJvC3JZF",
        value: 1.0,
        currency: "ARS",
      });
    }
  } catch {
    /* nunca romper la UI por medición */
  }
  try {
    if (typeof window.fbq === "function") {
      window.fbq("track", "CompleteRegistration");
    }
  } catch {
    /* idem */
  }
}
