// Lokalisierten Feldwert eines Produkts holen, z.B. loc(p, 'name', 'de') -> p.nameDe
export function loc(obj, base, lang) {
  const key = base + (lang === 'vi' ? 'Vi' : 'De');
  return obj?.[key] ?? obj?.[base + 'De'] ?? '';
}

export function euro(n) {
  return '€' + Number(n).toFixed(2);
}
