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
                intro: `Acheter un campervan en Nouvelle-Zélande est l'une des meilleures décisions que vous puissiez prendre en tant que voyageur. Cela vous offre la liberté d'explorer ce pays magnifique à votre rythme, de dormir où vous voulez (légalement !) et d'économiser sur l'hébergement.`,
                sections: [
                    {
                        title: 'Points à Vérifier Avant l\'Achat',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'WOF (Warrant of Fitness)', text: 'C\'est l\'inspection technique de sécurité. Vérifiez la date d\'expiration - vous avez besoin d\'un WOF valide pour conduire. Pour les vans de plus de 12 ans, le WOF doit être fait tous les 6 mois.' },
                            { title: 'REGO (Registration)', text: 'L\'immatriculation doit être à jour. Vous pouvez vérifier le statut de n\'importe quel véhicule gratuitement sur le site de la NZTA avec le numéro de plaque.' },
                            { title: 'Papiers de Propriété', text: 'Assurez-vous que le vendeur possède les documents originaux et que son identité correspond. N\'achetez jamais sans voir ces documents.' },
                            { title: 'État Mécanique', text: 'Vérifiez les niveaux d\'huile, écoutez les bruits du moteur, testez les vitesses et cherchez de la rouille. Une inspection pro ($100-200) est fortement recommandée.' },
                        ]
                    },
                    {
                        title: 'Certification Self-Contained',
                        icon: 'Shield',
                        items: [
                            { title: 'C\'est quoi le Self-Contained ?', text: 'Un véhicule autonome a des toilettes, un réservoir d\'eau propre (min 4L/pers) et un réservoir d\'eaux usées aux normes NZS 5465.' },
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
                            { title: 'Mazda Bongo', text: 'Compact et économe. Beaucoup ont des toits relevables (pop-top). Prix : 7 000$ - 15 000$.' },
                        ]
                    },
                    {
                        title: 'Guide des Prix',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Budget (5 000$ - 10 000$)', text: 'Vans plus anciens (2000-2005), aménagement simple, peuvent nécessiter des travaux. Bien pour 1-3 mois.' },
                            { title: 'Milieu de Gamme (10 000$ - 18 000$)', text: 'Vans bien entretenus (2005-2012), bon aménagement, fiables. Idéal pour 3-6 mois.' },
                            { title: 'Premium (18 000$+)', text: 'Vans récents, conversions pro, panneaux solaires, tout confort. Le top pour le long terme.' },
                        ]
                    },
                    {
                        title: 'Où Acheter',
                        icon: 'MapPin',
                        items: [
                            { title: 'Auckland', text: 'Le plus grand choix en NZ. Idéal pour commencer si vous arrivez de l\'étranger. Beaucoup de vendeurs backpackers.' },
                            { title: 'Christchurch', text: 'Parfait pour l\'Île du Sud. Bon choix, prix parfois un peu plus bas qu\'Auckland.' },
                            { title: 'Wellington', text: 'Le hub du ferry. Pratique si vous voulez explorer les deux îles rapidement.' },
                        ]
                    },
                    {
                        title: 'Options de Rachat (Buy-Back)',
                        icon: 'Shield',
                        items: [
                            { title: 'C\'est quoi le Buy-Back ?', text: 'Certains vendeurs garantissent de racheter le van à prix fixe à la fin de votre trip. Idéal pour la tranquillité.' },
                            { title: 'Conditions Typiques', text: 'Souvent 50-70% du prix d\'achat, valable 3-12 mois. Vérifiez les limites de kilométrage.' },
                            { title: 'Est-ce rentable ?', text: 'Oui si vous voulez zéro stress pour la revente. Vous pourriez gagner plus en privé, mais le rachat fait gagner un temps précieux.' },
                        ]
                    },
                ],
                warnings: [
                    'Ne payez JAMAIS d\'acompte sans avoir vu le van en personne',
                    'Méfiez-vous des prix trop bas pour être honnêtes',
                    'Vérifiez le van en plein jour uniquement',
                    'Faites un essai routier sur différents types de routes (ville et autoroute)',
                    'Vérifiez que l\'identité du vendeur correspond à la carte grise',
                ],
                cta: {
                    title: 'Prêt à Trouver Votre Van Idéal ?',
                    text: 'Découvrez des campervans certifiés avec WOF valide et options de rachat sur Kiwi Van Market.',
                    buttonText: 'Chercher un Van',
                    buttonLink: '/',
                }
            }
        },
        'freedom-camping-nz': {
            title: 'Camping Sauvage en Nouvelle-Zélande - Règles et Meilleurs Spots 2025',
            description: 'Guide complet du freedom camping en Nouvelle-Zélande. Où dormir gratuitement, certification self-contained et amendes à éviter.',
            heroImage: 'https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200',
            content: {
                intro: `Le camping sauvage (Freedom Camping) est l'un des meilleurs moyens de vivre la nature néo-zélandaise. Mais il y a des règles strictes à respecter pour rester dans la légalité et protéger l'environnement.`,
                sections: [
                    {
                        title: 'Règles du Freedom Camping',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Certification Obligatoire', text: 'La plupart des spots exigent un véhicule certifié autonome (Self-Contained). Cela implique d\'avoir des toilettes et des cuves d\'eau.' },
                            { title: 'Vérifiez les Conseils Locaux', text: 'Chaque région a ses propres règles. Utilisez CamperMate ou WikiCamps pour trouver les spots légaux.' },
                            { title: 'Temps de Séjour', text: 'La plupart des spots limitent à 1 ou 2 nuits maximum. Ne restez pas au-delà.' },
                            { title: 'Respect des Lieux', text: 'Emportez vos déchets, ne videz pas vos eaux grises au sol et utilisez les stations de vidange.' },
                        ]
                    },
                    {
                        title: 'Amendes à Éviter',
                        icon: 'AlertTriangle',
                        items: [
                            { title: 'Camping Non Autorisé', text: '200$ d\'amende immédiate. Cela peut monter jusqu\'à 10 000$ en cas de récidive ou dégâts.' },
                            { title: 'Fausse Blue Card', text: '200$ d\'amende minimum. Les rangers vérifient l\'intérieur de votre van pour s\'assurer des installations.' },
                            { title: 'Déchets et Eaux Usées', text: 'Jusqu\'à 10 000$ d\'amende pour vidange illégale des toilettes ou eaux grises.' },
                        ]
                    },
                    {
                        title: 'Meilleures Régions pour le Freedom',
                        icon: 'MapPin',
                        items: [
                            { title: 'Côte Ouest (Île du Sud)', text: 'Règles plus souples, plages et forêts sauvages. Super spots vers Hokitika et Greymouth.' },
                            { title: 'Otago/Southland', text: 'Lacs et montagnes magnifiques. Beaucoup de campings DOC avec services de base.' },
                            { title: 'East Cape (Île du Nord)', text: 'Hors des sentiers battus, locaux accueillants, côtes sublimes.' },
                        ]
                    },
                ],
                warnings: [
                    'Queenstown et les zones très touristiques ont des règles de "no-camping" très strictes',
                    'Auckland a très peu d\'options de freedom camping en centre-ville',
                    'En été (décembre-février), les places partent très vite dès la fin d\'après-midi',
                    'Ayez toujours un plan B (camping payant) au cas où le spot est complet',
                ],
                cta: {
                    title: 'Trouver un Van Autonome',
                    text: 'Le camping sauvage n\'est possible qu\'en Self-Contained. Trouvez le vôtre sur Kiwi Van Market.',
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
                intro: `Vendre votre van à la fin de votre aventure ne doit pas être stressant. Avec la bonne méthode, vous vendrez vite et au bon prix avant de reprendre votre avion.`,
                sections: [
                    {
                        title: 'Préparer le Van à la Vente',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Nettoyage en Profondeur', text: 'La première impression est capitale. Présentez un van propre, vide de vos objets personnels et qui sent bon.' },
                            { title: 'Petit Entretien', text: 'Réparez les petits défauts : balais d\'essuie-glace, ampoules... ça rassure l\'acheteur sur le soin apporté.' },
                            { title: 'Nouveau WOF', text: 'Un van avec plus de 6 mois de WOF se vend beaucoup plus cher et plus vite. C\'est un investissement de 50-100$.' },
                            { title: 'Documents Prêts', text: 'Ayez la carte grise, l\'historique d\'entretien et le certificat self-contained sous la main.' },
                        ]
                    },
                    {
                        title: 'Réussir ses Photos',
                        icon: 'Car',
                        items: [
                            { title: 'Le Bon Moment', text: 'Prenez les photos à la "golden hour" (lever ou coucher du soleil) pour une lumière flatteuse.' },
                            { title: 'Tous les Angles', text: 'Extérieur (avant/arrière/côtés), lit déplié, cuisine, poste de conduite et moteur.' },
                            { title: 'Quantité', text: 'Entre 10 et 15 photos est l\'idéal. Plus de photos = plus de confiance.' },
                            { title: 'Honnêteté', text: 'Montrez aussi les petits défauts ou rayures. Ça évite de perdre du temps en visite.' },
                        ]
                    },
                    {
                        title: 'Stratégie de Prix',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Étude de Marché', text: 'Regardez les vans similaires sur Kiwi Van Market et fixez un prix compétitif.' },
                            { title: 'Soyez Réaliste', text: 'En fin de saison (mars-avril), les prix chutent. Anticipez votre départ.' },
                            { title: 'Marge de Négociation', text: 'Affichez 5-10% au-dessus de votre minimum. Les acheteurs adorent négocier.' },
                        ]
                    },
                    {
                        title: 'Où Publier',
                        icon: 'MapPin',
                        items: [
                            { title: 'Kiwi Van Market', text: 'Annonces gratuites, public 100% backpacker. Publiez ici en priorité !' },
                            { title: 'Groupes Facebook', text: 'Certains groupes "Backpackers NZ" sont très actifs pour les ventes rapides.' },
                            { title: 'Auberges de Jeunesse', text: 'Les tableaux d\'affichage physiques dans les grandes villes marchent toujours.' },
                        ]
                    },
                ],
                warnings: [
                    'Attention aux arnaques et moyens de paiement inhabituels (utilisez Wise ou cash)',
                    'Ne donnez jamais les clés avant d\'avoir reçu les fonds sur votre compte',
                    'Donnez rendez-vous dans des lieux publics et sûrs',
                    'Complétez le transfert de propriété immédiatement via le site de la NZTA',
                ],
                cta: {
                    title: 'Déposer une Annonce Gratuite',
                    text: 'Touchez des milliers de voyageurs cherchant un van dès aujourd\'hui en 5 minutes.',
                    buttonText: 'Vendre mon Van',
                    buttonLink: '/',
                }
            }
        },
        'how-to-inspect-campervan-nz': {
            title: 'Inspection d\'Expert - La Checklist Ultime d\'Achat en NZ',
            description: 'Ne vous faites pas avoir ! Notre guide d\'expert couvre tout : santé moteur, rouille structurelle et systèmes de vie.',
            heroImage: 'https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200',
            content: {
                intro: `Acheter un van est votre plus gros investissement en NZ. Un intérieur "mignon" cache parfois des cauchemars mécaniques. Ce guide vous donne les outils techniques pour inspecter le cœur du véhicule. Si un vendeur refuse ces tests, fuyez !`,
                sections: [
                    {
                        title: '1. Le Cœur Mécanique (Sous le Capot)',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Démarrage à Froid', text: 'Touchez le bloc moteur avant de démarrer. S\'il est chaud, le vendeur cache peut-être un problème de démarrage ou de fumée (bleue = huile, blanche = liquide).' },
                            { title: 'Le Test "Mayonnaise"', text: 'Ouvrez le bouchon d\'huile. Un dépôt laiteux/beige ("mayo") indique un joint de culasse HS - une panne catastrophique et hors de prix.' },
                            { title: 'Courroie de Distrib', text: 'Demandez quand la courroie (cam-belt) a été changée. Si elle casse, le moteur est mort. Elle se change tous les 100 000 km.' },
                        ]
                    },
                    {
                        title: '2. Intégrité Structurelle (La Chasse à la Rouille)',
                        icon: 'Shield',
                        items: [
                            { title: 'Châssis et Bas de Caisse', text: 'Mettez-vous au sol avec une lampe. Cherchez des boursouflures ou des trous. La rouille de surface est ok, la rouille structurelle fera échouer le WOF.' },
                            { title: 'Usure des Pneus', text: 'Si un pneu est plus usé d\'un côté, l\'alignement ou la suspension sont à refaire. Comptez 500$+ de frais.' },
                        ]
                    },
                    {
                        title: '3. L\'Essai Routier (Performance)',
                        icon: 'Car',
                        items: [
                            { title: 'Boîte et Embrayage', text: 'Passez toutes les vitesses. En manuel, testez si l\'embrayage patine en 4ème à basse vitesse en accélérant fort.' },
                            { title: 'Freinage et Direction', text: 'Lâchez brièvement le volant sur une route plate : le van doit rester droit. Freinez fort pour tester les vibrations (disques voilés).' },
                        ]
                    },
                    {
                        title: '4. Systèmes de Vie et Électricité',
                        icon: 'MapPin',
                        items: [
                            { title: 'Le Test d\'Infiltration', text: 'Cherchez des taches sombres près des fenêtres. Appuyez sur les parois : si c\'est mou, le bois est pourri par l\'eau.' },
                            { title: 'Batterie Auxiliaire', text: 'Allumez toutes les lumières et le frigo pour voir si le voltage de la batterie secondaire chute instantanément.' },
                        ]
                    },
                ],
                warnings: [
                    'N\'achetez JAMAIS sans un check mécanique indépendant ($140-180)',
                    'Vérifiez le numéro VIN sur CarJam.co.nz pour confirmer l\'absence de dettes',
                    'Vérifiez que la carte bleue self-contained correspond bien à la plaque du van',
                ],
                cta: {
                    title: 'Prêt pour l\'Inspection ?',
                    text: 'Utilisez cette checklist lors de votre visite et comparez avec d\'autres annonces.',
                    buttonText: 'Voir les Annonces',
                    buttonLink: '/',
                }
            }
        },
        'winter-camping-nz': {
            title: 'Guide de Survie : Camper en Hiver en Nouvelle-Zélande 2025',
            description: 'Survivre à l\'hiver en van ? C\'est possible et magique ! Découvrez les vans chauffés, les routes de neige et l\'équipement essentiel.',
            heroImage: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200',
            content: {
                intro: `L'hiver en Nouvelle-Zélande (juin à août) transforme le pays en paradis enneigé. Si vous êtes bien préparé, vous profiterez de prix bas et de paysages déserts. Voici comment survivre quand le mercure descend sous zéro.`,
                sections: [
                    {
                        title: 'Choisir un Van Hivernal',
                        icon: 'Shield',
                        items: [
                            { title: 'Isolation Indispensable', text: 'Cherchez de la laine de mouton ou de la mousse. Évitez le "métal nu" qui transforme le van en frigo la nuit.' },
                            { title: 'Le Diesel Heater', text: 'Le top du top. Il garde l\'intérieur à 20°C même sous la neige en consommant très peu de carburant.' },
                            { title: 'Certification Self-Contained', text: 'En hiver, vous apprécierez d\'avoir vos propres installations au chaud plutôt que de sortir dans la neige.' },
                        ]
                    },
                    {
                        title: 'L\'Équipement Crucial',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Sac de Couchage -5°C', text: 'Un sac d\'été ne suffira pas. Investissez dans un bon sac ou une couette à haut grammage.' },
                            { title: 'Chaînes à Neige', text: 'Obligatoires sur beaucoup de cols (Crown Range, Milford Road). Entraînez-vous à les mettre avant !' },
                            { title: 'Déshumidificateurs', text: 'La condensation est votre ennemie. Utilisez des absorbeurs d\'humidité pour éviter les moisissures.' },
                        ]
                    },
                    {
                        title: 'Meilleurs Spots d\'Hiver',
                        icon: 'MapPin',
                        items: [
                            { title: 'Ohakune (Île du Nord)', text: 'Porte d\'entrée du Mt Ruapehu. Ambiance ski et beaucoup de vans chauffés à vendre.' },
                            { title: 'Wanaka & Queenstown', text: 'Le cœur de l\'hiver. Installations pro et parkings longue durée pour vans.' },
                            { title: 'Tekapo', text: 'Le plus froid mais le meilleur ciel étoilé. Assurez-vous que vos batteries soient bien chargées !' },
                        ]
                    },
                ],
                warnings: [
                    'Attention au verglas (Black Ice) - roulez plus tard le matin une fois le soleil levé',
                    'Évitez les cols alpins lors d\'avis de fortes chutes de neige',
                    'Surveillez l\'app MetService pour les alertes météo avant de bouger',
                ],
                cta: {
                    title: 'Besoin d\'un Chauffage ?',
                    text: 'Filtrez nos annonces pour trouver des vans isolés avec chauffage diesel.',
                    buttonText: 'Vans avec Chauffage',
                    buttonLink: '/',
                }
            }
        },
        'south-island-road-trip': {
            title: 'L\'Itinéraire Ultime du Road Trip de 14 Jours dans l\'Île du Sud',
            description: 'Le voyage le plus iconique au monde. De Christchurch à Milford Sound, découvrez les meilleurs spots.',
            heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
            content: {
                intro: `L'Île du Sud est le terrain de jeu ultime pour les campervans. Cet itinéraire de 14 jours vous emmène entre lacs turquoise, glaciers millénaires et fjords spectaculaires. Préparez votre appareil photo !`,
                sections: [
                    {
                        title: 'Semaine 1 : Lacs et Glaciers',
                        icon: 'MapPin',
                        items: [
                            { title: 'Jours 1-3: Tekapo & Pukaki', text: 'Astronomie et rando au Mt Cook. Dormez au bord de Pukaki (freedom camping autorisé pour SC).' },
                            { title: 'Jours 4-5: Wanaka', text: 'Le fameux arbre de Wanaka et la rando Roy\'s Peak pour la meilleure vue du pays.' },
                            { title: 'Jours 6-7: Queenstown', text: 'Capitale de l\'aventure. Profitez-en pour une nuit en camping de luxe (douche chaude !).' },
                        ]
                    },
                    {
                        title: 'Semaine 2 : Fjords et Côtes Sauvages',
                        icon: 'Car',
                        items: [
                            { title: 'Jours 8-9: Milford Sound', text: 'Croisière dans le fjord. Attention : zéro réseau ici, téléchargez vos cartes hors-ligne.' },
                            { title: 'Jours 10-12: Côte Ouest', text: 'Glaciers Fox et Franz Josef, Pancake Rocks. Routes côtières sublimes.' },
                            { title: 'Jours 13-14: Arthur\'s Pass', text: 'Retour vers Christchurch par le cœur des Alpes du Sud.' },
                        ]
                    },
                ],
                warnings: [
                    'Les sandflies sur la côte Ouest sont impitoyables : achetez du répulsif local ("Goodbye Sandfly")',
                    'Réservez toujours vos croisières à Milford Sound à l\'avance',
                    'L\'essence est chère dans les petits villages : faites le plein dans les grandes villes',
                ],
                cta: {
                    title: 'Commencer l\'Aventure',
                    text: 'Récupérez votre campervan à Christchurch et prenez la route dès aujourd\'hui.',
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
                intro: `En 2025, votre téléphone est aussi important que votre pneu de secours. Ces 6 apps font la différence entre un voyage moyen et une aventure épique.`,
                sections: [
                    {
                        title: 'Camping et Commodités',
                        icon: 'MapPin',
                        items: [
                            { title: 'CamperMate (Gratuit)', text: 'L\'appli indispensable. Montre les spots de freedom camping, toilettes et stations service.' },
                            { title: 'WikiCamps NZ', text: 'Idéal pour trouver des petits coins cachés que CamperMate pourrait rater.' },
                        ]
                    },
                    {
                        title: 'Budget et Carburant',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Gaspy', text: 'L\'appli communautaire des prix de l\'essence. Économisez 10-20 cts par litre facilement.' },
                            { title: 'Kiwi Van Market', text: 'Gardez notre site pour les valeurs de revente et trouver des pièces partout.' },
                        ]
                    },
                    {
                        title: 'Sécurité et GPS',
                        icon: 'Shield',
                        items: [
                            { title: 'MetService', text: 'Crucial pour la météo des montagnes et les fermetures de routes.' },
                            { title: 'NZTA Waka Kotahi', text: 'Alertes en temps réel sur les dangers de la route. Indispensable.' },
                        ]
                    },
                ],
                warnings: [
                    'Téléchargez toujours les cartes hors-ligne pour toute la Nouvelle-Zélande sur Google Maps',
                    'Ne vous fiez pas aux temps GPS : les routes sinueuses prennent 30% de temps en plus',
                ],
                cta: {
                    title: 'Prêt pour la Tech ?',
                    text: 'Équipez-vous d\'un chargeur 12V pour ne jamais tomber en panne de batterie.',
                    buttonText: 'Équiper mon Van',
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
                intro: `Comprar una campervan en Nueva Zelanda es una de las mejores decisiones que puedes tomar como mochilero o viajero. Te da la libertad de explorar este hermoso país a tu propio ritmo, dormir donde quieras (¡legalmente!) y ahorrar mucho dinero en alojamiento.`,
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
                            { title: 'Mazda Bongo', text: 'Compacta y eficiente. Muchas tienen techos elevables. Precios: $7,000-$15,000.' },
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
                    {
                        title: 'Dónde Comprar',
                        icon: 'MapPin',
                        items: [
                            { title: 'Auckland', text: 'La mayor selección en NZ. El mejor lugar para empezar si vienes del extranjero. Muchos vendedores backpackers.' },
                            { title: 'Christchurch', text: 'Ideal para aventuras en la Isla Sur. Buena selección, precios a veces más bajos que en Auckland.' },
                            { title: 'Wellington', text: 'El hub del ferry entre las islas. Compra aquí si quieres explorar ambas rápidamente.' },
                        ]
                    },
                    {
                        title: 'Opciones de Recompra (Buy-Back)',
                        icon: 'Shield',
                        items: [
                            { title: '¿Qué es el Buy-Back?', text: 'Algunos vendedores garantizan recomprar la van a un precio fijo al final de tu viaje. Ideal para la tranquilidad.' },
                            { title: 'Términos Típicos', text: 'Suele ser el 50-70% del precio de compra, válido por 3-12 meses. Revisa bien los límites de kilometraje.' },
                            { title: '¿Vale la pena?', text: 'Sí, si quieres cero estrés al vender. Podrías ganar más en venta privada, pero el buy-back ahorra mucho tiempo.' },
                        ]
                    },
                ],
                warnings: [
                    'NUNCA pagues un depósito sin ver la van en persona',
                    'Desconfía de precios que parezcan demasiado buenos para ser verdad',
                    'Revisa la van solo durante el día',
                    'Haz una prueba de manejo en diferentes tipos de camino (autopista, colinas)',
                    'Verifica que la identidad del vendedor coincida con los papeles de propiedad',
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
                intro: `El freedom camping es una de las mejores formas de experimentar la impresionante naturaleza de Nueva Zelanda sin gastar mucho dinero. Pero hay reglas estrictas que debes seguir para acampar legalmente y proteger el medio ambiente.`,
                sections: [
                    {
                        title: 'Reglas de Freedom Camping',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Self-Contained Obligatorio', text: 'La mayoría de los lugares requieren un vehículo certificado como autónomo (self-contained). Esto implica tener baño y tanques de agua.' },
                            { title: 'Revisa las reglas locales', text: 'Cada región tiene reglas diferentes. Usa las apps CamperMate o WikiCamps para encontrar lugares legales.' },
                            { title: 'Estancia Máxima', text: 'La mayoría de los lugares permiten un máximo de 1-2 noches. No te quedes más tiempo del permitido.' },
                            { title: 'No dejes rastro', text: 'Lleva toda tu basura contigo, no viertas aguas grises al suelo y usa las estaciones de descarga.' },
                        ]
                    },
                    {
                        title: 'Multas a evitar',
                        icon: 'AlertTriangle',
                        items: [
                            { title: 'Acampar en zonas prohibidas', text: 'Multa instantánea de $200. Puede llegar a $10,000 para infractores reincidentes o daños ambientales.' },
                            { title: 'Adhesivo falso de Self-Contained', text: 'Multa de $200+. Los oficiales revisan tu van para asegurar que tenga las instalaciones requeridas.' },
                            { title: 'Vertido de residuos', text: 'Hasta $10,000 de multa por vaciar el baño o aguas grises ilegalmente.' },
                        ]
                    },
                    {
                        title: 'Mejores Regiones para Freedom',
                        icon: 'MapPin',
                        items: [
                            { title: 'Costa Oeste (Isla Sur)', text: 'Reglas más relajadas, playas y bosques impresionantes. Grandes spots cerca de Hokitika y Greymouth.' },
                            { title: 'Otago/Southland', text: 'Hermosos lagos y montañas. Muchos campings del DOC con instalaciones básicas.' },
                            { title: 'East Cape (Isla Norte)', text: 'Fuera de la ruta turística, locales amigables y una costa espectacular.' },
                        ]
                    },
                ],
                warnings: [
                    'Queenstown y áreas turísticas famosas tienen reglas de "no camping" muy estrictas',
                    'Auckland tiene opciones muy limitadas de freedom camping en el centro',
                    'En verano (Dic-Feb), los lugares se llenan muy temprano por la tarde',
                    'Ten siempre un plan B (camping de pago) por si el spot está lleno',
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
            description: 'Vende tu campervan rápido en Nueva Zelanda. Consejos para precios, fotos y cómo llegar a compradores mochileros.',
            heroImage: 'https://images.unsplash.com/photo-1533591917513-091dc1b8d9cd?w=1200',
            content: {
                intro: `Vender tu campervan al final de tu aventura en Nueva Zelanda no tiene por qué ser estresante. Con el enfoque correcto, puedes venderla rápido y a un precio justo antes de volar a casa.`,
                sections: [
                    {
                        title: 'Preparando tu van para la venta',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Limpieza profunda', text: 'La primera impresión importa. Limpia por dentro y por fuera, elimina objetos personales y haz que huela bien.' },
                            { title: 'Pequeñas reparaciones', text: 'Arregla problemas menores (limpiaparabrisas, luces) para dar confianza al comprador sobre el cuidado de la van.' },
                            { title: 'Consigue un WOF nuevo', text: 'Una van con más de 6 meses de WOF se vende mucho más rápido y caro. Es una inversión de $50-100 muy rentable.' },
                            { title: 'Prepara los documentos', text: 'Ten a mano los papeles de propiedad, el historial de mantenimiento y el certificado self-contained.' },
                        ]
                    },
                    {
                        title: 'Haciendo buenas fotos',
                        icon: 'Car',
                        items: [
                            { title: 'El momento ideal', text: 'Toma las fotos durante la "hora dorada" (amanecer o atardecer) para una luz más bonita.' },
                            { title: 'Todos los ángulos', text: 'Exterior completo, cama armada, cocina, puesto de conducción y motor.' },
                            { title: 'Cantidad', text: 'Entre 10 y 15 fotos es lo ideal. Más fotos = más confianza y venta más rápida.' },
                            { title: 'Honestidad', text: 'Muestra también cualquier daño o desgaste. Ahorra tiempo para ti y para el comprador.' },
                        ]
                    },
                    {
                        title: 'Estrategia de precios',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Investiga el mercado', text: 'Revisa vans similares en Kiwi Van Market y fija un precio competitivo.' },
                            { title: 'Sé realista', text: 'Al final de la temporada (marzo-abril), los precios bajan. Anticipa tu salida.' },
                            { title: 'Margen de negociación', text: 'Publica un 5-10% por encima de tu mínimo. Los compradores en NZ esperan negociar.' },
                        ]
                    },
                    {
                        title: 'Dónde publicar',
                        icon: 'MapPin',
                        items: [
                            { title: 'Kiwi Van Market', text: 'Anuncios gratis, público 100% mochilero. ¡Publica aquí primero!' },
                            { title: 'Grupos de Facebook', text: 'Los grupos de "Backpackers NZ" son muy activos para ventas rápidas.' },
                            { title: 'Hostels', text: 'Los tablones de anuncios físicos en las grandes ciudades todavía funcionan muy bien.' },
                        ]
                    },
                ],
                warnings: [
                    'Cuidado con estafadores y métodos de pago inusuales (usa Wise o efectivo)',
                    'Nunca entregues las llaves antes de confirmar que el pago está en tu cuenta',
                    'Queda con los compradores en lugares públicos y seguros',
                    'Completa la transferencia de propiedad al instante en la web de NZTA',
                ],
                cta: {
                    title: 'Publica tu van gratis',
                    text: 'Llega a miles de mochileros que buscan campervans hoy mismo en solo 5 minutos.',
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
                intro: `Comprar una campervan es tu mayor inversión en NZ. Un interior "bonito" a menudo esconde pesadillas mecánicas. Esta guía te da las herramientas técnicas para inspeccionar el corazón del vehículo. Si un vendedor se niega a estas pruebas, ¡huye!`,
                sections: [
                    {
                        title: '1. El motor (Bajo el capó)',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Arranque en frío', text: 'Toca el motor antes de arrancar. Si está caliente, el vendedor podría ocultar problemas de arranque o humo (azul = aceite, blanco = refrigerante).' },
                            { title: 'Prueba de la "Mayonesa"', text: 'Abre el tapón del aceite. Un residuo blanco/beige ("mayo") indica una junta de culata quemada, un fallo catastrófico y carísimo.' },
                            { title: 'Correa de Distribución', text: 'Pregunta cuándo se cambió la correa (cam-belt). Si se rompe, el motor queda destruido. Se cambia cada 100,000 km.' },
                        ]
                    },
                    {
                        title: '2. Integridad estructural (Chasis)',
                        icon: 'Shield',
                        items: [
                            { title: 'Chasis y óxido', text: 'Revisa debajo con una linterna. Busca zonas burbujeantes o agujeros. El óxido superficial es normal, el estructural hará que no pases el WOF.' },
                            { title: 'Desgaste de neumáticos', text: 'Si el desgaste es desigual, hay problemas de alineación o suspensión. Prevé al menos $500 para arreglos.' },
                        ]
                    },
                    {
                        title: '3. Prueba de manejo (Performance)',
                        icon: 'Car',
                        items: [
                            { title: 'Caja de cambios', text: 'Prueba todas las marchas. En manual, pon 4ª a baja velocidad y acelera a fondo para ver si el embrague patina.' },
                            { title: 'Frenos y Dirección', text: 'Suelta el volante brevemente en una recta: la van debe seguir recta. Frena fuerte para notar vibraciones en el pedal (discos alabeados).' },
                        ]
                    },
                    {
                        title: '4. Sistemas de vivienda y electricidad',
                        icon: 'MapPin',
                        items: [
                            { title: 'Test de humedad', text: 'Busca manchas oscuras cerca de ventanas. Presiona las paredes; si se sienten blandas, la madera está podrida por humedad.' },
                            { title: 'Batería auxiliar', text: 'Enciende todas las luces y la nevera para ver si el voltaje de la batería secundaria cae instantáneamente.' },
                        ]
                    },
                ],
                warnings: [
                    'NUNCA compres sin una inspección mecánica independiente ($140-180)',
                    'Revisa el VIN en CarJam.co.nz para asegurar que no hay deudas pendientes',
                    'Verifica que la tarjeta azul self-contained coincida con la matrícula de la van',
                ],
                cta: {
                    title: '¿Listo para la inspección?',
                    text: 'Usa esta checklist en tu próxima visita y compara con otros anuncios en Kiwi Van Market.',
                    buttonText: 'Ver Anuncios',
                    buttonLink: '/',
                }
            }
        },
        'winter-camping-nz': {
            title: 'Guía de Supervivencia: Camping en Invierno en Nueva Zelanda 2025',
            description: '¿Se puede acampar en NZ en invierno? ¡Sí! Descubre las mejores vans calefaccionadas, rutas de nieve y equipo esencial para el frío.',
            heroImage: 'https://images.unsplash.com/photo-1418985991508-e47386d96a71?w=1200',
            content: {
                intro: `El invierno en Nueva Zelanda (junio a agosto) transforma el país en un paraíso nevado. Si vas bien preparado, disfrutarás de precios bajos y paisajes desiertos. Aquí tienes cómo sobrevivir cuando el termómetro baja de cero.`,
                sections: [
                    {
                        title: 'Eligiendo una van para el invierno',
                        icon: 'Shield',
                        items: [
                            { title: 'El aislamiento es vital', text: 'Busca vans aisladas con lana de oveja o espuma. Evita el "metal visto" que hace la van helada por la noche.' },
                            { title: 'Calefacción Diesel', text: 'El estándar de oro. Mantiene el interior a 20°C incluso en ventiscas consumiendo muy poco combustible.' },
                            { title: 'Certificación Self-Contained', text: 'En invierno agradecerás tener tus propios servicios dentro en vez de salir a la nieve por la noche.' },
                        ]
                    },
                    {
                        title: 'Equipo que no puede faltar',
                        icon: 'CheckCircle',
                        items: [
                            { title: 'Sacos de dormir -5°C', text: 'Un saco de verano no servirá. Invierte en un buen saco de pluma o un edredón grueso.' },
                            { title: 'Cadenas para nieve', text: 'Obligatorias en muchos pasos de montaña (Crown Range, Milford Road). ¡Practica ponerlas antes!' },
                            { title: 'Deshumidificadores', text: 'La condensación es tu enemiga. Usa absorbentes de humedad para evitar moho en el colchón.' },
                        ]
                    },
                    {
                        title: 'Mejores Spots de Invierno',
                        icon: 'MapPin',
                        items: [
                            { title: 'Ohakune (Isla Norte)', text: 'Puerta al Mt Ruapehu. Ambiente de esquí y muchas vans calefaccionadas se venden aquí.' },
                            { title: 'Wanaka y Queenstown', text: 'El corazón del invierno. Instalaciones profesionales y parkings de larga estancia para vans.' },
                            { title: 'Tekapo', text: 'El lugar más frío pero con el mejor cielo estrellado. ¡Carga bien todas tus baterías!' },
                        ]
                    },
                ],
                warnings: [
                    'Atención al "Black Ice" (hielo negro); conduce más tarde por la mañana cuando el sol lo haya derretido',
                    'Evita los pasos de montaña si hay alertas de fuertes nevadas',
                    'Revisa siempre la app de MetService para alertas climáticas antes de moverte',
                ],
                cta: {
                    title: '¿Buscas una van con calefacción?',
                    text: 'Filtra nuestros anuncios para encontrar vans aisladas con calefacción diesel.',
                    buttonText: 'Vans de Invierno',
                    buttonLink: '/',
                }
            }
        },
        'south-island-road-trip': {
            title: 'El Itinerario Definitivo: Road Trip de 14 días por la Isla Sur',
            description: 'El viaje por carretera más icónico del mundo. De Christchurch a Milford Sound, descubre los mejores spots y campings.',
            heroImage: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1200',
            content: {
                intro: `La Isla Sur de Nueva Zelanda es el paraíso definitivo para las campervans. Este itinerario de 14 días te llevará por lagos turquesa, glaciares milenarios y fiordos espectaculares. ¡Prepara la cámara!`,
                sections: [
                    {
                        title: 'Semana 1: Lagos y Glaciares',
                        icon: 'MapPin',
                        items: [
                            { title: 'Días 1-3: Tekapo y Pukaki', text: 'Estrellas y trekking en Mt Cook. Duerme junto al lago Pukaki (freedom camping permitido para SC).' },
                            { title: 'Días 4-5: Wanaka', text: 'El árbol famoso de Wanaka y Roy\'s Peak para la mejor vista panorámica del país.' },
                            { title: 'Días 6-7: Queenstown', text: 'Capital de la aventura. Aprovecha para ir a un camping de lujo y darte una ducha caliente.' },
                        ]
                    },
                    {
                        title: 'Semana 2: Fiordos y Costa Salvaje',
                        icon: 'Car',
                        items: [
                            { title: 'Días 8-9: Milford Sound', text: 'Crucero por el fiordo. Nota: No hay señal de móvil aquí, descarga tus mapas offline.' },
                            { title: 'Días 10-12: Costa Oeste', text: 'Glaciares Fox y Franz Josef, Pancake Rocks. Carreteras costeras brutales.' },
                            { title: 'Días 13-14: Arthur\'s Pass', text: 'Vuelve a Christchurch por el corazón de los Alpes del Sur.' },
                        ]
                    },
                ],
                warnings: [
                    'Las moscas de arena (sandflies) en la costa oeste son brutales; compra repelente local pronto',
                    'Reserva siempre los cruceros en Milford Sound con antelación',
                    'La gasolina es cara en pueblos pequeños; reposta en las ciudades principales',
                ],
                cta: {
                    title: 'Empieza la aventura',
                    text: 'Recoge tu campervan en Christchurch y lánzate a la carretera hoy mismo.',
                    buttonText: 'Vans en Christchurch',
                    buttonLink: '/',
                }
            }
        },
        'best-vanlife-apps-nz': {
            title: '6 Apps Esenciales para todo Viajero en Van en NZ (2025)',
            description: '¡No te vayas sin estas! De encontrar campings secretos a ahorrar cientos de dólares en gasolina.',
            heroImage: 'https://images.unsplash.com/photo-1512428559087-560fa5ceab42?w=1200',
            content: {
                intro: `En 2025, tu teléfono es tan importante como la rueda de repuesto de tu van. Estas 6 apps marcan la diferencia entre un viaje normal y uno épico.`,
                sections: [
                    {
                        title: 'Campings e Instalaciones',
                        icon: 'MapPin',
                        items: [
                            { title: 'CamperMate (Gratis)', text: 'La app n.º 1. Muestra spots de camping gratis, baños públicos y gasolineras.' },
                            { title: 'WikiCamps NZ', text: 'Ideal para encontrar joyas ocultas que CamperMate podría pasar por alto.' },
                        ]
                    },
                    {
                        title: 'Presupuesto y Combustible',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Gaspy', text: 'App de precios de combustible de la comunidad. Ahorra 10-20 centavos por litro.' },
                            { title: 'Kiwi Van Market', text: 'Guarda nuestra web para valores de reventa y encontrar repuestos en ruta.' },
                        ]
                    },
                    {
                        title: 'Seguridad y Navegación',
                        icon: 'Shield',
                        items: [
                            { title: 'MetService', text: 'Esencial para el tiempo en montaña y cierres de carreteras por nieve.' },
                            { title: 'NZTA Waka Kotahi', text: 'Alertas en tiempo real de peligros en la ruta. Imprescindible en la Isla Sur.' },
                        ]
                    },
                ],
                warnings: [
                    'Descarga siempre los mapas de toda Nueva Zelanda sin conexión en Google Maps',
                    'No confíes en los tiempos del GPS; las rutas sinuosas en NZ toman un 30% más de tiempo',
                ],
                cta: {
                    title: '¿Listo para la tecnología?',
                    text: 'Equipa tu van con un buen cargador de 12V para no quedarte sin batería en ruta.',
                    buttonText: 'Equipar mi Van',
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
