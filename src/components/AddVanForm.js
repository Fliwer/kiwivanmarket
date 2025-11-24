import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';
import { X, Plus, Upload, Trash2, CheckCircle } from 'lucide-react';
import { uploadToCloudinary } from '../cloudinaryConfig';

export default function AddVanForm({ onClose, onSuccess }) {
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
    features: []
  });

  const [featureInput, setFeatureInput] = useState('');

  // Upload d'image avec preview immédiat
  const handleImageUpload = async (file) => {
    if (images.length >= 5) {
      alert('⚠️ Maximum 5 photos !');
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert('⚠️ Fichier non valide !');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('⚠️ Image trop grande (max 10MB)');
      return;
    }

    const newIndex = images.length;
    setUploadingIndex(newIndex);

    // Preview local IMMÉDIAT
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
      alert('❌ Erreur upload');
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
      alert('⚠️ Remplis tous les champs obligatoires !');
      return;
    }

    if (images.length === 0) {
      alert('⚠️ Ajoute au moins 1 photo !');
      return;
    }

    setLoading(true);

    try {
      const imageUrls = images.map(img => img.url);

      const vanData = {
        ...formData,
        price: parseInt(formData.price),
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        capacity: parseInt(formData.capacity),
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
        wofExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        regoExpiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await addDoc(collection(db, 'vans'), vanData);

      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');

      alert('✅ Van ajouté !');
      onSuccess && onSuccess();
      onClose();
      window.location.reload();
      
    } catch (error) {
      console.error('Error:', error);
      alert('❌ Erreur');
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
          <h2 className="text-3xl font-black text-gray-900 mb-2">🚐 Add New Van</h2>
          <p className="text-gray-600 mb-8">Upload photos and fill in details</p>

          <form onSubmit={handleSubmit}>
            
            {/* PHOTOS SECTION - GRILLE MODERNE */}
            <div className="mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                Photos ({images.length}/5)
              </h3>

              {/* Grille de photos */}
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
                        Principale
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

                {/* Bouton d'ajout */}
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
                  <span>Au moins 1 photo requise</span>
                </p>
              )}
            </div>

            {/* BASIC INFO */}
            <div className="grid md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Titre *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Prix (NZ$) *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Ville *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Région *</label>
                <select
                  value={formData.region}
                  onChange={(e) => setFormData({...formData, region: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors">
                  <option>North Island</option>
                  <option>South Island</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Année *</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Kilométrage *</label>
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
                <label className="block text-sm font-semibold text-gray-700 mb-2">Capacité</label>
                <input
                  type="number"
                  value={formData.capacity}
                  onChange={(e) => setFormData({...formData, capacity: e.target.value})}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:outline-none transition-colors"
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
                <label className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-2 rounded-lg transition-colors">
                  <input
                    type="checkbox"
                    checked={formData.buyBack}
                    onChange={(e) => setFormData({...formData, buyBack: e.target.checked})}
                    className="w-5 h-5 text-emerald-600 rounded focus:ring-emerald-500"
                  />
                  <span className="font-medium text-gray-700">Buy-Back Available</span>
                </label>
              </div>
            </div>

            {/* BUTTONS */}
            <div className="flex gap-4">
              <button
                type="button"
                onClick={onClose}
                disabled={loading}
                className="flex-1 bg-gray-200 text-gray-700 py-4 rounded-xl font-bold text-lg hover:bg-gray-300 transition-colors disabled:opacity-50">
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || images.length === 0}
                className="flex-1 bg-gradient-to-r from-emerald-600 to-teal-600 text-white py-4 rounded-xl font-bold text-lg hover:from-emerald-700 hover:to-teal-700 shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed">
                {loading ? '⏳ Ajout en cours...' : '✅ Ajouter le Van'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}