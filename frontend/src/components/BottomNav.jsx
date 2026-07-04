import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';

function Item({ to, icon, label, badge }) {
  return (
    <NavLink
      to={to}
      end
      className="flex flex-col items-center justify-center transition-all active:scale-90 duration-150 ease-out group w-16"
    >
      {({ isActive }) => (
        <>
          <div
            className={
              'relative flex flex-col items-center ' +
              (isActive
                ? 'text-primary bg-primary-container/20 rounded-full px-4 py-1'
                : 'text-on-surface-variant group-hover:text-primary')
            }
          >
            <span className={'material-symbols-outlined mb-1 text-[24px] ' + (isActive ? 'icon-fill' : '')}>
              {icon}
            </span>
            <span className={'font-label-sm text-label-sm text-center w-full truncate ' + (isActive ? 'font-bold text-primary' : '')}>
              {label}
            </span>
            {badge > 0 && (
              <span className="absolute -top-1 right-2 min-w-[16px] h-4 px-1 rounded-full bg-secondary-container text-on-secondary text-[10px] font-bold flex items-center justify-center">
                {badge}
              </span>
            )}
          </div>
        </>
      )}
    </NavLink>
  );
}

export default function BottomNav() {
  const { t } = useTranslation();
  const { count } = useCart();
  return (
    <nav className="bg-surface/95 backdrop-blur-lg fixed bottom-0 left-0 w-full rounded-t-xl z-50 shadow-[0_-4px_12px_rgba(0,0,0,0.04)] flex justify-around items-center px-4 pt-base pb-safe-offset-4 border-t border-outline-variant/10">
      <Item to="/" icon="home" label={t('nav.home')} />
      <Item to="/checkout" icon="shopping_basket" label={t('nav.shop')} badge={count} />
      <Item to="/support" icon="chat_bubble" label={t('nav.chat')} />
      {/* Tab Profile tạm ẩn: chưa có trang /profile. Khi nào làm xong trang Profile thì mở lại dòng dưới.
      <Item to="/profile" icon="person" label={t('nav.profile')} /> */}
    </nav>
  );
}
