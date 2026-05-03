const express = require('express');
const router = express.Router();
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const User = require('../models/User'); 

// 🚀 IMPORTĂM RESEND (Înlocuim Nodemailer-ul care făcea figuri)
const { Resend } = require('resend');
const resend = new Resend(process.env.RESEND_API_KEY);

// Aducem paznicul din folderul middleware
const { protect } = require('../middleware/auth');

const JWT_SECRET = process.env.JWT_SECRET;

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
// 4. FORGOT PASSWORD (TRIMIS PRIN RESEND 🔥)
// ==========================================
router.post('/forgot-password', async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            console.log("ℹ️ Email-ul nu a fost găsit în baza de date.");
            return res.status(200).json({ mesaj: "Dacă adresa este corectă, vei primi un email." });
        }

        // Generăm token-ul de resetare
        const token = crypto.randomBytes(20).toString('hex');
        user.resetPasswordToken = token;
        user.resetPasswordExpires = Date.now() + 3600000; // Valabil 1 oră
        await user.save();

        // Construim link-ul pentru Frontend
        const appUrl = process.env.FRONTEND_URL || "http://localhost:5173"; 
        const resetLink = `${appUrl}/reset-password/${token}`;

        console.log("📧 Se încearcă trimiterea mail-ului de resetare către:", user.email);

        // 🚀 Trimitem mailul prin RESEND (Bulletproof pe orice server)
        const { data, error } = await resend.emails.send({
            from: 'Merkado <comenzi@merkado.ro>', // Asigură-te că domeniul e verificat în Resend
            to: [user.email],
            subject: 'Resetare Parolă Cont - Merkado',
            html: `
                <div style="font-family: Arial, sans-serif; padding: 20px; border: 1px solid #eee; max-width: 500px; margin: auto;">
                    <h2 style="color: #333;">Salut, ${user.nume}!</h2>
                    <p style="color: #555; line-height: 1.5;">Ai cerut resetarea parolei pentru contul tău Merkado.</p>
                    <p style="color: #555; line-height: 1.5;">Click pe butonul de mai jos pentru a alege o parolă nouă. Link-ul este valabil 1 oră.</p>
                    <div style="text-align: center; margin: 30px 0;">
                        <a href="${resetLink}" style="background: #1a1a1a; color: white; padding: 12px 25px; text-decoration: none; border-radius: 5px; display: inline-block; font-weight: bold;">Resetează Parola</a>
                    </div>
                    <p style="margin-top: 20px; color: #999; font-size: 12px; border-top: 1px solid #eee; padding-top: 10px;">Dacă nu ai cerut tu asta, poți ignora acest email în siguranță.</p>
                </div>
            `
        });

        if (error) {
            console.error("❌ Eroare Resend la resetare parolă:", error);
            return res.status(500).json({ eroare: "Nu am putut trimite email-ul. Încearcă din nou." });
        }

        console.log("✅ Email de resetare trimis cu succes!");
        res.status(200).json({ mesaj: "Email-ul de resetare a fost trimis!" });

    } catch (err) {
        console.error("❌ EROARE CRITICĂ FORGOT PASSWORD:", err.message);
        res.status(500).json({ eroare: "Eroare internă la procesarea cererii." });
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
        res.status(200).json({ mesaj: "Parola a fost schimbată cu succes!" });
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
        if (parolaNoua) user.parola = parolaNoua; 

        await user.save();

        res.status(200).json({ 
            mesaj: "Profil actualizat cu succes!", 
            user: { nume: user.nume, email: user.email } 
        });
    } catch (err) {
        if (err.code === 11000) {
            return res.status(400).json({ eroare: "Această adresă de email aparține deja altui cont!" });
        }
        console.error("Eroare la Update Profil:", err);
        res.status(500).json({ eroare: "Eroare internă la actualizarea profilului." });
    }
});

module.exports = router;