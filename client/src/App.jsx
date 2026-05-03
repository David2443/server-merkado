import { Routes, Route, useLocation } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import React from 'react';
import sitemap from './sitemap.xml';
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

// 📄 Pagini Legale (Astea lipseau!)
import Livrare from './pages/Livrare';
import Retur from './pages/Retur';
import Termeni from './pages/Termeni';
import Confidentialitate from './pages/Confidentialitate';
import Cookies from './pages/Cookies';

// Pagini Cont & Auth
import Account from './pages/Account';
import Login from './pages/Login';
import Forgot from './pages/Forgot'; 
import ResetPassword from './pages/ResetPassword'; 

// Pagini Admin
import Admin from './pages/Admin';

function App() {
  const location = useLocation();

  // Verificăm dacă suntem pe Admin
  const isAdminPage = location.pathname.startsWith('/admin');

  return (
    <HelmetProvider>
      <div className="app-container">
        {/* 🛡️ SCROLL TO TOP */}
        <ScrollToTop />

        {/* 🧭 NAVIGATION */}
        {!isAdminPage && <Navbar />}

        {/* 🎯 MAIN CONTENT AREA */}
        <main className="main-content">
          <Routes>
            {/* --- Rute Publice --- */}
            <Route path="/" element={<Home />} />
            <Route path="/shop" element={<Shop />} />
            <Route path="/produs/:id" element={<ProductPage />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/sitemap.xml" element={
  <iframe src={sitemap} title="sitemap" style={{ display: 'none' }} />
} />
            {/* ✅ REPARAT: Am modificat din /despre-noi în /about ca să se pupe cu Footer-ul */}
            <Route path="/about" element={<About />} />
            
            {/* --- 📄 Rute Legale Noi --- */}
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
        </main>

        {/* <footer> */}
        {!isAdminPage && <Footer />}
      </div>
    </HelmetProvider>
  );
}

export default App;