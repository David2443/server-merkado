const mongoose = require('mongoose');


const comandaSchema = new mongoose.Schema({
  produsId: { type: mongoose.Schema.Types.ObjectId, ref: 'Produs', required: true },
  numeClient: { type: String, required: true },
  telefon: { type: String, required: true },
  adresa: { type: String, required: true },
  cantitate: { type: Number, default: 1 },
  total: { type: Number, required: true },
  sursa: {type: String, default: 'Organic / Direct'},
  status: { type: String, default: 'Nouă' } // Nouă, Confirmată, Livrată, Anulată
}, { timestamps: true });

module.exports = mongoose.model('Comanda', comandaSchema);