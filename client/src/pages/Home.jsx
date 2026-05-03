import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiMonitor, FiHome, FiTool, FiShoppingCart, FiStar, FiHeart, FiShield, FiAward, 
  FiHeadphones, FiChevronLeft, FiChevronRight, FiTrendingUp, 
  FiTruck, FiCheckCircle, FiPlayCircle, FiPlus, FiMinus, FiArrowRight
} from 'react-icons/fi';
import { FaWhatsapp } from 'react-icons/fa';
import './Home.css';
import React from 'react';

const Home = () => {
  const navigate = useNavigate();
  const [produse, setProduse] = useState([]);
  const [timeLeft, setTimeLeft] = useState(13500); 
  const [activeFaq, setActiveFaq] = useState(null);

  const productsRef = useRef(null);
  const reviewsRef = useRef(null);
  const categoriesRef = useRef(null);

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
    e.preventDefault();
    e.stopPropagation(); 
    console.log("Produs adăugat în coș:", produsId);
  };

  const toggleFaq = (index) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="general-ecom-wrapper">
      
      {/* 🚨 1. BARA DE PANICĂ */}
      <div className="top-panic-bar">
        <div className="panic-content">
          <span className="pulse-dot"></span>
          <p>🔥 <strong>FLASH SALE:</strong> Transport Gratuit pentru comenzile de peste 200 Lei!</p>
        </div>
        <div className="panic-timer">
          Expiră în: <span>{formatTime(timeLeft)}</span>
        </div>
      </div>

    {/* 🚀 2. HERO SECTION (MERKADO ELITE LAYOUT) */}
<section className="hero-split-section">
  <div className="hero-container-premium hero-split-grid">
    <div className="hero-left">
      <div className="badge-exclusive">
        <FiTrendingUp /> <span>CALITATE PREMIUM GARANTATĂ</span>
      </div>
      <h1 className="hero-mega-title">
        Tot ce îți dorești,<br />
        <span>Într-un singur loc.</span>
      </h1>
      <p className="hero-mega-desc">
        Descoperă universul MERKADO: selecții riguroase de produse, prețuri imbatabile și o experiență de shopping creată special pentru tine. 
      </p>
      
      <div className="hero-actions-row">
        <a href="#produse" className="btn-shop-mega">
          Explorează Magazinul <FiArrowRight />
        </a>
        
        <div className="hero-social-proof">
          <div className="avatars-group">
            <img src="https://i.pravatar.cc/100?img=12" alt="user" />
            <img src="https://i.pravatar.cc/100?img=45" alt="user" />
            <img src="https://i.pravatar.cc/100?img=33" alt="user" />
            <div className="avatar-plus">+10k</div>
          </div>
          <div className="proof-text">
            <div className="stars-ecom"><FiStar/><FiStar/><FiStar/><FiStar/><FiStar/></div>
            <span>Clienți Fericiți</span>
          </div>
        </div>
      </div>
    </div>

    <div className="hero-right">
      <div className="hero-image-composition">
        {/* Imagine noua: Setup modern, curat, care sugerează calitate */}
        <img 
          src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?q=80&w=1200&auto=format&fit=crop" 
          alt="Premium Gadget Merkado" 
          className="main-hero-img"
        />
        
        {/* Card plutitor nou: LIVRARE FULGER */}
        <div className="floating-benefit-card">
          <div className="benefit-icon-circle">
            <FiTruck />
          </div>
          <div className="benefit-info">
            <strong>Livrare Fulger</strong>
            <p>24h în toată țara</p>
          </div>
        </div>

        {/* Al doilea element: Mesaj de încredere */}
        <div className="trust-mini-tag">
          <FiShield /> Plată 100% Securizată
        </div>
      </div>
    </div>
  </div>
</section>

      {/* 🏁 3. BANDA DE AUTORITATE */}
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

  {/* 🏷️ NOU: 4. GRILA VIZUALĂ DE CATEGORII (PREMIUM) */}
      <section className="categories-visual-section">
        <div className="cat-container-premium">
          <div className="section-header-center">
            <h2>Explorează pe <span>Categorii</span></h2>
            <p>Găsește exact ceea ce cauți, rapid și ușor.</p>
          </div>
          
          <div className="categories-grid">
            
            {/* CATEGORIA 1: AUTO */}
            <div className="category-card" onClick={() => navigate('/shop?cat=Auto')}>
              <img src="https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&q=80&w=800" alt="Auto & Moto" />
              <div className="cat-overlay">
                <div className="cat-icon-glass"><FiTool /></div>
                <h3>Auto & Moto</h3>
                <span className="cat-link">Vezi Produsele &rarr;</span>
              </div>
            </div>

            {/* CATEGORIA 2: CASĂ */}
            <div className="category-card" onClick={() => navigate('/shop?cat=Casa')}>
              <img src="https://images.unsplash.com/photo-1618221195710-dd6b41faaea6?auto=format&fit=crop&q=80&w=800" alt="Casă & Grădină" />
              <div className="cat-overlay">
                <div className="cat-icon-glass"><FiHome /></div>
                <h3>Casă & Grădină</h3>
                <span className="cat-link">Vezi Produsele &rarr;</span>
              </div>
            </div>

            {/* CATEGORIA 3: ELECTRONICE */}
            <div className="category-card" onClick={() => navigate('/shop?cat=Electronice')}>
              <img src="https://images.unsplash.com/photo-1498049794561-7780e7231661?auto=format&fit=crop&q=80&w=800" alt="Electronice" />
              <div className="cat-overlay">
                <div className="cat-icon-glass"><FiMonitor /></div>
                <h3>Electronice</h3>
                <span className="cat-link">Vezi Produsele &rarr;</span>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* 📦 5. TOP VÂNZĂRI (Slider) */}
      <section id="produse-noi" className="products-premium-section">
        <div className="container">
          <div className="products-header-modern">
            <div>
               <span className="products-badge">Oferta Zilei</span>
               <h2>Top Vânzări <span>Săptămâna Asta</span></h2>
            </div>
            <div className="slider-arrows-desktop">
              <button onClick={() => scrollSlider(productsRef, 'left')} className="arrow-btn"><FiChevronLeft /></button>
              <button onClick={() => scrollSlider(productsRef, 'right')} className="arrow-btn"><FiChevronRight /></button>
            </div>
          </div>

          <div className="premium-scroll-wrapper" ref={productsRef}>
            {produse.length === 0 ? (
              [1, 2, 3, 4].map((n) => (
                <div key={n} className="skeleton-card">
                  <div className="skeleton-img"></div>
                  <div className="skeleton-line title"></div>
                  <div className="skeleton-line price"></div>
                </div>
              ))
            ) : (
              produse.slice(0, 6).map(produs => (
                <div key={produs._id} className="premium-card-scroll" onClick={() => navigate(`/produs/${produs._id}`)}>
                  <div className="premium-img-box">
                    <img src={produs.imaginePrincipala || 'https://via.placeholder.com/300x300'} alt={produs.nume} loading="lazy" />
                    <div className="badge-discount">🔥 TOP</div>
                  </div>
                  <div className="premium-card-body">
                    <h3 className="premium-title">{produs.nume}</h3>
                    <div className="price-row-mini">
                      <div>
                        <span className="price-new">{produs.pret} Lei</span>
                        {produs.pretVechi && <span className="price-old">{produs.pretVechi} Lei</span>}
                      </div>
                      <button type="button" className="add-to-cart-mini" onClick={(e) => handleAddToCart(e, produs._id)}>
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

      {/* 🌟 NOU: 6. PRODUSUL EROU (Spotlight) */}
      <section className="product-spotlight-section">
        <div className="container spotlight-grid">
          <div className="spotlight-content">
            <span className="spotlight-badge">Alegerea Editorului</span>
            <h2>Performanță dusă la <span>extrem.</span></h2>
            <p>Descoperă produsul care a revoluționat piața luna aceasta. Stocul este extrem de limitat datorită cererii masive pe TikTok.</p>
            <ul className="spotlight-features">
              <li><FiCheckCircle className="feat-icon"/> Materiale Premium Ultra-Rezistente</li>
              <li><FiCheckCircle className="feat-icon"/> Design Ergonomic Inovator</li>
              <li><FiCheckCircle className="feat-icon"/> Garanție Extinsă 24 Luni</li>
            </ul>
            <button className="btn-spotlight" onClick={() => navigate('/shop')}>
              Prinde Oferta Acum
            </button>
          </div>
          <div className="spotlight-visual">
             <div className="video-mockup-wrapper">
                <img src="https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=800" alt="Spotlight" className="spotlight-img"/>
                <div className="play-button-overlay">
                   <FiPlayCircle />
                </div>
             </div>
          </div>
        </div>
      </section>

      {/* 🧩 7. AVANTAJE (Bento Grid) */}
      <section className="why-bomba-section">
        <div className="container">
          <div className="section-header-center">
            <span className="why-badge">Avantajele Tale</span>
            <h2>De ce suntem <span>alegerea numărul 1?</span></h2>
          </div>
          <div className="why-bento-grid">
            <div className="why-card card-delivery">
              <FiTruck className="why-icon" />
              <div className="why-big-number">24/48h</div>
              <h3>Livrare Fulger</h3>
              <p>Comenzile plasate până în ora 15:00 pleacă în aceeași zi.</p>
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


      {/* ⭐ 9. WALL OF LOVE (VIP REVIEWS) */}
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

      {/* ❓ NOU: 10. FAQ SECTION */}
      <section className="faq-section">
         <div className="container faq-container">
            <div className="faq-text-side">
               <h2>Ai întrebări?<br/><span>Avem răspunsuri.</span></h2>
               <p>Nu găsești ce cauți? Scrie-ne direct pe WhatsApp și rezolvăm instant.</p>
               <a href={`https://wa.me/${numarTelefonSuport}`} target="_blank" rel="noreferrer" className="btn-faq-wa">
                 <FaWhatsapp /> Contactează-ne
               </a>
            </div>
            <div className="faq-accordion-side">
               {[
                 { q: "Cât durează livrarea?", a: "Toate comenzile confirmate până în ora 15:00 sunt expediate în aceeași zi și ajung la tine în 24-48 de ore lucrătoare." },
                 { q: "Pot returna produsul dacă nu îmi place?", a: "Absolut! Ai 14 zile la dispoziție să returnezi orice produs, fără întrebări suplimentare." },
                 { q: "Oferiți garanție?", a: "Da, toate produsele noastre electronice beneficiază de 24 de luni garanție comercială." }
               ].map((item, idx) => (
                  <div key={idx} className={`faq-item ${activeFaq === idx ? 'active' : ''}`} onClick={() => toggleFaq(idx)}>
                     <div className="faq-question">
                        <h4>{item.q}</h4>
                        {activeFaq === idx ? <FiMinus className="faq-icon" /> : <FiPlus className="faq-icon" />}
                     </div>
                     <div className="faq-answer">
                        <p>{item.a}</p>
                     </div>
                  </div>
               ))}
            </div>
         </div>
      </section>

      {/* 🛡️ 11. WhatsApp FLOAT */}
      <a href={`https://wa.me/${numarTelefonSuport}`} target="_blank" rel="noreferrer" className="whatsapp-float-btn">
        <div className="wa-tooltip">Ai o întrebare? Scrie-ne!</div>
        <FaWhatsapp className="wa-icon-bomba" />
      </a>

    </div>
  );
};

export default Home;