// Helpers puros de usePropertyDetail (fuera del hook para acotar su tamaño/complejidad).

export const DEFAULT_LEAD_FORM = {
  name: "",
  email: "",
  phone: "",
  message: "Hola, vi esta propiedad en InfoCasa y me gustaría tener más información.",
};

// Puntúa qué tan parecida es una propiedad a la base (tipo, operación, ubicación, dormitorios).
const scoreRelated = (p, base) => {
  let score = 0;
  if (p.type && base.type && p.type.toLowerCase() === base.type.toLowerCase()) score += 3;
  if (p.status && base.status && p.status.toLowerCase() === base.status.toLowerCase()) score += 2;
  if (p.location && base.location) {
    const pLoc = p.location.toLowerCase();
    const cLoc = base.location.toLowerCase();
    if (pLoc.includes(cLoc) || cLoc.includes(pLoc)) score += 3;
  }
  if (p.bedrooms === base.bedrooms) score += 2;
  else if (Math.abs((p.bedrooms || 0) - (base.bedrooms || 0)) <= 1) score += 1;
  return score;
};

/** Ranking de propiedades relacionadas (mismas características/ubicación), top 3. */
export const rankRelatedProperties = (allProps, base) => {
  if (!base) return [];
  return allProps
    .filter((p) => p.id !== base.id)
    .map((p) => ({ property: p, score: scoreRelated(p, base) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map((item) => item.property);
};

/** Aplica el toggle optimista de favorito en el cache y devuelve el snapshot previo. */
export const optimisticToggleFavorite = (queryClient, id) => {
  const previousProperty = queryClient.getQueryData(["property", id]);
  if (previousProperty) {
    queryClient.setQueryData(["property", id], {
      ...previousProperty,
      isFavorited: !previousProperty.isFavorited,
      favoritesCount: previousProperty.isFavorited
        ? Math.max(0, (previousProperty.favoritesCount || 0) - 1)
        : (previousProperty.favoritesCount || 0) + 1,
    });
  }
  return previousProperty;
};
