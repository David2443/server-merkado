import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
// Componente Globale
import Navbar from './components/Navbar';
import Footer from './components/Footer'; 
import ScrollToTop from './components/ScrollToTop';

// Pagini Publice
import Home from './pages/Home';
import Shop from './pages/Shop';
import ProductPage from './pages/ProductPage';
import Contact from './pages/Contact';
import About from './pages/About';

// Pagini Cont & Auth
import Account from './pages/Account';
import Login from './pages/Login';
import Forgot from './pages/Forgot'; 
import ResetPassword from './pages/ResetPassword'; 

// Pagini Admin
import Admin from './pages/Admin';

// Pagina 404 (Opțional, dar recomandat)
// import NotFound from './pages/NotFound'; 

function App() {
  const location = useLocation();

  // Verificăm dacă suntem pe Admin (Folosim o logică mai sigură)
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <HelmetProvider>
      <div className="app-container">
        {/* 🛡️ SCROLL TO TOP - Acum e activ și va face scroll lent la fiecare schimbare de pagină */}
        <ScrollToTop />

        {/* 🧭 NAVIGATION - Apare doar pe paginile de shop */}
        {!isAdminPage && <Navbar />}

        {/* 🎯 MAIN CONTENT AREA */}
        <main className="main-content">
          <Routes>
            {/* --- Rute Publice --- */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/produs/:id" element={<ProductPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/despre-noi" element={<About />} />
            

            {/* --- Rute Autentificare --- */}
            <Route path="/login" element={<Login />} />
            <Route path="/account" element={<Account />} />
            <Route path="/forgot-password" element={<Forgot />} />
            <Route path="/reset-password/:token" element={<ResetPassword />} />

            {/* --- Rute Admin --- */}
            <Route path="/admin" element={<Admin />} />
            {/* Aici poți adăuga și /admin/comenzi, /admin/produse etc. */}
            <Route path="/admin/login" element={<Login />} />

            {/* --- 404 CATCH ALL --- */}
            {/* <Route path="*" element={<NotFound />} /> */}
          </Routes>
        </main>

        {/* <footer> - Apare doar dacă nu ești pe Admin */}
        {!isAdminPage && <Footer />}
      </div>
    </HelmetProvider>
  );
}

export default App;