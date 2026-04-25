// Türkçe tarih/saat formatlama yardımcıları.
// İstanbul saat dilimi varsayılan kabul edilir.

const TZ = "Europe/Istanbul";
const locale = "tr-TR";

export function formatDate(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(d);
}

export function formatDateShort(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function formatTime(value: string | Date): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale, {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

/**
 * Sınav tarihinden (exam_date: "YYYY-MM-DD") 10 gün önce,
 * İstanbul saatiyle 23:59:59 olarak deadline timestamp'i döner.
 */
export function computeDeadline(examDate: string): string {
  // exam_date İstanbul saat diliminde 00:00 kabul edilir
  const istanbulMidnight = new Date(`${examDate}T00:00:00+03:00`);
  istanbulMidnight.setUTCDate(istanbulMidnight.getUTCDate() - 10);
  // Aynı gün 23:59:59 İstanbul = 20:59:59 UTC
  istanbulMidnight.setUTCHours(20, 59, 59, 999);
  return istanbulMidnight.toISOString();
}

/**
 * Deadline geçti mi?
 */
export function isPastDeadline(deadline: string): boolean {
  return new Date(deadline).getTime() < Date.now();
}

/**
 * Deadline'a kalan süre (insan okuyuşu ile).
 */
export function timeUntil(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now();
  if (diff <= 0) return "Süre doldu";
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
  if (days > 0) return `${days} gün ${hours} saat`;
  if (hours > 0) return `${hours} saat`;
  const minutes = Math.floor((diff / (1000 * 60)) % 60);
  return `${minutes} dakika`;
}
