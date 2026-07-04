// Lokalisierten Feldwert eines Produkts holen, z.B. loc(p, 'name', 'de') -> p.nameDe
export function loc(obj, base, lang) {
  const suffix = lang === 'vi' ? 'Vi' : lang === 'en' ? 'En' : 'De';
  return obj?.[base + suffix] ?? obj?.[base + 'De'] ?? '';
}

export function euro(n) {
  return '€' + Number(n).toFixed(2);
}
