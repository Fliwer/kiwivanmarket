import React, { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { collection, addDoc, doc, updateDoc, getDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions, auth } from '../firebase';
import { useAuth } from '../AuthContext';
import { X, Upload, Trash2, CheckCircle, Shield, Phone } from 'lucide-react';
import { uploadToCloudinary, compressImage } from '../cloudinaryConfig';
import { sanitizeString, sanitizeText } from '../securityUtils';
import { useToast } from './ToastProvider';

// Helper pour convertir les dates Firestore (Timestamp) en format input HTML
const formatDateForInput = (date) => {
  if (!date) return '';
  // Firestore Timestamp
  if (date.toDate) return date.toDate().toISOString().split('T')[0];
  // String ISO
  if (typeof date === 'string') return date.split('T')[0];
  // JavaScript Date
  if (date instanceof Date) return date.toISOString().split('T')[0];
  return '';
};


export default function AddVanForm({ onClose, onSuccess, onVanAdded, isEditMode = false, van = null, focusPlate = false }) {
  const { t } = useTranslation();
  const { currentUser, resendVerificationEmail } = useAuth();
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const plateInputRef = useRef(null);
  const [imageCrops, setImageCrops] = useState([]);

  const [formData, setFormData] = useState({
    title: '',
    price: '',
    location: '',
    region: 'North Island',
    year: new Date().getFullYear(),
    mileage: '',
    type: 'Van',
    fuelType: 'petrol',
    transmission: 'manual',
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
      //  Sleeping - Essential
      doubleBed: false,
      singleBeds: false,
      roofBed: false,
      bedding: false,
      curtains: false,
      //  Kitchen - Essential
      fridge: false,
      gasStove: false,
      sink: false,
      cookware: false,
      //  Water & Bathroom - Essential for self-contained
      freshWaterTank: false,
      greyWaterTank: false,
      outdoorShower: false,
      indoorShower: false,
      toilet: false,
      portaPotti: false,
      //  Power - Very important for backpackers
      solarPanel: false,
      leisureBattery: false,
      splitCharger: false,
      inverter: false,
      usb: false,
      ledLights: false,
      //  Comfort - Important in NZ climate
      heater: false,
      dieselHeater: false,
      roofFan: false,
      insulation: false,
      awning: false,
      //  Vehicle Features
      reverseCamera: false,
      bluetooth: false,
      swivelSeats: false,
      bikeRack: false,
      surfRack: false,
    },
    wofExpiry: '',
    regoExpiry: '',
    imageFocusX: 50,
    imageFocusY: 50,
    imageZoom: 1,
    customFeatures: '',
    sellerWhatsApp: '',
    sellerPhone: '',
    plateNumber: ''
  });

  //  Fermeture avec touche Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [onClose]);

  // Charger les données du van en mode édition
  useEffect(() => {
    const loadData = async () => {
      if (isEditMode && van) {
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
          title: van.title || '',
          price: van.price?.toString() || '',
          location: van.location || '',
          region: van.region || 'North Island',
          year: van.year || new Date().getFullYear(),
          mileage: van.mileage?.toString() || '',
          type: van.type || 'Van',
          fuelType: van.fuelType || 'petrol',
          transmission: van.transmission || 'manual',
          description: van.description || '',
          capacity: van.capacity || 2,
          selfContained: van.selfContained || false,
          selfContainedType: van.selfContainedType || 'green',
          featured: van.featured || false,
          buyBack: van.buyBack || false,
          buyBackPrice: van.buyBackPrice?.toString() || '',
          buyBackDuration: van.buyBackDuration?.toString() || '3',
          buyBackMaxKm: van.buyBackMaxKm?.toString() || '',
          buyBackConditions: van.buyBackConditions || '',
          equipment: { ...defaultEquipment, ...(van.equipment || {}) },
          wofExpiry: formatDateForInput(van.wofExpiry),
          regoExpiry: formatDateForInput(van.regoExpiry),
          imageFocusX: Number.isFinite(Number(van.imageFocusX)) ? Number(van.imageFocusX) : 50,
          imageFocusY: Number.isFinite(Number(van.imageFocusY)) ? Number(van.imageFocusY) : 50,
          imageZoom: Number.isFinite(Number(van.imageZoom)) ? Math.max(1, Math.min(2, Number(van.imageZoom))) : 1,
          customFeatures: van.customFeatures || '',
          sellerWhatsApp: van.seller?.whatsapp || van.seller?.phone || '',
          sellerPhone: van.seller?.phone || '',
          plateNumber: van.plateNumber || ''
        });

        // Charger les images existantes
        if (van.images && van.images.length > 0) {
          setImages(van.images.map(url => ({ url, uploading: false })));
          const loadedCrops = van.images.map((_, index) => {
            const saved = Array.isArray(van.imageCrops) ? van.imageCrops[index] : null;
            if (saved) {
              return {
                x: Number.isFinite(Number(saved.x)) ? Number(saved.x) : 50,
                y: Number.isFinite(Number(saved.y)) ? Number(saved.y) : 50,
                zoom: Number.isFinite(Number(saved.zoom)) ? Math.max(1, Math.min(2, Number(saved.zoom))) : 1
              };
            }
            if (index === 0) {
              return {
                x: Number.isFinite(Number(van.imageFocusX)) ? Number(van.imageFocusX) : 50,
                y: Number.isFinite(Number(van.imageFocusY)) ? Number(van.imageFocusY) : 50,
                zoom: Number.isFinite(Number(van.imageZoom)) ? Math.max(1, Math.min(2, Number(van.imageZoom))) : 1
              };
            }
            return { x: 50, y: 50, zoom: 1 };
          });
          setImageCrops(loadedCrops);
        } else if (van.imageUrl) {
          setImages([{ url: van.imageUrl, uploading: false }]);
          setImageCrops([{
            x: Number.isFinite(Number(van.imageFocusX)) ? Number(van.imageFocusX) : 50,
            y: Number.isFinite(Number(van.imageFocusY)) ? Number(van.imageFocusY) : 50,
            zoom: Number.isFinite(Number(van.imageZoom)) ? Math.max(1, Math.min(2, Number(van.imageZoom))) : 1
          }]);
        }
      } else if (!isEditMode && currentUser) {
        // Mode création - Essayer de pré-remplir le téléphone depuis le profil
        try {
          const userSnap = await getDoc(doc(db, 'users', currentUser.uid));
          if (userSnap.exists()) {
            const userData = userSnap.data();
            setFormData(prev => ({
              ...prev,
              sellerPhone: userData.phone || prev.sellerPhone,
              sellerWhatsApp: userData.whatsapp || userData.phone || prev.sellerWhatsApp
            }));
          }
        } catch (error) {
          console.error('Error fetching user profile for phone:', error);
        }
      }
    };
    loadData();
  }, [isEditMode, van, currentUser]);

  // Deep-link support: focus plate field directly from email CTA
  useEffect(() => {
    if (!focusPlate) return;
    const timer = setTimeout(() => {
      plateInputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      plateInputRef.current?.focus();
      plateInputRef.current?.select();
    }, 150);
    return () => clearTimeout(timer);
  }, [focusPlate, isEditMode, van?.id]);

  // tats pour les tooltips
  const [showBuyBackTooltip, setShowBuyBackTooltip] = useState(false);
  const [showWofTooltip, setShowWofTooltip] = useState(false);
  const [showRegoTooltip, setShowRegoTooltip] = useState(false);
  const [showSelfContainedTooltip, setShowSelfContainedTooltip] = useState(false);
  const [showAdvancedEquipment, setShowAdvancedEquipment] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);


  // ✨ IA Generation
  const handleGenerateAI = async () => {
    if (!formData.title || formData.title.length < 5) {
      toast.info('Please enter at least a title (min 5 chars). More details (price, mileage, features) lead to a much better AI description! ✨');
      return;
    }

    setGeneratingAI(true);
    try {
      const generateDescription = httpsCallable(functions, 'generateVanDescription');
      const result = await generateDescription(formData);

      if (result.data && result.data.description) {
        setFormData(prev => ({ ...prev, description: result.data.description }));
        toast.success('Description generated with AI! ✨');
      }
    } catch (error) {
      console.error('AI error details:', error);
      console.error('Error code:', error.code);
      console.error('Error message:', error.message);
      toast.error('Failed to generate description. Please check your connection.');
    } finally {
      setGeneratingAI(false);
    }
  };

  // Upload images
  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    if (images.length + files.length > 10) {
      toast.warning('Maximum 10 photos!');
      return;
    }

    const validFiles = files.filter(file => {
      if (!file.type.startsWith('image/')) {
        toast.error(`Invalid file type: ${file.name}`);
        return false;
      }
      // iPhone HEIC/HEIF : message clair (comme SellPage). Cas rare car iOS
      // Safari convertit en général en JPEG à l'upload, mais si un HEIC passe
      // on donne une consigne utile plutôt qu'un "Invalid file type" confus.
      if (/heic|heif/i.test(file.type) || /\.(heic|heif)$/i.test(file.name)) {
        toast.error('iPhone HEIC photos are not supported. On iPhone: Settings → Camera → Formats → "Most Compatible", then re-add the photo.');
        return false;
      }
      // Garde-fou mémoire uniquement : les photos sont compressées/redimensionnées
      // juste avant l'upload (compressImage), donc une grosse photo de smartphone
      // passe très bien. On ne rejette qu'au-delà de 25 Mo.
      if (file.size > 25 * 1024 * 1024) {
        toast.error(`Photo too large (max 25MB): ${file.name}`);
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setLoading(true);

    // Process each file
    for (const file of validFiles) {
      const tempId = Math.random().toString(36).substr(2, 9);

      // ✅ Compresser/redimensionner AVANT l'upload : uploads bien plus fiables
      // sur mobile et évite le rejet Cloudinary "max 10MB" (les photos de
      // smartphone dépassent souvent 10 Mo).
      let fileToUpload = file;
      try {
        fileToUpload = await compressImage(file);
      } catch (_) {
        fileToUpload = file;
      }

      // ✅ Lire la preview locale AVANT de lancer l'upload (ordre déterministe).
      // Évite une race où l'upload se termine avant le FileReader : le map par
      // id ne trouverait rien, puis l'image serait ajoutée bloquée sur
      // "uploading" -> publication impossible.
      const previewUrl = await new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (ev) => resolve(ev.target.result);
        reader.onerror = () => resolve('');
        reader.readAsDataURL(fileToUpload);
      });
      setImages(prev => [...prev, { id: tempId, url: previewUrl, uploading: true }]);
      setImageCrops(prev => [...prev, { ...defaultCrop }]);

      try {
        const result = await uploadToCloudinary(fileToUpload);
        setImages(prev => prev.map(img =>
          img.id === tempId ? { ...img, url: result.url, uploading: false } : img
        ));
      } catch (error) {
        console.error('Upload error:', error);
        setImages(prev => prev.filter(img => img.id !== tempId));
        setImageCrops(prev => prev.slice(0, Math.max(0, prev.length - 1)));
        toast.error(`Error uploading ${file.name}`);
      }
    }
    setLoading(false);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
    setImageCrops((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    //  SÉCURITÉ: Vérifier que l'utilisateur est connecté et VÉRIFIÉ
    if (!currentUser) {
      toast.error('Please sign in to add a van! 🚐');
      return;
    }

    if (!currentUser.emailVerified) {
      // Proposer directement le renvoi : un ancien inscrit jamais vérifié n'a
      // souvent plus le mail d'origine — sans renvoi, il est bloqué à vie.
      const resend = window.confirm(
        `Please verify your email to list a van (${currentUser.email}).\n\n` +
        'No email? Click OK to resend the verification link (check spam too). ' +
        'The form unlocks automatically once verified.'
      );
      if (resend) {
        try {
          await resendVerificationEmail();
          toast.success('Verification email sent! Check your inbox (and spam).');
        } catch (err) {
          toast.error(err.message || 'Could not send the email. Try again in a few minutes.');
        }
      }
      return;
    }

    //  SÉCURITÉ: Limiter à 20 vans par utilisateur (anti-spam)
    if (!isEditMode) {
      try {
        const userVansQuery = query(
          collection(db, 'vans'),
          where('userId', '==', currentUser.uid)
        );
        const userVansSnapshot = await getDocs(userVansQuery);
        const userVanCount = userVansSnapshot.size;

        if (userVanCount >= 20) {
          const upgrade = window.confirm(
            ' You have reached the maximum of 20 free listings!\n\n' +
            ' Need more? Upgrade to a Pro account for unlimited listings.\n\n' +
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

    //  VALIDATION COMPLTE avec messages d'erreur dtaills
    const errors = [];

    // Photos
    if (images.length === 0) {
      errors.push(' At least 1 photo is required');
    }

    // Titre (min 3 caractres)
    if (!formData.title) {
      errors.push(' Title is required');
    } else if (formData.title.length < 3) {
      errors.push(' Title must be at least 3 characters');
    }

    // Prix
    if (!formData.price) {
      errors.push(' Price is required');
    } else if (parseInt(formData.price) < 1 || parseInt(formData.price) > 500000) {
      errors.push(' Price must be between $1 and $500,000');
    }

    // Ville
    if (!formData.location) {
      errors.push(' City is required');
    }

    // Anne
    if (!formData.year) {
      errors.push(' Year is required');
    } else if (parseInt(formData.year) < 1950 || parseInt(formData.year) > 2026) {
      errors.push(' Year must be between 1950 and 2026');
    }

    // Kilomtrage
    if (!formData.mileage && formData.mileage !== 0) {
      errors.push(' Mileage is required');
    }

    // WOF & REGO
    if (!formData.wofExpiry) {
      errors.push(' WOF expiry date is required');
    }
    if (!formData.regoExpiry) {
      errors.push(' REGO expiry date is required');
    }

    // Description (min 10 caractres)
    if (!formData.description) {
      errors.push(' Description is required');
    } else if (formData.description.length < 10) {
      errors.push(' Description must be at least 10 characters (currently ' + formData.description.length + ')');
    }

    // Buy-back
    if (formData.buyBack && !formData.buyBackPrice) {
      errors.push(' Buy-back price is required when buy-back is enabled');
    }

    // WhatsApp — optionnel mais recommandé ; si renseigné, le format est validé
    const waDigits = (formData.sellerWhatsApp || '').replace(/\D/g, '');
    if (formData.sellerWhatsApp && formData.sellerWhatsApp.trim() && (waDigits.length < 8 || waDigits.length > 15)) {
      errors.push(' WhatsApp number looks invalid. Use international format, e.g. +64 21 123 4567');
    }

    // Afficher les erreurs
    if (errors.length > 0) {
      toast.error(errors[0]); // Show first error as toast
      return;
    }

    setLoading(true);

    try {
      const imageUrls = images.map(img => img.url);
      const normalizedImageCrops = imageUrls.map((_, index) => getCrop(index));
      const primaryCrop = normalizedImageCrops[0] || { ...defaultCrop };

      if (isEditMode && van) {
        // MODE ÉDITION - Update existing van
        const updateData = {
          title: sanitizeString(formData.title),
          price: parseInt(formData.price),
          location: sanitizeString(formData.location),
          region: formData.region,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          type: formData.type,
          fuelType: formData.fuelType,
          transmission: formData.transmission,
          description: sanitizeText(formData.description),
          capacity: parseInt(formData.capacity),
          selfContained: formData.selfContained,
          selfContainedType: formData.selfContained ? formData.selfContainedType : null,
          equipment: formData.equipment,
          buyBack: formData.buyBack,
          buyBackPrice: formData.buyBack ? parseInt(formData.buyBackPrice) || 0 : null,
          buyBackDuration: formData.buyBack ? parseInt(formData.buyBackDuration) : null,
          buyBackMaxKm: formData.buyBack && formData.buyBackMaxKm ? parseInt(formData.buyBackMaxKm) : null,
          buyBackConditions: formData.buyBack ? sanitizeText(formData.buyBackConditions) : '',
          wofExpiry: formData.wofExpiry,
          regoExpiry: formData.regoExpiry,
          imageFocusX: primaryCrop.x,
          imageFocusY: primaryCrop.y,
          imageZoom: primaryCrop.zoom,
          imageCrops: normalizedImageCrops,
          customFeatures: sanitizeText(formData.customFeatures || ''),
          imageUrl: imageUrls[0],
          images: imageUrls,
          seller: {
            ...van.seller,
            whatsapp: sanitizeString(formData.sellerWhatsApp || ''),
            phone: sanitizeString(formData.sellerPhone || '')
          },
          plateNumber: sanitizeString(formData.plateNumber || ''),
          updatedAt: new Date()
        };

        await updateDoc(doc(db, 'vans', van.id), updateData);

        localStorage.removeItem('kiwiVanMarket_vans');
        localStorage.removeItem('kiwiVanMarket_timestamp');

        toast.success('Van updated successfully! ✅');
        onVanAdded && onVanAdded();
        onClose();

      } else {
        // MODE CRATION - Add new van
        const newVanData = {
          title: sanitizeString(formData.title),
          price: parseInt(formData.price),
          location: sanitizeString(formData.location),
          region: formData.region,
          year: parseInt(formData.year),
          mileage: parseInt(formData.mileage),
          type: formData.type,
          fuelType: formData.fuelType,
          transmission: formData.transmission,
          description: sanitizeText(formData.description),
          capacity: parseInt(formData.capacity),
          selfContained: formData.selfContained,
          selfContainedType: formData.selfContained ? formData.selfContainedType : null,
          equipment: formData.equipment,
          buyBack: formData.buyBack,
          buyBackPrice: formData.buyBack ? parseInt(formData.buyBackPrice) || 0 : null,
          buyBackDuration: formData.buyBack ? parseInt(formData.buyBackDuration) : null,
          buyBackMaxKm: formData.buyBack && formData.buyBackMaxKm ? parseInt(formData.buyBackMaxKm) : null,
          buyBackConditions: formData.buyBack ? sanitizeText(formData.buyBackConditions) : '',
          wofExpiry: formData.wofExpiry,
          regoExpiry: formData.regoExpiry,
          imageFocusX: primaryCrop.x,
          imageFocusY: primaryCrop.y,
          imageZoom: primaryCrop.zoom,
          imageCrops: normalizedImageCrops,
          customFeatures: sanitizeText(formData.customFeatures || ''),
          imageUrl: imageUrls[0],
          images: imageUrls,
          seller: {
            uid: currentUser.uid,
            name: sanitizeString(currentUser.displayName || 'Anonymous'),
            email: currentUser.email,
            whatsapp: sanitizeString(formData.sellerWhatsApp || ''),
            phone: sanitizeString(formData.sellerPhone || '')
          },
          // Aligné sur SellPage : le quota anti-spam (20 vans) et d'autres
          // requêtes filtrent sur userId — sans lui, les vans créés ici
          // échappaient au comptage.
          userId: currentUser.uid,
          plateNumber: sanitizeString(formData.plateNumber || ''),
          views: 0,
          status: 'active',
          createdAt: serverTimestamp(),
          updatedAt: new Date()
        };

        // Force-refresh the ID token so Firestore rules see the latest
        // email_verified claim (reload() updates the JS flag but not the token
        // claim, so a freshly-verified seller would otherwise be denied).
        if (auth.currentUser) {
          try { await auth.currentUser.getIdToken(true); } catch (_) {}
        }

        await addDoc(collection(db, 'vans'), newVanData);

        localStorage.removeItem('kiwiVanMarket_vans');
        localStorage.removeItem('kiwiVanMarket_timestamp');

        toast.success('Van listed successfully! 🎉');

        // Appeler le callback pour rafraichir la liste
        if (onVanAdded) {
          await onVanAdded();
          onClose();
        } else {
          onSuccess && onSuccess();
          onClose();
          window.location.reload();
        }
      }

    } catch (error) {
      console.error('Error:', error);
      toast.error('Error saving van. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Composant Tooltip rutilisable
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

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const defaultCrop = { x: 50, y: 50, zoom: 1 };
  const getCrop = (index) => {
    const crop = imageCrops[index];
    if (!crop) return defaultCrop;
    return {
      x: clamp(Number(crop.x ?? 50), 0, 100),
      y: clamp(Number(crop.y ?? 50), 0, 100),
      zoom: clamp(Number(crop.zoom ?? 1), 1, 2),
      area: crop.area ?? null
    };
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col relative shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >

        {/*  HEADER STICKY - Toujours visible */}
        <div className="sticky top-0 z-20 bg-white rounded-t-3xl border-b border-gray-100 px-8 py-6 flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-black text-gray-900">
              {isEditMode ? 'Edit Van' : 'Add New Van'}
            </h2>
            <p className="text-gray-600 mt-1">
              {isEditMode ? 'Update your van details' : 'Upload photos and fill in details'}
            </p>
          </div>
          <button
            onClick={onClose}
            className="bg-gray-100 hover:bg-gray-200 rounded-full p-3 transition-all hover:scale-110">
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {/*  CONTENU SCROLLABLE */}
        <div className="flex-1 overflow-y-auto px-8 lg:px-10 py-6">

          <form onSubmit={handleSubmit} id="addVanForm">

            {/* CARJAM PLATE NUMBER — Free Link Model */}
            <div className="mb-6 p-6 sm:p-8 bg-blue-50 border-2 border-blue-200 rounded-3xl relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-400 opacity-10 rounded-full -translate-y-1/2 translate-x-1/3 blur-2xl group-hover:opacity-20 transition-opacity"></div>
              
              <div className="flex items-center gap-2 mb-4">
                <Shield size={24} className="text-blue-500" />
                <h3 className="text-xl font-black text-blue-900">CarJam Verification</h3>
              </div>
              
              <div className="flex-1">
                <label className="block text-[10px] font-black text-blue-800 uppercase tracking-widest mb-2">License Plate</label>
                <input
                  ref={plateInputRef}
                  type="text"
                  value={formData.plateNumber || ''}
                  onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                  placeholder="e.g. ABC123"
                  className="w-full px-5 py-4 border-2 border-blue-200 rounded-2xl focus:border-blue-500 focus:ring-4 focus:ring-blue-100 outline-none transition-all uppercase font-mono text-xl font-bold text-gray-800 bg-white placeholder-gray-300"
                />
                <p className="text-[11px] font-bold text-blue-600/70 mt-3 flex items-center gap-1.5">
                  <CheckCircle size={14} /> Buyers will see a free CarJam check link on your listing!
                </p>
              </div>
            </div>

            {/* PHOTOS SECTION */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Photos ({images.length}/5)
              </h3>

              {/* Photo grid */}
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => {
                  return (
                    <div key={index} className="relative group">
                      <div
                        className="aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 border-emerald-200 shadow-lg"
                      >
                        <img
                          src={image.url}
                          alt={`Listing view ${index + 1}`}
                          className="w-full h-full object-cover"
                          style={{
                            objectPosition: 'center',
                            transform: 'scale(1)',
                            transformOrigin: 'center center'
                          }}
                          draggable={false}
                        />
                        {image.uploading && (
                          <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
                          </div>
                        )}
                        {!image.uploading && (
                          <div className="absolute top-2 left-2 bg-emerald-500 text-white rounded-full p-1 shadow-lg pointer-events-none">
                            <CheckCircle size={16} />
                          </div>
                        )}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        className="absolute top-2 right-2 z-20 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg">
                        <Trash2 size={16} />
                      </button>
                    </div>
                  );
                })}

                {/* Add button */}
                {images.length < 5 && (
                  <label className="aspect-video bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-100 transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      multiple
                      className="hidden"
                      disabled={loading}
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
                <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-xl p-3 flex items-center gap-2 mt-4">
                  <span>⚠️</span>
                  <span>At least 1 photo required</span>
                </p>
              )}

              {images.length > 0 && (
                <div className="mt-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-600">
                    Photos are shown as uploaded.
                  </p>
                </div>
              )}
            </div>

            {/* Basic Info Header */}
            <div className="mb-6 border-b border-gray-100 pb-2">
               <h3 className="text-lg font-black text-gray-900 uppercase tracking-tight flex items-center gap-2">
                 <span className="w-2 h-6 bg-emerald-500 rounded-full"></span>
                 Van Details
               </h3>
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
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Toyota Hiace 2015"
                  className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors ${formData.title && formData.title.length < 3
                    ? 'border-red-300 focus:border-red-500'
                    : 'border-gray-200 focus:border-emerald-500'
                    }`}
                  required
                />
                {formData.title && formData.title.length < 3 && (
                  <p className="text-xs text-red-500 mt-1"> {formData.title.length}/3 characters minimum</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Price (NZ$) *</label>
                <input
                  type="number"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                  placeholder="18500"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">City *</label>
                <select
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, region: e.target.value })}
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
                  onChange={(e) => setFormData({ ...formData, year: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage *</label>
                <input
                  type="number"
                  value={formData.mileage}
                  onChange={(e) => setFormData({ ...formData, mileage: e.target.value })}
                  placeholder="145000"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Vehicle Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors">
                  <option value="Car">Car</option>
                  <option value="Van">Van</option>
                  <option value="Motorhome">Motorhome</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Fuel</label>
                <select
                  value={formData.fuelType}
                  onChange={(e) => setFormData({ ...formData, fuelType: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors">
                  <option value="petrol">Petrol</option>
                  <option value="diesel">Diesel</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Transmission</label>
                <select
                  value={formData.transmission}
                  onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors">
                  <option value="manual">Manual</option>
                  <option value="automatic">Automatic</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Capacity</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
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
                    emoji=""
                  >
                    A <span className="text-white font-semibold">safety inspection</span> required every 6-12 months for all vehicles in NZ.
                    It checks brakes, lights, tyres, steering and other safety features.
                    <span className="text-white font-semibold"> You can't legally drive without a valid WOF!</span>
                  </InfoTooltip>
                </label>
                <input
                  type="date"
                  value={formData.wofExpiry}
                  onChange={(e) => setFormData({ ...formData, wofExpiry: e.target.value })}
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
                    emoji=""
                  >
                    <span className="text-white font-semibold">Registration fee</span> that must be paid to legally drive on NZ roads.
                    Can be bought in 3, 6 or 12 month periods at any PostShop or online.
                    <span className="text-white font-semibold"> Check the sticker on the windscreen!</span>
                  </InfoTooltip>
                </label>
                <input
                  type="date"
                  value={formData.regoExpiry}
                  onChange={(e) => setFormData({ ...formData, regoExpiry: e.target.value })}
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
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Perfect backpacker van, well maintained, ready for adventure..."
                rows={4}
                className={`w-full px-4 py-3 border-2 rounded-xl focus:outline-none transition-colors resize-none ${formData.description && formData.description.length < 10
                  ? 'border-red-300 focus:border-red-500'
                  : 'border-gray-200 focus:border-emerald-500'
                  }`}
                required
              />
              <div className="flex justify-between mt-1">
                {formData.description && formData.description.length < 10 ? (
                  <p className="text-xs text-red-500"> {formData.description.length}/10 characters minimum</p>
                ) : (
                  <p className="text-xs text-gray-400">{formData.description.length || 0} characters</p>
                )}
              </div>
            </div>



            {/* WHATSAPP */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                WhatsApp Number <span className="font-normal text-gray-400">(recommended — buyers contact you here)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border-2 border-green-200 rounded-xl">
                  <svg className="w-5 h-5 text-green-600" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
                  </svg>
                </div>
                <input
                  type="tel"
                  value={formData.sellerWhatsApp}
                  onChange={(e) => setFormData({ ...formData, sellerWhatsApp: e.target.value })}
                  placeholder="+64 21 123 4567"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💬 Recommended — listings with WhatsApp get contacted faster. Add the country code (e.g. +64). No number? Buyers can still message you in-app.
              </p>
            </div>

            {/* PHONE NUMBER */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Phone Number <span className="font-normal text-gray-400">(for calls)</span>
              </label>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 px-4 py-3 bg-slate-50 border-2 border-slate-200 rounded-xl">
                  <Phone size={18} className="text-slate-600" />
                </div>
                <input
                  type="tel"
                  value={formData.sellerPhone}
                  onChange={(e) => setFormData({ ...formData, sellerPhone: e.target.value })}
                  placeholder="+64 21 123 4567"
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-slate-500 focus:outline-none transition-colors"
                />
              </div>
              <p className="text-xs text-gray-500 mt-2">
                Optional but recommended. Buyers can call you directly from the listing.
              </p>
            </div>

            {/* EQUIPMENT - Simplifie */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3"> Equipment & Features</label>

              {/* ESSENTIELS - Toujours visible */}
              <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl mb-4">
                <h4 className="text-sm font-bold text-emerald-700 mb-3">{"✨"} Key Features <span className="font-normal text-emerald-600">(most searched by buyers)</span></h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.doubleBed}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, doubleBed: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"🛏️"} Double Bed</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.fridge}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, fridge: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"🧊"} Fridge</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.gasStove}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, gasStove: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"🔥"} Gas Stove</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.sink}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, sink: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"🚰"} Sink</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.toilet}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, toilet: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"🚽"} Toilet</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.solarPanel}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, solarPanel: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"☀️"} Solar Panel</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.leisureBattery}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, leisureBattery: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"🔋"} Leisure Battery</span>
                  </label>
                  <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                    <input type="checkbox" checked={formData.equipment.dieselHeater || formData.equipment.heater}
                      onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, heater: e.target.checked } })}
                      className="w-4 h-4 text-emerald-600 rounded" />
                    <span className="text-sm">{"🌡️"} Heater</span>
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

              {/* OPTIONS AVANCES - Simplifies pour backpackers */}
              {showAdvancedEquipment && (
                <div className="space-y-4 mb-4">

                  {/* Sleeping */}
                  <div className="p-3 bg-indigo-50 rounded-xl">
                    <h4 className="text-xs font-bold text-indigo-600 mb-2">{"🛏️"} Sleeping</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.singleBeds}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, singleBeds: e.target.checked } })}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        {"🛏️"} Single Beds
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.roofBed}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, roofBed: e.target.checked } })}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        {"🏕️"} Pop-top / Roof Bed
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.bedding}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, bedding: e.target.checked } })}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        {"🛌"} Bedding Included
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-indigo-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.curtains}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, curtains: e.target.checked } })}
                          className="w-4 h-4 text-indigo-600 rounded" />
                        {"🪟"} Privacy Curtains
                      </label>
                    </div>
                  </div>

                  {/* Kitchen */}
                  <div className="p-3 bg-orange-50 rounded-xl">
                    <h4 className="text-xs font-bold text-orange-600 mb-2">{"🍳"} Kitchen</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-orange-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.cookware}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, cookware: e.target.checked } })}
                          className="w-4 h-4 text-orange-600 rounded" />
                        {"🍳"} Pots, Pans & Utensils
                      </label>
                    </div>
                  </div>

                  {/* Water & Bathroom */}
                  <div className="p-3 bg-cyan-50 rounded-xl">
                    <h4 className="text-xs font-bold text-cyan-600 mb-2">{"💧"} Water & Bathroom</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.freshWaterTank}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, freshWaterTank: e.target.checked } })}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        {"💧"} Fresh Water Tank
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.greyWaterTank}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, greyWaterTank: e.target.checked } })}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        {"🚿"} Grey Water Tank
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.outdoorShower}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, outdoorShower: e.target.checked } })}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        {"🚿"} Outdoor Shower
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.indoorShower}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, indoorShower: e.target.checked } })}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        {"🛁"} Indoor Shower
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.portaPotti}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, portaPotti: e.target.checked } })}
                          className="w-4 h-4 text-cyan-600 rounded" />
                        {"🚽"} Porta Potti
                      </label>
                    </div>
                  </div>

                  {/* Power */}
                  <div className="p-3 bg-yellow-50 rounded-xl">
                    <h4 className="text-xs font-bold text-yellow-600 mb-2">{"⚡"} Power</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.splitCharger}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, splitCharger: e.target.checked } })}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        {"🔌"} Charges While Driving
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.inverter}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, inverter: e.target.checked } })}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        {"🔌"} 230V Inverter
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.usb}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, usb: e.target.checked } })}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        {"🔋"} USB Charging Ports
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.ledLights}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, ledLights: e.target.checked } })}
                          className="w-4 h-4 text-yellow-600 rounded" />
                        {"💡"} LED Lights
                      </label>
                    </div>
                  </div>

                  {/* Comfort */}
                  <div className="p-3 bg-rose-50 rounded-xl">
                    <h4 className="text-xs font-bold text-rose-600 mb-2">{"🌡️"} Comfort</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.dieselHeater}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, dieselHeater: e.target.checked } })}
                          className="w-4 h-4 text-rose-600 rounded" />
                        {"🔥"} Diesel Heater (Webasto)
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.roofFan}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, roofFan: e.target.checked } })}
                          className="w-4 h-4 text-rose-600 rounded" />
                        {"🌀"} Roof Vent / Fan
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.insulation}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, insulation: e.target.checked } })}
                          className="w-4 h-4 text-rose-600 rounded" />
                        {"🧥"} Insulated
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.awning}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, awning: e.target.checked } })}
                          className="w-4 h-4 text-rose-600 rounded" />
                        {"⛺"} Awning
                      </label>
                    </div>
                  </div>

                  {/* Vehicle */}
                  <div className="p-3 bg-gray-100 rounded-xl">
                    <h4 className="text-xs font-bold text-gray-600 mb-2">{"🚗"} Vehicle</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.reverseCamera}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, reverseCamera: e.target.checked } })}
                          className="w-4 h-4 text-gray-600 rounded" />
                        {"📷"} Reverse Camera
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.bluetooth}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, bluetooth: e.target.checked } })}
                          className="w-4 h-4 text-gray-600 rounded" />
                        {"🔊"} Bluetooth Audio
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.swivelSeats}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, swivelSeats: e.target.checked } })}
                          className="w-4 h-4 text-gray-600 rounded" />
                        {"💺"} Swivel Front Seats
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.bikeRack}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, bikeRack: e.target.checked } })}
                          className="w-4 h-4 text-gray-600 rounded" />
                        {"🚴"} Bike Rack
                      </label>
                      <label className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-gray-200 transition text-sm">
                        <input type="checkbox" checked={formData.equipment.surfRack}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, surfRack: e.target.checked } })}
                          className="w-4 h-4 text-gray-600 rounded" />
                        {"🏄"} Surf / Kayak Rack
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* CHAMP LIBRE - Autres quipements */}
              <div className="p-4 bg-gray-50 rounded-xl">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Other features <span className="font-normal text-gray-400">(optional)</span>
                </label>
                <input
                  type="text"
                  value={formData.customFeatures || ''}
                  onChange={(e) => setFormData({ ...formData, customFeatures: e.target.value })}
                  placeholder="e.g. Surfboard rack, Kayak holder, TV, Coffee machine..."
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <p className="text-xs text-gray-400 mt-1">Add anything special not listed above</p>
              </div>
            </div>

            {/* OPTIONS */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3"> Certifications & Options</label>
              <div className="space-y-3">

                {/* Self-Contained avec tooltip */}
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="flex items-center gap-2">
                    <label className="flex items-center gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.selfContained}
                        onChange={(e) => setFormData({ ...formData, selfContained: e.target.checked })}
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
                      emoji=""
                    >
                      A certified van with <span className="text-white font-semibold">toilet, fresh water tank & grey water tank</span>.
                      Required for freedom camping in most areas of NZ.
                      <span className="text-green-400 font-semibold"> Green sticker</span> = fixed toilet.
                      <span className="text-blue-400 font-semibold"> Blue sticker</span> = porta-potty allowed.
                      <span className="text-white font-semibold"> Essential for free camping!</span>
                    </InfoTooltip>
                  </div>

                  {/* Choix Vert ou Bleu si coch */}
                  {formData.selfContained && (
                    <div className="mt-3 ml-8 flex gap-4 flex-wrap">
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition ${formData.selfContainedType === 'green'
                        ? 'border-green-500 bg-green-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input type="radio" name="selfContainedType" value="green"
                          checked={formData.selfContainedType === 'green'}
                          onChange={(e) => setFormData({ ...formData, selfContainedType: e.target.value })}
                          className="hidden" />
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold"></span>
                        </div>
                        <div>
                          <span className="font-semibold text-green-700">Green Sticker</span>
                          <p className="text-xs text-gray-500">Fixed toilet</p>
                        </div>
                      </label>

                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition ${formData.selfContainedType === 'blue'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                        }`}>
                        <input type="radio" name="selfContainedType" value="blue"
                          checked={formData.selfContainedType === 'blue'}
                          onChange={(e) => setFormData({ ...formData, selfContainedType: e.target.value })}
                          className="hidden" />
                        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold"></span>
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
                        onChange={(e) => setFormData({ ...formData, buyBack: e.target.checked })}
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
                      emoji=""
                    >
                      Offer to buy back the van at an agreed price if the buyer returns it within a specified period.
                      <span className="text-white font-semibold"> Great for attracting backpackers!</span>
                    </InfoTooltip>
                  </div>

                  {/* Options Buy-Back (affiches si coch) */}
                  {formData.buyBack && (
                    <div className="ml-8 mt-3 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl space-y-4">
                      <h4 className="font-bold text-emerald-700 flex items-center gap-2">
                        Buy-Back Details
                      </h4>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">
                            Guaranteed Buy-Back Price (NZ$) *
                          </label>
                          <input
                            type="number"
                            value={formData.buyBackPrice}
                            onChange={(e) => setFormData({ ...formData, buyBackPrice: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, buyBackDuration: e.target.value })}
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
                            onChange={(e) => setFormData({ ...formData, buyBackMaxKm: e.target.value })}
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
                          onChange={(e) => setFormData({ ...formData, buyBackConditions: e.target.value })}
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

            {/* DESCRIPTION SECTION - With AI Assistant */}
            <div className="mb-8 p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <label className="text-base font-bold text-gray-800 flex items-center gap-2">
                  <span className="text-xl">{"📝"}</span> Detailed Description *
                </label>
              </div>

              <div className="relative group">
                <textarea
                  required
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={8}
                  placeholder="Tell buyers about your van... (maintenance, recent trips, why you love it)"
                  className="w-full px-5 py-5 border-2 border-gray-100 rounded-2xl focus:border-purple-400 focus:ring-4 focus:ring-purple-50 outline-none transition-all resize-none text-gray-700 leading-relaxed bg-gray-50/50"
                />
                <div className="absolute bottom-4 right-5 text-[10px] text-gray-400 font-bold bg-white px-2 py-1 rounded-full shadow-sm">
                  {formData.description?.length || 0} characters
                </div>
              </div>
              <p className="text-[11px] text-gray-500 mt-3 flex items-center gap-2 px-1">
                <span className="w-1.5 h-1.5 bg-purple-400 rounded-full"></span>
                Tip: Expert sellers include service history and recent mechanical work to build trust.
              </p>
            </div>

            {/* BUTTONS moved to footer */}
          </form>
        </div>

        {/*  FOOTER STICKY - Boutons toujours visibles */}
        <div className="sticky bottom-0 z-20 bg-white border-t border-gray-100 px-8 py-4 rounded-b-3xl">
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
              form="addVanForm"
              disabled={loading || images.length === 0}
              className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
              {loading
                ? (isEditMode ? 'Saving...' : 'Adding...')
                : (isEditMode ? 'Save Changes' : 'Add Van')
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}