import React, { useState } from 'react';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { FiTruck, FiShield, FiGift, FiLock, FiCheckCircle, FiChevronRight, FiCreditCard, FiBox } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import './Checkout.css';

// ⚠️ CHEIA TA DE STRIPE
const stripePromise = loadStripe('pk_jalnco85_nmDIohLlk0qXiCoun4aCNrhH3gOdvwQU');

// ==========================================
// 1. FORMULARUL PENTRU PLATA CU CARDUL
// ==========================================
const StripePaymentForm = ({ total, onPaymentSuccess, dateClient, tipLivrare, lockerSelectat }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (tipLivrare === 'locker' && !lockerSelectat) {
      return setError("Te rugăm să alegi un Easybox!");
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch('http://localhost:5000/api/auth/create-payment-intent', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount: Math.round(total * 100) }) 
      });

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement),
          billing_details: { name: dateClient.nume },
        },
      });

      if (result.error) {
        setError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setError("Eroare la procesarea plății. Reîncearcă.");
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-inner-form">
      <div className="stripe-card-element">
        <CardElement options={{
          style: {
            base: { fontSize: '16px', color: '#424770', '::placeholder': { color: '#aab7c4' } },
            invalid: { color: '#9e2146' },
          },
        }} />
      </div>
      {error && <div className="stripe-error" style={{color: 'red', fontSize: '0.85rem', marginBottom: '10px'}}>{error}</div>}
      <button type="submit" disabled={!stripe || loading} className="btn-final-pay" style={{width: '100%', padding: '15px', background: '#3b82f6', color: 'white', borderRadius: '10px', fontWeight: '800', border: 'none', cursor: 'pointer'}}>
        {loading ? "Se procesează..." : `Plătește Secure ${total.toFixed(2)} Lei`}
      </button>
    </form>
  );
};

// ==========================================
// 2. COMPONENTA PRINCIPALĂ CHECKOUT
// ==========================================
const Checkout = ({ produsId, numeProdus, pretBaza, imagineProdus, onClose }) => {
  const [pachet, setPachet] = useState({ qty: 1, pret: pretBaza || 69 });
  const [extra, setExtra] = useState({ livrare: 0, cadou: 0, asigurare: 0 });
  
  // 🔴 AICI AM ADAUGAT EMAIL-UL IN STATE
  const [dateClient, setDateClient] = useState({ nume: '', email: '', telefon: '', adresa: '', localitate: '', judet: '' });  
  
  const [metodaPlata, setMetodaPlata] = useState('cash'); 
  const [comandaTrimisa, setComandaTrimisa] = useState(false);
  
  const [tipLivrare, setTipLivrare] = useState('curier'); 
  const [lockerSelectat, setLockerSelectat] = useState(null);

  const transportBase = 19;
  const total = pachet.pret + extra.livrare + extra.cadou + extra.asigurare + transportBase;

  const openLockerMap = () => {
    alert("Harta Sameday este oprită temporar ca să poți testa designul. Am selectat un locker de test.");
    setLockerSelectat({
      id: "TEST_1234",
      name: "Easybox Mega Image (Mod de Test)",
      address: "Strada de Test, Nr. 10",
      city: "București",
      county: "București"
    });
  };

  const genereazaPayload = (metoda, paymentId = null) => {
    return {
      nume: dateClient.nume,
      telefon: dateClient.telefon,
      email: dateClient.email, // 🔴 SE TRIMITE EMAILUL
      produsId,
      numeProdus,
      qty: pachet.qty,
      total,
      metodaPlata: metoda,
      paymentId,
      tipLivrare: tipLivrare,
      adresaLivrare: tipLivrare === 'curier' ? dateClient.adresa : lockerSelectat?.address,
      localitate: tipLivrare === 'curier' ? dateClient.localitate : lockerSelectat?.city,
      judet: tipLivrare === 'curier' ? dateClient.judet : lockerSelectat?.county,
      samedayLockerId: tipLivrare === 'locker' ? lockerSelectat?.id : null,
      extraOptions: extra
    };
  };

  const handleFinalizeCash = async () => {
    if (!dateClient.nume || !dateClient.telefon) return alert("Completează Numele și Telefonul!");
    
    // 🔴 VALIDAREA PENTRU EMAIL LA LOCKER ESTE LA LOCUL EI, INAUNTRUL FUNCTIEI!
    if (tipLivrare === 'locker' && !dateClient.email) {
      return alert("Avem nevoie de o adresă de email pentru a-ți putea trimite codul PIN pentru Easybox!");
    }

    if (tipLivrare === 'curier' && (!dateClient.adresa || !dateClient.localitate)) return alert("Completează adresa completă!");
    if (tipLivrare === 'locker' && !lockerSelectat) return alert("Alege un Easybox!");

    try {
      const res = await fetch('http://localhost:5000/api/comenzi/noua', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genereazaPayload('Cash la Livrare'))
      });
      if (res.ok) setComandaTrimisa(true);
    } catch (err) { alert("Eroare la trimiterea comenzii."); }
  };

  const handlePaymentSuccess = async (paymentId) => {
    const res = await fetch('http://localhost:5000/api/comenzi/noua', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(genereazaPayload('Card Online', paymentId))
    });
    if (res.ok) setComandaTrimisa(true);
  };

  if (comandaTrimisa) {
    return (
      <div className="checkout-success" style={{padding: '40px', textAlign: 'center'}}>
        <FiCheckCircle style={{fontSize: '4rem', color: '#10b981', marginBottom: '20px'}} />
        <h2>Comandă Reușită!</h2>
        <p>Mulțumim, <strong>{dateClient.nume}</strong>! Coletul tău va fi pregătit imediat.</p>
        <div style={{background: '#f0fdf4', padding: '20px', borderRadius: '15px', margin: '20px 0'}}>
          <p>Poți urmări statusul coletului aici:</p>
          <Link to="/tracking" style={{display: 'inline-block', padding: '10px 20px', background: '#3b82f6', color: 'white', borderRadius: '10px', textDecoration: 'none', fontWeight: 'bold'}}>Urmărește Comanda 📦</Link>
        </div>
        <button onClick={onClose} style={{padding: '10px 20px', background: '#f1f5f9', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold'}}>Închide fereastra</button>
      </div>
    );
  }

  return (
    <div className="checkout-modal-body">
      <div className="checkout-header-product">
        <img src={imagineProdus} alt={numeProdus} />
        <div>
          <h4>{numeProdus || "Produs Premium"}</h4>
          <p>Finalizează comanda de mai jos</p>
        </div>
      </div>

      <div className="checkout-main-grid">
        
        {/* COLOANA STÂNGA */}
        <div className="checkout-form-side">
          
          <div className="checkout-section">
            <h5 className="section-title"><span>1</span> Date de livrare</h5>
            
            <div className="input-group">
              <input type="text" placeholder="Nume și Prenume" required onChange={e => setDateClient({...dateClient, nume: e.target.value})} />
              <input type="tel" placeholder="Telefon" required onChange={e => setDateClient({...dateClient, telefon: e.target.value})} />
            </div>

            {/* 🔴 CĂSUȚA DE EMAIL CARE TREBUIE SĂ APARĂ ACUM */}
            <div style={{ marginTop: '15px', width: '100%' }}>
              <input 
                type="email" 
                placeholder={`Adresă de Email ${tipLivrare === 'curier' ? '(Opțional)' : '* Obligatoriu'}`} 
                required={tipLivrare === 'locker'}
                onChange={e => setDateClient({...dateClient, email: e.target.value})} 
                style={{
                  display: 'block',
                  width: '100%', 
                  padding: '14px', 
                  borderRadius: '10px', 
                  border: tipLivrare === 'locker' ? '2px solid #3b82f6' : '1px solid #e2e8f0', 
                  outline: 'none',
                  fontSize: '0.95rem',
                  fontFamily: 'inherit',
                  transition: 'all 0.3s'
                }} 
              />
              {tipLivrare === 'locker' && (
                <small style={{ color: '#3b82f6', fontSize: '0.85rem', marginTop: '6px', display: 'block', fontWeight: '500' }}>
                  *Emailul este necesar pentru a primi codul QR de la Easybox.
                </small>
              )}
            </div>

            <div className="delivery-toggle" style={{ marginTop: '15px' }}>
              <button type="button" className={`delivery-btn ${tipLivrare === 'curier' ? 'active' : ''}`} onClick={() => setTipLivrare('curier')}>
                <FiTruck /> Acasă / Birou
              </button>
              <button type="button" className={`delivery-btn ${tipLivrare === 'locker' ? 'active' : ''}`} onClick={() => setTipLivrare('locker')}>
                <FiBox /> Easybox
              </button>
            </div>

            <div style={{ marginTop: '15px' }}>
              {tipLivrare === 'curier' ? (
                <div className="input-group fade-in">
                  <input type="text" placeholder="Adresă completă (Strada, Nr, Bloc...)" required onChange={e => setDateClient({...dateClient, adresa: e.target.value})} />
                  <div className="input-row">
                    <input type="text" placeholder="Localitate" required onChange={e => setDateClient({...dateClient, localitate: e.target.value})} />
                    <input type="text" placeholder="Județ" required onChange={e => setDateClient({...dateClient, judet: e.target.value})} />
                  </div>
                </div>
              ) : (
                <div className="locker-selector-container fade-in">
                  <button type="button" className="btn-select-locker" onClick={openLockerMap}>
                    {lockerSelectat ? 'Schimbă Locker-ul' : '📍 Deschide Harta Easybox'}
                  </button>
                  {lockerSelectat && (
                    <div className="locker-details-mini active-locker" style={{ marginTop: '15px', padding: '12px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '10px' }}>
                      <strong style={{ color: '#15803d', display: 'block' }}>✅ {lockerSelectat.name}</strong>
                      <span style={{ fontSize: '0.85rem', color: '#166534' }}>{lockerSelectat.address}, {lockerSelectat.city}</span>
                    </div>
                  )}
                </div>
              )}  
            </div>
          </div>

          <div className="checkout-section">
            <h5 className="section-title"><span>2</span> Alege Oferta Specială</h5>
            <div className="offers-list">
              <div className={`offer-card ${pachet.qty === 1 ? 'active' : ''}`} onClick={() => setPachet({qty: 1, pret: pretBaza || 69})}>
                <div className="radio-circle"></div>
                <div className="offer-info">
                  <strong>Cumpără 1 BUCATĂ</strong>
                  <span className="offer-tag low">Ofertă Standard</span>
                </div>
                <div className="offer-price">{pretBaza || 69} Lei</div>
              </div>

              <div className={`offer-card ${pachet.qty === 2 ? 'active' : ''}`} onClick={() => setPachet({qty: 2, pret: Math.round((pretBaza || 69) * 2 * 0.7)})}>
                <div className="radio-circle"></div>
                <div className="offer-info">
                  <strong>Cumpără 2 BUCĂȚI</strong>
                  <span className="offer-tag discount">-30% REDUCERE</span>
                </div>
                <div className="offer-price">{Math.round((pretBaza || 69) * 2 * 0.7)} Lei</div>
              </div>
            </div>
          </div>

          <div className="checkout-section">
            <h5 className="section-title"><span>3</span> Opțiuni Suplimentare</h5>
            <div className="upsell-list">
              <label className="upsell-item urgent">
                <input type="checkbox" onChange={e => setExtra({...extra, livrare: e.target.checked ? 4.99 : 0})} />
                <div className="upsell-text"><FiTruck /> 🚚 LIVRARE DE URGENȚĂ</div>
                <div className="upsell-price">4,99 Lei</div>
              </label>
              <label className="upsell-item surprise">
                <input type="checkbox" onChange={e => setExtra({...extra, cadou: e.target.checked ? 7.99 : 0})} />
                <div className="upsell-text"><FiGift /> 🎁 Produs Surpriză</div>
                <div className="upsell-price">7,99 Lei</div>
              </label>
              <label className="upsell-item insurance">
                <input type="checkbox" onChange={e => setExtra({...extra, asigurare: e.target.checked ? 4.99 : 0})} />
                <div className="upsell-text"><FiShield /> 📦 ASIGURARE COLET</div>
                <div className="upsell-price">4,99 Lei</div>
              </label>
            </div>
          </div>

        </div>

        {/* COLOANA DREAPTĂ */}
        <div className="checkout-summary-side">
          <div className="summary-card">
            <h3>Sumar Comandă</h3>
            <div className="summary-row"><span>Produs ({pachet.qty} buc)</span> <span>{pachet.pret} Lei</span></div>
            <div className="summary-row"><span>Transport Standard</span> <span>{transportBase} Lei</span></div>
            
            {extra.livrare > 0 && <div className="summary-row extra"><span>Livrare Urgentă</span> <span>4.99 Lei</span></div>}
            {extra.cadou > 0 && <div className="summary-row extra"><span>Produs Surpriză</span> <span>7.99 Lei</span></div>}
            {extra.asigurare > 0 && <div className="summary-row extra"><span>Asigurare Colet</span> <span>4.99 Lei</span></div>}
            
            <div className="total-divider"></div>
            <div className="total-row"><span>TOTAL DE PLATĂ</span> <span>{total.toFixed(2)} Lei</span></div>

            <div className="payment-toggle">
              <button type="button" className={`pay-btn ${metodaPlata === 'cash' ? 'selected' : ''}`} onClick={() => setMetodaPlata('cash')}>
                <FiTruck style={{ fontSize: '1.4rem' }} /> Cash la Livrare
              </button>
              <button type="button" className={`pay-btn ${metodaPlata === 'card' ? 'selected' : ''}`} onClick={() => setMetodaPlata('card')}>
                <FiCreditCard style={{ fontSize: '1.4rem' }} /> Card Online
              </button>
            </div>

            {metodaPlata === 'cash' ? (
              <button type="button" className="confirm-order-btn" onClick={handleFinalizeCash}>
                FINALIZEAZĂ COMANDA <FiChevronRight />
              </button>
            ) : (
              <div className="stripe-container">
                <Elements stripe={stripePromise}>
                  <StripePaymentForm 
                    total={total} 
                    dateClient={dateClient} 
                    tipLivrare={tipLivrare}
                    lockerSelectat={lockerSelectat}
                    onPaymentSuccess={handlePaymentSuccess} 
                  />
                </Elements>
              </div>
            )}

            <div className="secure-footer">
              <FiLock /> Datele tale sunt criptate SSL 256-bit
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Checkout;  