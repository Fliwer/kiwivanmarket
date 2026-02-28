import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown, BookOpen, Search, DollarSign, Shield, CheckCircle, MapPin } from 'lucide-react';
import SeoHead from './SeoHead';
import { useHideLoader } from '../hooks/useHideLoader';

const FAQS = [
    {
        category: "Buying a Van",
        icon: <Search size={18} className="text-emerald-500" />,
        items: [
            {
                q: "How do I buy a campervan in New Zealand?",
                a: "Browse listings on Kiwi Van Market (kiwivanmarket.com), filter by location, budget, and features. Contact the seller directly via WhatsApp or Facebook Messenger. Always inspect the van in person, check the WOF and REGO expiry dates, and do a VIN check on the NZTA website before buying. Read our full buyer's guide for a step-by-step checklist."
            },
            {
                q: "What is a WOF (Warrant of Fitness) in New Zealand?",
                a: "A WOF (Warrant of Fitness) is a mandatory safety inspection that all vehicles in New Zealand must pass. It checks brakes, tyres, lights, steering, seatbelts, and other safety features. Vans typically need a WOF every 6 or 12 months depending on the vehicle age. You cannot legally drive a vehicle without a current WOF. Always check the WOF expiry date before buying a van — it's shown on every listing on Kiwi Van Market."
            },
            {
                q: "What is REGO (vehicle registration) in New Zealand?",
                a: "REGO (registration) is the annual fee you pay to legally drive your vehicle on New Zealand roads. It can be paid in 3, 6, or 12 month periods at any PostShop or online via the NZTA website. The REGO sticker is on the windscreen. Check that REGO is current before buying a van — it's listed on every Kiwi Van Market listing."
            },
            {
                q: "What is self-contained certification in New Zealand?",
                a: "Self-contained certification (also called the 'green sticker' or 'blue sticker') means the van has an onboard toilet and a waste containment system that allows freedom camping in designated areas. The green sticker (SCC - Self-Contained Certification) is the standard NZ certification. The blue sticker (Blue Freeze) is an approved alternative system. Without this certification, you can only campervan in paid campgrounds or designated non-self-contained freedom camping areas."
            },
            {
                q: "How much does a campervan cost in New Zealand?",
                a: "Budget campervans start from NZD 4,000–8,000 for basic converted Toyota Hiace or Nissan Caravan models. Mid-range campervans with a proper bed, fridge, solar panel, and gas stove cost NZD 10,000–18,000. Well-equipped motorhomes can cost NZD 25,000–80,000+. The most popular range for backpackers is NZD 8,000–15,000."
            },
            {
                q: "What is the best campervan for backpackers in NZ?",
                a: "The Toyota Hiace is the most popular and trusted backpacker van in New Zealand. It's reliable, parts are cheap and widely available, and it's perfect for 2 people. Other popular choices include the Nissan Caravan, Toyota TownAce/LiteAce, and Mazda Bongo. Avoid cheap cars converted to vans without proper insulation — they'll be freezing in winter."
            },
            {
                q: "What should I check when inspecting a van in NZ?",
                a: "Check: (1) WOF and REGO dates, (2) rust spots under the van and on the chassis, (3) engine oil and coolant levels, (4) test all electrics including solar panel, fridge, and lights, (5) water system for leaks, (6) tyre tread depth, (7) smell for mould/dampness inside, (8) run a VIN history check on the NZTA website (nzta.govt.nz) for free. Read our full inspection guide on Kiwi Van Market."
            }
        ]
    },
    {
        category: "Selling a Van",
        icon: <DollarSign size={18} className="text-blue-500" />,
        items: [
            {
                q: "How do I sell my campervan in New Zealand?",
                a: "Create a free listing on Kiwi Van Market (kiwivanmarket.com) — it takes less than 10 minutes. Upload photos, describe your van, set your price, and add your WOF and REGO dates. Your listing is visible to thousands of backpackers and travellers. No commission, no fees. You'll get contact requests via WhatsApp or Facebook Messenger directly from buyers."
            },
            {
                q: "How long does it take to sell a van in New Zealand?",
                a: "A well-priced, well-photographed van in good condition typically sells within 1–3 weeks on Kiwi Van Market. Vans sold at the end of a trip (especially in Auckland, Christchurch, or Queenstown) sell faster because buyers are actively looking. Overpriced or poorly presented vans can take 2–3 months. Price competitively and invest 20 minutes in good photos."
            },
            {
                q: "What is a buy-back guarantee for a van in NZ?",
                a: "Some sellers on Kiwi Van Market offer a buy-back guarantee. This means you agree to buy the van back at a set price after the buyer's trip finishes. For example: sell a van for NZD 12,000 with a buy-back at NZD 9,000 after 3 months. It's a great selling point for backpackers on a tight timeline. You can add this option to your listing on Kiwi Van Market."
            },
            {
                q: "What price should I sell my van for in NZ?",
                a: "Research current market prices on Kiwi Van Market and Trade Me. As a guide: Toyota Hiace (2000–2005) NZD 6,000–10,000; Toyota Hiace (2006–2012) NZD 10,000–16,000; well-converted campervans with solar NZD 12,000–22,000. Deduct for high mileage (over 250,000km), upcoming WOF, or engine issues. Add for self-contained certification, low mileage, new tyres."
            }
        ]
    },
    {
        category: "Freedom Camping",
        icon: <MapPin size={18} className="text-orange-500" />,
        items: [
            {
                q: "What is freedom camping in New Zealand?",
                a: "Freedom camping is camping outside of paid campgrounds on public land for free. In New Zealand, you can freedom camp in many locations marked on the CamperMate or Rangi apps. Self-contained vehicles can freedom camp in most designated areas. Non-self-contained vehicles are restricted to specific approved areas. Fines for illegal freedom camping can be up to NZD 200."
            },
            {
                q: "Where can I freedom camp in New Zealand?",
                a: "Freedom camping spots across NZ can be found using the CamperMate app (free), Rangi app, or the council websites. Popular areas include: DoC (Department of Conservation) sites, rest areas on State Highways, beaches in Northland and Coromandel, and many South Island locations. Always check local council rules as they vary by region."
            },
            {
                q: "Do I need a self-contained certificate to freedom camp in NZ?",
                a: "Not everywhere, but for most freedom camping areas you do. Self-contained vehicles (with a toilet and waste system) can access more spots. Without self-contained certification, you're limited to designated non-self-contained freedom camping areas which are fewer and often busier. Getting certified adds value to your van when reselling."
            }
        ]
    },
    {
        category: "About Kiwi Van Market",
        icon: <Shield size={18} className="text-purple-500" />,
        items: [
            {
                q: "What is Kiwi Van Market?",
                a: "Kiwi Van Market (kiwivanmarket.com) is the #1 specialist campervan marketplace in New Zealand for backpackers and travellers. It's a free, peer-to-peer platform where you can buy or sell campervans, motorhomes, and converted vans without paying any commission. We have listings across Auckland, Wellington, Christchurch, Queenstown, and all major NZ cities."
            },
            {
                q: "Is Kiwi Van Market free to use?",
                a: "Yes! Listing your van on Kiwi Van Market is completely free. We don't charge any commission on sales. Buyers can browse and contact sellers for free. There are no hidden fees. We're a community-driven platform built for backpackers by travel enthusiasts."
            },
            {
                q: "How is Kiwi Van Market different from Trade Me?",
                a: "Kiwi Van Market is a specialist platform exclusively for campervans and motorhomes — no cars, no trucks, no unrelated items. Our listings show WOF dates, REGO dates, self-contained status, and equipment details upfront. We're free with no listing fees or success fees. Trade Me charges listing fees and 7.99% success fees up to $299. We're also designed for international backpackers with multi-currency support (NZD, EUR, USD, AUD, GBP)."
            }
        ]
    }
];

const FAQ_SCHEMA = FAQS.flatMap(cat => cat.items).map(({ q, a }) => ({ q, a }));

export default function FaqPage() {
    useHideLoader();
    const [openItems, setOpenItems] = useState({});

    const toggle = (key) => setOpenItems(prev => ({ ...prev, [key]: !prev[key] }));

    return (
        <>
            <SeoHead
                title="Van Life NZ FAQ — Everything About Buying & Selling Campervans in New Zealand"
                description="All your questions answered: how to buy a campervan in New Zealand, WOF, REGO, self-contained certification, freedom camping, van prices, and more. Expert answers from Kiwi Van Market."
                faqs={FAQ_SCHEMA}
                breadcrumbs={[
                    { name: 'Home', path: '/' },
                    { name: 'FAQ', path: '/faq' },
                ]}
            />

            <div className="min-h-screen bg-[#f8fafc]">
                {/* Hero */}
                <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-950 text-white py-20 px-4">
                    <div className="max-w-3xl mx-auto text-center">
                        <div className="clear-both" />
                        <div className="inline-flex items-center gap-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 px-4 py-2 rounded-full text-sm font-bold mb-6">
                            <BookOpen size={14} />
                            Expert Answers
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black mb-4 leading-tight">
                            Van Life NZ — <span className="text-emerald-400">FAQ</span>
                        </h1>
                        <p className="text-slate-300 text-lg max-w-2xl mx-auto">
                            Everything you need to know about buying, selling, and living in a campervan in New Zealand.
                            WOF, REGO, self-contained, freedom camping — all answered.
                        </p>
                    </div>
                </div>

                {/* FAQ Content */}
                <div className="max-w-3xl mx-auto px-4 py-12">
                    {FAQS.map((category, ci) => (
                        <div key={ci} className="mb-10">
                            <div className="flex items-center gap-3 mb-5">
                                <div className="w-9 h-9 bg-white rounded-xl border border-slate-200 shadow-sm flex items-center justify-center">
                                    {category.icon}
                                </div>
                                <h2 className="text-xl font-black text-slate-900">{category.category}</h2>
                            </div>

                            <div className="space-y-3">
                                {category.items.map((item, qi) => {
                                    const key = `${ci}-${qi}`;
                                    const isOpen = !!openItems[key];
                                    return (
                                        <div
                                            key={qi}
                                            className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden"
                                        >
                                            <button
                                                onClick={() => toggle(key)}
                                                className="w-full flex items-center justify-between gap-4 px-6 py-4 text-left hover:bg-slate-50 transition-colors"
                                            >
                                                <span className="font-bold text-slate-900 text-sm leading-snug pr-2">{item.q}</span>
                                                <ChevronDown
                                                    size={18}
                                                    className={`flex-shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`}
                                                />
                                            </button>
                                            {isOpen && (
                                                <div className="px-6 pb-5 pt-1 border-t border-slate-50">
                                                    <p className="text-slate-600 leading-relaxed text-sm">{item.a}</p>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}

                    {/* CTA at the bottom */}
                    <div className="mt-12 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-3xl p-8 text-white text-center shadow-xl shadow-emerald-200">
                        <h3 className="text-2xl font-black mb-2">Ready to find your van?</h3>
                        <p className="text-emerald-100 mb-6">Browse hundreds of campervans for sale across New Zealand — free listings, no commission.</p>
                        <div className="flex flex-col sm:flex-row gap-3 justify-center">
                            <Link
                                to="/"
                                className="bg-white text-emerald-700 font-black px-8 py-3 rounded-2xl hover:bg-emerald-50 transition-all"
                            >
                                Browse Listings
                            </Link>
                            <Link
                                to="/guides"
                                className="bg-emerald-500/30 border border-white/30 text-white font-black px-8 py-3 rounded-2xl hover:bg-emerald-500/50 transition-all flex items-center justify-center gap-2"
                            >
                                <BookOpen size={16} />
                                Read our Guides
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
