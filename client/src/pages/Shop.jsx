import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async'; // 🛡️ Importul pentru SEO
import { FiSearch, FiFilter, FiChevronDown, FiStar, FiShoppingCart, FiHeart, FiEye } from 'react-icons/fi';
import './Shop.css';

const Shop = () => {
  const navigate = useNavigate();
  const [produse, setProduse] = useState([]);
  const [filteredProduse, setFilteredProduse] = useState([]);
  
  // 🛡️ FIX 2: State pentru timpul de așteptare al datelor
  const [isLoading, setIsLoading] = useState(true); 
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('Toate');
  const [sort, setSort] = useState('newest');
// 🔥 Memorie pentru categoriile extrase automat din baza de date
  const [categoriiDisponibile, setCategoriiDisponibile] = useState(['Toate']);
  // 🛡️ FIX 1: URL Dinamic (Citește din fișierul tău .env din frontend)
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true); // Începem încărcarea
    
    fetch(`${API_URL}/api/produse`)
      .then(res => res.json())
      .then(data => {
        setProduse(data);
        setFilteredProduse(data);
        
        // 🔥 MAGIA: Extragem categoriile reale, dar EXCLUDEM orice variantă de "Toate" venită din baza de date ca să nu se dubleze!
        const categoriiReale = data
          .map(p => p.categorie)
          .filter(cat => cat && cat.toLowerCase() !== 'toate' && cat.toLowerCase() !== 'toate categoriile');
          
        const categoriiUnice = ["Toate", ...new Set(categoriiReale)];
        setCategoriiDisponibile(categoriiUnice);
        
        setIsLoading(false); 
      })
      .catch(err => {
        console.error("Eroare la încărcare shop:", err);
        setIsLoading(false); // Oprim încărcarea chiar și la eroare, să nu rămână blocat
      });
  }, [API_URL]);

  // Logica de filtrare și căutare rămâne la fel (e foarte bună)
  useEffect(() => {
    let temp = [...produse];

    if (search) {
      temp = temp.filter(p => p.nume.toLowerCase().includes(search.toLowerCase()));
    }

    if (category !== 'Toate') {
      temp = temp.filter(p => p.categorie === category);
    }

    if (sort === 'price-asc') temp.sort((a, b) => a.pret - b.pret);
    if (sort === 'price-desc') temp.sort((a, b) => b.pret - a.pret);

    setFilteredProduse(temp);
  }, [search, category, sort, produse]);

  const handleAddToCart = (e, id) => {
    e.stopPropagation(); 
    console.log("Adăugat în coș din Shop:", id);
    // Aici vine logica ta de Context/Redux pentru coș
  };

  // 🚀 Pregătim datele pentru Schema.org (Google ItemList)
  // Luăm doar primele 15 ca să nu încărcăm excesiv codul sursă pentru roboții Google
  const schemaItemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    "itemListElement": filteredProduse.slice(0, 15).map((produs, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "url": `${window.location.origin}/produs/${produs.slug || produs._id}`,
      "name": produs.nume,
      "image": produs.imaginePrincipala
    }))
  };

  return (
    <div className="shop-page-wrapper">
      
      {/* 🚀 SEO BLOCK INCEPE AICI */}
      <Helmet>
        <title>Magazin MERKADO | Catalog Produse Premium & Oferte</title>
        <meta name="description" content="Explorează catalogul MERKADO. Cele mai noi produse premium din categoriile Auto, Casă, Electronice și Sport la prețuri excelente. Livrare 24h!" />
        <link rel="canonical" href={`${window.location.origin}/shop`} />
        
        {/* Open Graph pentru Share-uri pe rețele sociale */}
        <meta property="og:title" content="Magazin MERKADO | Catalog Produse Premium" />
        <meta property="og:description" content="Răsfoiește sute de produse cu livrare rapidă. Găsește exact ce ai nevoie la MERKADO." />
        <meta property="og:type" content="website" />
        <meta property="og:url" content={`${window.location.origin}/shop`} />
        
        {/* Injectăm lista de produse către Google */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify(schemaItemList)
        }}></script>
      </Helmet>
      {/* 🚀 SEO BLOCK SE TERMINA AICI */}

      <section className="shop-hero">
        <div className="container">
          <h1>Catalog Produse</h1>
          <p>Explorează colecția noastră de produse premium, selectate pentru performanță și stil.</p>
        </div>
      </section>

      <div className="container">
        <div className="shop-toolbar">
          <div className="search-box">
            <FiSearch className="search-icon" />
            <input 
              type="text" 
              placeholder="Ce cauți astăzi?" 
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="filter-group">
            <div className="filter-item">
              <FiFilter />
             <select value={category} onChange={(e) => setCategory(e.target.value)}>
                {categoriiDisponibile.map(cat => (
                  <option key={cat} value={cat}>
                    {cat === 'Toate' ? 'Toate Categoriile' : cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="filter-item">
              <FiChevronDown />
              <select value={sort} onChange={(e) => setSort(e.target.value)}>
                <option value="newest">Cele mai noi</option>
                <option value="price-asc">Preț: Mic → Mare</option>
                <option value="price-desc">Preț: Mare → Mic</option>
              </select>
            </div>
          </div>
        </div>

        <main className="shop-main-content">
          <div className="results-info">
            <p>Am găsit <span>{filteredProduse.length}</span> produse pentru tine</p>
          </div>

          <div className="shop-products-grid">
            {/* 🛡️ APLICĂM LOGICA DE AFIȘARE CORECTĂ */}
            {isLoading ? (
              <div className="loading-spinner">
                <h2>Se aduc produsele...</h2>
                {/* Aici poți pune un CSS Spinner fain */}
              </div>
            ) : filteredProduse.length > 0 ? (
              filteredProduse.map(produs => (
                <div 
                  key={produs._id} 
                  className="shop-card"
                  onClick={() => navigate(`/produs/${produs.slug || produs._id}`)}
                >
                  <div className="shop-card-img">
                    {/* 🛡️ SEO FIX: loading="lazy" și Alt-uri descriptive */}
                    <img 
                      src={produs.imaginePrincipala} 
                      alt={`Cumpără ${produs.nume} - Magazin Merkado`} 
                      loading="lazy" 
                    />
                    {produs.pretVechi && <div className="shop-badge">OFERTĂ</div>}
                    <button className="shop-wishlist" onClick={(e) => e.stopPropagation()} aria-label="Adaugă la favorite">
                      <FiHeart />
                    </button>
                  </div>
                  
                  <div className="shop-card-body">
                    <span className="shop-cat-label">{produs.categorie}</span>
                    <h3>{produs.nume}</h3>
                    
                    <div className="shop-rating">
                      <FiStar className="star-f" /><FiStar className="star-f" /><FiStar className="star-f" /><FiStar className="star-f" /><FiStar className="star-f" />
                      <small>(4.9)</small>
                    </div>
                    
                    <div className="shop-price-box">
                      <div className="shop-prices">
                        {produs.pretVechi && <span className="old">{produs.pretVechi} Lei</span>}
                        <span className="current">{produs.pret} Lei</span>
                      </div>
                      
                      <button 
                        className="shop-cart-btn" 
                        onClick={(e) => handleAddToCart(e, produs._id)}
                        aria-label={`Adaugă ${produs.nume} în coș`}
                      >
                        <FiShoppingCart />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="no-results">
                <FiSearch size={50} opacity={0.2} />
                <h2>Niciun rezultat găsit</h2>
                <p>Nu am găsit produse care să se potrivească filtrelor tale.</p>
                <button onClick={() => {setSearch(''); setCategory('Toate')}} className="btn-reset">
                  Resetează Filtrele
                </button>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default Shop;