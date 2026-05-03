import React from 'react';
import './LegalPages.css'; // Presupunem un fisier CSS comun

const Livrare = () => {
  return (
    <div className="legal-page-container">
      <h1>Politică de Livrare</h1>
      <p>Ultima actualizare: Mai 2026</p>

      <section>
        <h2>1. Informații Generale</h2>
        <p>Ne dorim ca produsele MERKADO să ajungă la tine în cel mai scurt timp posibil. Livrăm oriunde în România, prin intermediul partenerilor noștri de curierat rapid.</p>
      </section>

      <section>
        <h2>2. Termene de Livrare</h2>
        <p>Comenzile plasate în zilele lucrătoare, până în ora 15:00, sunt prelucrate și expediate, de regulă, în aceeași zi.</p>
        <ul>
          <li><strong>Curier Rapid:</strong> Livrarea se efectuează în 24 - 48 de ore lucrătoare de la confirmarea expedierii.</li>
          <li><strong>Easybox / Locker:</strong> Livrarea se efectuează în 24 - 48 de ore lucrătoare de la confirmarea expedierii.</li>
        </ul>
        <p><em>Notă: În perioadele aglomerate (Sărbători, Black Friday) sau din cauze independente de noi (vreme nefavorabilă, probleme tehnice ale curierului), timpul de livrare se poate prelungi.</em></p>
      </section>

      <section>
        <h2>3. Costul Livrării</h2>
        <p>Costurile standard de transport sunt:</p>
        <ul>
          <li><strong>Curier Rapid la domiciliu:</strong> 19 Lei</li>
          <li><strong>Livrare la Easybox/Locker:</strong> 15 Lei (dacă este disponibil)</li>
        </ul>
        <p><strong>LIVRARE GRATUITĂ:</strong> Oferim transport gratuit pentru toate comenzile cu o valoare totală de peste 250 Lei.</p>
      </section>

      <section>
        <h2>4. Urmărirea Comenzii (Tracking)</h2>
        <p>Imediat ce comanda ta este predată curierului, vei primi un email și/sau un SMS cu numărul de AWB și un link pentru urmărirea coletului în timp real.</p>
      </section>
      
       <section>
        <h2>5. Colete Deteriorate</h2>
        <p>Dacă la primire observi că ambalajul este grav deteriorat, îți recomandăm să refuzi coletul sau să întocmești un proces verbal de constatare a daunelor împreună cu agentul de curierat. Te rugăm să ne contactezi imediat la <a href="mailto:contact@merkado.ro">contact@merkado.ro</a>.</p>
      </section>
    </div>
  );
};

export default Livrare;