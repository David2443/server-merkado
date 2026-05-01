import React, { useState, useEffect } from 'react';
import { 
  FiAlertTriangle, FiCheckCircle, FiInfo, FiTruck, 
  FiDollarSign, FiUsers, FiMapPin, FiTrendingUp 
} from 'react-icons/fi';
import './Finante.css';

const Finante = () => {
  const [stats, setStats] = useState(null);
  const [range, setRange] = useState('last30');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFinante = async () => {
      setIsLoading(true);
      const token = localStorage.getItem('adminToken') || localStorage.getItem('token');
      try {
        const res = await fetch(`${import.meta.env.VITE_API_URL}/api/admin/profit-analytics?range=${range}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setStats(data);
      } catch (err) { 
        console.error(err); 
      } finally { 
        setIsLoading(false); 
      }
    };
    fetchFinante();
  }, [range]);

  if (isLoading || !stats) return <div className="shopify-dashboard-loader"><div className="spinner"></div></div>;

  // ==========================================
  // 🧮 MATEMATICA DE BAZĂ
  // ==========================================
  
  // 1. Cost per client de pe Facebook
  const cpaFB = stats.nrComenziReusite > 0 ? (stats.fbAdsSpend / stats.nrComenziReusite).toFixed(2) : 0;

  // 2. Profit Brut (Bani din comenzi ÎNAINTE de FB)
  const profitBrutTotal = stats.venitBrut - stats.costMarfa - stats.costTransport - stats.taxeStripe - stats.pierderiRetur;
  const profitMaximPerComanda = stats.nrComenziReusite > 0 ? (profitBrutTotal / stats.nrComenziReusite).toFixed(2) : 0;

  // 3. Ești pe profit sau pe pierdere pe Facebook?
  const profitNetPerComanda = (profitMaximPerComanda - cpaFB).toFixed(2);
  const estPePierdere = Number(cpaFB) > Number(profitMaximPerComanda);

  // 4. Profit Net Total Real
  const profitNetReal = profitBrutTotal - stats.fbAdsSpend;

  return (
    <div className="fin-wrapper fade-in">
      <div className="fin-header">
        <div>
          <h2>Centru de Comandă Financiar 🚀</h2>
          <p>Decizii bazate pe date, nu pe presupuneri.</p>
        </div>
        <select value={range} onChange={(e) => setRange(e.target.value)} className="fin-select-premium">
          <option value="today">Astăzi</option>
          <option value="last7">Ultimele 7 zile</option>
          <option value="last30">Ultimele 30 de zile</option>
        </select>
      </div>

      {/* 🟢 MODUL 1: SEMAFORUL DE PROFIT (SCANNER) */}
      <div className={`fin-scanner-card ${estPePierdere ? 'bg-alert' : 'bg-success'}`}>
        <div className="fin-scanner-header">
          <div className="fin-scanner-icon">
            {estPePierdere ? <FiAlertTriangle /> : <FiCheckCircle />}
          </div>
          <div className="fin-scanner-title">
            <span>SCANNER CAMPANII FACEBOOK</span>
            <h2>{estPePierdere ? "EȘTI PE PIERDERE!" : "EȘTI PE PROFIT!"}</h2>
          </div>
        </div>

        <div className="fin-scanner-math">
          <div className="f-math-box">
            <span>PROFIT BRUT / COLET</span>
            <strong>{profitMaximPerComanda} Lei</strong>
            <small>Câștig înainte de Ads</small>
          </div>
          <div className="f-math-operator">-</div>
          <div className="f-math-box">
            <span>COST FB (CPA) / COLET</span>
            <strong>{cpaFB} Lei</strong>
            <small>Cât te costă clientul</small>
          </div>
          <div className="f-math-operator">=</div>
          <div className={`f-math-box f-final-box ${estPePierdere ? 'text-red' : 'text-green'}`}>
            <span>PROFIT NET / COLET</span>
            <strong>{profitNetPerComanda} Lei</strong>
            <small>Banii curați în buzunar</small>
          </div>
        </div>
        
        <div className="fin-scanner-footer">
          <FiInfo /> 
          {estPePierdere 
            ? "Oprește/Modifică reclamele pe Facebook ACUM! Te costă mai mult să aduci o comandă decât profitul pe care ți-l generează produsul." 
            : "Campaniile performează bine. Costul de achiziție este sub profitul tău brut. Poți scala liniștit!"}
        </div>
      </div>

      <div className="fin-split-grid">
        {/* 🟢 MODUL 2: PREDICȚIA FACTURILOR (CASHFLOW) */}
        <div className="fin-widget-card">
          <div className="fin-widget-header">
            <FiTruck className="fin-icon-blue" />
            <h3>Predicție Cashflow</h3>
          </div>
          <div className="fin-cf-content">
            <div className="fin-cf-item">
              <span>BANI BLOCAȚI (RAMBURS)</span>
              <h2>{stats.baniPeDrum.toLocaleString('ro-RO', {minimumFractionDigits: 2})} Lei</h2>
              <p>Comenzi trimise, bani neîncasați de la curier încă.</p>
            </div>
            <div className="fin-cf-divider"></div>
            <div className="fin-cf-item">
              <span>PROFIT NET (DISPONIBIL)</span>
              <h2 className={profitNetReal >= 0 ? "txt-green" : "txt-red"}>
                {profitNetReal.toLocaleString('ro-RO', {minimumFractionDigits: 2})} Lei
              </h2>
              <p>Banii tăi reali după deducerea absolut tuturor taxelor.</p>
            </div>
          </div>
        </div>

        {/* 🟢 MODUL 3: CLIENȚI FIERBINȚI */}
        <div className="fin-widget-card loyalty-bg">
          <div className="fin-widget-header">
            <FiUsers className="fin-icon-purple" />
            <h3>Baza de Clienți Fideli</h3>
          </div>
          <div className="fin-loyalty-content">
            <h1>{stats.repeatCustomers}</h1>
            <span>Clienți Recurenți</span>
            <p>Au comandat de cel puțin 2 ori. Contactează-i cu oferte noi, aici ai cost de marketing 0!</p>
          </div>
        </div>
      </div>

      {/* 🟢 MODUL 4: HARTA JUDEȚELOR & P&L FISCAL */}
      <div className="fin-split-grid">
        <div className="fin-table-card">
          <h3 className="fin-card-title"><FiMapPin className="fin-icon-orange"/> Harta Banilor (Top Județe)</h3>
          {stats.topJudeteArray.length > 0 ? (
            stats.topJudeteArray.map((judet, idx) => (
              <div key={idx} className="fin-row">
                <span>{idx + 1}. {judet.nume}</span>
                <strong>{judet.count} comenzi</strong>
              </div>
            ))
          ) : (
            <div className="fin-empty">Nu există date suficiente.</div>
          )}
        </div>

        <div className="fin-table-card">
          <h3 className="fin-card-title"><FiDollarSign className="fin-icon-green"/> Raport Fiscal Complet (P&L)</h3>
          <div className="fin-row">
            <span>1. Venit Brut (Încasat)</span>
            <span className="txt-green">+{stats.venitBrut.toFixed(2)} Lei</span>
          </div>
          <div className="fin-row">
            <span>2. Cost Marfă (COGS)</span>
            <span className="txt-red">-{stats.costMarfa.toFixed(2)} Lei</span>
          </div>
          <div className="fin-row">
            <span>3. Cost Transport Reușite</span>
            <span className="txt-red">-{stats.costTransport.toFixed(2)} Lei</span>
          </div>
          <div className="fin-row">
            <span>4. Taxe Stripe / Card</span>
            <span className="txt-red">-{stats.taxeStripe.toFixed(2)} Lei</span>
          </div>
          <div className="fin-row">
            <span>5. Gaură Retururi (Dus-Întors)</span>
            <span className="txt-red">-{stats.pierderiRetur.toFixed(2)} Lei</span>
          </div>
          <div className="fin-row">
            <span>6. Cheltuieli Facebook API</span>
            <span className="txt-red">-{stats.fbAdsSpend.toFixed(2)} Lei</span>
          </div>
          <div className="fin-row-total">
            <span>PROFIT FINAL REAL</span>
            <span className={profitNetReal >= 0 ? "txt-green-bold" : "txt-red-bold"}>
              {profitNetReal.toFixed(2)} Lei
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Finante;