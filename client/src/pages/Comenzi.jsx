import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiEdit2, FiCheckCircle, FiX, FiPhoneCall, 
  FiShoppingBag, FiAlertCircle, FiCalendar, FiChevronDown,
  FiSearch, FiPlusSquare, FiTruck, FiBox, FiCreditCard,
  FiDownload, FiTrash2
} from 'react-icons/fi';
  
import './Comenzi.css'; 

const AdminComenzi = () => {
  const [activeTab, setActiveTab] = useState('comenzi');
  const [comenzi, setComenzi] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [produse, setProduse] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [range, setRange] = useState('last30'); 
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Am adăugat acțiunea pentru tipul de confirmare (anulare vs stergere)
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, type: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', item: null });
  const [formData, setFormData] = useState({});

  const [toast, setToast] = useState(null);

  const arataToast = (tip, mesaj) => {
    setToast({ tip, mesaj });
    setTimeout(() => {
      setToast(null);
    }, 6000);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // 1. Am adăugat opțiunea 'Toate datele'
  const rangeLabels = {
    today: 'Azi', yesterday: 'Ieri', last7: 'Ultimele 7 zile', last30: 'Ultimele 30 de zile', all: 'Toate datele'
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

      try {
        const resProduse = await fetch(`${API_URL}/api/produse`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (resProduse.ok) {
          const dataProduse = await resProduse.json();
          setProduse(dataProduse || []);
        } else {
          setProduse([]);
        }
      } catch (errProduse) {
        console.error("Eroare la fetch produse:", errProduse);
      }

    } catch (err) { 
      console.error("Eroare fetch principal:", err); 
    }
    
    setIsLoading(false);
  };

  useEffect(() => { 
    fetchData(); 
  }, [range]);

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

  const genereazaAWB = async (idComanda) => {
    const confirmare = window.confirm("Ești sigur că vrei să generezi AWB-ul pentru această comandă?");
    if (!confirmare) return;

    const token = localStorage.getItem('adminToken');
    arataToast('loading', '⏳ Comunicăm cu Europarcel... Se generează AWB-ul!');

    try {
      const response = await fetch(`${API_URL}/api/admin/comenzi/${idComanda}/awb`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        }
      });

      const data = await response.json();

      if (response.ok && data.success) {
        arataToast('success', `🎉 BOMBĂ! AWB generat cu succes: ${data.awb}`);
        fetchData();
      } else {
        arataToast('error', `❌ EROARE CURIER: ${data.eroare || data.message || 'Eroare necunoscută'}`);
      }
    } catch (err) {
      arataToast('error', `❌ Eroare gravă de conexiune: ${err.message}`);
    }
  };

  const listaFiltrata = (activeTab === 'comenzi' ? comenzi : drafts).filter(item => {
    const term = searchTerm.toLowerCase();
    return (
      (item.numeClient?.toLowerCase().includes(term)) ||
      (item.telefon?.includes(term)) ||
      (item.email?.toLowerCase().includes(term)) ||
      (item.adresa?.toLowerCase().includes(term))
    );
  });

  // 2. Funcția de Export în CSV
  const exportaCSV = () => {
    if (listaFiltrata.length === 0) {
      arataToast('error', 'Nu există comenzi de exportat în lista curentă.');
      return;
    }

    // Header-urile fișierului CSV
    const headers = ['Data', 'Nume Client', 'Telefon', 'Email', 'Produs', 'Cantitate', 'Total (Lei)', 'Metoda Plata', 'Tip Livrare', 'Adresa', 'Localitate', 'Judet', 'Status', 'Sursa', 'AWB'];
    
    // Extragem valorile pentru fiecare comandă
    const rows = listaFiltrata.map(c => [
      new Date(c.createdAt || c.updatedAt).toLocaleDateString('ro-RO'),
      `"${c.numeClient || c.nume || ''}"`,
      `"${c.telefon || ''}"`,
      `"${c.email || ''}"`,
      `"${c.numeProdus || c.produs || ''}"`,
      c.cantitate || 1,
      c.total || c.totalComanda || c.pret || 0,
      `"${c.metodaPlata || ''}"`,
      `"${c.tipLivrare || ''}"`,
      `"${c.adresa || ''}"`,
      `"${c.localitate || ''}"`,
      `"${c.judet || ''}"`,
      `"${c.status || ''}"`,
      `"${c.sursa || ''}"`,
      `"${c.awb || ''}"`
    ]);

    // Formatăm conținutul (cu uFEFF pentru suport diacritice românești)
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
      + headers.join(',') + '\n' 
      + rows.map(e => e.join(',')).join('\n');

    // Declanșăm descărcarea
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Export_Comenzi_${range}_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    arataToast('success', 'Fișierul a fost descărcat cu succes!');
  };

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
    
    const endpoint = isCreare 
      ? `${API_URL}/api/comenzi` 
      : (editModal.type === 'comanda' 
          ? `${API_URL}/api/comenzi/${formData._id}`
          : `${API_URL}/api/comenzi/abandonat/${formData._id}`);

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
        arataToast('success', isCreare ? "Comandă creată!" : "Date salvate!");
        setEditModal({ isOpen: false, type: '', item: null });
        fetchData();
      } else {
        arataToast('error', data.eroare || data.message || "Eroare la salvare");
      }
    } catch (err) { 
      arataToast('error', "Eroare server. A picat netul?");
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
        arataToast('success', "Comandă plasată cu succes!");
        setEditModal({ isOpen: false, type: '', item: null });
        setActiveTab('comenzi'); 
        fetchData();
      } else {
        const errorData = await res.json();
        arataToast('error', errorData.eroare || "Eroare la plasarea comenzii");
      }
    } catch (err) { 
      arataToast('error', "Eroare conexiune server"); 
    }
  };

  const actualizeazaStatus = async (id, statusNou) => {
    const token = localStorage.getItem('adminToken');
    setComenzi(prevComenzi => 
      prevComenzi.map(c => c._id === id ? { ...c, status: statusNou } : c)
    );

    try {
      const res = await fetch(`${API_URL}/api/comenzi/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: statusNou })
      });

      if (res.status === 401 || res.status === 403) { 
        delogareSilentioasa(); 
        return; 
      }

      const data = await res.json();

      if (res.ok) {
        arataToast('success', "Status actualizat cu succes!");
      } else {
        arataToast('error', "Eroare de la server: " + (data.eroare || "Eroare necunoscută"));
      }
      fetchData(); 
    } catch (err) { 
      arataToast('error', "Eroare gravă de rețea!");
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
        arataToast('success', "Comandă anulată cu succes!");
        setConfirmModal({ isOpen: false, id: null, type: '' });
        setEditModal({ isOpen: false, type: '', item: null });
        fetchData();
      }
    } catch (err) { 
      arataToast('error', "Eroare server la anulare!"); 
    }
  };

  // 3. Funcția pentru ștergere definitivă
  const executeStergereDefinitiva = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      // Diferențiem dacă e comandă validă sau draft pentru a apela endpoint-ul corect
      const endpoint = editModal.type === 'draft' 
        ? `${API_URL}/api/comenzi/abandonat/${confirmModal.id}` 
        : `${API_URL}/api/comenzi/${confirmModal.id}`;

      const res = await fetch(endpoint, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.status === 401 || res.status === 403) { delogareSilentioasa(); return; }
      
      if(res.ok) {
        arataToast('success', "Comandă ștearsă complet din baza de date!");
        setConfirmModal({ isOpen: false, id: null, type: '' });
        setEditModal({ isOpen: false, type: '', item: null });
        fetchData();
      } else {
        const data = await res.json();
        arataToast('error', data.eroare || "Eroare la ștergere!");
      }
    } catch (err) { 
      arataToast('error', "Eroare server la ștergere definitivă!"); 
    }
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

  const getSursaBadge = (sursa) => {
    const s = sursa ? sursa.toLowerCase() : '';
    if (s.includes('facebook')) {
      return { text: 'Facebook', bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' };
    }
    if (s.includes('tine') || s.includes('admin')) {
      return { text: 'Creată de Admin', bg: '#f3e8ff', color: '#9333ea', border: '#e9d5ff' };
    }
    return { text: 'Organic / Direct', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
  };

  if (isLoading) return <div className="ac-loader"><div className="ac-spinner"></div></div>;

  return (
    <div className="ac-container">
      
      <div className="ac-header-bar">
        <div className="ac-header-left" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 className="ac-page-title">Gestionare Comenzi</h1>
          <button 
            className="ac-btn-new-order" 
            onClick={() => openEditModal({ 
              cantitate: 1, 
              metodaPlata: 'Ramburs', 
              tipLivrare: 'curier', 
              sursa: 'Creată de tine', 
              numeProdus: '' 
            }, 'creare')}
          >
            <FiPlusSquare /> Comandă Nouă
          </button>

          {/* Butonul nou de export */}
          <button 
            onClick={exportaCSV}
            style={{ 
              display: 'flex', alignItems: 'center', gap: '5px', background: '#10b981', 
              color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', 
              fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' 
            }}
          >
            <FiDownload /> Exportă CSV
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
                  <td data-label="Dată">
                    {new Date(item.createdAt || item.updatedAt).toLocaleDateString('ro-RO')}
                  </td>
                  
                  <td data-label="Client">
                    <div className="ac-truncate ac-fw-medium">{item.numeClient || '-'}</div>
                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>{item.telefon}</div>
                    {item.email && <div className="ac-truncate" style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.email}</div>}
                  </td>
                  
                  <td data-label="Comandă">
                    <div className="ac-truncate ac-fw-medium">{item.numeProdus || 'Produs Magazin'}</div>
                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>
                      x{item.cantitate || 1} buc
                    </span>
                  </td>

                  <td data-label="Plată & Livrare">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>
                      {item.metodaPlata?.toLowerCase().includes('card') ? <FiCreditCard style={{color: '#10b981'}}/> : <FiTruck style={{color: '#3b82f6'}}/>}
                      {item.metodaPlata || 'Ramburs'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b', marginTop: '3px' }}>
                      {item.tipLivrare === 'locker' ? <><FiBox /> Easybox</> : <><FiTruck /> Curier</>}
                    </div>
                  </td>

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

                  <td data-label="Total" className="ac-fw-bold" style={{ color: '#e61938', fontWeight: 'bold' }}>
                    {item.total || item.totalComanda} Lei
                  </td>
                  
                  {/* 4. Butoane AWB modificate */}
                  <td data-label="Acțiuni" className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    
                    {!item.awb ? (
                      <button onClick={() => genereazaAWB(item._id)} style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        📦 Generare AWB
                      </button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          ✅ {item.awb}
                        </span>
                        {/* Butonul de regenerare AWB, estompat, care se aprinde doar pe hover */}
                        <button 
                          onClick={() => genereazaAWB(item._id)} 
                          style={{ 
                            background: '#f8fafc', color: '#94a3b8', border: '1px dashed #cbd5e1', 
                            padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', 
                            opacity: '0.7', transition: 'all 0.2s' 
                          }} 
                          onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#3b82f6'; }} 
                          onMouseOut={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#cbd5e1'; }}
                        >
                          🔄 Regenerează
                        </button>
                      </div>
                    )}

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

              {/* Butoanele pentru Anulare și Ștergere Definitivă */}
              {(editModal.type === 'comanda' || editModal.type === 'draft') && (
                <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                  {editModal.type === 'comanda' && formData.status !== 'Anulată' && (
                    <button onClick={() => setConfirmModal({isOpen: true, id: formData._id, type: 'anulare'})} className="ac-btn-cancel-order">
                      Anulează Comanda
                    </button>
                  )}
                  
                  {/* Buton Nou - Ștergere completă */}
                  <button 
                    onClick={() => setConfirmModal({isOpen: true, id: formData._id, type: 'stergere'})} 
                    style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
                  >
                    <FiTrash2 /> Șterge Definitiv
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modal comun de confirmare (Anulare sau Ștergere) */}
      {confirmModal.isOpen && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-content" style={{maxWidth: '400px'}}>
             <div style={{padding: '30px', textAlign: 'center'}}>
               <FiAlertCircle size={50} color="#ef4444" style={{marginBottom: '15px'}} />
               <h3 style={{marginBottom: '20px', color: '#0f172a'}}>
                 {confirmModal.type === 'stergere' 
                   ? 'Atenție! Comanda va fi ștearsă COMPLET din baza de date. Acțiunea este ireversibilă!' 
                   : 'Ești sigur că anulezi comanda?'}
               </h3>
               <div style={{display: 'flex', gap: '10px'}}>
                 <button className="ac-btn-cancel-order" style={{flex: 1}} onClick={() => setConfirmModal({isOpen: false, id: null, type: ''})}>Înapoi</button>
                 <button 
                   className="ac-btn-save" 
                   style={{flex: 1, background: '#ef4444', boxShadow: 'none'}} 
                   onClick={confirmModal.type === 'stergere' ? executeStergereDefinitiva : executeAnulare}
                 >
                   {confirmModal.type === 'stergere' ? 'Da, șterge definitiv' : 'Da, anulează'}
                 </button>
               </div>
             </div>
          </div>
        </div>
      )}

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