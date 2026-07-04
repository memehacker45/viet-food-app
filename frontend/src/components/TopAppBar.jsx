import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';

export default function TopAppBar({ showBack = false, rightLabel = null }) {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();

  const toggleLang = () => {
    const next = i18n.language === 'de' ? 'vi' : 'de';
    i18n.changeLanguage(next);
    localStorage.setItem('lang', next);
    document.documentElement.lang = next;
  };

  return (
    <header className="bg-surface/90 backdrop-blur-md top-0 sticky z-50 border-b border-outline-variant/30 shadow-sm flex justify-between items-center w-full px-container-margin pt-safe pb-base">
      <div className="flex items-center gap-stack-sm cursor-pointer hover:opacity-80 transition-opacity" onClick={() => navigate('/')}>
        {showBack && (
          <button
            aria-label={t('product.back')}
            onClick={(e) => { e.stopPropagation(); navigate(-1); }}
            className="p-2 text-on-surface-variant hover:bg-surface-container-high transition-colors rounded-full flex items-center justify-center opacity-80 hover:opacity-100"
          >
            <span className="material-symbols-outlined">arrow_back</span>
          </button>
        )}
        <span className="material-symbols-outlined text-primary text-[24px]">spa</span>
        <span className="font-headline-md text-headline-md font-bold tracking-tight text-primary">{t('brand')}</span>
      </div>
      <div className="flex items-center gap-stack-md">
        {rightLabel ? (
          <span className="text-on-surface-variant font-label-lg text-label-lg">{rightLabel}</span>
        ) : (
          <button
            onClick={toggleLang}
            className="font-label-lg text-label-lg text-primary font-bold hover:bg-surface-container-high transition-colors px-3 py-1.5 rounded-full"
          >
            {t('lang')}
          </button>
        )}
      </div>
    </header>
  );
}
