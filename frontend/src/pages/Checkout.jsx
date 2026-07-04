import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import TopAppBar from '../components/TopAppBar.jsx';
import { rememberOrder } from './TrackOrder.jsx';
import BottomNav from '../components/BottomNav.jsx';
import { useCart } from '../context/CartContext.jsx';
import { api, imageUrl } from '../api/client.js';
import { loc, euro } from '../lib.js';

const SHIPPING = 4.9;
const FIELDS = ['firstName', 'lastName', 'address', 'city', 'zip', 'phone'];

export default function Checkout() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { items, subtotal, setQty, clear } = useCart();
  const [form, setForm] = useState(Object.fromEntries(FIELDS.map((f) => [f, ''])));
  const [payment, setPayment] = useState('cod');
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState(null);
  const [error, setError] = useState(null);

  const total = +(subtotal + (items.length ? SHIPPING : 0)).toFixed(2);
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));
  const lang = i18n.language;

  const placeOrder = async () => {
    setSubmitting(true);
    setError(null);
    try {
      const res = await api.checkout({
        customer: form,
        paymentMethod: payment,
        items: items.map((i) => ({ productId: i.id, quantity: i.quantity })),
      });
      rememberOrder(res.orderNumber);
      setOrder(res);
      clear();
    } catch (e) {
      setError(e.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (order) {
    return (
      <div className="bg-surface min-h-screen pb-24 md:pb-0">
        <TopAppBar rightLabel={t('checkout.title')} />
        <main className="max-w-3xl mx-auto px-container-margin py-stack-lg">
          <div className="bg-surface-container-lowest rounded-xl p-8 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-outline-variant/30">
            <div className="w-16 h-16 rounded-full bg-primary-container/20 text-primary flex items-center justify-center mx-auto mb-4">
              <span className="material-symbols-outlined text-[36px] icon-fill">check_circle</span>
            </div>
            <h1 className="font-headline-lg text-headline-lg text-primary mb-2">{t('checkout.successTitle')}</h1>
            <p className="font-body-md text-on-surface-variant">
              {t('checkout.successText')} <span className="font-bold text-on-surface">{order.orderNumber}</span>
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <button onClick={() => navigate('/orders')} className="bg-primary text-on-primary font-body-lg font-bold py-3 px-6 rounded-full hover:bg-primary/90 transition-colors">
                {t('checkout.trackOrder')}
              </button>
              <button onClick={() => navigate('/')} className="border border-primary text-primary font-body-lg font-bold py-3 px-6 rounded-full hover:bg-primary-container/20 transition-colors">
                {t('checkout.backToShop')}
              </button>
            </div>
          </div>
        </main>
        <BottomNav />
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-0">
      <TopAppBar rightLabel={t('checkout.title')} />
      <main className="max-w-3xl mx-auto px-container-margin py-stack-lg space-y-stack-lg">
        <h1 className="font-headline-xl-mobile text-headline-xl-mobile md:font-headline-xl md:text-headline-xl text-primary font-bold">
          {t('checkout.title')}
        </h1>

        {items.length === 0 ? (
          <p className="text-on-surface-variant font-body-md py-8 text-center">{t('checkout.emptyCart')}</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-stack-lg">
            {/* Linke Spalte: Formulare */}
            <div className="space-y-stack-lg">
              <section className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">local_shipping</span>
                  {t('checkout.shipping')}
                </h2>
                <div className="space-y-stack-sm">
                  <div className="grid grid-cols-2 gap-gutter">
                    <Field label={t('checkout.firstName')} value={form.firstName} onChange={set('firstName')} />
                    <Field label={t('checkout.lastName')} value={form.lastName} onChange={set('lastName')} />
                  </div>
                  <Field label={t('checkout.address')} value={form.address} onChange={set('address')} />
                  <div className="grid grid-cols-2 gap-gutter">
                    <Field label={t('checkout.city')} value={form.city} onChange={set('city')} />
                    <Field label={t('checkout.zip')} value={form.zip} onChange={set('zip')} />
                  </div>
                  <Field label={t('checkout.phone')} type="tel" value={form.phone} onChange={set('phone')} />
                </div>
              </section>

              <section className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/30">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md flex items-center gap-2">
                  <span className="material-symbols-outlined text-primary">payment</span>
                  {t('checkout.payment')}
                </h2>
                <div className="space-y-stack-sm">
                  {/* PayPal/Visa tạm ẩn cho bản App Store v1: chưa có cổng thanh toán thật,
                      reviewer test sẽ reject (Guideline 2.1). Tích hợp Stripe/PayPal xong thì mở lại.
                  <PayOption value="paypal" current={payment} onSelect={setPayment} label={t('checkout.paypal')} icon="account_balance_wallet" />
                  <PayOption value="visa" current={payment} onSelect={setPayment} label={t('checkout.card')} icon="credit_card" /> */}
                  <PayOption value="cod" current={payment} onSelect={setPayment} label={t('checkout.cod')} hint={t('checkout.codHint')} icon="local_atm" />
                </div>
              </section>
            </div>

            {/* Rechte Spalte: Bestellübersicht */}
            <div>
              <section className="bg-surface-container-lowest p-stack-md rounded-xl shadow-[0_8px_24px_rgba(0,0,0,0.08)] border border-outline-variant/30 md:sticky md:top-24">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-stack-md">{t('checkout.summary')}</h2>
                <div className="space-y-stack-md mb-stack-lg">
                  {items.map((it) => (
                    <div key={it.id} className="flex items-start gap-3">
                      <div className="w-16 h-16 bg-surface-container-high rounded-lg overflow-hidden flex-shrink-0">
                        <img alt={loc(it, 'name', lang)} className="w-full h-full object-cover" src={imageUrl(it)} />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-body-md text-body-md text-on-surface font-semibold">{loc(it, 'name', lang)}</h3>
                        <p className="font-label-lg text-label-lg text-on-surface-variant">{it.unit}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <button onClick={() => setQty(it.id, it.quantity - 1)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
                            <span className="material-symbols-outlined text-[14px]">remove</span>
                          </button>
                          <span className="font-label-lg text-label-lg w-4 text-center">{it.quantity}</span>
                          <button onClick={() => setQty(it.id, it.quantity + 1)} className="w-6 h-6 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
                            <span className="material-symbols-outlined text-[14px]">add</span>
                          </button>
                        </div>
                      </div>
                      <div className="font-body-md text-body-md text-on-surface text-right">
                        <p>{euro(it.price)}</p>
                        <p className="font-label-lg text-label-lg text-on-surface-variant">{t('checkout.qty')}: {it.quantity}</p>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="border-t border-outline-variant/30 pt-stack-md space-y-stack-sm mb-stack-md">
                  <Row label={t('checkout.subtotal')} value={euro(subtotal)} />
                  <Row label={t('checkout.shippingFee')} value={euro(SHIPPING)} />
                </div>
                <div className="flex justify-between items-center font-headline-md text-headline-md text-on-surface mb-stack-lg border-t border-outline-variant/30 pt-stack-sm">
                  <span>{t('checkout.total')}</span>
                  <span className="text-secondary-container">{euro(total)}</span>
                </div>
                {error && <p className="text-error font-body-md mb-3">{error}</p>}
                <button
                  onClick={placeOrder}
                  disabled={submitting}
                  className="w-full bg-primary text-on-primary font-body-lg text-body-lg font-bold py-3 px-6 rounded-full hover:bg-primary/90 transition-colors flex items-center justify-center gap-2 active:scale-95 duration-150 disabled:opacity-60"
                >
                  <span className="material-symbols-outlined">lock</span>
                  {submitting ? '…' : t('checkout.placeOrder')}
                </button>
                <p className="text-center font-label-lg text-label-lg text-on-surface-variant mt-3 flex items-center justify-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">shield</span> {t('checkout.secure')}
                </p>
              </section>
            </div>
          </div>
        )}
      </main>
      <BottomNav />
    </div>
  );
}

function Field({ label, value, onChange, type = 'text' }) {
  return (
    <div>
      <label className="block font-label-lg text-label-lg text-on-surface-variant mb-1">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="w-full bg-surface-container-low border border-outline-variant rounded-lg px-3 py-2 font-body-md text-body-md text-on-surface focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary transition-colors"
      />
    </div>
  );
}

function PayOption({ value, current, onSelect, label, hint, icon }) {
  const active = current === value;
  return (
    <label className={'flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors ' + (active ? 'border-primary/50 bg-primary-container/10' : 'border-outline-variant/50 hover:bg-surface-container-low')}>
      <input type="radio" name="payment" value={value} checked={active} onChange={() => onSelect(value)} className="text-primary focus:ring-primary h-5 w-5 border-outline" />
      <div className="flex-1">
        <span className="block font-body-md text-body-md text-on-surface font-semibold">{label}</span>
        {hint && <span className="block font-label-lg text-label-lg text-on-surface-variant">{hint}</span>}
      </div>
      <span className={'material-symbols-outlined ' + (active ? 'text-primary' : 'text-on-surface-variant')}>{icon}</span>
    </label>
  );
}

function Row({ label, value }) {
  return (
    <div className="flex justify-between font-body-md text-body-md text-on-surface-variant">
      <span>{label}</span>
      <span>{value}</span>
    </div>
  );
}
