/** Formatea YYYY-MM-DD a dd/mm/yyyy */
export function formatDateDDMMYYYY(dateStr: string): string {
  if (!dateStr || dateStr.length < 10) return dateStr;
  const [y, m, d] = dateStr.slice(0, 10).split("-");
  return `${d ?? ""}/${m ?? ""}/${y ?? ""}`;
}

/** Formatea YYYY-MM-DD a "Sábado 15 Mar" u otra locale */
export function formatFechaLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  const days = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"];
  const months = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];
  const day = days[d.getDay()];
  const date = d.getDate();
  const month = months[d.getMonth()];
  return `${day} ${date} ${month}`;
}

/** Hoy en YYYY-MM-DD */
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Próximo sábado en YYYY-MM-DD */
export function nextSaturdayISO(): string {
  const d = new Date();
  const day = d.getDay();
  const daysUntilSaturday = day === 6 ? 0 : day < 6 ? 6 - day : 7 - day + 6;
  d.setDate(d.getDate() + daysUntilSaturday);
  return d.toISOString().slice(0, 10);
}
