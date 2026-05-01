import { useState, useEffect } from 'react';
import { FiCheck, FiXCircle, FiTrash2, FiStar, FiAlertTriangle } from 'react-icons/fi';
import React from 'react';
const Recenzii = ({ token }) => {
  const [recenzii, setRecenzii] = useState([]);
  const [loading, setLoading] = useState(true);
  const [eroare, setEroare] = useState(null);

  // 🛡️ FIX 1: URL Dinamic
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchRecenzii = async () => {
      try {
        setLoading(true);
        const res = await fetch(`${API_URL}/api/recenzii/admin`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        
        if (!res.ok) throw new Error("Nu am putut aduce recenziile.");
        
        const data = await res.json();
        setRecenzii(Array.isArray(data) ? data : []);
        setEroare(null);
      } catch (err) { 
        console.error(err); 
        setEroare("Eroare de conexiune cu serverul.");
      } finally {
        setLoading(false);
      }
    };
    fetchRecenzii();
  }, [token, API_URL]);

  const schimbaStatus = async (id, statusNou) => {
    try {
      const res = await fetch(`${API_URL}/api/recenzii/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ status: statusNou })
      });
      if (res.ok) setRecenzii(recenzii.map(r => r._id === id ? { ...r, status: statusNou } : r));
    } catch (err) { console.error(err); }
  };

  const handleStergere = async (id) => {
    if (!window.confirm("Ștergi definitiv această recenzie?")) return;
    try {
      const res = await fetch(`${API_URL}/api/recenzii/${id}`, {
        method: 'DELETE', headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) setRecenzii(recenzii.filter(r => r._id !== id));
    } catch (err) { console.error(err); }
  };

  const renderStele = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FiStar key={i} style={{ color: i < rating ? '#fbbf24' : '#e2e8f0', fill: i < rating ? '#fbbf24' : 'transparent' }} />
    ));
  };

  return (
    <div className="reviews-view fade-in">
      <h2>Moderare Recenzii</h2>
      <div className="admin-card" style={{padding: 0, overflow: 'hidden'}}>
        
        {/* 🛡️ FIX 2: Stări clare de afișare */}
        {loading ? (
          <p style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>Se încarcă recenziile...</p>
        ) : eroare ? (
          <p style={{padding: '2rem', textAlign: 'center', color: '#ef4444'}}><FiAlertTriangle /> {eroare}</p>
        ) : recenzii.length === 0 ? (
          <p style={{padding: '2rem', textAlign: 'center', color: '#64748b'}}>Nu ai recenzii de moderat momentan.</p>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Client & Rating</th>
                <th>Mesaj</th>
                <th>Poză</th>
                <th>Status</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {recenzii.map(r => (
                <tr key={r._id} style={{ backgroundColor: r.status === 'in_asteptare' ? '#fffbeb' : 'transparent' }}>
                  <td>
                    <strong>{r.numeClient}</strong><br/>
                    <div style={{display: 'flex', gap: '2px', marginTop: '5px'}}>{renderStele(r.rating)}</div>
                    <small style={{color: '#94a3b8', display: 'block', marginTop: '4px'}}>{r.produsId?.nume || "Produs șters"}</small>
                  </td>
                  <td style={{ maxWidth: '300px', fontSize: '0.95rem', color: '#334155', lineHeight: '1.5' }}>
                    "{r.text}"
                    {/* Radarul de lungime pentru scanare rapidă */}
                    <div style={{ 
                      marginTop: '8px', 
                      fontSize: '0.75rem', 
                      fontWeight: 'bold',
                      color: r.text.length < 120 ? '#10b981' : '#f59e0b' 
                    }}>
                      {r.text.length} caractere {r.text.length < 120 ? '(Optim)' : '(Lung)'}
                    </div>
                  </td>
                  <td>
                    {r.imagineUrl ? 
                      <img src={r.imagineUrl} alt="Review" style={{ width: '60px', height: '60px', objectFit: 'cover', borderRadius: '10px', border: '2px solid #e2e8f0' }} /> : 
                      <span style={{color: '#cbd5e1', fontSize: '0.85rem'}}>Fără poză</span>
                    }
                  </td>
                  <td>
                    <span className={`badge-status ${r.status}`}>
                      {r.status === 'in_asteptare' ? '⏳ În așteptare' : (r.status === 'aprobata' ? '✅ Aprobată' : '❌ Respinsă')}
                    </span>
                  </td>
                  <td style={{ display: 'flex', gap: '10px' }}>
                    {r.status !== 'aprobata' && <button onClick={() => schimbaStatus(r._id, 'aprobata')} className="btn-action approve" title="Aprobă"><FiCheck /></button>}
                    {r.status !== 'respinsa' && <button onClick={() => schimbaStatus(r._id, 'respinsa')} className="btn-action reject" title="Respinge"><FiXCircle /></button>}
                    <button onClick={() => handleStergere(r._id)} className="btn-action delete" title="Șterge"><FiTrash2 /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default Recenzii;