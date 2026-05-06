import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { loadStripe } from '@stripe/stripe-js';
import { io } from 'socket.io-client';
import { Helmet } from 'react-helmet-async';

import {
  Elements, CardNumberElement, CardExpiryElement, CardCvcElement,
  useStripe, useElements
} from '@stripe/react-stripe-js';
import {
  FiSearch , FiStar, FiTruck, FiShield, FiRotateCcw, FiChevronDown, FiChevronUp,
  FiCheck, FiArrowRight, FiShoppingBag, FiX, FiThumbsUp, FiLock, FiCheckCircle, FiChevronRight, FiCreditCard, FiBox, FiAlertCircle
} from 'react-icons/fi';
import './ProductPage.css';

const API_URL = import.meta.env.VITE_API_URL;
const STRIPE_KEY = import.meta.env.VITE_STRIPE_PUBLIC_KEY ;
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
  const [listaLocalitatiFiltrate, setListaLocalitatiFiltrate] = useState([]);
  const [optiuniTransport, setOptiuniTransport] = useState([]);
  const [loadingComanda, setLoadingComanda] = useState(false);
  const [loadingReview, setLoadingReview] = useState(false);
  const [produs, setProdus] = useState(null);
  const [produseSimilare, setProduseSimilare] = useState([]);
  const [recenzii, setRecenzii] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [transportDeschis, setTransportDeschis] = useState(false);
  const [showStickyBar, setShowStickyBar] = useState(false);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  const fbSectionRef = useRef(null);

  const [formRecenzie, setFormRecenzie] = useState({ numeClient: '', text: '', rating: 5 });
  const [hoverRating, setHoverRating] = useState(0);
  const [mesajForm, setMesajForm] = useState('');
  const [vizitatoriLive, setVizitatoriLive] = useState(14);
  const [timp, setTimp] = useState({ ore: 0, minute: 7, secunde: 43 });
  const [salesPopup, setSalesPopup] = useState({ vizibil: false, nume: '', timp: '' });

  const numeFake = ['Andrei M.', 'Daniel P.', 'Marius T.', 'Florin V.'];
  const timpiFake = ['chiar acum', 'acum 2 minute', 'acum 5 minute'];
const [cautareLocalitate, setCautareLocalitate] = useState('');
  const [dropdownLocalitateDeschis, setDropdownLocalitateDeschis] = useState(false);
  const [cautareLocker, setCautareLocker] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [comandaTrimisa, setComandaTrimisa] = useState(false);
  const [pachet, setPachet] = useState({ qty: 1, pret: 69 });
  const [extra, setExtra] = useState({ livrare: 0, cadou: 0, asigurare: 0 });
  const [dateClient, setDateClient] = useState({ nume: '', email: '', telefon: '', adresa: '', localitate: '', judet: '' });
  const [metodaPlata, setMetodaPlata] = useState('cash');
  const [tipLivrare, setTipLivrare] = useState('curier');
  const [lockerSelectat, setLockerSelectat] = useState(null);
  const [lockereDisponibile, setLockereDisponibile] = useState([]);
  const [loadingLockers, setLoadingLockers] = useState(false);
  const [eroareLockere, setEroareLockere] = useState('');
  const [errors, setErrors] = useState({});
  const [socketClient, setSocketClient] = useState(null);
  
  // 🛎️ TOAST NOTIFICATIONS
  const [toast, setToast] = useState(null);

  const arataToast = (tip, mesaj) => {
    setToast({ tip, mesaj });
    setTimeout(() => setToast(null), 5000);
  };

  const metodaCurenta = optiuniTransport.find(m => m.tip === tipLivrare);
  const transportBase = metodaCurenta ? Number(metodaCurenta.pret) : 19;
  const subtotal = Number(pachet.pret || 0) + Number(extra.livrare || 0) + Number(extra.cadou || 0) + Number(extra.asigurare || 0) + transportBase;
  const reducereCard = metodaPlata === 'card' ? subtotal * 0.05 : 0;
  const totalCheckout = subtotal - reducereCard;

  const pretCurier = optiuniTransport.find(m => m.tip === 'curier')?.pret || 19;
  const pretLocker = optiuniTransport.find(m => m.tip === 'locker')?.pret || 14.99;

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

    useEffect(() => {
      const fetchData = async () => {
      try {
        // 🔥 MAGIE: Cerem absolut TOT de la server simultan, nu pe rând!
        const [resProd, resRec, resTrans, resToate] = await Promise.all([
          fetch(`${API_URL}/api/produse/${id}`),
          fetch(`${API_URL}/api/recenzii/produs/${id}`),
          fetch(`${API_URL}/api/transport`),
          fetch(`${API_URL}/api/produse`)
        ]);

        if (!resProd.ok) throw new Error("Produsul nu a fost găsit");
        
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

        if (resRec.ok) setRecenzii(await resRec.json());
        
        if (resTrans.ok) {
          const dataTrans = await resTrans.json();
          setOptiuniTransport(dataTrans.filter(m => m.activ));
        }

        if (resToate.ok) {
          const toate = await resToate.json();
          const similare = toate.filter(p => p._id !== id).slice(0, 4);
          setProduseSimilare(similare);
        }

        setIsLoading(false);
      } catch (err) {
        console.error("Eroare la aducerea datelor paginii:", err);
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

  // 🔍 FUNCȚIA CARE CERE LOCKERELE DE LA SERVER
  const cautaLockereInZona = async () => {
    if (!dateClient.judet || !dateClient.localitate) {
      setErrors({ ...errors, locker: "Te rog să alegi județul și să scrii localitatea mai întâi!" });
      return;
    }
    setErrors({ ...errors, locker: null });
    setLoadingLockers(true);
    setEroareLockere('');
    
    try {
      const res = await fetch(`${API_URL}/api/lockers?judet=${dateClient.judet}&localitate=${dateClient.localitate}`);
      const data = await res.json();
      
      if (res.ok) {
        if (data.length === 0) setEroareLockere(`Nu am găsit Fanbox-uri în ${dateClient.localitate}.`);
        else setLockereDisponibile(data);
      } else {
        setEroareLockere(data.eroare || "Eroare la căutare.");
      }
    } catch (err) {
      setEroareLockere("Eroare de conexiune la server.");
    }
    setLoadingLockers(false);
  };

  // 🇷🇴 HOOK PENTRU LOCALITĂȚI (Adaptat pentru fișier de tip OBIECT)
  useEffect(() => {
    if (!dateClient.judet) {
      setListaLocalitatiFiltrate([]);
      return;
    }

    const fetchLocalitati = async () => {
      try {
        const res = await fetch(`/localitati.json?t=${new Date().getTime()}`); 
        if (!res.ok) throw new Error("Serverul nu a găsit fișierul localitati.json");
        
        const dateRaw = await res.json();
        
        // 🔥 AICI ERA PROBLEMA: Convertim OBIECTUL tău cu numere într-o LISTĂ normală
        const arrayLocalitati = Array.isArray(dateRaw) ? dateRaw : Object.values(dateRaw);
        
        // Funcție care elimină diacriticele pentru comparație perfectă
        const eliminaDiacritice = (str) => {
          return str ? str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase() : '';
        };

        // Acum putem filtra liniștiți
        const filtrate = arrayLocalitati.filter(loc => {
          const judetDinDate = loc.county_name || '';
          return eliminaDiacritice(judetDinDate) === eliminaDiacritice(dateClient.judet);
        });
        
        filtrate.sort((a, b) => (a.name || '').localeCompare(b.name || ''));
        setListaLocalitatiFiltrate(filtrate);

      } catch (err) {
        console.error("❌ Eroare la încărcarea localităților:", err.message);
      }
    };

    fetchLocalitati();
  }, [dateClient.judet]);

  // 🗺️ HOOK NOU: ÎNCĂRCARE HARTĂ EASYBOX
  useEffect(() => {
    const script = document.createElement('script');
    script.src = "https://cdn.sameday.ro/locker-plugin/lockerpluginsameday.js";
    script.async = true;
    document.body.appendChild(script);

    const handleLockerSelect = (event) => {
      if (typeof event.data === 'object' && event.data !== null) {
        if (event.data.lockerId) {
          console.log("📦 Clientul a ales Locker-ul:", event.data);
          setLockerSelectat({
            id: event.data.lockerId,
            name: event.data.name,
            address: event.data.address,
            city: event.data.city,
            county: event.data.county
          });
          
          setErrors((prev) => ({ ...prev, locker: null }));
          
          if (window.LockerPlugin) {
            window.LockerPlugin.getInstance().close();
          }
        }
      }
    };

    window.addEventListener('message', handleLockerSelect);

    return () => {
      window.removeEventListener('message', handleLockerSelect);
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

// 💾 Salvare automată draft (Coș Abandonat)
  const salveazaDraft = async () => {
    if (dateClient.telefon && dateClient.telefon.length >= 10) {
      try {
        await fetch(`${API_URL}/api/comenzi/abandonat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            telefon: dateClient.telefon,
            numeClient: dateClient.nume || 'Anonim',
            total: totalCheckout
          })
        });
      } catch (err) { console.log("Eroare la salvare draft:", err); }
    }
  };

  // 🛡️ VALIDARE
  const validateForm = () => {
    let newErrors = {};
    if (!dateClient.nume || dateClient.nume.length < 3) newErrors.nume = "Nume obligatoriu";
    if (!dateClient.telefon || dateClient.telefon.length < 10) newErrors.telefon = "Telefon invalid";

    if (tipLivrare === 'locker') {
      if (!dateClient.email || !dateClient.email.includes('@')) {
        newErrors.email = "Email obligatoriu pentru Easybox (cod PIN)";
      }
      if (!lockerSelectat) {
        newErrors.locker = "Te rugăm să alegi un Easybox din listă";
      }
    } else {
      if (!dateClient.adresa) newErrors.adresa = "Adresa e obligatorie";
      if (!dateClient.localitate) newErrors.localitate = "Localitatea e obligatorie";
      if (!dateClient.judet) newErrors.judet = "Județul e obligatoriu";
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

  // 🛡️ CONSTRUCȚIA CORECTĂ A PACHETULUI PENTRU BACKEND
  const genereazaPayload = (metoda, paymentId = null) => ({
    numeClient: dateClient.nume,
    telefon: dateClient.telefon, 
    email: dateClient.email,
    produsId: produs._id,
    numeProdus: produs.nume,
    qty: pachet.qty,
    total: totalCheckout, 
    metodaPlata: metoda,
    paymentId,
    tipLivrare: tipLivrare,
    adresa: tipLivrare === 'curier' ? dateClient.adresa : (lockerSelectat?.address || "-"),
    localitate: tipLivrare === 'curier' ? dateClient.localitate : (lockerSelectat?.city || "-"),
    judet: tipLivrare === 'curier' ? dateClient.judet : (lockerSelectat?.county || "-"),
    samedayLockerId: tipLivrare === 'locker' ? lockerSelectat?.id : null,
    extraOptions: extra
  });

  const handleFinalizeCash = async () => {
    if (!validateForm()) return;
    setLoadingComanda(true);

    const sursaTrafic = localStorage.getItem('sursa_trafic') || 'Organic / Direct';

    try {
      const res = await fetch(`${API_URL}/api/comenzi/noua`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...genereazaPayload('Ramburs'), sursa: sursaTrafic })
      });
      
      if (res.ok) {
        setComandaTrimisa(true);
        localStorage.removeItem('sursa_trafic');
      }
      else {
        const errorData = await res.json();
        throw new Error(errorData.eroare || "Eroare server");
      }
    } catch (err) {
      arataToast('error', `Eroare la trimiterea comenzii: ${err.message}`);
    } finally {
      setLoadingComanda(false);
    }
  };

  const handlePaymentSuccess = async (paymentId) => {
    const sursaTrafic = localStorage.getItem('sursa_trafic') || 'Organic / Direct';

    try {
      const res = await fetch(`${API_URL}/api/comenzi/noua`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...genereazaPayload('Plătit cu Cardul', paymentId), sursa: sursaTrafic })
      });
      
      if (res.ok) {
        setComandaTrimisa(true);
        localStorage.removeItem('sursa_trafic');
      }
    } catch (err) { arataToast('error', "Eroare salvare plată în dashboard."); }
  };

  const openLockerMap = () => {
    if (window.LockerPlugin) {
      window.LockerPlugin.init({
        clientId: 'aici_pui_client_id',
        country: 'RO',
        language: 'ro',
        city: dateClient.localitate || 'Bucuresti' 
      });
      window.LockerPlugin.getInstance().open();
    } else {
      arataToast('error', "Harta se încarcă în fundal... Te rugăm să mai aștepți 2 secunde!");
    }
  };

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

// Daca ai bagat din admin sectiuni, le afisam. Daca nu, array-ul e gol si nu apare nimic.
  const sectiuniActive = produs.sectiuniLanding?.length > 0 ? produs.sectiuniLanding : [];

  const metaDescription = produs.sectiuniLanding?.[0]?.text || `Cumpără acum ${produs.nume} la cel mai bun preț de ${produs.pret} Lei. Livrare rapidă în 24h și plată ramburs. Intră pe Merkado.ro!`;
  // 🔥 CALCULĂM IMAGINILE PENTRU GALERIE
  const imaginiProdus = produs.galerieImagini?.length > 0 
    ? produs.galerieImagini 
    : (produs.imaginePrincipala ? [produs.imaginePrincipala] : []);

  return (
    <div className="shopify-page-wrapper">

        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BreadcrumbList",
            "itemListElement": [
              { "@type": "ListItem", "position": 1, "name": "Acasă", "item": window.location.origin },
              { "@type": "ListItem", "position": 2, "name": "Magazin", "item": `${window.location.origin}/shop` },
              { "@type": "ListItem", "position": 3, "name": produs.nume, "item": window.location.href }
            ]
          })
        }}></script>

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
      </Helmet>

      <div className="marquee-container">
        <div className="marquee-text">
          <span>🔴 TRANSPORT GRATUIT PENTRU COMENZI PESTE 200 LEI 🔴 LIVRARE RAPIDĂ ÎN 24H 🔴 RETUR GARANTAT ÎN 14 ZILE 🔴 STOC LIMITAT 🔴</span>
        </div>
      </div>

      <div className="container">
        <nav className="merkado-breadcrumbs" aria-label="breadcrumb">
          <Link to="/">Acasă</Link>
          <span className="bc-separator">/</span>
          <Link to="/shop">Magazin</Link>
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
            {imaginiProdus.length > 1 ? (
              <div className="product-carousel-wrapper">
                
                <div className="product-carousel-main">
                  <button 
                    className="carousel-nav prev" 
                    onClick={() => setCurrentImageIndex(prev => prev === 0 ? imaginiProdus.length - 1 : prev - 1)}
                  >
                    &#10094;
                  </button>
                  
                  <img 
                    src={imaginiProdus[currentImageIndex]} 
                    alt={`${produs.nume} - Imaginea ${currentImageIndex + 1}`} 
                    className="carousel-main-img" 
                  />
                  
                  <button 
                    className="carousel-nav next" 
                    onClick={() => setCurrentImageIndex(prev => prev === imaginiProdus.length - 1 ? 0 : prev + 1)}
                  >
                    &#10095;
                  </button>
                </div>

                <div className="carousel-thumbnails">
                  {imaginiProdus.map((img, idx) => (
                    <div 
                      key={idx} 
                      className={`carousel-thumb-box ${currentImageIndex === idx ? 'active' : ''}`} 
                      onClick={() => setCurrentImageIndex(idx)}
                    >
                      <img src={img} alt={`Thumbnail ${idx + 1}`} />
                    </div>
                  ))}
                </div>

              </div>
            ) : (
              <img src={imaginiProdus[0] || produs.imaginePrincipala} alt={`Imagine produs ${produs.nume}`} className="main-prod-img" />
            )}
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
              {produs.heroBeneficii && produs.heroBeneficii[0] ? (
                produs.heroBeneficii.map((beneficiu, index) => (
                  beneficiu && <p key={index}>✨ {beneficiu}</p>
                ))
              ) : (
                <>
                  <p>✨ Soluție premium cu efect garantat</p>
                  <p>💪 Ușor de folosit, acasă la tine</p>
                  <p>⏳ Rezultate vizibile și de lungă durată</p>
                </>
              )}
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

{/* RECENZIA DE SUB BUTON (Apare doar dacă ai setat-o în Admin) */}
            {produs.heroRecenzie && produs.heroRecenzie.nume && (
              <div className="hero-mini-review" style={{ background: '#f8fafc', padding: '15px', borderRadius: '12px', border: '1px solid #e2e8f0', marginBottom: '25px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  {produs.heroRecenzie.imagine ? (
                    <img src={produs.heroRecenzie.imagine} alt="Client" style={{ width: '40px', height: '40px', borderRadius: '50%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: '#cbd5e1', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}><FiStar /></div>
                  )}
                  <div>
                    <div style={{ fontWeight: 'bold', fontSize: '0.95rem', color: '#0f172a' }}>{produs.heroRecenzie.nume}</div>
                    <div className="stars" style={{ fontSize: '0.8rem' }}>{renderStele(produs.heroRecenzie.rating)}</div>
                  </div>
                </div>
                <p style={{ fontSize: '0.9rem', color: '#475569', margin: 0, fontStyle: 'italic' }}>"{produs.heroRecenzie.text}"</p>
              </div>
            )}

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

           {produs.imagineFacebook && (
              <div className="facebook-proof-section" ref={fbSectionRef}>
                <p className="fb-proof-title"><FiThumbsUp style={{ color: '#1877F2', marginRight: '5px' }} /> Ce spun clienții pe Facebook:</p>
                <div className="fb-image-placeholder">
                  <img src={produs.imagineFacebook} alt={`Păreri clienți Facebook despre ${produs.nume}`} style={{ width: '100%', height: 'auto', display: 'block' }} />
                </div>
              </div>
            )}
          </div>
        </div>

       <div className="dynamic-content">
          {sectiuniActive.map((sec, idx) => (
            <div key={idx} className="builder-section">
              
              {/* 1. MODUL: TEXT ȘI IMAGINE */}
              {sec.tip === 'text_imagine' && (
                <div className={`info-block aliniere-${sec.aliniere || 'stanga'}`}>
                  {sec.titlu && <h2>{sec.titlu}</h2>}
                  <div className="info-content-flex">
                    {sec.text && <p>{sec.text}</p>}
                    {sec.imagineUrl && <img src={sec.imagineUrl} alt={sec.titlu} className="info-img" />}
                  </div>
                </div>
              )}

              {/* 2. MODUL: TABEL COMPARATIV DINAMIC */}
              {sec.tip === 'tabel_comparativ' && (
                <div className="comparison-block dynamic-table-sec">
                  <h2 className="comparatie-text" style={{ color: '#ffffff', marginBottom: '20px' }}>
                    {sec.titlu || "De ce să alegi produsul nostru"}
                  </h2>
                  <table className="comp-table">
                    <thead>
                      <tr>
                        <th style={{ color: '#000' }}>Caracteristici</th>
                        <th style={{ color: '#000' }}>NOI</th>
                        <th style={{ color: '#000' }}>ALȚII</th>
                      </tr>
                    </thead>
                    <tbody>
                      {sec.randuri?.map((r, ri) => (
                        <tr key={ri}>
                          <td className="comparatie-text">{r.text}</td>
                          <td>{r.noi ? <FiCheck className="c-green" /> : <FiX style={{ color: '#ff4d4d' }} />}</td>
                          <td>{r.altii ? <FiCheck className="c-green" /> : <FiX style={{ color: '#ff4d4d' }} />}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {/* 3. MODUL: BENEFICII CU PROCENTE (CERCURI) */}
              {sec.tip === 'beneficii_procente' && (
                <div className="procente-container dynamic-procente-sec">
                  {sec.titlu && <h2 style={{ textAlign: 'center', marginBottom: '30px' }}>{sec.titlu}</h2>}
                  <div className="procente-flex-grid">
                    {sec.puncte?.map((p, pi) => (
                      <div key={pi} className="procent-circle-item">
                        <div className="circle-wrap">
                          <svg viewBox="0 0 36 36" className="circular-chart">
                            <path className="circle-bg" d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <path className="circle" strokeDasharray={`${p.val}, 100`} d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" />
                            <text x="18" y="20.35" className="percentage">{p.val}%</text>
                          </svg>
                        </div>
                        <p className="procent-desc">{p.desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 4. MODUL: VIDEO YOUTUBE */}
              {sec.tip === 'video_promo' && sec.videoUrl && (
                <div className="video-section-wrapper">
                  {sec.titlu && <h2 style={{ textAlign: 'center', marginBottom: '20px' }}>{sec.titlu}</h2>}
                  <div className="video-responsive-container">
                    <iframe 
                      src={`https://www.youtube.com/embed/${sec.videoUrl.split('v=')[1]?.split('&')[0] || sec.videoUrl.split('/').pop()}`}
                      title="Product Video"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    ></iframe>
                  </div>
                </div>
              )}

            </div>
          ))}
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
              
<div className="stele-interactive-container">
  {[1, 2, 3, 4, 5].map((starIndex) => {
    const isActive = starIndex <= (hoverRating || formRecenzie.rating);
    return (
      <span
        key={starIndex}
        className={`stea-item ${isActive ? 'activa' : ''}`}
        onClick={() => setFormRecenzie({ ...formRecenzie, rating: starIndex })}
        onMouseEnter={() => setHoverRating(starIndex)}
        onMouseLeave={() => setHoverRating(0)}
      >
        ★
      </span>
    );
  })}
</div>

{formRecenzie.rating === 0 && <p style={{textAlign: 'center', fontSize: '0.85rem', color: '#64748b', marginTop: '-15px', marginBottom: '15px'}}>Alege numărul de stele</p>}

              <input 
                type="text" 
                placeholder="Numele tău" 
                value={formRecenzie.numeClient} 
                onChange={e => setFormRecenzie({ ...formRecenzie, numeClient: e.target.value })} 
                required 
              />
              <textarea 
                placeholder="Scrie recenzia ta aici..." 
                rows="3" 
                value={formRecenzie.text} 
                onChange={e => setFormRecenzie({ ...formRecenzie, text: e.target.value })} 
                required
              ></textarea>
              <button type="submit" className="btn-red">Trimite Recenzia</button>
            </form>
          </div>
        </div>

      </div>

      {produseSimilare.length > 0 && (
        <section className="related-products-section" style={{ padding: '40px 20px', background: '#f8fafc', borderTop: '1px solid #e2e8f0' }}>
          <div className="container">
            <h2 style={{ textAlign: 'center', marginBottom: '30px', fontSize: '1.8rem', color: '#0f172a' }}>
              Clienții au mai cumpărat
            </h2>
            <div className="shop-products-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '20px' }}>
              {produseSimilare.map(sim => (
                <div 
                  key={sim._id} 
                  className="shop-card"
                  onClick={() => {
                    window.scrollTo(0,0);
                    navigate(`/produs/${sim.slug || sim._id}`);
                  }}
                  style={{ cursor: 'pointer', background: 'white', borderRadius: '12px', padding: '15px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}
                >
                  <img src={sim.imaginePrincipala} alt={sim.nume} style={{ width: '100%', height: '200px', objectFit: 'cover', borderRadius: '8px' }} loading="lazy" />
                  <h3 style={{ fontSize: '1rem', marginTop: '15px', color: '#1e293b' }}>{sim.nume}</h3>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
                    <span style={{ fontWeight: 'bold', color: '#0f172a' }}>{sim.pret} Lei</span>
                    <FiArrowRight style={{ color: '#3b82f6' }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

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
                        <input type="tel" className={`checkout-input ${errors.telefon ? 'input-error' : ''}`} placeholder="Telefon" value={dateClient.telefon} onBlur={salveazaDraft} onChange={e => { setDateClient({ ...dateClient, telefon: e.target.value }); setErrors({ ...errors, telefon: null }); }} />
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
                      </div>


                      {/* JUDEȚUL ȘI LOCALITATEA  */}
                      <div className="input-row" style={{ marginTop: '15px' }}>
                        <div className="input-group-wrapper" style={{ flex: 1 }}>
                          <select 
                            className={`checkout-input ${errors.judet ? 'input-error' : ''}`} 
                            value={dateClient.judet} 
                            onChange={e => { 
                              setDateClient({ ...dateClient, judet: e.target.value, localitate: '' }); 
                              setErrors({ ...errors, judet: null, localitate: null }); 
                              setLockereDisponibile([]);
                              setLockerSelectat(null);
                            }}>
                            <option value="">Alege Județul...</option>
                            {listaJudete.map(judet => <option key={judet} value={judet}>{judet}</option>)}
                          </select>
                          {errors.judet && <span className="error-text">{errors.judet}</span>}
                        </div>
                       {/* 🔥 SEARCH BAR PENTRU LOCALITATE 🔥 */}
<div className="input-group-wrapper custom-searchable-select" style={{ flex: 1, position: 'relative' }}>
  <input 
    type="text" 
    className={`checkout-input ${errors.localitate ? 'input-error' : ''}`} 
    placeholder={dateClient.judet ? "Caută și alege orașul..." : "Alege Județul mai întâi"}
    value={dropdownLocalitateDeschis ? cautareLocalitate : dateClient.localitate}
    onChange={e => {
      setCautareLocalitate(e.target.value);
      setDropdownLocalitateDeschis(true);
    }}
    onFocus={() => {
      if (dateClient.judet) { setDropdownLocalitateDeschis(true); setCautareLocalitate(''); }
    }}
    onBlur={() => { setTimeout(() => setDropdownLocalitateDeschis(false), 200); }}
    disabled={!dateClient.judet || listaLocalitatiFiltrate.length === 0}
    style={{ cursor: (!dateClient.judet || listaLocalitatiFiltrate.length === 0) ? 'not-allowed' : 'text' }}
  />
  
  {dropdownLocalitateDeschis && dateClient.judet && (
    <div className="custom-dropdown-list">
      {listaLocalitatiFiltrate
        .filter(loc => (loc.name || '').toLowerCase().includes(cautareLocalitate.toLowerCase()))
        .map((loc, idx) => (
          <div 
            key={idx} 
            className="custom-dropdown-item"
            onMouseDown={() => { 
              setDateClient({ ...dateClient, localitate: loc.name }); 
              setErrors({ ...errors, localitate: null }); 
              setLockereDisponibile([]); 
              setLockerSelectat(null);
              setCautareLocker('');
              setCautareLocalitate('');
              setDropdownLocalitateDeschis(false);
            }}
          >
            {loc.name}
          </div>
      ))}
      {listaLocalitatiFiltrate.filter(loc => (loc.name || '').toLowerCase().includes(cautareLocalitate.toLowerCase())).length === 0 && (
        <div className="custom-dropdown-item" style={{ color: '#64748b' }}>Niciun oraș găsit...</div>
      )}
    </div>
  )}
  {errors.localitate && <span className="error-text">{errors.localitate}</span>}
</div>
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
                              <FiBox className="toggle-icon" /> <span>Locker / Box</span>
                            </div>
                            <span style={{ fontSize: '0.9rem', fontWeight: '800', marginTop: '4px', color: tipLivrare === 'locker' ? '#3b82f6' : '#64748b' }}>
                              {pretLocker} Lei
                            </span>
                          </div>
                        )}
                      </div>

                      {/* ZONA SPECIFICĂ DE CURIER */}
                      {tipLivrare === 'curier' ? (
                        <div className="fade-in">
                          <div className="input-group-wrapper">
                            <input type="text" className={`checkout-input ${errors.adresa ? 'input-error' : ''}`} placeholder="Adresă completă (Strada, Nr, Bloc)" value={dateClient.adresa} onChange={e => { setDateClient({ ...dateClient, adresa: e.target.value }); setErrors({ ...errors, adresa: null }); }} />
                            {errors.adresa && <span className="error-text">{errors.adresa}</span>}
                          </div>
                        </div>
                      ) : (
                      
                      /* ZONA SPECIFICĂ DE LOCKER */
                        <div className="fade-in" style={{ marginTop: '10px' }}>
                          <button type="button" className={`btn-select-locker ${errors.locker ? 'input-error' : ''}`} onClick={cautaLockereInZona}>
                            {loadingLockers ? "⏳ Se caută lockere..." : "📍 Caută Lockere în Orașul Meu"}
                          </button>
                          {errors.locker && <span className="error-text" style={{ display: 'block', marginTop: '5px' }}>{errors.locker}</span>}
                          {eroareLockere && <div style={{ color: '#ef4444', fontSize: '0.9rem', marginTop: '10px' }}>❌ {eroareLockere}</div>}

                          {/* AFIȘAREA LISTEI DE LOCKERE */}
                          {/* AFIȘAREA LISTEI DE LOCKERE CU SEARCH */}
{lockereDisponibile.length > 0 && (
  <div style={{ marginTop: '15px', border: '1px solid #cbd5e1', borderRadius: '8px', padding: '10px', background: '#f8fafc' }}>
    
    {/* 🔥 SEARCH BAR PENTRU FANBOX 🔥 */}
    <div className="search-box-locker">
      <FiSearch />
      <input 
        type="text" 
        placeholder="Caută după adresă sau nume locker..." 
        value={cautareLocker}
        onChange={e => setCautareLocker(e.target.value)}
      />
    </div>

    <div style={{ maxHeight: '250px', overflowY: 'auto' }}>
      {lockereDisponibile
        .filter(l => (l.name || '').toLowerCase().includes(cautareLocker.toLowerCase()) || (l.address || '').toLowerCase().includes(cautareLocker.toLowerCase()))
        .map(locker => (
        <div 
          key={locker.id} 
          onClick={() => {
            setLockerSelectat({ id: locker.id, name: locker.name, address: locker.address, city: locker.locality_name, county: locker.county_name });
            setErrors({ ...errors, locker: null });
          }}
          style={{
            padding: '12px', borderBottom: '1px solid #e2e8f0', cursor: 'pointer', borderRadius: '6px',
            backgroundColor: lockerSelectat?.id === locker.id ? '#f0fdf4' : '#fff',
            border: lockerSelectat?.id === locker.id ? '2px solid #22c55e' : '2px solid transparent',
            marginBottom: '5px'
          }}
        >
          <div style={{ fontWeight: 'bold', color: '#0f172a', display: 'flex', justifyContent: 'space-between' }}>
            <span>{locker.name}</span>
            {lockerSelectat?.id === locker.id && <span style={{ color: '#22c55e' }}>✅</span>}
          </div>
          <div style={{ fontSize: '0.85rem', color: '#64748b', marginTop: '4px' }}>{locker.address}</div>
        </div>
      ))}
    </div>
  </div>
)}
                        </div>
                      )}
                    </div>

                    <div className="checkout-section" style={{ marginTop: '30px' }}>
  <h5 className="section-title">2. Alege Oferta</h5>
  
  <div className="offers-grid">
    {produs.oferte && produs.oferte.length > 0 ? (
      produs.oferte.map((of, index) => (
        <div
          key={index}
          className={`premium-offer-card ${pachet.qty === Number(of.cantitate) ? 'active' : ''} ${index === 1 ? 'recommended' : ''}`}
          onClick={() => setPachet({ qty: Number(of.cantitate), pret: Number(of.pret), text: of.text })}
        >
          {/* BADGE PENTRU OFERTA 2 */}
          {index === 1 && <div className="premium-rec-badge">⭐ RECOMANDAT</div>}

          <div className="offer-content-wrapper">
            {/* CERCULEȚ SELECTARE */}
            <div className="offer-radio">
              <div className={`radio-inner ${pachet.qty === Number(of.cantitate) ? 'checked' : ''}`}></div>
            </div>

            {/* POZA PRODUSULUI */}
            <img src={produs.imaginePrincipala} alt="Pachet" className="offer-image" />

            {/* TEXT OFERTĂ */}
            <div className="offer-details">
              <span className="offer-title">{of.cantitate} {Number(of.cantitate) === 1 ? 'Bucată' : 'Bucăți'}</span>
              <span className="offer-subtitle">{of.text}</span>
            </div>

            {/* PREȚ */}
            <div className="offer-price-zone">
              <span className="offer-price">{of.pret} Lei</span>
            </div>
          </div>
        </div>
      ))
    ) : (
      <div className={`premium-offer-card active`} onClick={() => setPachet({ qty: 1, pret: produs.pret })}>
        <div className="offer-content-wrapper">
          <div className="offer-radio">
            <div className="radio-inner checked"></div>
          </div>
          <img src={produs.imaginePrincipala} alt="Pachet" className="offer-image" />
          <div className="offer-details">
            <span className="offer-title">1 Bucată</span>
            <span className="offer-subtitle">Pachet Standard</span>
          </div>
          <div className="offer-price-zone">
            <span className="offer-price">{produs.pret} Lei</span>
          </div>
        </div>
      </div>
    )}
  </div>
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

      {/* 🛎️ RENDER NOTIFICĂRI SMART AICI JOS DE TOT */}
      {toast && (
        <div className={`smart-toast ${toast.tip}`} style={{
          position: 'fixed', bottom: '20px', right: '20px', padding: '15px 25px',
          borderRadius: '10px', color: 'white', display: 'flex', alignItems: 'center', gap: '10px',
          boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', zIndex: 999999,
          background: toast.tip === 'success' ? '#10b981' : '#ef4444'
        }}>
          {toast.tip === 'success' ? <FiCheckCircle /> : <FiAlertCircle />}
          <span style={{ fontWeight: 'bold' }}>{toast.mesaj}</span>
        </div>
      )}

    </div>
  );
};

export default ProductPage;