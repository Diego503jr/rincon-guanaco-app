// Utilidades de fechas para el módulo de itinerarios.
// La API envía "YYYY-MM-DD HH:mm:ss" sin zona horaria; se separa a mano
// para que el celular no la convierta a otra hora.

const MONTHS = ["ene", "feb", "mar", "abr", "may", "jun", "jul", "ago", "sep", "oct", "nov", "dic"];

// "2026-12-05 06:30:00" -> { year: 2026, month: 12, day: 5, hour: 6, minute: 30 }
export function parseDateTime(value) {
  if (!value) return null;
  const [date, time = "00:00"] = String(value).split(" ");
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);
  return { year, month, day, hour, minute };
}

// "2026-12-05 06:30:00" -> "5/12/2026"
export function formatDate(value) {
  const d = parseDateTime(value);
  return d ? `${d.day}/${d.month}/${d.year}` : "";
}

// "2026-12-05" -> "5 dic 2026"
export function formatLongDate(value) {
  const d = parseDateTime(value);
  return d ? `${d.day} ${MONTHS[d.month - 1]} ${d.year}` : "";
}

// "2026-12-05 06:30:00" -> "6:30 am"
export function formatTime(value) {
  const d = parseDateTime(value);
  if (!d) return "";
  const suffix = d.hour >= 12 ? "pm" : "am";
  const hour12 = d.hour % 12 || 12;
  return `${hour12}:${String(d.minute).padStart(2, "0")} ${suffix}`;
}

// Rango de un viaje: "5/12/2026 - 6/12/2026" (o una sola fecha si es el mismo día)
export function formatRange(start, end) {
  if (!start) return "Sin actividades programadas";
  const from = formatDate(start);
  const to = formatDate(end);
  return from === to ? from : `${from}  -  ${to}`;
}