app.get('/api/dashboard', verifyAdmin, async (req, res) => {
  try {
    // 1. Calculăm data de început pentru "Astăzi" (ora 00:00)
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    // 2. EXECUTĂM TOATE QUERIES-URILE SIMULTAN (Performanță maximă 🚀)
    const [comenziRecente, statsIncasari, produseTop, nrComenzi] = await Promise.all([
      // Ultimele 5 comenzi de AZI cu tot cu numele produsului
      Comanda.find({ createdAt: { $gte: startOfToday } })
             .sort({ createdAt: -1 })
             .limit(5)
             .populate('produsId', 'nume'),

      // Calculăm totalul încasărilor de AZI (excluzând anulatele)
      Comanda.aggregate([
        { $match: { 
            createdAt: { $gte: startOfToday },
            status: { $ne: 'Anulată' } 
        }}, 
        { $group: { _id: null, total: { $sum: "$total" } } }
      ]),

      // Top 3 Cele mai vândute produse de AZI (excluzând anulatele)
      Comanda.aggregate([
        { $match: { 
            createdAt: { $gte: startOfToday },
            status: { $ne: 'Anulată' } 
        }},
        { $group: { _id: "$numeProdus", count: { $sum: "$cantitate" }, venit: { $sum: "$total" } } },
        { $sort: { count: -1 } },
        { $limit: 3 }
      ]),

      // Numărul total de comenzi de AZI
      Comanda.countDocuments({ createdAt: { $gte: startOfToday } })
    ]);

    // 3. Calculăm rata de conversie
    const vizitatoriEstimati = 500; 
    // Protecție la împărțirea cu zero în caz că nu ai vizitatori
    const conversie = vizitatoriEstimati > 0 ? ((nrComenzi / vizitatoriEstimati) * 100).toFixed(2) : "0.00";

    // Trimitem "pachetul" complet către React
    res.json({
      stats: {
        incasari: statsIncasari[0]?.total || 0,
        incasariProcent: "+12%", 
        comenzi: nrComenzi,
        comenziProcent: "+5%",
        conversie: conversie,
        conversieProcent: "+0.5%"
      },
      comenziRecente: comenziRecente,
      produseTop: produseTop.map(p => ({
        nume: p._id,
        cantitate: p.count,
        venit: p.venit
      }))
    });

  } catch (error) {
    console.error("Eroare Dashboard:", error);
    res.status(500).json({ error: "Eroare la generarea dashboard-ului securizat" });
  }
});