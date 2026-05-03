import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import './Navbar.css';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    fetch(`${API_URL}/api/produse`)
      .then(res => res.json())
      .then(data => {
        if (Array.isArray(data)) {
          setAllProducts(data);
        } else {
          setAllProducts([]);
        }
      })
      .catch(err => console.error("Eroare la aducerea produselor pentru search:", err));
  }, [API_URL]);

  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const results = allProducts.filter(p => 
        p.nume && p.nume.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5);
      setFiltered(results);
    } else {
      setFiltered([]);
    }
  }, [searchTerm, allProducts]);

  const handleResultClick = (id) => {
    navigate(`/produs/${id}`);
    setShowSearch(false);
    setSearchTerm('');
  };

  const goToShop = (e) => {
    if (e) e.preventDefault();
    navigate(`/shop?search=${searchTerm}`);
    setShowSearch(false);
    setSearchTerm('');
  };

  return (
    <>
     <nav className="navbar-merkado-pro">
        <div className="nav-container-pro">
          
          <Link to="/" className="brand-logo-pro" onClick={() => setShowSearch(false)}>
            MERK<span>ADO</span>
          </Link>

          <ul className="desktop-links-pro">
            <li><Link to="/">Acasă</Link></li>
            <li><Link to="/shop">Magazin</Link></li>
            {/* 👉 Butonul Adăugat */}
            <li><Link to="/about">Despre Noi</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

          <div className="nav-actions-pro">
            <button className="icon-btn-pro" onClick={() => setShowSearch(true)}>
              <FiSearch />
            </button>
            <Link to="/account" className="icon-btn-pro desktop-only-pro"><FiUser /></Link>
            
            <button className="mobile-toggle-pro" onClick={() => setMenuOpen(true)}>
              <FiMenu />
            </button>
          </div>
        </div>
      </nav>

      {/* =========================================
          🚀 SEARCH OVERLAY
      ========================================= */}
      <div className={`search-overlay ${showSearch ? 'active' : ''}`}>
        <div className="search-content-container">
          <div className="search-top-row">
            <div className="search-input-wrapper">
              <FiSearch className="inner-search-icon" />
              <input 
                type="text" 
                placeholder="Caută produse..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && goToShop()}
                autoFocus
              />
            </div>
            <button className="close-search" onClick={() => {setShowSearch(false); setSearchTerm('');}}>
              <FiX /> <span>Închide</span>
            </button>
          </div>

          <div className="search-results-wrapper">
            {filtered.length > 0 ? (
              <div className="live-results">
                <p className="results-label">Sugestii produse:</p>
                {filtered.map(p => (
                  <div key={p._id} className="search-result-item" onClick={() => handleResultClick(p._id)}>
                    <img src={p.imaginePrincipala} alt={p.nume} />
                    <div className="res-info">
                      <span className="res-name">{p.nume}</span>
                      <span className="res-price">{p.pret} Lei</span>
                    </div>
                    <FiArrowRight className="res-arrow" />
                  </div>
                ))}
                <button className="view-all-res" onClick={goToShop}>
                  Vezi toate rezultatele
                </button>
              </div>
            ) : searchTerm.length > 1 ? (
              <p className="no-res-text">Nu am găsit nimic pentru "{searchTerm}"</p>
            ) : null}
          </div>
        </div>
      </div>

      {/* =========================================
          📱 MENIU MOBIL LATERAL (BURGER)
      ========================================= */}
      <div 
        className={`mobile-menu-overlay ${menuOpen ? 'active' : ''}`} 
        onClick={() => setMenuOpen(false)}
      ></div>

      <div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
        <div className="drawer-header">
          <div className="nav-logo">MERK<span>ADO</span></div>
          <button className="close-drawer-btn" onClick={() => setMenuOpen(false)}>
            <FiX />
          </button>
        </div>

        <div className="drawer-links">
          <Link to="/" onClick={() => setMenuOpen(false)}>Acasă <FiArrowRight /></Link>
          <Link to="/shop" onClick={() => setMenuOpen(false)}>Magazin <FiArrowRight /></Link>
          {/* 👉 Butonul Adăugat și aici */}
          <Link to="/about" onClick={() => setMenuOpen(false)}>Despre Noi <FiArrowRight /></Link>
          <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact <FiArrowRight /></Link>
          <div className="drawer-divider"></div>
          <Link to="/account" className="drawer-account" onClick={() => setMenuOpen(false)}>
            <FiUser /> Contul Meu
          </Link>
        </div>
      </div>
    </>
  );
};

export default Navbar;