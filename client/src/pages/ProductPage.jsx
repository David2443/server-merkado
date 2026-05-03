import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { io } from 'socket.io-client';
import { Helmet } from 'react-helmet-async';
import {
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement,
  useStripe, useElements
} from '@stripe/react-stripe-js';
import {
  FiStar, FiTruck, FiShield, FiRotateCcw, FiChevronDown, FiChevronUp,
  FiCheck, FiShoppingBag, FiX, FiThumbsUp, FiLock, FiCheckCircle, FiChevronRight, FiCreditCard, FiBox
} from 'react-icons/fi';
import './ProductPage.css';

// 🛡️ FIX 1 & 2: URL Dinamic și Cheia Stripe ascunsă
const API_URL = import.meta.env.VITE_API_URL || 'https://merkado-backend.onrender.com';
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY || 'pk_test_51TKPY5KGxxN608QkXUMYvMKt4b4HXHoC0cBGCtUvQamNX3kLj3q75Agz23XBkJbRNVyhEJaLnDFtFPLbsdJs67hl00CV2G4TCb';
const stripePromise = loadStripe(STRIPE_KEY);

const listaJudete = [
  'Alba', 'Arad', 'Argeș', 'Bacău', 'Bihor', 'Bistrița-Năsăud', 'Botoșani', 'Brăila', 'Brașov', 'București',
  'Buzău', 'Călărași', 'Caraș-Severin', 'Cluj', 'Constanța', 'Covasna', 'Dâmbovița', 'Dolj', 'Galați', 'Giurgiu',
  'Gorj', 'Harghita', 'Hunedoara', 'Ialomița', 'Iași', 'Ilfov', 'Maramureș', 'Mehedinți', 'Mureș', 'Neamț',
  'Olt', 'Prahova', 'Sălaj', 'Satu Mare', 'Sibiu', 'Suceava', 'Teleorman', 'Timiș', 'Tulcea', 'Vâlcea', 'Vaslui', 'Vrancea'
];

const StripePaymentForm = ({ total, onPaymentSuccess, dateClient, validateForm, payloadComanda }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [stripeError, setStripeError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    if (!validateForm()) {
      setStripeError("Completează datele de livrare de mai sus.");
      return;
    }

    setLoading(true);
    setStripeError(null);

    try {
      const res = await fetch(`${API_URL}/api/auth/create-payment-intent`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payloadComanda)
      });

      const { clientSecret } = await res.json();

      const result = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardNumberElement),
          billing_details: { name: dateClient.nume, email: dateClient.email },
        },
      });

      if (result.error) {
        setStripeError(result.error.message);
      } else if (result.paymentIntent.status === 'succeeded') {
        onPaymentSuccess(result.paymentIntent.id);
      }
    } catch (err) {
      setStripeError("Eroare la procesarea plății.");
    } finally {
      setLoading(false);
    }
  };

  const elementOptions = {
    style: {
      base: {
        fontSize: '16px',
        color: '#1e293b',
        fontFamily: 'Inter, sans-serif',
        '::placeholder': { color: '#94a3b8' },
      },
      invalid: { color: '#ef4444' },
    },
  };

  return (
    <form onSubmit={handleSubmit} className="stripe-split-form">
      <div className="stripe-element-container">
        <label className="stripe-label">Număr Card</label>
        <div className="stripe-input-wrapper">
          <CardNumberElement options={elementOptions} className="stripe-custom-input" />
        </div>
      </div>

      <div className="stripe-row">
        <div className="stripe-element-container">
          <label className="stripe-label">Valabilitate</label>
          <div className="stripe-input-wrapper">
            <CardExpiryElement options={elementOptions} className="stripe-custom-input" />
          </div>
        </div>
        <div className="stripe-element-container">
          <label className="stripe-label">CVC (Cod Securitate)</label>
          <div className="stripe-input-wrapper">
            <CardCvcElement options={elementOptions} className="stripe-custom-input" />
          </div>
        </div>
      </div>

      {stripeError && <div className="stripe-error-box">{stripeError}</div>}

      <button type="submit" disabled={!stripe || loading} className="btn-finalize card">
        {loading ? "SE PROCESEAZĂ..." : `PLĂTEȘTE SECURE ${Number(total).toFixed(2)} LEI`}
      </button>
    </form>
  );
};

const ProductPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  // 1. TOATE HOOK-URILE DE STATE
  const [optiuniTransport, setOptiuniTransport] = useState([]);
  const [loadingComanda, setLoadingComanda] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [produs, setProdus] = useState(null);
  const [recenzii, setRecenzii] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transportDeschis, setTransportDeschis] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);

  // 2. HOOK-URILE REF
  const fbSectionRef = useRef(null);

  // Mai multe state-uri...
  const [formRecenzie, setFormRecenzie] = useState({ numeClient: '', text: '', rating: 5 });
  const [mesajForm, setMesajForm] = useState('');
  const [vizitatoriLive, setVizitatoriLive] = useState(14);
  const [timp, setTimp] = useState({ ore: 0, minute: 7, secunde: 43 });
  const [salesPopup, setSalesPopup] = useState({ vizibil: false, nume: '', timp: '' });

  // Fake data
  const numeFake = ['Andrei M.', 'Daniel P.', 'Marius T.', 'Florin V.'];
  const timpiFake = ['chiar acum', 'acum 2 minute', 'acum 5 minute'];

  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [comandaTrimisa, setComandaTrimisa] = useState(false);
  const [pachet, setPachet] = useState({ qty: 1, pret: 69 });
  const [extra, setExtra] = useState({ livrare: 0, cadou: 0, asigurare: 0 });
  const [dateClient, setDateClient] = useState({ nume: '', email: '', telefon: '', adresa: '', localitate: '', judet: '' });
  const [metodaPlata, setMetodaPlata] = useState('cash');
  const [tipLivrare, setTipLivrare] = useState('curier');
  const [lockerSelectat, setLockerSelectat] = useState(null);
  const [errors, setErrors] = useState({});
  const [socketClient, setSocketClient] = useState(null);

  // 3. VARIABILE CALCULATE DIN STATE
  const metodaCurenta = optiuniTransport.find(m => m.tip === tipLivrare);
  const transportBase = metodaCurenta ? Number(metodaCurenta.pret) : 19;
  const subtotal = Number(pachet.pret || 0) + Number(extra.livrare || 0) + Number(extra.cadou || 0) + Number(extra.asigurare || 0) + transportBase;
  const reducereCard = metodaPlata === 'card' ? subtotal * 0.05 : 0;
  const totalCheckout = subtotal - reducereCard;

  const pretCurier = optiuniTransport.find(m => m.tip === 'curier')?.pret || 19;
  const pretLocker = optiuniTransport.find(m => m.tip === 'locker')?.pret || 14.99;

  // 4. TOATE USEEFFECT-URILE (Laolaltă)

  // 4.a) Socket.IO Connection
  useEffect(() => {
    const conexiuneNoua = io(API_URL, {
      transports: ['websocket', 'polling']
    });
    setSocketClient(conexiuneNoua);

    conexiuneNoua.on('vizitatori_live', (numarReal) => {
      setVizitatoriLive(numarReal + 5);
    });

    return () => {
      conexiuneNoua.off('vizitatori_live');
      conexiuneNoua.disconnect();
    };
  }, []);

  // 4.b) Debounce Typed Events
  useEffect(() => {
    if (socketClient && isCheckoutOpen && dateClient.nume.length > 2) {
      const timer = setTimeout(() => {
        socketClient.emit('client_typing', {
          nume: dateClient.nume,
          telefon: dateClient.telefon,
          total: Number(totalCheckout).toFixed(2),
          produse: `${pachet.qty}x ${produs?.nume || 'Produs'}`
        });
      }, 800);
      return () => clearTimeout(timer);
    }
  }, [dateClient.nume, dateClient.telefon, totalCheckout, pachet.qty, isCheckoutOpen, produs?.nume, socketClient]);

  // 4.c) Scroll Listener
  useEffect(() => {
    const handleScroll = () => {
      if (fbSectionRef.current) {
        setShowStickyBar(window.scrollY > (fbSectionRef.current.offsetTop - window.innerHeight / 2));
      } else {
        setShowStickyBar(window.scrollY > 800);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 4.d) Data Fetching & Timers
  useEffect(() => {
    const fetchData = async () => {
      try {
        const resProd = await fetch(`${API_URL}/api/produse/${id}`);
        const dataProd = await resProd.json();
        setProdus(dataProd);

        if (dataProd.oferte && dataProd.oferte.length > 0) {
          setPachet({
            qty: Number(dataProd.oferte[0].cantitate),
            pret: Number(dataProd.oferte[0].pret),
            text: dataProd.oferte[0].text
          });
        } else {
          setPachet({ qty: 1, pret: dataProd.pret || 69, text: 'Pachet Standard' });
        }

        const resRec = await fetch(`${API_URL}/api/recenzii/produs/${id}`);
        if (resRec.ok) setRecenzii(await resRec.json());

        const resTrans = await fetch(`${API_URL}/api/transport`);
        if (resTrans.ok) {
          const dataTrans = await resTrans.json();
          setOptiuniTransport(dataTrans.filter(m => m.activ));
        }

        setIsLoading(false);
      } catch (err) {
        console.error(err);
        setIsLoading(false);
      }
    };
    fetchData();

    const intervalTimp = setInterval(() => {
      setTimp(prev => {
        if (prev.secunde > 0) return { ...prev, secunde: prev.secunde - 1 };
        if (prev.minute > 0) return { ...prev, minute: prev.minute - 1, secunde: 59 };
        return prev;
      });
    }, 1000);

    const popupInterval = setInterval(() => {
      setSalesPopup({
        vizibil: true,
        nume: numeFake[Math.floor(Math.random() * numeFake.length)],
        timp: timpiFake[Math.floor(Math.random() * timpiFake.length)]
      });
      setTimeout(() => setSalesPopup(prev => ({ ...prev, vizibil: false })), 5000);
    }, 18000);

    return () => {
      clearInterval(intervalTimp);
      clearInterval(popupInterval);
    };
  }, [id]);

  // 4.e) Abandoned Cart Silently Update
  useEffect(() => {
    if (dateClient.telefon.length >= 10 && dateClient.nume.length >= 3) {
      const salvareCos = setTimeout(() => {
        fetch(`${API_URL}/api/comenzi/abandonat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telefon: dateClient.telefon,
            numeClient: dateClient.nume,
            total: totalCheckout
          })
        }).catch(err => console.log("Cos silent update fail", err));
      }, 1000);

      return () => clearTimeout(salvareCos);
    }
  }, [dateClient.telefon, dateClient.nume, totalCheckout]);

  // 5. METODE ȘI LOGICĂ (Formulare, Validări)
  const renderStele = (rating, interactive = false) => {
    return [...Array(5)].map((_, i) => (
      <FiStar key={i} className={`star-icon ${i < rating ? 'filled' : ''} ${interactive ? 'interactive' : ''}`} onClick={() => interactive && setFormRecenzie({ ...formRecenzie, rating: i + 1 })} />
    ));
  };

  const trimiteRecenzie = async (e) => {
    e.preventDefault();
    if (!formRecenzie.numeClient || !formRecenzie.text) return setMesajForm('Completează toate câmpurile!');

    setLoadingReview(true);
    try {
      const res = await fetch(`${API_URL}/api/recenzii`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formRecenzie, produsId: id })
      });
      if (res.ok) {
        setMesajForm('✅ Recenzia a fost trimisă spre aprobare!');
        setFormRecenzie({ numeClient: '', text: '', rating: 5 });
      }
    } catch (err) {
      setMesajForm('❌ Eroare la trimitere.');
    } finally {
      setLoadingReview(false);
    }
  };

  const validateForm = () => {
    let newErrors = {};
    if (!dateClient.nume || dateClient.nume.length < 3) newErrors.nume = "Nume obligatoriu";
    if (!dateClient.telefon || dateClient.telefon.length < 10) newErrors.telefon = "Telefon invalid";

    if (tipLivrare === 'locker' && (!dateClient.email || !dateClient.email.includes('@'))) {
      newErrors.email = "Email valid obligatoriu pentru Easybox";
    }

    if (tipLivrare === 'curier') {
      if (!dateClient.adresa) newErrors.adresa = "Adresa e obligatorie";
      if (!dateClient.localitate) newErrors.localitate = "Localitatea e obligatorie";
      if (!dateClient.judet) newErrors.judet = "Județul e obligatoriu";
    }

    if (tipLivrare === 'locker' && !lockerSelectat) {
      newErrors.locker = "Te rugăm să alegi un Easybox de pe hartă";
    }

    setErrors(newErrors);

    if (Object.keys(newErrors).length > 0) {
      setTimeout(() => {
        const firstError = document.querySelector('.input-error');
        if (firstError) {
          firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }, 100);
      return false;
    }
    return true;
  };

  const genereazaPayload = (metoda, paymentId = null) => ({
    numeClient: dateClient.nume,
    telefonClient: dateClient.telefon,
    email: dateClient.email,
    produsId: produs._id,
    numeProdus: produs.nume,
    qty: pachet.qty,
    totalComanda: totalCheckout,
    metodaPlata: metoda,
    paymentId,
    tipLivrare: tipLivrare,
    adresaLivrare: tipLivrare === 'curier' ? dateClient.adresa : lockerSelectat?.address,
    localitate: tipLivrare === 'curier' ? dateClient.localitate : lockerSelectat?.city,
    judet: tipLivrare === 'curier' ? dateClient.judet : lockerSelectat?.county,
    samedayLockerId: tipLivrare === 'locker' ? lockerSelectat?.id : null,
    extraOptions: extra
  });

  const handleFinalizeCash = async () => {
    if (!validateForm()) return;
    setLoadingComanda(true);
    try {
      const res = await fetch(`${API_URL}/api/comenzi/noua`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genereazaPayload('Ramburs'))
      });
      if (res.ok) setComandaTrimisa(true);
      else throw new Error("Eroare server");
    } catch (err) {
      alert("Eroare la trimiterea comenzii spre server.");
    } finally {
      setLoadingComanda(false);
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    try {
      const res = await fetch(`${API_URL}/api/comenzi/noua`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(genereazaPayload('Plătit cu Cardul', paymentId))
      });
      if (res.ok) setComandaTrimisa(true);
    } catch (err) { alert("Eroare salvare plată în dashboard."); }
  };

  const openLockerMap = () => {
    alert("Simulare Hartă Easybox");
    setLockerSelectat({ id: "TEST_1234", name: "Easybox Mega Image", address: "Strada de Test, Nr. 10", city: "București", county: "București" });
    setErrors({ ...errors, locker: null });
  };

  // 🛑 6. LA FINAL DE TOT: RETURN-URILE DE LOADING ȘI PRODUS LIPSĂ
  if (isLoading) return (
    <div className="merkado-loader-wrapper">
      <div className="merkado-spinner-container">
        <div className="merkado-spin-ring"></div>
        <div className="merkado-spin-logo">M</div>
      </div>
      <h3 className="merkado-loader-text">Pregătim oferta<span>...</span></h3>
    </div>
  );

  if (!produs) return (
    <div className="merkado-loader-wrapper">
      <h3 className="merkado-loader-text" style={{ color: '#EF4444' }}>Produsul nu a fost găsit 😕</h3>
      <button onClick={() => navigate('/shop')} className="btn-red" style={{ marginTop: '20px', padding: '10px 20px', fontSize: '1rem' }}>Înapoi la Magazin</button>
    </div>
  );

  const sectiuniActive = produs.sectiuniLanding?.length > 0 ? produs.sectiuniLanding : [
    {
      tip: 'text_imagine',
      titlu: 'Soluția definitivă pentru tine',
      text: 'Nu mai pierde timpul cu produse care promit și nu livrează. Formula noastră este testată și validată pentru a oferi rezultate maxime în timp record.',
      imagineUrl: produs.imaginePrincipala
    },
    {
      tip: 'beneficii_grid',
      titlu: 'Rezultate dovedite clinic',
      beneficii: [{ text: '98% Clienți mulțumiți' }, { text: '100% Efect Garantat' }, { text: '24h Acțiune rapidă' }]
    }
  ];

  const metaDescription = produs.sectiuniLanding?.[0]?.text || `Cumpără acum ${produs.nume} la cel mai bun preț de ${produs.pret} Lei. Livrare rapidă în 24h și plată ramburs. Intră pe Merkado.ro!`;

  // 7. RĂSPUNSUL PRINCIPAL
  return (
    <div className="shopify-page-wrapper">

{/* 🚀 BREADCRUMBS SCHEMA PENTRU GOOGLE */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              {
                "@type": "ListItem",
                "position": 1,
                "name": "Acasă",
                "item": window.location.origin
              },
              {
                "@type": "ListItem",
                "position": 2,
                "name": "Magazin",
                "item": `${window.location.origin}/shop`
              },
              {
                "@type": "ListItem",
                "position": 3,
                "name": produs.nume,
                "item": window.location.href
              }
            ]
          })
        }}></script>

      {/* 🚀 SEO BLOCK INCEPE AICI */}
      <Helmet>
        <title>{produs.nume} | Preț Special & Livrare 24h | MERKADO</title>
        <link rel="canonical" href={window.location.href} />
        <meta name="description" content={metaDescription} />
        <meta property="og:title" content={`${produs.nume} - Reducere Limitată | MERKADO`} />
        <meta property="og:description" content={metaDescription} />
        <meta property="og:image" content={produs.imaginePrincipala} />
        <meta property="og:url" content={window.location.href} />
        <meta property="og:type" content="product" />
        <meta name="twitter:card" content="summary_large_image" />
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org/",
            "@type": "Product",
            "name": produs.nume,
            "image": [produs.imaginePrincipala],
            "description": metaDescription,
            "brand": {
              "@type": "Brand",
              "name": "MERKADO"
            },
            "offers": {
              "@type": "Offer",
              "url": window.location.href,
              "priceCurrency": "RON",
              "price": produs.pret,
              "availability": "https://schema.org/InStock",
              "itemCondition": "https://schema.org/NewCondition"
            },
            "aggregateRating": {
              "@type": "AggregateRating",
              "ratingValue": "4.8",
              "reviewCount": recenzii.length > 0 ? recenzii.length : 445
            }
          })}
        </script>
      </Helmet>
      {/* 🚀 SEO BLOCK SE TERMINA AICI */}

      <div className="marquee-container">
        <div className="marquee-text">
          <span>🔴 TRANSPORT GRATUIT PENTRU COMENZI PESTE 200 LEI 🔴 LIVRARE RAPIDĂ ÎN 24H 🔴 RETUR GARANTAT ÎN 14 ZILE 🔴 STOC LIMITAT 🔴</span>
        </div>
      </div>

{/* 🧭 FIRUL ARIADNEI (BREADCRUMBS VIZUAL) */}
      <div className="container">
        <nav className="merkado-breadcrumbs" aria-label="breadcrumb">
          <Link to="/">Acasă</Link>
          <span className="bc-separator">/</span>
          <Link to="/shop">Magazin</Link>
          
          {/* Dacă produsul are categorie, o afișăm și pe aia */}
          {produs.categorie && (
            <>
              <span className="bc-separator">/</span>
              <Link to={`/shop?cat=${produs.categorie}`}>{produs.categorie}</Link>
            </>
          )}
          
          <span className="bc-separator">/</span>
          <span className="bc-current" aria-current="page">{produs.nume}</span>
        </nav>
      </div>

      <div className="shopify-container" style={{ paddingBottom: '100px' }}>
        <div className="hero-grid">
          <div className="hero-image-col">
            {/* SEO: Am adăugat alt-ul dinamic pentru indexarea imaginilor pe Google */}
            <img src={produs.imaginePrincipala} alt={`Imagine produs ${produs.nume} - Cumpără de pe Merkado.ro`} className="main-prod-img" />
          </div>

          <div className="hero-info-col">
            <div className="reviews-badge">
              <div className="stars">{renderStele(5)}</div>
              <span>{recenzii.length > 0 ? `${recenzii.length}+ Recenzii` : '445 Recenzii Verificate'}</span>
            </div>

            <h1 className="prod-title">{produs.nume}</h1>

            <div className="price-wrap">
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span className="price-new">{produs.pret} lei</span>
                <span className="urgent-price-tag">Ofertă limitată!</span>
              </div>
              {produs.pretVechi && <span className="price-old">{produs.pretVechi} lei (preț întreg)</span>}
            </div>

            <div className="bullet-points">
              <p>✨ Soluție premium cu efect garantat</p>
              <p>💪 Ușor de folosit, acasă la tine</p>
              <p>⏳ Rezultate vizibile și de lungă durată</p>
            </div>

            <div className="stock-alert">
              <span className="dot"></span> Doar 5 bucăți rămase la preț redus!
            </div>

            <button className="btn-red mega-btn" onClick={() => setIsCheckoutOpen(true)}>
              <FiShoppingBag className="btn-icon" />
              <div className="btn-text">
                <strong>COMANDĂ ACUM</strong>
                <small>Oferta expiră azi</small>
              </div>
            </button>

            <a href="tel:0723717438" className="btn-phone-full">
              <div className="phone-icon-sleek">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l2.28-2.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path>
                </svg>
              </div>
              <span className="phone-text-sleek">COMANDĂ TELEFONICĂ</span>
            </a>

            <div className="countdown-wrap">
              <p>Prețul <span className="text-red">va crește înapoi la {produs.pretVechi || produs.pret + 50} lei</span> când expiră timpul!</p>
              <div className="circles-wrap">
                <div className="time-circle"><strong>{String(timp.ore).padStart(2, '0')}</strong><span>ore</span></div>
                <div className="time-circle active-circle"><strong>{String(timp.minute).padStart(2, '0')}</strong><span>minute</span></div>
                <div className="time-circle active-circle"><strong>{String(timp.secunde).padStart(2, '0')}</strong><span>secunde</span></div>
              </div>
            </div>

            <div className="trust-icons">
              <div className="t-icon"><FiTruck /><span>Transport asigurat</span></div>
              <div className="t-icon"><FiShield /><span>Plată Ramburs</span></div>
              <div className="t-icon"><FiRotateCcw /><span>Retur Gratuit</span></div>
            </div>

            <div className="accordion-wrap">
              <div className="acc-header" onClick={() => setTransportDeschis(!transportDeschis)}>
                <span>🌐 Informații privind transportul</span>
                {transportDeschis ? <FiChevronUp /> : <FiChevronDown />}
              </div>
              {transportDeschis && <div className="acc-content">Livrare 24/48h în toată țara prin curier rapid. Plătești cash la livrare.</div>}
            </div>

            <div className="live-viewers">
              <span className="dot"></span> Chiar acum se uită <strong>{vizitatoriLive} oameni</strong> la acest produs
            </div>

            <div className="facebook-proof-section" ref={fbSectionRef}>
              <p className="fb-proof-title"><FiThumbsUp style={{ color: '#1877F2', marginRight: '5px' }} /> Ce spun clienții pe Facebook:</p>
              <div className="fb-image-placeholder">
                <img src="https://via.placeholder.com/600x250/f0f2f5/1c1e21?text=Aici+vine+poza+ta+cu+comentariile+de+pe+Facebook" alt={`Păreri clienți Facebook despre ${produs.nume}`} />
              </div>
            </div>
          </div>
        </div>

        <div className="dynamic-content">
          {sectiuniActive.map((sec, idx) => (
            <div key={idx} className="builder-section">
              {(!sec.tip || sec.tip === 'text_imagine') && (
                <div className="info-block">
                  {sec.titlu && <h2>{sec.titlu}</h2>}
                  {sec.text && <p>{sec.text}</p>}
                  {sec.imagineUrl && <img src={sec.imagineUrl} alt={`${sec.titlu} - ${produs.nume}`} className="info-img" />}
                </div>
              )}

              {sec.tip === 'beneficii_grid' && (
                <div className="procente-container">
                  {sec.titlu && <h2>{sec.titlu}</h2>}
                  {sec.beneficii?.map((b, i) => {
                    const match = b.text.match(/^(\d+)%(.*)/);
                    const proc = match ? match[1] : "99";
                    const text = match ? match[2] : b.text;
                    return (
                      <div key={i} className="procent-item">
                        <div className="procent-header">
                          <span>{text}</span>
                          <span className="procent-valoare">{proc}%</span>
                        </div>
                        <div className="procent-bar-bg">
                          <div className="procent-bar-fill" style={{ width: `${proc}%`, background: i % 2 === 0 ? 'linear-gradient(90deg, #3b82f6, #60a5fa)' : 'linear-gradient(90deg, #10b981, #34d399)' }}></div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          ))}

          <div className="comparison-block comparatie-section">
            <h2 className="comparatie-text" style={{ color: '#ffffff', marginBottom: '20px' }}>De ce produsul nostru e superior</h2>
            <table className="comp-table">
              <thead>
                <tr><th style={{ color: '#000000' }}>Caracteristici</th><th style={{ color: '#000000' }}>Noi</th><th style={{ color: '#000000' }}>Alții</th></tr>
              </thead>
              <tbody>
                <tr><td className="comparatie-text">Efect Garantat</td><td><FiCheck className="c-green" /></td><td><FiX style={{ color: '#ff4d4d' }} /></td></tr>
                <tr><td className="comparatie-text">Calitate Superioară</td><td><FiCheck className="c-green" /></td><td><FiX style={{ color: '#ff4d4d' }} /></td></tr>
                <tr><td className="comparatie-text">Fără reacții adverse</td><td><FiCheck className="c-green" /></td><td><FiX style={{ color: '#ff4d4d' }} /></td></tr>
                <tr><td className="comparatie-text">Preț Corect</td><td><FiCheck className="c-green" /></td><td><FiX style={{ color: '#ff4d4d' }} /></td></tr>
              </tbody>
            </table>
          </div>
        </div>

        <div className="customer-reviews-section">
          <h2>Recenziile Clienților pentru {produs.nume}</h2>

          <div className="reviews-aggregator">
            <div className="agg-left">
              <span className="agg-score">4.8</span>
              <div className="stars">{renderStele(5)}</div>
              <span className="agg-total">Bazat pe 5,000+ recenzii</span>
            </div>
            <div className="agg-right">
              <div className="progress-row"><span>5 stele</span><div className="progress-bar"><div className="fill" style={{ width: '85%' }}></div></div><span>85%</span></div>
              <div className="progress-row"><span>4 stele</span><div className="progress-bar"><div className="fill" style={{ width: '10%' }}></div></div><span>10%</span></div>
              <div className="progress-row"><span>3 stele</span><div className="progress-bar"><div className="fill" style={{ width: '5%' }}></div></div><span>5%</span></div>
            </div>
          </div>

          <div className="reviews-grid">
            {recenzii.map(r => (
              <div key={r._id} className="rev-card">
                <div className="rev-card-top">
                  <div className="stars">{renderStele(r.rating)}</div>
                  <span className="verified"><FiCheck /> Achiziție verificată</span>
                </div>
                <h3>{r.numeClient}</h3>
                <p>"{r.text}"</p>
                {r.imagineUrl && <img src={r.imagineUrl} alt={`Recenzie cu poză de la ${r.numeClient} pentru ${produs.nume}`} className="rev-img" />}
              </div>
            ))}
          </div>

          <div className="add-review-box">
            <h3>Părerea ta contează!</h3>
            {mesajForm && <p className="form-msg">{mesajForm}</p>}
            <form onSubmit={trimiteRecenzie}>
              <div className="stars-select">{renderStele(formRecenzie.rating, true)}</div>
              <input type="text" placeholder="Numele tău" value={formRecenzie.numeClient} onChange={e => setFormRecenzie({ ...formRecenzie, numeClient: e.target.value })} required />
              <textarea placeholder="Scrie recenzia ta aici..." rows="3" value={formRecenzie.text} onChange={e => setFormRecenzie({ ...formRecenzie, text: e.target.value })} required></textarea>
              <button type="submit" className="btn-red">Trimite Recenzia</button>
            </form>
          </div>
        </div>

      </div>

      <div className={`sales-popup ${salesPopup.vizibil ? 'show' : ''} ${showStickyBar ? 'lifted' : ''}`}>
        <img src={produs.imaginePrincipala} alt={`Alertă comandă ${produs.nume}`} className="sales-popup-img" />
        <div className="sales-popup-info">
          <p><strong>{salesPopup.nume}</strong> a comandat recent</p>
          <p className="sales-popup-prod">{produs.nume}</p>
          <small>{salesPopup.timp} • Verificat</small>
        </div>
      </div>

      {isCheckoutOpen && (
        <div className="checkout-modal-overlay" onClick={() => setIsCheckoutOpen(false)}>
          <div className="checkout-modal-wrapper" onClick={(e) => e.stopPropagation()}>
            <button className="close-checkout-absolute-btn" onClick={() => setIsCheckoutOpen(false)}><FiX /></button>

            {comandaTrimisa ? (
              <div className="checkout-success" style={{ padding: '60px 20px', textAlign: 'center' }}>
                <FiCheckCircle style={{ fontSize: '5rem', color: '#10b981', margin: '0 auto 20px' }} />
                <h2 style={{ fontSize: '2rem', marginBottom: '10px' }}>Comandă Reușită!</h2>
                <p style={{ fontSize: '1.1rem', color: '#475569' }}>Mulțumim, <strong>{dateClient.nume}</strong>! Comanda a fost înregistrată.</p>
                <button onClick={() => { setIsCheckoutOpen(false); setComandaTrimisa(false); window.location.reload(); }} className="btn-finalize cash" style={{ marginTop: '30px', maxWidth: '250px', margin: '30px auto 0' }}>Înapoi la magazin</button>
              </div>
            ) : (
              <>
                <div className="checkout-header-product">
                  <img src={produs.imaginePrincipala} alt={`Checkout pentru ${produs.nume}`} />
                  <div><h4>{produs.nume}</h4><p>Finalizează comanda în siguranță</p></div>
                </div>

                <div className="checkout-main-grid">

                  <div className="checkout-form-side">

                    <div className="checkout-section">
                      <h5 className="section-title">1. Date de livrare</h5>

                      <div className="input-group-wrapper">
                        <input type="text" className={`checkout-input ${errors.nume ? 'input-error' : ''}`} placeholder="Nume și Prenume" value={dateClient.nume} onChange={e => { setDateClient({ ...dateClient, nume: e.target.value }); setErrors({ ...errors, nume: null }); }} />
                        {errors.nume && <span className="error-text">{errors.nume}</span>}
                      </div>

                      <div className="input-group-wrapper">
                        <input type="tel" className={`checkout-input ${errors.telefon ? 'input-error' : ''}`} placeholder="Telefon" value={dateClient.telefon} onChange={e => { setDateClient({ ...dateClient, telefon: e.target.value }); setErrors({ ...errors, telefon: null }); }} />
                        {errors.telefon && <span className="error-text">{errors.telefon}</span>}
                      </div>

                      <div className="input-group-wrapper">
                        <input
                          type="email"
                          className={`checkout-input ${errors.email ? 'input-error' : ''}`}
                          placeholder={`Adresă de Email ${tipLivrare === 'curier' ? '(Opțional)' : '* Obligatoriu'}`}
                          value={dateClient.email}
                          onChange={e => { setDateClient({ ...dateClient, email: e.target.value }); setErrors({ ...errors, email: null }); }}
                          style={tipLivrare === 'locker' ? { borderColor: '#3b82f6', borderWidth: '2px' } : {}}
                        />
                        {errors.email && <span className="error-text">{errors.email}</span>}
                        {tipLivrare === 'locker' && (
                          <small style={{ color: '#3b82f6', fontSize: '0.8rem', marginTop: '4px', display: 'block' }}>
                            *Emailul este necesar pentru a primi codul PIN Easybox.
                          </small>
                        )}
                      </div>

                      <div className="modern-toggle-group">
                        {optiuniTransport.some(m => m.tip === 'curier') && (
                          <div className={`modern-toggle-card ${tipLivrare === 'curier' ? 'active' : ''}`} onClick={() => setTipLivrare('curier')} style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <FiTruck className="toggle-icon" /> <span>Acasă / Birou</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '4px', color: tipLivrare === 'curier' ? '#3b82f6' : '#64748b' }}>
                              {pretCurier} Lei
                            </span>
                          </div>
                        )}

                        {optiuniTransport.some(m => m.tip === 'locker') && (
                          <div className={`modern-toggle-card ${tipLivrare === 'locker' ? 'active' : ''}`} onClick={() => setTipLivrare('locker')} style={{ display: 'flex', flexDirection: 'column', padding: '12px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
                              <FiBox className="toggle-icon" /> <span>Easybox</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '4px', color: tipLivrare === 'locker' ? '#3b82f6' : '#64748b' }}>
                              {pretLocker} Lei
                            </span>
                          </div>
                        )}
                      </div>

                      {tipLivrare === 'curier' ? (
                        <div className="fade-in">
                          <div className="input-group-wrapper">
                            <input type="text" className={`checkout-input ${errors.adresa ? 'input-error' : ''}`} placeholder="Adresă completă (Strada, Nr, Bloc)" value={dateClient.adresa} onChange={e => { setDateClient({ ...dateClient, adresa: e.target.value }); setErrors({ ...errors, adresa: null }); }} />
                            {errors.adresa && <span className="error-text">{errors.adresa}</span>}
                          </div>

                          <div className="input-row">
                            <div className="input-group-wrapper" style={{ flex: 1 }}>
                              <select className={`checkout-input ${errors.judet ? 'input-error' : ''}`} value={dateClient.judet} onChange={e => { setDateClient({ ...dateClient, judet: e.target.value }); setErrors({ ...errors, judet: null }); }}>
                                <option value="">Alege Județul...</option>
                                {listaJudete.map(judet => <option key={judet} value={judet}>{judet}</option>)}
                              </select>
                              {errors.judet && <span className="error-text">{errors.judet}</span>}
                            </div>
                            <div className="input-group-wrapper" style={{ flex: 1 }}>
                              <input type="text" className={`checkout-input ${errors.localitate ? 'input-error' : ''}`} placeholder="Localitate / Oraș" value={dateClient.localitate} onChange={e => { setDateClient({ ...dateClient, localitate: e.target.value }); setErrors({ ...errors, localitate: null }); }} />
                              {errors.localitate && <span className="error-text">{errors.localitate}</span>}
                            </div>
                          </div>
                        </div>
                      ) : (
                        <div className="fade-in">
                          <button type="button" className={`btn-select-locker ${errors.locker ? 'input-error' : ''}`} onClick={openLockerMap}>
                            📍 Alege Harta Easybox
                          </button>
                          {errors.locker && <span className="error-text" style={{ display: 'block', marginTop: '5px' }}>{errors.locker}</span>}
                          {lockerSelectat && (
                            <div style={{ marginTop: '12px', padding: '14px', background: '#f0fdf4', border: '1px solid #22c55e', borderRadius: '10px', color: '#15803d', fontWeight: '600' }}>
                              ✅ {lockerSelectat.name} <br /><span style={{ fontWeight: '400', fontSize: '0.9rem' }}>{lockerSelectat.address}</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="checkout-section" style={{ marginTop: '30px' }}>
                      <h5 className="section-title">2. Alege Oferta</h5>

                      {produs.oferte && produs.oferte.length > 0 ? (
                        produs.oferte.map((of, index) => (
                          <div
                            key={index}
                            className={`offer-card ${pachet.qty === Number(of.cantitate) ? 'active' : ''} ${index === 1 ? 'recommended' : ''}`}
                            onClick={() => setPachet({ qty: Number(of.cantitate), pret: Number(of.pret), text: of.text })}
                          >
                            {index === 1 && <div className="rec-badge">RECOMANDAT</div>}
                            <strong>{of.cantitate} Bucăți <span style={{ fontSize: '0.85rem', fontWeight: 'normal', color: '#64748b' }}>({of.text})</span></strong>
                            <span style={{ color: pachet.qty === Number(of.cantitate) ? '#3b82f6' : '#1e293b', fontWeight: '800' }}>
                              {of.pret} Lei
                            </span>
                          </div>
                        ))
                      ) : (
                        <div className={`offer-card active`} onClick={() => setPachet({ qty: 1, pret: produs.pret })}>
                          <strong>1 Bucată</strong> <span>{produs.pret} Lei</span>
                        </div>
                      )}
                    </div>

                    <div className="checkout-section" style={{ marginTop: '30px' }}>
                      <h5 className="section-title">3. Opțiuni Suplimentare</h5>
                      <label className="upsell-label">
                        <div className="upsell-left"><input type="checkbox" onChange={e => setExtra({ ...extra, livrare: e.target.checked ? 4.99 : 0 })} /> <FiTruck /> Livrare Urgentă</div>
                        <span>4.99 Lei</span>
                      </label>
                    </div>

                  </div>

                  <div className="checkout-summary-side">
                    <h3 style={{ margin: '0 0 20px 0', fontSize: '1.2rem' }}>Sumar Comandă</h3>
                    <div className="summary-row"><span>Produs ({pachet.qty}x)</span> <span>{pachet.pret} Lei</span></div>
                    <div className="summary-row"><span>Transport</span> <span>{transportBase} Lei</span></div>
                    {extra.livrare > 0 && <div className="summary-row extra"><span>Livrare Urgentă</span> <span>4.99 Lei</span></div>}

                    {metodaPlata === 'card' && (
                      <div className="summary-row fade-in" style={{ color: '#10b981', fontWeight: 'bold', padding: '10px 0', borderTop: '1px dashed #e2e8f0', borderBottom: '1px dashed #e2e8f0' }}>
                        <span>🎁 Reducere Card (-5%)</span> <span>-{Number(reducereCard).toFixed(2)} Lei</span>
                      </div>
                    )}

                    <div className="total-row">
                      <span>TOTAL DE PLATĂ</span> <span style={{ color: '#e61938' }}>{Number(totalCheckout).toFixed(2)} Lei</span>
                    </div>

                    <div className="modern-toggle-group">
                      <div className={`modern-toggle-card payment ${metodaPlata === 'cash' ? 'active' : ''}`} onClick={() => setMetodaPlata('cash')}>
                        <FiTruck className="toggle-icon" /> <span>Plată Ramburs</span>
                      </div>

                      <div className={`modern-toggle-card payment ${metodaPlata === 'card' ? 'active' : ''}`} onClick={() => setMetodaPlata('card')} style={{ position: 'relative', overflow: 'hidden' }}>
                        <FiCreditCard className="toggle-icon" /> <span>Card Online</span>
                        <div style={{
                          position: 'absolute',
                          top: '12px',
                          right: '-28px',
                          background: '#10b981',
                          color: 'white',
                          fontSize: '0.65rem',
                          fontWeight: '800',
                          padding: '3px 30px',
                          transform: 'rotate(45deg)',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          zIndex: 1
                        }}>
                          EXTRA -5%
                        </div>
                      </div>
                    </div>

                    {metodaPlata === 'cash' ? (
                      <button type="button" className="btn-finalize cash" onClick={handleFinalizeCash} disabled={loadingComanda}>
                        {loadingComanda ? "SE PROCESEAZĂ..." : <>FINALIZEAZĂ COMANDA <FiChevronRight /></>}
                      </button>
                    ) : (
                      <div className="stripe-container-box">
                        <Elements stripe={stripePromise}>
                          <StripePaymentForm
                            total={totalCheckout}
                            dateClient={dateClient}
                            tipLivrare={tipLivrare}
                            lockerSelectat={lockerSelectat}
                            validateForm={validateForm}
                            onPaymentSuccess={handlePaymentSuccess}
                            payloadComanda={genereazaPayload('card')}
                          />
                        </Elements>
                      </div>
                    )}

                    <div style={{ textAlign: 'center', marginTop: '15px', color: '#64748b', fontSize: '0.85rem', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '5px' }}>
                      <FiLock /> Toate datele tale sunt criptate.
                    </div>
                  </div>

                </div>
              </>
            )}
          </div>
        </div>
      )}

      <div className={`sticky-buy-wrapper ${showStickyBar ? 'show' : ''}`}>
        <div className="sticky-buy-content">
          <button className="btn-sticky-buy" onClick={() => setIsCheckoutOpen(true)}>
            CUMPĂRĂ ACUM
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
