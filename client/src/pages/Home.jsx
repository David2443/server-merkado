import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  FiShoppingCart, FiStar, FiShield, FiAward, 
  FiHeadphones, FiChevronLeft, FiChevronRight, FiTrendingUp, 
  FiTruck, FiCheckCircle 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './Home.css';
import React from 'react';

const Home = () => {
  const navigate = useNavigate();
  const [produse, setProduse] = useState([]);
  const [timeLeft, setTimeLeft] = useState(13500); 

  const productsRef = useRef(null);
  const reviewsRef = useRef(null);

  const numarTelefonSuport = import.meta.env.VITE_PHONE_NUMBER || "40723717438"; 

  // Timer Flash Sale
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // Încărcare Produse + Scroll sus DOAR la prima încărcare
  useEffect(() => {
    window.scrollTo(0, 0); // O singură dată la început
    fetch('https://merkado-backend.onrender.com/api/produse')
      .then(res => res.json())
      .then(data => setProduse(data))
      .catch(err => console.error("Eroare la încărcare produse:", err));
  }, []);

  // Mutăm logica de scroll aici ca să fie „safe”
  const handleScrollToProducts = (e) => {
    e.preventDefault(); 
    const section = document.querySelector('#produse-noi');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (e, produsId) => {
    e.preventDefault(); 
    e.stopPropagation(); 
    console.log("Produs adăugat:", produsId);
    // Aici vine logica ta de coș
  };

  return (
    <div className="general-ecom-wrapper">
      {/* ⚠️ ATENȚIE: Nu pune niciodată <Navbar /> aici dacă îl ai deja în App.jsx! */}
      
      <div className="top-panic-bar">
        <div className="panic-content">
          <span className="pulse-dot"></span>
          <p>🔥 <strong>FLASH SALE:</strong> Transport Gratuit peste 200 Lei!</p>
        </div>
        <div className="panic-timer">
          Expiră în: <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

      <section className="hero-split-section">
        <div className="container hero-split-grid">
          <div className="hero-left">
            <div className="badge-new-collection">
              <FiTrendingUp /> Colecția Premium 2026
            </div>
            <h1 className="hero-mega-title">
              Cumpărături inteligente.<br /><span>Prețuri corecte.</span>
            </h1>
            <p className="hero-mega-desc">
              Cele mai dorite produse, de la electronice la accesorii auto, cu livrare rapidă.
            </p>
            <div className="hero-actions-row">
              <a href="#produse-noi" onClick={handleScrollToProducts} className="btn-shop-mega">Explorează Oferta</a>
              <div className="hero-social-proof">
                <div className="avatars-group">
                  <img src="https://i.pravatar.cc/100?img=1" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=2" alt="user" />
                  <img src="https://i.pravatar.cc/100?img=3" alt="user" />
                </div>
                <div className="proof-text">
                  <div className="stars-ecom"><FiStar/><FiStar/><FiStar/><FiStar/><FiStar/></div>
                  <span>10.000+ clienți mulțumiți</span>
                </div>
              </div>
            </div>
          </div>
          
          <div className="hero-right">
            <div className="hero-image-composition">
              <img 
                src="https://images.unsplash.com/photo-1505740420928-5e560c06d30e?q=80&w=1000&auto=format&fit=crop" 
                alt="Produse Premium" 
                className="main-hero-img"
              />
              <div className="floating-glass-card">
                <div className="glass-icon">🏆</div>
                <div>
                  <strong>Produsul Anului</strong>
                  <p>Ales de clienți</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="produse-noi" className="products-premium-section">
        <div className="container">
          <div className="products-header-modern">
            <h2>Top Vânzări <span>Săptămâna Asta</span></h2>
            <div className="slider-arrows-desktop">
              <button onClick={() => scrollSlider(productsRef, 'left')} className="arrow-btn"><FiChevronLeft /></button>
              <button onClick={() => scrollSlider(productsRef, 'right')} className="arrow-btn"><FiChevronRight /></button>
            </div>
          </div>

          <div className="premium-scroll-wrapper" ref={productsRef}>
            {produse.length === 0 ? (
              <p className="loading-text">Se încarcă catalogul...</p>
            ) : (
              produse.map(produs => (
                <div 
                  key={produs._id} 
                  className="premium-card-scroll" 
                  onClick={() => navigate(`/produs/${produs._id}`)}
                >
                  <div className="premium-img-box">
                    <img src={produs.imaginePrincipala} alt={produs.nume} loading="lazy" />
                    <div className="badge-discount">🔥 TOP</div>
                  </div>
                  <div className="premium-card-body">
                    <h3 className="premium-title">{produs.nume}</h3>
                    <div className="price-row-mini">
                      <span className="price-new">{produs.pret} Lei</span>
                      <button 
                        type="button" 
                        className="add-to-cart-mini" 
                        onClick={(e) => handleAddToCart(e, produs._id)}
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      <a href={`https://wa.me/${numarTelefonSuport}`} target="_blank" rel="noreferrer" className="whatsapp-float-btn">
        <FaWhatsapp className="wa-icon-bomba" />
      </a>
    </div>
  );
};

export default Home;