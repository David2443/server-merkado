import React from 'react';
import './LegalPages.css';

const Confidentialitate = () => {
  return (
    <div className="legal-page-container">
      <h1>Politică de Confidențialitate (GDPR)</h1>
      <p>Ultima actualizare: Mai 2026</p>

      <section>
        <h2>1. Angajamentul Nostru</h2>
        <p><strong>DS RETAIL NETWORK SRL</strong> (MERKADO) respectă confidențialitatea datelor dumneavoastră. Ne angajăm să protejăm și să procesăm datele personale în siguranță, în conformitate cu Regulamentul (UE) 2016/679 (GDPR).</p>
      </section>

      <section>
        <h2>2. Ce date colectăm?</h2>
        <p>Atunci când plasați o comandă sau ne contactați, colectăm următoarele date strict necesare:</p>
        <ul>
          <li>Nume și prenume</li>
          <li>Adresa de livrare și facturare</li>
          <li>Număr de telefon</li>
          <li>Adresa de email</li>
          <li>Date de plată (procesate securizat prin Stripe, noi nu stocăm datele cardului bancar)</li>
        </ul>
      </section>

      <section>
        <h2>3. Scopul Colectării</h2>
        <p>Datele sunt folosite exclusiv pentru:</p>
        <ul>
          <li>Procesarea, expedierea și facturarea comenzilor.</li>
          <li>Comunicarea privind statusul comenzii sau rezolvarea problemelor de suport.</li>
          <li>Trimitea de newslettere (doar dacă v-ați abonat explicit).</li>
        </ul>
      </section>

      <section>
        <h2>4. Cine mai are acces la date?</h2>
        <p>Pentru a putea onora comenzile, partajăm datele strict necesare cu partenerii noștri de încredere: firmele de curierat (pentru livrare) și procesatorul de plăți (Stripe).</p>
      </section>

      <section>
        <h2>5. Drepturile Dumneavoastră</h2>
        <p>Conform GDPR, aveți următoarele drepturi privind datele personale:</p>
        <ul>
          <li>Dreptul de acces și de rectificare a datelor.</li>
          <li>Dreptul la ștergerea datelor ("dreptul de a fi uitat").</li>
          <li>Dreptul de a retrage consimțământul (ex: dezabonare newsletter).</li>
        </ul>
        <p>Pentru exercitarea acestor drepturi, ne puteți trimite oricând un email la <strong>contact@merkado.ro</strong>.</p>
      </section>
    </div>
  );
};

export default Confidentialitate;