import React, { useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, CheckCircle, AlertTriangle, MapPin, Shield, Car, DollarSign } from 'lucide-react';
import SeoHead from './SeoHead';

// Configuration des guides
const GUIDES = {
  'buying-campervan-nz': {
    title: 'How to Buy a Campervan in New Zealand - Complete Guide 2025',
    description: 'Everything you need to know about buying a campervan in New Zealand. WOF, REGO, self-contained certification, best brands, prices, and tips for backpackers.',
    heroImage: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200',
    content: {
      intro: `Buying a campervan in New Zealand is one of the best decisions you can make as a backpacker or traveller. It gives you the freedom to explore this beautiful country at your own pace, sleep wherever you want (legally!), and save money on accommodation.`,
      sections: [
        {
          title: 'What to Check Before Buying',
          icon: 'CheckCircle',
          items: [
            { title: 'WOF (Warrant of Fitness)', text: 'This is the NZ vehicle safety inspection. Check the expiry date - you need a valid WOF to drive legally. Vans over 12 years old need a WOF every 6 months.' },
            { title: 'REGO (Registration)', text: 'Vehicle registration must be current. You can check any vehicle\'s status for free on the NZTA website using the plate number.' },
            { title: 'Ownership Papers', text: 'Make sure the seller has the original ownership papers and their ID matches. Never buy a van without seeing these documents.' },
            { title: 'Mechanical Condition', text: 'Check oil levels, listen for engine noises, test all gears, check for rust underneath. Consider paying for a professional inspection ($100-200).' },
          ]
        },
        {
          title: 'Self-Contained Certification',
          icon: 'Shield',
          items: [
            { title: 'What is Self-Contained?', text: 'A self-contained vehicle has a toilet, fresh water tank (min 4L per person), and grey water tank that meets NZS 5465 standard.' },
            { title: 'Why You Need It', text: 'Self-contained vans can legally freedom camp in many beautiful spots across NZ. Without it, you\'re limited to paid campsites.' },
            { title: 'The Blue Card', text: 'Look for the official blue self-contained sticker. It\'s valid for 4 years. Fake stickers can result in $200+ fines.' },
          ]
        },
        {
          title: 'Best Campervan Brands in NZ',
          icon: 'Car',
          items: [
            { title: 'Toyota Hiace', text: 'The most popular choice. Reliable, parts are cheap and easy to find, good fuel economy. Prices: $8,000-$20,000.' },
            { title: 'Nissan Caravan', text: 'Spacious and affordable. Similar reliability to Hiace. Prices: $6,000-$15,000.' },
            { title: 'Mitsubishi Delica', text: '4WD option for adventurous travellers. Great for gravel roads. Prices: $8,000-$18,000.' },
            { title: 'Mazda Bongo', text: 'Compact and fuel-efficient. Many have pop-top roofs. Prices: $7,000-$15,000.' },
          ]
        },
        {
          title: 'Price Guide',
          icon: 'DollarSign',
          items: [
            { title: 'Budget ($5,000-$10,000)', text: 'Older vans (2000-2005), basic fit-out, may need some work. Good for short trips (1-3 months).' },
            { title: 'Mid-Range ($10,000-$18,000)', text: 'Well-maintained vans (2005-2012), decent fit-out, reliable. Ideal for 3-6 month trips.' },
            { title: 'Premium ($18,000+)', text: 'Newer vans, professional conversions, solar panels, all amenities. Best for long-term travel.' },
          ]
        },
        {
          title: 'Where to Buy',
          icon: 'MapPin',
          items: [
            { title: 'Auckland', text: 'Largest selection in NZ. Best place to start if arriving from overseas. Many backpacker-focused sellers.' },
            { title: 'Christchurch', text: 'Great for South Island adventures. Good selection, slightly lower prices than Auckland.' },
            { title: 'Wellington', text: 'Ferry hub between islands. Buy here if you want to explore both islands.' },
          ]
        },
        {
          title: 'Buy-Back Options',
          icon: 'Shield',
          items: [
            { title: 'What is Buy-Back?', text: 'Some sellers guarantee to buy the van back at a set price after your trip. Great for peace of mind.' },
            { title: 'Typical Terms', text: 'Usually 50-70% of purchase price, valid for 3-12 months. Check conditions carefully (mileage limits, condition requirements).' },
            { title: 'Is it Worth It?', text: 'Yes if you want zero stress about selling. You might get slightly more selling privately, but buy-back saves time and hassle.' },
          ]
        },
      ],
      warnings: [
        'Never pay a deposit before seeing the van in person',
        'Be wary of prices that seem too good to be true',
        'Check the van during daylight hours',
        'Test drive on different road types (highway, hills)',
        'Verify the seller\'s identity matches the ownership papers',
      ],
      cta: {
        title: 'Ready to Find Your Perfect Van?',
        text: 'Browse self-contained campervans with valid WOF and buy-back options on Kiwi Van Market.',
        buttonText: 'Browse Campervans',
        buttonLink: '/',
      }
    }
  },
  'freedom-camping-nz': {
    title: 'Freedom Camping in New Zealand - Rules & Best Spots 2025',
    description: 'Complete guide to freedom camping in New Zealand. Where you can camp for free, self-contained requirements, fines to avoid, and the best freedom camping spots.',
    heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
    content: {
      intro: `Freedom camping is one of the best ways to experience New Zealand's stunning nature without breaking the bank. But there are rules you need to follow to camp legally and protect the environment.`,
      sections: [
        {
          title: 'Freedom Camping Rules',
          icon: 'CheckCircle',
          items: [
            { title: 'Self-Contained Required', text: 'Most freedom camping spots require a certified self-contained vehicle. This means having a toilet, fresh water tank, and grey water tank.' },
            { title: 'Check Local Rules', text: 'Each council has different rules. Use the CamperMate or WikiCamps app to find legal spots and current restrictions.' },
            { title: 'Maximum Stay', text: 'Most spots allow 1-2 nights maximum. Always move on and don\'t overstay.' },
            { title: 'Leave No Trace', text: 'Take all rubbish with you, don\'t dump grey water on the ground, use proper dump stations.' },
          ]
        },
        {
          title: 'Fines to Avoid',
          icon: 'AlertTriangle',
          items: [
            { title: 'Camping in Prohibited Areas', text: '$200 instant fine. Can be up to $10,000 for repeat offenders or environmental damage.' },
            { title: 'Fake Self-Contained Sticker', text: '$200+ fine. Officers do check - your van must actually have the required facilities.' },
            { title: 'Dumping Waste', text: 'Up to $10,000 fine for dumping toilet waste or grey water illegally.' },
          ]
        },
        {
          title: 'Best Freedom Camping Regions',
          icon: 'MapPin',
          items: [
            { title: 'South Island West Coast', text: 'Most relaxed rules, stunning beaches and forests. Great spots near Hokitika and Greymouth.' },
            { title: 'Otago/Southland', text: 'Beautiful lakes and mountains. Many DOC campsites with basic facilities.' },
            { title: 'East Cape (North Island)', text: 'Off the beaten track, friendly locals, beautiful coastline.' },
          ]
        },
      ],
      warnings: [
        'Queenstown and popular tourist areas have strict no-camping rules',
        'Auckland city has very limited freedom camping options',
        'Summer (Dec-Feb) is busiest - spots fill up early',
        'Always have a backup plan (paid campsite) in case spots are full',
      ],
      cta: {
        title: 'Get a Self-Contained Van',
        text: 'Freedom camping is only possible with a certified self-contained vehicle. Find one on Kiwi Van Market.',
        buttonText: 'Find Self-Contained Vans',
        buttonLink: '/?selfContained=true',
      }
    }
  },
  'selling-campervan-nz': {
    title: 'How to Sell Your Campervan in New Zealand - Quick Sale Guide',
    description: 'Sell your campervan fast in New Zealand. Tips for pricing, photos, descriptions, and reaching backpacker buyers. Free listings on Kiwi Van Market.',
    heroImage: 'https://images.unsplash.com/photo-1533591917513-091dc1b8d9cd?w=1200',
    content: {
      intro: `Selling your campervan at the end of your New Zealand adventure doesn't have to be stressful. With the right approach, you can sell quickly and get a fair price.`,
      sections: [
        {
          title: 'Preparing Your Van for Sale',
          icon: 'CheckCircle',
          items: [
            { title: 'Deep Clean', text: 'First impressions matter. Clean inside and out, remove personal items, make it smell fresh.' },
            { title: 'Minor Repairs', text: 'Fix small issues - they\'re cheap but make buyers nervous. Worn wiper blades, broken lights, etc.' },
            { title: 'Get Fresh WOF', text: 'A van with 6+ months WOF sells faster and for more money. Worth the $50-100 investment.' },
            { title: 'Gather Documents', text: 'Have ownership papers, service history, and self-contained certificate ready to show.' },
          ]
        },
        {
          title: 'Taking Great Photos',
          icon: 'Car',
          items: [
            { title: 'Timing', text: 'Shoot during golden hour (early morning or late afternoon) for best lighting.' },
            { title: 'Angles', text: 'Include: front 3/4 view, rear, both sides, interior bed setup, kitchen area, dashboard, engine bay.' },
            { title: 'Quantity', text: '10-15 photos is ideal. More photos = more trust = faster sale.' },
            { title: 'Honesty', text: 'Include photos of any damage or wear. Buyers appreciate honesty and it saves time.' },
          ]
        },
        {
          title: 'Pricing Strategy',
          icon: 'DollarSign',
          items: [
            { title: 'Research Market', text: 'Check similar vans on TradeMe and Kiwi Van Market. Price competitively.' },
            { title: 'Be Realistic', text: 'End of season (March-April) prices drop. Factor in your timeline.' },
            { title: 'Room to Negotiate', text: 'List 5-10% above your minimum. Kiwi buyers expect to negotiate.' },
          ]
        },
        {
          title: 'Where to List',
          icon: 'MapPin',
          items: [
            { title: 'Kiwi Van Market', text: 'Free listings, backpacker-focused audience. List here first!' },
            { title: 'Facebook Groups', text: 'Backpackers NZ groups have active buy/sell sections. Good for quick sales.' },
            { title: 'Hostel Noticeboards', text: 'Physical flyers at backpacker hostels in main cities.' },
          ]
        },
      ],
      warnings: [
        'Beware of scammers asking to pay by unusual methods',
        'Never hand over keys before payment clears',
        'Meet buyers in safe, public places',
        'Complete the ownership transfer properly through NZTA',
      ],
      cta: {
        title: 'List Your Van for Free',
        text: 'Reach thousands of backpackers looking for campervans. It takes just 5 minutes.',
        buttonText: 'Sell Your Van',
        buttonLink: '/',
      }
    }
  },
  'how-to-inspect-campervan-nz': {
    title: 'How to Inspect a Campervan in NZ - Professional Checklist',
    description: 'Expert advice on inspecting a used campervan in New Zealand. Detailed mechanical, body, and interior checklist to ensure you buy a reliable vehicle.',
    heroImage: 'https://images.unsplash.com/photo-1517055729445-fa7d27394b48?w=1200',
    content: {
      intro: `Inspecting a campervan thoroughly is the single most important step in your New Zealand journey. Don't be dazzled by nice decorations - you need to ensure the vehicle is safe and mechanically sound. Use this professional checklist to inspect like an expert.`,
      sections: [
        {
          title: 'Mechanical Inspection',
          icon: 'CheckCircle',
          items: [
            { title: 'Cold Start', text: 'Ask the seller to keep the engine cold. A warm engine can hide starting problems or smoke issues.' },
            { title: 'Fluid Check', text: 'Check oil (no milky residue), coolant (bright color, no oil), and brake fluid levels. Look for leaks under the engine.' },
            { title: 'Service History', text: 'Detailed records prove the van has been cared for. Look for regular oil changes every 10,000km.' },
          ]
        },
        {
          title: 'Body & Safety',
          icon: 'Shield',
          items: [
            { title: 'Rust Check', text: 'Inspect wheel arches, door sills, and the chassis. Structural rust is a major WOF failure.' },
            { title: 'Tyres', text: 'Ensure tread is at least 1.5mm deep. Uneven wear suggests suspension or alignment problems.' },
            { title: 'Lights & Electrics', text: 'Test all indicators, headlights, and interior dashboard lights.' },
          ]
        },
        {
          title: 'Living Area Check',
          icon: 'Car',
          items: [
            { title: 'Damp & Mould', text: 'Check corners, cupboards, and under the mattress for any signs of leaks or moisture.' },
            { title: 'Appliances', text: 'Test the fridge, gas stove, water pump, and leisure battery charging systems.' },
            { title: 'Self-Containment', text: 'Verify the toilets, tanks, and blue sticker are legitimate and meet current standards.' },
          ]
        },
      ],
      warnings: [
        'If the seller refuses a professional pre-purchase inspection (PPI), walk away',
        'Check the VIN and plate number on the CarJam website',
        'Insist on a test drive on open roads, not just a car park',
      ],
      cta: {
        title: 'Find Your Next Adventure',
        text: 'Ready to put your inspection skills to the test? Browse our verified listings.',
        buttonText: 'Browse Vans',
        buttonLink: '/',
      }
    }
  },
};

// Aliases for retro-compatibility
GUIDES['how-to-buy-campervan-nz'] = GUIDES['buying-campervan-nz'];
GUIDES['how-to-inspect-a-van'] = GUIDES['how-to-inspect-campervan-nz'];

// Icon mapping
const IconMap = {
  CheckCircle,
  AlertTriangle,
  MapPin,
  Shield,
  Car,
  DollarSign,
};

// Schema.org pour les guides
const GuideSchema = ({ guide, url }) => {
  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": guide.title,
    "description": guide.description,
    "image": guide.heroImage,
    "url": url,
    "author": {
      "@type": "Organization",
      "name": "Kiwi Van Market"
    },
    "publisher": {
      "@type": "Organization",
      "name": "Kiwi Van Market",
      "logo": {
        "@type": "ImageObject",
        "url": "https://kiwivanmarket.com/kiwi-van-logo.png"
      }
    },
    "datePublished": "2025-01-01",
    "dateModified": new Date().toISOString().split('T')[0]
  };

  return (
    <script type="application/ld+json">
      {JSON.stringify(schema)}
    </script>
  );
};

export default function GuidePage() {
  const { slug } = useParams();
  const guide = GUIDES[slug];
  const url = `https://kiwivanmarket.com/guide/${slug}`;

  // Fermer le loader initial
  useEffect(() => {
    const loader = document.getElementById('app-loader');
    if (loader) {
      loader.classList.add('fade-out');
      setTimeout(() => loader.remove(), 500);
    }
  }, []);

  // 404 si guide non trouvé
  if (!guide) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center p-8">
          <div className="text-6xl mb-4">📖</div>
          <h1 className="text-2xl font-bold text-gray-800 mb-2">Guide Not Found</h1>
          <p className="text-gray-600 mb-6">This guide doesn't exist yet.</p>
          <Link
            to="/"
            className="bg-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-emerald-700 transition inline-flex items-center gap-2"
          >
            <ArrowLeft size={20} />
            Browse Campervans
          </Link>
        </div>
      </div>
    );
  }

  const { content } = guide;

  return (
    <>
      <SeoHead
        title={guide.title}
        description={guide.description}
        image={guide.heroImage}
        type="article"
      />
      <GuideSchema guide={guide} url={url} />

      <div className="min-h-screen bg-gray-50">
        {/* Hero */}
        <header className="relative h-[40vh] min-h-[300px] flex items-end">
          <img
            src={guide.heroImage}
            alt={guide.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent" />
          <div className="relative max-w-4xl mx-auto px-4 pb-8 w-full">
            <Link
              to="/"
              className="inline-flex items-center gap-2 text-white/80 hover:text-white mb-4 transition"
            >
              <ArrowLeft size={20} />
              Back to campervans
            </Link>
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white leading-tight">
              {guide.title}
            </h1>
          </div>
        </header>

        {/* Breadcrumb */}
        <nav className="max-w-4xl mx-auto px-4 py-4" aria-label="Breadcrumb">
          <ol className="flex items-center gap-2 text-sm text-gray-500">
            <li><Link to="/" className="hover:text-emerald-600">Home</Link></li>
            <li>/</li>
            <li><span className="text-gray-800 font-medium">Guide</span></li>
          </ol>
        </nav>

        {/* Content */}
        <main className="max-w-4xl mx-auto px-4 pb-16">
          {/* Intro */}
          <p className="text-xl text-gray-700 leading-relaxed mb-12">
            {content.intro}
          </p>

          {/* Sections */}
          {content.sections.map((section, idx) => {
            const Icon = IconMap[section.icon] || CheckCircle;
            return (
              <section key={idx} className="mb-12">
                <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-3">
                  <span className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <Icon size={20} className="text-emerald-600" />
                  </span>
                  {section.title}
                </h2>
                <div className="space-y-4">
                  {section.items.map((item, itemIdx) => (
                    <div key={itemIdx} className="bg-white rounded-xl p-5 shadow-sm border border-gray-100">
                      <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                      <p className="text-gray-600">{item.text}</p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}

          {/* Warnings */}
          {content.warnings && (
            <section className="mb-12 bg-amber-50 border border-amber-200 rounded-2xl p-6">
              <h2 className="text-xl font-bold text-amber-800 mb-4 flex items-center gap-2">
                <AlertTriangle size={24} />
                Important Warnings
              </h2>
              <ul className="space-y-2">
                {content.warnings.map((warning, idx) => (
                  <li key={idx} className="flex items-start gap-2 text-amber-900">
                    <span className="text-amber-500 mt-1">⚠</span>
                    {warning}
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* CTA */}
          {content.cta && (
            <section className="bg-gradient-to-r from-emerald-600 to-teal-600 rounded-2xl p-8 text-center text-white">
              <h2 className="text-2xl font-bold mb-3">{content.cta.title}</h2>
              <p className="text-white/90 mb-6 max-w-lg mx-auto">{content.cta.text}</p>
              <Link
                to={content.cta.buttonLink}
                className="inline-block bg-white text-emerald-600 px-8 py-3 rounded-xl font-bold hover:bg-emerald-50 transition shadow-lg"
              >
                {content.cta.buttonText}
              </Link>
            </section>
          )}

          {/* Other Guides */}
          <section className="mt-12">
            <h3 className="text-xl font-bold text-gray-800 mb-4">More Guides</h3>
            <div className="grid md:grid-cols-2 gap-4">
              {Object.entries(GUIDES)
                .filter(([key]) => key !== slug)
                .slice(0, 2)
                .map(([key, g]) => (
                  <Link
                    key={key}
                    to={`/guide/${key}`}
                    className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition"
                  >
                    <h4 className="font-semibold text-gray-900 mb-1 line-clamp-2">{g.title}</h4>
                    <p className="text-sm text-gray-500 line-clamp-2">{g.description}</p>
                  </Link>
                ))}
            </div>
          </section>
        </main>

        {/* Simple Footer */}
        <footer className="bg-gray-900 text-white py-8">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4">
              <div className="w-10 h-10 rounded-full overflow-hidden" style={{ backgroundColor: '#f7eedd' }}>
                <img src="/kiwi-van-logo-48.webp" alt="Kiwi Van Market" className="w-full h-full object-contain" />
              </div>
              <span className="font-bold text-xl">Kiwi Van Market</span>
            </Link>
            <p className="text-gray-400 text-sm">
              The #1 marketplace for campervans in New Zealand
            </p>
          </div>
        </footer>
      </div>
    </>
  );
}
