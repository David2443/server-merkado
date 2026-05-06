import { useState, useEffect } from 'react';
import { 
  FiSave, FiPlus, FiTrash2, FiImage, FiList, FiVideo, 
  FiLayout, FiCheck, FiX, FiStar, FiPercent, FiFacebook, 
  FiUploadCloud, FiArrowUp, FiArrowDown, FiSettings, FiActivity 
} from 'react-icons/fi';
import './ConstructorPage.css';
import React from 'react';

const initialState = { 
  nume: '', pret: '', pretVechi: '', imaginePrincipala: '', 
  galerieImagini: [],
  categorie: 'Auto',
  heroBeneficii: ['', '', ''], 
  heroRecenzie: { nume: '', text: '', rating: 5, imagine: '' },
  imagineFacebook: '', 
  oferte: [
    { cantitate: 1, pret: '', text: '1 Bucată - Preț Standard' }
  ],
  vizitatoriLiveMin: 10, 
  vizitatoriLiveMax: 35,
  stocFictiv: 7, 
  minuteCountdown: 15,
  sectiuniLanding: [] 
};

const ConstructorProdus = ({ token, idProdus, inapoiLaGestiune }) => {
  const [formData, setFormData] = useState(initialState);
  const [activeTab, setActiveTab] = useState('hero');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [slideIndex, setSlideIndex] = useState(0);

  // 🛡️ URL Dinamic pentru a merge pe internet
  const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  useEffect(() => {
    // Stabilizăm ID-ul pentru a evita fetch-ul infinit
    const idCurat = typeof idProdus === 'object' && idProdus !== null ? idProdus._id : idProdus;
    
    if (idCurat) {
      fetch(`${API_URL}/api/produse/${idCurat}`)
        .then(res => res.json())
        .then(data => {
          setFormData({ 
            ...initialState, 
            ...data,
            galerieImagini: data.galerieImagini?.length > 0 ? data.galerieImagini : (data.imaginePrincipala ? [data.imaginePrincipala] : []),
            oferte: data.oferte && data.oferte.length > 0 ? data.oferte : initialState.oferte,
            sectiuniLanding: data.sectiuniLanding || [],
            heroBeneficii: data.heroBeneficii && data.heroBeneficii.length > 0 ? data.heroBeneficii : initialState.heroBeneficii
          });
        })
        .catch(err => console.error("Eroare fetch produs:", err));
    } else {
      setFormData(initialState);
    }
  }, [idProdus, API_URL]);

  const preventDefault = (e) => { e.preventDefault(); e.stopPropagation(); };

  // --- MOTORUL DE DRAG & DROP PENTRU IMAGINI SINGULARE ---
  const handleFileDrop = (file, target, path = []) => {
    if (!file) return;
    const reader = new FileReader();
    reader.onloadend = () => {
      setFormData(prev => {
        if (path.length === 3 && path[0] === 'sectiuniLanding') {
          const idx = path[1];
          const key = path[2];
          const newSectiuni = [...prev.sectiuniLanding];
          newSectiuni[idx] = { ...newSectiuni[idx], [key]: reader.result };
          return { ...prev, sectiuniLanding: newSectiuni };
        } else if (path.length === 2) {
          return {
            ...prev,
            [path[0]]: { ...prev[path[0]], [path[1]]: reader.result }
          };
        } else {
          return { ...prev, [target]: reader.result };
        }
      });
    };
    reader.readAsDataURL(file);
  };

  // 🔥 FUNCȚIE CORECTATĂ PENTRU ȘTERGEREA POZELOR SINGULARE
  const stergeImagine = (target, path = []) => {
    setFormData(prev => {
      if (path.length === 3 && path[0] === 'sectiuniLanding') {
        const newSectiuni = [...prev.sectiuniLanding];
        newSectiuni[path[1]] = { ...newSectiuni[path[1]], [path[2]]: '' };
        return { ...prev, sectiuniLanding: newSectiuni };
      } else if (path.length === 2) {
        return { ...prev, [path[0]]: { ...prev[path[0]], [path[1]]: '' } };
      } else {
        return { ...prev, [target]: '' };
      }
    });
  };

  // --- MOTOR PENTRU GALERIE MULTIPLĂ (SLIDER) ---
  const adaugaInGalerie = (files) => {
    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData(prev => ({
          ...prev,
          galerieImagini: [...(prev.galerieImagini || []), reader.result]
        }));
      };
      reader.readAsDataURL(file);
    });
  };

  const stergeDinGalerie = (e, index) => {
    e.preventDefault();
    e.stopPropagation(); // 👈 Nu lasă click-ul să declanșeze altceva
    setFormData(prev => {
      const nouaGalerie = [...(prev.galerieImagini || [])];
      nouaGalerie.splice(index, 1);
      return { ...prev, galerieImagini: nouaGalerie };
    });
    setSlideIndex(0); // Resetăm la prima poză
  };

  // --- MOTORUL DE MODULE ---
  const adaugaSectiune = (tip) => {
    let noua = { tip, titlu: '', text: '', imagineUrl: '', videoUrl: '', aliniere: 'stanga' };
    if (tip === 'tabel_comparativ') noua.randuri = [{ text: '', noi: true, altii: false }];
    if (tip === 'beneficii_procente') noua.puncte = [{ val: '98', desc: '' }];
    setFormData({ ...formData, sectiuniLanding: [...formData.sectiuniLanding, noua] });
  };

  const mutaSectiune = (index, directie) => {
    if ((directie === -1 && index === 0) || (directie === 1 && index === formData.sectiuniLanding.length - 1)) return;
    const copy = [...formData.sectiuniLanding];
    const temp = copy[index];
    copy[index] = copy[index + directie];
    copy[index + directie] = temp;
    setFormData({ ...formData, sectiuniLanding: copy });
  };

  const stergeSectiune = (index) => {
    const copy = [...formData.sectiuniLanding];
    copy.splice(index, 1);
    setFormData({ ...formData, sectiuniLanding: copy });
  };

  // --- SALVARE ---
  const handleSalvare = async () => {
    setIsSubmitting(true);
    
    const idCurat = typeof idProdus === 'object' && idProdus !== null ? idProdus._id : idProdus;
    const metoda = idCurat ? 'PUT' : 'POST';
    const url = idCurat ? `${API_URL}/api/produse/${idCurat}` : `${API_URL}/api/produse`;
    
    // 🛡️ Extragem datele sigure
    const { _id, __v, createdAt, updatedAt, ...dateDeTrimis } = formData;
    
    // FORȚĂM CONVERSIA LA NUMERE PENTRU OFERTE
    if (dateDeTrimis.oferte && dateDeTrimis.oferte.length > 0) {
      dateDeTrimis.oferte = dateDeTrimis.oferte.map(of => ({
        cantitate: Number(of.cantitate) || 1, 
        pret: Number(of.pret) || 0,
        text: of.text || ''
      }));
    }

    // Prima poză din galerie devine imaginea principală
    if (dateDeTrimis.galerieImagini && dateDeTrimis.galerieImagini.length > 0) {
      dateDeTrimis.imaginePrincipala = dateDeTrimis.galerieImagini[0];
    } else {
      dateDeTrimis.imaginePrincipala = '';
    }

    try {
      const res = await fetch(url, {
        method: metoda,
        headers: { 
          'Content-Type': 'application/json', 
          'Authorization': `Bearer ${token}` 
        },
        body: JSON.stringify(dateDeTrimis)
      });

      if (res.ok) { 
        alert("Boom! Produsul a fost salvat cu succes! 🚀"); 
        inapoiLaGestiune(); 
      } else {
        const errData = await res.json();
        alert(`Eroare la salvare: ${errData.eroare || errData.mesaj || "Necunoscută"}`);
      }
    } catch (err) { 
      console.error(err); 
      alert("Eroare de conexiune la server.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="admin-builder-view">
      
      {/* HEADER & NAVIGARE TAB-URI */}
      <div className="builder-header">
        <div className="tab-nav">
          <button className={activeTab === 'hero' ? 'active' : ''} onClick={() => setActiveTab('hero')}>
            <FiSettings /> 1. HERO (Prima Impresie)
          </button>
          <button className={activeTab === 'fomo' ? 'active' : ''} onClick={() => setActiveTab('fomo')}>
            <FiActivity /> 2. FOMO & Urgență
          </button>
          <button className={activeTab === 'builder' ? 'active' : ''} onClick={() => setActiveTab('builder')}>
            <FiLayout /> 3. Construcție Pagină
          </button>
        </div>
        <button className="btn-save-main" onClick={handleSalvare} disabled={isSubmitting}>
          {isSubmitting ? 'SE SALVEAZĂ...' : <><FiSave /> PUBLICĂ PAGINA</>}
        </button>
      </div>

      <div className="builder-body">
        
        {/* ==========================================
            TAB 1: HERO SECTION 
            ========================================== */}
        {activeTab === 'hero' && (
          <div className="builder-panel">
            <div className="editor-grid">
              
              <div className="editor-col">
                <label>Galerie Imagini Produs (Trage una sau mai multe)</label>
                
                <label
                    className="drop-zone"
                    onDragOver={preventDefault}
                    onDrop={e => {
                        preventDefault(e);
                        adaugaInGalerie(e.dataTransfer.files);
                    }}
                    style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center' }}
                >
                  <FiUploadCloud size={30} />
                  <p>Trage pozele aici sau <strong>Apasă pentru a alege</strong></p>
                  
                  {/* Input ascuns ca să poți alege din PC/Telefon */}
                  <input 
                    type="file" 
                    multiple 
                    accept="image/*" 
                    onChange={e => adaugaInGalerie(e.target.files)} 
                    style={{ display: 'none' }} 
                  />
                </label>

                {/* SLIDER-UL MAGIC */}
                {formData.galerieImagini && formData.galerieImagini.length > 0 && (
                  <div className="slider-wrapper">
                    {/* Săgeată Stânga */}
                    {formData.galerieImagini.length > 1 && (
                      <button
                        className="slider-nav-btn left"
                        onClick={(e) => { e.preventDefault(); setSlideIndex(slideIndex > 0 ? slideIndex - 1 : formData.galerieImagini.length - 1); }}
                      >
                        &#10094;
                      </button>
                    )}

                    <div className="slide-image-container">
                       <img src={formData.galerieImagini[slideIndex]} alt={`Slide ${slideIndex}`} />
                       <button
                         className="btn-delete-slide"
                         onClick={(e) => stergeDinGalerie(e, slideIndex)}
                       >
                         <FiX />
                       </button>
                    </div>

                    {/* Săgeată Dreapta */}
                    {formData.galerieImagini.length > 1 && (
                      <button
                        className="slider-nav-btn right"
                        onClick={(e) => { e.preventDefault(); setSlideIndex(slideIndex < formData.galerieImagini.length - 1 ? slideIndex + 1 : 0); }}
                      >
                        &#10095;
                      </button>
                    )}
                  </div>
                )}

                {/* THUMBNAILS (POZE MICI DE JOS) */}
                {formData.galerieImagini && formData.galerieImagini.length > 0 && (
                  <div className="galerie-thumbnails">
                    {formData.galerieImagini.map((img, idx) => (
                      <img
                          key={idx}
                          src={img}
                          className={`galerie-thumb ${idx === slideIndex ? 'active' : ''}`}
                          onClick={() => setSlideIndex(idx)}
                          alt="thumb"
                      />
                    ))}
                  </div>
                )}
              </div>
<div className="editor-col">
                <label>Dovadă Facebook (Screenshot)</label>
                
                {/* 1. Zona punctată de Drop (Rămâne mereu vizibilă sus, exact ca la galerie) */}
                <div 
                  className="drop-zone" 
                  onDragOver={preventDefault} 
                  onDrop={e => { preventDefault(e); handleFileDrop(e.dataTransfer.files[0], 'imagineFacebook'); }}
                >
                  <FiUploadCloud size={30} />
                  <p>Trage screenshot FB aici</p>
                </div>

                {/* 2. Poza afișată DEDESUBT, exact ca la galerie */}
                {formData.imagineFacebook && (
                  <div className="slider-wrapper">
                    <div className="slide-image-container">
                      <img src={formData.imagineFacebook} alt="FB" />
                      <button 
                        type="button"
                        className="btn-delete-slide"
                        onClick={(e) => { 
                          e.preventDefault(); 
                          e.stopPropagation(); 
                          setFormData(prev => ({ ...prev, imagineFacebook: '' })); 
                        }} 
                      >
                        <FiX />
                      </button>
                    </div>
                  </div>
                )}
              </div>


              <div className="editor-col full glass-box">
                <h3>Preț, Titlu și Categorie</h3>
                <div className="ac-form-group">
                  <label>Titlu Produs</label>
                  <input type="text" placeholder="Ex: Ceară Auto Ceramică 500ml" value={formData.nume} onChange={e => setFormData({...formData, nume: e.target.value})} />
                </div>

                <div className="row" style={{ marginTop: '15px', gap: '15px' }}>
                  <div style={{ flex: 1 }} className="ac-form-group">
                    <label>Categorie (Pentru Shop)</label>
                   <input 
                      list="lista-categorii"
                      type="text"
                      className="ac-select-premium"
                      style={{ padding: '14px', borderRadius: '10px', border: '2px solid #e5e7eb', width: '100%', fontSize: '1rem' }}
                      placeholder="Scrie o categorie nouă sau alege..."
                      value={formData.categorie || ''} 
                      onChange={e => setFormData({...formData, categorie: e.target.value})}
                    />
                    <datalist id="lista-categorii">
                      <option value="Auto" />
                      <option value="Electronice" />
                      <option value="Casa & Grădină" />
                      <option value="Sport" />
                    </datalist>
                  </div>
                </div>

                <div className="row" style={{ marginTop: '15px', gap: '15px' }}>
                  <div style={{ flex: 1 }} className="ac-form-group">
                    <label>Preț Nou (Lei)</label>
                    <input type="number" placeholder="Preț Nou" value={formData.pret} onChange={e => setFormData({...formData, pret: e.target.value})} />
                  </div>
                  <div style={{ flex: 1 }} className="ac-form-group">
                    <label>Preț Vechi (Lei)</label>
                    <input type="number" placeholder="Preț Vechi" value={formData.pretVechi} onChange={e => setFormData({...formData, pretVechi: e.target.value})} />
                  </div>
                </div>
              </div>

              {/* 🎁 SECȚIUNEA: PACHETE DINAMICE */}
              <div className="editor-col full glass-box">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                  <h3 style={{ margin: 0 }}>🎁 Pachete și Oferte Cantitate</h3>
                  <button 
                    className="btn-add-offer" 
                    onClick={() => setFormData({...formData, oferte: [...(formData.oferte || []), { cantitate: 1, pret: 0, text: '' }]})}
                    style={{ background: '#10b981', color: '#fff', border: 'none', padding: '8px 15px', borderRadius: '8px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '5px', fontWeight: 'bold' }}
                  >
                    <FiPlus /> Adaugă Ofertă
                  </button>
                </div>
                
                <div className="offers-builder-list" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {(formData.oferte || []).map((of, idx) => (
                    <div key={idx} className="offer-row-item" style={{ display: 'flex', gap: '10px', background: '#f8fafc', padding: '12px', borderRadius: '10px', border: '1px solid #e2e8f0', alignItems: 'flex-end' }}>
                      <div style={{ flex: '0 0 70px' }} className="ac-form-group">
                        <label style={{ fontSize: '10px' }}>Bucăți</label>
                        <input type="number" placeholder="1" value={of.cantitate} onChange={e => {
                          const oferteNoi = formData.oferte.map((item, i) => i === idx ? { ...item, cantitate: e.target.value } : item);
                          setFormData({...formData, oferte: oferteNoi});
                        }} />
                      </div>
                      <div style={{ flex: '0 0 100px' }} className="ac-form-group">
                        <label style={{ fontSize: '10px' }}>Preț Pachet</label>
                        <input type="number" placeholder="99" value={of.pret} onChange={e => {
                          const oferteNoi = formData.oferte.map((item, i) => i === idx ? { ...item, pret: e.target.value } : item);
                          setFormData({...formData, oferte: oferteNoi});
                        }} />
                      </div>
                      <div style={{ flex: 1 }} className="ac-form-group">
                        <label style={{ fontSize: '10px' }}>Text (ex: -10% Reducere)</label>
                        <input type="text" placeholder="Cea mai bună ofertă" value={of.text} onChange={e => {
                          const oferteNoi = formData.oferte.map((item, i) => i === idx ? { ...item, text: e.target.value } : item);
                          setFormData({...formData, oferte: oferteNoi});
                        }} />
                      </div>
                      <button 
                        onClick={() => { 
                          const oferteNoi = formData.oferte.filter((_, i) => i !== idx);
                          setFormData({...formData, oferte: oferteNoi});
                        }}
                        style={{ background: '#fee2e2', color: '#ef4444', border: 'none', padding: '10px', borderRadius: '8px', cursor: 'pointer' }}
                      >
                        <FiTrash2 />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

          

              <div className="editor-col full glass-box">
                <h3>Recenzia de sub Butonul de Comandă</h3>
                <div className="row">
                  <div className="mini-drop" title="Trage poza clientului aici" onDragOver={preventDefault} onDrop={e => { preventDefault(e); handleFileDrop(e.dataTransfer.files[0], '', ['heroRecenzie', 'imagine']); }} style={{ position: 'relative' }}>
                    {formData.heroRecenzie.imagine ? (
                      <>
                        <img src={formData.heroRecenzie.imagine} alt="Avatar" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                        <button type="button" onClick={(e) => { e.stopPropagation(); stergeImagine('', ['heroRecenzie', 'imagine']); }} style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', padding: '2px 5px', fontSize: '10px', cursor: 'pointer' }}><FiX /></button>
                      </>
                    ) : <FiImage />}
                  </div>
                  <input type="text" placeholder="Nume Client (Ex: Marian D.)" value={formData.heroRecenzie.nume} onChange={e => setFormData({...formData, heroRecenzie: {...formData.heroRecenzie, nume: e.target.value}})} />
                  <input type="number" min="1" max="5" placeholder="Stele (1-5)" value={formData.heroRecenzie.rating} onChange={e => setFormData({...formData, heroRecenzie: {...formData.heroRecenzie, rating: e.target.value}})} />
                </div>
                <textarea rows="3" placeholder="Scrie aici recenzia care va convinge clientul..." value={formData.heroRecenzie.text} onChange={e => setFormData({...formData, heroRecenzie: {...formData.heroRecenzie, text: e.target.value}})} />
              </div>
            </div>

            <div className="editor-col full glass-box">
                <h3>Cele 3 Beneficii Rapide (Lângă preț)</h3>
                <div className="row">
                  {formData.heroBeneficii.map((b, i) => (
                    <input key={i} type="text" placeholder={`Beneficiu ${i+1}`} value={b} onChange={e => {
                      const copy = [...formData.heroBeneficii]; 
                      copy[i] = e.target.value; 
                      setFormData({...formData, heroBeneficii: copy});
                    }} />
                  ))}
                </div>
              </div>

              
          </div>

          
        )}

        {/* ==========================================
            TAB 2: FOMO & MARKETING
            ========================================== */}
        {activeTab === 'fomo' && (
          <div className="builder-panel">
            <div className="editor-grid">
              <div className="editor-col glass-box">
                <h3>👥 Vizitatori Live (Notificarea de sus)</h3>
                <p className="hint">Setează un minim și un maxim.</p>
                <div className="row">
                  <input type="number" placeholder="Minim vizitatori" value={formData.vizitatoriLiveMin} onChange={e => setFormData({...formData, vizitatoriLiveMin: e.target.value})} />
                  <input type="number" placeholder="Maxim vizitatori" value={formData.vizitatoriLiveMax} onChange={e => setFormData({...formData, vizitatoriLiveMax: e.target.value})} />
                </div>
              </div>

              <div className="editor-col glass-box">
                <h3>⏳ Urgență și Stoc</h3>
                <p className="hint">Stocul afișat și minutele din cronometrul de sub buton.</p>
                <div className="row">
                  <input type="number" placeholder="Stoc Fictiv Afișat" value={formData.stocFictiv} onChange={e => setFormData({...formData, stocFictiv: e.target.value})} />
                  <input type="number" placeholder="Minute Cronometru" value={formData.minuteCountdown} onChange={e => setFormData({...formData, minuteCountdown: e.target.value})} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: MODULE PAGINĂ 
            ========================================== */}
        {activeTab === 'builder' && (
          <div className="builder-panel">
            <div className="toolbar">
              <button onClick={() => adaugaSectiune('text_imagine')}><FiImage /> + Img & Text</button>
              <button onClick={() => adaugaSectiune('tabel_comparativ')}><FiLayout /> + Tabel Comparație</button>
              <button onClick={() => adaugaSectiune('beneficii_procente')}><FiPercent /> + Procente</button>
              <button onClick={() => adaugaSectiune('video_promo')}><FiVideo /> + Video YouTube</button>
            </div>

            <div className="modules-container">
              {formData.sectiuniLanding.map((s, idx) => (
                <div key={idx} className="block-card">
                  <div className="block-header">
                    <div className="block-title">
                      <span className="badge">{s.tip.replace('_', ' ').toUpperCase()}</span>
                      <strong>Secțiunea {idx + 1}</strong>
                    </div>
                    <div className="block-actions">
                      <button title="Mută Sus" onClick={() => mutaSectiune(idx, -1)} disabled={idx === 0}><FiArrowUp /></button>
                      <button title="Mută Jos" onClick={() => mutaSectiune(idx, 1)} disabled={idx === formData.sectiuniLanding.length - 1}><FiArrowDown /></button>
                      <button className="btn-delete" onClick={() => stergeSectiune(idx)}><FiTrash2 /></button>
                    </div>
                  </div>

                  {s.tip === 'text_imagine' && (
                    <div className="module-edit-zone">
                      <input type="text" placeholder="Titlu Secțiune (Opțional)" value={s.titlu} onChange={e => {
                        const copy = structuredClone(formData.sectiuniLanding);
                        copy[idx].titlu = e.target.value; 
                        setFormData({...formData, sectiuniLanding: copy});
                      }} />
                      <textarea rows="3" placeholder="Text descriere" value={s.text} onChange={e => {
                        const copy = structuredClone(formData.sectiuniLanding);
                        copy[idx].text = e.target.value; 
                        setFormData({...formData, sectiuniLanding: copy});
                      }} />
                      <div className="row">
                        <div className="drop-zone mini" onDragOver={preventDefault} onDrop={e => { preventDefault(e); handleFileDrop(e.dataTransfer.files[0], '', ['sectiuniLanding', idx, 'imagineUrl']); }}>
                          {s.imagineUrl ? (
                            <div style={{ position: 'relative', display: 'inline-block' }}>
                              <img src={s.imagineUrl} alt="Sec" style={{ maxHeight: '100px' }} />
                              <button type="button" onClick={(e) => { e.stopPropagation(); stergeImagine('', ['sectiuniLanding', idx, 'imagineUrl']); }} style={{ position: 'absolute', top: '5px', right: '5px', background: '#ef4444', color: 'white', border: 'none', borderRadius: '50%', padding: '5px', cursor: 'pointer' }}><FiX /></button>
                            </div>
                          ) : <p>Trage imaginea</p>}
                        </div>
                        <select value={s.aliniere} onChange={e => {
                          const copy = structuredClone(formData.sectiuniLanding);
                          copy[idx].aliniere = e.target.value; 
                          setFormData({...formData, sectiuniLanding: copy});
                        }}>
                          <option value="stanga">Poza în Stânga</option>
                          <option value="dreapta">Poza în Dreapta</option>
                        </select>
                      </div>
                    </div>
                  )}

                  {s.tip === 'tabel_comparativ' && (
                    <div className="module-edit-zone">
                      {s.randuri.map((r, ri) => (
                        <div key={ri} className="table-row-edit">
                          <input type="text" placeholder="Scrie o caracteristică..." value={r.text} onChange={e => {
                            const copy = structuredClone(formData.sectiuniLanding);
                            copy[idx].randuri[ri].text = e.target.value; 
                            setFormData({...formData, sectiuniLanding: copy});
                          }} />
                          <button className={r.noi ? 'on' : ''} onClick={() => {
                            const copy = structuredClone(formData.sectiuniLanding);
                            copy[idx].randuri[ri].noi = !r.noi; 
                            setFormData({...formData, sectiuniLanding: copy});
                          }}>Noi: {r.noi ? 'DA' : 'NU'}</button>
                          <button className={r.altii ? 'on' : ''} onClick={() => {
                            const copy = structuredClone(formData.sectiuniLanding);
                            copy[idx].randuri[ri].altii = !r.altii; 
                            setFormData({...formData, sectiuniLanding: copy});
                          }}>Alții: {r.altii ? 'DA' : 'NU'}</button>
                          <button className="btn-del-mini" onClick={() => {
                            const copy = structuredClone(formData.sectiuniLanding);
                            copy[idx].randuri.splice(ri, 1); 
                            setFormData({...formData, sectiuniLanding: copy});
                          }}><FiX /></button>
                        </div>
                      ))}
                      <button className="add-sub" onClick={() => {
                        const copy = structuredClone(formData.sectiuniLanding);
                        copy[idx].randuri.push({text:'', noi:true, altii:false}); 
                        setFormData({...formData, sectiuniLanding: copy});
                      }}>+ Adaugă încă un rând în tabel</button>
                    </div>
                  )}

                  {s.tip === 'beneficii_procente' && (
                    <div className="module-edit-zone">
                      {s.puncte.map((p, pi) => (
                        <div key={pi} className="table-row-edit">
                          <input type="number" placeholder="%" value={p.val} onChange={e => {
                            const copy = structuredClone(formData.sectiuniLanding);
                            copy[idx].puncte[pi].val = e.target.value; 
                            setFormData({...formData, sectiuniLanding: copy});
                          }} />
                          <input type="text" placeholder="Ex: dintre clienți au văzut rezultate..." value={p.desc} onChange={e => {
                            const copy = structuredClone(formData.sectiuniLanding);
                            copy[idx].puncte[pi].desc = e.target.value; 
                            setFormData({...formData, sectiuniLanding: copy});
                          }} />
                          <button className="btn-del-mini" onClick={() => {
                            const copy = structuredClone(formData.sectiuniLanding);
                            copy[idx].puncte.splice(pi, 1); 
                            setFormData({...formData, sectiuniLanding: copy});
                          }}><FiX /></button>
                        </div>
                      ))}
                      <button className="add-sub" onClick={() => {
                        const copy = structuredClone(formData.sectiuniLanding);
                        copy[idx].puncte.push({val:'', desc:''}); 
                        setFormData({...formData, sectiuniLanding: copy});
                      }}>+ Adaugă încă un cerc procentual</button>
                    </div>
                  )}

                  {s.tip === 'video_promo' && (
                    <div className="module-edit-zone">
                      <input type="text" placeholder="URL Video YouTube (ex: https://youtube.com/watch?v=...)" value={s.videoUrl} onChange={e => {
                        const copy = structuredClone(formData.sectiuniLanding);
                        copy[idx].videoUrl = e.target.value; 
                        setFormData({...formData, sectiuniLanding: copy});
                      }} />
                      <input type="text" placeholder="Titlu deasupra clipului" value={s.titlu} onChange={e => {
                        const copy = structuredClone(formData.sectiuniLanding);
                        copy[idx].titlu = e.target.value; 
                        setFormData({...formData, sectiuniLanding: copy});
                      }} />
                    </div>
                  )}

                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ConstructorProdus;