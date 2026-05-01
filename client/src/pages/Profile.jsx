import React from 'react';
useEffect(() => {
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  const fetchComenzi = async () => {
    try {
      const userString = localStorage.getItem('user');
      if (!userString) return; // Dacă nu e logat, ieșim tăcut

      const user = JSON.parse(userString);
      if (!user || !user.token) return;

      const res = await fetch(`${API_URL}/api/orders/user/${user._id}`, {
        headers: { 
          'Authorization': `Bearer ${user.token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await res.json();

      // 🛡️ FIX 1: Ne asigurăm că serverul a zis "OK" ȘI că datele sunt o listă (Array)
      if (res.ok && Array.isArray(data)) {
        setComenzi(data);
      } else {
        console.error("Eroare aducere comenzi:", data.eroare || "Format invalid");
        // Opțional: setComenzi([]) ca să fii sigur că nu crapă .map-ul
      }

    } catch (err) {
      // 🛡️ FIX 3: Prindem erorile de rețea (când pică netul)
      console.error("Eroare critică la rețea:", err);
    }
  };

  fetchComenzi();
}, []);