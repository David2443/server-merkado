const express = require('express');
const router = express.Router();
const Comanda = require('../models/Comanda');
const Produs = require('../models/Produs');
const { verifyAdmin } = require('./auth'); // 👈 ADĂUGAT PAZNICUL

// ==========================================
// RUTA: GET /api/admin/stats (PROTEJATĂ)
// ==========================================
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    // 1. Calculăm data de acum 7 zile (Dar fix de la miezul nopții!)
    const sapteZileInUrma = new Date();
    sapteZileInUrma.setDate(sapteZileInUrma.getDate() - 7);
    sapteZileInUrma.setHours(0, 0, 0, 0); // 👈 FIX 2: Tăiem la ora 00:00

    // 2. Executăm totul în paralel (Viteză maximă)
    const [statsGenerale, numarComenzi, numarProduse, vanzariPeZile] = await Promise.all([
      // Suma totală "Lifetime" (toate încasările de la lansare)
      Comanda.aggregate([
        { $match: { status: { $ne: 'Anulată' } } },
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),

      // Total comenzi și produse de când există site-ul
      Comanda.countDocuments(),
      Produs.countDocuments(),

      // Graficul pe ultimele 7 zile
      Comanda.aggregate([
        { 
          $match: { 
            createdAt: { $gte: sapteZileInUrma },
            status: { $ne: 'Anulată' }
          } 
        },
        {
          $group: {
            // 👈 FIX 1: Grupăm în format YYYY-MM-DD pentru o sortare cronologică perfectă
            _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
            total: { $sum: "$total" }
          }
        },
        { $sort: { "_id": 1 } } // Acum le va așeza perfect, chiar și la trecerea dintre luni
      ])
    ]);

    res.json({
      venitTotal: statsGenerale[0]?.total || 0,
      comenziTotal: numarComenzi,
      produseTotal: numarProduse,
      
      // La final, tăiem anul din "2026-05-01" și lăsăm doar "01-05" pentru React
      dateGrafic: vanzariPeZile.map(d => {
        const bucati = d._id.split('-'); // Sparge "2026-05-01" în ["2026", "05", "01"]
        return { 
          nume: `${bucati[2]}-${bucati[1]}`, // Reasamblează ca "01-05"
          vanzari: d.total 
        };
      })
    });
  } catch (err) {
    console.error("❌ Eroare Stats:", err);
    res.status(500).json({ eroare: "Nu am putut genera statisticile." });
  }
});

module.exports = router;