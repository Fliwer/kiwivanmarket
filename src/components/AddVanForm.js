import React, { useState, useEffect } from 'react';
import { collection, addDoc, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { X, Plus, Upload, Trash2, CheckCircle } from 'lucide-react';
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
    type: 'Campervan',
    description: '',
    capacity: 2,
    selfContained: false,
    featured: false,
    buyBack: false,
    buyBackPrice: '',
    buyBackDuration: '3',
    buyBackMaxKm: '',
    buyBackConditions: '',
    features: [],
    wofExpiry: '',
    regoExpiry: ''
  });

  // Charger les données du van en mode édition
  useEffect(() => {
    if (editMode && vanData) {
      setFormData({
        title: vanData.title || '',
        price: vanData.price?.toString() || '',
        location: vanData.location || '',
        region: vanData.region || 'North Island',
        year: vanData.year || new Date().getFullYear(),
        mileage: vanData.mileage?.toString() || '',
        type: vanData.type || 'Campervan',
        description: vanData.description || '',
        capacity: vanData.capacity || 2,
        selfContained: vanData.selfContained || false,
        featured: vanData.featured || false,
        buyBack: vanData.buyBack || false,
        buyBackPrice: vanData.buyBackPrice?.toString() || '',
        buyBackDuration: vanData.buyBackDuration?.toString() || '3',
        buyBackMaxKm: vanData.buyBackMaxKm?.toString() || '',
        buyBackConditions: vanData.buyBackConditions || '',
        features: vanData.features || [],
        wofExpiry: vanData.wofExpiry ? vanData.wofExpiry.split('T')[0] : '',
        regoExpiry: vanData.regoExpiry ? vanData.regoExpiry.split('T')[0] : ''
      });
      
      // Charger les images existantes
      if (vanData.images && vanData.images.length > 0) {
        setImages(vanData.images.map(url => ({ url, uploading: false })));
      } else if (vanData.imageUrl) {
        setImages([{ url: vanData.imageUrl, uploading: false }]);
      }
    }
  }, [editMode, vanData]);

  const [featureInput, setFeatureInput] = useState('');
  const [showBuyBackTooltip, setShowBuyBackTooltip] = useState(false);

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

  const addFeature = () => {
    if (featureInput.trim()) {
      setFormData({
        ...formData,
        features: [...formData.features, featureInput.trim()]
      });
      setFeatureInput('');
    }
  };

  const removeFeature = (index) => {
    setFormData({
      ...formData,
      features: formData.features.filter((_, i) => i !== index)
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.price || !formData.location) {
      alert('⚠️ Please fill all required fields!');
      return;
    }

    if (!formData.wofExpiry || !formData.regoExpiry) {
      alert('⚠️ Please enter WOF and REGO expiry dates!');
      return;
    }

    if (formData.buyBack && !formData.buyBackPrice) {
      alert('⚠️ Please enter the buy-back price!');
      return;
    }

    if (images.length === 0) {
      alert('⚠️ Please add at least 1 photo!');
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
          featured: formData.featured,
          buyBack: formData.buyBack,
          buyBackPrice: formData.buyBack ? parseInt(formData.buyBackPrice) || 0 : null,
          buyBackDuration: formData.buyBack ? parseInt(formData.buyBackDuration) : null,
          buyBackMaxKm: formData.buyBack && formData.buyBackMaxKm ? parseInt(formData.buyBackMaxKm) : null,
          buyBackConditions: formData.buyBack ? formData.buyBackConditions : '',
          features: formData.features,
          wofExpiry: formData.wofExpiry,
          regoExpiry: formData.regoExpiry,
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
          featured: formData.featured,
          buyBack: formData.buyBack,
          buyBackPrice: formData.buyBack ? parseInt(formData.buyBackPrice) || 0 : null,
          buyBackDuration: formData.buyBack ? parseInt(formData.buyBackDuration) : null,
          buyBackMaxKm: formData.buyBack && formData.buyBackMaxKm ? parseInt(formData.buyBackMaxKm) : null,
          buyBackConditions: formData.buyBack ? formData.buyBackConditions : '',
          features: formData.features,
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
          postedDays: 0,
          wofExpiry: formData.wofExpiry,
          regoExpiry: formData.regoExpiry,
          createdAt: new Date(),
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

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative shadow-2xl">
        
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({...formData, title: e.target.value})}
                  placeholder="Toyota Hiace 2015"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
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
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({...formData, location: e.target.value})}
                  placeholder="Auckland"
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({...formData, type: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors">
                  <option>Campervan</option>
                  <option>Van</option>
                  <option>Motorhome</option>
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

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  WOF Expiry *
                  <span className="text-gray-400 font-normal ml-1">(Warrant of Fitness)</span>
                </label>
                <input
                  type="date"
                  value={formData.wofExpiry}
                  onChange={(e) => setFormData({...formData, wofExpiry: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  REGO Expiry *
                  <span className="text-gray-400 font-normal ml-1">(Registration)</span>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description *</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Perfect backpacker van..."
                rows={4}
                className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors resize-none"
                required
              />
            </div>

            {/* FEATURES */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Features</label>
              <div className="flex gap-2 mb-3">
                <input
                  type="text"
                  value={featureInput}
                  onChange={(e) => setFeatureInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                  placeholder="Solar, Fridge, etc."
                  className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                />
                <button
                  type="button"
                  onClick={addFeature}
                  className="bg-emerald-600 text-white px-6 rounded-xl font-semibold hover:bg-emerald-700 transition-colors">
                  <Plus size={20} />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.features.map((feature, index) => (
                  <div 
                    key={index}
                    className="bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg flex items-center gap-2">
                    <span className="text-sm font-semibold text-gray-900">{feature}</span>
                    <button
                      type="button"
                      onClick={() => removeFeature(index)}
                      className="text-red-500 hover:text-red-700 transition-colors">
                      <X size={16} />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* OPTIONS */}
            <div className="mb-8">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Options</label>
              <div className="space-y-2">
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.selfContained}
                    onChange={(e) => setFormData({...formData, selfContained: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-medium text-gray-700">Self-Contained Certified</span>
                </label>
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.featured}
                    onChange={(e) => setFormData({...formData, featured: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-medium text-gray-700">Featured Listing</span>
                </label>
                <div className="flex items-center gap-2 hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <label className="flex items-center gap-3 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.buyBack}
                      onChange={(e) => setFormData({...formData, buyBack: e.target.checked})}
                      className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                    />
                    <span className="font-medium text-gray-700">Buy-Back Available</span>
                  </label>
                  {/* Tooltip explicatif */}
                  <div className="relative">
                    <div 
                      onMouseEnter={() => setShowBuyBackTooltip(true)}
                      onMouseLeave={() => setShowBuyBackTooltip(false)}
                      className="bg-gray-200 hover:bg-emerald-500 hover:text-white rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold text-gray-600 cursor-help transition">
                      ?
                    </div>
                    {showBuyBackTooltip && (
                      <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 w-72 bg-gray-900 text-white text-sm p-4 rounded-xl shadow-2xl z-50">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="text-emerald-400 font-bold">🛡️ Buy-Back Guarantee</span>
                        </div>
                        <p className="text-gray-300 leading-relaxed text-xs">
                          Offer to buy back the van at an agreed price if the buyer returns it within a specified period. 
                          <span className="text-white font-semibold"> Great for attracting backpackers!</span>
                        </p>
                        <div className="absolute left-1/2 -translate-x-1/2 -bottom-2 w-4 h-4 bg-gray-900 rotate-45"></div>
                      </div>
                    )}
                  </div>
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