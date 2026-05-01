import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiSearch, FiUser, FiMenu, FiX, FiArrowRight } from 'react-icons/fi';
import './Navbar.css';
import React from 'react';

const Navbar = () => {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showSearch, setShowSearch] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [allProducts, setAllProducts] = useState([]); // Toate produsele pentru filtrare rapidă
  const [filtered, setFiltered] = useState([]);
  const navigate = useNavigate();

  // Încărcăm produsele o singură dată pentru căutare instantanee
  useEffect(() => {
    fetch('http://localhost:5000/api/produse')
      .then(res => res.json())
      .then(data => setAllProducts(data))
      .catch(err => console.log(err));
  }, []);

  // Logica de căutare live
  useEffect(() => {
    if (searchTerm.trim().length > 1) {
      const results = allProducts.filter(p => 
        p.nume.toLowerCase().includes(searchTerm.toLowerCase())
      ).slice(0, 5); // Arătăm doar primele 5 sugestii
      setFiltered(results);
    } else {
      setFiltered([]);
    }
  }, [searchTerm, allProducts]);

  const toggleMenu = () => setMenuOpen(!menuOpen);
  
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
      <nav className="navbar">
        <div className="nav-container">
          <Link to="/" className="nav-logo" onClick={() => setShowSearch(false)}>
            SUPER<span>PRODUSE</span>
          </Link>

          <ul className="nav-desktop-links">
            <li><Link to="/">Acasă</Link></li>
            <li><Link to="/shop">Magazin</Link></li>
            <li><Link to="/contact">Contact</Link></li>
          </ul>

          <div className="nav-actions">
            {/* Buton Lupa */}
            <button className="nav-icon-btn" onClick={() => setShowSearch(true)}>
              <FiSearch />
            </button>

            <Link to="/account" className="nav-icon-btn"><FiUser /></Link>
            
            <div className="mobile-toggle" onClick={toggleMenu}>
              <FiMenu />
            </div>
          </div>
        </div>
      </nav>

      {/* =========================================
          🚀 SEARCH OVERLAY (BOMBA)
      ========================================= */}
      <div className={`search-overlay ${showSearch ? 'active' : ''}`}>
        <div className="search-content-container">
          <div className="search-top-row">
            <div className="search-input-wrapper">
              <FiSearch className="inner-search-icon" />
              <input 
                type="text" 
                placeholder="Caută în magazin..." 
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

          {/* REZULTATE LIVE */}
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
                  Vezi toate rezultatele pentru "{searchTerm}"
                </button>
              </div>
            ) : searchTerm.length > 1 ? (
              <p className="no-res-text">Nu am găsit nimic pentru "{searchTerm}"</p>
            ) : (
              <div className="search-hints">
                <p>Încearcă să cauți:</p>
                <div className="hint-tags">
                  <span onClick={() => setSearchTerm('Vopsea')}>#Vopsea</span>
                  <span onClick={() => setSearchTerm('Auto')}>#Auto</span>
                  <span onClick={() => setSearchTerm('Premium')}>#Premium</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* MENIU MOBIL */}
     {/* MENIU MOBIL */}
<div className={`mobile-drawer ${menuOpen ? 'open' : ''}`}>
  {/* Butonul X pentru închidere */}
  <button className="close-mobile-menu" onClick={() => setMenuOpen(false)}>
    <FiX />
  </button>

  <div className="drawer-content">
    <Link to="/" onClick={() => setMenuOpen(false)}>Acasă</Link>
    <Link to="/shop" onClick={() => setMenuOpen(false)}>Magazin</Link>
    <Link to="/contact" onClick={() => setMenuOpen(false)}>Contact</Link>
    <Link to="/account" onClick={() => setMenuOpen(false)}>Contul Meu</Link>
  </div>
</div>
    </>
  );
};

export default Navbar;