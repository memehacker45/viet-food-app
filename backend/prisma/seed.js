// Seed-Daten — aus den Stitch-Screens extrahiert
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const categories = [
  { slug: 'gemuese',   nameDe: 'Gemüse',   nameVi: 'Rau củ',     sortOrder: 1 },
  { slug: 'nudeln',    nameDe: 'Nudeln',   nameVi: 'Mì & Phở',   sortOrder: 2 },
  { slug: 'saucen',    nameDe: 'Saucen',   nameVi: 'Nước chấm',  sortOrder: 3 },
  { slug: 'getraenke', nameDe: 'Getränke', nameVi: 'Đồ uống',    sortOrder: 4 },
];

// categoryId wird nach dem Anlegen der Kategorien gesetzt
const products = [
  {
    slug: 'frische-kraeutermischung', cat: 'gemuese',
    nameDe: 'Frische Kräutermischung', nameVi: 'Rau thơm tổng hợp',
    subtitleDe: 'Frische Kräutermischung (100g)', subtitleVi: 'Rau thơm tổng hợp (100g)',
    descriptionDe: 'Eine handverlesene Mischung aus thailändischem Basilikum, Minze und Koriander – perfekt für Pho und frische Frühlingsrollen.',
    descriptionVi: 'Hỗn hợp húng quế, bạc hà và ngò rí tuyển chọn — hoàn hảo cho phở và gỏi cuốn.',
    origin: 'Vietnam', unit: '100g', price: 2.50, image: 'frische-kraeutermischung.jpg',
    inStock: true, badges: ['bio', 'fresh'],
  },
  {
    slug: 'bio-reisnudeln', cat: 'nudeln',
    nameDe: 'Bio-Reisnudeln', nameVi: 'Bún gạo hữu cơ',
    subtitleDe: 'Bio-Reisnudeln (500g)', subtitleVi: 'Bún gạo hữu cơ (500g)',
    descriptionDe: 'Glutenfreie Reisnudeln aus biologischem Anbau, ideal für Suppen und Pfannengerichte.',
    descriptionVi: 'Bún gạo hữu cơ không gluten, lý tưởng cho món nước và món xào.',
    origin: 'Vietnam', unit: '500g', price: 3.20, image: 'bio-reisnudeln.jpg',
    inStock: true, badges: ['bio'],
  },
  {
    slug: 'premium-fischsauce', cat: 'saucen',
    nameDe: 'Premium-Fischsauce', nameVi: 'Nước mắm thượng hạng',
    subtitleDe: 'Premium-Fischsauce (40°N)', subtitleVi: 'Nước mắm (40 đạm)',
    descriptionDe: 'Traditionell fermentierte Fischsauce mit 40°N Proteingehalt – das Herz der vietnamesischen Küche.',
    descriptionVi: 'Nước mắm lên men truyền thống 40 độ đạm — linh hồn của ẩm thực Việt.',
    origin: 'Phú Quốc', unit: '500ml', price: 6.50, image: 'premium-fischsauce.jpg',
    inStock: true, badges: ['fresh'],
  },
  {
    slug: 'eiskaffee-milch', cat: 'getraenke',
    nameDe: 'Eiskaffee mit Milch', nameVi: 'Cà phê sữa đá',
    subtitleDe: 'Eiskaffee mit Milch in Dosen (6x200ml)', subtitleVi: 'Cà phê sữa lon (6x200ml)',
    descriptionDe: 'Cremiger vietnamesischer Eiskaffee mit gezuckerter Kondensmilch, im praktischen 6er-Pack.',
    descriptionVi: 'Cà phê sữa đá béo ngậy với sữa đặc, lốc 6 lon tiện lợi.',
    origin: 'Vietnam', unit: '6x200ml', price: 8.99, image: 'eiskaffee-milch.jpg',
    inStock: true, badges: [],
  },
  {
    slug: 'bio-thai-basilikum', cat: 'gemuese',
    nameDe: 'Bio-Thai-Basilikum', nameVi: 'Húng quế hữu cơ',
    subtitleDe: 'Húng Quế • 50g Bund • Herkunft: Vietnam', subtitleVi: 'Húng Quế • bó 50g • Việt Nam',
    descriptionDe: 'Unverzichtbar für die authentische vietnamesische Küche. Unser Bio-Thai-Basilikum zeichnet sich durch charakteristische violette Stängel und dunkelgrüne Blätter aus. Es liefert einen robusten, leicht würzigen Geschmack mit deutlichen Noten von Anis und Lakritz, entscheidend für Pho und frische Frühlingsrollen.',
    descriptionVi: 'Không thể thiếu trong ẩm thực Việt đích thực. Húng quế hữu cơ với thân tím đặc trưng và lá xanh đậm, vị nồng nhẹ thoảng hồi và cam thảo, thiết yếu cho phở và gỏi cuốn.',
    origin: 'Vietnam', unit: '50g Bund', price: 2.99, oldPrice: 2.99, image: 'bio-thai-basilikum.jpg',
    inStock: false, badges: ['bio', 'fresh'],
  },
  {
    slug: 'frisches-thai-basilikum', cat: 'gemuese',
    nameDe: 'Frisches Thai-Basilikum', nameVi: 'Húng quế tươi',
    subtitleDe: 'Frisches Thai-Basilikum (100g)', subtitleVi: 'Húng quế tươi (100g)',
    descriptionDe: 'Aromatisches frisches Thai-Basilikum, mit Kühlakkus verpackt für maximale Frische bei der Lieferung.',
    descriptionVi: 'Húng quế tươi thơm, đóng gói kèm đá gel giữ độ tươi khi giao hàng.',
    origin: 'Vietnam', unit: '100g', price: 1.50, image: 'frisches-thai-basilikum.jpg',
    inStock: true, badges: ['fresh'],
  },
  {
    slug: 'premium-pho-nudeln', cat: 'nudeln',
    nameDe: 'Premium Pho-Nudeln', nameVi: 'Bánh phở thượng hạng',
    subtitleDe: 'Premium Pho-Nudeln (400g)', subtitleVi: 'Bánh phở (400g)',
    descriptionDe: 'Breite, flache Reisnudeln speziell für die klassische Pho-Suppe.',
    descriptionVi: 'Bánh phở dẹt bản to, dành riêng cho món phở truyền thống.',
    origin: 'Vietnam', unit: '400g', price: 2.20, image: 'premium-pho-nudeln.jpg',
    inStock: true, badges: [],
  },
  {
    slug: 'sriracha-chili', cat: 'saucen',
    nameDe: 'Sriracha Chili-Sauce', nameVi: 'Tương ớt Sriracha',
    subtitleDe: 'Sriracha Chili-Sauce (250ml)', subtitleVi: 'Tương ớt Sriracha (250ml)',
    descriptionDe: 'Scharfe Chili-Knoblauch-Sauce, perfekt zum Verfeinern jeder Mahlzeit.',
    descriptionVi: 'Tương ớt tỏi cay, hoàn hảo để tăng vị cho mọi món ăn.',
    origin: 'Vietnam', unit: '250ml', price: 3.90, image: 'sriracha-chili.jpg',
    inStock: true, badges: [],
  },
  {
    slug: 'instant-pho-suppe', cat: 'nudeln',
    nameDe: 'Instant Pho-Suppe', nameVi: 'Phở ăn liền',
    subtitleDe: 'Instant Pho-Suppe (75g)', subtitleVi: 'Phở ăn liền (75g)',
    descriptionDe: 'Authentischer Pho-Geschmack in 5 Minuten – ideal für unterwegs.',
    descriptionVi: 'Hương vị phở đích thực trong 5 phút — tiện cho mọi lúc.',
    origin: 'Vietnam', unit: '75g', price: 1.80, image: 'instant-pho-suppe.jpg',
    inStock: true, badges: [],
  },
  {
    slug: 'kokosnusswasser', cat: 'getraenke',
    nameDe: 'Kokosnusswasser', nameVi: 'Nước dừa',
    subtitleDe: 'Kokosnusswasser (330ml)', subtitleVi: 'Nước dừa (330ml)',
    descriptionDe: 'Erfrischendes, natürliches Kokosnusswasser ohne Zuckerzusatz.',
    descriptionVi: 'Nước dừa tự nhiên mát lạnh, không thêm đường.',
    origin: 'Vietnam', unit: '330ml', price: 1.20, image: 'kokosnusswasser.jpg',
    inStock: true, badges: ['fresh'],
  },
  {
    slug: 'frischer-koriander', cat: 'gemuese',
    nameDe: 'Frischer Koriander', nameVi: 'Ngò rí tươi',
    subtitleDe: 'Frischer Koriander (50g)', subtitleVi: 'Ngò rí tươi (50g)',
    descriptionDe: 'Frischer, aromatischer Koriander – unverzichtbar als Garnierung.',
    descriptionVi: 'Ngò rí tươi thơm — không thể thiếu để trang trí món ăn.',
    origin: 'Vietnam', unit: '50g', price: 1.30, image: 'frischer-koriander.jpg',
    inStock: true, badges: ['bio', 'fresh'],
  },
];

async function main() {
  console.log('Seeding…');
  await prisma.supportMessage.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.product.deleteMany();
  await prisma.category.deleteMany();
  await prisma.customer.deleteMany();

  const catMap = {};
  for (const c of categories) {
    const created = await prisma.category.create({ data: c });
    catMap[c.slug] = created.id;
  }

  for (const p of products) {
    const { cat, badges, ...rest } = p;
    await prisma.product.create({
      data: { ...rest, badges: JSON.stringify(badges || []), categoryId: catMap[cat] },
    });
  }

  // Beispiel-Supportkonversation (entspricht dem Chat-Screen)
  const basil = await prisma.product.findUnique({ where: { slug: 'frisches-thai-basilikum' } });
  const sid = 'demo-session';
  await prisma.supportMessage.createMany({
    data: [
      { sessionId: sid, sender: 'agent', body: 'Guten Tag! Willkommen bei Viet Food GmbH. Wie kann ich Ihnen heute helfen?' },
      { sessionId: sid, sender: 'user', body: 'Hallo, ich wollte den Status meiner Bestellung #VF-8492 überprüfen.' },
      { sessionId: sid, sender: 'agent', body: 'Ich habe Ihre Bestellung gefunden. Das Paket befindet sich in der Zustellung und sollte zwischen 14:00 und 16:00 Uhr eintreffen.', productId: basil ? basil.id : null },
    ],
  });

  console.log(`Done: ${categories.length} categories, ${products.length} products.`);
}

main().catch((e) => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
