import { useTranslation } from 'react-i18next';

export default function SearchBar({ value, onChange }) {
  const { t } = useTranslation();
  return (
    <div className="mb-stack-lg relative">
      <div className="flex items-center bg-surface-container-lowest rounded-full shadow-[0px_2px_8px_rgba(0,0,0,0.04)] border border-outline-variant/50 px-4 py-3">
        <span className="material-symbols-outlined text-on-surface-variant mr-3">search</span>
        <input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="flex-1 bg-transparent border-none focus:ring-0 font-body-md text-body-md text-on-surface placeholder-on-surface-variant p-0"
          placeholder={t('shop.searchPlaceholder')}
          type="text"
        />
        <button className="ml-3 p-2 bg-primary-container/10 rounded-full text-primary hover:bg-primary-container/20 transition-colors flex items-center justify-center">
          <span className="material-symbols-outlined">barcode_scanner</span>
        </button>
      </div>
    </div>
  );
}
