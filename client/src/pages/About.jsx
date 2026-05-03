import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiTarget, FiHeart, FiCheckCircle, FiTruck, FiUsers, FiShoppingBag } from 'react-icons/fi';
import './About.css';
import React from 'react';
const About = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="about-wrapper">
      
      {/* --- HERO SECTION --- */}
      <section className="about-hero">
        <div className="container">
          <span className="about-badge">Povestea Noastră</span>
          <h1>Mai mult decât un magazin,<br /><span>o comunitate.</span></h1>
          <p>Am plecat de la o idee simplă: să aducem cele mai bune produse, la prețuri corecte, fără compromisuri la calitate.</p>
        </div>
      </section>

      {/* --- VALORI (GRID MODERN) --- */}
      <section className="about-values">
        <div className="container">
          <div className="values-grid">
            <div className="value-card">
              <FiTarget className="v-icon" />
              <h3>Misiunea Noastră</h3>
              <p>Să livrăm excelență în fiecare colet și să devenim destinația preferată pentru cumpărături inteligente.</p>
            </div>
            <div className="value-card">
              <FiHeart className="v-icon" />
              <h3>Pasiune</h3>
              <p>Fiecare produs din catalogul nostru este ales manual și testat riguros de echipa noastră.</p>
            </div>
            <div className="value-card">
              <FiCheckCircle className="v-icon" />
              <h3>Integritate</h3>
              <p>Transparența este cheia. Ceea ce vezi în poze este exact ceea ce primești acasă.</p>
            </div>
          </div>
        </div>
      </section>

      {/* --- POVESTEA DETALIATĂ --- */}
      <section className="about-story-split">
        <div className="container story-grid">
          <div className="story-image">
            <img 
              src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=1000&auto=format&fit=crop" 
              alt="Echipa Merkado" 
              loading="lazy" 
            />
            <div className="experience-badge">
              <strong>5+</strong>
              <span>Ani de Experiență</span>
            </div>
          </div>
          <div className="story-content">
            <h2>Cum am început?</h2>
            <p>
              Totul a început într-un garaj mic, cu o mână de produse și o dorință imensă de a schimba experiența de shopping online din România. Ne-am săturat de livrări întârziate și produse de calitate îndoielnică.
            </p>
            <p>
              Astăzi, servim mii de clienți lunar, dar valorile noastre au rămas aceleași. Punem clientul pe primul loc și nu ne oprim până când nu știm că ești 100% mulțumit de alegerea făcută.
            </p>
            <div className="about-stats">
              <div className="stat-item">
                <FiUsers />
                <strong>10k+</strong>
                <span>Clienți</span>
              </div>
              <div className="stat-item">
                <FiTruck />
                <strong>24h</strong>
                <span>Livrare Medie</span>
              </div>
            </div>

            {/* 🚀 CALL TO ACTION (Oprirea fundăturii) */}
            <div style={{ marginTop: '40px' }}>
              <Link to="/#produse-noi" className="btn-shop-mega" style={{ display: 'inline-flex', alignItems: 'center', gap: '10px' }}>
                <FiShoppingBag /> Descoperă Produsele
              </Link>
            </div>

          </div>
        </div>
      </section>

    </div>
  );
};

export default About;