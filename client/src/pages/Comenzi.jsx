import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  FiEdit2, FiCheckCircle, FiX, FiPhoneCall, 
  FiShoppingBag, FiAlertCircle, FiCalendar, FiChevronDown,
  FiSearch, FiPlusSquare, FiTruck, FiBox, FiCreditCard,
  FiDownload, FiTrash2
} from 'react-icons/fi';
  
import './Comenzi.css'; 

const listaJudete = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila', 'Brașov', 'București',
  'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț',
  'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'
];

const AdminComenzi = () => {
  const [activeTab, setActiveTab] = useState('comenzi');
  const [comenzi, setComenzi] = useState([]);
  const [drafts, setDrafts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [produse, setProduse] = useState([]); 
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedItems, setSelectedItems] = useState([]);
  // 🔥 Setări pentru Date Picker
  const [range, setRange] = useState('last30'); 
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  
  // Modal states
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, id: null, type: '' });
  const [editModal, setEditModal] = useState({ isOpen: false, type: '', item: null });
  const [formData, setFormData] = useState({});

  // 🔥 State-uri pentru Adrese & Lockere
  const [listaLocalitatiFiltrate, setListaLocalitatiFiltrate] = useState([]);
  const [dropdownLocalitateDeschis, setDropdownLocalitateDeschis] = useState(false);
  const [cautareLocalitate, setCautareLocalitate] = useState('');
  const [lockereDisponibile, setLockereDisponibile] = useState([]);
  const [loadingLockers, setLoadingLockers] = useState(false);
  const [eroareLockere, setEroareLockere] = useState('');
  const [cautareLocker, setCautareLocker] = useState('');

  const [toast, setToast] = useState(null);

  const arataToast = (tip, mesaj) => {
    setToast({ tip, mesaj });
    setTimeout(() => { setToast(null); }, 6000);
  };

  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const rangeLabels = {
    today: 'Azi', yesterday: 'Ieri', last7: 'Ultimele 7 zile', 
    last30: 'Ultimele 30 de zile', all: 'Toate datele', custom: 'Interval Personalizat'
  };

  const delogareSilentioasa = () => {
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    window.location.reload(); 
  };

  // 🔥 Fetch-ul adaptat pentru interval personalizat
  const fetchData = async () => {
    setIsLoading(true);
    const token = localStorage.getItem('adminToken');
    
    if (!token) { delogareSilentioasa(); return; }

    try {
      let queryParams = `?range=${range}`;
      if (range === 'custom' && customStartDate && customEndDate) {
        queryParams += `&startDate=${customStartDate}&endDate=${customEndDate}`;
      }

      const resComenzi = await fetch(`${API_URL}/api/dashboard${queryParams}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (resComenzi.status === 401 || resComenzi.status === 403) { delogareSilentioasa(); return; }

      const dataComenzi = await resComenzi.json();
      if (resComenzi.ok) {
        setComenzi(dataComenzi.comenziRecente || []);
        setDrafts(dataComenzi.cosuriAbandonate || []);
      }

      try {
        const resProduse = await fetch(`${API_URL}/api/produse`, { headers: { 'Authorization': `Bearer ${token}` } });
        if (resProduse.ok) setProduse(await resProduse.json() || []);
        else setProduse([]);
      } catch (errProduse) { console.error("Eroare produse:", errProduse); }

    } catch (err) { console.error("Eroare fetch:", err); }
    
    setIsLoading(false);
  };

  // Trigger fetch la schimbarea range-ului (dacă nu e custom, facem instant)
  useEffect(() => { 
    if (range !== 'custom') fetchData(); 
  }, [range]);

  // Aplică filtrul custom
  const aplicaFiltruCustom = () => {
    if (!customStartDate || !customEndDate) {
      arataToast('error', 'Te rog selectează ambele date!');
      return;
    }
    fetchData();
  };

  // 🔥 Efect pentru Localități (ca pe frontend)
  useEffect(() => {
    if (!formData.judet) {
      setListaLocalitatiFiltrate([]);
      return;
    }
    const fetchLocalitati = async () => {
      try {
        const res = await fetch(`/localitati.json?t=${new Date().getTime()}`); 
        if (!res.ok) return;
        const dateRaw = await res.json();
        const arrayLocalitati = Array.isArray(dateRaw) ? dateRaw : Object.values(dateRaw);
        
        const eliminaDiacritice = (str) => str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
        const filtrate = arrayLocalitati.filter(loc => eliminaDiacritice(loc.county_name || '') === eliminaDiacritice(formData.judet));
        
        filtrate.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setListaLocalitatiFiltrate(filtrate);
      } catch (err) {}
    };
    fetchLocalitati();
  }, [formData.judet]);

  const cautaLockereInZona = async () => {
    if (!formData.judet || !formData.localitate) {
      arataToast('error', "Alege județul și orașul mai întâi!");
      return;
    }
    setLoadingLockers(true); setEroareLockere('');
    try {
      const res = await fetch(`${API_URL}/api/lockers?judet=${formData.judet}&localitate=${formData.localitate}`);
      const data = await res.json();
      if (res.ok) {
        if (data.length === 0) setEroareLockere(`Niciun locker în ${formData.localitate}.`);
        else setLockereDisponibile(data);
      } else setEroareLockere(data.eroare || "Eroare la căutare.");
    } catch (err) { setEroareLockere("Eroare server."); }
    setLoadingLockers(false);
  };

  const genereazaAWB = async (idComanda) => {
    const confirmare = window.confirm("Generezi AWB-ul pentru această comandă?");
    if (!confirmare) return;
    const token = localStorage.getItem('adminToken');
    arataToast('loading', '⏳ Se generează AWB-ul...');
    try {
      const response = await fetch(`${API_URL}/api/admin/comenzi/${idComanda}/awb`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }
      });
      const data = await response.json();
      if (response.ok && data.success) {
        arataToast('success', `🎉 AWB generat: ${data.awb}`);
        fetchData();
      } else arataToast('error', `❌ EROARE: ${data.eroare || data.message || 'Necunoscută'}`);
    } catch (err) { arataToast('error', `❌ Eroare conexiune.`); }
  };

  const listaFiltrata = (activeTab === 'comenzi' ? comenzi : drafts).filter(item => {
    const term = searchTerm.toLowerCase();
    return (item.numeClient?.toLowerCase().includes(term) || item.telefon?.includes(term) || item.email?.toLowerCase().includes(term) || item.adresa?.toLowerCase().includes(term));
  });

  const exportaCSV = () => {
    if (listaFiltrata.length === 0) return arataToast('error', 'Nu există comenzi de exportat.');
    const headers = ['Data', 'Nume Client', 'Telefon', 'Email', 'Produs', 'Cantitate', 'Total', 'Metoda Plata', 'Tip Livrare', 'Adresa', 'Localitate', 'Judet', 'Status', 'Sursa', 'AWB'];
    const rows = listaFiltrata.map(c => [
      new Date(c.createdAt || c.updatedAt).toLocaleDateString('ro-RO'),
      `"${c.numeClient || c.nume || ''}"`, `"${c.telefon || ''}"`, `"${c.email || ''}"`,
      `"${c.numeProdus || c.produs || ''}"`, c.cantitate || 1, c.total || c.totalComanda || c.pret || 0,
      `"${c.metodaPlata || ''}"`, `"${c.tipLivrare || ''}"`, `"${c.adresa || ''}"`,
      `"${c.localitate || ''}"`, `"${c.judet || ''}"`, `"${c.status || ''}"`, `"${c.sursa || ''}"`, `"${c.awb || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Export_Comenzi_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    arataToast('success', 'Fișier descărcat!');
  };

  const openEditModal = (item, type) => {
    setFormData(item);
    setLockereDisponibile([]);
    setEditModal({ isOpen: true, type, item });
  };

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSave = async () => {
    const token = localStorage.getItem('adminToken');
    const isCreare = editModal.type === 'creare';
    const method = isCreare ? 'POST' : 'PUT';
    const endpoint = isCreare ? `${API_URL}/api/comenzi` : (editModal.type === 'comanda' ? `${API_URL}/api/comenzi/${formData._id}` : `${API_URL}/api/comenzi/abandonat/${formData._id}`);
    
    const payloadCorectat = {
      ...formData,
      produs: formData.numeProdus || formData.produs,
      nume: formData.numeClient || formData.nume,
      pret: formData.total || formData.totalComanda || formData.pret,
    };

    try {
      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(payloadCorectat)
      });
      if (res.status === 401 || res.status === 403) return delogareSilentioasa();
      if(res.ok) {
        arataToast('success', isCreare ? "Comandă creată!" : "Date salvate!");
        setEditModal({ isOpen: false, type: '', item: null }); fetchData();
      } else arataToast('error', "Eroare la salvare");
    } catch (err) { arataToast('error', "Eroare server."); }
  };

  const handlePlasareComandaDinDraft = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      const res = await fetch(`${API_URL}/api/comenzi/convert-draft/${formData._id}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData) 
      });
      if (res.status === 401 || res.status === 403) return delogareSilentioasa();
      if(res.ok) {
        arataToast('success', "Comandă plasată cu succes!");
        setEditModal({ isOpen: false, type: '', item: null }); setActiveTab('comenzi'); fetchData();
      } else arataToast('error', "Eroare la plasarea comenzii");
    } catch (err) { arataToast('error', "Eroare conexiune"); }
  };

  const actualizeazaStatus = async (id, statusNou) => {
    const token = localStorage.getItem('adminToken');
    setComenzi(prevComenzi => prevComenzi.map(c => c._id === id ? { ...c, status: statusNou } : c));
    try {
      const res = await fetch(`${API_URL}/api/comenzi/${id}/status`, {
        method: 'PATCH', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: statusNou })
      });
      if (res.status === 401 || res.status === 403) return delogareSilentioasa();
      if (res.ok) arataToast('success', "Status actualizat!");
      else arataToast('error', "Eroare status");
      fetchData(); 
    } catch (err) { arataToast('error', "Eroare rețea"); }
  };

  const executeStergereSAUAnulare = async () => {
    const token = localStorage.getItem('adminToken');
    try {
      let endpoint, method, bodyPayload = null;
      
      if (confirmModal.type === 'stergere') {
        method = 'DELETE';
        endpoint = editModal.type === 'draft' ? `${API_URL}/api/comenzi/abandonat/${confirmModal.id}` : `${API_URL}/api/comenzi/${confirmModal.id}`;
      } else {
        method = 'PATCH';
        endpoint = `${API_URL}/api/comenzi/${confirmModal.id}/status`;
        bodyPayload = JSON.stringify({ status: 'Anulată' });
      }

      const res = await fetch(endpoint, {
        method, headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: bodyPayload
      });
      if (res.status === 401 || res.status === 403) return delogareSilentioasa();
      
      if(res.ok) {
        arataToast('success', confirmModal.type === 'stergere' ? "Comandă ștearsă complet!" : "Comandă anulată!");
        setConfirmModal({ isOpen: false, id: null, type: '' }); setEditModal({ isOpen: false, type: '', item: null }); fetchData();
      }
    } catch (err) { arataToast('error', "Eroare server!"); }
  };

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Nouă': return { bg: '#e0f2fe', color: '#0284c7', border: '#bae6fd' };
      case 'Confirmată': return { bg: '#fef3c7', color: '#d97706', border: '#fde68a' };
      case 'Trimisă': return { bg: '#f3e8ff', color: '#9333ea', border: '#e9d5ff' };
      case 'Livrată': return { bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
      case 'Returnată': case 'Anulată': return { bg: '#fee2e2', color: '#dc2626', border: '#fecaca' };
      default: return { bg: '#f1f5f9', color: '#475569', border: '#cbd5e1' };
    }
  };

  const getSursaBadge = (sursa) => {
    const s = sursa ? sursa.toLowerCase() : '';
    if (s.includes('facebook')) return { text: 'Facebook', bg: '#dbeafe', color: '#2563eb', border: '#bfdbfe' };
    if (s.includes('tine') || s.includes('admin')) return { text: 'Creată de Admin', bg: '#f3e8ff', color: '#9333ea', border: '#e9d5ff' };
    return { text: 'Organic / Direct', bg: '#dcfce7', color: '#16a34a', border: '#bbf7d0' };
  };

  if (isLoading) return <div className="ac-loader"><div className="ac-spinner"></div></div>;

const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedItems(listaFiltrata.map(item => item._id));
    } else {
      setSelectedItems([]);
    }
  };

  const handleSelectItem = (id) => {
    if (selectedItems.includes(id)) {
      setSelectedItems(selectedItems.filter(itemId => itemId !== id));
    } else {
      setSelectedItems([...selectedItems, id]);
    }
  };

  const exportaSelectate = () => {
    const itemsToExport = listaFiltrata.filter(item => selectedItems.includes(item._id));
    if (itemsToExport.length === 0) return arataToast('error', 'Selectează cel puțin o comandă!');
    
    const headers = ['Data', 'Nume Client', 'Telefon', 'Email', 'Produs', 'Cantitate', 'Total', 'Status'];
    const rows = itemsToExport.map(c => [
      new Date(c.createdAt || c.updatedAt).toLocaleDateString('ro-RO'),
      `"${c.numeClient || ''}"`, `"${c.telefon || ''}"`, `"${c.email || ''}"`,
      `"${c.numeProdus || ''}"`, c.cantitate || 1, c.total || 0, `"${c.status || ''}"`
    ]);
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers.join(',') + '\n' + rows.map(e => e.join(',')).join('\n');
    const link = document.createElement("a");
    link.href = encodeURI(csvContent);
    link.download = `Export_Selectate_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link); link.click(); document.body.removeChild(link);
    arataToast('success', 'Fișier descărcat!');
    setSelectedItems([]); // reset
  };

  const stergeSelectate = async () => {
    const confirm = window.confirm(`Ești sigur că vrei să ștergi DEFINITIV cele ${selectedItems.length} comenzi selectate?`);
    if (!confirm) return;
    
    const token = localStorage.getItem('adminToken');
    try {
      // Ștergem pe rând (sau faci un endpoint de bulk_delete pe backend)
      for (const id of selectedItems) {
        const endpoint = activeTab === 'comenzi' ? `${API_URL}/api/comenzi/${id}` : `${API_URL}/api/comenzi/abandonat/${id}`;
        await fetch(endpoint, { method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` } });
      }
      arataToast('success', 'Comenzile selectate au fost șterse!');
      setSelectedItems([]);
      fetchData();
    } catch (e) {
      arataToast('error', 'Eroare la ștergerea multiplă!');
    }
  };

  return (
    <div className="ac-container">
      <div className="ac-header-bar">
        <div className="ac-header-left" style={{ display: 'flex', gap: '15px', alignItems: 'center', flexWrap: 'wrap' }}>
          <h1 className="ac-page-title">Gestionare Comenzi</h1>
          <button className="ac-btn-new-order" onClick={() => openEditModal({ cantitate: 1, metodaPlata: 'Ramburs', tipLivrare: 'curier', sursa: 'Creată de tine', numeProdus: '' }, 'creare')}>
            <FiPlusSquare /> Comandă Nouă
          </button>
          <button onClick={exportaCSV} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: '#10b981', color: 'white', border: 'none', padding: '10px 16px', borderRadius: '8px', fontWeight: '600', cursor: 'pointer', fontSize: '0.9rem' }}>
            <FiDownload /> Exportă CSV
          </button>
        </div>
        
        <div className="ac-header-right">
          <div className="ac-search-box">
            <FiSearch />
            <input type="text" placeholder="Caută nume, telefon..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
          </div>

          <div className="ac-filter-container">
            <button className="ac-btn" onClick={(e) => { e.stopPropagation(); setShowDropdown(!showDropdown); }}>
              <FiCalendar /> {rangeLabels[range]} <FiChevronDown />
            </button>
            
            {showDropdown && (
              <div className="ac-dropdown" style={{ width: '280px', right: 0 }}>
                {Object.keys(rangeLabels).map(key => (
                  <div key={key} className={`ac-dropdown-item ${range === key ? 'active' : ''}`} onClick={() => { setRange(key); if(key !== 'custom') setShowDropdown(false); }}>
                    {rangeLabels[key]}
                  </div>
                ))}
                
                {/* 🔥 Zona de Custom Date Range */}
                {range === 'custom' && (
                  <div style={{ padding: '15px', background: '#f8fafc', borderTop: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>De la data:</label>
                      <input type="date" value={customStartDate} onChange={e => setCustomStartDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: 'bold' }}>Până la data:</label>
                      <input type="date" value={customEndDate} onChange={e => setCustomEndDate(e.target.value)} style={{ width: '100%', padding: '8px', borderRadius: '6px', border: '1px solid #cbd5e1', marginTop: '4px' }} />
                    </div>
                    <button onClick={() => { aplicaFiltruCustom(); setShowDropdown(false); }} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px', borderRadius: '6px', fontWeight: 'bold', cursor: 'pointer', marginTop: '5px' }}>
                      Aplică Intervalul
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="ac-main-card">
        <div className="ac-tabs">
          <div className={`ac-tab ${activeTab === 'comenzi' ? 'active' : ''}`} onClick={() => setActiveTab('comenzi')}><FiShoppingBag /> Comenzi ({comenzi.length})</div>
          <div className={`ac-tab drafts-tab ${activeTab === 'drafts' ? 'active' : ''}`} onClick={() => setActiveTab('drafts')}><FiAlertCircle /> Abandonate ({drafts.length})</div>
        </div>
{selectedItems.length > 0 && (
          <div style={{ background: '#eff6ff', padding: '10px 20px', borderRadius: '10px', marginBottom: '15px', display: 'flex', gap: '15px', alignItems: 'center' }}>
            <span style={{ fontWeight: 'bold', color: '#2563eb' }}>{selectedItems.length} selectate</span>
            <button onClick={exportaSelectate} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}><FiDownload /> Exportă Selectate</button>
            <button onClick={stergeSelectate} style={{ background: '#ef4444', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '6px', cursor: 'pointer' }}><FiTrash2 /> Șterge Selectate</button>
          </div>
        )}
        <div className="ac-table-wrapper">
          <table className="ac-table">
            <thead>
              <tr>
                <th>Dată</th><th>Client</th><th>Comandă</th><th>Plată & Livrare</th>{activeTab === 'comenzi' && <th>Status</th>}
                <th>Sursă Trafic 🎯</th><th>Total</th><th className="text-right">Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {listaFiltrata.map((item) => (
                <tr key={item._id} className={item.status === 'Anulată' ? 'ac-row-cancelled' : ''}>
                  <td data-label="Dată">{new Date(item.createdAt || item.updatedAt).toLocaleDateString('ro-RO')}</td>
                  <td data-label="Client">
                    <div className="ac-truncate ac-fw-medium">{item.numeClient || '-'}</div>
                    <div style={{ color: '#475569', fontSize: '0.85rem' }}>{item.telefon}</div>
                    {item.email && <div className="ac-truncate" style={{ color: '#64748b', fontSize: '0.8rem' }}>{item.email}</div>}
                  </td>
                  <td data-label="Comandă">
                    <div className="ac-truncate ac-fw-medium">{item.numeProdus || 'Produs Magazin'}</div>
                    <span style={{ background: '#f1f5f9', padding: '2px 6px', borderRadius: '4px', fontSize: '0.8rem', color: '#475569', fontWeight: 'bold' }}>x{item.cantitate || 1} buc</span>
                  </td>
                  <td data-label="Plată & Livrare">
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.9rem', color: '#0f172a', fontWeight: '500' }}>
                      {item.metodaPlata?.toLowerCase().includes('card') ? <FiCreditCard style={{color: '#10b981'}}/> : <FiTruck style={{color: '#3b82f6'}}/>} {item.metodaPlata || 'Ramburs'}
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '5px', fontSize: '0.85rem', color: '#64748b', marginTop: '3px' }}>
                      {item.tipLivrare === 'locker' ? <><FiBox /> Easybox</> : <><FiTruck /> Curier</>}
                    </div>
                  </td>
                  {activeTab === 'comenzi' && (
                    <td data-label="Status">
                      <select className="ac-status-select" style={{ backgroundColor: getStatusStyle(item.status).bg, color: getStatusStyle(item.status).color, borderColor: getStatusStyle(item.status).border }} value={item.status || 'Nouă'} onChange={(e) => actualizeazaStatus(item._id, e.target.value)}>
                        <option value="Nouă">Nouă</option><option value="Confirmată">Confirmată</option><option value="Trimisă">Trimisă</option>
                        <option value="Livrată">Livrată</option><option value="Returnată">Returnată</option><option value="Anulată">Anulată</option>
                      </select>
                    </td>
                  )}
                  <td data-label="Sursă Trafic">
                    {(() => {
                      const stilSursa = getSursaBadge(item.sursa);
                      return <span style={{ background: stilSursa.bg, color: stilSursa.color, border: `1px solid ${stilSursa.border}`, padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', fontWeight: 'bold', display: 'inline-block' }}>{stilSursa.text}</span>;
                    })()}
                  </td>
                  <td data-label="Total" className="ac-fw-bold" style={{ color: '#e61938', fontWeight: 'bold' }}>{item.total || item.totalComanda} Lei</td>
                  <td data-label="Acțiuni" className="text-right" style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', alignItems: 'center' }}>
                    {!item.awb ? (
                      <button onClick={() => genereazaAWB(item._id)} style={{ background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', padding: '6px 10px', borderRadius: '6px', cursor: 'pointer', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '4px' }}>📦 AWB</button>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '4px' }}>
                        <span style={{ background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', padding: '4px 8px', borderRadius: '6px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>✅ {item.awb}</span>
                        <button onClick={() => genereazaAWB(item._id)} style={{ background: '#f8fafc', color: '#94a3b8', border: '1px dashed #cbd5e1', padding: '2px 8px', borderRadius: '4px', cursor: 'pointer', fontSize: '0.75rem', opacity: '0.7', transition: 'all 0.2s' }} onMouseOver={(e) => { e.currentTarget.style.opacity = '1'; e.currentTarget.style.color = '#3b82f6'; e.currentTarget.style.borderColor = '#3b82f6'; }} onMouseOut={(e) => { e.currentTarget.style.opacity = '0.7'; e.currentTarget.style.color = '#94a3b8'; e.currentTarget.style.borderColor = '#cbd5e1'; }}>🔄 Regenerează</button>
                      </div>
                    )}
                    <button onClick={() => openEditModal(item, activeTab === 'comenzi' ? 'comanda' : 'draft')} className="ac-btn-edit"><FiEdit2 /></button>
                  </td>
                </tr>
              ))}
              {listaFiltrata.length === 0 && ( <tr><td colSpan="8" style={{textAlign: 'center', padding: '30px', color: '#64748b'}}>Nicio comandă găsită.</td></tr> )}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔥 MODAL EDITARE CU LOGICĂ DE LOCKER & ADRESE */}
      {editModal.isOpen && (
        <div className="ac-modal-overlay">
          <div className="ac-modal-content">
            <div className="ac-modal-header">
              <h2>{editModal.type === 'creare' ? 'Comandă Nouă' : (editModal.type === 'draft' ? 'Recuperează Coș' : 'Editează Comanda')}</h2>
              <button onClick={() => setEditModal({isOpen: false})} className="ac-close-btn"><FiX /></button>
            </div>
            
            <div className="ac-modal-body">
              <div className="ac-form-row">
                <div className="ac-form-group" style={{flex: 2}}>
                  <label>Selectează Produsul</label>
                  <select name="numeProdus" value={formData.numeProdus || ''} onChange={handleInputChange}>
                    <option value="">-- Alege un produs --</option>
                    {produse && produse.length > 0 ? produse.map((p) => (<option key={p._id} value={p.nume}>{p.nume}</option>)) : <option disabled>Se încarcă...</option>}
                  </select>
                </div>
                <div className="ac-form-group">
                  <label>Bucăți</label>
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
                  <label>Tip Livrare</label>
                  <select name="tipLivrare" value={formData.tipLivrare || 'curier'} onChange={e => setFormData({...formData, tipLivrare: e.target.value, adresa: ''})}>
                    <option value="curier">Curier (Acasă / Birou)</option>
                    <option value="locker">Locker (Sameday Easybox)</option>
                  </select>
                </div>
                <div className="ac-form-group">
                  <label>Metodă Plată</label>
                  <select name="metodaPlata" value={formData.metodaPlata || 'Ramburs'} onChange={handleInputChange}>
                    <option value="Ramburs">Ramburs</option><option value="Card Online">Card Online</option><option value="Creată de Admin">Creată de Admin</option>
                  </select>
                </div>
              </div>

              {/* 🔥 ZONA SMART PENTRU ADRESĂ */}
              <div className="ac-form-row">
                <div className="ac-form-group" style={{ flex: 1 }}>
                  <label>Județ</label>
                  <select name="judet" value={formData.judet || ''} onChange={e => { setFormData({...formData, judet: e.target.value, localitate: '', adresa: ''}); setLockereDisponibile([]); }}>
                    <option value="">Alege Județul...</option>
                    {listaJudete.map(j => <option key={j} value={j}>{j}</option>)}
                  </select>
                </div>
                
                <div className="ac-form-group" style={{ flex: 1, position: 'relative' }}>
                  <label>Oraș / Localitate</label>
                  <input 
                    type="text" placeholder={formData.judet ? "Caută orașul..." : "Alege județul întâi"}
                    value={dropdownLocalitateDeschis ? cautareLocalitate : (formData.localitate || '')}
                    onChange={e => { setCautareLocalitate(e.target.value); setDropdownLocalitateDeschis(true); }}
                    onFocus={() => { if(formData.judet) { setDropdownLocalitateDeschis(true); setCautareLocalitate(''); } }}
                    onBlur={() => setTimeout(() => setDropdownLocalitateDeschis(false), 200)}
                    disabled={!formData.judet}
                  />
                  {dropdownLocalitateDeschis && formData.judet && (
                    <div className="custom-dropdown-list" style={{ position: 'absolute', top: '70px', left: 0, right: 0, background: 'white', border: '1px solid #cbd5e1', zIndex: 100, maxHeight: '200px', overflowY: 'auto', borderRadius: '8px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                      {listaLocalitatiFiltrate.filter(loc => (loc.name || '').toLowerCase().includes(cautareLocalitate.toLowerCase())).map((loc, idx) => (
                          <div key={idx} onMouseDown={() => { setFormData({...formData, localitate: loc.name, adresa: ''}); setDropdownLocalitateDeschis(false); setLockereDisponibile([]); }} style={{ padding: '10px', cursor: 'pointer', borderBottom: '1px solid #f1f5f9' }}>
                            {loc.name}
                          </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* ZONA PENTRU CURIER SAU LOCKER */}
              {formData.tipLivrare === 'curier' ? (
                <div className="ac-form-group">
                  <label>Adresă Livrare (Strada, Nr, Bloc)</label>
                  <input type="text" name="adresa" value={formData.adresa || ''} onChange={handleInputChange} placeholder="Ex: Str. Lalelelor, Nr. 12" />
                </div>
              ) : (
                <div style={{ background: '#f8fafc', padding: '15px', borderRadius: '10px', border: '1px solid #cbd5e1' }}>
                  <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#475569', display: 'block', marginBottom: '10px' }}>Selectare Easybox</label>
                  
                  {formData.adresa && !lockereDisponibile.length ? (
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#dcfce7', padding: '10px', borderRadius: '8px', border: '1px solid #bbf7d0' }}>
                      <span style={{ fontSize: '0.85rem', color: '#16a34a', fontWeight: 'bold' }}>📍 {formData.adresa}</span>
                      <button type="button" onClick={() => setFormData({...formData, adresa: ''})} style={{ background: 'transparent', border: 'none', color: '#dc2626', cursor: 'pointer', fontWeight: 'bold' }}>Modifică Locker</button>
                    </div>
                  ) : (
                    <>
                      <button type="button" onClick={cautaLockereInZona} style={{ background: '#3b82f6', color: 'white', border: 'none', padding: '10px 15px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', width: '100%' }}>
                        {loadingLockers ? "⏳ Se caută lockere..." : "📍 Caută Lockere în Orașul Selectat"}
                      </button>
                      {eroareLockere && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '5px' }}>{eroareLockere}</p>}
                    </>
                  )}

                  {lockereDisponibile.length > 0 && (
                    <div style={{ marginTop: '15px' }}>
                      <input type="text" placeholder="Caută după nume sau adresă locker..." value={cautareLocker} onChange={e => setCautareLocker(e.target.value)} style={{ width: '100%', padding: '8px', marginBottom: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                      <div style={{ maxHeight: '200px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px', background: 'white' }}>
                        {lockereDisponibile.filter(l => (l.name || '').toLowerCase().includes(cautareLocker.toLowerCase()) || (l.address || '').toLowerCase().includes(cautareLocker.toLowerCase())).map(locker => (
                          <div key={locker.id} onClick={() => { setFormData({...formData, adresa: `${locker.name} - ${locker.address}`}); setLockereDisponibile([]); }} style={{ padding: '10px', borderBottom: '1px solid #f1f5f9', cursor: 'pointer' }}>
                            <strong style={{ display: 'block', fontSize: '0.85rem' }}>{locker.name}</strong>
                            <span style={{ fontSize: '0.75rem', color: '#64748b' }}>{locker.address}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="ac-modal-footer" style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end', flexWrap: 'wrap' }}>
              <button onClick={handleSave} className="ac-btn-save">
                {editModal.type === 'draft' ? 'Salvează Datele (Rămâne Draft)' : 'Salvează Modificările'}
              </button>
              {editModal.type === 'draft' && (
                <button onClick={handlePlasareComandaDinDraft} style={{ background: '#10b981', color: '#fff', border: 'none', padding: '10px 15px', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold', display: 'flex', alignItems: 'center' }}>
                  <FiCheckCircle style={{ marginRight: '5px' }} /> Plasează Comanda
                </button>
              )}
              {(editModal.type === 'comanda' || editModal.type === 'draft') && (
                <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
                  {editModal.type === 'comanda' && formData.status !== 'Anulată' && (
                    <button onClick={() => setConfirmModal({isOpen: true, id: formData._id, type: 'anulare'})} className="ac-btn-cancel-order">Anulează Comanda</button>
                  )}
                  <button onClick={() => setConfirmModal({isOpen: true, id: formData._id, type: 'stergere'})} style={{ background: '#ef4444', color: 'white', border: 'none', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}>
                    <FiTrash2 /> Șterge Definitiv
                  </button>
                </div>
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
               <h3 style={{marginBottom: '20px', color: '#0f172a'}}>{confirmModal.type === 'stergere' ? 'Atenție! Comanda va fi ștearsă COMPLET din baza de date. Acțiunea este ireversibilă!' : 'Ești sigur că anulezi comanda?'}</h3>
               <div style={{display: 'flex', gap: '10px'}}>
                 <button className="ac-btn-cancel-order" style={{flex: 1}} onClick={() => setConfirmModal({isOpen: false, id: null, type: ''})}>Înapoi</button>
                 <button className="ac-btn-save" style={{flex: 1, background: '#ef4444', boxShadow: 'none'}} onClick={executeStergereSAUAnulare}>
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
            <div className="admin-toast-icon">{toast.tip === 'success' ? '✅' : toast.tip === 'error' ? '⚠️' : '🔄'}</div>
            <div>{toast.mesaj}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminComenzi;