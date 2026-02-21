import { CheckCircle, AlertTriangle, MapPin, Shield, Car, DollarSign } from 'lucide-react';

export const GUIDES = {
    en: {
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
            title: 'Expert Campervan Inspection - The Ultimate NZ Checklist',
            description: 'Don\'t buy a lemon! Our expert guide covers everything from engine health and structural rust to living system checks. Inspect like a pro before you buy.',
            heroImage: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200',
            content: {
                intro: `Buying a campervan is your biggest investment in NZ. A "pretty" interior often hides mechanical nightmares. This guide gives you the technical tools to look past the fairy lights and inspect the heart of the vehicle. If a seller rushes you or refuses these checks, walk away immediately.`,
                sections: [
                    {
                        title: '1. The Mechanical Heart (Under the Hood)',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'The Cold Start Test', text: 'Touch the engine block before starting. If it\'s warm, the seller might be hiding a difficult start or smoke issues. Start it yourself and watch the exhaust for blue (oil) or white (coolant) smoke.' },
                            { title: 'The "Mayonnaise" Check', text: 'Open the oil filler cap. A milky, white/beige sludge ("mayo") indicates a blown head gasket - a catastrophic and expensive failure. Avoid at all costs.' },
                            { title: 'Belts & Cam-belt', text: 'Ask when the cam-belt (timing belt) was last changed. If it snaps, the engine is destroyed. It usually needs changing every 100,000km.' },
                        ]
                    },
                    {
                        title: '2. Structural Integrity (The Rust Hunt)',
                        icon: 'Shield',
                        items: [
                            { title: 'Chassis & Sills', text: 'Get on the ground with a torch. Look for flaky, bubbling metal on the underside. Surface rust is okay; structural rust (holes or deep flakes) will fail the WOF and ruin the van\'s value.' },
                            { title: 'Tyre Wear Patterns', text: 'If tyres are worn more on one side, the wheel alignment is off or suspension components are bent. Budget $500+ for suspension repairs.' },
                        ]
                    },
                    {
                        title: '3. The Test Drive (Performance)',
                        icon: 'Car',
                        items: [
                            { title: 'Gearbox & Clutch', text: 'Shift through all gears. If it\'s a manual, check for a "slipping clutch" by putting it in 4th gear at low speed and flooring the gas - the RPM shouldn\'t jump without speed.' },
                            { title: 'Braking & Steering', text: 'Let go of the wheel briefly on a flat road - the van should go straight. Brake hard once (safely) to check for shuddering (warped discs) or pulling to one side.' },
                        ]
                    },
                    {
                        title: '4. Living Systems & Electrical',
                        icon: 'MapPin',
                        items: [
                            { title: 'The Leak Test', text: 'Look for dark stains around windows and skylights. Press your thumb into the walls - if they feel soft/spongy, there is wood rot from water ingress.' },
                            { title: 'Deep Cycle Battery', text: 'Test the voltage of the leisure battery with a multimeter if possible. Turn on all lights and the fridge to see if the voltage drops instantly.' },
                        ]
                    },
                ],
                warnings: [
                    'NEVER buy a van without a pre-purchase inspection from an independent mechanic ($140-180)',
                    'Check the VIN on CarJam.co.nz to ensure there is no money owing (debt) on the vehicle',
                    'Verify the Self-Containment blue card matches the van\'s plate and is current',
                ],
                cta: {
                    title: 'Found a Good One?',
                    text: 'Compare it with other listings to ensure you\'re getting a fair price for the condition.',
                    buttonText: 'Compare Listings',
                    buttonLink: '/',
                }
            }
        },
        'winter-camping-nz': {
            title: 'Survival Guide: Winter Camping in New Zealand 2025',
            description: 'Can you camp in NZ during winter? Yes! Discover the best heated vans, snow-safe roads, and essential gear to stay warm while exploring the Southern Alps.',
            heroImage: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200',
            content: {
                intro: `Winter in New Zealand (June to August) transforms the landscape into a snowy wonderland. While many backpackers leave, the smart ones stay for cheaper van prices and empty campsites. But winter camping requires serious preparation. Here is how to survive and thrive in a van when the mercury drops below zero.`,
                sections: [
                    {
                        title: 'Choosing a Winter-Ready Van',
                        icon: 'Shield',
                        items: [
                            { title: 'Insulation is Key', text: 'Look for vans with sheep wool or foam insulation. Avoid "bare metal" vans which act like refrigerators at night.' },
                            { title: 'Diesel Heaters', text: 'The gold standard for winter vanlife. A 2KW diesel heater uses very little fuel and keeps the interior at a cozy 20°C even in a blizzard.' },
                            { title: 'Certified Self-Contained', text: 'In winter, you\'ll want to use your own indoor facilities rather than trekking through snow to a campsite toilet.' },
                        ]
                    },
                    {
                        title: 'Gear You Can\'t Ignore',
                        icon: 'CheckCircle',
                        items: [
                            { title: '-5°C Sleeping Bags', text: 'A standard summer bag won\'t cut it. Invest in a down sleeping bag or high-tog duvet.' },
                            { title: 'Snow Chains', text: 'Mandatory on many South Island passes (Crown Range, Milford Road). Practice putting them on before you actually need them!' },
                            { title: 'Dehumidifiers', text: 'Condensation is your enemy. Use passive moisture absorbers to prevent mould from growing on your mattress.' },
                        ]
                    },
                    {
                        title: 'Best Winter Spots',
                        icon: 'MapPin',
                        items: [
                            { title: 'Ohakune (North Island)', text: 'The gateway to Mt Ruapehu. Great vibes and many vans with heaters for sale here.' },
                            { title: 'Wanaka & Queenstown', text: 'The heart of NZ winter. Expect professional ski setups and plenty of long-term van parking.' },
                            { title: 'Tekapo', text: 'Coldest place in NZ but the best stargazing. Make sure your batteries are fully charged!' },
                        ]
                    },
                ],
                warnings: [
                    'Black ice is a major hazard - drive late in the morning when the sun has melted it',
                    'Avoid high alpine passes during heavy snow warnings unless you are an experienced driver',
                    'Always check the MetService app for weather alerts before moving locations',
                ],
                cta: {
                    title: 'Need a Van with a Heater?',
                    text: 'Filter our listings to find fully insulated vans with diesel heaters.',
                    buttonText: 'Find Winter Vans',
                    buttonLink: '/',
                }
            }
        },
        'south-island-road-trip': {
            title: 'The Ultimate 14-Day South Island Road Trip Itinerary',
            description: 'The most iconic road trip in the world. From Christchurch to Milford Sound, discover the best hidden campsites and photo spots for your van adventure.',
            heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
            content: {
                intro: `The South Island of New Zealand is the ultimate playground for campervans. This 14-day loop takes you through turquoise lakes, ancient glaciers, and dramatic fiords. Pack your camera and get ready for the trip of a lifetime.`,
                sections: [
                    {
                        title: 'Week 1: Lakes & Glaciers',
                        icon: 'MapPin',
                        items: [
                            { title: 'Day 1-3: Lake Tekapo & Pukaki', text: 'Star gazing and hiking at Mt Cook. Camp at Lake Pukaki (freedom camping available for SC vans).' },
                            { title: 'Day 4-5: Wanaka', text: 'The famous "That Wanaka Tree" and Roy\'s Peak hike for the best views in the country.' },
                            { title: 'Day 6-7: Queenstown', text: 'Adventure capital. Great for a luxury campsite night with a hot shower and laundry.' },
                        ]
                    },
                    {
                        title: 'Week 2: Fiords & Coastlines',
                        icon: 'Car',
                        items: [
                            { title: 'Day 8-9: Milford Sound', text: 'Cruising the fiords. Note: There is no phone signal here, so download your maps offline.' },
                            { title: 'Day 10-12: West Coast', text: 'Fox Glacier, Franz Josef, and the Pancake Rocks. Stunning coastal driving.' },
                            { title: 'Day 13-14: Arthur\'s Pass', text: 'Drive back to Christchurch through the heart of the Southern Alps.' },
                        ]
                    },
                ],
                warnings: [
                    'Sandflies on the West Coast are brutal - buy "Goodbye Sandfly" repellent locally',
                    'Always book Milford Sound cruises in advance as they sell out daily',
                    'Fuel is expensive in small towns - fill up in main cities like Christchurch or Queenstown',
                ],
                cta: {
                    title: 'Start Your Journey',
                    text: 'Pick up your campervan in Christchurch and hit the road today.',
                    buttonText: 'Vans in Christchurch',
                    buttonLink: '/',
                }
            }
        },
        'best-vanlife-apps-nz': {
            title: '6 Essential Apps for Every NZ Vanlife Traveller (2025)',
            description: 'Don\'t leave without these! From finding secret campsites to saving money on fuel, these apps will save you time and hundreds of dollars.',
            heroImage: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=1200',
            content: {
                intro: `In 2025, your phone is just as important as your van's spare tyre. These 6 apps are the difference between an average trip and an epic adventure in New Zealand.`,
                sections: [
                    {
                        title: 'Campsites & Facilities',
                        icon: 'MapPin',
                        items: [
                            { title: 'CamperMate (Free)', text: 'The #1 app. Shows freedom camping spots, paid parks, public toilets, and petrol stations.' },
                            { title: 'WikiCamps NZ', text: 'Great for finding hidden gems that CamperMate might miss. One-time small fee but worth it.' },
                        ]
                    },
                    {
                        title: 'Budgeting & Fuel',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Gaspy', text: 'The community-driven fuel price app. Save 10-20 cents per litre by driving 2 mins further.' },
                            { title: 'Kiwi Van Market', text: 'Bookmark our site for current resale values and to find parts/repairs across the country.' },
                        ]
                    },
                    {
                        title: 'Safety & Navigation',
                        icon: 'Shield',
                        items: [
                            { title: 'MetService', text: 'Essential for mountain weather and road closures.' },
                            { title: 'NZTA Waka Kotahi', text: 'Real-time road hazard alerts. Critical for South Island travel.' },
                        ]
                    },
                ],
                warnings: [
                    'Always download the "South Island" and "North Island" offline maps in Google Maps',
                    'Don\'t trust GPS times - NZ roads are windy and often take 30% longer than expected',
                ],
                cta: {
                    title: 'Ready for the Tech?',
                    text: 'Set up your van with a 12V charger to keep your phone alive throughout the journey.',
                    buttonText: 'See Van Specs',
                    buttonLink: '/',
                }
            }
        }
    },
    fr: {
        'buying-campervan-nz': {
            title: 'Comment Acheter un Campervan en Nouvelle-Zélande - Guide Complet 2025',
            description: 'Tout ce qu\'il faut savoir sur l\'achat d\'un van en NZ. WOF, REGO, certification Self-contained, prix et astuces pour backpackers.',
            heroImage: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200',
            content: {
                intro: `Acheter un campervan en Nouvelle-Zélande est l'une des meilleures décisions que vous puissiez prendre en tant que voyageur. Cela vous offre la liberté d'explorer ce pays magnifique à votre rythme et d'économiser sur l'hébergement.`,
                sections: [
                    {
                        title: 'Points à Vérifier Avant l\'Achat',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'WOF (Warrant of Fitness)', text: 'C\'est l\'inspection technique de sécurité. Vérifiez la date d\'expiration. Pour les vans de plus de 12 ans, le WOF doit être fait tous les 6 mois.' },
                            { title: 'REGO (Registration)', text: 'L\'immatriculation doit être à jour. Vous pouvez vérifier le statut de n\'importe quel véhicule gratuitement sur le site de la NZTA.' },
                            { title: 'Papiers de Propriété', text: 'Assurez-vous que le vendeur possède les documents originaux et que son identité correspond. N\'achetez jamais sans voir ces documents.' },
                            { title: 'État Mécanique', text: 'Vérifiez les niveaux d\'huile, écoutez les bruits du moteur, testez les vitesses et cherchez de la rouille. Une inspection pro ($100-200) est recommandée.' },
                        ]
                    },
                    {
                        title: 'Certification Self-Contained',
                        icon: 'Shield',
                        items: [
                            { title: 'C\'est quoi le Self-Contained ?', text: 'Un véhicule autonome a des toilettes, un réservoir d\'eau propre (4L/personne) et un d\'eaux usées aux normes NZS 5465.' },
                            { title: 'Pourquoi c\'est Vital', text: 'Les vans certifiés peuvent dormir gratuitement dans de nombreux endroits magnifiques ("Freedom Camping"). Sans cela, vous devrez payer vos campings.' },
                            { title: 'La Blue Card', text: 'Cherchez le macaron bleu officiel. Il est valable 4 ans. Les faux macarons risquent des amendes de plus de 200$.' },
                        ]
                    },
                    {
                        title: 'Meilleures Marques en NZ',
                        icon: 'Car',
                        items: [
                            { title: 'Toyota Hiace', text: 'Le choix n°1. Fiable, pièces faciles à trouver, bonne consommation. Prix : 8 000$ - 20 000$.' },
                            { title: 'Nissan Caravan', text: 'Spacieux et abordable, très similaire au Hiace. Prix : 6 000$ - 15 000$.' },
                            { title: 'Mitsubishi Delica', text: 'Option 4x4 pour les plus aventureux. Idéal pour les routes de gravier. Prix : 8 000$ - 18 000$.' },
                        ]
                    },
                    {
                        title: 'Guide des Prix',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Budget (5 000$ - 10 000$)', text: 'Vans plus anciens (2000-2005), aménagement simple. Parfait pour de courts séjours (1-3 mois).' },
                            { title: 'Milieu de Gamme (10 000$ - 18 000$)', text: 'Vans bien entretenus (2005-2012), bon aménagement. Idéal pour 3-6 mois de voyage.' },
                            { title: 'Premium (18 000$+)', text: 'Vans récents, conversions pro, panneaux solaires. Le top pour le long terme.' },
                        ]
                    },
                ],
                warnings: [
                    'Ne payez jamais d\'acompte sans avoir vu le van en personne',
                    'Méfiez-vous des prix trop bas pour être honnêtes',
                    'Faites un essai routier (ville et autoroute)',
                    'Vérifiez la concordance du nom du vendeur et de la carte grise',
                ],
                cta: {
                    title: 'Prêt à Trouver Votre Van ?',
                    text: 'Découvrez des campervans certifiés avec WOF valide et options de rachat sur Kiwi Van Market.',
                    buttonText: 'Chercher un Van',
                    buttonLink: '/',
                }
            }
        },
        'freedom-camping-nz': {
            title: 'Camping Sauvage en Nouvelle-Zélande - Règles et Meilleurs Spots 2025',
            description: 'Guide complet du freedom camping. Où dormir gratuitement, certification self-contained et amendes à éviter.',
            heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
            content: {
                intro: `Le camping sauvage (Freedom Camping) est l'un des meilleurs moyens de vivre la nature néo-zélandaise. Mais il y a des règles à respecter pour rester dans la légalité et protéger l'environnement.`,
                sections: [
                    {
                        title: 'Règles du Freedom Camping',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Certification Obligatoire', text: 'La plupart des spots exigent un véhicule certifié autonome (Self-Contained). Cela implique d\'avoir des toilettes et des cuves d\'eau.' },
                            { title: 'Vérifiez les Conseils Locaux', text: 'Chaque région a ses propres règles. Utilisez CamperMate ou WikiCamps pour trouver les spots légaux.' },
                            { title: 'Respect des Lieux', text: 'Emportez vos déchets, n\'utilisez pas de savon dans les lacs et respectez le temps maximum de séjour.' },
                        ]
                    },
                    {
                        title: 'Amendes à Éviter',
                        icon: 'AlertTriangle',
                        items: [
                            { title: 'Camping Non Autorisé', text: '200$ d\'amende immédiate. Cela peut monter très vite en cas d\'infraction répétée.' },
                            { title: 'Fausse Blue Card', text: '200$ d\'amende minimum. Les rangers vérifient l\'intérieur de votre van.' },
                        ]
                    },
                ],
                warnings: [
                    'Queenstown et les zones très touristiques sont très surveillées',
                    'En été (décembre-février), les places partent très vite',
                ],
                cta: {
                    title: 'Trouver un Van Autonome',
                    text: 'Le camping sauvage n\'est possible qu\'en Self-Contained. Trouvez le vôtre ici.',
                    buttonText: 'Voir les Vans SC',
                    buttonLink: '/?selfContained=true',
                }
            }
        },
        'selling-campervan-nz': {
            title: 'Comment Vendre Votre Campervan en Nouvelle-Zélande - Guide Rapide',
            description: 'Vendez votre van rapidement. Astuces pour le prix, les photos et comment atteindre les backpackers.',
            heroImage: 'https://images.unsplash.com/photo-1533591917513-091dc1b8d9cd?w=1200',
            content: {
                intro: `Vendre votre van à la fin de votre aventure ne doit pas être stressant. Avec la bonne méthode, vous vendrez vite et au bon prix.`,
                sections: [
                    {
                        title: 'Préparer le Van à la Vente',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Nettoyage en Profondeur', text: 'La première impression est capitale. Présentez un van propre et sain.' },
                            { title: 'Petit Entretien', text: 'Réparez les petits défauts : balais d\'essuie-glace, ampoules... ça rassure l\'acheteur.' },
                            { title: 'Nouveau WOF', text: 'Un van avec plus de 6 mois de WOF se vend beaucoup plus cher et plus vite.' },
                        ]
                    },
                ],
                warnings: [
                    'Attention aux arnaques et moyens de paiement inhabituels',
                    'Ne donnez jamais les clés avant d\'avoir reçu les fonds',
                ],
                cta: {
                    title: 'Déposer une Annonce Gratuite',
                    text: 'Touchez des milliers de voyageurs cherchant un van dès aujourd\'hui.',
                    buttonText: 'Vendre mon Van',
                    buttonLink: '/',
                }
            }
        },
        'how-to-inspect-campervan-nz': {
            title: 'Inspection d\'Expert - La Checklist Ultime d\'Achat en NZ',
            description: 'Ne vous faites pas avoir ! Notre guide d\'expert couvre tout : santé moteur, rouille et systèmes de vie.',
            heroImage: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200',
            content: {
                intro: `Acheter un van est votre plus gros investissement en NZ. Un intérieur "mignon" cache parfois des cauchemars mécaniques. Ce guide vous apprend à inspecter le cœur du véhicule.`,
                sections: [
                    {
                        title: 'Le Cœur Mécanique',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Le Démarrage à Froid', text: 'Touchez le moteur avant de démarrer. S\'il est chaud, le vendeur cache peut-être un problème de démarrage ou de fumée.' },
                            { title: 'Vérification "Mayonnaise"', text: 'Ouvrez le bouchon d\'huile. Un dépôt laiteux indique un joint de culasse HS - un échec catastrophique. Fuyez !' },
                        ]
                    },
                ],
                warnings: [
                    'N\'achetez JAMAIS sans un check mécanique indépendant (VTNZ, AA...)',
                    'Vérifiez le numéro VIN sur CarJam pour des dettes impayées',
                ],
                cta: {
                    title: 'Prêt pour l\'Inspection ?',
                    text: 'Utilisez cette checklist lors de votre prochaine visite.',
                    buttonText: 'Voir les Annonces',
                    buttonLink: '/',
                }
            }
        },
        'winter-camping-nz': {
            title: 'Guide de Survie : Camper en Hiver en Nouvelle-Zélande 2025',
            description: 'Survivre à l\'hiver en van ? C\'est possible et magique ! Trouvez les vans chauffés et l\'équipement nécessaire.',
            heroImage: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200',
            content: {
                intro: `L'hiver en Nouvelle-Zélande transforme le pays en paradis enneigé. Si vous êtes bien préparé, vous profiterez de prix bas et de paysages déserts.`,
                sections: [
                    {
                        title: 'Choisir un Van Hivernal',
                        icon: 'Shield',
                        items: [
                            { title: 'Le Diesel Heater', text: 'C\'est l\'indispensable. Il garde l\'intérieur à 20°C même sous la neige en consommant très peu.' },
                            { title: 'Isolation', text: 'Cherchez des vans isolés à la laine ou en mousse pour garder la chaleur.' },
                        ]
                    },
                ],
                warnings: [
                    'Attention au verglas (Black Ice) - roulez plus tard le matin',
                    'Surveillez l\'app MetService pour les fermetures de routes',
                ],
                cta: {
                    title: 'Besoin d\'un Chauffage ?',
                    text: 'Filtrez nos annonces pour trouver des vans chauffés.',
                    buttonText: 'Vans avec Chauffage',
                    buttonLink: '/',
                }
            }
        },
        'south-island-road-trip': {
            title: 'L\'Itinéraire Ultime du Road Trip de 14 Jours dans l\'Île du Sud',
            description: 'Le voyage le plus iconique au monde. De Christchurch à Milford Sound en 2 semaines.',
            heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
            content: {
                intro: `L'Île du Sud est le terrain de jeu ultime. Cet itinéraire de 14 jours vous emmène entre lacs turquoise et fjords spectaculaires.`,
                sections: [
                    {
                        title: 'Semaine 1 : Lacs et Glaciers',
                        icon: 'MapPin',
                        items: [
                            { title: 'Tekapo & Pukaki', text: 'Astronomie et randonnées au Mt Cook. Les eaux les plus bleues du pays.' },
                            { title: 'Wanaka', text: 'L\'arbre iconique et la randonnée Roy\'s Peak.' },
                        ]
                    },
                ],
                warnings: [
                    'Les sandflies sur la côte Ouest sont impitoyables !',
                    'L\'essence est chère dans les petits villages',
                ],
                cta: {
                    title: 'Commencer l\'Aventure',
                    text: 'Trouvez votre van à Christchurch dès aujourd\'hui.',
                    buttonText: 'Vans à Christchurch',
                    buttonLink: '/',
                }
            }
        },
        'best-vanlife-apps-nz': {
            title: 'Les 6 Applications Essentielles pour Tout Voyageur en Van en NZ (2025)',
            description: 'Ne partez pas sans celles-ci ! De la recherche de camps gratuits aux économies d\'essence.',
            heroImage: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=1200',
            content: {
                intro: `En 2025, votre téléphone est aussi important que votre pneu de secours. Ces apps font la différence entre un voyage moyen et une aventure épique.`,
                sections: [
                    {
                        title: 'Camping et Commodités',
                        icon: 'MapPin',
                        items: [
                            { title: 'CamperMate (Gratuit)', text: 'L\'appli indispensable pour les spots de camping sauvage et les toilettes.' },
                            { title: 'Gaspy', text: 'La communauté qui vous aide à trouver l\'essence la moins chère.' },
                        ]
                    },
                ],
                warnings: [
                    'Téléchargez toujours les cartes hors-ligne (Google Maps)',
                    'Les routes en NZ sont sinueuses, prévoyez 30% de temps en plus',
                ],
                cta: {
                    title: 'Prêt pour la Tech ?',
                    text: 'Équipez-vous d\'un chargeur 12V pour ne jamais tomber en panne de batterie.',
                    buttonText: 'Découvrir nos Vans',
                    buttonLink: '/',
                }
            }
        }
    },
    es: {
        'buying-campervan-nz': {
            title: 'Cómo comprar una campervan en Nueva Zelanda - Guía Completa 2025',
            description: 'Todo lo que necesitas saber sobre comprar una campervan en Nueva Zelanda. WOF, REGO, certificación self-contained, mejores marcas, precios y consejos para mochileros.',
            heroImage: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200',
            content: {
                intro: `Comprar una campervan en Nueva Zelanda es una de las mejores decisiones que puedes tomar como mochilero o viajero. Te da la libertad de explorar este hermoso país a tu propio ritmo, dormir donde quieras (¡legalmente!) y ahorrar dinero en alojamiento.`,
                sections: [
                    {
                        title: 'Qué revisar antes de comprar',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'WOF (Warrant of Fitness)', text: 'Es la inspección de seguridad vehicular de NZ. Revisa la fecha de vencimiento; necesitas un WOF válido para conducir legalmente. Las vans de más de 12 años necesitan un WOF cada 6 meses.' },
                            { title: 'REGO (Registration)', text: 'El registro del vehículo debe estar al día. Puedes verificar el estado de cualquier vehículo gratis en el sitio web de NZTA usando el número de matrícula.' },
                            { title: 'Papeles de Propiedad', text: 'Asegúrate de que el vendedor tenga los papeles de propiedad originales y que su identificación coincida. Nunca compres una van sin ver estos documentos.' },
                            { title: 'Estado Mecánico', text: 'Revisa los niveles de aceite, escucha ruidos del motor, prueba todas las marchas y busca óxido debajo. Considera pagar por una inspección profesional ($100-200).' },
                        ]
                    },
                    {
                        title: 'Certificación Self-Contained',
                        icon: 'Shield',
                        items: [
                            { title: '¿Qué es Self-Contained?', text: 'Un vehículo autónomo tiene baño, tanque de agua limpia (mín. 4L por persona) y tanque de aguas grises que cumple con la norma NZS 5465.' },
                            { title: 'Por qué lo necesitas', text: 'Las vans self-contained pueden acampar legalmente (freedom camp) en muchos lugares hermosos de NZ. Sin esto, estarás limitado a campings de pago.' },
                            { title: 'La Tarjeta Azul', text: 'Busca el adhesivo azul oficial de self-contained. Es válido por 4 años. Los adhesivos falsos pueden resultar en multas de más de $200.' },
                        ]
                    },
                    {
                        title: 'Mejores marcas de campervans en NZ',
                        icon: 'Car',
                        items: [
                            { title: 'Toyota Hiace', text: 'La opción más popular. Confiables, repuestos baratos y fáciles de encontrar, buen consumo de combustible. Precios: $8,000-$20,000.' },
                            { title: 'Nissan Caravan', text: 'Espaciosa y asequible. Fiabilidad similar a la Hiace. Precios: $6,000-$15,000.' },
                            { title: 'Mitsubishi Delica', text: 'Opción 4WD para viajeros aventureros. Ideal para caminos de grava. Precios: $8,000-$18,000.' },
                        ]
                    },
                    {
                        title: 'Guía de Precios',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Económico ($5,000-$10,000)', text: 'Vans antiguas (2000-2005), equipamiento básico, pueden necesitar arreglos. Buenas para viajes cortos (1-3 meses).' },
                            { title: 'Gama Media ($10,000-$18,000)', text: 'Vans bien mantenidas (2005-2012), buen equipamiento, fiables. Ideales para viajes de 3-6 meses.' },
                            { title: 'Premium ($18,000+)', text: 'Vans más nuevas, conversiones profesionales, paneles solares, todas las comodidades. Lo mejor para viajes de largo plazo.' },
                        ]
                    },
                ],
                warnings: [
                    'Nunca pagues un depósito sin ver la van en persona',
                    'Desconfía de precios que parezcan demasiado buenos para ser verdad',
                    'Revisa la van durante el día',
                    'Haz una prueba de manejo en diferentes tipos de camino (autopista, colinas)',
                ],
                cta: {
                    title: '¿Listo para encontrar tu van ideal?',
                    text: 'Explora campervans self-contained con WOF válido y opciones de recompra en Kiwi Van Market.',
                    buttonText: 'Ver Campervans',
                    buttonLink: '/',
                }
            }
        },
        'freedom-camping-nz': {
            title: 'Freedom Camping en Nueva Zelanda - Reglas y Mejores Spots 2025',
            description: 'Guía completa de freedom camping en Nueva Zelanda. Dónde acampar gratis, requisitos de self-contained y multas a evitar.',
            heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
            content: {
                intro: `El freedom camping es una de las mejores formas de experimentar la impresionante naturaleza de Nueva Zelanda sin gastar mucho dinero. Pero hay reglas que debes seguir para acampar legalmente y proteger el medio ambiente.`,
                sections: [
                    {
                        title: 'Reglas de Freedom Camping',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Self-Contained Obligatorio', text: 'La mayoría de los lugares de freedom camping requieren un vehículo certificado como autónomo (self-contained).' },
                            { title: 'Revisa las reglas locales', text: 'Cada región tiene reglas diferentes. Usa las apps CamperMate o WikiCamps para encontrar lugares legales y restricciones actuales.' },
                            { title: 'Estancia Máxima', text: 'La mayoría de los lugares permiten un máximo de 1-2 noches. Respeta siempre los límites.' },
                            { title: 'No dejes rastro', text: 'Lleva toda tu basura contigo y usa las estaciones de descarga (dump stations) adecuadas.' },
                        ]
                    },
                    {
                        title: 'Multas a evitar',
                        icon: 'AlertTriangle',
                        items: [
                            { title: 'Acampar en zonas prohibidas', text: 'Multa instantánea de $200. Puede llegar a $10,000 para infractores reincidentes.' },
                            { title: 'Adhesivo falso de Self-Contained', text: 'Multa de $200+. Los oficiales revisan que tu van realmente tenga las instalaciones requeridas.' },
                        ]
                    },
                ],
                warnings: [
                    'Queenstown y áreas turísticas populares tienen reglas muy estrictas de prohibición',
                    'El verano (Dic-Feb) es la época más concurrida; los lugares se llenan temprano',
                ],
                cta: {
                    title: 'Consigue una van Self-Contained',
                    text: 'El freedom camping solo es posible con un vehículo certificado. Encuentra uno en Kiwi Van Market.',
                    buttonText: 'Ver Vans Self-Contained',
                    buttonLink: '/?selfContained=true',
                }
            }
        },
        'selling-campervan-nz': {
            title: 'Cómo vender tu campervan en Nueva Zelanda - Guía Rápida',
            description: 'Vende tu campervan rápido en Nueva Zelanda. Consejos para precios, fotos y descripción.',
            heroImage: 'https://images.unsplash.com/photo-1533591917513-091dc1b8d9cd?w=1200',
            content: {
                intro: `Vender tu campervan al final de tu aventura en Nueva Zelanda no tiene por qué ser estresante. Con el enfoque correcto, puedes venderla rápido y a un precio justo.`,
                sections: [
                    {
                        title: 'Preparando tu van para la venta',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Limpieza profunda', text: 'La primera impresión importa. Limpia por dentro y por fuera, elimina objetos personales.' },
                            { title: 'Pequeñas reparaciones', text: 'Arregla problemas menores para dar confianza al comprador.' },
                            { title: 'Consigue un WOF nuevo', text: 'Una van con más de 6 meses de WOF se vende más rápido y por más dinero.' },
                        ]
                    },
                ],
                warnings: [
                    'Cuidado con estafadores que piden pagar por métodos inusuales',
                    'Nunca entregues las llaves antes de que el pago se haya acreditado',
                ],
                cta: {
                    title: 'Publica tu van gratis',
                    text: 'Llega a miles de mochileros que buscan campervans hoy mismo.',
                    buttonText: 'Vender mi Van',
                    buttonLink: '/',
                }
            }
        },
        'how-to-inspect-campervan-nz': {
            title: 'Inspección de Campervan Experta - La Checklist Definitiva en NZ',
            description: '¡No compres un desastre! Nuestra guía experta cubre todo: salud del motor, óxido estructural y sistemas de vivienda.',
            heroImage: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200',
            content: {
                intro: `Comprar una campervan es tu mayor inversión en NZ. Un interior "bonito" a menudo esconde pesadillas mecánicas. Esta guía te da las herramientas técnicas para inspeccionar el corazón del vehículo.`,
                sections: [
                    {
                        title: '1. El motor (bajo el capó)',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Prueba de arranque en frío', text: 'Toca el motor antes de arrancar. Si está caliente, el vendedor podría estar ocultando problemas de arranque o humo.' },
                            { title: 'Prueba de la "Mayonesa"', text: 'Abre el tapón del aceite. Un residuo blanco/beige indica una junta de culata quemada, un fallo catastrófico y costoso.' },
                        ]
                    },
                    {
                        title: '2. Integridad estructural',
                        icon: 'Shield',
                        items: [
                            { title: 'Chasis y óxido', text: 'Revisa debajo con una linterna. El óxido superficial está bien; el óxido estructural (agujeros) hará que no pases el WOF.' },
                        ]
                    },
                ],
                warnings: [
                    'NUNCA compres sin una inspección previa de un mecánico independiente ($140-180)',
                    'Revisa el VIN en CarJam.co.nz para asegurar que no hay deudas pendientes',
                ],
                cta: {
                    title: '¿Encontraste una buena?',
                    text: 'Compara con otros anuncios para asegurar que pagas un precio justo.',
                    buttonText: 'Comparar Anuncios',
                    buttonLink: '/',
                }
            }
        },
        'winter-camping-nz': {
            title: 'Guía de Supervivencia: Camping en Invierno en Nueva Zelanda 2025',
            description: '¿Se puede acampar en NZ en invierno? ¡Sí! Descubre las mejores vans calefaccionadas y equipo esencial.',
            heroImage: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200',
            content: {
                intro: `El invierno en Nueva Zelanda (junio a agosto) transforma el paisaje en un paraíso nevado. Si vas bien preparado, disfrutarás de precios más bajos y campings vacíos.`,
                sections: [
                    {
                        title: 'Eligiendo una van para el invierno',
                        icon: 'Shield',
                        items: [
                            { title: 'Calefacción Diesel', text: 'El estándar de oro para la vida en van en invierno. Mantiene el interior a 20°C incluso en ventiscas.' },
                            { title: 'El aislamiento es clave', text: 'Busca vans aisladas con lana de oveja o espuma profesional.' },
                        ]
                    },
                ],
                warnings: [
                    'El hielo negro (Black ice) es un peligro mayor; conduce más tarde por la mañana',
                    'Revisa siempre la app de MetService para alertas climáticas',
                ],
                cta: {
                    title: '¿Necesitas una van con calefacción?',
                    text: 'Filtra nuestros anuncios para encontrar vans aisladas con calefacción diesel.',
                    buttonText: 'Ver Vans de Invierno',
                    buttonLink: '/',
                }
            }
        },
        'south-island-road-trip': {
            title: 'El Itinerario Definitivo: Road Trip de 14 días por la Isla Sur',
            description: 'El viaje por carretera más icónico del mundo. De Christchurch a Milford Sound en 2 semanas.',
            heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
            content: {
                intro: `La Isla Sur de Nueva Zelanda es el paraíso definitivo para las campervans. Este itinerario te llevará por lagos turquesa y fiordos dramáticos.`,
                sections: [
                    {
                        title: 'Semana 1: Lagos y Glaciares',
                        icon: 'MapPin',
                        items: [
                            { title: 'Días 1-3: Lagos Tekapo y Pukaki', text: 'Observación de estrellas y caminatas en Mt Cook. Las aguas más azules del país.' },
                            { title: 'Días 4-5: Wanaka', text: 'El famoso árbol de Wanaka y la caminata a Roy\'s Peak.' },
                        ]
                    },
                ],
                warnings: [
                    'Las moscas de arena (sandflies) en la costa oeste son brutales; compra repelente local',
                    'La gasolina es cara en pueblos pequeños; reposta en ciudades principales',
                ],
                cta: {
                    title: 'Comienza tu viaje',
                    text: 'Recoge tu campervan en Christchurch y empieza la aventura hoy mismo.',
                    buttonText: 'Vans en Christchurch',
                    buttonLink: '/',
                }
            }
        },
        'best-vanlife-apps-nz': {
            title: '6 Apps Esenciales para todo Viajero en Van en NZ (2025)',
            description: '¡No te vayas sin estas! De encontrar campings secretos a ahorrar en gasolina.',
            heroImage: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=1200',
            content: {
                intro: `En 2025, tu teléfono es tan importante como el repuesto de tu van. Estas 6 apps marcan la diferencia en tu aventura.`,
                sections: [
                    {
                        title: 'Campings e Instalaciones',
                        icon: 'MapPin',
                        items: [
                            { title: 'CamperMate (Gratis)', text: 'La app n.º 1. Muestra spots de freedom camping, baños y gasolineras.' },
                            { title: 'WikiCamps NZ', text: 'Ideal para encontrar joyas ocultas que CamperMate podría omitir.' },
                        ]
                    },
                    {
                        title: 'Presupuesto y Combustible',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Gaspy', text: 'App de precios de combustible impulsada por la comunidad. Ahorra 10-20 centavos por litro.' },
                        ]
                    },
                ],
                warnings: [
                    'Descarga siempre mapas sin conexión en Google Maps',
                    'No confíes en los tiempos del GPS; las rutas en NZ son sinuosas',
                ],
                cta: {
                    title: '¿Listo para la tecnología?',
                    text: 'Equipa tu van con un cargador de 12V para mantener tu móvil con batería.',
                    buttonText: 'Ver Especificaciones',
                    buttonLink: '/',
                }
            }
        }
    }
};

// Aliases for retro-compatibility (English by default to avoid breaking existing links)
GUIDES['how-to-buy-campervan-nz'] = GUIDES.en['buying-campervan-nz'];
GUIDES['how-to-inspect-a-van'] = GUIDES.en['how-to-inspect-campervan-nz'];

export const IconMap = {
    CheckCircle,
    AlertTriangle,
    MapPin,
    Shield,
    Car,
    DollarSign,
};
