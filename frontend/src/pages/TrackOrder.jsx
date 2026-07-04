import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { api } from '../api/client.js';
import { euro } from '../lib.js';
import TopAppBar from '../components/TopAppBar.jsx';
import BottomNav from '../components/BottomNav.jsx';

const STEPS = ['pending', 'paid', 'shipped', 'delivered'];

// Mã đơn của máy này (lưu sau mỗi lần checkout thành công)
export function rememberOrder(orderNumber) {
  try {
    const list = JSON.parse(localStorage.getItem('vf-orders') || '[]');
    localStorage.setItem('vf-orders', JSON.stringify([orderNumber, ...list.filter((n) => n !== orderNumber)].slice(0, 5)));
  } catch {}
}

export default function TrackOrder() {
  const { t, i18n } = useTranslation();
  const [input, setInput] = useState('');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const recent = (() => { try { return JSON.parse(localStorage.getItem('vf-orders') || '[]'); } catch { return []; } })();

  const lookup = async (num) => {
    let n = (num || input).trim().toUpperCase();
    if (!n) return;
    if (!n.startsWith('VF-')) n = 'VF-' + n.replace(/^VF/, '');
    setLoading(true); setError(''); setOrder(null);
    try {
      setOrder(await api.getOrder(n));
    } catch {
      setError(t('orders.notFound'));
    } finally { setLoading(false); }
  };

  const stepIdx = order ? STEPS.indexOf(order.status) : -1;
  const cancelled = order?.status === 'cancelled';
  const dateFmt = (d) => new Date(d).toLocaleDateString(i18n.language === 'vi' ? 'vi-VN' : i18n.language === 'en' ? 'en-GB' : 'de-DE');

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-28">
      <TopAppBar rightLabel={t('orders.title')} />
      <main className="max-w-3xl mx-auto px-container-margin py-stack-lg">
        <div className="bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30">
          <p className="font-body-md text-on-surface-variant mb-3">{t('orders.hint')}</p>
          <div className="flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && lookup()}
              placeholder={t('orders.placeholder')}
              autoCapitalize="characters" autoCorrect="off"
              className="flex-1 rounded-lg border border-outline bg-surface px-4 py-3 font-body-lg focus:ring-primary focus:border-primary uppercase"
            />
            <button
              onClick={() => lookup()}
              disabled={loading}
              className="bg-primary text-on-primary font-bold px-5 rounded-lg hover:bg-primary/90 disabled:opacity-50 transition-colors"
            >
              {loading ? '…' : t('orders.search')}
            </button>
          </div>
          {error && <p className="mt-3 text-red-600 font-body-md">{error}</p>}
          {!order && recent.length > 0 && (
            <div className="mt-4">
              <p className="font-label-lg text-on-surface-variant mb-2">{t('orders.recent')}</p>
              <div className="flex flex-wrap gap-2">
                {recent.map((n) => (
                  <button key={n} onClick={() => { setInput(n); lookup(n); }}
                    className="px-3 py-1.5 rounded-full bg-primary-container/20 text-primary font-bold text-label-lg hover:bg-primary-container/40 transition-colors">
                    {n}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {order && (
          <div className="mt-4 bg-surface-container-lowest rounded-xl p-5 shadow-sm border border-outline-variant/30">
            <div className="flex justify-between items-baseline flex-wrap gap-2">
              <h2 className="font-headline-md text-headline-md font-bold text-primary">{order.orderNumber}</h2>
              <span className="font-label-lg text-on-surface-variant">{t('orders.placedOn')} {dateFmt(order.createdAt)}</span>
            </div>

            {/* Timeline trạng thái */}
            {cancelled ? (
              <div className="mt-4 rounded-lg bg-red-50 text-red-700 font-bold px-4 py-3">{t('orders.status.cancelled')}</div>
            ) : (
              <div className="mt-5 flex items-center">
                {STEPS.map((s, i) => (
                  <div key={s} className="flex-1 flex flex-col items-center relative">
                    {i > 0 && (
                      <div className={'absolute top-3 right-1/2 w-full h-1 ' + (i <= stepIdx ? 'bg-primary' : 'bg-outline-variant/40')} />
                    )}
                    <div className={'relative z-10 w-6 h-6 rounded-full flex items-center justify-center ' +
                      (i <= stepIdx ? 'bg-primary text-on-primary' : 'bg-outline-variant/40 text-on-surface-variant')}>
                      <span className="material-symbols-outlined text-[14px] icon-fill">
                        {i < stepIdx || stepIdx === STEPS.length - 1 ? 'check' : i === stepIdx ? 'radio_button_checked' : 'circle'}
                      </span>
                    </div>
                    <span className={'mt-1.5 text-[11px] text-center leading-tight ' + (i <= stepIdx ? 'text-primary font-bold' : 'text-on-surface-variant')}>
                      {t('orders.status.' + s)}
                    </span>
                  </div>
                ))}
              </div>
            )}

            {/* Danh sách món */}
            <p className="mt-6 font-label-lg font-bold text-on-surface-variant">{t('orders.items')}</p>
            <ul className="mt-2 divide-y divide-outline-variant/20">
              {order.items.map((it) => (
                <li key={it.id} className="py-2.5 flex justify-between font-body-md">
                  <span>{it.quantity} × {it.nameDe}{it.unit ? ` (${it.unit})` : ''}</span>
                  <span className="font-bold">{euro(it.price * it.quantity)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-2 pt-3 border-t border-outline-variant/30 flex justify-between font-body-lg font-bold">
              <span>{t('checkout.total')}</span><span className="text-primary">{euro(order.total)}</span>
            </div>

            <p className="mt-4 font-label-lg text-on-surface-variant">
              {t('orders.shipTo')}: {order.firstName} {order.lastName}, {order.address}, {order.zip} {order.city}
            </p>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}
