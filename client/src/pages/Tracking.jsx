import { useState } from 'react';
import { FiSearch, FiPackage, FiTruck, FiCheckCircle, FiClock } from 'react-icons/fi';
import './Tracking.css';

const Tracking = () => {
  const [telefon, setTelefon] = useState('');
  const [rezultate, setRezultate] = useState(null);
  const [eroare, setEroare] = useState('');
  const [loading, setLoading] = useState(false);

  const handleTrack = async (e) => {
    e.preventDefault();
    setLoading(true);
    setEroare('');
    setRezultate(null);

    try {
      const res = await fetch(`http://localhost:5000/api/comenzi/track/${telefon}`);
      const data = await res.json();
      
      if (res.ok) {
        setRezultate(data);
      } else {
        setEroare(data.mesaj || "Eroare la căutare.");
      }
    } catch (err) {
      setEroare("Nu ne putem conecta la server.");
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch(status) {
      case 'Nouă': return <FiClock className="status-icon pending" />;
      case 'Confirmată': return <FiCheckCircle className="status-icon confirmed" />;
      case 'Expediată': return <FiTruck className="status-icon shipped" />;
      default: return <FiPackage className="status-icon" />;
    }
  };

  return (
    <div className="tracking-wrapper fade-in">
      <div className="container">
        <div className="tracking-card">
          <h1>Urmărește Comanda Ta 📦</h1>
          <p>Introdu numărul de telefon folosit la plasarea comenzii.</p>

          <form onSubmit={handleTrack} className="tracking-form">
            <div className="search-input-wrapper">
              <input 
                type="tel" 
                placeholder="Ex: 0722123456" 
                value={telefon}
                onChange={(e) => setTelefon(e.target.value)}
                required
              />
              <button type="submit" disabled={loading}>
                {loading ? "Căutăm..." : <FiSearch />}
              </button>
            </div>
          </form>

          {eroare && <p className="track-error">{eroare}</p>}

          {rezultate && (
            <div className="results-list fade-in">
              {rezultate.map(comanda => (
                <div key={comanda._id} className="order-result-item">
                  <div className="order-header">
                    <span className="order-id">Comanda #{comanda._id.substring(18)}</span>
                    <span className={`order-status-badge ${comanda.status.toLowerCase()}`}>
                      {comanda.status}
                    </span>
                  </div>
                  
                  <div className="order-details">
                    <img src={comanda.produsId?.imaginePrincipala} alt="" />
                    <div>
                      <h4>{comanda.produsId?.nume}</h4>
                      <p>Preț: {comanda.total} lei</p>
                    </div>
                  </div>

                  <div className="order-timeline">
                    <div className={`step ${comanda.status === 'Nouă' ? 'active' : 'done'}`}>
                      {getStatusIcon('Nouă')}
                      <span>Primită</span>
                    </div>
                    <div className={`step ${comanda.status === 'Confirmată' ? 'active' : (comanda.status === 'Expediată' ? 'done' : '')}`}>
                      {getStatusIcon('Confirmată')}
                      <span>Confirmată</span>
                    </div>
                    <div className={`step ${comanda.status === 'Expediată' ? 'active' : ''}`}>
                      {getStatusIcon('Expediată')}
                      <span>Expediată</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Tracking;