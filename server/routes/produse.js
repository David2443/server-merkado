import mongoose from 'mongoose'; // Asigură-te că ai acest import sus în fișier!

// ==============================================
// RUTA 3: GET /api/produse/:id
// ==============================================
router.get('/:id', async (req, res) => {
  try {
    // PROTECȚIE: Verificăm dacă ID-ul este formatat corect pentru MongoDB
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mesaj: "ID-ul produsului este invalid." });
    }

    const produs = await Produs.findById(req.params.id).select('-__v');
    if (!produs) {
      return res.status(404).json({ mesaj: "Produsul nu a fost găsit." });
    }
    res.status(200).json(produs);
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la preluarea produsului", eroare: error.message });
  }
});

// ==============================================
// RUTA 4: PUT /api/produse/:id (🔒 DOAR ADMIN)
// ==============================================
router.put('/:id', verifyAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mesaj: "ID-ul produsului este invalid." });
    }

    // PROTECȚIE: Extragem strict datele pe care permitem să le modificăm!
    // Adaugă aici restul câmpurilor tale (pret, descriere, categorie, etc.)
    const updateData = {};
    const allowedFields = ['nume', 'pret', 'descriere', 'categorie', 'imagine', 'stoc']; 
    
    allowedFields.forEach(field => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    // FIX DIACRITICE: Normalizează textul (ex: "ș" -> "s") înainte de a crea slug-ul
    if (updateData.nume) {
      updateData.slug = updateData.nume
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "") // scoate diacriticele
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/(^-|-$)+/g, '');
    }

    const produsActualizat = await Produs.findByIdAndUpdate(
      req.params.id,
      { $set: updateData },
      { new: true, runValidators: true } 
    );

    if (!produsActualizat) {
      return res.status(404).json({ mesaj: "Produsul nu a fost găsit pentru modificare." });
    }

    res.status(200).json(produsActualizat);
  } catch (error) {
    res.status(400).json({ mesaj: "Eroare la modificarea produsului", eroare: error.message });
  }
});

// ==============================================
// RUTA 5: DELETE /api/produse/:id (🔒 DOAR ADMIN)
// ==============================================
router.delete('/:id', verifyAdmin, async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ mesaj: "ID-ul produsului este invalid." });
    }

    const produsSters = await Produs.findByIdAndDelete(req.params.id);
    
    if (!produsSters) {
      return res.status(404).json({ mesaj: "Produsul nu a fost găsit." });
    }

    res.status(200).json({ mesaj: "Produsul a fost șters cu succes!" });
  } catch (error) {
    res.status(500).json({ mesaj: "Eroare la ștergerea produsului", eroare: error.message });
  }
});