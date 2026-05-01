const jwt = require('jsonwebtoken');
const User = require('../models/User'); // 👈 VITAL: Aducem modelul pentru a verifica realitatea

// ==========================================
// 🛡️ NIVEL 1: Verifică dacă este logat (Client + Admin)
// ==========================================
const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            token = req.headers.authorization.split(' ')[1];
            
            // 1. Decodificăm token-ul (verificăm semnătura și expirarea matematică)
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // 2. PROTECȚIA SUPREMĂ: Căutăm userul în DB, excluzând parola
            req.user = await User.findById(decoded.id).select('-parola');

            // 3. Dacă user-ul a fost șters din DB între timp, îi tăiem accesul imediat
            if (!req.user) {
                return res.status(401).json({ eroare: "Contul nu mai există. Sesiune anulată." });
            }

            next(); // Totul e curat, dă-i drumul mai departe!
        } catch (error) {
            console.error("Eroare Auth:", error.message);
            res.status(401).json({ eroare: "Sesiune expirată sau token invalid." });
        }
    }

    if (!token) {
        res.status(401).json({ eroare: "Nu ești autorizat. Lipsă token!" });
    }
};

// ==========================================
// 🛡️ NIVEL 2: Verifică dacă are grad de Administrator
// ==========================================
// SE FOLOSEȘTE MEREU DUPĂ PROTECT -> router.get('/admin/stats', protect, admin, async...)
const admin = (req, res, next) => {
    if (req.user && req.user.role === 'admin') {
        next(); // E boss, dă-i drumul
    } else {
        res.status(403).json({ eroare: "Acces interzis! Această zonă este doar pentru administratori." });
    }
};

module.exports = { protect, admin };