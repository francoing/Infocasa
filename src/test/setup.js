import "@testing-library/jest-dom";

// framer-motion usa el animador "accelerated" (Web Animations API) cuando existe
// Element.prototype.animate. happy-dom lo expone, pero su Animation.cancel() rechaza
// la promesa `finished` con AbortError al desmontar el componente, y nadie la captura:
// eso ensucia el run con ~11 unhandled rejections y hace que vitest salga con código 1
// aunque todos los tests pasen (p. ej. LocationGateModal). framer-motion detecta el
// soporte con Object.hasOwnProperty.call(Element.prototype, "animate") y lo memoiza, así
// que al quitarlo aquí (antes de renderizar nada) cae a su animador JS, sin ese reject.
if (typeof Element !== "undefined" && Object.hasOwnProperty.call(Element.prototype, "animate")) {
  delete Element.prototype.animate;
}
