const express = require('express');
const router = express.Router();
const Comanda = require('../models/Comanda'); 
const CosAbandonat = require('../models/CosAbandonat'); // Ai nevoie de el pentru a curăța coșurile
const stripe = require('stripe')(process.env.STRIPE_SECRET); // Ai nevoie de Stripe pentru validare

// ⚠️ ATENȚIE: Trebuie să imporți funcția calculeazaTotalSecurizat! 
// Presupunem că ai pus-o într-un fișier separat gen "utils.js". Dacă nu, copiaz-o direct în fișierul ăsta.
// const { calculeazaTotalSecurizat } = require('../utils/helpers'); 

router.post('/noua', async (req, res) => {
    try {
        const d = req.body;

        // 🛡️ PROTECȚIE 1: Verificăm datele esențiale să nu ne dea erori Mongoose mai jos
        if (!d.produsId || !d.telefon || !d.adresa) {
            return res.status(400).json({ eroare: "Te rugăm să completezi toate datele de livrare." });
        }

        // 🛡️ PROTECȚIE 2: Verificare Stripe (Fără asta îți iei țeapă la plățile cu cardul)
        if (d.metodaPlata && d.metodaPlata.toLowerCase().includes('card')) {
            if (!d.paymentId) {
                return res.status(400).json({ eroare: "Tentativă de fraudă: ID plată lipsă!" });
            }
            const plataVerificata = await stripe.paymentIntents.retrieve(d.paymentId);
            if (plataVerificata.status !== 'succeeded') {
                return res.status(400).json({ eroare: "Plata nu a fost validată de bancă!" });
            }
        }

        // 1. RE-CALCULĂM TOTALUL (Siguranță maximă)
        const totalReal = await calculeazaTotalSecurizat(
            d.produsId, 
            d.qty, 
            d.tipLivrare, 
            d.extraOptions, 
            d.metodaPlata
        );

        // 2. CONSTRUIM PAYLOAD-UL (Curat, fără injecții)
        const payloadComanda = {
            produsId: d.produsId,
            numeProdus: d.numeProdus,
            numeClient: d.numeClient,
            email: d.email,
            telefon: d.telefonClient || d.telefon,
            adresa: d.adresaLivrare || d.adresa,
            localitate: d.localitate,
            judet: d.judet,
            total: totalReal, 
            metodaPlata: d.metodaPlata,
            paymentId: d.paymentId, 
            tipLivrare: d.tipLivrare,
            samedayLockerId: d.samedayLockerId,
            cantitate: d.qty || 1,
            extraOptions: d.extraOptions,
            status: 'Nouă' 
        };

        // 3. SALVĂM ÎN MONGODB
        const nouaComanda = new Comanda(payloadComanda);
        await nouaComanda.save();

        // 4. CURĂȚĂM COȘUL ABANDONAT (Dacă omul a cumpărat, ștergem numărul de acolo)
        await CosAbandonat.findOneAndDelete({ telefon: payloadComanda.telefon });

        // Aici ar trebui să apelezi și funcția de trimiteEmail() dacă ai importat-o!

        // 5. RĂSPUNS CĂTRE CLIENT
        res.status(201).json({ 
            success: true, 
            mesaj: "Comanda ta a fost primită cu succes!" 
        });

    } catch (err) {
        console.error("❌ Eroare la primirea comenzii:", err);
        res.status(500).json({ eroare: "A apărut o problemă. Te rugăm să încerci din nou." });
    }
});

module.exports = router;