import { useEffect, useState } from 'react';
import { api, imageUrl } from '../api.js';

const EMPTY = {
  nameDe: '', nameVi: '', nameEn: '', subtitleDe: '', subtitleVi: '', subtitleEn: '',
  descriptionDe: '', descriptionVi: '', descriptionEn: '',
  price: '', oldPrice: '', unit: '', origin: '', categoryId: '', image: null, inStock: true, badges: [],
};

const inputCls = 'mt-1 w-full rounded-xl border-outline-variant bg-surface px-3 py-2 font-body-md text-body-md focus:border-primary focus:ring-primary';

function Field({ label, ...props }) {
  return (
    <label className="block">
      <span className="font-label-lg text-label-lg text-on-surface-variant">{label}</span>
      <input {...props} className={inputCls} />
    </label>
  );
}

function Area({ label, ...props }) {
  return (
    <label className="block">
      <span className="font-label-lg text-label-lg text-on-surface-variant">{label}</span>
      <textarea {...props} rows={2} className={inputCls} />
    </label>
  );
}

function ProductModal({ initial, categories, onClose, onSaved }) {
  const [f, setF] = useState({ ...EMPTY, ...initial, categoryId: initial?.categoryId || categories[0]?.id || '' });
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const set = (k) => (e) => setF({ ...f, [k]: e.target?.type === 'checkbox' ? e.target.checked : e.target.value });

  const uploadImage = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setBusy(true); setErr('');
    try { const { filename } = await api.upload(file); setF((v) => ({ ...v, image: filename })); }
    catch (ex) { setErr('Upload lỗi: ' + ex.message); } finally { setBusy(false); }
  };

  const toggleBadge = (b) =>
    setF((v) => ({ ...v, badges: v.badges.includes(b) ? v.badges.filter((x) => x !== b) : [...v.badges, b] }));

  const save = async () => {
    setBusy(true); setErr('');
    try {
      const payload = { ...f, price: Number(f.price), oldPrice: f.oldPrice || null };
      if (initial?.id) await api.updateProduct(initial.id, payload);
      else await api.createProduct(payload);
      onSaved();
    } catch (ex) { setErr(ex.message); } finally { setBusy(false); }
  };

  return (
    <div className="fixed inset-0 bg-inverse-surface/50 backdrop-blur-sm z-50 flex items-start justify-center overflow-auto p-4" onClick={onClose}>
      <div className="bg-surface-container-lowest rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.16)] border border-outline-variant/30 w-full max-w-3xl p-6 my-4" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-5">
          <h2 className="font-headline-md text-headline-md text-primary">{initial?.id ? 'Sửa món' : 'Thêm món mới'}</h2>
          <button onClick={onClose} className="p-2 rounded-full text-on-surface-variant hover:bg-surface-container-high transition-colors">
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Ảnh */}
        <div className="flex items-center gap-4 mb-5">
          <div className="w-24 h-24 rounded-xl bg-surface-container border border-outline-variant/40 overflow-hidden flex items-center justify-center shrink-0">
            {f.image
              ? <img src={imageUrl(f.image)} alt="" className="w-full h-full object-cover" />
              : <span className="material-symbols-outlined text-outline text-[32px]">image</span>}
          </div>
          <div>
            <label className="inline-flex items-center gap-2 bg-primary-container/20 text-primary font-label-lg text-label-lg font-bold px-4 py-2.5 rounded-full cursor-pointer hover:bg-primary-container/30 transition-colors">
              <span className="material-symbols-outlined text-[18px]">upload</span>
              {f.image ? 'Đổi ảnh' : 'Tải ảnh lên'}
              <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={uploadImage} />
            </label>
            <p className="font-label-sm text-label-sm text-on-surface-variant mt-2">JPG / PNG / WebP, tối đa 5MB. Nên dùng ảnh vuông.</p>
          </div>
        </div>

        {/* Tên & mô tả 3 ngôn ngữ */}
        <div className="grid md:grid-cols-3 gap-3">
          <Field label="Tên (Đức) *" value={f.nameDe} onChange={set('nameDe')} placeholder="Bio-Reisnudeln" />
          <Field label="Tên (Việt)" value={f.nameVi} onChange={set('nameVi')} placeholder="Bún gạo hữu cơ" />
          <Field label="Tên (Anh)" value={f.nameEn || ''} onChange={set('nameEn')} placeholder="Organic Rice Noodles" />
          <Field label="Phụ đề (Đức)" value={f.subtitleDe || ''} onChange={set('subtitleDe')} />
          <Field label="Phụ đề (Việt)" value={f.subtitleVi || ''} onChange={set('subtitleVi')} />
          <Field label="Phụ đề (Anh)" value={f.subtitleEn || ''} onChange={set('subtitleEn')} />
        </div>
        <div className="grid md:grid-cols-3 gap-3 mt-3">
          <Area label="Mô tả (Đức)" value={f.descriptionDe || ''} onChange={set('descriptionDe')} />
          <Area label="Mô tả (Việt)" value={f.descriptionVi || ''} onChange={set('descriptionVi')} />
          <Area label="Mô tả (Anh)" value={f.descriptionEn || ''} onChange={set('descriptionEn')} />
        </div>

        {/* Giá & phân loại */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
          <Field label="Giá (€) *" type="number" step="0.01" value={f.price} onChange={set('price')} />
          <Field label="Giá cũ (gạch)" type="number" step="0.01" value={f.oldPrice || ''} onChange={set('oldPrice')} />
          <Field label="Đơn vị" value={f.unit || ''} onChange={set('unit')} placeholder="500g / Bund" />
          <Field label="Xuất xứ" value={f.origin || ''} onChange={set('origin')} placeholder="Vietnam" />
        </div>
        <div className="flex flex-wrap items-end gap-x-6 gap-y-3 mt-4">
          <label className="block">
            <span className="font-label-lg text-label-lg text-on-surface-variant">Danh mục *</span>
            <select value={f.categoryId} onChange={set('categoryId')} className={inputCls + ' pr-9'}>
              {categories.map((c) => <option key={c.id} value={c.id}>{c.nameVi} ({c.nameDe})</option>)}
            </select>
          </label>
          <label className="flex items-center gap-2 font-body-md text-body-md font-semibold cursor-pointer pb-2">
            <input type="checkbox" checked={f.inStock} onChange={set('inStock')} className="w-4 h-4 rounded text-primary focus:ring-primary border-outline" /> Còn hàng
          </label>
          {['bio', 'fresh'].map((b) => (
            <label key={b} className="flex items-center gap-2 font-body-md text-body-md cursor-pointer pb-2">
              <input type="checkbox" checked={f.badges.includes(b)} onChange={() => toggleBadge(b)} className="w-4 h-4 rounded text-primary focus:ring-primary border-outline" />
              {b === 'bio' ? 'Bio' : 'Tươi'}
            </label>
          ))}
        </div>

        {err && <p className="text-error font-body-md text-body-md mt-3">{err}</p>}
        <div className="flex justify-end gap-3 mt-6">
          <button onClick={onClose} className="px-5 py-2.5 rounded-full font-label-lg text-label-lg font-bold text-on-surface-variant hover:bg-surface-container-high transition-colors">Hủy</button>
          <button onClick={save} disabled={busy || !f.nameDe || !f.price}
            className="px-6 py-2.5 rounded-full font-label-lg text-label-lg font-bold bg-primary text-on-primary hover:bg-primary/90 disabled:opacity-50 transition-colors">
            {busy ? 'Đang lưu…' : 'Lưu món'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Products({ onChange }) {
  const [items, setItems] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editing, setEditing] = useState(null);
  const [q, setQ] = useState('');

  const load = () => Promise.all([api.products(), api.categories()]).then(([p, c]) => { setItems(p); setCategories(c); });
  useEffect(() => { load(); }, []);

  const del = async (p) => {
    if (!confirm(`Xóa "${p.nameVi || p.nameDe}"?`)) return;
    try { await api.deleteProduct(p.id); } catch (e) { alert(e.message); }
    load(); onChange?.();
  };

  const shown = items.filter((p) =>
    (p.nameVi + p.nameDe + (p.nameEn || '')).toLowerCase().includes(q.toLowerCase()));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <h1 className="font-headline-lg text-headline-lg text-on-surface">Món hàng <span className="text-on-surface-variant">({items.length})</span></h1>
        <div className="flex gap-2">
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Tìm món…"
            className="rounded-full border-outline-variant bg-surface-container-lowest px-4 py-2 font-body-md text-body-md w-48 focus:border-primary focus:ring-primary" />
          <button onClick={() => setEditing({})}
            className="flex items-center gap-1.5 bg-primary text-on-primary font-label-lg text-label-lg font-bold px-5 py-2 rounded-full hover:bg-primary/90 transition-colors">
            <span className="material-symbols-outlined text-[18px]">add</span> Thêm món
          </button>
        </div>
      </div>

      {shown.length === 0 && <p className="font-body-md text-on-surface-variant">Không có món nào.</p>}

      <div className="grid gap-gutter grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {shown.map((p) => (
          <div key={p.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/30 overflow-hidden shadow-sm group hover:shadow-md transition-shadow">
            <div className="aspect-square bg-surface-container relative">
              {p.image
                ? <img src={imageUrl(p.image)} alt="" className="w-full h-full object-cover" />
                : <div className="w-full h-full flex flex-col items-center justify-center text-outline">
                    <span className="material-symbols-outlined text-[28px]">no_photography</span>
                    <span className="font-label-sm text-label-sm mt-1">Chưa có ảnh</span>
                  </div>}
              {!p.inStock && (
                <span className="absolute top-2 left-2 bg-error text-on-error font-label-sm text-label-sm font-bold px-2.5 py-1 rounded-full">HẾT HÀNG</span>
              )}
            </div>
            <div className="p-3">
              <p className="font-body-md text-body-md font-bold truncate">{p.nameVi}</p>
              <p className="font-label-sm text-label-sm text-on-surface-variant truncate mt-0.5">{p.nameDe}{p.nameEn ? ` · ${p.nameEn}` : ''}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="font-headline-md text-headline-md text-primary">€{Number(p.price).toFixed(2)}</span>
                <div className="flex gap-1 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
                  <button onClick={() => setEditing({ ...p, badges: p.badges || [] })} title="Sửa"
                    className="p-1.5 rounded-full hover:bg-primary-container/20 text-primary transition-colors">
                    <span className="material-symbols-outlined text-[18px]">edit</span>
                  </button>
                  <button onClick={() => del(p)} title="Xóa"
                    className="p-1.5 rounded-full hover:bg-error-container/40 text-error transition-colors">
                    <span className="material-symbols-outlined text-[18px]">delete</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {editing !== null && (
        <ProductModal
          initial={editing.id ? editing : null}
          categories={categories}
          onClose={() => setEditing(null)}
          onSaved={() => { setEditing(null); load(); onChange?.(); }}
        />
      )}
    </div>
  );
}
