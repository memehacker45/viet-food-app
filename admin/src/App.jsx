import { useEffect, useState } from 'react';
import { api, getKey, setKey, logout } from './api.js';
import Products from './pages/Products.jsx';
import Orders from './pages/Orders.jsx';
import Chats from './pages/Chats.jsx';

function Login() {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);
  const submit = async () => {
    if (!pw) return;
    setBusy(true); setErr('');
    try { await api.login(pw); setKey(pw); location.reload(); }
    catch { setErr('Sai mật khẩu, thử lại nhé.'); } finally { setBusy(false); }
  };
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="bg-surface-container-lowest rounded-2xl p-8 w-full max-w-sm border border-outline-variant/30 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
        <img src="/logo.png" alt="Viet Food" className="w-16 h-16 rounded-2xl mb-4 border border-outline-variant/30" />
        <h1 className="font-headline-lg text-headline-lg text-primary">Viet Food Admin</h1>
        <p className="font-body-md text-body-md text-on-surface-variant mt-1 mb-5">Nhập mật khẩu quản trị để tiếp tục.</p>
        <input
          type="password" value={pw} onChange={(e) => setPw(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && submit()}
          placeholder="Mật khẩu" autoFocus
          className="w-full rounded-xl border-outline-variant bg-surface px-4 py-3 font-body-lg focus:border-primary focus:ring-primary"
        />
        {err && <p className="text-error font-label-lg text-label-lg mt-2">{err}</p>}
        <button onClick={submit} disabled={busy || !pw}
          className="mt-5 w-full bg-primary text-on-primary font-body-lg font-bold py-3 rounded-full hover:bg-primary/90 disabled:opacity-50 transition-colors">
          {busy ? 'Đang kiểm tra…' : 'Đăng nhập'}
        </button>
      </div>
    </div>
  );
}

const TABS = [
  { id: 'orders', icon: 'receipt_long', label: 'Đơn hàng' },
  { id: 'products', icon: 'inventory_2', label: 'Món hàng' },
  { id: 'chats', icon: 'chat_bubble', label: 'Tin nhắn' },
];

function NavItem({ t, active, badge, onClick, compact = false }) {
  return (
    <button onClick={onClick}
      className={'flex items-center gap-3 rounded-full transition-all active:scale-95 ' +
        (compact ? 'px-4 py-2 shrink-0 ' : 'w-full px-4 py-2.5 mb-1 ') +
        (active ? 'bg-primary-container/20 text-primary' : 'text-on-surface-variant hover:text-primary hover:bg-surface-container-low')}>
      <span className={'material-symbols-outlined text-[22px] ' + (active ? 'icon-fill' : '')}>{t.icon}</span>
      <span className={'font-label-lg text-label-lg ' + (active ? 'font-bold' : '')}>{t.label}</span>
      {badge > 0 && (
        <span className="ml-auto min-w-[20px] h-5 px-1.5 rounded-full bg-secondary-container text-on-secondary text-[11px] font-bold flex items-center justify-center">
          {badge}
        </span>
      )}
    </button>
  );
}

function StatChip({ icon, label, value, tone = 'primary' }) {
  const tones = {
    primary: 'text-primary bg-primary-container/15',
    warn: 'text-secondary bg-secondary-container/15',
  };
  return (
    <div className="flex items-center gap-3 bg-surface-container-lowest/90 backdrop-blur border border-outline-variant/30 rounded-xl px-4 py-3 shadow-sm">
      <div className={'w-9 h-9 rounded-full flex items-center justify-center ' + tones[tone]}>
        <span className="material-symbols-outlined text-[20px] icon-fill">{icon}</span>
      </div>
      <div>
        <p className="font-headline-md text-headline-md leading-none">{value ?? '–'}</p>
        <p className="font-label-sm text-label-sm text-on-surface-variant mt-1">{label}</p>
      </div>
    </div>
  );
}

export default function App() {
  const [tab, setTab] = useState('orders');
  const [stats, setStats] = useState(null);

  const refreshStats = () => api.stats().then(setStats).catch(() => {});
  useEffect(() => {
    if (!getKey()) return;
    refreshStats();
    const t = setInterval(refreshStats, 15000);
    return () => clearInterval(t);
  }, []);

  if (!getKey()) return <Login />;

  const badge = { orders: stats?.pending || 0, chats: stats?.needReply || 0, products: 0 };

  return (
    <div className="min-h-screen md:flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex w-60 shrink-0 flex-col bg-surface-container-lowest/95 backdrop-blur-lg border-r border-outline-variant/30 sticky top-0 h-screen">
        <div className="p-4 flex items-center gap-3 border-b border-outline-variant/20">
          <img src="/logo.png" alt="" className="w-10 h-10 rounded-xl border border-outline-variant/30" />
          <div>
            <p className="font-headline-md text-headline-md text-primary leading-tight">Viet Food</p>
            <p className="font-label-sm text-label-sm text-on-surface-variant">Trang quản trị</p>
          </div>
        </div>
        <nav className="p-3 flex-1">
          {TABS.map((t) => (
            <NavItem key={t.id} t={t} active={tab === t.id} badge={badge[t.id]} onClick={() => setTab(t.id)} />
          ))}
        </nav>
        <div className="p-3 border-t border-outline-variant/20">
          <button onClick={logout}
            className="w-full flex items-center gap-3 px-4 py-2.5 rounded-full text-error hover:bg-error-container/30 font-label-lg text-label-lg font-bold transition-colors">
            <span className="material-symbols-outlined text-[20px]">logout</span> Đăng xuất
          </button>
        </div>
      </aside>

      {/* Top bar — mobile */}
      <div className="md:hidden sticky top-0 z-40 bg-surface-container-lowest/90 backdrop-blur-lg border-b border-outline-variant/30">
        <div className="flex items-center gap-2 px-4 pt-3">
          <img src="/logo.png" alt="" className="w-8 h-8 rounded-lg border border-outline-variant/30" />
          <p className="font-headline-md text-headline-md text-primary flex-1">Viet Food Admin</p>
          <button onClick={logout} className="p-2 text-error"><span className="material-symbols-outlined text-[20px]">logout</span></button>
        </div>
        <div className="flex gap-2 px-3 py-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <NavItem key={t.id} t={t} compact active={tab === t.id} badge={badge[t.id]} onClick={() => setTab(t.id)} />
          ))}
        </div>
      </div>

      {/* Main */}
      <main className="flex-1 min-w-0 p-4 md:p-6">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <StatChip icon="inventory_2" label="Món đang bán" value={stats?.products} />
          <StatChip icon="receipt_long" label="Tổng đơn hàng" value={stats?.orders} />
          <StatChip icon="pending_actions" label="Đơn chờ xử lý" value={stats?.pending} tone="warn" />
          <StatChip icon="mark_chat_unread" label="Chat chờ trả lời" value={stats?.needReply} tone="warn" />
        </div>
        {tab === 'products' && <Products onChange={refreshStats} />}
        {tab === 'orders' && <Orders onChange={refreshStats} />}
        {tab === 'chats' && <Chats onChange={refreshStats} />}
      </main>
    </div>
  );
}
