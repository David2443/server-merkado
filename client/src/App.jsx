import React, { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';

// --- Componente Globale ---
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import ScrollToTop from './components/ScrollToTop';

// --- Pagini Publice ---
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import Contact from './pages/Contact';
import About from './pages/About';

// --- Pagini Legale ---
import Livrare from './pages/Livrare';
import Retur from './pages/Retur';
import Termeni from './pages/Termeni';
import Confidentialitate from './pages/Confidentialitate';
import Cookies from './pages/Cookies';

// --- Pagini Cont & Auth ---
import Account from './pages/Account';
import Login from './pages/Login';
import Forgot from './pages/Forgot'; 
import ResetPassword from './pages/ResetPassword'; 

// --- Pagini Admin ---
import Admin from './pages/Admin';

function App() {
  // 1. Luăm URL-ul curent pentru a ști unde ne aflăm
  const location = useLocation();
  
  // 2. Verificăm dacă suntem pe o pagină de Admin
  // Dacă link-ul începe cu "/admin", asta va fi "true"
  const isAdminPage = location.pathname.startsWith('/admin');

  // 3. Salvare UTM Source (pentru reclame)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const sursa = params.get('utm_source'); 
    
    if (sursa) {
      localStorage.setItem('sursa_trafic', sursa.toLowerCase());
    }
  }, []);

  return (
    <HelmetProvider>
      <div className="app-container">
        {/* 🛡️ SCROLL TO TOP */}
        <ScrollToTop />

        {/* 🧭 NAVIGATION (Apare DOAR dacă nu suntem pe Admin) */}
        {!isAdminPage && <Navbar />}

        {/* 🎯 MAIN CONTENT AREA */}
        <main className="main-content">
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
            {/* Ai aveai o rută dublată de /admin/login care ducea tot către <Login />. O lăsăm dacă ai nevoie de ea! */}
            <Route path="/admin/login" element={<Login />} />
          </Routes>
        </main>

        {/* <footer> (Apare DOAR dacă nu suntem pe Admin) */}
        {!isAdminPage && <Footer />}
      </div>
    </HelmetProvider>
  );
}

export default App;