import React, { useState, useEffect, useRef } from 'react';
import { FiMail, FiPhoneCall, FiSend, FiCheckCircle, FiAlertCircle } from 'react-icons/fi';
import './Contact.css';

const Contact = () => {
  const [formData, setFormData] = useState({ nume: '', email: '', subiect: '', mesaj: '' });
  const [errors, setErrors] = useState({}); 
  const [isSent, setIsSent] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🛡️ FIX 2: Referință pentru a opri timer-ul "fantomă"
  const timerRef = useRef(null);

  // 🛡️ FIX 1: URL Dinamic
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => { 
    window.scrollTo(0, 0); 
    // Curățăm timer-ul dacă utilizatorul pleacă de pe pagină
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const validateForm = () => {
    let tempErrors = {};
    if (!formData.nume.trim()) tempErrors.nume = "Te rugăm să introduci numele.";
    if (!formData.email.match(/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/)) tempErrors.email = "Adresa de email nu este validă.";
    if (!formData.subiect) tempErrors.subiect = "Selectează un subiect.";
    if (formData.mesaj.length < 10) tempErrors.mesaj = "Mesajul trebuie să aibă măcar 10 caractere.";
    
    setErrors(tempErrors);
    return Object.keys(tempErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return; 

    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        setIsSent(true);
        setFormData({ nume: '', email: '', subiect: '', mesaj: '' });
        setErrors({});
        
        // 🛡️ FIX 2: Salvăm referința timer-ului pentru a o putea opri la nevoie
        timerRef.current = setTimeout(() => setIsSent(false), 5000);
      } else {
        alert("Ne pare rău, dar a apărut o problemă la server. Te rugăm să încerci din nou.");
      }
    } catch (error) {
      alert("Eroare de conexiune la internet. Te rugăm să verifici rețeaua și să încerci din nou.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="contact-page-wrapper">
      <div className="contact-hero">
        <h1>Cum te putem ajuta?</h1>
        <p>Suntem aici pentru tine. Trimite-ne un mesaj și revenim rapid.</p>
      </div>

      <div className="contact-main-container">
        
        <div className="contact-info-grid">
          <div className="info-card">
            <div className="icon-wrapper blue"><FiPhoneCall /></div>
            <h3>Suport</h3>
            {/* Ai grijă să pui numărul tău real aici */}
            <a href="tel:0700000000" className="contact-link">0700 000 000</a> 
          </div>
          <div className="info-card">
            <div className="icon-wrapper green"><FiMail /></div>
            <h3>Email</h3>
            {/* Modifică adresa cu cea de la Merkado */}
            <a href="mailto:contact@merkado.ro" className="contact-link">contact@merkado.ro</a>
          </div>
        </div>

        <div className="contact-form-container">
          {isSent ? (
            <div className="success-message-box fade-in">
              <FiCheckCircle className="success-icon-large" />
              <h3>Mesaj trimis cu succes!</h3>
              <p>Îți vom răspunde în cel mai scurt timp.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="premium-contact-form">
              <div className="form-row">
                <div className={`input-group ${errors.nume ? 'has-error' : ''}`}>
                  <label>Nume complet</label>
                  <input 
                    type="text" 
                    placeholder="Ex: Ion Popescu" 
                    value={formData.nume} 
                    onChange={(e) => {
                      setFormData({...formData, nume: e.target.value});
                      // Șterge eroarea în timp ce scrie
                      if (errors.nume) setErrors({...errors, nume: null});
                    }} 
                    disabled={loading}
                  />
                  {errors.nume && <span className="error-msg"><FiAlertCircle /> {errors.nume}</span>}
                </div>
                <div className={`input-group ${errors.email ? 'has-error' : ''}`}>
                  <label>Email</label>
                  <input 
                    type="email" 
                    placeholder="Ex: ion@email.com" 
                    value={formData.email} 
                    onChange={(e) => {
                      setFormData({...formData, email: e.target.value});
                      if (errors.email) setErrors({...errors, email: null});
                    }} 
                    disabled={loading}
                  />
                  {errors.email && <span className="error-msg"><FiAlertCircle /> {errors.email}</span>}
                </div>
              </div>

              <div className={`input-group ${errors.subiect ? 'has-error' : ''}`}>
                <label>Subiect</label>
                <select 
                  value={formData.subiect} 
                  onChange={(e) => {
                    setFormData({...formData, subiect: e.target.value});
                    if (errors.subiect) setErrors({...errors, subiect: null});
                  }}
                  disabled={loading}
                >
                  <option value="">Alege subiectul...</option>
                  <option value="Comanda">Status Comandă / Retur</option>
                  <option value="Info">Informații Produs</option>
                  <option value="Suport_Tehnic">Suport Tehnic</option>
                  <option value="Altele">Altele</option>
                </select>
                {errors.subiect && <span className="error-msg"><FiAlertCircle /> {errors.subiect}</span>}
              </div>

              <div className={`input-group ${errors.mesaj ? 'has-error' : ''}`}>
                <label>Mesaj</label>
                <textarea 
                  rows="5" 
                  placeholder="Cum te putem ajuta? Oferă-ne cât mai multe detalii..." 
                  value={formData.mesaj} 
                  onChange={(e) => {
                    setFormData({...formData, mesaj: e.target.value});
                    if (errors.mesaj) setErrors({...errors, mesaj: null});
                  }}
                  disabled={loading}
                ></textarea>
                {errors.mesaj && <span className="error-msg"><FiAlertCircle /> {errors.mesaj}</span>}
              </div>

              <button type="submit" className="btn-send-message" disabled={loading}>
                {loading ? "SE TRIMITE..." : <><FiSend /> TRIMITE MESAJUL</>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default Contact;