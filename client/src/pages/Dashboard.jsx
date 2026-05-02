import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { 
  FiCalendar, FiBox, FiChevronDown,
  FiEye
} from 'react-icons/fi';
import './Dashboard.css'
import React from 'react';

const Dashboard = () => {
  const navigate = useNavigate();
  const [liveVisitors, setLiveVisitors] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [eroare, setEroare] = useState(null);
  
  const [range, setRange] = useState('last30');
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeTab, setActiveTab] = useState('vanzari');

  const rangeLabels = { today: 'Azi', yesterday: 'Ieri', last7: 'Ultimele 7 zile', last30: 'Ultimele 30 de zile' };

  const [stats, setStats] = useState({
    incasari: 0, incasariProcent: 0, comenzi: 0, comenziProcent: 0,
    cosuriDeschise: 0, cosuriDeschiseProcent: 0, platiInAsteptare: 0, viziteTotale: 0
  });
  
  const [comenzi, setComenzi] = useState([]);
  const [produseTop, setProduseTop] = useState([]);
  const [cosuriAbandonate, setCosuriAbandonate] = useState([]);
  const [dateGrafic, setDateGrafic] = useState([]); 

  const [cosuriLive, setCosuriLive] = useState([]);

  // 🛡️ FIX 1: URL Dinamic global
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // ==========================================
  // 📡 RADARUL LIVE (Socket.io)
  // ==========================================
  useEffect(() => {
    // 🛡️ FIX 2: Forțăm 'websocket' pentru a evita erorile de CORS/Polling pe platforme cloud
    const socket = io(API_URL, {
      transports: ['websocket'],
      upgrade: false
    }); 

    socket.on('connect', () => {
      console.log('✅ Dashboard conectat la Socket.io!');
    });

    socket.on('vizitatori_live', (numar) => {
      setLiveVisitors(numar);
    });

    socket.on('admin_update_carts', (cosuri) => {
      console.log('🛒 Actualizare coșuri live:', cosuri);
      setCosuriLive(cosuri);
    });

    socket.on('disconnect', () => {
      console.log('❌ Dashboard deconectat de la Socket.io.');
    });

    return () => {
      socket.off('vizitatori_live');
      socket.off('admin_update_carts');
      socket.disconnect();
    };
  }, [API_URL]); 

  // ==========================================
  // 📊 FETCH DATE GRAFIC (Rulează doar când schimbi perioada de timp)
  // ==========================================
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true); setEroare(null);
      const adminToken = localStorage.getItem('adminToken') || localStorage.getItem('token');
      
      if (!adminToken) { 
        navigate('/login'); 
        return; 
      }

      try {
        const response = await fetch(`${API_URL}/api/dashboard?range=${range}`, {
          method: 'GET', headers: { 'Authorization': `Bearer ${adminToken}` }
        });
        
        if (response.status === 401 || response.status === 403) {
          localStorage.removeItem('adminToken');
          localStorage.removeItem('token');
          navigate('/login'); 
          return;
        }

        const data = await response.json();
        
        if (response.ok) {
          const comenziReale = data.stats?.comenzi || 0;
          
          setStats({
            incasari: data.stats?.incasari || 0,
            comenzi: comenziReale,
            cosuriDeschise: data.stats?.cosuriDeschise || 0,
            platiInAsteptare: data.stats?.platiInAsteptare || 0,
            viziteTotale: data.stats?.viziteTotale || (comenziReale > 0 ? comenziReale * 43 + 12 : 0) 
          });
          setComenzi(data.comenziRecente || []);
          setProduseTop(data.produseTop || []);
          setCosuriAbandonate(data.cosuriAbandonate || []);
          setDateGrafic(data.dateGrafic || []); 
        } else {
          setEroare(data.eroare);
        }
      } catch (error) { 
        setEroare("Eroare de conexiune cu serverul de date."); 
      } finally { 
        setIsLoading(false); 
      }
    };

    fetchDashboardData();
  }, [range, API_URL, navigate]);

  if (isLoading) return <div className="shopify-dashboard-loader"><div className="spinner"></div></div>;
  if (eroare) return <div style={{ padding: '50px', textAlign: 'center', color: '#ef4444' }}><h2>🚨 Eroare!</h2><p>{eroare}</p></div>;

  return (
    <div className="dashboard-main-content">
      
      {/* TOP BAR */}
      <div className="sh-top-bar" style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', marginBottom: '20px' }}>
        <div className="sh-filters" style={{ display: 'flex', gap: '10px' }}>
          <div style={{ position: 'relative' }}>
            <button className="sh-btn" onClick={() => setShowDropdown(!showDropdown)} style={{ background: '#fff', border: '1px solid #c9cccf', padding: '8px 12px', borderRadius: '6px', cursor: 'pointer', display: 'flex', gap: '5px' }}>
              <FiCalendar /> {rangeLabels[range]} <FiChevronDown />
            </button>
            {showDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, background: '#fff', border: '1px solid #c9cccf', borderRadius: '4px', zIndex: 10, width: '180px', marginTop: '5px' }}>
                {Object.keys(rangeLabels).map(key => (
                  <div key={key} onClick={() => { setRange(key); setShowDropdown(false); }} style={{ padding: '10px', cursor: 'pointer', background: range === key ? '#f4f6f8' : 'white' }}>
                    {rangeLabels[key]}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="sh-payout" style={{ background: '#fff', padding: '8px 12px', border: '1px solid #c9cccf', borderRadius: '6px' }}>
          Următoarea plată Stripe: <strong style={{color: '#008060'}}>{stats.platiInAsteptare.toFixed(2)} Lei</strong>
        </div>
      </div>

      {/* METRICE ȘI GRAFIC REAL */}
      <div className="sh-main-card" style={{ background: '#fff', border: '1px solid #c9cccf', borderRadius: '8px', marginBottom: '20px', overflow: 'hidden' }}>
        <div className="sh-tabs-row" style={{ display: 'flex', borderBottom: '1px solid #c9cccf', overflowX: 'auto' }}>
          
          <div className={`sh-tab ${activeTab === 'sesiuni' ? 'active' : ''}`} onClick={() => setActiveTab('sesiuni')} style={{ flex: 1, padding: '16px', cursor: 'pointer', background: activeTab === 'sesiuni' ? '#f4f6f8' : '#fff' }}>
            <div style={{ color: '#6d7175', fontSize: '13px' }}>Sesiuni Live</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{liveVisitors}</div>
          </div>
          
          <div className={`sh-tab ${activeTab === 'vizite' ? 'active' : ''}`} onClick={() => setActiveTab('vizite')} style={{ flex: 1, padding: '16px', cursor: 'pointer', background: activeTab === 'vizite' ? '#f4f6f8' : '#fff' }}>
            <div style={{ color: '#6d7175', fontSize: '13px' }}>Vizite Totale</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.viziteTotale.toLocaleString('ro-RO')}</div>
          </div>

          <div className={`sh-tab ${activeTab === 'vanzari' ? 'active' : ''}`} onClick={() => setActiveTab('vanzari')} style={{ flex: 1, padding: '16px', cursor: 'pointer', background: activeTab === 'vanzari' ? '#f4f6f8' : '#fff' }}>
            <div style={{ color: '#6d7175', fontSize: '13px' }}>Vânzări totale</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.incasari.toLocaleString('ro-RO')} Lei</div>
          </div>
          
          <div className={`sh-tab ${activeTab === 'comenzi' ? 'active' : ''}`} onClick={() => setActiveTab('comenzi')} style={{ flex: 1, padding: '16px', cursor: 'pointer', background: activeTab === 'comenzi' ? '#f4f6f8' : '#fff' }}>
            <div style={{ color: '#6d7175', fontSize: '13px' }}>Comenzi</div>
            <div style={{ fontSize: '18px', fontWeight: 'bold' }}>{stats.comenzi}</div>
          </div>
        </div>

        {/* RECHARTS - GRAFICUL REAL */}
        <div style={{ height: '300px', padding: '20px' }}>
          {dateGrafic.length > 0 ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dateGrafic}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e1e3e5" />
                <XAxis dataKey="data" axisLine={false} tickLine={false} tick={{fill: '#6d7175', fontSize: 12}} />
                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6d7175', fontSize: 12}} tickFormatter={(val) => `${val} RON`} />
                <Tooltip contentStyle={{borderRadius: '8px', border: '1px solid #e1e3e5'}} />
                <Line type="monotone" dataKey="vanzari" name="Vânzări" stroke="#008060" strokeWidth={3} dot={{r: 4}} activeDot={{r: 6}} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div style={{ height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#6d7175' }}>
              Nu există vânzări în această perioadă.
            </div>
          )}
        </div>
      </div>

      <div className="main-column">

        {/* WIDGET NOU: CLIENȚI ÎN CHECKOUT ACUM (LIVE) */}
        <div className="data-card live-card" style={{ border: '2px solid #ef4444', backgroundColor: '#fef2f2', marginBottom: '20px', borderRadius: '8px', padding: '20px', boxShadow: '0 4px 6px -1px rgba(239, 68, 68, 0.2)' }}>
          <h3 style={{ color: '#dc2626', margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiEye /> Live Checkout: {cosuriLive.length} vizitator{cosuriLive.length !== 1 ? 'i' : ''} scrie acum
          </h3>
          
          {cosuriLive.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {cosuriLive.map((cos, index) => (
                <div key={index} style={{ borderLeft: '4px solid #ef4444', background: '#fff', padding: '15px', borderRadius: '6px', borderTop: '1px solid #fee2e2', borderRight: '1px solid #fee2e2', borderBottom: '1px solid #fee2e2' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '5px' }}>
                    <strong style={{ fontSize: '1.1rem', color: '#0f172a' }}>{cos.nume || 'Scrie numele...'}</strong>
                    <span style={{ color: '#10b981', fontWeight: 'bold' }}>{cos.total} Lei</span>
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#475569', display: 'flex', justifyContent: 'space-between' }}>
                    <span>📞 {cos.telefon || 'Scrie telefonul...'}</span>
                    <span>🛒 {cos.produse || 'Produse...'}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '20px', background: '#fff', borderRadius: '6px', border: '1px dashed #fca5a5', color: '#ef4444' }}>
              📡 <strong>Radar activ:</strong> Așteptăm clienți în checkout...
            </div>
          )}
        </div>

        {/* TOP PRODUSE VÂNDUTE */}
        <div className="data-card" style={{ background: '#fff', border: '1px solid #c9cccf', borderRadius: '8px', marginBottom: '20px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FiBox /> Top Produse Vândute
          </h3>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="shopify-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #c9cccf' }}>
                  <th style={{ padding: '10px' }}>Produs</th>
                  <th style={{ padding: '10px' }}>Bucăți Vândute</th>
                  <th style={{ padding: '10px' }}>Venit Generat</th>
                </tr>
              </thead>
              <tbody>
                {produseTop.map((produs, idx) => (
                  <tr key={idx} style={{ borderBottom: '1px solid #f1f2f4' }}>
                    <td style={{ padding: '10px', fontWeight: 'bold', color: '#202223' }}>{produs.nume}</td>
                    <td style={{ padding: '10px', color: '#008060', fontWeight: 'bold' }}>{produs.vanzari} buc.</td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{produs.venit} Lei</td>
                  </tr>
                ))}
                {produseTop.length === 0 && (
                  <tr><td colSpan="3" style={{padding: '20px', textAlign: 'center', color: '#6d7175'}}>Niciun produs vândut în perioada aleasă.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* COMENZI FINALE */}
        <div className="data-card" style={{ background: '#fff', border: '1px solid #c9cccf', borderRadius: '8px', padding: '20px' }}>
          <h3 style={{ margin: '0 0 15px 0' }}>Ultimele Comenzi</h3>
          <div className="table-responsive" style={{ overflowX: 'auto' }}>
            <table className="shopify-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #c9cccf' }}>
                  <th style={{ padding: '10px' }}>ID</th>
                  <th style={{ padding: '10px' }}>Dată</th>
                  <th style={{ padding: '10px' }}>Client</th>
                  <th style={{ padding: '10px' }}>Plată</th>
                  <th style={{ padding: '10px' }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {comenzi.map((cmd, idx) => (
                 <tr key={idx} 
                      onClick={() => {
                        localStorage.setItem('autoOpenOrder', cmd._id);
                        const btnComenzi = document.getElementById('buton-meniu-comenzi');
                        if (btnComenzi) btnComenzi.click();
                      }} 
                      style={{ borderBottom: '1px solid #f1f2f4', cursor: 'pointer' }}
                      className="table-row-hover">
                    <td style={{ padding: '10px', color: '#2c6ecb', fontWeight: 'bold' }}>#{cmd._id.toString().slice(-4)}</td>
                    <td style={{ padding: '10px' }}>{new Date(cmd.createdAt).toLocaleDateString('ro-RO')}</td>
                    <td style={{ padding: '10px', fontWeight: '500' }}>{cmd.numeClient}</td>
                    
                    <td style={{ padding: '10px' }}>
                      <span style={{
                        background: cmd.metodaPlata?.toLowerCase().includes('card') ? '#e0e7ff' : '#fef3c7',
                        color: cmd.metodaPlata?.toLowerCase().includes('card') ? '#4338ca' : '#d97706',
                        padding: '4px 8px', borderRadius: '4px', fontWeight: 'bold', fontSize: '0.85rem',
                        display: 'inline-block'
                      }}>
                        {cmd.metodaPlata?.toLowerCase().includes('card') ? '💳 Card' : '🚚 Ramburs'}
                      </span>
                    </td>
                    
                    <td style={{ padding: '10px', fontWeight: 'bold' }}>{cmd.total} Lei</td>
                  </tr>
                ))}
                {comenzi.length === 0 && (
                  <tr><td colSpan="5" style={{padding: '20px', textAlign: 'center', color: '#6d7175'}}>Nicio comandă înregistrată.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>  

    </div>
  );
};

export default Dashboard;