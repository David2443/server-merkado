import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  FiMail, FiLock, FiUser, FiAlertCircle, FiCheckCircle, 
  FiArrowRight, FiLogOut, FiPackage, FiSettings, FiChevronLeft, FiSave 
} from 'react-icons/fi';
import './Account.css';

const Account = () => {
  const navigate = useNavigate();
  const [isLoggedIn, setIsLoggedIn] = useState(!!localStorage.getItem('token'));
  const [activeView, setActiveView] = useState('dashboard'); 
  
  const [userData, setUserData] = useState({ nume: '', email: '' });
  const [comenzi, setComenzi] = useState([]);
  const [loadingData, setLoadingData] = useState(false);

  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ nume: '', email: '', parola: '' });
  const [serverMsg, setServerMsg] = useState({ tip: '', text: '' });
  const [loading, setLoading] = useState(false);

  const [updateForm, setUpdateForm] = useState({ nume: '', email: '', parolaNoua: '' });
  const [updateMsg, setUpdateMsg] = useState({ tip: '', text: '' });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (isLoggedIn) {
      fetchClientData();
    }
  }, [isLoggedIn]);

  const fetchClientData = async () => {
    setLoadingData(true);
    const token = localStorage.getItem('token');
    try {
      const userRes = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/me`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (userRes.ok) {
        const user = await userRes.json();
        setUserData(user);
      } else {
        handleLogout();
      }

      const comenziRes = await fetch(`${import.meta.env.VITE_API_URL}/api/comenzi/client`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (comenziRes.ok) {
        const comenziData = await comenziRes.json();
        setComenzi(comenziData);
      }
    } catch (error) {
      console.error("Eroare la preluarea datelor:", error);
    } finally {
      setLoadingData(false);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    setIsUpdating(true);
    setUpdateMsg({ tip: '', text: '' });

    // 🛡️ FIX 2: Construim un payload curat. Nu trimitem parola goală!
    const payloadDeTrimis = { nume: updateForm.nume, email: updateForm.email };
    if (updateForm.parolaNoua && updateForm.parolaNoua.trim().length > 0) {
        payloadDeTrimis.parolaNoua = updateForm.parolaNoua;
    }

    try {
      const token = localStorage.getItem('token');
      const res = await fetch(`${import.meta.env.VITE_API_URL}/api/auth/update`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payloadDeTrimis)
      });

      const data = await res.json();
      if (res.ok) {
        setUpdateMsg({ tip: 'succes', text: data.mesaj });
        setUserData(data.user);
        setUpdateForm({ ...updateForm, parolaNoua: '' });
      } else {
        setUpdateMsg({ tip: 'eroare', text: data.eroare || "Eroare la update." });
      }
    } catch (err) {
      setUpdateMsg({ tip: 'eroare', text: "Eroare de conexiune." });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsLoggedIn(false);
    setUserData({ nume: '', email: '' });
    setActiveView('dashboard');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setServerMsg({ tip: '', text: '' }); 

    try {
      const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
      const res = await fetch(`${import.meta.env.VITE_API_URL}${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await res.json();

      if (res.ok) {
        if (isLogin) {
          localStorage.setItem('token', data.token);
          setIsLoggedIn(true);
        } else {
          setIsLogin(true);
          setServerMsg({ tip: 'succes', text: "Cont creat cu succes! Acum te poți loga." });
          // Curățăm doar parola, lăsăm email-ul ca să-i fie mai ușor la login
          setFormData({ ...formData, parola: '' }); 
        }
      } else {
        setServerMsg({ tip: 'eroare', text: data.eroare || "Ceva n-a mers bine. Verifică datele." });
      }
    } catch (err) {
      setServerMsg({ tip: 'eroare', text: "Nu mă pot conecta la server. Verifică conexiunea!" });
      console.error("Eroare Catch:", err);
    } finally {
      setLoading(false);
    }
  };

  // 🛡️ FIX 1: Funcție curată pentru comutare între Logare / Creare Cont
  const toggleAuthMode = (mode) => {
    setIsLogin(mode);
    setServerMsg({ tip: '', text: '' });
    setFormData({ nume: '', email: '', parola: '' });
  };

  const getStatusStep = (status) => {
    const s = status?.toLowerCase() || '';
    if (s.includes('anulat') || s.includes('returnat')) return -1;
    if (s.includes('livrat')) return 4;
    if (s.includes('trimis') || s.includes('expediat')) return 3;
    if (s.includes('confirmat') || s.includes('procesare')) return 2;
    return 1; 
  };

  if (isLoggedIn) {
    return (
      <div className="account-auth-page fade-in">
        <div className="client-dashboard-premium">
          <div className="dashboard-header">
            <div>
              <h2>Salut, <span>{userData.nume?.split(' ')[0]}</span>! 👋</h2>
              <p>Gestionarea contului tău</p>
            </div>
            <button onClick={handleLogout} className="btn-logout"><FiLogOut /> Delogare</button>
          </div>

          <div className="dashboard-body">
            
            {activeView === 'dashboard' && (
              <div className="dashboard-grid">
                <div className="dashboard-card" onClick={() => setActiveView('comenzi')}>
                  <FiPackage />
                  <h3>Comenzile Mele</h3>
                  <span className="card-link">Vezi Istoric &rarr;</span>
                </div>
                <div className="dashboard-card" onClick={() => {
                    setActiveView('setari');
                    setUpdateForm({ nume: userData.nume, email: userData.email, parolaNoua: '' });
                  }}>
                  <FiSettings />
                  <h3>Date Personale</h3>
                  <span className="card-link">Editează Profil &rarr;</span>
                </div>
              </div>
            )}

            {activeView === 'comenzi' && (
              <div className="orders-history-view fade-in">
                <button className="btn-back-dash" onClick={() => setActiveView('dashboard')}><FiChevronLeft /> Înapoi la Dashboard</button>
                <h3 className="section-title">Istoricul Comenzilor Tale</h3>
                
                {loadingData ? (
                  <p>Se încarcă comenzile... ⏳</p>
                ) : comenzi.length === 0 ? (
                  <div className="empty-orders">
                    <FiPackage className="empty-icon" />
                    <p>Nu ai plasat nicio comandă încă.</p>
                  </div>
                ) : comenzi.map(c => {
                  const step = getStatusStep(c.status);
                  return (
                    <div key={c._id} className="order-item-card">
                      <div className="order-header">
                        <div className="order-info">
                          <h4>Comanda #{c._id.toString().slice(-6).toUpperCase()}</h4>
                          <span className="order-date">{new Date(c.createdAt).toLocaleDateString('ro-RO')}</span>
                        </div>
                        <div className="order-price">
                          <span className="total-label">Total:</span>
                          <span className="total-value">{c.total || c.totalComanda} Lei</span>
                        </div>
                      </div>

                      <div className="order-details-mini">
                        <p><strong>Produs:</strong> {c.numeProdus || 'Produs Magazin'} (x{c.cantitate || 1})</p>
                        <p><strong>Plată:</strong> {c.metodaPlata || 'Ramburs'}</p>
                      </div>

                      {step >= 0 ? (
                        <div className="tracking-container">
                          <div className={`track-step ${step >= 1 ? 'active' : ''}`}>
                            <div className="track-icon"><FiCheckCircle /></div>
                            <span>Plasată</span>
                          </div>
                          <div className={`track-line ${step >= 2 ? 'active-line' : ''}`}></div>
                          
                          <div className={`track-step ${step >= 2 ? 'active' : ''}`}>
                            <div className="track-icon"><FiPackage /></div>
                            <span>Procesare</span>
                          </div>
                          <div className={`track-line ${step >= 3 ? 'active-line' : ''}`}></div>
                          
                          <div className={`track-step ${step >= 3 ? 'active' : ''}`}>
                            <div className="track-icon"><FiArrowRight /></div>
                            <span>Expediată</span>
                          </div>
                          <div className={`track-line ${step >= 4 ? 'active-line' : ''}`}></div>
                          
                          <div className={`track-step ${step >= 4 ? 'active' : ''}`}>
                            <div className="track-icon"><FiCheckCircle /></div>
                            <span>Livrată</span>
                          </div>
                        </div>
                      ) : (
                        <div className="tracking-cancelled">
                          <FiAlertCircle /> Această comandă a fost anulată.
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}

            {activeView === 'setari' && (
              <div className="settings-view fade-in">
                <button className="btn-back-dash" onClick={() => setActiveView('dashboard')}><FiChevronLeft /> Înapoi la Dashboard</button>
                <h3 className="section-title">Editează Profilul</h3>
                
                {updateMsg.text && (
                  <div className="server-alert" style={{ marginBottom: '15px', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: updateMsg.tip === 'eroare' ? '#fef2f2' : '#dcfce7', color: updateMsg.tip === 'eroare' ? '#ef4444' : '#16a34a' }}>
                    {updateMsg.tip === 'succes' ? <FiCheckCircle /> : <FiAlertCircle />}
                    <span>{updateMsg.text}</span>
                  </div>
                )}

                <form onSubmit={handleUpdateProfile} className="auth-form-premium">
                  <div className="input-box-premium">
                    <FiUser className="icon" />
                    <input type="text" placeholder="Nume" value={updateForm.nume} onChange={(e) => setUpdateForm({...updateForm, nume: e.target.value})} required />
                  </div>
                  <div className="input-box-premium">
                    <FiMail className="icon" />
                    <input type="email" placeholder="Email" value={updateForm.email} onChange={(e) => setUpdateForm({...updateForm, email: e.target.value})} required />
                  </div>
                  <div className="input-box-premium">
                    <FiLock className="icon" />
                    <input type="password" placeholder="Parolă Nouă (opțional)" value={updateForm.parolaNoua} onChange={(e) => setUpdateForm({...updateForm, parolaNoua: e.target.value})} />
                  </div>
                  <button type="submit" className="btn-auth-premium" disabled={isUpdating}>
                    {isUpdating ? "SE SALVEAZĂ..." : "SALVEAZĂ MODIFICĂRILE"} <FiSave />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="account-auth-page fade-in">
      <div className="auth-card-premium">
        <div className="auth-toggle">
          <button className={isLogin ? "active" : ""} onClick={() => toggleAuthMode(true)}>Logare</button>
          <button className={!isLogin ? "active" : ""} onClick={() => toggleAuthMode(false)}>Creare Cont</button>
        </div>

        {serverMsg.text && (
          <div className="server-alert" style={{ marginBottom: '15px', padding: '10px', borderRadius: '8px', display: 'flex', alignItems: 'center', gap: '8px', background: serverMsg.tip === 'eroare' ? '#fef2f2' : '#dcfce7', color: serverMsg.tip === 'eroare' ? '#ef4444' : '#16a34a' }}>
            {serverMsg.tip === 'succes' ? <FiCheckCircle /> : <FiAlertCircle />}
            <span>{serverMsg.text}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="auth-form-premium">
          {!isLogin && (
            <div className="input-box-premium">
              <FiUser className="icon" />
              <input type="text" name="nume" placeholder="Numele tău complet" value={formData.nume} onChange={(e) => setFormData({...formData, nume: e.target.value})} required />
            </div>
          )}
          <div className="input-box-premium">
            <FiMail className="icon" />
            <input type="email" name="email" placeholder="Adresa de Email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} required />
          </div>
          <div className="input-box-premium">
            <FiLock className="icon" />
            <input type="password" name="parola" placeholder="Parola" value={formData.parola} onChange={(e) => setFormData({...formData, parola: e.target.value})} required />
          </div>
          
          {isLogin && <Link to="/forgot-password">Ai uitat parola?</Link>}
          
          <button type="submit" className="btn-auth-premium" disabled={loading}>
            {loading ? "Așteaptă..." : (isLogin ? "INTRĂ ÎN CONT" : "CREEAZĂ CONTUL")}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Account;