import { Link } from 'react-router-dom';
import { FiMail, FiPhone, FiMapPin, FiArrowRight } from 'react-icons/fi';
import { FaFacebookF, FaInstagram, FaTiktok, FaCcVisa, FaCcMastercard, FaCcApplePay } from 'react-icons/fa';
import './Footer.css';
import React from 'react';
const Footer = () => {
  return (
    <footer className="footer-premium">
      {/* --- PARTEA DE SUS: NEWSLETTER --- */}
      <div className="footer-newsletter">
        <div className="container newsletter-grid">
          <div className="newsletter-text">
            <h3>Intră în Clubul VIP 👑</h3>
            <p>Abonează-te și primești instant un cod de <strong>-10% reducere</strong> pentru prima ta comandă.</p>
          </div>
          <form className="newsletter-form" onSubmit={(e) => e.preventDefault()}>
            <input type="email" placeholder="Adresa ta de email..." required />
            <button type="submit">Vreau Reducerea <FiArrowRight /></button>
          </form>
        </div>
      </div>

      {/* --- PARTEA DE MIJLOC: LINK-URI --- */}
      <div className="footer-main">
        <div className="container footer-grid">
          
          {/* Coloana 1: Despre */}
          <div className="footer-col brand-col">
            <h2 className="footer-logo">SUPER<span>PRODUSE</span></h2>
            <p className="brand-desc">
              Revoluționăm modul în care faci cumpărături online. Calitate premium, livrare fulger și suport dedicat pentru fiecare client.
            </p>
            <div className="social-links">
              <a href="#" className="social-icon"><FaFacebookF /></a>
              <a href="#" className="social-icon"><FaInstagram /></a>
              <a href="#" className="social-icon"><FaTiktok /></a>
            </div>
          </div>

          {/* Coloana 2: Magazin */}
          <div className="footer-col">
            <h4>Magazin</h4>
            <ul>
              <li><Link to="/">Acasă</Link></li>
              <li><Link to="/produse">Toate Produsele</Link></li>
              <li><Link to="/oferte">Oferta Zilei 🔥</Link></li>
              <li><Link to="/categorii">Categorii</Link></li>
            </ul>
          </div>

          {/* Coloana 3: Suport Clienți */}
          <div className="footer-col">
            <h4>Suport Clienți</h4>
            <ul>
              <li><Link to="/contact">Contactează-ne</Link></li>
              <li><Link to="/livrare">Politica de Livrare</Link></li>
              <li><Link to="/retur">Politica de Retur</Link></li>
              <li><Link to="/faq">Întrebări Frecvente</Link></li>
            </ul>
          </div>

          {/* Coloana 4: Contact */}
          <div className="footer-col contact-col">
            <h4>Contact</h4>
            <ul>
              <li><FiPhone className="c-icon" /> <span>+40 723 717 438</span></li>
              <li><FiMail className="c-icon" /> <span>contact@superproduse.ro</span></li>
              <li><FiMapPin className="c-icon" /> <span>București, România</span></li>
            </ul>
          </div>

        </div>
      </div>

      {/* --- PARTEA DE JOS: COPYRIGHT & PLĂȚI --- */}
      <div className="footer-bottom">
        <div className="container bottom-grid">
          <p className="copyright">
            &copy; {new Date().getFullYear()} Super Produse. Toate drepturile rezervate.
          </p>
          
          <div className="legal-links">
            <Link to="/termeni">Termeni și Condiții</Link>
            <span className="dot">•</span>
            <Link to="/confidentialitate">Politica de Confidențialitate</Link>
            <span className="dot">•</span>
            <a href="https://anpc.ro/" target="_blank" rel="noreferrer">ANPC</a>
          </div>

          <div className="payment-icons">
            <FaCcVisa />
            <FaCcMastercard />
            <FaCcApplePay />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;