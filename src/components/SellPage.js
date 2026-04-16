import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { collection, addDoc, query, where, getDocs, serverTimestamp } from 'firebase/firestore';
import { httpsCallable } from 'firebase/functions';
import { db, functions } from '../firebase';
import { useAuth } from '../AuthContext';
import { Upload, Trash2, CheckCircle, ArrowLeft, Camera, FileText, Send, PartyPopper, Eye, Home, Sparkles, Loader2 } from 'lucide-react';
import { uploadToCloudinary } from '../cloudinaryConfig';
import AuthModal from './AuthModal';
import SeoHead from './SeoHead';
import { useToast } from './ToastProvider';

export default function SellPage() {
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [images, setImages] = useState([]);
  const [uploadingIndex, setUploadingIndex] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [showSuccess, setShowSuccess] = useState(false);
  const [newVanId, setNewVanId] = useState(null);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const cropStageRef = useRef(null);
  const [isCropDragging, setIsCropDragging] = useState(false);
  const toast = useToast();

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
    buyBack: false,
    buyBackPrice: '',
    buyBackDuration: '3',
    buyBackMaxKm: '',
    buyBackConditions: '',
    equipment: {
      doubleBed: false, singleBeds: false, roofBed: false, bedding: false, curtains: false,
      fridge: false, gasStove: false, sink: false, cookware: false,
      freshWaterTank: false, greyWaterTank: false, outdoorShower: false, indoorShower: false, toilet: false, portaPotti: false,
      solarPanel: false, leisureBattery: false, splitCharger: false, inverter: false, usb: false, ledLights: false,
      heater: false, dieselHeater: false, roofFan: false, insulation: false, awning: false,
      reverseCamera: false, bluetooth: false, swivelSeats: false, bikeRack: false, surfRack: false
    },
    wofExpiry: '',
    regoExpiry: '',
    imageFocusX: 50,
    imageFocusY: 50,
    imageZoom: 1,
    plateNumber: '',
    customFeatures: '',
    sellerPhone: '',
    sellerFacebook: ''
  });

  const [showAdvancedEquipment, setShowAdvancedEquipment] = useState(false);
  const [showBuyBackTooltip, setShowBuyBackTooltip] = useState(false);
  const [showWofTooltip, setShowWofTooltip] = useState(false);
  const [showRegoTooltip, setShowRegoTooltip] = useState(false);
  const [showSelfContainedTooltip, setShowSelfContainedTooltip] = useState(false);

  // Hide the initial HTML loader
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  // Show auth modal if not logged in
  useEffect(() => {
    if (!currentUser) {
      setShowAuthModal(true);
    }
  }, [currentUser]);

  // Upload image
  const handleImageUpload = async (file) => {
    if (images.length >= 5) {
      toast.warning('Maximum 5 photos!');
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Invalid file type!');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error('Image too large (max 10MB)');
      return;
    }

    const newIndex = images.length;
    setUploadingIndex(newIndex);

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
      toast.error('Upload error. Please try again.');
    } finally {
      setUploadingIndex(null);
    }
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser) {
      setShowAuthModal(true);
      return;
    }

    // Check van limit
    try {
      const userVansQuery = query(collection(db, 'vans'), where('userId', '==', currentUser.uid));
      const userVansSnapshot = await getDocs(userVansQuery);
      if (userVansSnapshot.size >= 20) {
        toast.warning('You have reached the maximum of 20 free listings!');
        return;
      }
    } catch (error) {
      console.error('Error checking van count:', error);
    }

    // Validation - Must match Firestore security rules
    const errors = [];
    if (images.length === 0) errors.push('At least 1 photo');
    if (images.length > 10) errors.push('Max 10 photos');
    if (images.some(img => img.uploading)) errors.push('Wait for uploads');
    if (images.some(img => !img.url || !img.url.includes('cloudinary.com'))) {
      errors.push('Re-upload failed images');
    }
    if (!formData.title || formData.title.length < 5) errors.push('Title too short');
    if (!formData.price || parseInt(formData.price) < 1) errors.push('Price required');
    if (!formData.location) errors.push('City required');
    if (!formData.description || formData.description.length < 20) errors.push('Description too short');
    if (formData.buyBack && !formData.buyBackPrice) errors.push('Buy-back price required');

    if (errors.length > 0) {
      toast.error('Missing: ' + errors.join(', '));
      return;
    }

    setLoading(true);

    try {
      const imageUrls = images.map(img => img.url);

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
        imageFocusX: Math.max(0, Math.min(100, Number(formData.imageFocusX ?? 50))),
        imageFocusY: Math.max(0, Math.min(100, Number(formData.imageFocusY ?? 50))),
        imageZoom: Math.max(1, Math.min(2, Number(formData.imageZoom ?? 1))),
        plateNumber: (formData.plateNumber || '').trim().toUpperCase().replace(/\s+/g, ''),
        customFeatures: formData.customFeatures || '',
        imageUrl: imageUrls[0],
        images: imageUrls,
        seller: {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email,
          phone: formData.sellerPhone || '',
          facebook: formData.sellerFacebook || ''
        },
        userId: currentUser.uid,
        views: 0,
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };

      const docRef = await addDoc(collection(db, 'vans'), newVanData);
      setNewVanId(docRef.id);

      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');

      setShowSuccess(true);
    } catch (error) {
      console.error('Error adding van:', error);
      toast.error('Error adding van: ' + (error.message || 'Check connection'));
    } finally {
      setLoading(false);
    }
  };

  // Tooltip component
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
          <p className="text-gray-300 leading-relaxed text-xs">{children}</p>
          <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-gray-900 rotate-45"></div>
        </div>
      )}
    </div>
  );

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));

  const updateCropFromPointer = (clientX, clientY) => {
    if (!cropStageRef.current) return;
    const rect = cropStageRef.current.getBoundingClientRect();
    const x = ((clientX - rect.left) / rect.width) * 100;
    const y = ((clientY - rect.top) / rect.height) * 100;
    setFormData((prev) => ({
      ...prev,
      imageFocusX: clamp(Number(x), 0, 100),
      imageFocusY: clamp(Number(y), 0, 100),
    }));
  };

  const handleCropPointerDown = (e) => {
    setIsCropDragging(true);
    e.currentTarget.setPointerCapture?.(e.pointerId);
    updateCropFromPointer(e.clientX, e.clientY);
  };

  const handleCropPointerMove = (e) => {
    if (!isCropDragging) return;
    updateCropFromPointer(e.clientX, e.clientY);
  };

  const handleCropPointerUp = (e) => {
    setIsCropDragging(false);
    e.currentTarget.releasePointerCapture?.(e.pointerId);
  };

  // Success page
  if (showSuccess) {
    return (
      <>
        <Helmet>
          <title>Van Listed Successfully! | Kiwi Van Market</title>
        </Helmet>
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
          <div className="max-w-lg w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
              <PartyPopper size={48} className="text-white" />
            </div>

            <h1 className="text-3xl font-black text-gray-900 mb-3">
              Your Van is Live!
            </h1>
            <p className="text-gray-600 mb-8">
              Congratulations! Your listing is now visible to thousands of backpackers looking for their next adventure vehicle.
            </p>

            <div className="bg-emerald-50 border-2 border-emerald-200 rounded-2xl p-6 mb-8">
              <div className="flex items-center justify-center gap-4 text-emerald-700">
                <CheckCircle size={24} />
                <span className="font-bold">"{formData.title}" is now for sale</span>
              </div>
              <p className="text-emerald-600 text-sm mt-2">
                ${parseInt(formData.price).toLocaleString()} NZD - {formData.location}
              </p>
            </div>

            <div className="space-y-3">
              {newVanId && (
                <Link
                  to={`/van/${newVanId}`}
                  className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all"
                >
                  <Eye size={20} />
                  View Your Listing
                </Link>
              )}
              <Link
                to="/"
                className="flex items-center justify-center gap-2 w-full bg-gray-100 text-gray-700 py-4 rounded-xl font-bold hover:bg-gray-200 transition"
              >
                <Home size={20} />
                Back to Homepage
              </Link>
            </div>

            <p className="text-sm text-gray-500 mt-6">
              Buyers can now contact you via email or WhatsApp. Good luck with your sale!
            </p>
          </div>
        </div>
      </>
    );
  }

  // Login prompt
  if (!currentUser) {
    return (
      <>
        <SeoHead
          title="Sell Your Campervan"
          description="List your campervan for FREE on New Zealand's #1 campervan marketplace. Reach thousands of backpackers looking to buy."
        />
        <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl p-8 text-center">
            <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <Camera size={40} className="text-emerald-600" />
            </div>
            <h1 className="text-2xl font-black text-gray-900 mb-3">Sign in to Sell</h1>
            <p className="text-gray-600 mb-6">
              Create a free account to list your campervan and reach thousands of buyers.
            </p>
            <button
              onClick={() => setShowAuthModal(true)}
              className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all"
            >
              Sign In / Register
            </button>
            <Link to="/" className="block mt-4 text-gray-500 hover:text-gray-700 transition">
              Back to listings
            </Link>
          </div>
        </div>

        {/* Auth Modal */}
        {showAuthModal && (
          <AuthModal isOpen={true} onClose={() => setShowAuthModal(false)} />
        )}
      </>
    );
  }

  return (
    <>
      <SeoHead
        title="Sell Your Campervan for FREE"
        description="List your campervan, van, or motorhome for FREE on Kiwi Van Market. Reach thousands of backpackers in New Zealand looking to buy their adventure vehicle."
        keywords="sell campervan NZ, sell van New Zealand, campervan for sale, backpacker van, sell motorhome"
        canonicalUrl="https://kiwivanmarket.com/sell"
        type="WebPage"
      />

      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <div className="bg-gradient-to-r from-emerald-600 via-teal-500 to-cyan-500 text-white">
          <div className="max-w-4xl mx-auto px-4 py-6">
            <button
              onClick={() => navigate('/')}
              className="flex items-center gap-2 text-white/80 hover:text-white transition mb-4"
            >
              <ArrowLeft size={20} />
              Back to listings
            </button>
            <h1 className="text-3xl font-black">Sell Your Van</h1>
            <p className="text-white/80 mt-1">List for FREE and reach thousands of buyers</p>
          </div>
        </div>

        {/* Progress Steps */}
        <div className="bg-white border-b shadow-sm sticky top-0 z-20">
          <div className="max-w-4xl mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className={`flex items-center gap-2 ${currentStep >= 1 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 1 ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>
                  <Camera size={16} />
                </div>
                <span className="font-semibold hidden sm:block">Photos</span>
              </div>
              <div className={`flex-1 h-1 mx-2 rounded ${currentStep >= 2 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center gap-2 ${currentStep >= 2 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 2 ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>
                  <FileText size={16} />
                </div>
                <span className="font-semibold hidden sm:block">Details</span>
              </div>
              <div className={`flex-1 h-1 mx-2 rounded ${currentStep >= 3 ? 'bg-emerald-600' : 'bg-gray-200'}`} />
              <div className={`flex items-center gap-2 ${currentStep >= 3 ? 'text-emerald-600' : 'text-gray-400'}`}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${currentStep >= 3 ? 'bg-emerald-600 text-white' : 'bg-gray-200'}`}>
                  <Send size={16} />
                </div>
                <span className="font-semibold hidden sm:block">Publish</span>
              </div>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="max-w-4xl mx-auto px-4 py-8">
          <form onSubmit={handleSubmit}>

            {/* STEP 1: Photos */}
            <div className={`bg-white rounded-2xl shadow-lg p-6 mb-6 ${currentStep < 1 ? 'opacity-50' : ''}`}>
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <Camera className="text-emerald-600" />
                Photos ({images.length}/5)
              </h2>

              <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                {images.map((image, index) => (
                  <div key={index} className="relative group">
                    <div
                      ref={index === 0 ? cropStageRef : undefined}
                      className={`aspect-video bg-gray-100 rounded-2xl overflow-hidden border-2 shadow-lg ${
                        index === 0
                          ? `border-blue-400 ring-2 ring-blue-100 ${isCropDragging ? 'cursor-grabbing' : 'cursor-grab'} select-none`
                          : 'border-emerald-200'
                      }`}
                      style={index === 0 ? { touchAction: 'none' } : undefined}
                      onPointerDown={index === 0 ? handleCropPointerDown : undefined}
                      onPointerMove={index === 0 ? handleCropPointerMove : undefined}
                      onPointerUp={index === 0 ? handleCropPointerUp : undefined}
                      onPointerCancel={index === 0 ? handleCropPointerUp : undefined}
                    >
                      <img
                        src={image.url}
                        alt={`Listing view ${index + 1}`}
                        className="w-full h-full object-cover"
                        style={{
                          objectPosition: index === 0
                            ? `${formData.imageFocusX}% ${formData.imageFocusY}%`
                            : 'center',
                          transform: index === 0 ? `scale(${Math.max(1, Math.min(2, Number(formData.imageZoom || 1)))})` : 'scale(1)',
                          transformOrigin: 'center center'
                        }}
                        draggable={false}
                      />
                      {index === 0 && (
                        <div className="absolute inset-0 pointer-events-none">
                          <div className="absolute top-1/3 left-0 right-0 border-t border-white/50" />
                          <div className="absolute top-2/3 left-0 right-0 border-t border-white/50" />
                          <div className="absolute left-1/3 top-0 bottom-0 border-l border-white/50" />
                          <div className="absolute left-2/3 top-0 bottom-0 border-l border-white/50" />
                        </div>
                      )}
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
                    {index === 0 && (
                      <div className="absolute bottom-2 left-2 bg-blue-500 text-white px-3 py-1 rounded-full text-xs font-bold shadow-lg pointer-events-none z-10">
                        Main Photo — drag to frame
                      </div>
                    )}
                    <button
                      type="button"
                      onClick={() => removeImage(index)}
                      className="absolute top-2 right-2 z-20 bg-red-500 text-white rounded-full p-2 opacity-0 group-hover:opacity-100 transition-all hover:scale-110 shadow-lg"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))}

                {images.length < 5 && (
                  <label className="aspect-video bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-dashed border-emerald-300 rounded-2xl flex flex-col items-center justify-center cursor-pointer hover:border-emerald-500 hover:bg-emerald-100 transition-all group">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        if (e.target.files[0]) {
                          handleImageUpload(e.target.files[0]);
                          if (images.length === 0) setCurrentStep(2);
                        }
                      }}
                      className="hidden"
                      disabled={uploadingIndex !== null}
                    />
                    {uploadingIndex === images.length ? (
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
                    ) : (
                      <>
                        <Upload size={32} className="text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                        <span className="text-sm font-semibold text-emerald-700">Upload Photo</span>
                        <span className="text-xs text-gray-500 mt-1">Click to browse</span>
                      </>
                    )}
                  </label>
                )}
              </div>

              {images.length === 0 && (
                <p className="text-sm text-orange-600 bg-orange-50 border border-orange-200 rounded-xl p-3">
                  At least 1 photo is required - good photos sell faster!
                </p>
              )}

              {images.length > 0 && (
                <div className="mt-3 flex flex-col sm:flex-row sm:flex-wrap sm:items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-xl">
                  <p className="text-sm text-slate-600 shrink-0">
                    <span className="font-semibold text-slate-800">Main photo:</span> drag on the image to frame. Pinch-friendly on mobile.
                  </p>
                  <div className="flex items-center gap-2 flex-1 min-w-0 max-w-md">
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageZoom: Math.max(1, Number((prev.imageZoom - 0.05).toFixed(2))) }))}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold shrink-0"
                      aria-label="Zoom out"
                    >
                      −
                    </button>
                    <label className="flex-1 min-w-0 text-xs font-semibold text-slate-700">
                      Zoom ({Number(formData.imageZoom || 1).toFixed(2)}×)
                      <input
                        type="range"
                        min="1"
                        max="2"
                        step="0.01"
                        value={formData.imageZoom || 1}
                        onChange={(e) => setFormData((prev) => ({ ...prev, imageZoom: Number(e.target.value) }))}
                        className="w-full mt-1"
                      />
                    </label>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageZoom: Math.min(2, Number((prev.imageZoom + 0.05).toFixed(2))) }))}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-bold shrink-0"
                      aria-label="Zoom in"
                    >
                      +
                    </button>
                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, imageFocusX: 50, imageFocusY: 50, imageZoom: 1 }))}
                      className="px-3 py-2 rounded-lg bg-white border border-slate-200 text-slate-700 font-semibold text-xs shrink-0"
                    >
                      Reset
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* STEP 2: Details */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="text-emerald-600" />
                Van Details
              </h2>

              <div className="grid md:grid-cols-2 gap-4 mb-6">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                  <input
                    type="text"
                    value={formData.title}
                    onChange={(e) => { setFormData({ ...formData, title: e.target.value }); if (e.target.value.length >= 5) setCurrentStep(3); }}
                    placeholder="Toyota Hiace 2015"
                    className={`w-full px-4 py-3 border-2 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors ${formData.title.length > 0 && formData.title.length < 5
                      ? 'border-red-300'
                      : 'border-gray-200'
                      }`}
                    required
                    maxLength={200}
                  />
                  {formData.title.length > 0 && formData.title.length < 5 && (
                    <span className="text-xs text-red-500 mt-1">Minimum 5 characters ({formData.title.length}/5)</span>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
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
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Mileage (km) *</label>
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
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  >
                    <option value="Car">Car</option>
                    <option value="Van">Van</option>
                    <option value="Motorhome">Motorhome</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Sleeps</label>
                  <input
                    type="number"
                    value={formData.capacity}
                    onChange={(e) => setFormData({ ...formData, capacity: e.target.value })}
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>

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
                      A <span className="text-white font-semibold">safety inspection</span> required every 6-12 months.
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

                <div>
                  <label className="flex items-center text-sm font-semibold text-gray-700 mb-2">
                    REGO Expiry *
                    <InfoTooltip
                      show={showRegoTooltip}
                      onMouseEnter={() => setShowRegoTooltip(true)}
                      onMouseLeave={() => setShowRegoTooltip(false)}
                      title="Registration"
                      emoji=""
                    >
                      <span className="text-white font-semibold">Registration fee</span> to legally drive on NZ roads.
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

                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2">
                    Plaque d'immatriculation / License Plate (Optional)
                  </label>
                  <input
                    type="text"
                    value={formData.plateNumber}
                    onChange={(e) => setFormData({ ...formData, plateNumber: e.target.value.toUpperCase() })}
                    placeholder="ABC123"
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors uppercase"
                    maxLength={12}
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Très important: la plaque permet d'afficher un bouton CarJam visible par tous les acheteurs.
                  </p>
                  <p className="text-xs text-emerald-700 font-semibold mt-1">
                    C'est un vrai signal de securite et de confiance qui augmente les messages serieux.
                  </p>
                </div>
              </div>

              {/* Equipment */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-3">Key Features</label>
                <div className="p-4 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {[
                      { key: 'doubleBed', label: 'Double Bed', emoji: '' },
                      { key: 'fridge', label: 'Fridge', emoji: '' },
                      { key: 'gasStove', label: 'Gas Stove', emoji: '' },
                      { key: 'sink', label: 'Sink', emoji: '' },
                      { key: 'toilet', label: 'Toilet', emoji: '' },
                      { key: 'solarPanel', label: 'Solar Panel', emoji: '' },
                      { key: 'leisureBattery', label: 'Leisure Battery', emoji: '' },
                      { key: 'heater', label: 'Heater', emoji: '' },
                    ].map(item => (
                      <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-emerald-100 transition border border-transparent hover:border-emerald-200">
                        <input
                          type="checkbox"
                          checked={formData.equipment[item.key]}
                          onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, [item.key]: e.target.checked } })}
                          className="w-4 h-4 text-emerald-600 rounded"
                        />
                        <span className="text-sm">{item.emoji} {item.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAdvancedEquipment(!showAdvancedEquipment)}
                  className="w-full mt-4 py-3 px-4 bg-gray-100 hover:bg-gray-200 rounded-xl text-sm font-semibold text-gray-600 transition"
                >
                  {showAdvancedEquipment ? '- Less options' : '+ More options'}
                </button>

                {showAdvancedEquipment && (
                  <div className="mt-4 space-y-4">
                    <div className="p-3 bg-cyan-50 rounded-xl">
                      <h4 className="text-xs font-bold text-cyan-600 mb-2">Water & Bathroom</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { key: 'freshWaterTank', label: 'Fresh Water Tank' },
                          { key: 'greyWaterTank', label: 'Grey Water Tank' },
                          { key: 'outdoorShower', label: 'Outdoor Shower' },
                          { key: 'portaPotti', label: 'Porta Potti' },
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-cyan-100 transition text-sm">
                            <input
                              type="checkbox"
                              checked={formData.equipment[item.key]}
                              onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, [item.key]: e.target.checked } })}
                              className="w-4 h-4 text-cyan-600 rounded"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-yellow-50 rounded-xl">
                      <h4 className="text-xs font-bold text-yellow-600 mb-2">Power</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { key: 'splitCharger', label: 'Charges While Driving' },
                          { key: 'inverter', label: '230V Inverter' },
                          { key: 'usb', label: 'USB Ports' },
                          { key: 'ledLights', label: 'LED Lights' },
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-yellow-100 transition text-sm">
                            <input
                              type="checkbox"
                              checked={formData.equipment[item.key]}
                              onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, [item.key]: e.target.checked } })}
                              className="w-4 h-4 text-yellow-600 rounded"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div className="p-3 bg-rose-50 rounded-xl">
                      <h4 className="text-xs font-bold text-rose-600 mb-2">Comfort & Vehicle</h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        {[
                          { key: 'dieselHeater', label: 'Diesel Heater' },
                          { key: 'roofFan', label: 'Roof Fan' },
                          { key: 'insulation', label: 'Insulated' },
                          { key: 'awning', label: 'Awning' },
                          { key: 'reverseCamera', label: 'Reverse Camera' },
                          { key: 'bluetooth', label: 'Bluetooth' },
                          { key: 'bikeRack', label: 'Bike Rack' },
                          { key: 'surfRack', label: 'Surf Rack' },
                        ].map(item => (
                          <label key={item.key} className="flex items-center gap-2 p-2 bg-white rounded-lg cursor-pointer hover:bg-rose-100 transition text-sm">
                            <input
                              type="checkbox"
                              checked={formData.equipment[item.key]}
                              onChange={(e) => setFormData({ ...formData, equipment: { ...formData.equipment, [item.key]: e.target.checked } })}
                              className="w-4 h-4 text-rose-600 rounded"
                            />
                            {item.label}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div className="mt-4 p-4 bg-gray-50 rounded-xl">
                  <label className="block text-sm font-semibold text-gray-700 mb-2">Other features (optional)</label>
                  <input
                    type="text"
                    value={formData.customFeatures || ''}
                    onChange={(e) => setFormData({ ...formData, customFeatures: e.target.value })}
                    placeholder="e.g. TV, Coffee machine..."
                    className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Certifications */}
              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-xl">
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
                    <InfoTooltip
                      show={showSelfContainedTooltip}
                      onMouseEnter={() => setShowSelfContainedTooltip(true)}
                      onMouseLeave={() => setShowSelfContainedTooltip(false)}
                      title="Self-Contained"
                      emoji=""
                    >
                      Required for freedom camping in most areas of NZ.
                    </InfoTooltip>
                  </div>

                  {formData.selfContained && (
                    <div className="mt-3 ml-8 flex gap-4 flex-wrap">
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition ${formData.selfContainedType === 'green' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}>
                        <input type="radio" name="selfContainedType" value="green" checked={formData.selfContainedType === 'green'} onChange={(e) => setFormData({ ...formData, selfContainedType: e.target.value })} className="hidden" />
                        <div className="w-6 h-6 bg-green-500 rounded-full"></div>
                        <span className="font-semibold text-green-700">Green Sticker</span>
                      </label>
                      <label className={`flex items-center gap-2 px-4 py-2 rounded-lg cursor-pointer border-2 transition ${formData.selfContainedType === 'blue' ? 'border-blue-500 bg-blue-50' : 'border-gray-200'}`}>
                        <input type="radio" name="selfContainedType" value="blue" checked={formData.selfContainedType === 'blue'} onChange={(e) => setFormData({ ...formData, selfContainedType: e.target.value })} className="hidden" />
                        <div className="w-6 h-6 bg-blue-500 rounded-full"></div>
                        <span className="font-semibold text-blue-700">Blue Sticker</span>
                      </label>
                    </div>
                  )}
                </div>

                <div className="p-4 bg-gray-50 rounded-xl">
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
                    <InfoTooltip
                      show={showBuyBackTooltip}
                      onMouseEnter={() => setShowBuyBackTooltip(true)}
                      onMouseLeave={() => setShowBuyBackTooltip(false)}
                      title="Buy-Back"
                      emoji=""
                    >
                      Offer to buy back the van - great for attracting backpackers!
                    </InfoTooltip>
                  </div>

                  {formData.buyBack && (
                    <div className="mt-4 ml-8 p-4 bg-emerald-50 border-2 border-emerald-200 rounded-xl space-y-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Buy-Back Price (NZ$) *</label>
                          <input
                            type="number"
                            value={formData.buyBackPrice}
                            onChange={(e) => setFormData({ ...formData, buyBackPrice: e.target.value })}
                            placeholder="10000"
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-semibold text-gray-700 mb-2">Valid For</label>
                          <select
                            value={formData.buyBackDuration}
                            onChange={(e) => setFormData({ ...formData, buyBackDuration: e.target.value })}
                            className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none"
                          >
                            <option value="1">1 month</option>
                            <option value="2">2 months</option>
                            <option value="3">3 months</option>
                            <option value="6">6 months</option>
                            <option value="12">12 months</option>
                          </select>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Description Section with AI Assistant */}
              <div className="mt-8 p-6 bg-white border-2 border-gray-100 rounded-3xl shadow-sm">
                <div className="flex items-center mb-4">
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

              {/* Submit Button */}
              <div className="sticky bottom-4 z-10">
                <button
                  type="submit"
                  disabled={loading || images.length === 0 || !formData.title || !formData.price}
                  className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 shadow-2xl transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Publish Your Van - FREE
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
}
