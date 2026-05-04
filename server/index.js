// ============================================================================
// === 1. IMPORTURI GLOBALE (Toate pachetele și modulele necesare) ===
// ============================================================================
const express = require('express');
const http = require('http');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const rateLimit = require('express-rate-limit'); 
const nodemailer = require('nodemailer');
const { Resend } = require('resend');
const jwt = require('jsonwebtoken');
const { Server } = require('socket.io');
const moment = require('moment-timezone');
require('dotenv').config();

// Servicii Externe
const stripe = require('stripe')(process.env.STRIPE_SECRET);

// Importuri interne (Rute, Middleware, Modele aduse din alte fișiere)
const authRoute = require('./routes/auth');
const contactRoute = require('./routes/contact');
const { protect } = require('./middleware/auth'); 
const User = require('./models/User'); 

// ============================================================================
// === 2. INIȚIALIZARE APLICAȚIE ȘI SERVER ===
// ============================================================================
const app = express();
app.disable('x-powered-by');
const server = http.createServer(app);

// ============================================================================
// === 3. CONFIGURARE SERVICII (Email, Telegram) ===
// ============================================================================
// ✉️ Robotul Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// ✉️ Configurare Nodemailer (Fallback)
const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,         
  secure: false,     
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  },
  tls: {
    rejectUnauthorized: false
  }
});

// ============================================================================
// === 4. MIDDLEWARES GLOBALE (Securitate și Curățenie) ===
// ============================================================================
// 🛡️ Buncărul Anti-Hackeri
app.use(helmet()); 
app.use(helmet.crossOriginResourcePolicy({ policy: "cross-origin" })); 

app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://localhost:5173', 
    'https://merkado.ro',     
    'https://www.merkado.ro'
  ],
  credentials: true
}));

app.use(express.json({ limit: '5mb' })); 
app.use(express.urlencoded({ limit: '5mb', extended: true }));
app.use(hpp());

// 🧼 Filtre de curățenie pentru formulare
app.use((req, res, next) => {
  if (req.body) req.body = mongoSanitize.sanitize(req.body);
  if (req.params) req.params = mongoSanitize.sanitize(req.params);
  next();
});

// ============================================================================
// === 5. LIMITATOARE DE TRAFIC (Rate Limiting) ===
// ============================================================================
const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 5, 
  message: { eroare: "Prea multe încercări eșuate! IP-ul tău a fost blocat pentru 15 minute. 🚨" },
  standardHeaders: true, 
  legacyHeaders: false, 
});

const publicLimiter = rateLimit({
  windowMs: 10 * 60 * 1000, 
  max: 1000,
  message: { eroare: "Te rugăm să iei o pauză. Prea multe cereri!" },
  standardHeaders: true, 
  legacyHeaders: false, 
});

// ============================================================================
// === 6. CONEXIUNE BAZA DE DATE (MongoDB) ===
// ============================================================================
const MONGO_URI = process.env.MONGO_URI;
mongoose.connect(MONGO_URI)
  .then(() => console.log("✅ Conectat la Baza de Date (Super Produse)"))
  .catch((err) => console.error("❌ Eroare la conectare MongoDB:", err));

// ============================================================================
// === 7. MODELE MONGOOSE (Structura Bazei de Date) ===
// ============================================================================
const produsSchema = new mongoose.Schema({
  nume: String,
  slug: { type: String },
  pret: Number,
  pretVechi: Number,
  imaginePrincipala: String,
  heroBeneficii: [String], 
  heroRecenzie: { nume: String, text: String, rating: Number, imagine: String },
  imagineFacebook: String,
  stocFictiv: { type: Number, default: 5 },
  vizitatoriLiveMin: { type: Number, default: 10 },
  vizitatoriLiveMax: { type: Number, default: 25 },
  minuteCountdown: { type: Number, default: 15 },
  oferte: [{ cantitate: Number, pret: Number, text: String }], 
  sectiuniLanding: [mongoose.Schema.Types.Mixed] 
}, { timestamps: true });
const Produs = mongoose.model('Produs', produsSchema);

const comandaSchema = new mongoose.Schema({
  produsId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produs', required: true },
  numeProdus: String,
  numeClient: { type: String, required: true }, 
  email: String, 
  telefon: { type: String, required: true }, 
  adresa: { type: String, required: true }, 
  localitate: String,
  judet: String,
  total: { type: Number, required: true }, 
  metodaPlata: { type: String, default: 'Ramburs' },
  paymentId: String, 
  tipLivrare: String,
  samedayLockerId: String,
  cantitate: { type: Number, default: 1 }, 
  extraOptions: mongoose.Schema.Types.Mixed,
  status: { type: String, default: 'Nouă' }
}, { timestamps: true });
const Comanda = mongoose.model('Comanda', comandaSchema);

const recenzieSchema = new mongoose.Schema({
  produsId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produs', required: true },
  numeClient: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  text: { type: String, required: true, maxlength: [1000, "Recenzia este prea lungă!"] },
  imagineUrl: { type: String }, 
  status: { type: String, default: 'in_asteptare' } 
}, { timestamps: true });
const Recenzie = mongoose.model('Recenzie', recenzieSchema);

const cosAbandonatSchema = new mongoose.Schema({
  telefon: { type: String, required: true, unique: true }, 
  numeClient: String,
  total: Number,
  status: { type: String, default: 'Deschis' }
}, { timestamps: true });
const CosAbandonat = mongoose.model('CosAbandonat', cosAbandonatSchema);

const transportSchema = new mongoose.Schema({
  nume: { type: String, required: true },
  pret: { type: Number, required: true },
  activ: { type: Boolean, default: true },
  tip: { type: String, enum: ['curier', 'locker'], default: 'curier' }
});
const MetodaTransport = mongoose.model('MetodaTransport', transportSchema);

const contactSchema = new mongoose.Schema({
  nume: String,
  email: String,
  telefon: String,
  subiect: String,
  mesaj: String,
  status: { type: String, default: 'Nou' }
}, { timestamps: true });
const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

const vizitaSchema = new mongoose.Schema({
  data: { type: Date, default: Date.now }
});
const VizitaSite = mongoose.model('VizitaSite', vizitaSchema);

// ============================================================================
// === 8. FUNCȚII AJUTĂTOARE (Email, Telegram, Stripe) ===
// ============================================================================
const trimiteEmail = async (to, subject, htmlContent) => {
  if (!to || !to.includes('@')) return;
  try {
    const { data, error } = await resend.emails.send({
      from: 'Merkado <comenzi@merkado.ro>',
      to: [to],
      subject: subject,
      html: htmlContent,
    });

    if (error) {
       return console.error("❌ Eroare Resend:", error);
    }
    console.log(`✅ Email trimis prin Resend către: ${to}`);
  } catch (error) {
    console.error(`❌ Eroare conexiune Resend către ${to}:`, error);
  }
};

// ==========================================
// 📦 1. FUNCȚIE TRIMITERE AUTOMATĂ ÎN EAWB (Cu Suport Locker & Token ENV)
// ==========================================
const trimiteInEawb = async (comanda) => {
  try {
    const isPlataCard = comanda.metodaPlata && comanda.metodaPlata.toLowerCase().includes('card');
    const rambursDeIncasat = isPlataCard ? 0 : (Number(comanda.total) || 0);
    const isLocker = comanda.tipLivrare === 'locker';

    // 🏗️ Construim destinația în funcție de ce a ales clientul
    const adresaDestinatie = {
      email: comanda.email || "no-reply@client.ro",
      phone: comanda.telefon || "0000000000",
      contact: comanda.numeClient || "Client",
      country_code: "RO"
    };

    if (isLocker) {
      adresaDestinatie.fixed_location_id = parseInt(comanda.samedayLockerId) || 0; 
    } else {
      adresaDestinatie.postal_code = "000000";
      adresaDestinatie.locality_name = comanda.localitate || "Bucuresti";
      adresaDestinatie.county_name = comanda.judet || "Bucuresti";
      adresaDestinatie.street_name = comanda.adresa || "-";
      adresaDestinatie.street_number = "-";
    }

    const payloadEAWB = {
      carrier_id: 1, 
      service_id: isLocker ? 1 : 1, 
      billing_to: {
        billing_address_id: 279010 
      },
      address_from: {
        email: "contact@merkado.ro", 
        phone: "0700000000",       
        contact: "Merkado", 
        country_code: "RO",
        locality_id: 10241, 
        street_name: "Strada ta",
        street_number: "1"
      },
      address_to: adresaDestinatie, 
      content: {
        envelopes_count: 0,
        pallets_count: 0,
        parcels_count: 1,
        total_weight: 1,
        parcels: [
          { sequence_no: 1, size: { weight: 1, width: 20, height: 20, length: 20 } }
        ]
      },
      extra: {
        parcel_content: comanda.numeProdus || "Produse",
        sms_recipient: true
      }
    };

    if (rambursDeIncasat > 0) {
      payloadEAWB.extra.bank_repayment_amount = rambursDeIncasat;
      payloadEAWB.extra.bank_repayment_currency = "RON";
    }

    const urlEawb = 'https://api.europarcel.com/api/public/orders'; 

    const raspuns = await fetch(urlEawb, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        // 🔥 CHEIA E ACUM LUATĂ DIN ENVIRONMENT VARIABLES!
        'X-API-Key': process.env.EUROPARCEL_API_KEY 
      },
      body: JSON.stringify(payloadEAWB)
    });

    const rezultat = await raspuns.json();

    if (raspuns.ok) {
      console.log(`🚀 AWB Generat Automat [${isLocker ? 'LOCKER' : 'CURIER'}] pentru: ${comanda.numeClient}`);
    } else {
      console.error(`❌ Eroare eAWB Automat (${isLocker ? 'Locker' : 'Curier'}):`, rezultat);
    }
  } catch (eroare) {
    console.error("❌ Eroare conexiune eAWB:", eroare.message);
  }
};

const trimiteTelegram = async (mesaj) => {
  const token = process.env.TELEGRAM_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  
  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: mesaj,
        parse_mode: 'HTML'
      })
    });
    console.log("🚀 Notificare Telegram trimisă!");
  } catch (error) {
    console.error("❌ Eroare Telegram:", error.message);
  }
};

const genereazaEmailSuperProduse = (titlu, statusMesaj, comanda, imagineUrl = null) => {
  const dataComanda = new Date(comanda.createdAt || Date.now()).toLocaleDateString('ro-RO');
  const htmlImagine = imagineUrl 
    ? `<div style="text-align: center; margin-bottom: 20px;"><img src="${imagineUrl}" alt="${comanda.numeProdus}" style="max-width: 180px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);"></div>` 
    : '';

  return `
    <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 550px; margin: 0 auto; border: 1px solid #eee;">
      <div style="background: #1a1a1a; color: #fff; padding: 25px; text-align: center;">
        <h1 style="margin: 0; font-size: 22px; letter-spacing: 2px;">MERKADO</h1>
        <p style="margin: 5px 0 0; opacity: 0.8; font-size: 14px;">Confirmați. Expediați. Livrați.</p>
      </div>
      <div style="padding: 25px;">
        <h2 style="color: #1a1a1a; font-size: 18px;">${titlu}</h2>
        <p style="font-size: 15px; color: #555;">Salut, <strong>${comanda.numeClient}</strong>! ${statusMesaj}</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
        ${htmlImagine}
        <table style="width: 100%; font-size: 14px;">
          <tr>
            <td style="padding-bottom: 10px;"><strong>Cod Comandă:</strong></td>
            <td style="text-align: right; padding-bottom: 10px;">#${comanda._id.toString().slice(-6).toUpperCase()}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px;"><strong>Data:</strong></td>
            <td style="text-align: right; padding-bottom: 10px;">${dataComanda}</td>
          </tr>
          <tr>
            <td style="padding-bottom: 10px;"><strong>Produs:</strong></td>
            <td style="text-align: right; padding-bottom: 10px;">${comanda.numeProdus} (x${comanda.cantitate || 1})</td>
          </tr>
          <tr>
            <td style="padding-top: 10px; border-top: 2px solid #1a1a1a;"><strong>TOTAL DE PLATĂ:</strong></td>
            <td style="text-align: right; padding-top: 10px; border-top: 2px solid #1a1a1a; font-size: 18px; color: #10b981;"><strong>${comanda.total} Lei</strong></td>
          </tr>
        </table>
        <div style="margin-top: 25px; padding: 15px; background: #f9f9f9; border-radius: 5px; font-size: 13px;">
          <h3 style="margin: 0 0 10px; font-size: 14px; text-transform: uppercase;">Informații Livrare & Plată</h3>
          <p style="margin: 3px 0;"><strong>Adresă:</strong> ${comanda.adresa}, ${comanda.localitate}, ${comanda.judet}</p>
          <p style="margin: 3px 0;"><strong>Metodă Plată:</strong> ${comanda.metodaPlata}</p>
          <p style="margin: 3px 0;"><strong>Telefon Client:</strong> ${comanda.telefon}</p>
        </div>
        <div style="text-align: center; margin-top: 30px;">
          <p style="font-size: 13px; color: #888;">Aveți nevoie de ajutor cu comanda?</p>
          <a href="tel:+40723717438" style="background: #1a1a1a; color: #fff; padding: 12px 25px; text-decoration: none; border-radius: 4px; font-weight: bold; display: inline-block;">SUNĂ SUPORT: 0723 717 438</a>
        </div>
      </div>
      <div style="background: #f4f4f4; padding: 15px; text-align: center; font-size: 11px; color: #999;">
        &copy; 2026 MERKADO. Toate drepturile rezervate.
      </div>
    </div>
  `;
};

async function calculeazaTotalSecurizat(produsId, qty, tipLivrare, extraOptions, metodaPlata) {
  const produs = await Produs.findById(produsId);
  if (!produs) throw new Error("Produs invalid!");

  let pretPachet = produs.pret; 
  if (produs.oferte && produs.oferte.length > 0) {
    const oferta = produs.oferte.find(o => Number(o.cantitate) === Number(qty));
    if (oferta) pretPachet = Number(oferta.pret);
  }

  const metodaTransp = await MetodaTransport.findOne({ tip: tipLivrare });
  const pretLivrare = metodaTransp ? Number(metodaTransp.pret) : 19; 
  const extraLivrare = extraOptions?.livrare ? Number(extraOptions.livrare) : 0;
  const subtotal = pretPachet + pretLivrare + extraLivrare;
  
  const reducereCard = metodaPlata === 'card' ? (subtotal * 0.05) : 0;

  return subtotal - reducereCard;
}

// ============================================================================
// === 9. MIDDLEWARE ADMIN (Paznic Rute) ===
// ============================================================================
const verifyAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.split(' ')[1];
    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.adminLogat) {
        req.user = decoded;
        return next();
      }
    } catch (err) {
      return res.status(403).json({ eroare: "Token invalid sau expirat. Te rog să te reloghezi!" });
    }
  }
  
  return res.status(401).json({ eroare: "Acces interzis! Nu ești autentificat ca admin." });
};

// ============================================================================
// === 10. RUTE API (Conectare Rute Externe) ===
// ============================================================================
app.use('/api/auth', authRoute);
app.use('/api/contact', contactRoute);

// ============================================================================
// === 11. RUTE PUBLICE (Clienți) ===
// ============================================================================

app.get('/api/produse', async (req, res) => {
  try { res.json(await Produs.find().sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.get('/api/produse/:idOrSlug', async (req, res) => {
  try {
    const { idOrSlug } = req.params;
    let produs;
    if (idOrSlug.match(/^[0-9a-fA-F]{24}$/)) {
      produs = await Produs.findById(idOrSlug); 
    } else {
      produs = await Produs.findOne({ slug: idOrSlug }); 
    }
    if (!produs) return res.status(404).json({ message: 'Produsul nu a fost găsit' });
    res.json(produs);
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.get('/api/transport', async (req, res) => {
  try {
    const metode = await MetodaTransport.find();
    res.json(metode);
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.get('/api/comenzi/track/:telefon', async (req, res) => {
  try {
    const comenzi = await Comanda.find({ telefon: req.params.telefon })
                                 .select('status createdAt total cantitate metodaPlata tipLivrare produsId') 
                                 .populate('produsId', 'nume imaginePrincipala')
                                 .sort({ createdAt: -1 });
    if (comenzi.length === 0) return res.status(404).json({ mesaj: "Nu am găsit nicio comandă." });
    res.json(comenzi);
  } catch (err) { res.status(500).json({ eroare: "Eroare la server." }); }
});

// ==========================================
// 🛒 RUTA CHECKOUT NOUĂ (CLIENTI)
// ==========================================
app.post('/api/comenzi/noua', publicLimiter, async (req, res) => {  
  try { 
    const d = req.body; 
    
    if (d.metodaPlata && d.metodaPlata.toLowerCase().includes('card')) {
      if (!d.paymentId) return res.status(400).json({ eroare: "Tentativă de fraudă: ID plată lipsă!" });
      const plataVerificata = await stripe.paymentIntents.retrieve(d.paymentId);
      if (plataVerificata.status !== 'succeeded') {
        return res.status(400).json({ eroare: "Plata nu a fost validată de bancă!" });
      }
    }

    const totalReal = await calculeazaTotalSecurizat(d.produsId, d.qty, d.tipLivrare, d.extraOptions, d.metodaPlata);
    const produsCumparat = await Produs.findById(d.produsId);

    const nouaComanda = new Comanda({
      ...d,
      total: totalReal,
      numeProdus: produsCumparat ? produsCumparat.nume : "Produs Magazin",
      status: 'Nouă'
    });
    await nouaComanda.save(); 

    await CosAbandonat.findOneAndDelete({ telefon: d.telefon });

    const textTelegram = `
🚀 <b>COMANDĂ NOUĂ!</b>
👤 <b>Client:</b> ${nouaComanda.numeClient}
📞 <b>Telefon:</b> ${nouaComanda.telefon}
🛒 <b>Produs:</b> ${nouaComanda.numeProdus} (x${nouaComanda.cantitate || 1})
💰 <b>Total:</b> ${nouaComanda.total} Lei
📍 <b>Oraș:</b> ${nouaComanda.localitate}, ${nouaComanda.judet}
💳 <b>Plată:</b> ${nouaComanda.metodaPlata}
<a href="https://merkado.ro/admin/dashboard">👉 Deschide Dashboard-ul</a>`;

    await trimiteTelegram(textTelegram);

    if (nouaComanda.email) {
      const msgEmail = `Comanda ta a fost preluată și urmează să fie pregătită pentru expediere.`;
      const htmlEmail = genereazaEmailSuperProduse("Confirmare Comandă 🎉", msgEmail, nouaComanda, produsCumparat?.imaginePrincipala);
      trimiteEmail(nouaComanda.email, "Comanda ta a fost înregistrată! 🚀", htmlEmail);
    }

    await trimiteInEawb(nouaComanda);

    res.status(201).json({ success: true, mesaj: "Comandă procesată cu succes!" });

  } catch (err) { 
    console.error("❌ Eroare critică la checkout:", err.message);
    res.status(400).json({ eroare: "Eroare la procesarea comenzii: " + err.message }); 
  }
});

app.post('/api/comenzi/abandonat', publicLimiter, async (req, res) => {  
  try {
    const { telefon, numeClient, total } = req.body;
    if (!telefon || telefon.length < 10) return res.status(400).json({eroare: "Telefon invalid"});
    await CosAbandonat.findOneAndUpdate(
      { telefon: telefon },
      { numeClient, total, status: 'Deschis', updatedAt: Date.now() },
      { upsert: true, returnDocument: 'after' }
    );
    res.json({ success: true });
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.post('/api/auth/create-payment-intent', async (req, res) => {
  try {
    const d = req.body; 
    const totalReal = await calculeazaTotalSecurizat(d.produsId, d.qty, d.tipLivrare, d.extraOptions, 'card');
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(totalReal * 100), 
      currency: 'ron',
      automatic_payment_methods: { enabled: true },
    });
    res.json({ clientSecret: paymentIntent.client_secret });
  } catch (error) {
    console.error("❌ Eroare internă Stripe:", error);
    res.status(500).json({ eroare: error.message });
  }
});

app.post('/api/recenzii', publicLimiter, async (req, res) => {
  try { await new Recenzie(req.body).save(); res.status(201).json({ mesaj: "Recenzie trimisă!" }); } 
  catch (err) { res.status(400).json({ eroare: err.message }); }
});

app.get('/api/recenzii/produs/:id', async (req, res) => {
  try { res.json(await Recenzie.find({ produsId: req.params.id, status: 'aprobata' }).sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ eroare: err.message }); }
});

// ============================================================================
// === 12. RUTE ADMIN (Autentificare & Gestiune Meniu/Produse/Comenzi) ===
// ============================================================================
app.post('/api/admin/login', loginLimiter, (req, res) => {
  const { email, parola } = req.body; 
  if (email === process.env.ADMIN_EMAIL && parola === process.env.ADMIN_PASSWORD) {
    const token = jwt.sign({ adminLogat: true }, process.env.JWT_SECRET, { expiresIn: '12h' });
    res.json({ 
      success: true, 
      token: token,
      user: { email: email, role: 'admin' }
    });
  } else {
    res.status(401).json({ eroare: "Email sau parolă incorectă!" });
  }
});


// ==========================================
// 📦 2. GENERARE MANUALĂ AWB DIN ADMIN (Cu Suport Locker & Token ENV)
// ==========================================
app.post('/api/admin/comenzi/:id/awb', verifyAdmin, async (req, res) => {
  try {
    const idComanda = req.params.id;
    const comanda = await Comanda.findById(idComanda);
    if (!comanda) return res.status(404).json({ eroare: "Comanda nu a fost găsită!" });

    if (comanda.awb && comanda.awb.trim() !== '') {
      return res.status(400).json({ eroare: `Această comandă are deja AWB-ul: ${comanda.awb}` });
    }

    const isPlataCard = comanda.metodaPlata && comanda.metodaPlata.toLowerCase().includes('card');
    const rambursDeIncasat = isPlataCard ? 0 : Number(comanda.total);
    const isLocker = comanda.tipLivrare === 'locker';

    const adresaDestinatie = {
      email: comanda.email || "no-reply@client.ro",
      phone: comanda.telefon || "0000000000",
      contact: comanda.numeClient || "Client",
      country_code: "RO"
    };

    if (isLocker) {
      adresaDestinatie.fixed_location_id = parseInt(comanda.samedayLockerId) || 0;
    } else {
      adresaDestinatie.postal_code = "000000";
      adresaDestinatie.locality_name = comanda.localitate || "Bucuresti";
      adresaDestinatie.county_name = comanda.judet || "Bucuresti";
      adresaDestinatie.street_name = comanda.adresa || "-";
      adresaDestinatie.street_number = "-";
    }

    const payloadEAWB = {
      carrier_id: 1, 
      service_id: isLocker ? 1 : 1, 
      billing_to: { billing_address_id: 279010 },
      address_from: {
        email: "contact@merkado.ro", 
        phone: "0700000000",       
        contact: "Merkado", 
        country_code: "RO",
        locality_id: 10241, 
        street_name: "Strada ta",
        street_number: "1"
      },
      address_to: adresaDestinatie,
      content: {
        envelopes_count: 0, pallets_count: 0, parcels_count: 1, total_weight: 1,
        parcels: [{ sequence_no: 1, size: { weight: 1, width: 20, height: 20, length: 20 } }]
      },
      extra: { parcel_content: comanda.numeProdus || "Produse", sms_recipient: true }
    };

    if (rambursDeIncasat > 0) {
      payloadEAWB.extra.bank_repayment_amount = rambursDeIncasat;
      payloadEAWB.extra.bank_repayment_currency = "RON";
    }

    const urlEawb = 'https://api.europarcel.com/api/public/orders';
    
    const raspunsEawb = await fetch(urlEawb, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        // 🔥 CHEIA E ACUM LUATĂ DIN ENVIRONMENT VARIABLES!
        'X-API-Key': process.env.EUROPARCEL_API_KEY
      },
      body: JSON.stringify(payloadEAWB)
    });

    const textRaspuns = await raspunsEawb.text(); 
    let dateAwb;
    try { dateAwb = JSON.parse(textRaspuns); } 
    catch (e) { return res.status(500).json({ eroare: "Eroare HTML la Europarcel." }); }

    if (!raspunsEawb.ok) {
      console.error("❌ Europarcel a respins cererea:", dateAwb);
      const motiv = dateAwb.errors ? JSON.stringify(dateAwb.errors) : dateAwb.message;
      return res.status(400).json({ eroare: "Refuzat: " + motiv });
    }

    const numarAWBGenerat = dateAwb.data?.awb_number || "AWB_GENERAT"; 
    comanda.awb = numarAWBGenerat;
    comanda.status = 'Expediată'; 
    await comanda.save();

    res.json({ success: true, awb: numarAWBGenerat, mesaj: "AWB Generat cu succes!" });

  } catch (err) {
    console.error("❌ Eroare server fatală la AWB:", err);
    res.status(500).json({ eroare: err.message });
  }
});

app.get('/api/dashboard', verifyAdmin, async (req, res) => {
  try {
    const { range } = req.query;
    const tz = 'Europe/Bucharest'; 
    let dataStart, dataEnd;

    if (range === 'today') {
      dataStart = moment.tz(tz).startOf('day').toDate();
      dataEnd = moment.tz(tz).endOf('day').toDate();
    } else if (range === 'yesterday') {
      dataStart = moment.tz(tz).subtract(1, 'days').startOf('day').toDate();
      dataEnd = moment.tz(tz).subtract(1, 'days').endOf('day').toDate();
    } else if (range === 'last7') {
      dataStart = moment.tz(tz).subtract(6, 'days').startOf('day').toDate(); 
      dataEnd = moment.tz(tz).endOf('day').toDate();
    } else { 
      dataStart = moment.tz(tz).subtract(29, 'days').startOf('day').toDate();
      dataEnd = moment.tz(tz).endOf('day').toDate();
    }

    const queryData = { $gte: dataStart, $lte: dataEnd };

    const comenziPerioada = await Comanda.find({ createdAt: queryData }).sort({ createdAt: -1 });
    const comenziValide = comenziPerioada.filter(c => c.status !== 'Anulată');
    const totalVanzari = comenziValide.reduce((acc, c) => acc + (c.total || 0), 0);
    const platiAsteptare = comenziValide
      .filter(c => c.metodaPlata && c.metodaPlata.toLowerCase().includes('card'))
      .reduce((acc, c) => acc + (c.total || 0), 0);

    const cosuriAbandonate = await CosAbandonat.find({ updatedAt: queryData }).sort({ updatedAt: -1 });
    const viziteReale = await VizitaSite.countDocuments({ data: queryData });

    const vanzariPeZile = await Comanda.aggregate([
      { $match: { createdAt: queryData, status: { $ne: 'Anulată' } } },
      { $group: { _id: { $dateToString: { format: "%d-%m-%Y", date: "$createdAt" } }, total: { $sum: "$total" } } },
      { $sort: { "_id": 1 } }
    ]);

    const produseTop = await Comanda.aggregate([
      { $match: { createdAt: queryData, status: { $ne: 'Anulată' } } },
      { $group: { _id: "$numeProdus", vanzari: { $sum: "$cantitate" }, venit: { $sum: "$total" } } },
      { $sort: { venit: -1 } }, { $limit: 5 }
    ]);

    res.json({
      stats: {
        incasari: totalVanzari,
        incasariProcent: 0,
        comenzi: comenziValide.length, 
        cosuriDeschise: cosuriAbandonate.length,
        cosuriDeschiseProcent: 0,
        platiInAsteptare: platiAsteptare,
        viziteTotale: viziteReale 
      },
      comenziRecente: comenziPerioada.slice(0, 15), 
      cosuriAbandonate: cosuriAbandonate,
      produseTop: produseTop.map(p => ({ nume: p._id || 'Produs', vanzari: p.vanzari, venit: p.venit })),
      dateGrafic: vanzariPeZile.map(d => ({ data: d._id, vanzari: d.total }))
    });
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.post('/api/produse', verifyAdmin, async (req, res) => {
  try {
    const dateProdus = req.body;
    if (dateProdus.nume) {
      dateProdus.slug = dateProdus.nume
        .toLowerCase()
        .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const produsNou = new Produs(dateProdus);
    await produsNou.save();
    console.log(`✅ Produs publicat cu succes: ${produsNou.nume}`);
    res.status(201).json(produsNou);
  } catch (err) {
    console.error("❌ Eroare la publicare produs:", err.message);
    res.status(500).json({ eroare: "Nu am putut publica produsul: " + err.message });
  }
});

app.put('/api/produse/:id', verifyAdmin, async (req, res) => {  
  try {
    const { _id, __v, ...dateDeActualizat } = req.body; 

    if (dateDeActualizat.nume) {
      dateDeActualizat.slug = dateDeActualizat.nume
        .toLowerCase()
        .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const produsActualizat = await Produs.findByIdAndUpdate(
      req.params.id, 
      { $set: dateDeActualizat }, 
      { new: true, runValidators: true } 
    );

    if (!produsActualizat) {
      return res.status(404).json({ eroare: "Produsul nu a fost găsit în baza de date." });
    }

    console.log(`✅ Produs modificat: ${produsActualizat.nume}`);
    res.json(produsActualizat);

  } catch (err) { 
    console.error("❌ Eroare la Editare:", err.message);
    res.status(500).json({ eroare: "Eroare server: " + err.message }); 
  }
});

app.delete('/api/produse/:id', verifyAdmin, async (req, res) => {
  try {
    const produsSters = await Produs.findByIdAndDelete(req.params.id);
    if (!produsSters) return res.status(404).json({ eroare: "Produsul nu a fost găsit." });
    console.log(`🗑️ Produs șters: ${produsSters.nume}`);
    res.json({ success: true, mesaj: "Produsul a fost eliminat definitiv!" });
  } catch (err) {
    res.status(500).json({ eroare: "Eroare la ștergere: " + err.message });
  }
});

app.post('/api/transport', verifyAdmin, async (req, res) => {
  try {
    const metodaNoua = new MetodaTransport(req.body);
    await metodaNoua.save();
    res.status(201).json(metodaNoua);
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.put('/api/transport/:id', verifyAdmin, async (req, res) => {
  try {
    const metodaActualizata = await MetodaTransport.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json(metodaActualizata);
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.post('/api/comenzi', verifyAdmin, async (req, res) => {
  try {
    const comandaNoua = new Comanda({
      ...req.body,
      produsId: req.body.produsId || new mongoose.Types.ObjectId(),
      numeProdus: req.body.numeProdus || "Comandă Manuală (Admin)",
      status: "Nouă",
      metodaPlata: req.body.metodaPlata || "Ramburs (Admin)",
      total: Number(req.body.total) || 0
    });
    await comandaNoua.save();
    res.json({ success: true, mesaj: "Comandă creată cu succes!" });
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.put('/api/comenzi/:id', verifyAdmin, async (req, res) => {
  try {
    const { _id, ...dateDeActualizat } = req.body; 
    const comandaActualizata = await Comanda.findByIdAndUpdate(req.params.id, { $set: dateDeActualizat }, { returnDocument: 'after' });
    res.json({ success: true, data: comandaActualizata });
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.patch('/api/comenzi/:id/status', verifyAdmin, async (req, res) => {
  try { 
    const comandaActualizata = await Comanda.findByIdAndUpdate(
      req.params.id, 
      { status: req.body.status }, 
      { new: true } 
    ).populate('produsId'); 

    if (!comandaActualizata) return res.status(404).json({ eroare: "Comanda nu a fost găsită" });

    const statusNou = req.body.status;
    const email = comandaActualizata.email;
    const imagineProdus = comandaActualizata.produsId ? comandaActualizata.produsId.imaginePrincipala : null;

    console.log(`[Admin] Se schimbă comanda ${comandaActualizata._id.toString().slice(-6)} în "${statusNou}". Email client: ${email || 'LIPSĂ'}`);

    if (!email || !email.includes('@')) {
      console.log('⚠️ Fără email valid. Se salvează doar statusul în baza de date.');
      return res.json(comandaActualizata); 
    }

    if (statusNou === 'Confirmată' || statusNou === 'Confirmata') {
      const msg = `Comanda ta a fost confirmată și este în curs de procesare.`;
      const html = genereazaEmailSuperProduse("Comandă Confirmată ✅", msg, comandaActualizata, imagineProdus);
      trimiteEmail(email, "Comanda ta a fost confirmată! ✅", html); 
    } else if (statusNou === 'Trimisă' || statusNou === 'Expediată') {
      const msg = `Pachetul tău a fost predat curierului.`;
      const html = genereazaEmailSuperProduse("Comandă Expediată! 🚚", msg, comandaActualizata, imagineProdus);
      trimiteEmail(email, "Vești bune! Comanda ta este pe drum 🚚", html);
    } else if (statusNou === 'Livrată' || statusNou === 'Livrata') {
      const msg = `Comanda ta a fost marcată ca livrată. Sperăm să te bucuri de produs! Nu ezita să ne lași o recenzie pe site dacă ești mulțumit de achiziție.`;
      const html = genereazaEmailSuperProduse("Comandă Livrată cu succes! 📦", msg, comandaActualizata, imagineProdus);
      await trimiteEmail(email, "Comanda ta a ajuns! 📦", html);
    } else if (statusNou === 'Anulată' || statusNou === 'Returnată' || statusNou === 'Anulata' || statusNou === 'Returnata') {
      const msg = `Acest mesaj este o notificare pentru a te anunța că statusul comenzii tale a fost modificat în <strong>${statusNou}</strong>. Dacă ai întrebări, te rugăm să ne contactezi telefonic.`;
      const html = genereazaEmailSuperProduse(`Comandă ${statusNou}`, msg, comandaActualizata, imagineProdus);
      await trimiteEmail(email, `Actualizare Comandă: ${statusNou}`, html);
    }

    res.json(comandaActualizata); 
  } 
  catch (err) { 
    console.error("❌ Eroare update status:", err);
    res.status(500).json({ eroare: err.message }); 
  }
});

app.delete('/api/comenzi/:id', verifyAdmin, async (req, res) => {
  try { await Comanda.findByIdAndDelete(req.params.id); res.json({ mesaj: "Comandă ștearsă!" }); } 
  catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.put('/api/comenzi/abandonat/:id', verifyAdmin, async (req, res) => {
  try {
    const draftActualizat = await CosAbandonat.findByIdAndUpdate(req.params.id, req.body, { returnDocument: 'after' });
    res.json({ success: true, data: draftActualizat });
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.post('/api/comenzi/convert-draft/:id', verifyAdmin, async (req, res) => {
  try {
    const draft = await CosAbandonat.findById(req.params.id);
    if (!draft) return res.status(404).json({ eroare: "Draftul nu mai există!" });

    const comandaNoua = new Comanda({
      numeClient: req.body.numeClient || draft.numeClient || "Client Recuperat",
      telefon: req.body.telefon || draft.telefon,
      adresa: req.body.adresa || "Adresă stabilită telefonic",
      localitate: req.body.localitate || "-",
      judet: req.body.judet || "-",
      total: Number(req.body.total) || Number(draft.total) || 0,
      produsId: req.body.produsId || draft.produsId || new mongoose.Types.ObjectId(), 
      numeProdus: req.body.numeProdus || "Produs Recuperat (Telefon)",
      metodaPlata: "Ramburs",
      status: "Nouă",
      cantitate: 1
    });

    await comandaNoua.save();
    await CosAbandonat.findByIdAndDelete(req.params.id);
    res.json({ success: true, mesaj: "Comandă creată!" });
  } catch (err) {
    res.status(500).json({ eroare: err.message });
  }
});

app.get('/api/recenzii/admin', verifyAdmin, async (req, res) => {
  try { res.json(await Recenzie.find().populate('produsId', 'nume').sort({ createdAt: -1 })); } 
  catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.patch('/api/recenzii/:id/status', verifyAdmin, async (req, res) => {
  try { res.json(await Recenzie.findByIdAndUpdate(req.params.id, { status: req.body.status }, { returnDocument: 'after' })); } 
  catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.delete('/api/recenzii/:id', verifyAdmin, async (req, res) => {
  try {
    const recenzieStearsa = await Recenzie.findByIdAndDelete(req.params.id);
    if (!recenzieStearsa) return res.status(404).json({ eroare: "Recenzia nu există." });
    res.json({ success: true, mesaj: "Recenzie ștearsă!" });
  } catch (err) { 
    res.status(500).json({ eroare: err.message });
  }
});

app.get('/api/admin/users', verifyAdmin, async (req, res) => {
  try {
    const utilizatori = await mongoose.connection.db.collection('users')
      .find({}, { projection: { parola: 0, password: 0 } })
      .sort({ createdAt: -1 }).toArray();
    res.json(utilizatori);
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.get('/api/admin/mesaje', verifyAdmin, async (req, res) => {
  try {
    const mesaje = await Contact.find().sort({ createdAt: -1 });
    res.json(mesaje);
  } catch (err) { 
    res.status(500).json({ eroare: "Eroare la încărcare: " + err.message }); 
  }
});

app.delete('/api/admin/mesaje/:id', verifyAdmin, async (req, res) => {
  try {
    const idMesaj = req.params.id;
    if (!mongoose.Types.ObjectId.isValid(idMesaj)) return res.status(400).json({ eroare: "Formatul ID-ului este invalid!" });
    const sters = await Contact.findByIdAndDelete(idMesaj);
    if (!sters) return res.status(404).json({ eroare: "Mesajul nu a fost găsit." });
    console.log(`🗑️ Mesaj șters: ${idMesaj}`);
    res.json({ success: true, mesaj: "Mesaj șters cu succes!" });
  } catch (err) {
    console.error("❌ Eroare server:", err);
    res.status(500).json({ eroare: "Eroare la ștergere: " + err.message });
  }
});

// ============================================================================
// === 13. RUTE ANALITICE ȘI AI ADS OPTIMIZER (Statistici Avansate) ===
// ============================================================================
app.get('/api/admin/profit-analytics', verifyAdmin, async (req, res) => {
  try {
    const { range } = req.query; 
    const tz = 'Europe/Bucharest';
    let dataStart = moment.tz(tz).subtract(30, 'days').startOf('day').toDate();
    if (range === 'today') dataStart = moment.tz(tz).startOf('day').toDate();
    if (range === 'last7') dataStart = moment.tz(tz).subtract(6, 'days').startOf('day').toDate();
    const dataEnd = new Date();
    const query = { createdAt: { $gte: dataStart, $lte: dataEnd } };

    const comenzi = await Comanda.find(query).populate('produsId');
    const metodeTransport = await MetodaTransport.find();
    const costuriTransport = {};
    metodeTransport.forEach(m => { costuriTransport[m.tip] = Number(m.pret); });
    const taxaCurierDefault = costuriTransport['curier'] || 19; 

    let f = {
      venitBrut: 0, costMarfa: 0, costTransport: 0, pierderiRetur: 0, 
      taxeStripe: 0, nrComenziReusite: 0, topJudete: {},
      baniPeDrum: 0, 
      clientiMap: {} 
    };

    comenzi.forEach(c => {
      const taxaComanda = costuriTransport[c.tipLivrare] || taxaCurierDefault;
      if (c.status === 'Trimisă' || c.status === 'Expediată') f.baniPeDrum += c.total;

      if (c.status === 'Livrată' || c.status === 'Trimisă' || c.status === 'Expediată' || c.status === 'Nouă') {
        f.venitBrut += c.total;
        f.costTransport += taxaComanda;
        f.nrComenziReusite += 1;
        
        if (c.judet && c.judet.length > 2) {
          const judetClean = c.judet.trim().toUpperCase();
          f.topJudete[judetClean] = (f.topJudete[judetClean] || 0) + 1;
        }

        const identitateClient = c.telefon || c.email;
        if (identitateClient) f.clientiMap[identitateClient] = (f.clientiMap[identitateClient] || 0) + 1;

        const costProdus = c.produsId && c.produsId.costAchizitie ? c.produsId.costAchizitie : 0;
        f.costMarfa += costProdus * (c.cantitate || 1);
        
        if (c.metodaPlata && c.metodaPlata.toLowerCase().includes('card')) f.taxeStripe += (c.total * 0.014) + 1;
      }
      if (c.status === 'Returnată' || c.status === 'Refuzată') f.pierderiRetur += (taxaComanda * 2); 
    });

    const topJudeteArray = Object.entries(f.topJudete)
      .map(([nume, count]) => ({ nume, count }))
      .sort((a, b) => b.count - a.count).slice(0, 5);

    const repeatCustomers = Object.values(f.clientiMap).filter(count => count > 1).length;

    let fbAdsSpend = 0;
    try {
      if (process.env.FB_ACCESS_TOKEN && process.env.FB_AD_ACCOUNT_ID) {
        let fbDatePreset = 'last_30d';
        if (range === 'today') fbDatePreset = 'today';
        if (range === 'last7') fbDatePreset = 'last_7d';
        
        const fbUrl = `https://graph.facebook.com/v19.0/act_${process.env.FB_AD_ACCOUNT_ID}/insights?fields=spend&date_preset=${fbDatePreset}&access_token=${process.env.FB_ACCESS_TOKEN}`;
        const fbRes = await fetch(fbUrl);
        const fbData = await fbRes.json();
        
        if (fbData.data && fbData.data.length > 0) fbAdsSpend = parseFloat(fbData.data[0].spend);
      }
    } catch (e) { console.error("❌ Eroare la citirea din Facebook API:", e.message); }

    res.json({ 
      venitBrut: f.venitBrut, costMarfa: f.costMarfa, costTransport: f.costTransport,
      pierderiRetur: f.pierderiRetur, taxeStripe: f.taxeStripe, nrComenziReusite: f.nrComenziReusite,
      baniPeDrum: f.baniPeDrum, repeatCustomers: repeatCustomers, 
      topJudeteArray: topJudeteArray, fbAdsSpend: fbAdsSpend 
    });

  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.get('/api/admin/ads-optimizer', verifyAdmin, async (req, res) => {
  try {
    const { range } = req.query; 
    const fbDatePreset = range === 'today' ? 'today' : (range === 'last7' ? 'last_7d' : 'last_30d');

    const acum30Zile = new Date();
    acum30Zile.setDate(acum30Zile.getDate() - 30);
    
    const comenziIstoric = await Comanda.find({ 
      createdAt: { $gte: acum30Zile },
      status: { $in: ['Livrată', 'Trimisă', 'Expediată'] }
    }).populate('produsId');

    let profitTotalBrut = 0;
    const performantaZile = { 0:[], 1:[], 2:[], 3:[], 4:[], 5:[], 6:[] }; 

    comenziIstoric.forEach(c => {
      const costAch = c.produsId?.costAchizitie || 0;
      profitTotalBrut += (c.total - costAch - 19); 
      const zi = new Date(c.createdAt).getDay();
      performantaZile[zi].push(c.total);
    });

    const profitMediu = comenziIstoric.length > 0 ? profitTotalBrut / comenziIstoric.length : 0;
    const ziCurenta = new Date().getDay();
    const eZiSlaba = comenziIstoric.length > 0 ? (performantaZile[ziCurenta].length < (comenziIstoric.length / 10)) : false;

    let adsData = [];
    let cimitirData = [];
    let winnerAudience = null;
    let loserAudience = null;
    let baniArsiDegeaba = 0;
    let campaniiDeOprit = 0;
    let campaniiDeScalat = 0;

    if (process.env.FB_ACCESS_TOKEN && process.env.FB_AD_ACCOUNT_ID) {
      const fieldsMain = `id,name,status,daily_budget,updated_time,learning_stage_info,insights.date_preset(${fbDatePreset}){spend,actions,action_values,inline_link_click_ctr,inline_link_clicks,frequency}`;
      const fbUrlMain = `https://graph.facebook.com/v19.0/act_${process.env.FB_AD_ACCOUNT_ID}/adsets?fields=${fieldsMain}&effective_status=['ACTIVE','PAUSED','ARCHIVED']&access_token=${process.env.FB_ACCESS_TOKEN}`;
      const fbUrl3d = `https://graph.facebook.com/v19.0/act_${process.env.FB_AD_ACCOUNT_ID}/adsets?fields=id,insights.date_preset(last_3d){spend,inline_link_clicks}&access_token=${process.env.FB_ACCESS_TOKEN}`;
      
      const [resMain, res3d] = await Promise.all([fetch(fbUrlMain), fetch(fbUrl3d)]);
      const fbJson = await resMain.json();
      const fbJson3d = await res3d.json();

      const mapCpc3d = {};
      if (fbJson3d.data && !fbJson3d.error) {
        fbJson3d.data.forEach(ad => {
          const ins3d = ad.insights?.data?.[0] || {};
          const spend3d = parseFloat(ins3d.spend || 0);
          const clicks3d = parseInt(ins3d.inline_link_clicks || 0);
          mapCpc3d[ad.id] = clicks3d > 0 ? (spend3d / clicks3d) : 0;
        });
      }

      if (fbJson.data) {
        let maxRoas = 0;
        let minRoas = 999;

        fbJson.data.forEach(adset => {
          const insights = adset.insights?.data?.[0] || {};
          const achizitii = insights.actions?.find(a => a.action_type === 'purchase')?.value || 0;
          const valoareVanzari = parseFloat(insights.action_values?.find(a => a.action_type === 'purchase')?.value || 0);
          const spend = parseFloat(insights.spend || 0);
          const clicks = parseInt(insights.inline_link_clicks || 0);
          const ctr = parseFloat(insights.inline_link_click_ctr || 0);
          const frequency = parseFloat(insights.frequency || 0);
          
          const cpa = achizitii > 0 ? (spend / achizitii) : 0;
          const cpc = clicks > 0 ? (spend / clicks) : 0;
          const roas = spend > 0 ? (valoareVanzari / spend) : 0; 
          const cpc3d = mapCpc3d[adset.id] || 0;

          const dataUltimuluiUpdate = adset.updated_time ? new Date(adset.updated_time).getTime() : Date.now();
          const oreTrecute = (Date.now() - dataUltimuluiUpdate) / (1000 * 60 * 60);
          const areInterdictieDeScalare = oreTrecute < 48;

          let obosealaCreativ = false;
          if (cpc > 0 && cpc3d > (cpc * 1.3) && spend > 50) obosealaCreativ = true;

          let diagnosticFunnel = null;
          if (ctr > 1.5 && achizitii === 0 && spend > 30) diagnosticFunnel = "🛒 Problemă Site: Oamenii dau click, dar nu cumpără. Verifică oferta.";
          else if (ctr < 0.8 && achizitii > 0) diagnosticFunnel = "🖼️ Creativ Slab: Produsul se vinde, dar poza e ignorată. Schimbă vizualul.";

          const statusLearning = adset.learning_stage_info?.status || 'unknown';
          const bugetZilnicNumeric = adset.daily_budget ? (adset.daily_budget / 100) : 0;

          let recomandare = "Așteaptă"; let actiune = "WAIT"; let mesaj = "Adunăm date..."; let predictieScalare = null;

          if (adset.status !== 'ACTIVE') {
            recomandare = "Inactiv"; actiune = "OFF"; mesaj = "Oprită manual sau buget epuizat.";
          } else if (statusLearning === 'LEARNING') {
            recomandare = "Învățare"; actiune = "WAIT"; mesaj = "Algoritmul caută clienți. NU atinge bugetul!";
          } else if (achizitii >= 3 && cpa < (profitMediu * 0.7)) {
            campaniiDeScalat++;
            if (areInterdictieDeScalare) {
              recomandare = "BLOCAT (48h)"; actiune = "HOLD"; mesaj = `🛑 STOP! Așteaptă stabilizarea algoritmului (${oreTrecute.toFixed(0)}h).`;
            } else {
              recomandare = "SCALEAZĂ"; actiune = "SCALE"; mesaj = "Winner! CPA mic. Permisiune de scalare acordată.";
              const extraBuget = bugetZilnicNumeric * 0.20;
              const cpaDegradat = cpa * 1.15; 
              const extraVanzari = cpaDegradat > 0 ? (extraBuget / cpaDegradat) : 0;
              const extraProfitNet = (extraVanzari * profitMediu) - extraBuget;
              
              predictieScalare = {
                bugetNou: (bugetZilnicNumeric + extraBuget).toFixed(0),
                extraVanzari: extraVanzari.toFixed(1),
                profitExtra: extraProfitNet.toFixed(2)
              };
            }
          } else if (spend > (profitMediu * 1.3) && achizitii === 0) {
            campaniiDeOprit++; baniArsiDegeaba += spend;
            recomandare = "OPREȘTE"; actiune = "KILL"; mesaj = "Gaură în buget! Ai cheltuit prea mult fără nicio vânzare.";
          }

          if (adset.status === 'ACTIVE' && spend > 30) {
            if (roas > maxRoas) { maxRoas = roas; winnerAudience = { nume: adset.name, roas: roas.toFixed(2) }; }
            if (roas < minRoas) { minRoas = roas; loserAudience = { nume: adset.name, roas: roas.toFixed(2) }; }
          }

          const adPayload = {
            id: adset.id, nume: adset.name, status: adset.status, bugetZilnic: bugetZilnicNumeric.toFixed(2), 
            spend: spend.toFixed(2), achizitii, cpa: cpa.toFixed(2), ctr: ctr.toFixed(2), cpc: cpc.toFixed(2), 
            roas: roas.toFixed(2), frequency: frequency.toFixed(2), actiune, recomandare, mesaj, obosealaCreativ, 
            oreTrecute: oreTrecute.toFixed(0), diagnosticFunnel, predictieScalare
          };

          if (adset.status === 'ACTIVE') adsData.push(adPayload); else cimitirData.push(adPayload);
        });
      }
    }

    let aiSummary = "Totul pare stabil. Continuă să monitorizezi.";
    if (campaniiDeOprit > 0) aiSummary = `🚨 URGENT: Oprește imediat cele ${campaniiDeOprit} campanii moarte. Au ars ${baniArsiDegeaba.toFixed(2)} Lei degeaba azi! Folosește butonul KILL.`;
    else if (campaniiDeScalat > 0) aiSummary = `✅ EXCELENT: Ai ${campaniiDeScalat} campanii de scalat. Aplică predicția și urcă bugetele.`;

    res.json({ adsData, cimitirData, profitMediu, winnerAudience, loserAudience, eZiSlaba, ziCurenta, aiSummary });
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.get('/api/comenzi/client', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ eroare: "Utilizator negăsit." });
    const comenzi = await Comanda.find({ email: user.email }).sort({ createdAt: -1 });
    res.json(comenzi);
  } catch (err) {
    console.error("❌ Eroare la preluarea comenzilor clientului:", err);
    res.status(500).json({ eroare: "Nu am putut încărca istoricul comenzilor." });
  }
});

// ============================================================================
// === 14. UTILITARE SEO & FIX-URI ===
// ============================================================================
app.get('/api/fix-slugs', verifyAdmin, async (req, res) => {
  try {
    const produse = await Produs.find({});
    let modificate = 0;
    for (let p of produse) {
      if (p.nume) {
        p.slug = p.nume
          .toLowerCase()
          .replace(/ă/g, 'a').replace(/â/g, 'a').replace(/î/g, 'i').replace(/ș/g, 's').replace(/ț/g, 't')
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/(^-|-$)+/g, '');
        await p.save(); 
        modificate++;
      }
    }
    res.json({ mesaj: `BOMBĂ! Am forțat repararea link-urilor pentru TOATE cele ${modificate} produse din magazin.` });
  } catch (err) { res.status(500).json({ eroare: err.message }); }
});

app.get('/sitemap.xml', async (req, res) => {
  try {
    const produse = await Produs.find({}, 'slug updatedAt'); 
    const siteUrl = 'https://merkado.ro';
    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';
    xml += `  <url>\n    <loc>${siteUrl}/</loc>\n    <changefreq>daily</changefreq>\n    <priority>1.0</priority>\n  </url>\n`;
    xml += `  <url>\n    <loc>${siteUrl}/shop</loc>\n    <changefreq>daily</changefreq>\n    <priority>0.9</priority>\n  </url>\n`;

    produse.forEach(produs => {
      if (produs.slug) {
        const dataModificare = produs.updatedAt ? produs.updatedAt.toISOString().split('T')[0] : new Date().toISOString().split('T')[0];
        xml += `  <url>\n    <loc>${siteUrl}/produs/${produs.slug}</loc>\n    <lastmod>${dataModificare}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n`;
      }
    });

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (err) { res.status(500).send('Eroare la generarea sitemap-ului'); }
});

// ============================================================================
// === 15. WEBSOCKETS (Socket.io) - Live Tracker Vizitatori ===
// ============================================================================
const io = new Server(server, {
  cors: {
    origin: "*", 
    methods: ["GET", "POST"]
  }
});

const activeUsers = new Map();
app.use((req, res, next) => {
  const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
  activeUsers.set(ip, Date.now());
  next();
});

let vizitatoriActivi = 0;
let cosuriLive = {}; 

io.on('connection', async (socket) => {
  const isDashboard = socket.handshake.query.source === 'admin_dashboard';

  if (!isDashboard) {
    vizitatoriActivi++;
    io.emit('vizitatori_live', vizitatoriActivi); 
    try { await VizitaSite.create({}); } 
    catch (err) { console.log("Eroare la salvare vizită în DB:", err.message); }
  }

  socket.on('client_typing', (dateCos) => {
    if (isDashboard) return; 
    cosuriLive[socket.id] = { ...dateCos, ultimaActualizare: Date.now() };
    io.emit('admin_update_carts', Object.values(cosuriLive));
  });

  socket.on('disconnect', () => {
    if (!isDashboard) {
      vizitatoriActivi = Math.max(0, vizitatoriActivi - 1);
      io.emit('vizitatori_live', vizitatoriActivi); 
      if (cosuriLive[socket.id]) {
        delete cosuriLive[socket.id]; 
        io.emit('admin_update_carts', Object.values(cosuriLive)); 
      }
    }
  });
});

// ============================================================================
// === 16. PORNIRE SERVER ===
// ============================================================================
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`🚀 Serverul rulează perfect pe portul ${PORT}`);
});