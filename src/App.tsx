import { useState, useEffect } from 'react';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { StorePage } from './pages/StorePage';
import { AdminPage } from './pages/AdminPage';

export function App() {
  const [currentView, setCurrentView] = useState<'store' | 'admin'>(() => {
    return window.location.pathname === '/admin' || window.location.hash === '#admin'
      ? 'admin'
      : 'store';
  });

  // Manejar historial de navegación (soporte para botón atrás/adelante)
  useEffect(() => {
    const handlePopState = () => {
      const isPathAdmin = window.location.pathname === '/admin' || window.location.hash === '#admin';
      setCurrentView(isPathAdmin ? 'admin' : 'store');
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const handleNavigate = (view: 'store' | 'admin') => {
    setCurrentView(view);
    const targetUrl = view === 'admin' ? '/admin' : '/';
    window.history.pushState({}, '', targetUrl);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <AuthProvider>
      <CartProvider>
        <Header currentView={currentView} onNavigate={handleNavigate} />

        {currentView === 'store' ? (
          <StorePage />
        ) : (
          <AdminPage onNavigateStore={() => handleNavigate('store')} />
        )}

        <CartDrawer />

        <Footer onNavigateAdmin={() => handleNavigate('admin')} />
      </CartProvider>
    </AuthProvider>
  );
}

export default App;
