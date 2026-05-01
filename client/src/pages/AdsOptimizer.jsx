import React, { useState, useEffect } from 'react';
import { 
  FiActivity, FiTarget, FiTrendingUp, FiAlertOctagon, FiCpu, 
  FiClock, FiZap, FiAward, FiChevronDown, FiChevronUp, 
  FiPower, FiAlertTriangle, FiTrash2, FiEyeOff, FiCalendar
} from 'react-icons/fi';
import { 
  LineChart, Line, XAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell 
} from 'recharts';
import './AdsOptimizer.css';

const AdsOptimizer = () => {
  const [ads, setAds] = useState([]);
  const [cimitir, setCimitir] = useState([]);
  const [profitMediu, setProfitMediu] = useState(0); 
  const [audiente, setAudiente] = useState({ winner: null, loser: null });
  const [ziSlaba, setZiSlaba] = useState(false);
  const [aiSummary, setAiSummary] = useState("");
  const [range, setRange] = useState('last7');
  const [showCimitir, setShowCimitir] = useState(false);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  // 100% REAL DATA STATES
  const [topStats, setTopStats] = useState({ roas: "0.00", cpa: "0", spend: 0, vanzari: 0, profitNet: 0 });
  const [dataRoas, setDataRoas] = useState([]);
  const [dataProfit, setDataProfit] = useState([]);

  const [simBuget, setSimBuget] = useState(300);
  const [simScalare, setSimScalare] = useState(20);

  const zileSaptamana = ["Duminică", "Luni", "Marți", "Miercuri", "Joi", "Vineri", "Sâmbătă"];
  const ziCurentaNume = zileSaptamana[new Date().getDay()];

  const fetchAds = async () => {
    setLoading(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/admin/ads-optimizer?range=${range}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Dacă backend-ul trimite eroare (ex: token expirat sau greșit), urlăm pe ecran!
      if (data.eroare) {
        alert("❌ EROARE SERVER: " + data.eroare);
        console.error(data.eroare);
        setLoading(false);
        return;
      }
      
      setAds(data.adsData || []);
      setCimitir(data.cimitirData || []);
      setProfitMediu(data.profitMediu || 0);
      setAudiente({ winner: data.winnerAudience, loser: data.loserAudience });
      setZiSlaba(data.eZiSlaba || false);
      setAiSummary(data.aiSummary || "");
      
      setTopStats(data.globalStats || { roas: "0.00", cpa: "0", spend: 0, vanzari: 0, profitNet: 0 });
      setDataRoas(data.chartDataRoas || []);
      setDataProfit(data.chartDataProfit || []);
      
    } catch (err) { 
      alert("❌ EROARE CRITICĂ: Nu mă pot conecta la backend-ul tău! Verifică server.js.");
      console.error("Eroare Frontend:", err); 
    } finally { 
      setLoading(false); 
    }
  };

  useEffect(() => {
    fetchAds();
  }, [range]);

  const handleDirectAction = async (adsetId, actionType, newBudget = null) => {
    const msg = actionType === 'PAUSE' ? "Vrei să OPREȘTI DEFINITIV acest AdSet?" : `Vrei să SCALEZI bugetul la ${newBudget} Lei?`;
    if (!window.confirm(msg)) return;

    setActionLoading(true);
    const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
    
    try {
      const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await fetch(`${apiUrl}/api/admin/ads-action`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify({ adsetId, actionType, newBudget })
      });
      
      const data = await res.json();
      if (data.eroare) alert("Eroare de la Facebook: " + data.eroare);
      else {
        alert("✅ Succes: " + data.mesaj);
        fetchAds();
      }
    } catch (err) {
      alert("Eroare de conexiune la server!");
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && ads.length === 0) return (
    <div className="loader-bomba-container">
      <div className="loader-bomba-spinner"></div>
      <div>
        <span>Sincronizare LIVE cu Facebook...</span>
        <p>Aducem costurile reale și profitul din baza de date.</p>
      </div>
    </div>
  );

  return (
    <div className="ads-dark-dashboard fade-in">
      
      <div className="ads-header-main">
        <div>
          <h1><FiCpu style={{ marginRight: '10px' }}/> A.I. Media Buyer</h1>
          <p style={{ margin: '5px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>Conectat direct la API-ul Facebook Graph</p>
        </div>
        <div className="range-tabs">
          {['today', 'last7', 'last30'].map(t => (
            <button key={t} className={range === t ? 'active' : ''} onClick={() => setRange(t)}>
              {t === 'today' ? 'Azi' : t === 'last7' ? '7 Zile' : '30 Zile'}
            </button>
          ))}
        </div>
      </div>

      <div className="top-stats-grid">
        <div className="stat-box">
          <label>ROAS GLOBAL</label>
          <div className="val">{topStats.roas}x</div>
          <span className={`sub-text ${parseFloat(topStats.roas) > 2 ? 'positive' : 'negative'}`}>Live Data</span>
        </div>
        <div className="stat-box">
          <label>CPA GLOBAL</label>
          <div className="val">{topStats.cpa} L</div>
          <span className={`sub-text ${parseFloat(topStats.cpa) > profitMediu ? 'negative' : 'positive'}`}>Limită: {profitMediu.toFixed(0)} L/colet</span>
        </div>
        <div className="stat-box">
          <label>SPEND TOTAL FB</label>
          <div className="val">{topStats.spend.toFixed(0)} L</div>
          <span className="sub-text">{topStats.vanzari} vânzări totale</span>
        </div>
        <div className="stat-box">
          <label>PROFIT NET ESTIMAT</label>
          <div className="val">{topStats.profitNet} L</div>
          <span className={`sub-text ${topStats.profitNet > 0 ? 'positive' : 'negative'}`}>După taxe/marfă</span>
        </div>
      </div>

      <div className="ai-briefing-card">
        <div className="ai-briefing-header"><FiCpu className="ai-icon-glow" /> SINTEZA TACTICĂ A.I.</div>
        <p>{aiSummary}</p>
      </div>

      <div className="calendar-strip">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', margin: '0 0 15px 0' }}>
          <label style={{ margin: 0 }}>CALENDAR SĂPTĂMÂNAL</label>
        </div>
        <div className="days-row">
          {zileSaptamana.map((d, i) => (
            <div key={d} className={`day-pill ${new Date().getDay() === i ? 'active' : ''} ${ziSlaba && new Date().getDay() === i ? 'bad-day' : ''}`}>
              {d.substring(0, 2)}
            </div>
          ))}
        </div>
        {ziSlaba && <p style={{ color: '#ef4444', fontSize: '0.8rem', marginTop: '10px' }}>*Atenție: Astăzi ({ziCurentaNume}) e o zi slabă istoric. Păstrează calmul.</p>}
      </div>

      <div className="charts-row">
        <div className="chart-container">
          <label>ROAS — EVOLUȚIE {range === 'last30' ? '30 ZILE' : '7 ZILE'}</label>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={dataRoas}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }} />
              <Line type="monotone" dataKey="roas" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6' }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="chart-container">
          <label>CHELTUIELI VS PROFIT</label>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={dataProfit}>
              <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
              <Tooltip cursor={{fill: 'transparent'}} contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px' }}/>
              <Bar dataKey="val" radius={[8, 8, 0, 0]}>
                {dataProfit.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {audiente.winner && audiente.loser && (
        <div className="audience-row">
          <div className="aud-card winner">
            <div className="icon"><FiAward /> Audiența campioană</div>
            <strong>{audiente.winner.nume}</strong>
            <p>ROAS {audiente.winner.roas}x — mută bugetele aici</p>
          </div>
          <div className="aud-card loser">
            <div className="icon"><FiAlertOctagon /> Performanță slabă</div>
            <strong>{audiente.loser.nume}</strong>
            <p>ROAS {audiente.loser.roas}x — candidat la oprire</p>
          </div>
        </div>
      )}

      <div className="simulator-section">
        <div className="sim-header"><FiTrendingUp /> Simulator de scalare globală</div>
        <div className="sim-controls">
          <div className="control-group">
            <label>Buget zilnic țintă (Lei): <span>{simBuget} L/zi</span></label>
            <input type="range" min="50" max="2000" value={simBuget} onChange={(e) => setSimBuget(e.target.value)} />
          </div>
          <div className="control-group">
            <label>Procent Scalare (%): <span>{simScalare} %</span></label>
            <input type="range" min="10" max="100" value={simScalare} onChange={(e) => setSimScalare(e.target.value)} />
          </div>
        </div>
        <div className="sim-results">
          <div className="res"><span>BUGET NOU</span><strong>{Math.round(simBuget * (1 + simScalare/100))} L</strong></div>
          <div className="res green"><span>VÂNZĂRI EXTRA/ZI</span><strong>+{(simScalare/(parseFloat(topStats.cpa) || 20)).toFixed(1)}</strong></div>
          <div className="res red"><span>RISC CPA (DEGRADARE)</span><strong>+15%</strong></div>
        </div>
      </div>

      <div className="active-ads-grid">
        {ads.length > 0 ? ads.map(ad => (
          <div key={ad.id} className={`ad-card-v2 ${ad.actiune?.toLowerCase() || 'wait'}`}>
            <div className="card-top">
              <strong style={{ maxWidth: '70%' }}>{ad.nume}</strong>
              <span className={`badge ${ad.actiune?.toLowerCase() || 'wait'}`}>{ad.recomandare}</span>
            </div>

            <div className="badget-row" style={{ marginBottom: '15px', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              {parseFloat(ad.frequency) > 2.2 && <span className="mini-badge" style={{ background: '#fef2f2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>Saturație {ad.frequency}</span>}
              {ad.obosealaCreativ && <span className="mini-badge" style={{ background: '#fef2f2', color: '#991b1b', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold' }}>Creative fatigue</span>}
            </div>

            {ad.diagnosticFunnel && <div style={{ fontSize: '0.85rem', color: '#60a5fa', marginBottom: '15px', fontStyle: 'italic' }}>💡 {ad.diagnosticFunnel}</div>}

            <div className="card-metrics-mini">
              <div className="m"><span>ROAS</span><strong className={parseFloat(ad.roas) > 2 ? 'green' : (parseFloat(ad.roas) < 1 ? 'red' : '')}>{ad.roas}x</strong></div>
              <div className="m"><span>CPA</span><strong className={parseFloat(ad.cpa) > profitMediu ? 'red' : 'green'}>{ad.cpa} L</strong></div>
              <div className="m"><span>CTR</span><strong>{ad.ctr}%</strong></div>
              <div className="m"><span>VÂNZĂRI</span><strong>{ad.achizitii}</strong></div>
              <div className="m"><span>SPEND</span><strong>{ad.spend} L</strong></div>
              <div className="m"><span>FREQ</span><strong>{ad.frequency}</strong></div>
              <div className="m"><span>BUGET/ZI</span><strong>{ad.bugetZilnic} L</strong></div>
              <div className="m"><span>CPC</span><strong>{ad.cpc} L</strong></div>
            </div>

            {ad.actiune === 'SCALE' && ad.predictieScalare && (
              <div className="card-prediction">
                 <div className="p-head">📈 Predicție scalare +20%</div>
                 <div className="p-row">
                   <div>Buget nou: <strong style={{color:'white'}}>{ad.predictieScalare.bugetNou} L</strong></div>
                   <div className="green">Vânz: <strong>+{ad.predictieScalare.extraVanzari}</strong></div>
                   <div className="green">Profit: <strong>+{ad.predictieScalare.profitExtra} L</strong></div>
                 </div>
              </div>
            )}

            <p style={{ fontSize: '0.85rem', color: '#94a3b8', marginBottom: '15px' }}>{ad.mesaj}</p>

            {ad.actiune === 'KILL' && (
              <button className="main-action-btn kill" onClick={() => handleDirectAction(ad.id, 'PAUSE')} disabled={actionLoading}>
                <FiPower style={{ verticalAlign: 'middle', marginRight: '5px' }}/> {actionLoading ? "Se trimite..." : "Oprește în FB"}
              </button>
            )}
            {ad.actiune === 'SCALE' && ad.predictieScalare && (
              <button className="main-action-btn" onClick={() => handleDirectAction(ad.id, 'SCALE', ad.predictieScalare.bugetNou)} disabled={actionLoading}>
                <FiZap style={{ verticalAlign: 'middle', marginRight: '5px' }}/> {actionLoading ? "Se trimite..." : `Scalează la ${ad.predictieScalare.bugetNou} L`}
              </button>
            )}
          </div>
        )) : <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '40px', color: '#64748b', background: '#111', borderRadius: '16px' }}>Nu s-au găsit AdSet-uri active.</div>}
      </div>

      <div className="cimitir-footer" onClick={() => setShowCimitir(!showCimitir)}>
        Cimitirul de reclame — analiză post-mortem ({cimitir.length}) {showCimitir ? <FiChevronUp /> : <FiChevronDown />}
      </div>
      
      {showCimitir && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '20px', marginTop: '20px' }} className="fade-in">
          {cimitir.map(ad => (
            <div key={ad.id} className="ad-card-v2" style={{ opacity: 0.7, borderLeft: '4px solid #64748b' }}>
              <div className="card-top">
                <strong style={{ color: '#94a3b8' }}>{ad.nume}</strong>
                <span className="badge off" style={{ background: '#334155', color: '#cbd5e1' }}>Oprită</span>
              </div>
              <div className="card-metrics-mini" style={{ marginBottom: 0 }}>
                <div className="m"><span>CHELTUIT</span><strong style={{ color: '#ef4444' }}>{ad.spend} L</strong></div>
                <div className="m"><span>VÂNZĂRI</span><strong>{ad.achizitii}</strong></div>
                <div className="m"><span>CPA</span><strong>{ad.cpa} L</strong></div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdsOptimizer;