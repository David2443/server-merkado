import React, { useEffect, Suspense, lazy } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// --- Componente Globale (Încărcate normal, fiindcă apar imediat) ---
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import ScrollToTop from './components/ScrollToTop';

// --- Pagini Încărcate "Lazy" (Se descarcă DOAR când clientul intră pe ele) ---
const Home = lazy(() => import('./pages/Home'));
const Shop = lazy(() => import('./pages/Shop'));
const ProductPage = lazy(() => import('./pages/ProductPage'));
const Contact = lazy(() => import('./pages/Contact'));
const About = lazy(() => import('./pages/About'));

// --- Pagini Legale ---
const Livrare = lazy(() => import('./pages/Livrare'));
const Retur = lazy(() => import('./pages/Retur'));
const Termeni = lazy(() => import('./pages/Termeni'));
const Confidentialitate = lazy(() => import('./pages/Confidentialitate'));
const Cookies = lazy(() => import('./pages/Cookies'));

// --- Pagini Cont & Auth ---
const Account = lazy(() => import('./pages/Account'));
const Login = lazy(() => import('./pages/Login'));
const Forgot = lazy(() => import('./pages/Forgot')); 
const ResetPassword = lazy(() => import('./pages/ResetPassword')); 

// --- Pagini Admin ---
const Admin = lazy(() => import('./pages/Admin'));

function App() {
  // 1. Luăm URL-ul curent pentru a ști unde ne aflăm
  const location = useLocation();
  
  // 2. Verificăm dacă suntem pe o pagină de Admin
  const isAdminPage = location.pathname.startsWith('/admin');

  // 3. Salvare UTM Source (pentru reclame)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sursa = params.get('utm_source'); 
    
    if (sursa) {
      localStorage.setItem('sursa_trafic', sursa.toLowerCase());
    }
  }, []);

  // 4. Fallback-ul (Ce vede clientul pentru jumătate de secundă cât se descarcă pagina)
  const renderLoader = () => (
    <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#f8fafc' }}>
      <div className="merkado-spinner-container">
        <div className="merkado-spin-ring"></div>
        <div className="merkado-spin-logo" style={{ color: '#e61938' }}>M</div>
      </div>
    </div>
  );

  return (
    <HelmetProvider>
      <div className="app-container">
        {/* 🛡️ SCROLL TO TOP */}
        <ScrollToTop />

        {/* 🧭 NAVIGATION (Apare DOAR dacă nu suntem pe Admin) */}
        {!isAdminPage && <Navbar />}

        {/* 🎯 MAIN CONTENT AREA */}
        <main className="main-content">
          {/* Suspense este "plasa de siguranță" care arată loader-ul cât timp React aduce fișierul paginii */}
          <Suspense fallback={renderLoader()}>
            <Routes>
              {/* --- Rute Publice --- */}
              <Route path="/" element={<Home />} />
              <Route path="/shop" element={<Shop />} />
              <Route path="/produs/:id" element={<ProductPage />} />
              <Route path="/contact" element={<Contact />} />
              <Route path="/about" element={<About />} />
              
              {/* --- Rute Legale --- */}
              <Route path="/livrare" element={<Livrare />} />
              <Route path="/retur" element={<Retur />} />
              <Route path="/termeni" element={<Termeni />} />
              <Route path="/confidentialitate" element={<Confidentialitate />} />
              <Route path="/cookies" element={<Cookies />} />

              {/* --- Rute Autentificare --- */}
              <Route path="/login" element={<Login />} />
              <Route path="/account" element={<Account />} />
              <Route path="/forgot-password" element={<Forgot />} />
              <Route path="/reset-password/:token" element={<ResetPassword />} />

              {/* --- Rute Admin --- */}
              <Route path="/admin" element={<Admin />} />
              <Route path="/admin/login" element={<Login />} />
            </Routes>
          </Suspense>
        </main>

        {/* <footer> (Apare DOAR dacă nu suntem pe Admin) */}
        {!isAdminPage && <Footer />}
      </div>
    </HelmetProvider>
  );
}

export default App;