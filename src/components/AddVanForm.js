import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { X, Upload, Trash2, CheckCircle } from 'lucide-react';
import { uploadToCloudinary } from '../cloudinaryConfig';


export default function AddVanForm({ onClose, onSuccess, onVanAdded, editMode = false, vanData = null }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingIndex, setUploadingIndex] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    region: 'North Island',
    year: new Date().getFullYear(),
    mileage: '',
    type: 'Van',
    description: '',
    capacity: 2,
    selfContained: false,
    selfContainedType: 'green',
    featured: false,
    buyBack: false,
    buyBackPrice: '',
    buyBackDuration: '3',
    buyBackMaxKm: '',
    buyBackConditions: '',
    equipment: {
      // 🛏️ Sleeping - Essential
      doubleBed: false,
      singleBeds: false,
      roofBed: false,
      bedding: false,
      curtains: false,
      // 🍳 Kitchen - Essential
      fridge: false,
      gasStove: false,
      sink: false,
      cookware: false,
      // 💧 Water & Bathroom - Essential for self-contained
      freshWaterTank: false,
      greyWaterTank: false,
      outdoorShower: false,
      indoorShower: false,
      toilet: false,
      portaPotti: false,
      // ⚡ Power - Very important for backpackers
      solarPanel: false,
      leisureBattery: false,
      splitCharger: false,
      inverter: false,
      usb: false,
      ledLights: false,
      // 🌡️ Comfort - Important in NZ climate
      heater: false,
      dieselHeater: false,
      roofFan: false,
      insulation: false,
      awning: false,
      // 🚗 Vehicle Features
      reverseCamera: false,
      bluetooth: false,
      swivelSeats: false,
      bikeRack: false,
      surfRack: false,
    },
    wofExpiry: '',
    regoExpiry: '',
    customFeatures: ''
  });

  // Charger les données du van en mode édition
  useEffect(() => {
    if (editMode && vanData) {
      // Default equipment object - Simplified for backpackers
      const defaultEquipment = {
        // Sleeping
        doubleBed: false, singleBeds: false, roofBed: false, bedding: false, curtains: false,
        // Kitchen
        fridge: false, gasStove: false, sink: false, cookware: false,
        // Water & Bathroom
        freshWaterTank: false, greyWaterTank: false,
        outdoorShower: false, indoorShower: false, toilet: false, portaPotti: false,
        // Power
        solarPanel: false, leisureBattery: false, splitCharger: false, inverter: false,
        usb: false, ledLights: false,
        // Comfort
        heater: false, dieselHeater: false, roofFan: false, insulation: false, awning: false,
        // Vehicle
        reverseCamera: false, bluetooth: false, swivelSeats: false, bikeRack: false, surfRack: false
      };

      setFormData({
        title: vanData.title || '',
        price: vanData.price?.toString() || '',
        location: vanData.location || '',
        region: vanData.region || 'North Island',
        year: vanData.year || new Date().getFullYear(),
        mileage: vanData.mileage?.toString() || '',
        type: vanData.type || 'Van',
        description: vanData.description || '',
        capacity: vanData.capacity || 2,
        selfContained: vanData.selfContained || false,
        selfContainedType: vanData.selfContainedType || 'green',
        featured: vanData.featured || false,
        buyBack: vanData.buyBack || false,
        buyBackPrice: vanData.buyBackPrice?.toString() || '',
        buyBackDuration: vanData.buyBackDuration?.toString() || '3',
        buyBackMaxKm: vanData.buyBackMaxKm?.toString() || '',
        buyBackConditions: vanData.buyBackConditions || '',
        equipment: { ...defaultEquipment, ...(vanData.equipment || {}) },
        wofExpiry: vanData.wofExpiry ? vanData.wofExpiry.split('T')[0] : '',
        regoExpiry: vanData.regoExpiry ? vanData.regoExpiry.split('T')[0] : '',
        customFeatures: vanData.customFeatures || ''
      });
      
      // Charger les images existantes
      if (vanData.images && vanData.images.length > 0) {
        setImages(vanData.images.map(url => ({ url, uploading: false })));
      } else if (vanData.imageUrl) {
        setImages([{ url: vanData.imageUrl, uploading: false }]);
      }
    }
  }, [editMode, vanData]);

  // États pour les tooltips
  const [showBuyBackTooltip, setShowBuyBackTooltip] = useState(false);
  const [showWofTooltip, setShowWofTooltip] = useState(false);
  const [showRegoTooltip, setShowRegoTooltip] = useState(false);
  const [showSelfContainedTooltip, setShowSelfContainedTooltip] = useState(false);
  const [showAdvancedEquipment, setShowAdvancedEquipment] = useState(false);

  // Upload image
  const handleImageUpload = async (file) => {
    if (images.length >= 5) {
      alert('⚠️ Maximum 5 photos!');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('⚠️ Invalid file!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('⚠️ Image too large (max 10MB)');
      return;
    }

    const newIndex = images.length;
    setUploadingIndex(newIndex);

    // Instant local preview
    const reader = new FileReader();
    reader.onload = (e) => {
      setImages(prev => [...prev, { url: e.target.result, uploading: true }]);
    };
    reader.readAsDataURL(file);

    try {
      const result = await uploadToCloudinary(file);
      
      setImages(prev => {
        const updated = [...prev];
        updated[newIndex] = { url: result.url, uploading: false };
        return updated;
      });
    } catch (error) {
      console.error('Upload error:', error);
      setImages(prev => prev.filter((_, i) => i !== newIndex));
      alert('❌ Upload error');
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // 🛡️ SÉCURITÉ: Vérifier que l'utilisateur est connecté
    if (!currentUser) {
      alert('⚠️ Please sign in to add a van!');
      return;
    }

    // 🛡️ SÉCURITÉ: Limiter à 20 vans par utilisateur (anti-spam)
    if (!editMode) {
      try {
        const userVansQuery = query(
          collection(db, 'vans'),
          where('seller.uid', '==', currentUser.uid)
        );
        const userVansSnapshot = await getDocs(userVansQuery);
        const userVanCount = userVansSnapshot.size;
        
        if (userVanCount >= 20) {
          const upgrade = window.confirm(
            '🚐 You have reached the maximum of 20 free listings!\n\n' +
            '💼 Need more? Upgrade to a Pro account for unlimited listings.\n\n' +
            'Click OK to contact us about Pro accounts.'
          );
          if (upgrade) {
            window.location.href = 'mailto:kiwivanmarket.contact@gmail.com?subject=Pro%20Account%20Request&body=Hi,%20I%20would%20like%20to%20upgrade%20to%20a%20Pro%20account%20for%20unlimited%20listings.';
          }
          return;
        }
      } catch (error) {
        console.error('Error checking user van count:', error);
      }
    }

    // 🛡️ VALIDATION COMPLÈTE avec messages d'erreur détaillés
    const errors = [];
    
    // Photos
    if (images.length === 0) {
      errors.push('📸 At least 1 photo is required');
    }
    
    // Titre (min 3 caractères)
    if (!formData.title) {
      errors.push('📝 Title is required');
    } else if (formData.title.length < 3) {
      errors.push('📝 Title must be at least 3 characters');
    }
    
    // Prix
    if (!formData.price) {
      errors.push('💰 Price is required');
    } else if (parseInt(formData.price) < 1 || parseInt(formData.price) > 500000) {
      errors.push('💰 Price must be between $1 and $500,000');
    }
    
    // Ville
    if (!formData.location) {
      errors.push('📍 City is required');
    }
    
    // Année
    if (!formData.year) {
      errors.push('📅 Year is required');
    } else if (parseInt(formData.year) < 1950 || parseInt(formData.year) > 2026) {
      errors.push('📅 Year must be between 1950 and 2026');
    }
    
    // Kilométrage
    if (!formData.mileage && formData.mileage !== 0) {
      errors.push('🛣️ Mileage is required');
    }
    
    // WOF & REGO
    if (!formData.wofExpiry) {
      errors.push('🔧 WOF expiry date is required');
    }
    if (!formData.regoExpiry) {
      errors.push('📋 REGO expiry date is required');
    }
    
    // Description (min 10 caractères)
    if (!formData.description) {
      errors.push('✏️ Description is required');
    } else if (formData.description.length < 10) {
      errors.push('✏️ Description must be at least 10 characters (currently ' + formData.description.length + ')');
    }
    
    // Buy-back
    if (formData.buyBack && !formData.buyBackPrice) {
      errors.push('🛡️ Buy-back price is required when buy-back is enabled');
    }
    
    // Afficher les erreurs
    if (errors.length > 0) {
      alert('⚠️ Please fix the following errors:\n\n' + errors.join('\n'));
      return;
    }

    setLoading(true);

    try {
      const imageUrls = images.map(img => img.url);

      if (editMode && vanData) {
        // MODE ÉDITION - Update existing van
        const updateData = {
          title: formData.title,
          price: parseInt(formData.price),
          location: formData.location,
          region: formData.region,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          type: formData.type,
          description: formData.description,
          capacity: parseInt(formData.capacity),
          selfContained: formData.selfContained,
          selfContainedType: formData.selfContained ? formData.selfContainedType : null,
          equipment: formData.equipment,
          buyBack: formData.buyBack,
          buyBackPrice: formData.buyBack ? parseInt(formData.buyBackPrice) || 0 : null,
          buyBackDuration: formData.buyBack ? parseInt(formData.buyBackDuration) : null,
          buyBackMaxKm: formData.buyBack && formData.buyBackMaxKm ? parseInt(formData.buyBackMaxKm) : null,
          buyBackConditions: formData.buyBack ? formData.buyBackConditions : '',
          wofExpiry: formData.wofExpiry,
          regoExpiry: formData.regoExpiry,
          customFeatures: formData.customFeatures || '',
          imageUrl: imageUrls[0],
          images: imageUrls,
          updatedAt: new Date()
        };

        await updateDoc(doc(db, 'vans', vanData.id), updateData);

        localStorage.removeItem('kiwiVanMarket_vans');
        localStorage.removeItem('kiwiVanMarket_timestamp');

        alert('✅ Van updated successfully!');
        onVanAdded && onVanAdded();
        onClose();
        
      } else {
        // MODE CRÉATION - Add new van
        const newVanData = {
          title: formData.title,
          price: parseInt(formData.price),
          location: formData.location,
          region: formData.region,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          type: formData.type,
          description: formData.description,
          capacity: parseInt(formData.capacity),
          selfContained: formData.selfContained,
          selfContainedType: formData.selfContained ? formData.selfContainedType : null,
          equipment: formData.equipment,
          buyBack: formData.buyBack,
          buyBackPrice: formData.buyBack ? parseInt(formData.buyBackPrice) || 0 : null,
          buyBackDuration: formData.buyBack ? parseInt(formData.buyBackDuration) : null,
          buyBackMaxKm: formData.buyBack && formData.buyBackMaxKm ? parseInt(formData.buyBackMaxKm) : null,
          buyBackConditions: formData.buyBack ? formData.buyBackConditions : '',
          wofExpiry: formData.wofExpiry,
          regoExpiry: formData.regoExpiry,
          customFeatures: formData.customFeatures || '',
          imageUrl: imageUrls[0],
          images: imageUrls,
          seller: {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Anonymous',
            email: currentUser.email,
            rating: 5,
            phone: 'Not provided'
          },
          views: 0,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: new Date()
        };

        await addDoc(collection(db, 'vans'), newVanData);

        localStorage.removeItem('kiwiVanMarket_vans');
        localStorage.removeItem('kiwiVanMarket_timestamp');

        alert('✅ Van added successfully!');
        onSuccess && onSuccess();
        onClose();
        window.location.reload();
      }
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Error adding van');
    } finally {
      setLoading(false);
    }
  };

  // Composant Tooltip réutilisable
  const InfoTooltip = ({ show, onMouseEnter, onMouseLeave, title, emoji, children }) => (
    <div className="relative inline-block">
      <div 
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        className="bg-gray-200 hover:bg-emerald-500 hover:text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold text-gray-600 cursor-help transition ml-1">
        ?
      </div>
      {show && (
        <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-50">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-emerald-400 font-bold">{emoji} {title}</span>
          </div>
          <p className="text-gray-300 leading-relaxed text-xs">
            {children}
          </p>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        
        <button 
          onClick={onClose}
          className="absolute top-6 right-6 bg-white rounded-full p-3 shadow-xl z-[70] hover:bg-gray-100 transition-all hover:scale-110">
          <X size={24} />
        </button>

        <div className="p-8 lg:p-10">
          <h2 className="text-3xl font-black text-gray-900 mb-2">
            {editMode ? '✏️ Edit Van' : '🚐 Add New Van'}
          </h2>
          <p className="text-gray-600 mb-8">
            {editMode ? 'Update your van details' : 'Upload photos and fill in details'}
          </p>

          <form onSubmit={handleSubmit}>
            
            {/* PHOTOS SECTION */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Photos ({images.length}/5)
              </h3>

              {/* Photo grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-lg">
                      <img 
                        src={image.url} 
                        alt={`Photo ${index + 1}`}
                        className="w-full h-full object-cover"
                      />
                      {image.uploading && (
                        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                        </div>
                      )}
                      {!image.uploading && (
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg">
                          <CheckCircle size={16} />
                        </div>
                      )}
                    </div>
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg">
                        Primary
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {/* Add button */}
                {images.length < 5 && (
                  <label className="aspect-video bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-100 transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => e.target.files[0] && handleImageUpload(e.target.files[0])}
                      className="hidden"
                      disabled={uploadingIndex !== null}
                    />
                    {uploadingIndex === images.length ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    ) : (
                      <>
                        <Upload size={32} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-emerald-700">
                          Upload Photo
                        </span>
                        <span className="text-xs text-gray-500 mt-1">
                          Click to browse
                        </span>
                      </>
                    )}
                  </label>
                )}
              </div>

              {images.length === 0 && (
                <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2">
                  <span>⚠️</span>
                  <span>At least 1 photo required</span>
                </p>
              )}
            </div>

            {/* BASIC INFO */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Title * <span className="font-normal text-gray-400">(min 3 chars)</span>
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Toyota Hiace 2015"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${
                    formData.title && formData.title.length < 3 
                      ? 'border-red-300 focus:border-red-500' 
                      : 'border-gray-200 focus:border-emerald-500'
                  }`}
                  required
                />
                {formData.title && formData.title.length < 3 && (
                  <p className="text-xs text-red-500 mt-1">⚠️ {formData.title.length}/3 characters minimum</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (NZ$) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({...formData, price: e.target.value})}
                  placeholder="18500"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                >
                  <option value="">Select a city...</option>
                  <option value="Auckland">Auckland</option>
                  <option value="Wellington">Wellington</option>
                  <option value="Christchurch">Christchurch</option>
                  <option value="Queenstown">Queenstown</option>
                  <option value="Rotorua">Rotorua</option>
                  <option value="Tauranga">Tauranga</option>
                  <option value="Hamilton">Hamilton</option>
                  <option value="Dunedin">Dunedin</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Region *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors">
                  <option>North Island</option>
                  <option>South Island</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Year *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage *</label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({...formData, mileage: e.target.value})}
                  placeholder="145000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors">
                  <option value="Car">🚗 Car</option>
                  <option value="Van">🚐 Van</option>
                  <option value="Motorhome">🚌 Motorhome</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>

              {/* WOF Expiry avec tooltip */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  WOF Expiry *
                  <InfoTooltip 
                    show={showWofTooltip}
                    onMouseEnter={() => setShowWofTooltip(true)}
                    onMouseLeave={() => setShowWofTooltip(false)}
                    title="Warrant of Fitness"
                    emoji="🔧"
                  >
                    A <span className="text-white font-semibold">safety inspection</span> required every 6-12 months for all vehicles in NZ. 
                    It checks brakes, lights, tyres, steering and other safety features. 
                    <span className="text-white font-semibold"> You can't legally drive without a valid WOF!</span>
                  </InfoTooltip>
                </label>
                <input
                  type="date"
                  value={formData.wofExpiry}
                  onChange={(e) => setFormData({...formData, wofExpiry: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              {/* REGO Expiry avec tooltip */}
              <div>
                <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                  REGO Expiry *
                  <InfoTooltip 
                    show={showRegoTooltip}
                    onMouseEnter={() => setShowRegoTooltip(true)}
                    onMouseLeave={() => setShowRegoTooltip(false)}
                    title="Vehicle Registration"
                    emoji="📋"
                  >
                    <span className="text-white font-semibold">Registration fee</span> that must be paid to legally drive on NZ roads. 
                    Can be bought in 3, 6 or 12 month periods at any PostShop or online. 
                    <span className="text-white font-semibold"> Check the sticker on the windscreen!</span>
                  </InfoTooltip>
                </label>
                <input
                  type="date"
                  value={formData.regoExpiry}
                  onChange={(e) => setFormData({...formData, regoExpiry: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>
            </div>

            {/* DESCRIPTION */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Description * <span className="font-normal text-gray-400">(min 10 chars)</span>
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Perfect backpacker van, well maintained, ready for adventure..."
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${
                  formData.description && formData.description.length < 10 
                    ? 'border-red-300 focus:border-red-500' 
                    : 'border-gray-200 focus:border-emerald-500'
                }`}
                required
              />
              <div className="flex justify-between mt-1">
                {formData.description && formData.description.length < 10 ? (
                  <p className="text-xs text-red-500">⚠️ {formData.description.length}/10 characters minimum</p>
                ) : (
                  <p className="text-xs text-gray-400">{formData.description.length || 0} characters</p>
                )}
              </div>
            </div>

            {/* EQUIPMENT - Simplifié */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">🔧 Equipment & Features</label>
              
              {/* ESSENTIELS - Toujours visible */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl mb-4">
                <h4 className="text-sm font-bold text-emerald-700 mb-3">✨ Key Features <span className="font-normal text-emerald-600">(most searched by buyers)</span></h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.doubleBed} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, doubleBed: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">🛏️ Double Bed</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.fridge} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, fridge: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">🧊 Fridge</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.gasStove} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, gasStove: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">🔥 Gas Stove</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.sink} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, sink: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">🚰 Sink</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.toilet} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, toilet: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">🚽 Toilet</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.solarPanel} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, solarPanel: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">☀️ Solar Panel</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.leisureBattery} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, leisureBattery: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">🔋 Leisure Battery</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.dieselHeater || formData.equipment.heater} 
                      onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, heater: e.target.checked}})}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">🌡️ Heater</span>
                  </label>
                </div>
              </div>

              {/* BOUTON MORE OPTIONS */}
              <button
                type="button"
                onClick={() => setShowAdvancedEquipment(!showAdvancedEquipment)}
                className="w-full py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-600 transition flex items-center justify-center gap-2 mb-4"
              >
                {showAdvancedEquipment ? '➖ Less options' : '➕ More options'}
              </button>

              {/* OPTIONS AVANCÉES - Simplifiées pour backpackers */}
              {showAdvancedEquipment && (
                <div className="space-y-4 mb-4">
                  
                  {/* 🛏️ Sleeping */}
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-600 mb-2">🛏️ Sleeping</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.singleBeds} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, singleBeds: e.target.checked}})}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        Single Beds
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.roofBed} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, roofBed: e.target.checked}})}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        Pop-top / Roof Bed
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.bedding} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, bedding: e.target.checked}})}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        Bedding Included
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.curtains} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, curtains: e.target.checked}})}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        Privacy Curtains
                      </label>
                    </div>
                  </div>

                  {/* 🍳 Kitchen */}
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <h4 className="text-xs font-bold text-orange-600 mb-2">🍳 Kitchen</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-orange-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.cookware} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, cookware: e.target.checked}})}
                          className="w-4 h-4 text-orange-600 rounded" />
                        Pots, Pans & Utensils
                      </label>
                    </div>
                  </div>

                  {/* 💧 Water & Bathroom */}
                  <div className="p-3 bg-cyan-50 rounded-xl">
                    <h4 className="text-xs font-bold text-cyan-600 mb-2">💧 Water & Bathroom</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.freshWaterTank} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, freshWaterTank: e.target.checked}})}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        Fresh Water Tank
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.greyWaterTank} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, greyWaterTank: e.target.checked}})}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        Grey Water Tank
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.outdoorShower} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, outdoorShower: e.target.checked}})}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        Outdoor Shower
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.indoorShower} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, indoorShower: e.target.checked}})}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        Indoor Shower
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.portaPotti} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, portaPotti: e.target.checked}})}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        Porta Potti
                      </label>
                    </div>
                  </div>

                  {/* ⚡ Power */}
                  <div className="p-3 bg-yellow-50 rounded-xl">
                    <h4 className="text-xs font-bold text-yellow-600 mb-2">⚡ Power</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.splitCharger} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, splitCharger: e.target.checked}})}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        Charges While Driving
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.inverter} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, inverter: e.target.checked}})}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        230V Inverter
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.usb} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, usb: e.target.checked}})}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        USB Charging Ports
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.ledLights} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, ledLights: e.target.checked}})}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        LED Lights
                      </label>
                    </div>
                  </div>

                  {/* 🌡️ Comfort */}
                  <div className="p-3 bg-rose-50 rounded-xl">
                    <h4 className="text-xs font-bold text-rose-600 mb-2">🌡️ Comfort</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.dieselHeater} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, dieselHeater: e.target.checked}})}
                          className="w-4 h-4 text-rose-600 rounded" />
                        🔥 Diesel Heater (Webasto)
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.roofFan} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, roofFan: e.target.checked}})}
                          className="w-4 h-4 text-rose-600 rounded" />
                        Roof Vent / Fan
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.insulation} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, insulation: e.target.checked}})}
                          className="w-4 h-4 text-rose-600 rounded" />
                        Insulated
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.awning} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, awning: e.target.checked}})}
                          className="w-4 h-4 text-rose-600 rounded" />
                        Awning
                      </label>
                    </div>
                  </div>

                  {/* 🚗 Vehicle */}
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <h4 className="text-xs font-bold text-gray-600 mb-2">🚗 Vehicle</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.reverseCamera} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, reverseCamera: e.target.checked}})}
                          className="w-4 h-4 text-gray-600 rounded" />
                        Reverse Camera
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.bluetooth} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, bluetooth: e.target.checked}})}
                          className="w-4 h-4 text-gray-600 rounded" />
                        Bluetooth Audio
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.swivelSeats} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, swivelSeats: e.target.checked}})}
                          className="w-4 h-4 text-gray-600 rounded" />
                        Swivel Front Seats
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.bikeRack} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, bikeRack: e.target.checked}})}
                          className="w-4 h-4 text-gray-600 rounded" />
                        Bike Rack
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.surfRack} 
                          onChange={(e) => setFormData({...formData, equipment: {...formData.equipment, surfRack: e.target.checked}})}
                          className="w-4 h-4 text-gray-600 rounded" />
                        Surf / Kayak Rack
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAMP LIBRE - Autres équipements */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  ✏️ Other features <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.customFeatures || ''}
                  onChange={(e) => setFormData({...formData, customFeatures: e.target.value})}
                  placeholder="e.g. Surfboard rack, Kayak holder, TV, Coffee machine..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">Add anything special not listed above</p>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">📋 Certifications & Options</label>
              <div className="space-y-3">
                
                {/* Self-Contained avec tooltip */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selfContained}
                        onChange={(e) => setFormData({...formData, selfContained: e.target.checked})}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-700">Self-Contained Certified</span>
                    </label>
                    {/* Tooltip Self-Contained */}
                    <InfoTooltip 
                      show={showSelfContainedTooltip}
                      onMouseEnter={() => setShowSelfContainedTooltip(true)}
                      onMouseLeave={() => setShowSelfContainedTooltip(false)}
                      title="Self-Contained"
                      emoji="🏕️"
                    >
                      A certified van with <span className="text-white font-semibold">toilet, fresh water tank & grey water tank</span>. 
                      Required for freedom camping in most areas of NZ. 
                      <span className="text-green-400 font-semibold"> Green sticker</span> = fixed toilet. 
                      <span className="text-blue-400 font-semibold"> Blue sticker</span> = porta-potty allowed.
                      <span className="text-white font-semibold"> Essential for free camping!</span>
                    </InfoTooltip>
                  </div>
                  
                  {/* Choix Vert ou Bleu si coché */}
                  {formData.selfContained && (
                    <div className="mt-3 ml-8 flex gap-4 flex-wrap">
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition ${
                        formData.selfContainedType === 'green' 
                          ? 'border-green-500 bg-green-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="selfContainedType" value="green"
                          checked={formData.selfContainedType === 'green'}
                          onChange={(e) => setFormData({...formData, selfContainedType: e.target.value})}
                          className="hidden" />
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <div>
                          <span className="font-semibold text-green-700">Green Sticker</span>
                          <p className="text-xs text-gray-500">Fixed toilet</p>
                        </div>
                      </label>
                      
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition ${
                        formData.selfContainedType === 'blue' 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300'
                      }`}>
                        <input type="radio" name="selfContainedType" value="blue"
                          checked={formData.selfContainedType === 'blue'}
                          onChange={(e) => setFormData({...formData, selfContainedType: e.target.value})}
                          className="hidden" />
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">✓</span>
                        </div>
                        <div>
                          <span className="font-semibold text-blue-700">Blue Sticker</span>
                          <p className="text-xs text-gray-500">Porta-potty allowed</p>
                        </div>
                      </label>
                    </div>
                  )}
                </div>

                {/* Buy-Back avec tooltip */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.buyBack}
                        onChange={(e) => setFormData({...formData, buyBack: e.target.checked})}
                        className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                      />
                      <span className="font-medium text-gray-700">Buy-Back Available</span>
                    </label>
                    {/* Tooltip Buy-Back */}
                    <InfoTooltip 
                      show={showBuyBackTooltip}
                      onMouseEnter={() => setShowBuyBackTooltip(true)}
                      onMouseLeave={() => setShowBuyBackTooltip(false)}
                      title="Buy-Back Guarantee"
                      emoji="🛡️"
                    >
                      Offer to buy back the van at an agreed price if the buyer returns it within a specified period. 
                      <span className="text-white font-semibold"> Great for attracting backpackers!</span>
                    </InfoTooltip>
                  </div>

                {/* Options Buy-Back (affichées si coché) */}
                {formData.buyBack && (
                  <div className="ml-8 mt-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl space-y-4">
                    <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                      🛡️ Buy-Back Details
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Guaranteed Buy-Back Price (NZ$) *
                        </label>
                        <input
                          type="number"
                          value={formData.buyBackPrice}
                          onChange={(e) => setFormData({...formData, buyBackPrice: e.target.value})}
                          placeholder="e.g. 10000"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                          required={formData.buyBack}
                        />
                        <p className="text-xs text-gray-500 mt-1">Price you'll pay to buy back the van</p>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Valid For *
                        </label>
                        <select
                          value={formData.buyBackDuration}
                          onChange={(e) => setFormData({...formData, buyBackDuration: e.target.value})}
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        >
                          <option value="1">1 month</option>
                          <option value="2">2 months</option>
                          <option value="3">3 months</option>
                          <option value="6">6 months</option>
                          <option value="12">12 months</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-2">
                          Maximum Kilometers
                        </label>
                        <input
                          type="number"
                          value={formData.buyBackMaxKm}
                          onChange={(e) => setFormData({...formData, buyBackMaxKm: e.target.value})}
                          placeholder="e.g. 10000"
                          className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                        />
                        <p className="text-xs text-gray-500 mt-1">Max km buyer can add (leave empty for unlimited)</p>
                      </div>
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 mb-2">
                        Additional Conditions
                      </label>
                      <textarea
                        value={formData.buyBackConditions}
                        onChange={(e) => setFormData({...formData, buyBackConditions: e.target.value})}
                        placeholder="e.g. No major damage, regular maintenance required, must return in Auckland..."
                        rows={3}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                      />
                    </div>
                  </div>
                )}
                </div>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading 
                  ? (editMode ? '⏳ Saving...' : '⏳ Adding...') 
                  : (editMode ? '✅ Save Changes' : '✅ Add Van')
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}