import { useEffect } from 'react';
import { Routes, Route, useNavigate, useLocation } from 'react-router-dom';
import Shop from './pages/Shop.jsx';
import ProductDetail from './pages/ProductDetail.jsx';
import Checkout from './pages/Checkout.jsx';
import Support from './pages/Support.jsx';
import { registerBackButton } from './capacitor.js';

export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  // Android Hardware-Back: auf Unterseiten zurueck, auf Startseite App beenden.
  useEffect(() => {
    const cleanup = registerBackButton(navigate, () => location.pathname !== '/');
    return cleanup;
  }, [navigate, location.pathname]);

  return (
    <Routes>
      <Route path="/" element={<Shop />} />
      <Route path="/product/:key" element={<ProductDetail />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/support" element={<Support />} />
      <Route path="*" element={<Shop />} />
    </Routes>
  );
}
