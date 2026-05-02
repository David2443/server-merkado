import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiShoppingCart, FiStar, FiHeart, FiShield, FiAward, 
  FiHeadphones, FiChevronLeft, FiChevronRight, FiTrendingUp, 
  FiTruck, FiEye, FiCheckCircle, FiCreditCard 
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './Home.css';
import React from 'react';
const handleScrollToProducts = (e) => {
  e.preventDefault(); 
  const section = document.querySelector('#produse-noi');
  if (section) {
    section.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }
};

const Home = () => {
  const navigate = useNavigate();
  const [produse, setProduse] = useState([]);
  const [timeLeft, setTimeLeft] = useState(13500); 

  const productsRef = useRef(null);
  const reviewsRef = useRef(null);

  // Folosește numărul de telefon dintr-o variabilă de mediu sau măcar o constantă
  const numarTelefonSuport = import.meta.env.VITE_PHONE_NUMBER || "40723717438"; 

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

  useEffect(() => {
    window.scrollTo(0, 0);
   fetch('https://merkado-backend.onrender.com/api/produse')
      .then(res => res.json())
      .then(data => setProduse(data))
      .catch(err => console.error("Eroare la încărcare produse:", err));
  }, []);

  const scrollSlider = (ref, direction) => {
    if (ref.current) {
      const scrollAmount = direction === 'left' ? -350 : 350;
      ref.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const handleAddToCart = (e, produsId) => {
    e.preventDefault(); // 🛡️ Protecție dublă
    e.stopPropagation(); 
    console.log("Produs adăugat în coș:", produsId);
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    e.stopPropagation(); 
    console.log("Adăugat la favorite");
  };

  return (
    <div className="general-ecom-wrapper">
      
      <div className="top-panic-bar">
        <div className="panic-content">
          <span className="pulse-dot"></span>
          <p>🔥 <strong>FLASH SALE:</strong> Transport Gratuit pentru comenzile de peste 200 Lei!</p>
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
              Am adus la un loc cele mai dorite produse. De la electronice de top până la accesorii auto, toate cu livrare rapidă.
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

      <div className="authority-band-section">
        <div className="authority-ticker">
          <div className="ticker-track">
            <div className="ticker-item"><FiShield className="ticker-icn"/> Cumpărături Sigure</div>
            <div className="ticker-logo">VISA</div>
            <div className="ticker-logo">mastercard</div>
            <div className="ticker-logo"> Pay</div>
            <div className="ticker-item"><FiTruck className="ticker-icn"/> Livrare Națională</div>
            <div className="ticker-logo">SAMEDAY</div>
            <div className="ticker-item"><FiShield className="ticker-icn"/> Cumpărături Sigure</div>
            <div className="ticker-logo">VISA</div>
            <div className="ticker-logo">mastercard</div>
            <div className="ticker-logo"> Pay</div>
          </div>
        </div>
      </div>

      <section id="produse-noi" className="products-premium-section">
        <div className="container">
          <div className="products-header-modern">
            <span className="products-badge">Oferta Zilei</span>
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
                    <img 
                      src={produs.imaginePrincipala || 'https://via.placeholder.com/300x300?text=Fara+Imagine'} 
                      alt={produs.nume} 
                      loading="lazy" 
                    />
                    <div className="badge-discount">🔥 TOP</div>
                  </div>
                  
                  <div className="premium-card-body">
                    <h3 className="premium-title">{produs.nume}</h3>
                    <div className="price-row-mini">
                      <span className="price-new">{produs.pret} Lei</span>
                      {produs.pretVechi && <span className="price-old">{produs.pretVechi} Lei</span>}
                      <button 
                        type="button" // 🛡️ Evităm form submit ciudate
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

      <section className="why-bomba-section">
        <div className="container">
          <div className="why-bomba-header">
            <span className="why-badge">Avantajele Tale</span>
            <h2>De ce suntem <span>alegerea numărul 1?</span></h2>
          </div>
          <div className="why-bento-grid">
            <div className="why-card card-delivery">
              <FiTruck className="why-icon" />
              <div className="why-big-number">24/48h</div>
              <h3>Livrare Fulger</h3>
              <p>Comenzile plasate până în ora 15:00 pleacă în aceeași zi, direct la ușa ta.</p>
            </div>
            <div className="why-card card-quality">
              <FiAward className="why-icon" />
              <h3>Calitate Garantată</h3>
              <p>Fiecare produs este testat riguros înainte de a ajunge în oferta noastră.</p>
            </div>
            <div className="why-card card-support">
              <FiHeadphones className="why-icon" />
              <h3>Suport VIP 24/7</h3>
              <p>Echipa noastră răspunde instant. Aici nu vorbești cu roboți.</p>
            </div>
            <div className="why-card card-secure">
              <FiShield className="why-icon" />
              <h3>Plăți Securizate</h3>
              <p>Criptare SSL de ultimă generație pentru siguranța ta totală.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="reviews-vip-section">
        <div className="container">
          <div className="vip-header">
            <div className="vip-title-box">
              <span className="vip-badge">Social Proof</span>
              <h2>Peste 10.000 de <span>Clienți Fericiți</span></h2>
            </div>
            
            <div className="vip-slider-controls">
              <button onClick={() => scrollSlider(reviewsRef, 'left')}><FiChevronLeft /></button>
              <button onClick={() => scrollSlider(reviewsRef, 'right')}><FiChevronRight /></button>
            </div>
          </div>
          
          <div className="vip-slider-track" ref={reviewsRef}>
            {[
              { id: 1, name: "Marian Tudor", text: "Calitate premium reală. Pachetul a ajuns a doua zi, ambalat impecabil.", img: "11" },
              { id: 2, name: "Elena Vasilescu", text: "Produsele arată exact ca în poze. Recomand cu toată încrederea!", img: "5" },
              { id: 3, name: "Alexandru C.", text: "Suportul clienți e de nota 10. Mi-au răspuns instant la întrebări.", img: "12" },
              { id: 4, name: "Ionuț Dobre", text: "Am căutat mult timp un magazin serios. Mă bucur că v-am găsit.", img: "8" }
            ].map(review => (
              <div key={review.id} className="vip-review-card">
                <div className="vip-card-header">
                  <div className="stars-vip"><FiStar /><FiStar /><FiStar /><FiStar /><FiStar /></div>
                  <div className="verified-badge"><FiCheckCircle /> Verificat</div>
                </div>
                <p className="vip-review-text">"{review.text}"</p>
                <div className="vip-user-info">
                  <img src={`https://i.pravatar.cc/150?img=${review.img}`} alt={review.name} />
                  <div>
                    <strong>{review.name}</strong>
                    <span>Cumpărător Verificat</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 🛡️ WhatsApp dinamic */}
      <a href={`https://wa.me/${numarTelefonSuport}`} target="_blank" rel="noreferrer" className="whatsapp-float-btn">
        <div className="wa-tooltip">Ai o întrebare? Scrie-ne!</div>
        <FaWhatsapp className="wa-icon-bomba" />
      </a>

    </div>
  );
};

export default Home;