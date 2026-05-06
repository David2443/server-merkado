const mongoose = require('mongoose'); //[cite: 11]

const produsSchema = new mongoose.Schema({ //[cite: 11]
  // --- INFORMAȚII DE BAZĂ ---
  nume: { //[cite: 11]
    type: String, //[cite: 11]
    required: [true, "Produsul trebuie să aibă un nume!"], //[cite: 11]
    trim: true //[cite: 11]
  }, //[cite: 11]
  descriere: { type: String }, //[cite: 11]
  pret: { //[cite: 11]
    type: Number, //[cite: 11]
    required: true, //[cite: 11]
    min: [0, "Prețul nu poate fi negativ!"] //[cite: 11]
  }, //[cite: 11]
  pretVechi: { type: Number, min: 0 }, //[cite: 11]
  imaginePrincipala: { //[cite: 11]
    type: String, //[cite: 11]
    required: [true, "Trebuie o poză principală pentru magazin!"] //[cite: 11]
  }, //[cite: 11]

  // 🔥 AICI ESTE FIX-UL PENTRU CARUSEL (Acum BD-ul reține toate pozele) 🔥
  galerieImagini: [{ type: String }],

  categorie: { type: String, required: true, default: 'Auto' }, //[cite: 11]
  stoc: { type: Number, default: 0 }, //[cite: 11]
  
  // --- OFERTE ---
  oferte: [{ //[cite: 11]
    cantitate: { type: Number }, //[cite: 11]
    pret: { type: Number }, //[cite: 11]
    text: { type: String } //[cite: 11]
  }], //[cite: 11]

  // --- HERO & SOCIAL PROOF ---
  heroBeneficii: [{ type: String }], //[cite: 11]
  imagineFacebook: { type: String }, //[cite: 11]
  heroRecenzie: { //[cite: 11]
    nume: { type: String }, //[cite: 11]
    text: { type: String }, //[cite: 11]
    rating: { type: Number, default: 5 }, //[cite: 11]
    imagine: { type: String } //[cite: 11]
  }, //[cite: 11]

  // --- FOMO & URGENȚĂ ---
  vizitatoriLiveMin: { type: Number, default: 10 }, //[cite: 11]
  vizitatoriLiveMax: { type: Number, default: 35 }, //[cite: 11]
  stocFictiv: { type: Number, default: 7 }, //[cite: 11]
  minuteCountdown: { type: Number, default: 15 }, //[cite: 11]

  // --- CONSTRUCTOR PAGINĂ ---
  sectiuniLanding: [{ type: mongoose.Schema.Types.Mixed }], //[cite: 11]

  slug: { type: String, unique: true } //[cite: 11]

}, { timestamps: true }); //[cite: 11]

// ==========================================
// 🔗 GENERATORUL DE LINK-URI BLINDAT
// ==========================================
produsSchema.pre('save', function(next) { //[cite: 11]
  if (this.isModified('nume')) { //[cite: 11]
    // 1. Curățare modernă de absolut orice diacritică (și majuscule, și minuscule)
    let bazaSlug = this.nume //[cite: 11]
      .normalize("NFD") // Descompune literele (ex: ă devine a + ̆ ) //[cite: 11]
      .replace(/[\u0300-\u036f]/g, "") // Șterge semnele de deasupra literelor //[cite: 11]
      .toLowerCase() //[cite: 11]
      .replace(/[^a-z0-9]+/g, '-') // Înlocuiește spațiile/simbolurile cu cratimă //[cite: 11]
      .replace(/(^-|-$)+/g, ''); // Taie cratimele lăsate aiurea la început/sfârșit //[cite: 11]

    // 2. Protecție Anti-Crash (Adăugăm 4 litere/cifre random la final)
    // Așa poți avea 100 de produse numite "Cameră Auto", link-urile vor fi unice 
    // ex: camera-auto-a8f2, camera-auto-9x1c
    const randomSuffix = Math.random().toString(36).substring(2, 6); //[cite: 11]
    this.slug = `${bazaSlug}-${randomSuffix}`; //[cite: 11]
  } //[cite: 11]
  
  // 3. Rezolvarea capcanei "Mixed Type"
  // Dacă modifici sectiuniLanding, îi spunem manual bazei de date să nu o ignore
  if (this.isModified('sectiuniLanding')) { //[cite: 11]
      this.markModified('sectiuniLanding'); //[cite: 11]
  } //[cite: 11]

  next(); //[cite: 11]
}); //[cite: 11]

module.exports = mongoose.model('Produs', produsSchema); //[cite: 11]