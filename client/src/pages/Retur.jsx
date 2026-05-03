import React from 'react';
import './LegalPages.css';

const Retur = () => {
  return (
    <div className="legal-page-container">
      <h1>Politică de Retur și Garanții</h1>
      <p>Ultima actualizare: Mai 2026</p>

      <section>
        <h2>1. Dreptul de Retur (14 Zile)</h2>
        <p>Conform OUG 34/2014, ai dreptul de a returna produsele cumpărate online în termen de <strong>14 zile calendaristice</strong> de la primirea acestora, fără a invoca un motiv. Vrem să fii complet mulțumit de achiziția ta de pe MERKADO!</p>
      </section>

      <section>
        <h2>2. Condiții de Retur</h2>
        <p>Pentru ca returul să fie acceptat, te rugăm să te asiguri că produsul respectă următoarele condiții:</p>
        <ul>
          <li>Produsul trebuie să fie în aceeași stare în care a fost livrat.</li>
          <li>Produsul nu trebuie să prezinte urme de uzură, zgârieturi, lovituri sau spălare.</li>
          <li>Trebuie să fie însoțit de toate etichetele și accesoriile originale intacte.</li>
          <li><strong>Excepții (Produse care NU se pot returna):</strong> Din motive de igienă, produsele cosmetice (precum crema EYELIFTER) pot fi returnate <strong>doar dacă sunt sigilate și nefolosite</strong>. Nu acceptăm returul produselor desigilate sau testate.</li>
        </ul>
      </section>

      <section>
        <h2>3. Cum returnezi un produs?</h2>
        <ol>
          <li>Trimite-ne un email la <strong>contact@merkado.ro</strong> cu subiectul "Cerere Retur - Comanda #[Număr Comandă]" și specifică contul IBAN în care dorești rambursarea.</li>
          <li>Așteaptă confirmarea noastră.</li>
          <li>Așează produsul într-un ambalaj sigur (recomandăm cutia originală) pentru a preveni deteriorarea pe transport.</li>
          <li>Expediază coletul prin <strong>orice firmă de curierat rapid</strong> (fără ramburs) la adresa: <em>Str. Otelesti nr 140A, Stefanesti, Arges</em>, pentru DS RETAIL NETWORK SRL.</li>
        </ol>
        <p><strong>Atenție:</strong> Taxa de transport pentru retur este suportată de client, conform legii. Coletele trimise cu plata la destinatar (la noi) vor fi refuzate.</p>
      </section>

      <section>
        <h2>4. Rambursarea Banilor</h2>
        <p>Contravaloarea produselor returnate va fi virată în contul IBAN specificat de tine în termen de maxim <strong>14 zile calendaristice</strong> de la recepționarea și verificarea produsului returnat în depozitul nostru. Taxa de transport inițială nu se returnează (decât în caz de produs defect).</p>
      </section>

      <section>
        <h2>5. Garanția Produselor</h2>
        <p>Toate produsele comercializate de MERKADO beneficiază de garanție de conformitate conform prevederilor legale. Dacă primești un produs defect sau diferit față de cel comandat, te rugăm să ne contactezi în maxim 48 de ore de la primire la <strong>contact@merkado.ro</strong>, atașând poze, iar noi îl vom înlocui pe cheltuiala noastră.</p>
      </section>
    </div>
  );
};

export default Retur;