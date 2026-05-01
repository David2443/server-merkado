import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { FiLock, FiCheckCircle, FiAlertCircle, FiSave } from 'react-icons/fi';
import './Account.css';
const ResetPassword = () => {
  const { token } = useParams(); 
  const navigate = useNavigate();
  
  const [parola, setParola] = useState('');
  const [confirmaParola, setConfirmaParola] = useState('');
  const [msg, setMsg] = useState({ tip: '', text: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // 🛡️ FIX 1: Oprim direct din browser parolele prea scurte
    if (parola.length < 6) {
      setMsg({ tip: 'eroare', text: "Parola trebuie să aibă minim 6 caractere!" });
      return;
    }

    if (parola !== confirmaParola) {
      setMsg({ tip: 'eroare', text: "Parolele nu se potrivesc!" });
      return;
    }

    setLoading(true);
    setMsg({ tip: '', text: '' });

    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/reset-password/${token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ parola })
      });

      const data = await res.json();

      if (res.ok) {
        setMsg({ tip: 'succes', text: data.mesaj });
        setTimeout(() => navigate('/account'), 3000); 
      } else {
        setMsg({ tip: 'eroare', text: data.eroare || "Eroare la resetare." });
      }
    } catch (err) {
      setMsg({ tip: 'eroare', text: "Eroare de conexiune la server." });
    } finally {
      // Oprim loading-ul doar dacă NU a fost un succes (dacă a fost succes, lăsăm butonul blocat)
      if (msg.tip !== 'succes') {
          setLoading(false);
      }
    }
  };

  return (
    <div className="account-auth-page">
      <div className="auth-card-premium">
        <h2>Alege o nouă parolă 🛡️</h2>
        <p className="auth-subtitle">Asigură-te că folosești o parolă puternică pe care să nu o uiți din nou.</p>

        {msg.text && (
          <div className={`server-alert ${msg.tip}`}>
            {msg.tip === 'succes' ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{msg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-premium">
          <div className="input-box-premium">
            <FiLock className="icon" />
            <input 
              type="password" placeholder="Parolă Nouă" required 
              value={parola} onChange={(e) => setParola(e.target.value)}
            />
          </div>
          <div className="input-box-premium">
            <FiLock className="icon" />
            <input 
              type="password" placeholder="Confirmă Parola Nouă" required 
              value={confirmaParola} onChange={(e) => setConfirmaParola(e.target.value)}
            />
          </div>
          
          {/* 🛡️ FIX 2: Blocăm butonul și în timpul loading-ului, și CÂND mesajul e de succes */}
          <button 
            type="submit" 
            className="btn-auth-premium" 
            disabled={loading || msg.tip === 'succes'}
          >
            {loading ? "SE SALVEAZĂ..." : msg.tip === 'succes' ? "SALVAT!" : "SALVEAZĂ PAROLA"}
            {!loading && msg.tip !== 'succes' && <FiSave />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ResetPassword;