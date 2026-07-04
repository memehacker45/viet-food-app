import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext.jsx';
import { imageUrl } from '../api/client.js';
import { loc, euro } from '../lib.js';
import QuantitySelector from './QuantitySelector.jsx';

export default function ProductCard({ product }) {
  const { i18n } = useTranslation();
  const navigate = useNavigate();
  const { add, setQty, qtyOf } = useCart();
  const lang = i18n.language;
  const qty = qtyOf(product.id);

  const goDetail = () => navigate(`/product/${product.slug}`);
  const onAdd = (e) => {
    e.stopPropagation();
    if (!product.inStock) return;
    add(product, 1);
  };

  return (
    <article className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 shadow-[0px_2px_8px_rgba(0,0,0,0.04)] overflow-hidden flex flex-col group hover:shadow-lg transition-shadow duration-300">
      <div className="h-40 w-full bg-surface-container-low relative overflow-hidden cursor-pointer" onClick={goDetail}>
        <div
          className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
          style={{ backgroundImage: `url('${imageUrl(product)}')` }}
        />
        {!product.inStock && (
          <div className="absolute inset-0 flex items-center justify-center bg-surface/30 backdrop-blur-[1px]">
            <span className="bg-error text-on-error px-3 py-1 rounded-full font-label-lg text-label-lg uppercase tracking-wider -rotate-6 shadow">
              {/* soldOut handled in detail; small ribbon here */}
            </span>
          </div>
        )}
        <button className="absolute top-2 right-2 p-1.5 rounded-full bg-surface/80 backdrop-blur-sm text-on-surface-variant hover:text-error transition-colors">
          <span className="material-symbols-outlined text-[20px]">favorite</span>
        </button>
      </div>
      <div className="p-3 flex flex-col flex-1 cursor-pointer" onClick={goDetail}>
        <span className="font-label-sm text-label-sm text-on-surface-variant mb-1 uppercase tracking-wider">
          {loc(product.category, 'name', lang)}
        </span>
        <h3 className="font-body-lg text-body-lg font-bold text-on-surface mb-1 truncate">
          {loc(product, 'name', lang)}
        </h3>
        <p className="font-body-md text-body-md text-on-surface-variant mb-stack-md truncate">
          {loc(product, 'subtitle', lang)}
        </p>
        <div className="mt-auto flex items-center justify-between">
          <span className="font-headline-md text-headline-md text-secondary-container">{euro(product.price)}</span>
          {qty > 0 ? (
            <div onClick={(e) => e.stopPropagation()}>
              <QuantitySelector
                qty={qty}
                onDec={() => setQty(product.id, qty - 1)}
                onInc={() => setQty(product.id, qty + 1)}
              />
            </div>
          ) : (
            <button
              onClick={onAdd}
              disabled={!product.inStock}
              className="w-10 h-10 rounded-full bg-primary-container/10 text-primary flex items-center justify-center hover:bg-primary hover:text-on-primary transition-colors active:scale-90 duration-150 disabled:opacity-40 disabled:cursor-not-allowed disabled:hover:bg-primary-container/10 disabled:hover:text-primary"
            >
              <span className="material-symbols-outlined font-bold">add</span>
            </button>
          )}
        </div>
      </div>
    </article>
  );
}
