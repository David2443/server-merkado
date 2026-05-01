import { useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { 
  FiX, FiActivity, FiDollarSign, FiBox, FiPlusSquare, 
  FiStar, FiUsers, FiLogOut, FiTruck, FiTrendingUp, FiTarget 
} from 'react-icons/fi';
import './Admin.css';
import React from 'react';


// Importăm piesele noastre
import Dashboard from './Dashboard';
import Finante from './Finante'; 
import AdsOptimizer from './AdsOptimizer'; 
import Comenzi from './Comenzi'; 
import GestiuneProduse from './GestiuneProduse';
import ConstructorProdus from './ConstructorProdus';
import Recenzii from './Recenzii';
import Clienti from './Clienti';
import AdminTransport from './AdminTransport'; 

const Admin = () => {
  const token = localStorage.getItem('adminToken');
  const [tabActiv, setTabActiv] = useState('dashboard');
  const [idDeEditat, setIdDeEditat] = useState(null); 
  const [meniuDeschis, setMeniuDeschis] = useState(false);
  
  // 🛡️ FIX 2: Folosim useNavigate pentru performanță
  const navigate = useNavigate();

  // Dacă nu are token de admin, îl trimitem afară din start
  if (!token) return <Navigate to="/admin/login" replace />;

  const handleLogout = () => {
    localStorage.removeItem('adminToken');
    // Navigare curată, stil React
    navigate('/admin/login');
  };

  const mergiLaEditare = (produs) => {
    setIdDeEditat(produs._id); 
    setTabActiv('adauga'); 
  };

  const mergiLaCreareNoua = () => {
    setIdDeEditat(null); 
    setTabActiv('adauga');
    setMeniuDeschis(false);
  };

  return (
    <div className="admin-layout">
      
      {/* HEADER MOBIL */}
      <div className="mobile-nav-header">
        <div className="mobile-logo">
          <h2>Super <span>Admin</span></h2>
        </div>
        <button className="hamburger-btn" onClick={() => setMeniuDeschis(true)}>
          ☰
        </button>
      </div>

      {/* OVERLAY MOBIL */}
      <div 
        className={`mobile-overlay ${meniuDeschis ? 'open' : ''}`} 
        onClick={() => setMeniuDeschis(false)}
      ></div>

      {/* MENIUL DIN STÂNGA */}
      <aside className={`admin-sidebar ${meniuDeschis ? 'open' : ''}`}>
        <div className="admin-logo" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2>Super <span>Admin</span></h2>
          <button className="close-menu-btn" onClick={() => setMeniuDeschis(false)}>
            <FiX />
          </button>
        </div>
        
        <nav className="admin-nav">
          <button className={`nav-btn ${tabActiv === 'dashboard' ? 'activ' : ''}`} onClick={() => { setTabActiv('dashboard'); setMeniuDeschis(false); }}>
            <FiActivity /> Analitice
          </button>

        
          
          <button id="buton-meniu-comenzi" className={`nav-btn ${tabActiv === 'comenzi' ? 'activ' : ''}`} onClick={() => { setTabActiv('comenzi'); setMeniuDeschis(false); }}>
            <FiDollarSign /> Comenzi
          </button>
          
          <button className={`nav-btn ${tabActiv === 'gestiune' ? 'activ' : ''}`} onClick={() => { setTabActiv('gestiune'); setMeniuDeschis(false); }}>
            <FiBox /> Produse
          </button>
          
          <button className={`nav-btn ${tabActiv === 'adauga' ? 'activ' : ''}`} onClick={mergiLaCreareNoua}>
            <FiPlusSquare /> Adaugă Produs
          </button>
          
          <button className={`nav-btn ${tabActiv === 'recenzii' ? 'activ' : ''}`} onClick={() => { setTabActiv('recenzii'); setMeniuDeschis(false); }}>
            <FiStar /> Recenzii
          </button>
          
          <button className={`nav-btn ${tabActiv === 'clienti' ? 'activ' : ''}`} onClick={() => { setTabActiv('clienti'); setMeniuDeschis(false); }}>
            <FiUsers /> Clienți & Mesaje
          </button>
          
          <button className={`nav-btn ${tabActiv === 'transport' ? 'activ' : ''}`} onClick={() => { setTabActiv('transport'); setMeniuDeschis(false); }}>
            <FiTruck /> Setări Transport
          </button>
          
          <button className="nav-btn" onClick={handleLogout} style={{marginTop: 'auto', borderTop: '1px solid #1e293b', borderRadius: '0', color: '#ef4444'}}>
            <FiLogOut /> Deconectare
          </button>
        </nav>
      </aside>

      {/* ZONA CENTRALĂ CARE SE SCHIMBĂ */}
      <main className="admin-content">
        {tabActiv === 'dashboard' && <Dashboard token={token} />}

        {tabActiv === 'finante' && <Finante token={token} />}

        {tabActiv === 'ads' && <AdsOptimizer token={token} />}
        
        {tabActiv === 'comenzi' && <Comenzi token={token} />}
        
        {tabActiv === 'gestiune' && <GestiuneProduse token={token} onEdit={mergiLaEditare} />}
        
        {tabActiv === 'adauga' && (
          <ConstructorProdus 
            token={token} 
            idProdus={idDeEditat} 
            inapoiLaGestiune={() => {
              setIdDeEditat(null); 
              setTabActiv('gestiune'); 
            }} 
          />
        )}
        
        {tabActiv === 'recenzii' && <Recenzii token={token} />}
        
        {tabActiv === 'clienti' && <Clienti token={token} />}
        
        {tabActiv === 'transport' && <AdminTransport token={token} />}
      </main>

    </div>
  );
};

export default Admin;