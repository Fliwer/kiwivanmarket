import React, { useState } from 'react';
import { X, Plus, Upload, CheckCircle, AlertCircle } from 'lucide-react';
import { useAuth } from '../AuthContext';
import { db, storage } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export default function AddVanForm({ onClose, onVanAdded }) {
  const { currentUser } = useAuth();
  
  // États du formulaire
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    year: '',
    mileage: '',
    capacity: '2',
    type: 'Campervan',
    location: '',
    region: 'North Island',
    description: '',
    features: '',
    wofExpiry: '',
    regoExpiry: '',
    selfContained: false,
    buyBack: false
  });
  
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  // Gestion du changement des champs
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  // Gestion de l'upload d'images
  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    
    // Limiter à 5 images
    if (files.length > 5) {
      setError('Maximum 5 images allowed');
      return;
    }
    
    // Vérifier la taille des fichiers (max 5MB par image)
    const validFiles = files.filter(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError(`${file.name} is too large (max 5MB)`);
        return false;
      }
      return true;
    });
    
    setImages(validFiles);
    setError('');
  };

  // Upload des images vers Firebase Storage
  const uploadImages = async () => {
    if (images.length === 0) return [];
    
    const uploadPromises = images.map(async (image, index) => {
      const imageName = `${Date.now()}_${index}_${image.name}`;
      const storageRef = ref(storage, `vans/${currentUser.uid}/${imageName}`);
      
      await uploadBytes(storageRef, image);
      const downloadURL = await getDownloadURL(storageRef);
      
      return downloadURL;
    });
    
    return await Promise.all(uploadPromises);
  };

  // Validation du formulaire
  const validateForm = () => {
    if (!formData.title.trim()) {
      setError('Van title is required');
      return false;
    }
    
    if (!formData.price || parseFloat(formData.price) <= 0) {
      setError('Valid price is required');
      return false;
    }
    
    if (!formData.year || parseInt(formData.year) < 1990 || parseInt(formData.year) > new Date().getFullYear() + 1) {
      setError('Valid year is required (1990-' + (new Date().getFullYear() + 1) + ')');
      return false;
    }
    
    if (!formData.mileage || parseFloat(formData.mileage) < 0) {
      setError('Valid mileage is required');
      return false;
    }
    
    if (!formData.location.trim()) {
      setError('Location is required');
      return false;
    }
    
    if (!formData.description.trim()) {
      setError('Description is required');
      return false;
    }
    
    if (images.length === 0) {
      setError('At least 1 image is required');
      return false;
    }
    
    return true;
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    setError('');
    
    try {
      // 1. Upload des images
      console.log('📸 Uploading images...');
      const imageUrls = await uploadImages();
      console.log('✅ Images uploaded:', imageUrls.length);
      
      // 2. Préparer les features (convertir la string en array)
      const featuresArray = formData.features
        .split(',')
        .map(f => f.trim())
        .filter(f => f.length > 0);
      
      // 3. Créer le document van
      const vanData = {
        title: formData.title,
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        capacity: parseInt(formData.capacity),
        type: formData.type,
        location: formData.location,
        region: formData.region,
        description: formData.description,
        features: featuresArray.length > 0 ? featuresArray : ['No features listed'],
        wofExpiry: formData.wofExpiry || null,
        regoExpiry: formData.regoExpiry || null,
        selfContained: formData.selfContained,
        buyBack: formData.buyBack,
        images: imageUrls,
        imageUrl: imageUrls[0], // Première image comme image principale
        
        // Informations du vendeur
        seller: {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email,
          phone: currentUser.phone || 'Not provided',
          rating: 5.0 // Rating par défaut
        },
        
        // Métadonnées
        featured: false,
        postedDays: 0,
        views: 0,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      };
      
      console.log('💾 Saving to Firestore...');
      const docRef = await addDoc(collection(db, 'vans'), vanData);
      console.log('✅ Van added with ID:', docRef.id);
      
      // 4. Succès !
      setSuccess(true);
      
      // 5. Notifier le parent et fermer après 2 secondes
      setTimeout(() => {
        if (onVanAdded) onVanAdded();
        onClose();
      }, 2000);
      
    } catch (error) {
      console.error('❌ Error adding van:', error);
      setError(error.message || 'Failed to add van. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-y-auto">
      <div className="bg-white rounded-2xl max-w-2xl w-full my-8 p-8 relative">
        <button 
          onClick={onClose} 
          disabled={loading}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 disabled:opacity-50">
          <X size={24} />
        </button>
        
        <h2 className="text-3xl font-bold mb-6">Add Your Van</h2>
        
        {/* Messages d'erreur et de succès */}
        {error && (
          <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
            <AlertCircle size={20} />
            <span>{error}</span>
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2 text-green-700">
            <CheckCircle size={20} />
            <span>Van added successfully! Redirecting...</span>
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Titre et Prix */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Van Title *</label>
              <input 
                type="text" 
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g. Toyota Hiace 2015 - Self-Contained" 
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Price (NZD) *</label>
              <input 
                type="number" 
                name="price"
                value={formData.price}
                onChange={handleChange}
                placeholder="18500" 
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
              />
            </div>
          </div>

          {/* Year, Mileage, Capacity */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Year *</label>
              <input 
                type="number" 
                name="year"
                value={formData.year}
                onChange={handleChange}
                placeholder="2015" 
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Mileage (km) *</label>
              <input 
                type="number" 
                name="mileage"
                value={formData.mileage}
                onChange={handleChange}
                placeholder="145000" 
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Capacity *</label>
              <select 
                name="capacity"
                value={formData.capacity}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100">
                <option value="2">2 people</option>
                <option value="3">3 people</option>
                <option value="4">4 people</option>
                <option value="5">5+ people</option>
              </select>
            </div>
          </div>

          {/* Type, Location, Region */}
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">Type *</label>
              <select 
                name="type"
                value={formData.type}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100">
                <option>Campervan</option>
                <option>Van</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Location *</label>
              <input 
                type="text" 
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Auckland" 
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Region *</label>
              <select 
                name="region"
                value={formData.region}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100">
                <option>North Island</option>
                <option>South Island</option>
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold mb-2">Description *</label>
            <textarea 
              name="description"
              value={formData.description}
              onChange={handleChange}
              rows="4" 
              placeholder="Describe your van..."
              disabled={loading}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100">
            </textarea>
          </div>

          {/* Features */}
          <div>
            <label className="block text-sm font-semibold mb-2">Features (comma separated)</label>
            <input 
              type="text" 
              name="features"
              value={formData.features}
              onChange={handleChange}
              placeholder="Solar, Fridge, Fresh WOF, Kitchen" 
              disabled={loading}
              className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
            />
          </div>

          {/* WOF et Rego */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-2">WOF Expiry</label>
              <input 
                type="date" 
                name="wofExpiry"
                value={formData.wofExpiry}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-2">Rego Expiry</label>
              <input 
                type="date" 
                name="regoExpiry"
                value={formData.regoExpiry}
                onChange={handleChange}
                disabled={loading}
                className="w-full px-4 py-3 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none disabled:bg-gray-100" 
              />
            </div>
          </div>

          {/* Checkboxes */}
          <div className="flex items-center gap-6">
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="selfContained"
                checked={formData.selfContained}
                onChange={handleChange}
                disabled={loading}
                className="w-5 h-5 text-emerald-600 rounded" 
              />
              <span className="font-semibold">Self-Contained Certified</span>
            </label>
            <label className="flex items-center gap-2">
              <input 
                type="checkbox" 
                name="buyBack"
                checked={formData.buyBack}
                onChange={handleChange}
                disabled={loading}
                className="w-5 h-5 text-emerald-600 rounded" 
              />
              <span className="font-semibold">Buy-Back Option</span>
            </label>
          </div>

          {/* Upload Photos */}
          <div>
            <label className="block text-sm font-semibold mb-2">Upload Photos * (Max 5, 5MB each)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-emerald-500 transition cursor-pointer">
              <input 
                type="file" 
                accept="image/*"
                multiple
                onChange={handleImageChange}
                disabled={loading}
                className="hidden" 
                id="imageUpload"
              />
              <label htmlFor="imageUpload" className="cursor-pointer">
                {images.length === 0 ? (
                  <>
                    <Upload size={48} className="mx-auto text-gray-400 mb-2" />
                    <p className="text-gray-600">Click to upload or drag and drop</p>
                    <p className="text-sm text-gray-400">PNG, JPG up to 5MB (max 5 images)</p>
                  </>
                ) : (
                  <>
                    <CheckCircle size={48} className="mx-auto text-emerald-600 mb-2" />
                    <p className="text-gray-600 font-semibold">{images.length} image(s) selected</p>
                    <p className="text-sm text-gray-400">Click to change</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Boutons */}
          <div className="flex gap-4">
            <button 
              type="button" 
              onClick={onClose}
              disabled={loading}
              className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50">
              Cancel
            </button>
            <button 
              type="submit" 
              disabled={loading}
              className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50 flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Plus size={20} />
                  Add Your Van
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}