import { useState, useEffect } from 'react';
import { FiEdit, FiTrash2, FiBox, FiAlertTriangle } from 'react-icons/fi';
import React from 'react';
const GestiuneProduse = ({ token, onEdit }) => {
  const [listaProduse, setListaProduse] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [eroare, setEroare] = useState(null); // 🛡️ FIX 2: Stare pentru erori

  // 🛡️ FIX 1: URL Dinamic
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    const fetchProduse = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`${API_URL}/api/produse`);
        
        if (!res.ok) throw new Error("Nu am putut aduce produsele de la server.");
        
        const data = await res.json();
        setListaProduse(Array.isArray(data) ? data : []);
        setEroare(null);
      } catch (err) {
        console.error("Eroare:", err);
        setEroare("Nu am putut încărca produsele. Verifică conexiunea.");
      } finally {
        setIsLoading(false);
      }
    };
    fetchProduse();
  }, [API_URL]);

  const handleStergere = async (id) => {
    if (!window.confirm("Ești sigur că vrei să ștergi definitiv acest produs?")) return;
    
    try {
      const res = await fetch(`${API_URL}/api/produse/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (res.ok) {
        setListaProduse(listaProduse.filter(p => p._id !== id));
      } else {
        alert("Eroare la ștergerea produsului din baza de date.");
      }
    } catch (err) { 
      console.error(err);
      alert("Eroare de rețea. Produsul nu a fost șters.");
    }
  };

  if (isLoading) return <div style={{padding: '2rem', textAlign: 'center'}}>Se încarcă produsele... ⏳</div>;

  return (
    <div className="gestiune-view fade-in">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Gestiune Produse</h2>
        <span style={{background: '#eff6ff', color: '#3b82f6', padding: '5px 15px', borderRadius: '20px', fontWeight: 'bold'}}>
          {listaProduse.length} Produse Active
        </span>
      </div>

      <div className="admin-card" style={{padding: 0, overflow: 'hidden'}}>
        {eroare ? (
          <div style={{padding: '3rem', textAlign: 'center', color: '#ef4444'}}>
            <FiAlertTriangle size={40} style={{marginBottom: '10px'}} />
            <p>{eroare}</p>
          </div>
        ) : listaProduse.length === 0 ? (
          <div style={{padding: '3rem', textAlign: 'center', color: '#64748b'}}>
            <FiBox size={40} style={{marginBottom: '10px', opacity: 0.5}} />
            <p>Nu ai niciun produs. Mergi la "Adaugă Produs".</p>
          </div>
        ) : (
          <table className="orders-table">
            <thead>
              <tr>
                <th>Imagine</th>
                <th>Nume Produs</th>
                <th>Categorie</th>
                <th>Preț</th>
                <th>Acțiuni</th>
              </tr>
            </thead>
            <tbody>
              {listaProduse.map(p => (
                <tr key={p._id} className="table-row-hover">
                  <td>
                    <img 
                      src={p.imaginePrincipala || 'https://via.placeholder.com/50?text=Fara+Poza'} 
                      alt={p.nume} 
                      width="50" 
                      style={{borderRadius: '8px', objectFit: 'cover', height: '50px', border: '1px solid #e2e8f0'}} 
                      // 🛡️ FIX 3: Dacă url-ul există dar e stricat, punem un placeholder automat
                      onError={(e) => { e.target.src = 'https://via.placeholder.com/50?text=Eroare'; }}
                    />
                  </td>
                  <td><strong>{p.nume}</strong></td>
                  <td>
                    <span style={{background: '#f1f5f9', padding: '4px 10px', borderRadius: '6px', fontSize: '0.85rem', color: '#475569'}}>
                      {p.categorie || 'General'}
                    </span>
                  </td>
                  <td><strong style={{color: '#10b981'}}>{p.pret} Lei</strong></td>
                  <td>
                    <button onClick={() => onEdit(p)} className="btn-action edit" title="Editează"><FiEdit /></button>
                    <button onClick={() => handleStergere(p._id)} className="btn-action delete" title="Șterge"><FiTrash2 /></button>
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

export default GestiuneProduse;