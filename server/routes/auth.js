const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// Aducem paznicul din folderul middleware
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;
const EMAIL_USER = process.env.EMAIL_USER;
const EMAIL_PASS = process.env.EMAIL_PASS;
const FRONTEND_URL = process.env.VITE_API_URL || "http://localhost:3000";

// ==========================================
// 1. REGISTER
// ==========================================
router.post('/register', async (req, res) => {
    try {
        const { nume, email, parola } = req.body;
        if(!nume || !email || !parola) return res.status(400).json({ eroare: "Toate câmpurile sunt obligatorii!" });

        const newUser = new User({ nume, email, parola });
        const user = await newUser.save();

        res.status(201).json({ 
            mesaj: "Cont creat!", 
            user: { id: user._id, nume: user.nume, email: user.email } 
        });
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ eroare: "Acest email este deja folosit." });
        res.status(500).json({ eroare: "Eroare la crearea contului." });
    }
});

// ==========================================
// 2. LOGIN
// ==========================================
router.post('/login', async (req, res) => {
    try {
        const { email, parola } = req.body;
        const user = await User.findOne({ email });

        if (!user) return res.status(401).json({ eroare: "Date de logare invalide!" });

        const validPassword = await user.matchPassword(parola);
        if (!validPassword) return res.status(401).json({ eroare: "Date de logare invalide!" });

        const token = jwt.sign({ id: user._id, role: user.role }, JWT_SECRET, { expiresIn: "3d" });

        res.status(200).json({ 
            token, 
            user: { id: user._id, nume: user.nume, email: user.email, role: user.role } 
        });
    } catch (err) {
        res.status(500).json({ eroare: "Eroare de server." });
    }
});

// ==========================================
// 3. GET ME (Datele utilizatorului logat)
// ==========================================
router.get('/me', protect, async (req, res) => {
    try {
        const user = await User.findById(req.user.id).select('-parola'); 
        if (!user) return res.status(404).json({ eroare: "Utilizatorul nu a fost găsit." });
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ eroare: "Eroare la preluarea datelor." });
    }
});

// ==========================================
// 4. FORGOT PASSWORD (Trimitere Email)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            console.log("ℹ️ Email-ul nu a fost găsit în baza de date.");
            return res.status(200).json({ mesaj: "Dacă adresa este corectă, vei primi un email." });
        }

        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 oră
        await user.save();

        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 465,
            secure: true, 
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS
            }
        });

        // 🛡️ FIX 2: Aici trebuie să fie URL-ul aplicației tale React (Frontend), nu API-ul de Node.
        // Asigură-te că în fișierul .env ai o variabilă gen FRONTEND_URL=https://merkado.ro
        const appUrl = process.env.FRONTEND_URL || "http://localhost:5173"; 
        const resetLink = `${appUrl}/reset-password/${token}`;

        console.log("📧 Se încearcă trimiterea mail-ului către:", user.email);

        await transporter.sendMail({
            to: user.email,
            // 🛡️ FIX 1: Actualizare la Merkado!
            from: `"Merkado" <${process.env.EMAIL_USER}>`,
            subject: 'Resetare Parolă Cont - Merkado',
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee;">
                    <h2>Salut, ${user.nume}!</h2>
                    <p>Ai cerut resetarea parolei pentru contul tău Merkado.</p>
                    <p>Click pe butonul de mai jos pentru a alege o parolă nouă. Link-ul este valabil 1 oră.</p>
                    <a href="${resetLink}" style="background: #1a1a1a; color: white; padding: 12px 20px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Resetează Parola</a>
                    <p style="margin-top: 20px; color: #666; font-size: 12px;">Dacă nu ai cerut tu asta, poți ignora acest email.</p>
                </div>
            `
        });

        console.log("✅ Email trimis cu succes!");
        res.status(200).json({ mesaj: "Email-ul de resetare a fost trimis!" });

    } catch (err) {
        console.error("❌ EROARE CRITICĂ NODEMAILER:", err.message);
        res.status(500).json({ eroare: "Eroare la trimiterea mailului pe server." });
    }
});

// ==========================================
// 5. RESET PASSWORD (Salvare parolă nouă)
// ==========================================
router.post('/reset-password/:token', async (req, res) => {
    try {
        const user = await User.findOne({ 
            resetPasswordToken: req.params.token, 
            resetPasswordExpires: { $gt: Date.now() } 
        });

        if (!user) return res.status(400).json({ eroare: "Link invalid sau expirat." });

        user.parola = req.body.parola;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        
        await user.save();
        res.status(200).json({ mesaj: "Parola a fost schimbată!" });
    } catch (err) {
        res.status(500).json({ eroare: "Eroare la resetare." });
    }
});

// ==========================================
// 6. UPDATE PROFILE
// ==========================================
router.put('/update', protect, async (req, res) => {
    try {
        const { nume, email, parolaNoua } = req.body;
        const user = await User.findById(req.user.id);

        if (!user) return res.status(404).json({ eroare: "Utilizator negăsit." });

        if (nume) user.nume = nume;
        if (email) user.email = email;
        if (parolaNoua) user.parola = parolaNoua; // Presupunem că Mongoose are hook-ul "pre-save" pentru hashing!

        await user.save();

        res.status(200).json({ 
            mesaj: "Profil actualizat cu succes!", 
            user: { nume: user.nume, email: user.email } 
        });
    } catch (err) {
        // 🛡️ FIX 3: Prindem eroarea în care omul pune un email folosit deja de altcineva
        if (err.code === 11000) {
            return res.status(400).json({ eroare: "Această adresă de email aparține deja altui cont!" });
        }
        console.error("Eroare la Update Profil:", err);
        res.status(500).json({ eroare: "Eroare internă la actualizarea profilului." });
    }
});

module.exports = router;