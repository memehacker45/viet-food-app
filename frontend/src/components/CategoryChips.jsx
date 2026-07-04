import { useTranslation } from 'react-i18next';
import { loc } from '../lib.js';

export default function CategoryChips({ categories, active, onSelect }) {
  const { t, i18n } = useTranslation();
  const base =
    'px-5 py-2.5 rounded-full font-label-lg text-label-lg active:scale-95 transition-all whitespace-nowrap';
  const activeCls = 'bg-primary text-on-primary shadow-sm';
  const idleCls =
    'bg-surface-container-low text-on-surface-variant border border-outline-variant/50 hover:bg-surface-container-high';

  return (
    <div className="mb-stack-lg overflow-x-auto no-scrollbar pb-2">
      <div className="flex gap-stack-sm w-max">
        <button className={`${base} ${active === 'all' ? activeCls : idleCls}`} onClick={() => onSelect('all')}>
          {t('shop.all')}
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            className={`${base} ${active === c.slug ? activeCls : idleCls}`}
            onClick={() => onSelect(c.slug)}
          >
            {loc(c, 'name', i18n.language)}
          </button>
        ))}
      </div>
    </div>
  );
}
