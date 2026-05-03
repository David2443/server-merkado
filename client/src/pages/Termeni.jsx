import React from 'react';
import './LegalPages.css';

const Termeni = () => {
  return (
    <div className="legal-page-container">
      <h1>Termeni și Condiții</h1>
      <p>Ultima actualizare: Mai 2026</p>

      <section>
        <h2>1. Introducere</h2>
        <p>Acest document stabilește termenii și condițiile de utilizare a site-ului <strong>merkado.ro</strong> și condițiile de achiziție a produselor afișate. Navigarea pe site și plasarea comenzilor implică acceptarea integrală a acestor termeni. Vă rugăm să citiți cu atenție.</p>
      </section>

      <section>
        <h2>2. Datele Companiei</h2>
        <p>Site-ul merkado.ro este deținut și administrat de <strong>DS RETAIL NETWORK SRL</strong>, având CUI: 54193458, cu sediul social în Str. Otelesti nr 140A, Stefanesti, Arges. Telefon contact: +40 723 717 438. Email: contact@merkado.ro.</p>
      </section>

      <section>
        <h2>3. Produse și Prețuri</h2>
        <p>MERKADO depune toate eforturile pentru a prezenta produsele cât mai exact (culori, specificații). Totuși, nuanțele pot diferi ușor în funcție de ecranul utilizatorului.</p>
        <p>Toate prețurile afișate pe site sunt exprimate în Lei (RON). DS RETAIL NETWORK SRL își rezervă dreptul de a modifica prețurile fără o notificare prealabilă, însă comenzile deja plasate și confirmate vor păstra prețul de la momentul achiziției.</p>
      </section>

      <section>
        <h2>4. Procesul de Comandă</h2>
        <p>Plasarea unei comenzi reprezintă o ofertă de cumpărare. Contractul de vânzare-cumpărare se consideră încheiat în momentul în care confirmăm comanda și o marcăm cu statusul "Confirmată" sau o expediem.</p>
        <p>Ne rezervăm dreptul de a anula comenzile care par frauduloase sau care nu pot fi onorate din cauza lipsei de stoc, cu notificarea clientului.</p>
      </section>

      <section>
        <h2>5. Plată și Livrare</h2>
        <p>Metodele de plată acceptate sunt: Plata Ramburs (la curier) și Plata cu Cardul Online (prin Stripe). Livrarea se face conform detaliilor din pagina <a href="/livrare">Politica de Livrare</a>.</p>
      </section>

      <section>
        <h2>6. Drepturi de Autor</h2>
        <p>Întregul conținut al site-ului (text, imagini, logo-uri, elemente grafice, scripturi) este proprietatea DS RETAIL NETWORK SRL și este aparat de legea pentru protecția drepturilor de autor. Folosirea acestora fără acordul scris este strict interzisă.</p>
      </section>

      <section>
        <h2>7. Forță Majoră</h2>
        <p>Niciuna dintre părți nu va fi răspunzătoare pentru neexecutarea obligațiilor sale contractuale, dacă o astfel de neexecutare este cauzată de un eveniment de forță majoră, conform legii (ex: dezastre naturale, greve naționale).</p>
      </section>
    </div>
  );
};

export default Termeni;