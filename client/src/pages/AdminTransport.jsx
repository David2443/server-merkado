import React, { useState, useEffect } from 'react';
import { FiTruck, FiBox, FiCheckCircle, FiSave } from 'react-icons/fi';
import './AdminTransport.css'; 

const AdminTransport = () => {
  const [curier, setCurier] = useState({ nume: 'Curier Rapid (Acasă)', pret: 19.00, tip: 'curier', activ: true });
  const [locker, setLocker] = useState({ nume: 'Livrare Easybox', pret: 14.99, tip: 'locker', activ: true });
  
  const [isLoading, setIsLoading] = useState(true);
  const [mesaj, setMesaj] = useState(null);

  // 🛡️ FIX 1: URL Dinamic
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_URL}/api/transport`);
      if (res.ok) {
        const data = await res.json();
        const curierSalvat = data.find(m => m.tip === 'curier');
        const lockerSalvat = data.find(m => m.tip === 'locker');
        
        if (curierSalvat) setCurier(curierSalvat);
        if (lockerSalvat) setLocker(lockerSalvat);
      }
    } catch (err) { 
      console.error("Eroare la citirea transportului", err); 
    }
    setIsLoading(false);
  };

  useEffect(() => { fetchData(); }, []);

  const handleSave = async () => {
    // 🛡️ FIX 2: Folosim strict adminToken
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
        setMesaj({ tip: 'error', text: 'Nu ești autentificat ca administrator!' });
        return;
    }

    setMesaj({ tip: 'loading', text: 'Se salvează prețurile...' });

    const salveazaMetoda = async (metoda) => {
      const url = metoda._id ? `${API_URL}/api/transport/${metoda._id}` : `${API_URL}/api/transport`;
      const httpMethod = metoda._id ? 'PUT' : 'POST';

      const res = await fetch(url, {
        method: httpMethod,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(metoda)
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.eroare || `Eroare HTTP: ${res.status}`);
      }
      return res.json();
    };

    try {
      await Promise.all([salveazaMetoda(curier), salveazaMetoda(locker)]);
      setMesaj({ tip: 'success', text: '✅ Prețurile au fost salvate REAL în baza de date!' });
      fetchData(); 
      setTimeout(() => setMesaj(null), 4000); 
    } catch (err) {
      setMesaj({ tip: 'error', text: `❌ Serverul a refuzat salvarea: ${err.message}` });
    }
  };

  if (isLoading) return <div className="ac-loader"><div className="ac-spinner"></div></div>;

  return (
    <div className="ac-container">
      <div className="ac-header-bar" style={{ marginBottom: '30px' }}>
        <h1 className="ac-page-title">Costuri Transport</h1>
        <p style={{ color: '#64748b', margin: '5px 0 0 0' }}>Modifică prețurile de livrare. Ele se vor actualiza automat pe pagina de Checkout a clienților.</p>
      </div>

      {mesaj && (
        <div style={{ padding: '15px 20px', marginBottom: '20px', borderRadius: '8px', fontWeight: 'bold', 
          backgroundColor: mesaj.tip === 'success' ? '#dcfce7' : mesaj.tip === 'error' ? '#fee2e2' : '#e0f2fe',
          color: mesaj.tip === 'success' ? '#166534' : mesaj.tip === 'error' ? '#991b1b' : '#0369a1'
        }}>
          {mesaj.text}
        </div>
      )}

      <div className="ac-form-row" style={{ gap: '30px' }}>
        
        {/* CARD CURIER */}
        <div className="ac-main-card" style={{ flex: 1, padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <div style={{ background: '#f1f5f9', padding: '15px', borderRadius: '50%' }}><FiTruck size={28} color="#2563eb" /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Curier Rapid</h2>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Livrare la adresă (ex: FAN / DPD)</span>
            </div>
          </div>

          <div className="ac-form-group">
            <label>Preț Livrare (Lei)</label>
            <input type="number" step="0.1" value={curier.pret} onChange={(e) => setCurier({...curier, pret: parseFloat(e.target.value) || 0})} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }} />
          </div>

          <div className="ac-form-group" style={{ flexDirection: 'row', alignItems: 'center', marginTop: '20px' }}>
            <input type="checkbox" checked={curier.activ} onChange={(e) => setCurier({...curier, activ: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <label style={{ margin: 0, fontSize: '1rem', cursor: 'pointer' }}>Metodă Activă pe Site</label>
          </div>
        </div>

        {/* CARD EASYBOX */}
        <div className="ac-main-card" style={{ flex: 1, padding: '30px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '15px', marginBottom: '20px', borderBottom: '1px solid #e2e8f0', paddingBottom: '15px' }}>
            <div style={{ background: '#f0fdf4', padding: '15px', borderRadius: '50%' }}><FiBox size={28} color="#10b981" /></div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Rețea Lockere</h2>
              <span style={{ color: '#64748b', fontSize: '0.9rem' }}>Preluare personală (ex: Easybox)</span>
            </div>
          </div>

          <div className="ac-form-group">
            <label>Preț Livrare (Lei)</label>
            <input type="number" step="0.1" value={locker.pret} onChange={(e) => setLocker({...locker, pret: parseFloat(e.target.value) || 0})} style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#0f172a' }} />
          </div>

          <div className="ac-form-group" style={{ flexDirection: 'row', alignItems: 'center', marginTop: '20px' }}>
            <input type="checkbox" checked={locker.activ} onChange={(e) => setLocker({...locker, activ: e.target.checked})} style={{ width: '20px', height: '20px', cursor: 'pointer' }} />
            <label style={{ margin: 0, fontSize: '1rem', cursor: 'pointer' }}>Metodă Activă pe Site</label>
          </div>
        </div>

      </div>

      <div style={{ marginTop: '40px', display: 'flex', justifyContent: 'flex-end' }}>
        <button className="ac-btn-convert" onClick={handleSave} style={{ fontSize: '1.1rem', padding: '15px 40px' }}>
          <FiSave style={{ marginRight: '10px' }}/> Salvează Setările Noi
        </button>
      </div>

    </div>
  );
};

export default AdminTransport;