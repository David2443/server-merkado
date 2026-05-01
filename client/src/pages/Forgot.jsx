import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { FiMail, FiCheckCircle, FiAlertCircle, FiArrowLeft, FiSend } from 'react-icons/fi';
import './Account.css'; 
const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [msg, setMsg] = useState({ tip: '', text: '' });
  const [loading, setLoading] = useState(false);

  // 🛡️ FIX 1: URL Dinamic
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMsg({ tip: '', text: '' });

    try {
      const res = await fetch(`${API_URL}/api/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();

      if (res.ok) {
        setMsg({ tip: 'succes', text: data.mesaj });
        setEmail(''); 
      } else {
        setMsg({ tip: 'eroare', text: data.eroare || "A apărut o problemă." });
      }
    } catch (err) {
      setMsg({ tip: 'eroare', text: "Eroare de conexiune la server." });
    } finally {
      setLoading(false);
    }
  };

  // 🛡️ Variabilă utilă pentru a ști dacă am trimis deja mailul
  const esteTrimis = msg.tip === 'succes';

  return (
    <div className="account-auth-page">
      <div className="auth-card-premium">
        <Link to="/account" className="btn-back-dash" style={{ marginBottom: '20px' }}>
          <FiArrowLeft /> Înapoi la logare
        </Link>
        
        <h2>Recuperare Parolă 🔐</h2>
        <p className="auth-subtitle">
          {esteTrimis 
            ? "Verifică-ți inbox-ul (și folderul Spam) pentru link-ul de resetare." 
            : "Introdu adresa de email și îți vom trimite un link securizat pentru a-ți alege o parolă nouă."}
        </p>

        {msg.text && (
          <div className={`server-alert ${msg.tip}`}>
            {esteTrimis ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{msg.text}</span>
          </div>
        )}

        {/* 🛡️ FIX 2: Ascundem formularul complet dacă mailul a fost trimis cu succes */}
        {!esteTrimis && (
          <form onSubmit={handleSubmit} className="auth-form-premium">
            <div className="input-box-premium">
              <FiMail className="icon" />
              <input 
                type="email" 
                placeholder="Adresa ta de email" 
                required 
                value={email} 
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
              />
            </div>
            
            <button type="submit" className="btn-auth-premium" disabled={loading || !email}>
              {loading ? "SE TRIMITE..." : "TRIMITE LINK"}
              {!loading && <FiSend />}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ForgotPassword;