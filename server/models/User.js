const mongoose = require('mongoose');
const bcrypt = require('bcryptjs'); 

const UserSchema = new mongoose.Schema({
  // --- INFORMAȚII DE BAZĂ ---
  nume: { 
    type: String, 
    required: [true, "Numele este obligatoriu"],
    trim: true 
  },
  email: { 
    type: String, 
    required: [true, "Email-ul este obligatoriu"], 
    unique: true,
    lowercase: true,
    trim: true
  },
  parola: { 
    type: String, 
    required: [true, "Parola este obligatorie"],
    minlength: [6, "Parola trebuie să aibă minim 6 caractere"] // 👈 FIX 3: Limita de siguranță
  },

  // --- ROLURI ---
  role: { 
    type: String, 
    enum: ['user', 'admin'], 
    default: 'user' 
  },

  // --- ISTORIC COMENZI ---
  comenzi: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Comanda' // 👈 FIX 1: Numele corect al modelului tău
  }],

  // --- SECURITATE: RECUPERARE PAROLĂ ---
  resetPasswordToken: {
    type: String,
    default: undefined
  },
  resetPasswordExpires: {
    type: Date,
    default: undefined
  }
}, {
  // 👈 FIX 2: Asta rezolvă automat și createdAt și updatedAt
  timestamps: true 
});

// ==========================================
// 🔒 "SCUTUL INVIZIBIL": Criptăm parola automat înainte de salvare
// ==========================================
UserSchema.pre('save', async function() {
  // Dacă parola NU a fost modificată, ieșim din funcție direct
  if (!this.isModified('parola')) {
    return; 
  }
  
  // Dacă a fost modificată (la creare cont sau resetare), o criptăm
  const salt = await bcrypt.genSalt(10);
  this.parola = await bcrypt.hash(this.parola, salt);
});

// ==========================================
// 🔑 FUNCȚIE SPECIALĂ: Compară parola la Login
// ==========================================
UserSchema.methods.matchPassword = async function(parolaIntrodusa) {
  return await bcrypt.compare(parolaIntrodusa, this.parola);
};

module.exports = mongoose.model('User', UserSchema);