import React from 'react';
import './LegalPages.css';

const Cookies = () => {
  return (
    <div className="legal-page-container">
      <h1>Politică de Cookies</h1>
      <p>Ultima actualizare: Mai 2026</p>

      <section>
        <h2>1. Ce sunt cookie-urile?</h2>
        <p>Cookie-urile sunt fișiere text mici pe care site-ul merkado.ro le salvează pe computerul sau dispozitivul tău mobil atunci când ne vizitezi. Acestea ne ajută să îți oferim o experiență de navigare mai bună și să reținem preferințele tale (cum ar fi produsele adăugate în coș).</p>
      </section>

      <section>
        <h2>2. Tipuri de cookie-uri folosite</h2>
        <ul>
          <li><strong>Cookie-uri Strict Necesare:</strong> Fără acestea, site-ul nu ar putea funcționa (ex: păstrarea produselor în coșul de cumpărături, securitatea plăților).</li>
          <li><strong>Cookie-uri de Analiză:</strong> Ne ajută să înțelegem cum interacționează vizitatorii cu site-ul (ex: Google Analytics), complet anonim, pentru a îmbunătăți structura magazinului.</li>
          <li><strong>Cookie-uri de Marketing:</strong> Folosite pentru a-ți afișa reclame relevante pentru tine pe alte platforme (ex: Facebook Pixel).</li>
        </ul>
      </section>

      <section>
        <h2>3. Cum poți controla cookie-urile?</h2>
        <p>Poți controla și/sau șterge cookie-urile din setările browserului tău web. Poți seta majoritatea browserelor să blocheze plasarea cookie-urilor, dar în acest caz s-ar putea să fii nevoit să ajustezi manual anumite preferințe, iar unele funcționalități ale site-ului (precum finalizarea comenzii) ar putea să nu funcționeze corect.</p>
      </section>
    </div>
  );
};

export default Cookies;