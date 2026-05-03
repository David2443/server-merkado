import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiArrowRight, FiClock } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTiktok, FaCcVisa, FaCcMastercard, FaCcApplePay } from 'react-icons/fa';
import './Footer.css';
import About from '../pages/About';
import React from 'react';

const Footer = () => {
  return (
    <footer className="footer-merkado">
     
      {/* --- 2. PARTEA DE MIJLOC: LINK-URI & DATE FIRMĂ --- */}
      <div className="footer-main">
        <div className="container footer-grid">
          
          {/* Coloana 1: Brand & Date Fiscale (Obligatoriu RO) */}
          <div className="footer-col brand-col">
            <Link to="/" className="footer-logo">MERK<span>ADO</span></Link>
            <p className="brand-desc">
              Magazinul tău online de încredere. Calitate premium, livrare rapidă și o experiență de shopping creată special pentru tine.
            </p>
            {/* Aici îți vei pune datele reale ale firmei tale (SRL/PFA) */}
            <div className="company-details">
              <strong>DS RETAIL NETWORK SRL</strong>
              <span>CUI: 54193458</span>
              <span>Sediu: Str. Otelesti nr 140A, Stefanesti. Arges</span>
            </div>
          </div>

          {/* Coloana 2: Navigare Rapidă */}
          <div className="footer-col">
            <h4>Descoperă</h4>
            <ul>
              <li><Link to="/">Acasă</Link></li>
              <li><Link to="/shop">Toate Produsele</Link></li>
              <li><Link to="/oferte">Oferte Speciale 🔥</Link></li>
              <li><Link to="/About">Despre noi</Link></li>
            </ul>
          </div>

          {/* Coloana 3: Suport Clienți */}
          <div className="footer-col">
            <h4>Suport Clienți</h4>
            <ul>
              <li><Link to="/contact">Contactează-ne</Link></li>
              <li><Link to="/livrare">Politică de Livrare</Link></li>
              <li><Link to="/retur">Politică de Retur / Garanții</Link></li>
              <li><Link to="/faq">Întrebări Frecvente (FAQ)</Link></li>
            </ul>
          </div>

          {/* Coloana 4: Contact & Social Media */}
          <div className="footer-col contact-col">
            <h4>Informații Contact</h4>
            <ul>
              <li><FiPhone className="c-icon" /> <span>+40 723 717 438</span></li>
              <li><FiMail className="c-icon" /> <span>contact@merkado.ro</span></li>
              <li><FiClock className="c-icon" /> <span>Luni - Vineri: 09:00 - 18:00</span></li>
            </ul>
            <div className="social-links">
              <a href="https://www.facebook.com/profile.php?id=61589093280182" target="_blank" rel="noreferrer" aria-label="Facebook" className="social-icon"><FaFacebookF /></a>
              <a href="https://instagram.com" target="_blank" rel="noreferrer" aria-label="Instagram" className="social-icon"><FaInstagram /></a>
              <a href="https://tiktok.com" target="_blank" rel="noreferrer" aria-label="TikTok" className="social-icon"><FaTiktok /></a>
            </div>
          </div>

        </div>
      </div>

      {/* --- 3. PARTEA DE JOS: DOCUMENTE LEGALE & PLĂȚI --- */}
      <div className="footer-bottom">
        <div className="container bottom-grid">
          
          <div className="legal-links">
            <Link to="/termeni">Termeni și Condiții</Link>
            <span className="dot">•</span>
            <Link to="/confidentialitate">Politică de Confidențialitate</Link>
            <span className="dot">•</span>
            <Link to="/cookies">Politică de Cookies</Link>
          </div>

          <div className="payment-icons">
            <span className="payment-text">Plăți 100% Sigure:</span>
            <FaCcVisa title="Visa" />
            <FaCcMastercard title="Mastercard" />
            <FaCcApplePay title="Apple Pay" />
          </div>

        </div>
      </div>

      {/* --- 4. BANDA FINALĂ: COPYRIGHT & ANPC (Obligatoriu RO) --- */}
      <div className="footer-compliance">
        <div className="container compliance-flex">
          <p className="copyright">
            &copy; {new Date().getFullYear()} MERKADO. Toate drepturile rezervate.
          </p>
          <div className="anpc-links">
            <a href="https://anpc.ro/" target="_blank" rel="noreferrer">ANPC</a>
            <a href="https://ec.europa.eu/consumers/odr" target="_blank" rel="noreferrer">SOL</a>
            <a href="https://anpc.ro/ce-este-sal/" target="_blank" rel="noreferrer">SAL</a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;