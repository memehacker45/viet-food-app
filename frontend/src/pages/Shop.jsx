import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import logo from '../assets/logo.png';
import TopAppBar from '../components/TopAppBar.jsx';
import BottomNav from '../components/BottomNav.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryChips from '../components/CategoryChips.jsx';
import ProductCard from '../components/ProductCard.jsx';
import { api } from '../api/client.js';

export default function Shop() {
  const { t } = useTranslation();
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [active, setActive] = useState('all');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.getCategories().then(setCategories).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    const handle = setTimeout(() => {
      api
        .getProducts({ category: active === 'all' ? undefined : active, search: search || undefined })
        .then((data) => { setProducts(data); setError(null); })
        .catch((e) => setError(e.message))
        .finally(() => setLoading(false));
    }, 250); // kleines Debounce fuer die Suche
    return () => clearTimeout(handle);
  }, [active, search]);

  return (
    <div className="pb-24 md:pb-0 min-h-screen">
      <TopAppBar />
      <main className="max-w-7xl mx-auto px-container-margin py-stack-lg">
        <SearchBar value={search} onChange={setSearch} />

        {/* Hero / Brand-Promo */}
        <section className="mb-stack-lg rounded-xl overflow-hidden relative shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30 bg-surface-container-lowest flex flex-col md:flex-row items-center gap-gutter p-container-margin">
          <div className="w-full md:w-1/3 flex justify-center py-4">
            <img alt="Viet Food GmbH Logo" className="w-32 h-32 object-contain drop-shadow-md rounded-xl" src={logo} />
          </div>
          <div className="w-full md:w-2/3 text-center md:text-left">
            <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-primary mb-stack-sm">
              {t('shop.heroTitle')}
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-lg">{t('shop.heroText')}</p>
          </div>
        </section>

        <CategoryChips categories={categories} active={active} onSelect={setActive} />

        <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md">{t('shop.popular')}</h2>

        {error && <p className="text-error font-body-md mb-4">{error}</p>}

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-72 rounded-xl bg-surface-container animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <p className="text-on-surface-variant font-body-md py-8 text-center">{t('shop.empty')}</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-gutter">
            {products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
