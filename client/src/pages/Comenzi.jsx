import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiEdit2, FiCheckCircle, FiX, FiPhoneCall, 
  FiShoppingBag, FiAlertCircle, FiCalendar, FiChevronDown,
  FiSearch, FiPlusSquare, FiTruck, FiBox, FiCreditCard
} from 'react-icons/fi';
  
import './Comenzi.css'; 

const AdminComenzi = () => {
  const [activeTab, setActiveTab] = useState('comenzi');
  const [comenzi, setComenzi] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [produse, setProduse] = useState([]); // 🔥 State pentru produse
  const [searchTerm, setSearchTerm] = useState('');
  const [range, setRange] = useState('last30'); 
  const [showDropdown, setShowDropdown] = useState(false);
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null });
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', item: null });
  const [formData, setFormData] = useState({});
  const [toast, setToast] = useState({ visible: false, message: '', type: 'success' });



// Funcția de apelare REPARATĂ + SMART TOASTS
const genereazaAWB = async (idComanda) => {
  const confirmare = window.confirm("Ești sigur că vrei să generezi AWB-ul pentru această comandă?");
  if (!confirmare) return;

  const token = localStorage.getItem('adminToken');

  // 🚀 1. Afișăm Pop-up-ul albastru de încărcare imediat ce a dat click
  arataToast('loading', '⏳ Comunicăm cu Europarcel... Se generează AWB-ul!');
  
  console.log(`🚀 Încerc să generez AWB pentru comanda: ${idComanda}`);

  try {
    const response = await fetch(`${API_URL}/api/admin/comenzi/${idComanda}/awb`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}` 
      }
    });

    const data = await response.json();
    console.log("📦 Date primite de la server:", data);

    if (response.ok && data.success) {
      // ✅ 2. SUCCES! Pop-up Verde
      arataToast('success', `🎉 BOMBĂ! AWB generat cu succes: ${data.awb}`);
      fetchData(); // Reîncărcăm tabelul instant
    } else {
      // ❌ 3. EROARE DE LA EUROPARCEL! Pop-up Roșu
      arataToast('error', `❌ EROARE CURIER: ${data.eroare || data.message || 'Eroare necunoscută'}`);
    }
  } catch (err) {
    console.error("💥 EROARE CRITICĂ CATCH:", err);
    // ❌ 4. EROARE DE REȚEA! Pop-up Roșu
    arataToast('error', `❌ Eroare gravă de conexiune: ${err.message}`);
  }
};

  // 🛡️ FIX 1: URL Dinamic
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const rangeLabels = {
    today: 'Azi', yesterday: 'Ieri', last7: 'Ultimele 7 zile', last30: 'Ultimele 30 de zile'
  };

  const showToast = (message, type = 'success') => {
    setToast({ visible: true, message, type });
    setTimeout(() => setToast({ visible: false, message: '', type: 'success' }), 3000);
  };

  const delogareSilentioasa = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    window.location.reload(); 
  };

  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('adminToken');
    
    if (!token) {
      delogareSilentioasa();
      return;
    }

    try {
      // 📦 1. Tragem Comenzile și Draft-urile (Coșurile abandonate)
      const resComenzi = await fetch(`${API_URL}/api/dashboard?range=${range}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resComenzi.status === 401 || resComenzi.status === 403) {
        delogareSilentioasa();
        return;
      }

      const dataComenzi = await resComenzi.json();
      if (resComenzi.ok) {
        setComenzi(dataComenzi.comenziRecente || []);
        setDrafts(dataComenzi.cosuriAbandonate || []);
      }

      // 🛒 2. Tragem Produsele pentru Dropdown-ul din Modal
      try {
        // Dacă ai deja ruta de produse pe backend, asta o va apela:
        const resProduse = await fetch(`${API_URL}/api/produse`, {
          headers: { 'Authorization': `Bearer ${token}` } // Dacă e protejată ruta
        });
        
        if (resProduse.ok) {
          const dataProduse = await resProduse.json();
          setProduse(dataProduse || []);
        } else {
          // Dacă ruta nu există încă sau dă eroare, băgăm unele de test ca să nu crape:
          setProduse([
            { _id: 'test1', nume: 'Tricou Super Bombă' },
            { _id: 'test2', nume: 'Adidași Premium' },
            { _id: 'test3', nume: 'Ceas Șmecher' }
          ]);
        }
      } catch (errProduse) {
        console.error("Eroare la fetch produse:", errProduse);
        // Dacă a picat complet apelul de produse, punem fallback-ul de test:
        setProduse([
          { _id: 'test1', nume: 'Tricou Super Bombă' },
          { _id: 'test2', nume: 'Adidași Premium' },
          { _id: 'test3', nume: 'Ceas Șmecher' }
        ]);
      }

    } catch (err) { 
      console.error("Eroare fetch principal:", err); 
    }
    
    setIsLoading(false);
  };

  // Se apelează automat la încărcarea paginii și când schimbi filtrul de date (Azi, Ultimele 7 zile etc.)
  useEffect(() => { 
    fetchData(); 
  }, [range]);

  useEffect(() => { fetchData(); }, [range]);

  useEffect(() => {
    const idDeDeschis = localStorage.getItem('autoOpenOrder');
    if (idDeDeschis && comenzi.length > 0) {
      const comandaGasita = comenzi.find(c => c._id === idDeDeschis);
      if (comandaGasita) {
        openEditModal(comandaGasita, 'comanda');
        setActiveTab('comenzi');
        localStorage.removeItem('autoOpenOrder');
      }
    }
  }, [comenzi]);

  const listaFiltrata = (activeTab === 'comenzi' ? comenzi : drafts).filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.numeClient?.toLowerCase().includes(term)) ||
      (item.telefon?.includes(term)) ||
      (item.email?.toLowerCase().includes(term)) ||
      (item.adresa?.toLowerCase().includes(term))
    );
  });

  const openEditModal = (item, type) => {
    setFormData(item);
    setEditModal({ isOpen: true, type, item });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

const handleSave = async () => {
    const token = localStorage.getItem('adminToken');
    const isCreare = editModal.type === 'creare';
    
    const method = isCreare ? 'POST' : 'PUT';
    
    // 🚪 FIX: Revenim la ruta de ADMIN (/api/comenzi), care te lasă să introduci ce vrei tu!
    const endpoint = isCreare 
      ? `${API_URL}/api/comenzi` 
      : (editModal.type === 'comanda' 
          ? `${API_URL}/api/comenzi/${formData._id}`
          : `${API_URL}/api/comenzi/abandonat/${formData._id}`);

    // Păstrăm translatorul, doar pentru siguranță
    const payloadCorectat = {
      ...formData,
      produs: formData.numeProdus || formData.produs,
      nume: formData.numeClient || formData.nume,
      pret: formData.total || formData.totalComanda || formData.pret,
    };

    try {
      const res = await fetch(endpoint, {
        method: method,
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payloadCorectat)
      });

      if (res.status === 401 || res.status === 403) { delogareSilentioasa(); return; }

      let data = {};
      try { data = await res.json(); } catch (e) { console.log("Eroare parsare JSON"); }

      if(res.ok) {
        showToast(isCreare ? "Comandă creată!" : "Date salvate!");
        setEditModal({ isOpen: false, type: '', item: null });
        fetchData();
      } else {
        console.error("❌ EROARE BACKEND:", data);
        showToast(data.eroare || data.message || "Eroare la salvare", "error");
      }
    } catch (err) { 
      showToast("Eroare server. A picat netul?", "error"); 
    }
  };

  const handlePlasareComandaDinDraft = async () => {
    const token = localStorage.getItem('adminToken');
    
    try {
      const res = await fetch(`${API_URL}/api/comenzi/convert-draft/${formData._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData) 
      });

      if (res.status === 401 || res.status === 403) { delogareSilentioasa(); return; }

      if(res.ok) {
        showToast("Comandă plasată cu succes!");
        setEditModal({ isOpen: false, type: '', item: null });
        setActiveTab('comenzi'); 
        fetchData();
      } else {
        const errorData = await res.json();
        showToast(errorData.eroare || "Eroare la plasarea comenzii", "error");
      }
    } catch (err) { showToast("Eroare conexiune server", "error"); }
  };
const actualizeazaStatus = async (id, statusNou) => {
    const token = localStorage.getItem('adminToken');
    console.log(`🚀 1. Începem! Trimitem noul status: [${statusNou}] pentru comanda: ${id}`);
    
    // 🔥 OPTIMISTIC UPDATE: Schimbăm vizual pe ecran INSTANT ca să nu mai dai F5!
    setComenzi(prevComenzi => 
      prevComenzi.map(c => c._id === id ? { ...c, status: statusNou } : c)
    );

    try {
      console.log(`📡 2. Se apelează URL-ul: ${API_URL}/api/comenzi/${id}/status`);
      
      const res = await fetch(`${API_URL}/api/comenzi/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: statusNou })
      });

      console.log(`📥 3. Răspuns primit de la server. Cod de status: ${res.status}`);

      if (res.status === 401 || res.status === 403) { 
        console.error("❌ EROARE: Token-ul tău de admin a expirat sau este invalid. Te va deloga.");
        delogareSilentioasa(); 
        return; 
      }

      // Încercăm să citim ce a răspuns efectiv backend-ul
      const data = await res.json();

      if (res.ok) {
        console.log("✅ 4. SUCCES! Comanda s-a modificat pe backend. Datele primite:", data);
        showToast("Status actualizat cu succes!", "success");
      } else {
        console.error("❌ 4. BACKEND-UL A DAT EROARE:", data);
        showToast("Eroare de la server: " + (data.eroare || "Eroare necunoscută"), "error");
      }

      // Lăsăm fetch-ul original să sincronizeze liniștit în fundal
      fetchData(); 
    } catch (err) { 
      console.error("❌ EROARE FATALĂ DE CONEXIUNE (A picat netul sau serverul e oprit):", err.message);
      showToast("Eroare gravă de rețea!", "error"); 
    }
  };

  const executeAnulare = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/comenzi/${confirmModal.id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: 'Anulată' })
      });
      if (res.status === 401 || res.status === 403) { delogareSilentioasa(); return; }
      if(res.ok) {
        showToast("Comandă anulată cu succes!", "success");
        setConfirmModal({ isOpen: false, id: null });
        setEditModal({ isOpen: false, type: '', item: null });
        fetchData();
      }
    } catch (err) { showToast("Eroare server!", "error"); }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Nouă': return { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' };
      case 'Confirmată': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      case 'Trimisă': return { bg: '#f3e8ff', color: '#9333ea', border: '#e9d5ff' };
      case 'Livrată': return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
      case 'Returnată': 
      case 'Anulată': return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' };
      default: return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  if (isLoading) return <div className="ac-loader"><div className="ac-spinner"></div></div>;

// Funcția care decide cum arată badge-ul de trafic
  const getSursaBadge = (sursa) => {
    const s = sursa ? sursa.toLowerCase() : '';
    
    if (s.includes('facebook')) {
      return { text: 'Facebook', bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' }; // Albastru
    }
    if (s.includes('tine') || s.includes('admin')) {
      return { text: 'Creată de tine', bg: '#f3e8ff', color: '#9333ea', border: '#e9d5ff' }; // Mov
    }
    
    // Dacă nu e Facebook sau Creată de admin, presupunem că e Organic/Google
    return { text: 'Organic / Google', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' }; // Verde
  };


// 🛎️ Sistem de Notificări (Toasts)
  const [toast, setToast] = useState(null);

  const arataToast = (tip, mesaj) => {
    setToast({ tip, mesaj });
    // Ascundem notificarea după 6 secunde automat
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };


  return (
    <div className="ac-container">
      
      <div className="ac-header-bar">
        <div className="ac-header-left">
          <h1 className="ac-page-title">Gestionare Comenzi</h1>
          <button 
    className="ac-btn-new-order" 
    onClick={() => openEditModal({ 
      cantitate: 1, 
      metodaPlata: 'Ramburs', 
      tipLivrare: 'curier', 
      sursa: 'Creată de tine', // 🔥 Aici forțăm sursa pentru comenzile manuale
      numeProdus: '' 
    }, 'creare')}
  >
    <FiPlusSquare /> Comandă Nouă
  </button>
        </div>
        
        <div className="ac-header-right">
          <div className="ac-search-box">
            <FiSearch />
            <input 
              type="text" 
              placeholder="Caută nume, telefon, email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="ac-filter-container">
            <button className="ac-btn" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>
              <FiCalendar /> {rangeLabels[range]} <FiChevronDown />
            </button>
            {showDropdown && (
              <div className="ac-dropdown">
                {Object.keys(rangeLabels).map(key => (
                  <div key={key} className={`ac-dropdown-item ${range === key ? 'active' : ''}`} onClick={() => { setRange(key); setShowDropdown(false); }}>
                    {rangeLabels[key]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ac-main-card">
        <div className="ac-tabs">
          <div className={`ac-tab ${activeTab === 'comenzi' ? 'active' : ''}`} onClick={() => setActiveTab('comenzi')}>
            <FiShoppingBag /> Comenzi ({comenzi.length})
          </div>
          <div className={`ac-tab drafts-tab ${activeTab === 'drafts' ? 'active' : ''}`} onClick={() => setActiveTab('drafts')}>
            <FiAlertCircle /> Abandonate ({drafts.length})
          </div>
        </div>

        <div className="ac-table-wrapper">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Dată</th>
                <th>Client</th>
                <th>Comandă</th>
                <th>Plată & Livrare</th>
                {activeTab === 'comenzi' && <th>Status</th>}
                <th>Sursă Trafic 🎯</th>
                <th>Total</th>
                <th className="text-right">Acțiuni</th>
              </tr>
            </thead>
       
      <tbody>
             {listaFiltrata.map((item) => (
                <tr key={item._id} className={item.status === 'Anulată' ? 'ac-row-cancelled' : ''}>
                  
                  {/* 1. DATĂ */}
                  <td data-label="Dată">
                    {new Date(item.createdAt || item.updatedAt).toLocaleDateString('ro-RO')}
                  </td>
                  
                  {/* 2. CLIENT */}
                  <td data-label="Client">
                    <div className="ac-truncate ac-fw-medium">{item.numeClient || '-'}</div>
                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>{item.telefon}</div>
                    {item.email && <div className="ac-truncate" style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.email}</div>}
                  </td>
                  
                  {/* 3. COMANDĂ */}
                  <td data-label="Comandă">
                    <div className="ac-truncate ac-fw-medium">{item.numeProdus || 'Produs Magazin'}</div>
                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>
                      x{item.cantitate || 1} buc
                    </span>
                  </td>

                  {/* 4. PLATĂ & LIVRARE */}
                  <td data-label="Plată & Livrare">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>
                      {item.metodaPlata?.toLowerCase().includes('card') ? <FiCreditCard style={{color: '#10b981'}}/> : <FiTruck style={{color: '#3b82f6'}}/>}
                      {item.metodaPlata || 'Ramburs'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b', marginTop: '3px' }}>
                      {item.tipLivrare === 'locker' ? <><FiBox /> Easybox</> : <><FiTruck /> Curier</>}
                    </div>
                  </td>

                  {/* 5. STATUS (Doar în tab-ul comenzi) */}
                  {activeTab === 'comenzi' && (
                    <td data-label="Status">
                      <select 
                        className="ac-status-select"
                        style={{
                          backgroundColor: getStatusStyle(item.status).bg,
                          color: getStatusStyle(item.status).color,
                          borderColor: getStatusStyle(item.status).border
                        }}
                        value={item.status || 'Nouă'}
                        onChange={(e) => actualizeazaStatus(item._id, e.target.value)}
                      >
                        <option value="Nouă">Nouă</option>
                        <option value="Confirmată">Confirmată</option>
                        <option value="Trimisă">Trimisă</option>
                        <option value="Livrată">Livrată</option>
                        <option value="Returnată">Returnată</option>
                        <option value="Anulată">Anulată</option>
                      </select>
                    </td>
                  )}

                  {/* 6. SURSĂ TRAFIC 🎯 (Aici trebuia să stea de fapt) */}
                  {/* 6. SURSĂ TRAFIC 🎯 */}
  <td data-label="Sursă Trafic">
    {(() => {
      const stilSursa = getSursaBadge(item.sursa);
      return (
        <span style={{ 
          background: stilSursa.bg, 
          color: stilSursa.color, 
          border: `1px solid ${stilSursa.border}`, 
          padding: '4px 8px', 
          borderRadius: '6px', 
          fontSize: '0.8rem', 
          fontWeight: 'bold',
          display: 'inline-block' 
        }}>
          {stilSursa.text}
        </span>
      );
    })()}
  </td>

                  {/* 7. TOTAL */}
                  <td data-label="Total" className="ac-fw-bold" style={{ color: '#e61938', fontWeight: 'bold' }}>
                    {item.total || item.totalComanda} Lei
                  </td>
                  
                  {/* 8. ACȚIUNI (Am unit AWB-ul cu Editează pe aceeași coloană) */}
                  <td data-label="Acțiuni" className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    
                    {/* Buton AWB */}
                    {!item.awb ? (
                      <button onClick={() => genereazaAWB(item._id)} style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📦 AWB
                      </button>
                    ) : (
                      <span style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '6px 10px', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        ✅ {item.awb}
                      </span>
                    )}

                    {/* Buton Edit */}
                    <button onClick={() => openEditModal(item, activeTab === 'comenzi' ? 'comanda' : 'draft')} className="ac-btn-edit">
                      <FiEdit2 />
                    </button>
                    
                  </td>
                </tr>
              ))}
              {listaFiltrata.length === 0 && (
                <tr><td colSpan="8" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>Nicio comandă găsită.</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {editModal.isOpen && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-content">
            <div className="ac-modal-header">
              <h2>{editModal.type === 'creare' ? 'Comandă Nouă' : (editModal.type === 'draft' ? 'Recuperează Coș Abandonat' : 'Editează Comanda')}</h2>
              <button onClick={() => setEditModal({isOpen: false})} className="ac-close-btn"><FiX /></button>
            </div>
            
            <div className="ac-modal-body">
              <div className="ac-form-group">
    <label>Selectează Produsul</label>
    <select 
      name="numeProdus" 
      value={formData.numeProdus || ''} 
      onChange={handleInputChange}
    >
      <option value="">-- Alege un produs --</option>
      {/* 🔥 FIX: Verificăm dacă există produse înainte să dăm map! */}
      {produse && produse.length > 0 ? (
        produse.map((p) => (
          <option key={p._id} value={p.nume}>{p.nume}</option>
        ))
      ) : (
        <option value="" disabled>Se încarcă produsele...</option>
      )}
    </select>
  </div>
              <div className="ac-form-row">
                <div className="ac-form-group">
                  <label>Cantitate (Bucăți)</label>
                  <input type="number" name="cantitate" value={formData.cantitate || 1} onChange={handleInputChange} />
                </div>
                <div className="ac-form-group">
                  <label>Total Lei</label>
                  <input type="number" name="total" value={formData.total || formData.totalComanda || ''} onChange={handleInputChange} />
                </div>
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '15px 0' }} />

              <div className="ac-form-row">
                <div className="ac-form-group">
                  <label>Nume Client</label>
                  <input type="text" name="numeClient" value={formData.numeClient || ''} onChange={handleInputChange} />
                </div>
                <div className="ac-form-group">
                  <label>Telefon</label>
                  <input type="text" name="telefon" value={formData.telefon || ''} onChange={handleInputChange} />
                </div>
              </div>
              
              <div className="ac-form-group">
                <label>Email</label>
                <input type="email" name="email" value={formData.email || ''} onChange={handleInputChange} placeholder="client@email.com" />
              </div>

              <hr style={{ border: 'none', borderTop: '1px dashed #e2e8f0', margin: '15px 0' }} />

              <div className="ac-form-row">
                <div className="ac-form-group">
                  <label>Metodă Plată</label>
                  <select name="metodaPlata" value={formData.metodaPlata || 'Ramburs'} onChange={handleInputChange}>
                    <option value="Ramburs">Ramburs</option>
                    <option value="Card Online">Card Online</option>
                    <option value="Creată de Admin">Creată de Admin</option>
                  </select>
                </div>
                <div className="ac-form-group">
                  <label>Tip Livrare</label>
                  <select name="tipLivrare" value={formData.tipLivrare || 'curier'} onChange={handleInputChange}>
                    <option value="curier">Curier (Acasă / Birou)</option>
                    <option value="locker">Locker (Easybox)</option>
                  </select>
                </div>
              </div>

              <div className="ac-form-group">
                <label>Adresă Livrare / Detalii Easybox</label>
                <input type="text" name="adresa" value={formData.adresa || ''} onChange={handleInputChange} />
              </div>
              <div className="ac-form-row">
                <input type="text" name="localitate" value={formData.localitate || ''} onChange={handleInputChange} placeholder="Oraș" />
                <input type="text" name="judet" value={formData.judet || ''} onChange={handleInputChange} placeholder="Județ" />
              </div>

            </div>

            <div className="ac-modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={handleSave} className="ac-btn-save">
                {editModal.type === 'draft' ? 'Salvează Datele (Rămâne Draft)' : 'Salvează Modificările'}
              </button>
              
              {editModal.type === 'draft' && (
                <button 
                  onClick={handlePlasareComandaDinDraft} 
                  style={{ 
                    background: '#10b981', color: '#fff', border: 'none', padding: '10px 15px', 
                    borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' 
                  }}
                >
                  <FiCheckCircle style={{ marginRight: '5px' }} /> Plasează Comanda
                </button>
              )}

              {editModal.type === 'comanda' && formData.status !== 'Anulată' && (
                <button onClick={() => setConfirmModal({isOpen: true, id: formData._id})} className="ac-btn-cancel-order">
                  Anulează Comanda
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {confirmModal.isOpen && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-content" style={{maxWidth: '400px'}}>
             <div style={{padding: '30px', textAlign: 'center'}}>
               <FiAlertCircle size={50} color="#ef4444" style={{marginBottom: '15px'}} />
               <h3 style={{marginBottom: '20px', color: '#0f172a'}}>Ești sigur că anulezi comanda?</h3>
               <div style={{display: 'flex', gap: '10px'}}>
                 <button className="ac-btn-cancel-order" style={{flex: 1}} onClick={() => setConfirmModal({isOpen: false})}>Înapoi</button>
                 <button className="ac-btn-save" style={{flex: 1, background: '#ef4444', boxShadow: 'none'}} onClick={executeAnulare}>Da, anulează</button>
               </div>
             </div>
          </div>
        </div>
      )}

      {toast.visible && (
        <div className={`ac-toast ${toast.type}`}>
          {toast.message}
        </div>
      )}

      {/* 🛎️ RENDER NOTIFICĂRI SMART */}
      {toast && (
        <div className="admin-toast-container">
          <div className={`admin-toast ${toast.tip}`}>
            <div className="admin-toast-icon">
              {toast.tip === 'success' ? '✅' : toast.tip === 'error' ? '⚠️' : '🔄'}
            </div>
            <div>{toast.mesaj}</div>
          </div>
        </div>
      )}

    </div>
  );
};

export default AdminComenzi;