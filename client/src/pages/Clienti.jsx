import React, { useState, useEffect } from 'react';
import { FiMail, FiUser, FiTrash2, FiMessageSquare, FiAlertTriangle } from 'react-icons/fi';
import './Clienti.css'; 

const Clienti = ({ token }) => {
  const [subTab, setSubTab] = useState('mesaje'); 
  const [mesajeContact, setMesajeContact] = useState([]);
  const [utilizatori, setUtilizatori] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eroare, setEroare] = useState(null); // 🛡️ FIX 2: Stare pentru erori

  // 🛡️ FIX 1: URL Dinamic
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true);
      setEroare(null);
      
      try {
        if (subTab === 'mesaje') {
          const res = await fetch(`${API_URL}/api/admin/mesaje`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Nu am putut aduce mesajele.");
          const data = await res.json();
          setMesajeContact(Array.isArray(data) ? data : []);
        } else if (subTab === 'conturi') {
          const res = await fetch(`${API_URL}/api/admin/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
          });
          if (!res.ok) throw new Error("Nu am putut aduce utilizatorii.");
          const data = await res.json();
          setUtilizatori(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error("Eroare:", err);
        setEroare("Eroare de conexiune la server. Verifică rețeaua.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [subTab, token, API_URL]);

  const stergeMesaj = async (id) => {
    if (!window.confirm("Ștergi definitiv acest mesaj?")) return;
    try {
      const res = await fetch(`${API_URL}/api/contact/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setMesajeContact(mesajeContact.filter(m => m._id !== id));
      } else {
        alert("Eroare la ștergerea mesajului.");
      }
    } catch (err) { 
      console.error(err);
      alert("Eroare de rețea.");
    }
  };

  return (
    <div className="cl-wrapper fade-in">
      <div className="cl-header">
        <h2>Bază de Date Clienți</h2>
        
        <div className="cl-tabs-container">
          <button 
            className={`cl-tab-btn ${subTab === 'mesaje' ? 'active-mesaje' : ''}`}
            onClick={() => setSubTab('mesaje')}
          >
            <FiMessageSquare className="cl-icon" /> Mesaje Formular
          </button>
          <button 
            className={`cl-tab-btn ${subTab === 'conturi' ? 'active-conturi' : ''}`}
            onClick={() => setSubTab('conturi')}
          >
            <FiUser className="cl-icon" /> Conturi Înregistrate
          </button>
        </div>
      </div>

      <div className="admin-card cl-card">
        {isLoading ? (
          <p className="cl-empty">Se încarcă datele... ⏳</p>
        ) : eroare ? (
          <div className="cl-empty" style={{ color: '#ef4444' }}>
            <FiAlertTriangle size={30} style={{ marginBottom: '10px' }} />
            <p>{eroare}</p>
          </div>
        ) : subTab === 'mesaje' ? (
          mesajeContact.length === 0 ? (
            <p className="cl-empty">Niciun mesaj primit prin formular.</p>
          ) : (
            <div className="cl-table-responsive">
              <table className="orders-table">
                <thead>
                  <tr><th>Data</th><th>Nume & Email</th><th>Subiect</th><th>Mesaj</th><th style={{textAlign: 'right'}}>Acțiuni</th></tr>
                </thead>
                <tbody>
                  {mesajeContact.map(m => (
                    <tr key={m._id} className="table-row-hover">
                      <td data-label="Data" className="cl-td-data">{new Date(m.createdAt).toLocaleDateString('ro-RO')}</td>
                      <td data-label="Nume & Email">
                        <strong>{m.nume}</strong><br/>
                        <a href={`mailto:${m.email}`} className="cl-link-blue"><FiMail /> {m.email}</a>
                      </td>
                      <td data-label="Subiect"><span className="cl-badge-orange">{m.subiect}</span></td>
                      <td data-label="Mesaj" className="cl-td-msg">{m.mesaj}</td>
                      <td data-label="Acțiuni" style={{textAlign: 'right'}}>
                        <button onClick={() => stergeMesaj(m._id)} className="btn-action delete cl-del-btn" title="Șterge">
                          <FiTrash2 />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : (
          utilizatori.length === 0 ? (
            <p className="cl-empty">Niciun cont înregistrat momentan.</p>
          ) : (
            <div className="cl-table-responsive">
              <table className="orders-table">
                <thead>
                  <tr><th>Data Înregistrării</th><th>Nume Client</th><th>Email</th><th style={{textAlign: 'right'}}>Rol</th></tr>
                </thead>
                <tbody>
                  {utilizatori.map(u => (
                    <tr key={u._id} className="table-row-hover">
                      <td data-label="Data" className="cl-td-data">{new Date(u.createdAt).toLocaleDateString('ro-RO')}</td>
                      <td data-label="Nume Client"><strong>{u.nume || 'Fără Nume'}</strong></td>
                      <td data-label="Email"><a href={`mailto:${u.email}`} className="cl-link-green"><FiMail /> {u.email}</a></td>
                      <td data-label="Rol" style={{textAlign: 'right'}}>
                        {/* 🛡️ FIX 3: Verificare duală a rolului */}
                        <span className={(u.role === 'admin' || u.isAdmin) ? 'cl-badge-red' : 'cl-badge-purple'}>
                          {(u.role === 'admin' || u.isAdmin) ? 'Admin' : 'Client'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        )}
      </div>
    </div>
  );
};

export default Clienti;