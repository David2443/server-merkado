const mongoose = require('mongoose');

const produsSchema = new mongoose.Schema({
  // --- INFORMAȚII DE BAZĂ ---
  nume: {
    type: String,
    required: [true, "Produsul trebuie să aibă un nume!"],
    trim: true
  },
  descriere: { type: String },
  pret: {
    type: Number,
    required: true,
    min: [0, "Prețul nu poate fi negativ!"]
  },
  pretVechi: { type: Number, min: 0 },
  imaginePrincipala: {
    type: String,
    required: [true, "Trebuie o poză principală pentru magazin!"]
  },
  categorie: { type: String, required: true, default: 'Auto' },
  stoc: { type: Number, default: 0 },
  
  // --- OFERTE ---
  oferte: [{
    cantitate: { type: Number },
    pret: { type: Number },
    text: { type: String }
  }],

  // --- HERO & SOCIAL PROOF ---
  heroBeneficii: [{ type: String }], 
  imagineFacebook: { type: String }, 
  heroRecenzie: {
    nume: { type: String },
    text: { type: String },
    rating: { type: Number, default: 5 },
    imagine: { type: String }
  },

  // --- FOMO & URGENȚĂ ---
  vizitatoriLiveMin: { type: Number, default: 10 },
  vizitatoriLiveMax: { type: Number, default: 35 },
  stocFictiv: { type: Number, default: 7 },
  minuteCountdown: { type: Number, default: 15 },

  // --- CONSTRUCTOR PAGINĂ ---
  sectiuniLanding: [{ type: mongoose.Schema.Types.Mixed }],

  slug: { type: String, unique: true }

}, { timestamps: true });

// ==========================================
// 🔗 GENERATORUL DE LINK-URI BLINDAT
// ==========================================
produsSchema.pre('save', function(next) {
  if (this.isModified('nume')) {
    // 1. Curățare modernă de absolut orice diacritică (și majuscule, și minuscule)
    let bazaSlug = this.nume
      .normalize("NFD") // Descompune literele (ex: ă devine a + ̆ )
      .replace(/[\u0300-\u036f]/g, "") // Șterge semnele de deasupra literelor
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-') // Înlocuiește spațiile/simbolurile cu cratimă
      .replace(/(^-|-$)+/g, ''); // Taie cratimele lăsate aiurea la început/sfârșit

    // 2. Protecție Anti-Crash (Adăugăm 4 litere/cifre random la final)
    // Așa poți avea 100 de produse numite "Cameră Auto", link-urile vor fi unice 
    // ex: camera-auto-a8f2, camera-auto-9x1c
    const randomSuffix = Math.random().toString(36).substring(2, 6);
    this.slug = `${bazaSlug}-${randomSuffix}`;
  }
  
  // 3. Rezolvarea capcanei "Mixed Type"
  // Dacă modifici sectiuniLanding, îi spunem manual bazei de date să nu o ignore
  if (this.isModified('sectiuniLanding')) {
      this.markModified('sectiuniLanding');
  }

  next();
});

module.exports = mongoose.model('Produs', produsSchema);