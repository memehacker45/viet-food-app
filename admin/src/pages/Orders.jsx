import { useEffect, useState } from 'react';
import { api } from '../api.js';

const STATUS = {
  pending:   { label: 'Chờ xử lý',   cls: 'bg-tertiary-container/40 text-on-tertiary-container' },
  paid:      { label: 'Đã xác nhận', cls: 'bg-primary-container/20 text-primary' },
  shipped:   { label: 'Đang giao',   cls: 'bg-secondary-container/25 text-secondary' },
  delivered: { label: 'Đã giao',     cls: 'bg-primary text-on-primary' },
  cancelled: { label: 'Đã hủy',      cls: 'bg-error-container text-on-error-container' },
};

export default function Orders({ onChange }) {
  const [orders, setOrders] = useState([]);
  const [filter, setFilter] = useState('');
  const [open, setOpen] = useState(null);

  const load = () => api.orders(filter).then(setOrders);
  useEffect(() => { load(); }, [filter]);

  const setStatus = async (o, status) => {
    await api.setOrderStatus(o.id, status);
    load(); onChange?.();
  };

  const fmt = (d) => new Date(d).toLocaleString('vi-VN', { hour: '2-digit', minute: '2-digit', day: '2-digit', month: '2-digit', year: 'numeric' });

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Đơn hàng</h1>
        <div className="flex gap-2 flex-wrap">
          {[['', 'Tất cả'], ...Object.entries(STATUS).map(([k, v]) => [k, v.label])].map(([k, label]) => (
            <button key={k} onClick={() => setFilter(k)}
              className={'px-4 py-1.5 rounded-full font-label-lg text-label-lg font-bold transition-colors active:scale-95 ' +
                (filter === k
                  ? 'bg-primary text-on-primary'
                  : 'bg-surface-container-lowest border border-outline-variant/40 text-on-surface-variant hover:text-primary hover:border-primary/40')}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {orders.length === 0 && <p className="font-body-md text-on-surface-variant">Chưa có đơn nào ở mục này.</p>}

      <div className="space-y-2.5">
        {orders.map((o) => {
          const st = STATUS[o.status] || STATUS.pending;
          const expanded = open === o.id;
          return (
            <div key={o.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-sm overflow-hidden">
              <button onClick={() => setOpen(expanded ? null : o.id)}
                className="w-full flex items-center gap-3 md:gap-4 px-4 py-3 text-left hover:bg-surface-container-low/60 transition-colors">
                <span className="font-body-md text-body-md font-bold text-primary shrink-0">{o.orderNumber}</span>
                <span className="font-body-md text-body-md truncate">{o.firstName} {o.lastName}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant hidden md:block">{fmt(o.createdAt)}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant hidden lg:block">{o.items.length} món</span>
                <span className="ml-auto font-body-md text-body-md font-bold shrink-0">€{o.total.toFixed(2)}</span>
                <span className={'shrink-0 font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full ' + st.cls}>{st.label}</span>
                <span className="material-symbols-outlined text-on-surface-variant text-[20px]">{expanded ? 'expand_less' : 'expand_more'}</span>
              </button>

              {expanded && (
                <div className="border-t border-outline-variant/20 px-4 py-4 grid md:grid-cols-2 gap-5 bg-surface-container-low/40">
                  <div>
                    <p className="font-label-lg text-label-lg font-bold text-on-surface-variant uppercase mb-2">Món đã đặt</p>
                    <ul className="space-y-1.5">
                      {o.items.map((it) => (
                        <li key={it.id} className="flex justify-between font-body-md text-body-md">
                          <span>{it.quantity} × {it.nameDe}{it.unit ? ` (${it.unit})` : ''}</span>
                          <span className="font-semibold">€{(it.price * it.quantity).toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 pt-2 border-t border-outline-variant/30 font-body-md text-body-md flex justify-between">
                      <span className="text-on-surface-variant">Ship €{o.shipping.toFixed(2)}</span>
                      <span className="font-bold text-primary">Tổng €{o.total.toFixed(2)}</span>
                    </div>
                  </div>
                  <div>
                    <p className="font-label-lg text-label-lg font-bold text-on-surface-variant uppercase mb-2">Giao hàng</p>
                    <p className="font-body-md text-body-md">{o.firstName} {o.lastName}</p>
                    <p className="font-body-md text-body-md">{o.address}, {o.zip} {o.city}</p>
                    {o.phone && (
                      <p className="font-body-md text-body-md mt-0.5">
                        <a className="text-primary font-bold inline-flex items-center gap-1" href={`tel:${o.phone}`}>
                          <span className="material-symbols-outlined text-[16px] icon-fill">call</span>{o.phone}
                        </a>
                      </p>
                    )}
                    <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">
                      Thanh toán: {o.paymentMethod === 'cod' ? 'Tiền mặt khi giao (Nachnahme)' : o.paymentMethod}
                    </p>

                    <p className="font-label-lg text-label-lg font-bold text-on-surface-variant uppercase mt-4 mb-2">Đổi trạng thái</p>
                    <div className="flex flex-wrap gap-1.5">
                      {Object.entries(STATUS).map(([k, v]) => (
                        <button key={k} onClick={() => setStatus(o, k)} disabled={o.status === k}
                          className={'px-3.5 py-1.5 rounded-full font-label-sm text-label-sm font-bold border transition-colors active:scale-95 ' +
                            (o.status === k
                              ? v.cls + ' border-transparent'
                              : 'bg-surface-container-lowest border-outline-variant/40 text-on-surface-variant hover:border-primary/50 hover:text-primary')}>
                          {v.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
