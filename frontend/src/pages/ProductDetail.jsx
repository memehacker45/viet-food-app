import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { api, imageUrl } from '../api/client.js';
import { useCart } from '../context/CartContext.jsx';
import { loc, euro } from '../lib.js';
import QuantitySelector from '../components/QuantitySelector.jsx';

const BADGE_ICON = { bio: 'eco', fresh: 'local_shipping' };

export default function ProductDetail() {
  const { key } = useParams();
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { add, qtyOf, setQty } = useCart();
  const [p, setP] = useState(null);
  const [error, setError] = useState(null);
  const lang = i18n.language;

  useEffect(() => {
    api.getProduct(key).then(setP).catch((e) => setError(e.message));
  }, [key]);

  if (error) return <div className="p-container-margin text-error">{error}</div>;
  if (!p) return <div className="p-container-margin animate-pulse text-on-surface-variant">…</div>;

  const qty = qtyOf(p.id);
  const badges = p.badges || [];

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col pb-[80px]">
      {/* Top-Navigation */}
      <header className="fixed top-0 left-0 right-0 z-40 bg-surface/80 backdrop-blur-md px-container-margin pt-safe pb-base flex justify-between items-center">
        <button
          aria-label={t('product.back')}
          onClick={() => navigate(-1)}
          className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors"
        >
          <span className="material-symbols-outlined">arrow_back</span>
        </button>
        <div className="flex gap-2">
          <button aria-label={t('product.favorite')} className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">favorite</span>
          </button>
          <button aria-label={t('product.share')} className="w-11 h-11 flex items-center justify-center rounded-full bg-surface-container-high text-on-surface hover:bg-surface-variant transition-colors">
            <span className="material-symbols-outlined">share</span>
          </button>
        </div>
      </header>

      <main className="flex-grow flex flex-col pt-0">
        {/* Hero-Bild */}
        <div className="relative w-full aspect-square bg-surface-container-low overflow-hidden">
          <img
            alt={loc(p, 'name', lang)}
            className={'w-full h-full object-cover ' + (!p.inStock ? 'grayscale-[20%] opacity-80 mix-blend-multiply' : '')}
            src={imageUrl(p)}
          />
          {!p.inStock && (
            <div className="absolute inset-0 flex items-center justify-center bg-surface/30 backdrop-blur-sm pointer-events-none">
              <div className="bg-error text-on-error px-6 py-3 rounded-full font-headline-md text-headline-md uppercase tracking-wider -rotate-12 shadow-lg border-2 border-surface">
                {t('product.soldOut')}
              </div>
            </div>
          )}
        </div>

        {/* Details */}
        <div className="px-container-margin py-stack-lg flex flex-col gap-stack-lg bg-surface relative -mt-6 rounded-t-[24px] z-10">
          <div className="flex flex-col gap-stack-sm">
            <div className="flex justify-between items-start gap-3">
              <h1 className="font-headline-xl-mobile text-headline-xl-mobile text-on-surface">{loc(p, 'name', lang)}</h1>
              <span className={'font-headline-md text-headline-md ' + (p.oldPrice && !p.inStock ? 'text-on-surface-variant line-through opacity-70' : 'text-secondary-container')}>
                {euro(p.inStock ? p.price : (p.oldPrice || p.price))}
              </span>
            </div>
            <p className="font-body-md text-body-md text-on-surface-variant">{loc(p, 'subtitle', lang)}</p>
          </div>

          {/* Benachrichtigen-Banner nur bei Ausverkauft */}
          {!p.inStock && (
            <div className="bg-surface-container-high rounded-xl p-4 border border-outline-variant/50 flex items-center gap-4">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined icon-fill">notifications_active</span>
              </div>
              <div className="flex-grow">
                <h3 className="font-label-lg text-label-lg text-on-surface">{t('product.notifyTitle')}</h3>
                <p className="font-body-md text-body-md text-on-surface-variant text-sm mt-1">{t('product.notifyText')}</p>
              </div>
              <button className="text-primary font-label-lg text-label-lg px-3 py-2 rounded-lg hover:bg-primary-container/20 transition-colors">
                {t('product.notifyAction')}
              </button>
            </div>
          )}

          {/* Beschreibung */}
          <section className="flex flex-col gap-stack-sm border-t border-outline-variant/30 pt-stack-lg">
            <h2 className="font-headline-md text-headline-md text-on-surface">{t('product.info')}</h2>
            <p className="font-body-lg text-body-lg text-on-surface-variant leading-relaxed">{loc(p, 'description', lang)}</p>
          </section>

          {/* Eigenschaften */}
          {badges.length > 0 && (
            <div className="grid grid-cols-2 gap-gutter mt-2">
              {badges.map((b) => (
                <div key={b} className="bg-surface-container-low p-4 rounded-xl flex flex-col gap-2 items-center text-center">
                  <span className="material-symbols-outlined text-outline">{BADGE_ICON[b] || 'check'}</span>
                  <span className="font-label-lg text-label-lg text-on-surface">{t(`product.badges.${b}`)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {/* Untere Aktionsleiste */}
      <div className="fixed bottom-0 left-0 right-0 p-container-margin bg-surface/95 backdrop-blur-lg border-t border-outline-variant/20 z-50">
        {!p.inStock ? (
          <button disabled className="w-full h-14 rounded-xl bg-surface-variant text-on-surface-variant font-headline-md text-headline-md flex items-center justify-center cursor-not-allowed opacity-60">
            {t('product.soldOut')}
          </button>
        ) : qty > 0 ? (
          <div className="w-full h-14 rounded-xl bg-primary text-on-primary flex items-center justify-between px-4">
            <span className="font-headline-md text-headline-md">{t('product.inCart')}</span>
            <QuantitySelector qty={qty} size="lg" onDec={() => setQty(p.id, qty - 1)} onInc={() => setQty(p.id, qty + 1)} />
          </div>
        ) : (
          <button
            onClick={() => add(p, 1)}
            className="w-full h-14 rounded-xl bg-secondary-container text-on-secondary font-headline-md text-headline-md flex items-center justify-center gap-2 hover:opacity-90 active:scale-[0.99] transition"
          >
            <span className="material-symbols-outlined">add_shopping_cart</span>
            {t('product.addToCart')} · {euro(p.price)}
          </button>
        )}
      </div>
    </div>
  );
}
