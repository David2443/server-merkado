const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit'); // Avem nevoie de asta

// 1. PAZNICUL DE LA INTRARE (Limităm spamul)
const contactLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 oră
  max: 3, // Doar 3 mesaje permise pe oră de la același IP
  message: { eroare: "Prea multe mesaje! Încearcă mai târziu." }
});

const contactSchema = new mongoose.Schema({
  nume: { type: String, required: true, maxlength: 100 },
  email: { type: String, required: true, maxlength: 100 },
  subiect: { type: String, required: true, maxlength: 200 },
  mesaj: { type: String, required: true, maxlength: 3000 } // Limităm să nu ne umple DB-ul
}, { timestamps: true });

const Contact = mongoose.models.Contact || mongoose.model('Contact', contactSchema);

// 2. APLICĂM LIMITERUL PE RUTA DE POST
router.post('/', contactLimiter, async (req, res) => {
  try {
    const { nume, email, subiect, mesaj } = req.body;

    // 🛡️ PROTECȚIE ANTI-CRASH: Ne asigurăm că absolut toate câmpurile au fost trimise
    if (!nume || !email || !subiect || !mesaj) {
      return res.status(400).json({ eroare: "Toate câmpurile sunt obligatorii." });
    }

    // 🛡️ Acum suntem siguri că există și putem aplica funcții pe ele
    const emailStr = String(email).trim().toLowerCase();
    const numeStr = String(nume).trim();
    const subiectStr = String(subiect).trim();
    const mesajStr = String(mesaj).trim();

    // Verificare validitate
    if (!emailStr.includes('@') || numeStr.length < 2) {
        return res.status(400).json({ eroare: "Te rugăm să introduci un email valid și un nume real." });
    }

    const mesajNou = new Contact({
      nume: numeStr,
      email: emailStr,
      subiect: subiectStr,
      mesaj: mesajStr
    });
    
    await mesajNou.save();

    res.status(201).json({ success: true, mesaj: "Mesaj primit! Te contactăm curând pe email." });

  } catch (error) {
    console.error("❌ Eroare Contact:", error);
    res.status(500).json({ eroare: "Eroare internă. Încearcă mai târziu." });
  }
});

module.exports = router;