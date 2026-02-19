import { MapPin, Shield, CheckCircle, Car, Calendar, DollarSign } from 'lucide-react';
import { Link } from 'react-router-dom';

/**
 * HomeSeoSection - Contenu SEO optimisé pour le référencement
 * Ce composant affiche du texte riche en mots-clés pour Google
 * tout en restant utile et lisible pour les utilisateurs.
 */
export default function HomeSeoSection() {
  return (
    <section className="bg-gradient-to-b from-gray-50 to-white py-16">
      <div className="max-w-7xl mx-auto px-4">

        {/* Section principale SEO */}
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Buy & Sell Campervans in New Zealand
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Kiwi Van Market is New Zealand's dedicated marketplace for **affordable campervans** and sleeper vans.
            Whether you're a **backpacker** looking for your first adventure vehicle or selling your van
            at the end of your trip, we connect buyers and sellers across Auckland, Wellington,
            Christchurch, Queenstown, and all of NZ.
          </p>
        </div>

        {/* Grid de features SEO */}
        <div className="grid md:grid-cols-3 gap-8 mb-16">

          {/* Self-Contained */}
          <article className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mb-4">
              <Shield className="w-7 h-7 text-blue-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Self-Contained Campervans
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Find certified self-contained vehicles that meet NZ freedom camping regulations.
              Our listings clearly show which vans have the blue self-containment sticker,
              allowing you to camp legally at designated freedom camping spots throughout
              New Zealand's stunning landscapes.
            </p>
          </article>

          {/* WOF & Rego */}
          <article className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
              <CheckCircle className="w-7 h-7 text-emerald-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Valid WOF & Registration
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Every listing displays WOF (Warrant of Fitness) and registration expiry dates.
              Filter for vehicles with current WOF and rego to ensure you're buying a
              road-legal campervan. We make it easy to find vehicles that are ready to
              hit the road immediately.
            </p>
          </article>

          {/* Buy-Back */}
          <article className="bg-white p-6 rounded-2xl shadow-lg border border-gray-100">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mb-4">
              <DollarSign className="w-7 h-7 text-green-600" />
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">
              Buy-Back Guarantee Options
            </h3>
            <p className="text-gray-600 leading-relaxed">
              Perfect for backpackers and travellers! Many sellers offer buy-back arrangements
              where they'll repurchase the van at an agreed price after your trip.
              Use our buyback calculator to estimate how much you could get back at the
              end of your New Zealand adventure.
            </p>
          </article>
        </div>

        {/* Section marques populaires */}
        <div className="bg-emerald-50 rounded-3xl p-8 mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Popular Campervan Brands in New Zealand
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: 'Toyota Hiace', slug: 'toyota-hiace', desc: 'Reliable & popular' },
              { name: 'Nissan Caravan', slug: 'nissan-caravan', desc: 'Spacious & affordable' },
              { name: 'Mazda Bongo', slug: 'mazda-bongo', desc: 'Compact & efficient' },
              { name: 'Mitsubishi Delica', slug: 'mitsubishi-delica', desc: '4WD capable' },
              { name: 'Ford Transit', slug: 'ford-transit', desc: 'Large & versatile' },
            ].map((brand) => (
              <Link
                key={brand.slug}
                to={`/brand/${brand.slug}`}
                className="bg-white p-4 rounded-xl text-center shadow-sm hover:shadow-md hover:border-emerald-200 border border-transparent transition"
              >
                <Car className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
                <p className="font-semibold text-gray-900">{brand.name}</p>
                <p className="text-xs text-gray-500">{brand.desc}</p>
              </Link>
            ))}
          </div>
        </div>

        {/* Section locations */}
        <div className="mb-16">
          <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
            Find Campervans Across New Zealand
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { city: 'Auckland', slug: 'auckland', region: 'North Island', highlight: true },
              { city: 'Wellington', slug: 'wellington', region: 'North Island', highlight: false },
              { city: 'Christchurch', slug: 'christchurch', region: 'South Island', highlight: true },
              { city: 'Queenstown', slug: 'queenstown', region: 'South Island', highlight: false },
              { city: 'Hamilton', slug: 'hamilton', region: 'North Island', highlight: false },
              { city: 'Tauranga', slug: 'tauranga', region: 'North Island', highlight: false },
              { city: 'Dunedin', slug: 'dunedin', region: 'South Island', highlight: false },
              { city: 'Rotorua', slug: 'rotorua', region: 'North Island', highlight: false },
            ].map((location) => (
              <Link
                key={location.slug}
                to={`/location/${location.slug}`}
                className={`p-4 rounded-xl border transition ${location.highlight
                    ? 'bg-emerald-50 border-emerald-200 hover:bg-emerald-100'
                    : 'bg-white border-gray-200 hover:border-emerald-200'
                  }`}
              >
                <div className="flex items-center gap-2">
                  <MapPin className={`w-5 h-5 ${location.highlight ? 'text-emerald-600' : 'text-gray-400'}`} />
                  <div>
                    <p className="font-semibold text-gray-900">{location.city}</p>
                    <p className="text-xs text-gray-500">{location.region}</p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Section guide pour backpackers */}
        <div className="bg-white rounded-3xl p-8 shadow-lg border border-gray-100">
          <div className="flex items-center gap-3 mb-6">
            <Calendar className="w-8 h-8 text-emerald-600" />
            <h3 className="text-2xl font-bold text-gray-900">
              Buying a Campervan in New Zealand: Quick Guide
            </h3>
          </div>

          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Buyers</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Check WOF and rego expiry dates before viewing</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Verify self-containment certification if needed</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Inspect the vehicle in person before paying</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Transfer ownership through NZTA</span>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-gray-900 mb-3">For Sellers</h4>
              <ul className="space-y-2 text-gray-600">
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Take clear photos inside and outside</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>List all equipment and features honestly</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Consider offering a buy-back option</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle className="w-5 h-5 text-emerald-500 flex-shrink-0 mt-0.5" />
                  <span>Respond quickly to buyer messages</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Texte SEO discret en bas */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-400 max-w-4xl mx-auto leading-relaxed">
            Kiwi Van Market helps backpackers, travellers, and locals buy and sell campervans
            throughout New Zealand. Browse Toyota Hiace, Nissan Caravan, Mazda Bongo,
            Mitsubishi Delica, Ford Transit and more. Find self-contained vans for freedom
            camping, vehicles with valid WOF and registration, and buy-back options perfect
            for working holiday visa holders exploring Aotearoa.
          </p>
        </div>

      </div>
    </section>
  );
}
