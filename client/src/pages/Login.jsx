import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiAlertCircle, FiUser, FiLock } from 'react-icons/fi';
import './Admin.css'; 
import React from 'react';
const Login = () => {
  const [email, setEmail] = useState(''); // 👈 ADĂUGAT: Email-ul adminului
  const [parola, setParola] = useState('');
  const [eroare, setEroare] = useState('');
  const [isLoading, setIsLoading] = useState(false); 
  const navigate = useNavigate();

// ✅ FRONTEND CALIBRAT
const handleLogin = async (e) => {
  e.preventDefault();
  if (!email || !parola) return; 

  setEroare('');
  setIsLoading(true); 
  
  try {
    // Ne asigurăm că batem la ușa de /api/admin/login
    const apiUrl = import.meta.env.VITE_API_URL || 'https://merkado-backend.onrender.com';
    
    const res = await fetch(`${apiUrl}/api/admin/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, parola }) // Trimitem ambele date
    });
    
    const data = await res.json();
    
    if (res.ok && data.success) {
      // Salvăm token-ul
      localStorage.setItem('adminToken', data.token);
      // Navigăm spre admin
      navigate('/admin'); 
    } else {
      setEroare(data.eroare || "Date de autentificare incorecte!");
      setParola(''); 
    }
  } catch (err) {
    setEroare("Eroare critică de conexiune la server.");
  } finally {
    setIsLoading(false); 
  }
};

  return (
    <div className="login-screen-wrapper">
      <div className="login-box fade-in">
        <div className="login-logo">
          <FiAlertCircle style={{ fontSize: '3rem', color: '#3b82f6', margin: '0 auto 10px' }} />
          <h2>ZONĂ RESTRICȚIONATĂ</h2>
          <p>Server Criptat pe 256-bit</p>
        </div>
        
        <form onSubmit={handleLogin} className="login-form">
          {/* 🛡️ ADĂUGAT CÂMPUL DE EMAIL */}
          <div className="input-group">
            <FiUser className="input-icon" style={{ position: 'absolute', margin: '12px', color: '#94a3b8' }} />
            <input 
              type="email" 
              placeholder="Email Administrator" 
              value={email} 
              onChange={(e) => setEmail(e.target.value)} 
              autoFocus 
              disabled={isLoading} 
              style={{ paddingLeft: '40px' }} // Spațiu pentru iconiță
            />
          </div>

          <div className="input-group" style={{ position: 'relative', marginTop: '15px' }}>
            <FiLock className="input-icon" style={{ position: 'absolute', margin: '12px', color: '#94a3b8' }} />
            <input 
              type="password" 
              placeholder="Parolă Administrator" 
              value={parola} 
              onChange={(e) => setParola(e.target.value)} 
              disabled={isLoading} 
              style={{ paddingLeft: '40px' }}
            />
          </div>

          {eroare && <p className="login-error" style={{ color: '#ef4444', marginTop: '10px', textAlign: 'center', fontWeight: 'bold' }}>{eroare}</p>}
          
          <button 
            type="submit" 
            className="btn-login" 
            disabled={isLoading || !email || !parola} 
            style={{ marginTop: '20px', width: '100%' }}
          >
            {isLoading ? 'VERIFICARE SECURITATE...' : 'AUTENTIFICARE SECURE 🔒'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Login;