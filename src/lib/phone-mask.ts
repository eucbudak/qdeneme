/**
 * TR cep telefonu maskesi: rakamları "0 (5XX) XXX XX XX" formatına çevirir.
 * Boşluk/parantez/sembolleri yutar, başına 0 gelmemişse otomatik koymaz —
 * kullanıcı "5301234567" yazınca da "0 (530) 123 45 67" olur.
 */
export function maskTrPhone(input: string): string {
  const digits = input.replace(/\D/g, "");
  // 0'la başlamıyorsa ve 10 hane ise başına 0 ekle
  let d = digits;
  if (d.length === 10 && !d.startsWith("0")) {
    d = "0" + d;
  }
  d = d.slice(0, 11);

  if (d.length === 0) return "";
  if (d.length <= 1) return d;
  if (d.length <= 4) return `${d.slice(0, 1)} (${d.slice(1)}`;
  if (d.length <= 7) return `${d.slice(0, 1)} (${d.slice(1, 4)}) ${d.slice(4)}`;
  if (d.length <= 9)
    return `${d.slice(0, 1)} (${d.slice(1, 4)}) ${d.slice(4, 7)} ${d.slice(7)}`;
  return `${d.slice(0, 1)} (${d.slice(1, 4)}) ${d.slice(4, 7)} ${d.slice(7, 9)} ${d.slice(9, 11)}`;
}
