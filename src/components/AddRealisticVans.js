// ============================================
// 🚐 VANS RÉALISTES AVEC VRAIES PHOTOS
// URLs vérifiées depuis Pexels & Unsplash (100% libres de droits)
// Recherche manuelle effectuée - Photos authentiques de campervans
// ============================================

import React, { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../AuthContext';

const REALISTIC_VANS = [
  {
    title: "Toyota Hiace 2015 - Self-Contained Certified",
    price: 18500,
    location: "Auckland",
    region: "North Island",
    year: 2015,
    mileage: 145000,
    type: "Campervan",
    description: "Perfect backpacker van! Self-contained certified with fresh WOF. Fully equipped with solar panels, fridge, and sleeping area. Ready for your NZ adventure!",
    imageUrl: "https://images.pexels.com/photos/19548262/pexels-photo-19548262.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/19548262/pexels-photo-19548262.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Self-Contained", "Solar 200W", "Fridge", "Fresh WOF", "Queen Bed", "Kitchen"],
    selfContained: true,
    featured: true,
    buyBack: true,
    capacity: 2,
    wofExpiry: new Date(2025, 11, 15),
    regoExpiry: new Date(2025, 10, 20)
  },
  {
    title: "Ford Transit 2018 - Luxury Conversion",
    price: 35000,
    location: "Wellington",
    region: "North Island",
    year: 2018,
    mileage: 89000,
    type: "Campervan",
    description: "High-end conversion with full amenities. Shower, toilet, kitchen, and comfortable living space. Perfect for long-term travel!",
    imageUrl: "https://images.pexels.com/photos/1906155/pexels-photo-1906155.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/1906155/pexels-photo-1906155.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Self-Contained", "Shower", "Toilet", "Solar 300W", "Diesel Heater", "Hot Water"],
    selfContained: true,
    featured: true,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2026, 2, 10),
    regoExpiry: new Date(2026, 1, 5)
  },
  {
    title: "Volkswagen T5 2012 - California Style",
    price: 28000,
    location: "Christchurch",
    region: "South Island",
    year: 2012,
    mileage: 156000,
    type: "Campervan",
    description: "Classic VW campervan with pop-up roof. Iconic design, reliable engine, and ready for adventures. Fresh service and WOF.",
    imageUrl: "https://images.pexels.com/photos/210010/pexels-photo-210010.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/210010/pexels-photo-210010.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Pop-up Roof", "Kitchen", "Fridge", "Solar 150W", "Swivel Seats", "Storage"],
    selfContained: false,
    featured: false,
    buyBack: true,
    capacity: 4,
    wofExpiry: new Date(2025, 8, 25),
    regoExpiry: new Date(2025, 7, 15)
  },
  {
    title: "Mercedes Sprinter 2017 - 4WD Adventure Van",
    price: 42000,
    location: "Queenstown",
    region: "South Island",
    year: 2017,
    mileage: 95000,
    type: "Campervan",
    description: "Ultimate adventure van with 4WD capability. Perfect for exploring off-grid locations. Premium build quality with all amenities.",
    imageUrl: "https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1464219789935-c2d9d9aba644?w=800&q=80"],
    features: ["4WD", "Self-Contained", "Shower", "Toilet", "Solar 400W", "Diesel Heater"],
    selfContained: true,
    featured: true,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2026, 5, 20),
    regoExpiry: new Date(2026, 4, 10)
  },
  {
    title: "Nissan Elgrand 2005 - Budget Friendly",
    price: 7200,
    location: "Auckland",
    region: "North Island",
    year: 2005,
    mileage: 189000,
    type: "Van",
    description: "Affordable option for budget travelers. Basic conversion with sleeping area and storage. Reliable and economical.",
    imageUrl: "https://images.pexels.com/photos/2526935/pexels-photo-2526935.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/2526935/pexels-photo-2526935.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Sleeping Area", "Storage", "Curtains", "Basic Kitchen"],
    selfContained: false,
    featured: false,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2025, 3, 12),
    regoExpiry: new Date(2025, 2, 8)
  },
  {
    title: "Subaru Sambar 2005 - Compact Adventure",
    price: 7200,
    location: "Rotorua",
    region: "North Island",
    year: 2005,
    mileage: 189000,
    type: "Van",
    description: "Cute and compact campervan perfect for solo travelers or couples. Great fuel economy and easy to drive.",
    imageUrl: "https://images.pexels.com/photos/1112526/pexels-photo-1112526.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/1112526/pexels-photo-1112526.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Solar", "Fridge", "WOF"],
    selfContained: false,
    featured: false,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2025, 5, 18),
    regoExpiry: new Date(2025, 4, 22)
  },
  {
    title: "Mitsubishi Delica 2008 - 4WD Adventure",
    price: 12800,
    location: "Queenstown",
    region: "South Island",
    year: 2008,
    mileage: 198000,
    type: "Campervan",
    description: "Popular 4WD campervan with pop-up roof. Great for exploring New Zealand's backcountry. Well maintained.",
    imageUrl: "https://images.pexels.com/photos/1555453/pexels-photo-1555453.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/1555453/pexels-photo-1555453.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["4WD", "Pop-up Roof", "Solar", "Fridge", "Kitchen"],
    selfContained: false,
    featured: false,
    buyBack: true,
    capacity: 4,
    wofExpiry: new Date(2025, 9, 5),
    regoExpiry: new Date(2025, 8, 1)
  },
  {
    title: "Mazda Bongo 2006 - Budget Friendly",
    price: 9800,
    location: "Hamilton",
    region: "North Island",
    year: 2006,
    mileage: 175000,
    type: "Van",
    description: "Reliable Mazda Bongo with rock and roll bed. Perfect starter van for budget travelers. Fresh WOF.",
    imageUrl: "https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/210243/pexels-photo-210243.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Rock and Roll Bed", "Sink", "Storage", "WOF"],
    selfContained: false,
    featured: false,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2025, 6, 30),
    regoExpiry: new Date(2025, 5, 25)
  },
  {
    title: "Volkswagen Crafter 2019 - Modern Living",
    price: 42000,
    location: "Auckland",
    region: "North Island",
    year: 2019,
    mileage: 65000,
    type: "Campervan",
    description: "Nearly new VW Crafter with professional conversion. Standing height, shower, toilet, and premium fittings throughout.",
    imageUrl: "https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1527786356703-4b100091cd2c?w=800&q=80"],
    features: ["Self-Contained", "Shower", "Toilet", "Solar 350W", "Diesel Heater", "Standing Height"],
    selfContained: true,
    featured: true,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2026, 8, 15),
    regoExpiry: new Date(2026, 7, 10)
  },
  {
    title: "Fiat Ducato 2016 - Self-Contained",
    price: 28500,
    location: "Wellington",
    region: "North Island",
    year: 2016,
    mileage: 128000,
    type: "Campervan",
    description: "Spacious Fiat Ducato with self-contained certification. Comfortable for long-term travel with all amenities.",
    imageUrl: "https://images.pexels.com/photos/2580312/pexels-photo-2580312.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/2580312/pexels-photo-2580312.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Self-Contained", "Solar 250W", "Fridge", "Toilet", "Shower", "Kitchen"],
    selfContained: true,
    featured: false,
    buyBack: true,
    capacity: 2,
    wofExpiry: new Date(2026, 1, 20),
    regoExpiry: new Date(2025, 12, 15)
  },
  {
    title: "Renault Master 2014 - Compact & Efficient",
    price: 22500,
    location: "Taupo",
    region: "North Island",
    year: 2014,
    mileage: 142000,
    type: "Campervan",
    description: "Well-maintained Renault Master with practical conversion. Great fuel economy and easy to park. Perfect for couples.",
    imageUrl: "https://images.unsplash.com/photo-1622688421187-05f908d447c2?w=800&q=80",
    images: ["https://images.unsplash.com/photo-1622688421187-05f908d447c2?w=800&q=80"],
    features: ["Solar 150W", "Fridge", "Kitchen", "Storage", "WOF"],
    selfContained: false,
    featured: false,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2025, 10, 8),
    regoExpiry: new Date(2025, 9, 3)
  },
  {
    title: "Toyota Regius 2003 - Reliable Classic",
    price: 8500,
    location: "Christchurch",
    region: "South Island",
    year: 2003,
    mileage: 215000,
    type: "Van",
    description: "Reliable Toyota with basic campervan conversion. Perfect for budget-conscious travelers. Well-maintained engine.",
    imageUrl: "https://images.pexels.com/photos/771657/pexels-photo-771657.jpeg?auto=compress&cs=tinysrgb&w=800",
    images: ["https://images.pexels.com/photos/771657/pexels-photo-771657.jpeg?auto=compress&cs=tinysrgb&w=800"],
    features: ["Sleeping Area", "Curtains", "Storage", "WOF"],
    selfContained: false,
    featured: false,
    buyBack: false,
    capacity: 2,
    wofExpiry: new Date(2025, 4, 15),
    regoExpiry: new Date(2025, 3, 10)
  }
];

export default function AddRealisticVans({ onClose }) {
  const { currentUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [status, setStatus] = useState('');

  const addVans = async () => {
    if (!currentUser) {
      alert('❌ Tu dois être connecté !');
      return;
    }

    if (!window.confirm(`⚠️ Tu vas ajouter ${REALISTIC_VANS.length} vans réalistes avec de VRAIES photos de campervans.\n\n✅ Photos recherchées manuellement\n✅ 100% libres de droits (Pexels & Unsplash)\n\nContinuer ?`)) {
      return;
    }

    setLoading(true);
    setStatus('Ajout des vans en cours...');
    
    try {
      for (let i = 0; i < REALISTIC_VANS.length; i++) {
        const van = REALISTIC_VANS[i];
        
        const vanData = {
          ...van,
          seller: {
            uid: currentUser.uid,
            name: currentUser.displayName || 'Paul Morthier',
            email: currentUser.email,
            rating: 5,
            phone: 'Not provided'
          },
          views: Math.floor(Math.random() * 500) + 50,
          postedDays: Math.floor(Math.random() * 10) + 1,
          createdAt: new Date(),
          updatedAt: new Date()
        };

        await addDoc(collection(db, 'vans'), vanData);
        
        setProgress(i + 1);
        setStatus(`✅ ${i + 1}/${REALISTIC_VANS.length} vans ajoutés`);
        
        console.log(`✅ Van ajouté: ${van.title}`);
      }

      // Invalider le cache
      localStorage.removeItem('kiwiVanMarket_vans');
      localStorage.removeItem('kiwiVanMarket_timestamp');
      
      alert(`🎉 ${REALISTIC_VANS.length} vans réalistes ajoutés avec succès !\n\n📸 Photos authentiques de campervans\n✅ 100% libres de droits\n\nLa page va se recharger.`);
      onClose();
      window.location.reload();
      
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert('❌ Erreur lors de l\'ajout des vans');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-8">
        <h2 className="text-2xl font-bold mb-4">🚐 Ajouter des Vans Réalistes</h2>
        
        <p className="text-gray-600 mb-6">
          Cette action va ajouter <strong>{REALISTIC_VANS.length} vans</strong> avec de VRAIES photos de campervans recherchées manuellement.
        </p>

        <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 mb-6">
          <p className="text-sm text-emerald-800 font-semibold">
            ✅ Photos authentiques de campervans
          </p>
          <p className="text-xs text-emerald-600 mt-1">
            Sources : Pexels & Unsplash • 100% libres de droits • Usage commercial autorisé
          </p>
        </div>

        {loading && (
          <div className="mb-6">
            <div className="bg-gray-200 rounded-full h-4 mb-2">
              <div 
                className="bg-emerald-600 h-4 rounded-full transition-all duration-300"
                style={{ width: `${(progress / REALISTIC_VANS.length) * 100}%` }}
              ></div>
            </div>
            <p className="text-sm text-gray-600 text-center">{status}</p>
          </div>
        )}

        <div className="flex gap-3">
          <button 
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 py-3 rounded-lg font-semibold hover:bg-gray-300 transition disabled:opacity-50">
            Annuler
          </button>
          <button 
            onClick={addVans}
            disabled={loading}
            className="flex-1 bg-emerald-600 text-white py-3 rounded-lg font-semibold hover:bg-emerald-700 transition disabled:opacity-50">
            {loading ? 'Ajout...' : 'Ajouter les Vans'}
          </button>
        </div>
      </div>
    </div>
  );
}