// Contenido de la mini-guía del modal "Importar desde CSV" (datos estáticos, sin lógica).
// Coincide con el formato v1 del backend (spec `properties/csv_import`).

export const GUIDE_STEPS = [
  { title: "Descargá la plantilla", text: "Tiene todas las columnas y una fila de ejemplo." },
  { title: "Completala", text: "En Excel o Google Sheets: una fila por propiedad. Podés borrar la fila de ejemplo." },
  { title: "Guardala como CSV UTF-8", text: "Excel: Guardar como → \"CSV UTF-8 (delimitado por comas)\". Sheets: Archivo → Descargar → CSV." },
  { title: "Subila acá", text: "Te mostramos el avance y qué filas tuvieron problemas." },
];

export const REQUIRED_COLUMNS = [
  { name: "external_id", hint: "Tu código de la propiedad (único). Sirve para no duplicar." },
  { name: "title", hint: "Título del aviso (máx. 255)." },
  { name: "operation", hint: "sale · rent · temporary_rent · development" },
  { name: "property_type", hint: "casa · departamento · ph · local-comercial · oficina · terreno · cochera · galpon" },
  { name: "price_amount", hint: "Número sin puntos de miles (ej. 125000)." },
  { name: "price_currency", hint: "ARS · USD" },
  { name: "province", hint: "Ej. Tucumán" },
  { name: "city", hint: "Ej. Yerba Buena" },
];

export const OPTIONAL_COLUMNS = [
  { name: "description", hint: "Texto libre." },
  { name: "price_on_request", hint: "1 si el precio es \"a consultar\" (queda en 0)." },
  { name: "department · neighborhood · address", hint: "Departamento, barrio y dirección." },
  { name: "zone", hint: "zona-norte · zona-sur · zona-oeste · zona-este · centro" },
  { name: "latitude · longitude", hint: "Coordenadas con punto decimal." },
  { name: "show_exact_address", hint: "1 / 0" },
  { name: "bedrooms · bathrooms · rooms", hint: "Dormitorios, baños y ambientes." },
  { name: "area_total · area_covered", hint: "m² totales y cubiertos." },
  { name: "parking_spaces · construction_year", hint: "Cocheras y año de construcción." },
  { name: "condition", hint: "new · under_construction · good · to_refurbish" },
  { name: "disposition · orientation", hint: "front · back · lateral · internal / north · south · east · west" },
  { name: "expenses_amount · expenses_currency", hint: "Expensas y su moneda (ARS · USD)." },
  { name: "pets_allowed · professional_use", hint: "1 / 0" },
  { name: "has_grill · has_quincho · has_swimming_pool · has_garden", hint: "1 / 0" },
  { name: "features", hint: "pileta | balcon | terraza | apto_credito | patio | parrilla | seguridad | gimnasio | sum | calefaccion | aire_acondicionado" },
  { name: "photos", hint: "Links públicos separados por |, en orden. La primera es la portada." },
  { name: "floor_plan_url", hint: "Link de la imagen del plano." },
  { name: "source_url · video_urls · notes", hint: "No se importan: quedan en el reporte." },
];

export const FORMAT_RULES = [
  "Separador: coma. Si un texto tiene comas, va entre comillas dobles.",
  "Decimales con punto (98.5) y sin separador de miles.",
  "Varios valores en una celda: separados por | (ej. pileta|parrilla).",
  "Fotos: links públicos (http/https), en orden; la primera es la portada.",
  "Sí / No: 1 o 0. Celda vacía = no informado.",
  "Hasta 500 propiedades y 2 MB por archivo.",
];

export const WHAT_HAPPENS = [
  "Se cargan como borradores: las revisás y publicás cuando quieras.",
  "Si repetís un external_id, esa fila no se duplica.",
  "Cuentan para el límite de propiedades de tu plan.",
  "Si la localidad no existe, se crea a nivel ciudad (el barrio queda en la dirección).",
];
