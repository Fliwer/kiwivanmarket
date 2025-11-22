import React, { useState } from 'react';
import { X, Upload, Loader, Calendar, Shield } from 'lucide-react';
import { db } from '../firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useAuth } from '../AuthContext';
import { uploadToCloudinary } from '../cloudinaryConfig';

export default function AddVanForm({ onClose, onVanAdded }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    price: '',
    year: '',
    mileage: '',
    location: '',
    description: '',
    condition: 'Good',
    fuelType: 'Diesel',
    transmission: 'Manual',
    beds: '',
    seats: '',
    wofExpiry: '',
    regoExpiry: '',
    buyBack: false,
    buyBackPrice: '',
    buyBackDuration: '',
    buyBackConditions: ''
  });

  const handleImageSelect = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!currentUser) {
      alert('You must be logged in to add a van');
      return;
    }

    if (!imageFile) {
      alert('Please select an image');
      return;
    }

    // Validation Buy-Back
    if (formData.buyBack) {
      if (!formData.buyBackPrice || !formData.buyBackDuration) {
        alert('Please fill in buy-back guarantee price and duration');
        return;
      }
      const buyBackPrice = parseFloat(formData.buyBackPrice);
      const salePrice = parseFloat(formData.price);
      if (!salePrice || buyBackPrice >= salePrice) {
        alert('Buy-back price must be lower than sale price');
        return;
      }
    }

    setLoading(true);

    try {
      console.log('📤 Uploading image to Cloudinary...');
      
      // Upload vers Cloudinary
      const uploadResult = await uploadToCloudinary(imageFile);
      console.log('✅ Image uploaded:', uploadResult.url);

      // Créer le van dans Firestore
      const vanData = {
        title: formData.title.trim(),
        price: parseFloat(formData.price),
        year: parseInt(formData.year),
        mileage: parseInt(formData.mileage),
        location: formData.location.trim(),
        description: formData.description.trim(),
        condition: formData.condition,
        fuelType: formData.fuelType,
        transmission: formData.transmission,
        beds: parseInt(formData.beds) || 0,
        seats: parseInt(formData.seats) || 0,
        imageUrl: uploadResult.url,
        cloudinaryId: uploadResult.publicId,
        sellerId: currentUser.uid,
        seller: {
          uid: currentUser.uid,
          name: currentUser.displayName || 'Anonymous',
          email: currentUser.email
        },
        wofExpiry: formData.wofExpiry || null,
        regoExpiry: formData.regoExpiry || null,
        buyBack: formData.buyBack,
        createdAt: serverTimestamp(),
        status: 'active'
      };

      // Ajouter buy-back details si activé
      if (formData.buyBack) {
        const durationMonths = parseInt(formData.buyBackDuration);
        const offerValidUntil = new Date();
        offerValidUntil.setMonth(offerValidUntil.getMonth() + durationMonths);

        vanData.buyBackDetails = {
          guaranteedPrice: parseFloat(formData.buyBackPrice),
          duration: durationMonths,
          conditions: formData.buyBackConditions || 'Standard conditions apply',
          offerValidUntil: offerValidUntil.toISOString()
        };
      }

      const docRef = await addDoc(collection(db, 'vans'), vanData);
      console.log('✅ Van added with ID:', docRef.id);

      alert('Van added successfully! 🎉');
      onVanAdded();
      onClose();
    } catch (error) {
      console.error('❌ Error adding van:', error);
      alert('Error adding van: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto relative">
        <button 
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 bg-white rounded-full p-2 shadow-lg z-10">
          <X size={24} />
        </button>

        <div className="p-8">
          <h2 className="text-3xl font-bold mb-6 text-emerald-600">🚐 Add Your Van</h2>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Image Upload */}
            <div>
              <label className="block text-sm font-semibold mb-2">Van Photo *</label>
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition">
                {imagePreview ? (
                  <div className="relative">
                    <img src={imagePreview} alt="Preview" className="max-h-64 mx-auto rounded" />
                    <button
                      type="button"
                      onClick={() => { setImageFile(null); setImagePreview(null); }}
                      className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600">
                      <X size={20} />
                    </button>
                  </div>
                ) : (
                  <div>
                    <Upload className="mx-auto mb-4 text-gray-400" size={48} />
                    <p className="text-gray-600 mb-2">Click to upload van image</p>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      className="hidden"
                      id="image-upload"
                    />
                    <label
                      htmlFor="image-upload"
                      className="inline-block px-4 py-2 bg-emerald-600 text-white rounded cursor-pointer hover:bg-emerald-700">
                      Choose File
                    </label>
                  </div>
                )}
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="block text-sm font-semibold mb-2">Title *</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleInputChange}
                placeholder="e.g., Toyota Hiace Campervan"
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
              />
            </div>

            {/* Price & Year */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Price (NZ$) *</label>
                <input
                  type="number"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  placeholder="25000"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Year *</label>
                <input
                  type="number"
                  name="year"
                  value={formData.year}
                  onChange={handleInputChange}
                  placeholder="2018"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Mileage & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Mileage (km) *</label>
                <input
                  type="number"
                  name="mileage"
                  value={formData.mileage}
                  onChange={handleInputChange}
                  placeholder="150000"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Location *</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  placeholder="Auckland, North Island"
                  required
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* Condition & Fuel Type */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Condition</label>
                <select
                  name="condition"
                  value={formData.condition}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Excellent</option>
                  <option>Good</option>
                  <option>Fair</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Fuel Type</label>
                <select
                  name="fuelType"
                  value={formData.fuelType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Diesel</option>
                  <option>Petrol</option>
                  <option>Hybrid</option>
                  <option>Electric</option>
                </select>
              </div>
            </div>

            {/* Transmission & Beds & Seats */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2">Transmission</label>
                <select
                  name="transmission"
                  value={formData.transmission}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none">
                  <option>Manual</option>
                  <option>Automatic</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Beds</label>
                <input
                  type="number"
                  name="beds"
                  value={formData.beds}
                  onChange={handleInputChange}
                  placeholder="2"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2">Seats</label>
                <input
                  type="number"
                  name="seats"
                  value={formData.seats}
                  onChange={handleInputChange}
                  placeholder="4"
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* ✨ NOUVEAU : WOF & Rego */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-600" />
                  WOF Expiry <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="wofExpiry"
                  value={formData.wofExpiry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-2 flex items-center gap-2">
                  <Calendar size={16} className="text-emerald-600" />
                  Rego Expiry <span className="text-gray-400 font-normal">(optional)</span>
                </label>
                <input
                  type="date"
                  name="regoExpiry"
                  value={formData.regoExpiry}
                  onChange={handleInputChange}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
            </div>

            {/* ✨ NOUVEAU : Buy-Back Guarantee */}
            <div className="border-2 border-green-200 rounded-lg p-4 bg-green-50">
              <label className="flex items-center gap-3 cursor-pointer mb-4">
                <input
                  type="checkbox"
                  name="buyBack"
                  checked={formData.buyBack}
                  onChange={handleInputChange}
                  className="w-5 h-5 text-green-600 rounded focus:ring-2 focus:ring-green-500"
                />
                <div className="flex items-center gap-2">
                  <Shield size={20} className="text-green-600" />
                  <span className="font-semibold text-green-900">Offer Buy-Back Guarantee</span>
                </div>
              </label>

              {formData.buyBack && (
                <div className="space-y-4 pl-8">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Guaranteed Buy-Back Price (NZ$) *
                      </label>
                      <input
                        type="number"
                        name="buyBackPrice"
                        value={formData.buyBackPrice}
                        onChange={handleInputChange}
                        placeholder="18000"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Duration (months) *
                      </label>
                      <input
                        type="number"
                        name="buyBackDuration"
                        value={formData.buyBackDuration}
                        onChange={handleInputChange}
                        placeholder="6"
                        className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Conditions <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      name="buyBackConditions"
                      value={formData.buyBackConditions}
                      onChange={handleInputChange}
                      rows="2"
                      placeholder="e.g., No major accidents, max 20,000 km additional mileage..."
                      className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-green-500 outline-none resize-none"
                    />
                  </div>

                  {formData.price && formData.buyBackPrice && (
                    <div className="bg-white p-3 rounded border border-green-300">
                      <p className="text-xs text-gray-600 mb-1">Estimated Total Cost</p>
                      <p className="text-sm text-gray-700">
                        Buy for <strong>NZ${parseFloat(formData.price).toLocaleString()}</strong>, 
                        sell back for <strong>NZ${parseFloat(formData.buyBackPrice).toLocaleString()}</strong> = 
                        <strong className="text-green-700"> NZ${(parseFloat(formData.price) - parseFloat(formData.buyBackPrice)).toLocaleString()} total</strong>
                        {formData.buyBackDuration && (
                          <span className="text-gray-500"> (≈ NZ${Math.round((parseFloat(formData.price) - parseFloat(formData.buyBackPrice)) / parseInt(formData.buyBackDuration))}/month)</span>
                        )}
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold mb-2">Description *</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                rows="4"
                placeholder="Describe your van, its features, condition, and any extras included..."
                required
                className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-emerald-500 outline-none resize-none"
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3 rounded-lg font-bold hover:bg-emerald-700 transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
              {loading ? (
                <>
                  <Loader className="animate-spin" size={20} />
                  Uploading...
                </>
              ) : (
                'Add Van'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}