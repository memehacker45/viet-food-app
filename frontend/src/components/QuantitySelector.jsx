export default function QuantitySelector({ qty, onDec, onInc, size = 'sm' }) {
  const btn =
    'flex items-center justify-center text-on-surface hover:text-primary transition-colors';
  return (
    <div className="flex items-center gap-2 bg-surface-container rounded-full px-2 py-1">
      <button className={`${btn} ${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'}`} onClick={onDec} aria-label="-">
        <span className="material-symbols-outlined text-[18px]">remove</span>
      </button>
      <span className="font-label-lg text-label-lg font-bold text-on-surface w-4 text-center">{qty}</span>
      <button className={`${btn} ${size === 'lg' ? 'w-10 h-10' : 'w-8 h-8'}`} onClick={onInc} aria-label="+">
        <span className="material-symbols-outlined text-[18px]">add</span>
      </button>
    </div>
  );
}
