import { CheckCircle, AlertTriangle, MapPin, Shield, Car, DollarSign, Star } from 'lucide-react';

export const GUIDES = {
    en: {
        'buying-campervan-nz': {
            title: 'How to Buy a Campervan in New Zealand - Complete Guide 2025',
            description: 'Everything you need to know about buying a campervan in New Zealand. WOF, REGO, self-contained certification, best brands, prices, and tips for backpackers.',
            heroImage: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200',
            content: {
                intro: `Buying a campervan in New Zealand is the ultimate "rite of passage" for any traveller. It's not just a vehicle; it's your home, your freedom, and your ticket to the most remote corners of Aotearoa. But in a market flooded with backpacker vans, how do you separate the gems from the junk?`,
                sections: [
                    {
                        title: 'The Mechanical Masterclass',
                        icon: 'CheckCircle',
                        items: [
                            {
                                type: 'image',
                                url: '/van_inspection_expert_1772133711431.png',
                                caption: 'Expert Tip: Always check the oil color and consistency during a cold start.'
                            },
                            {
                                title: 'WOF & REGO: The Legal Essentials',
                                text: 'The Warrant of Fitness (WOF) is your safety shield. For older vans (pre-2000), you need this every 6 months. Never buy a van with less than 3 months of WOF remaining, as it indicates the seller might be avoiding a failed inspection.',
                                expertTip: 'A fresh WOF from VTNZ or AA is worth much more than one from a small local garage. It shows the van has been held to the highest national standards.'
                            },
                            {
                                type: 'callout',
                                variant: 'warning',
                                title: 'The "Mayo" Warning',
                                text: 'Open the oil cap. If you see a milky, beige sludge, the head gasket is likely blown. This is a terminal engine issue—walk away immediately.'
                            },
                            {
                                title: 'Mechanical Pre-Purchase Inspection',
                                text: 'For $150, a professional mechanic will put the van on a hoist. They will find rust and leaks you simply cannot see from the curb.'
                            },
                        ]
                    },
                    {
                        title: 'Certification: Living the Freedom',
                        icon: 'Shield',
                        items: [
                            {
                                type: 'image',
                                url: '/self_contained_sticker_van_1772133744005.png',
                                caption: 'The Green Sticker: Your key to legal freedom camping in 2025.'
                            },
                            {
                                title: 'The New 2024 SC Regulations',
                                text: 'The law has changed. To freedom camp in most places, you now need a "fixed" toilet. Older "portable" toilet certifications are being phased out.',
                                expertTip: 'Vans with a "Green Sticker" (meeting the latest 2024/2025 rules) have a significantly higher resale value. It\'s a smart investment.'
                            },
                            {
                                type: 'callout',
                                variant: 'info',
                                title: 'App Essential',
                                text: 'Download CamperMate or WikiCamps. They are non-negotiable for finding legal spots and avoiding $400 fines.'
                            }
                        ]
                    },
                    {
                        title: 'Choosing Your Steed',
                        icon: 'Car',
                        items: [
                            {
                                type: 'image',
                                url: '/freedom_camping_sunrise_nz_1772133726411.png',
                                caption: 'Waking up at Lake Pukaki is only possible in a certified self-contained van.'
                            },
                            {
                                title: 'Toyota Hiace: The King',
                                text: 'There is a reason why 70% of rental fleets use the Hiace. It\'s bulletproof. You can find parts in the smallest towns on the West Coast.',
                                expertTip: 'The 1KZ engine is powerful but thirsty. The 2KD or 1TR engines are more modern and fuel-efficient for long loops.'
                            },
                            { title: 'Nissan Caravan', text: 'Spacious, reliable, and often $2,000-$3,000 cheaper than a Hiace. A great alternative for tight budgets.' },
                            { title: 'Mazda Bongo', text: 'Perfect for solo travellers or couples who prefer a smaller footprint. Easy to park in cities.' },
                        ]
                    },
                    {
                        title: 'Market Pricing & Strategy',
                        icon: 'DollarSign',
                        items: [
                            { title: 'The Seasonality Trap', text: 'Prices peak in November/December and crash in April. If you buy in spring, expect to pay 20% more, but you\'ll have the best selection.' },
                            {
                                type: 'callout',
                                variant: 'info',
                                title: 'Pro Negotiation',
                                text: 'Always negotiate in person. Showing up with cash (or a ready bank transfer) gives you the upper hand.'
                            },
                        ]
                    }
                ],
                cta: {
                    title: 'Your Adventure Starts Here',
                    text: 'Our marketplace is dedicated to verified campervans with clear history and buy-back options.',
                    buttonText: 'View Available Vans',
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
            heroImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200',
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
        },
        'top-10-best-vans-nz': {
            title: 'Top 10 Best Campervans to Buy in New Zealand (2025 Ranking)',
            description: 'The definitive ranking of the 10 best campervans for backpackers in New Zealand. Prices, reliability, resale value and expert tips for each model.',
            heroImage: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200',
            content: {
                intro: `Choosing the right campervan is the single most important decision of your New Zealand trip. The wrong van means breakdowns on remote roads, failed WOFs, and a stressful sale at the end. This ranking is based on real market data, mechanic feedback, and thousands of backpacker experiences.`,
                sections: [
                    {
                        title: 'The Legends (Tier 1)',
                        icon: 'Star',
                        items: [
                            { title: '1. Toyota Hiace (1990–2005)', text: 'The undisputed king. 70% of NZ rental fleets use the Hiace for a reason: it is near-indestructible. Parts are available everywhere, even in tiny West Coast towns. The 2.8L diesel (3L) is the sweet spot between power and economy. Expect to pay NZ$8,000–$18,000 depending on conversion quality.', expertTip: 'The 1KZ-TE engine is legendary but watch for head gasket issues on high-mileage units. The later 1TR petrol engine is bulletproof but thirstier.' },
                            { title: '2. Toyota HiAce (2005–2018 "200 Series")', text: 'The modern evolution. More comfortable, better fuel economy, and a smoother ride. Harder to find as campervans but worth the premium. Budget NZ$15,000–$30,000.', expertTip: 'The 2KD-FTV diesel engine is one of the most reliable engines ever made. If you find one with under 250,000km, buy it.' },
                            { title: '3. Nissan Caravan (E25)', text: 'The budget king. Offers nearly the same space as a Hiace but typically $2,000–$4,000 cheaper. The ZD30 diesel engine is solid. Great option for couples on a tight budget. NZ$6,000–$14,000.', expertTip: 'Check for timing chain rattle on cold start. A noisy chain is a $1,500 repair but not terminal.' },
                        ]
                    },
                    {
                        title: 'The Smart Choices (Tier 2)',
                        icon: 'CheckCircle',
                        items: [
                            { title: '4. Nissan Elgrand (E51)', text: 'Known as the "King of Vans" — and for good reason. Superior comfort, powerful V6, and a luxury interior. Popular for premium conversions. Not the most fuel-efficient but the driving experience is unmatched. NZ$8,000–$16,000.' },
                            { title: '5. Mitsubishi Delica (L400/D5)', text: 'The only true 4WD van on this list. If you want to explore gravel roads, ski fields, and remote DOC tracks, the Delica is your only option. Compact but incredibly capable. NZ$7,000–$15,000.', expertTip: 'The L400 with the 2.8L diesel is a workhorse. The newer D5 is more refined but rarer and pricier.' },
                            { title: '6. Toyota Estima (Previa)', text: 'A hidden gem for solo travellers or couples. Mid-engine layout means a flat floor for sleeping. Surprisingly spacious. Very fuel-efficient. The best "stealth" camper. NZ$4,000–$10,000.' },
                            { title: '7. Mazda Bongo Friendee', text: 'Compact, quirky, and loveable. The pop-top roof models are perfect for standing up inside. Great fuel economy and easy to park in cities. NZ$5,000–$12,000.' },
                        ]
                    },
                    {
                        title: 'The Budget Warriors (Tier 3)',
                        icon: 'DollarSign',
                        items: [
                            { title: '8. Ford Transit (2000–2012)', text: 'European reliability in a big body. Lots of interior space for tall conversions. Cheaper to buy but parts can be slightly harder to source than Japanese vans. NZ$5,000–$12,000.' },
                            { title: '9. Toyota TownAce / LiteAce', text: 'The perfect "mini campervan" for solo backpackers. Tiny, fuel-sipping, and surprisingly comfortable for one person. Easy to drive and park anywhere. NZ$3,000–$8,000.' },
                            { title: '10. Mitsubishi L300 Express', text: 'Raw, basic, and cheap. A no-frills option that gets the job done for short 2-3 month trips. Don\'t expect luxury but it won\'t break the bank. NZ$2,500–$6,000.', expertTip: 'Great for the "buy cheap, sell cheap" strategy. Perfect if you\'re only in NZ for a few months.' },
                        ]
                    },
                    {
                        title: 'Buying Strategy Tips',
                        icon: 'Shield',
                        items: [
                            { title: 'Seasonality Matters', text: 'Buy in March-April (end of season) for the best prices. Sell in October-November for maximum return. The difference can be $2,000–$4,000 on the same van.' },
                            { title: 'Always Get a Pre-Purchase Inspection', text: 'For $150, a mechanic will find issues worth thousands. Never skip this step, especially on diesel engines.' },
                            { title: 'Check CarJam', text: 'Enter the license plate on CarJam.co.nz to check for money owing, stolen status, odometer rollback, and import history. It\'s free for basic checks.' },
                        ]
                    }
                ],
                warnings: [
                    'Avoid any van where the seller refuses a mechanical inspection',
                    'Japanese imports with under 100,000km on the clock can be suspicious — odometer fraud exists',
                    'A "beautiful" interior conversion means nothing if the engine is dying',
                    'Budget $1,000–$2,000 on top of purchase price for WOF repairs, registration, and insurance',
                ],
                cta: {
                    title: 'Find Your Perfect Van',
                    text: 'Browse verified campervans with transparent vehicle history on Kiwi Van Market.',
                    buttonText: 'Browse All Vans',
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
                intro: `Acheter un campervan en Nouvelle-Zélande est le "rite de passage" ultime pour tout voyageur. Ce n'est pas seulement un véhicule ; c'est votre maison, votre liberté et votre ticket pour les coins les plus reculés d'Aotearoa. Mais dans un marché saturé de vans backpackers, comment différencier les pépites des épaves ?`,
                sections: [
                    {
                        title: 'Masterclass Mécanique',
                        icon: 'CheckCircle',
                        items: [
                            {
                                type: 'image',
                                url: '/van_inspection_expert_1772133711431.png',
                                caption: "Conseil d'expert : Vérifiez toujours la couleur et la consistance de l'huile lors d'un démarrage à froid."
                            },
                            {
                                title: 'WOF & REGO : Légal et Vital',
                                text: "Le Warrant of Fitness (WOF) est votre bouclier de sécurité. Pour les vans de plus de 12 ans, vous en avez besoin tous les 6 mois. N'achetez JAMAIS un van avec moins de 3 mois de WOFrestants, car cela indique souvent que le vendeur évite une inspection qui pourrait échouer.",
                                expertTip: "Un WOF récent de chez VTNZ ou AA vaut bien plus qu'un WOF d'un petit garage local. Cela prouve que le van respecte les standards nationaux les plus stricts."
                            },
                            {
                                type: 'callout',
                                variant: 'warning',
                                title: 'Alerte "Mayonnaise"',
                                text: "Ouvrez le bouchon d'huile. Si vous voyez un dépôt laiteux et beige (ressemblant à de la mayo), le joint de culasse est probablement HS. C'est une panne moteur fatale — fuyez immédiatement."
                            },
                            {
                                title: 'Inspection Mécanique Pré-Achat',
                                text: "Pour environ 150$, un mécanicien professionnel mettra le van sur un pont. Il trouvera de la rouille et des fuites que vous ne pouvez tout simplement pas voir depuis le trottoir."
                            },
                        ]
                    },
                    {
                        title: 'Certification : Vivre la Liberté',
                        icon: 'Shield',
                        items: [
                            {
                                type: 'image',
                                url: '/self_contained_sticker_van_1772133744005.png',
                                caption: "Le Macaron Vert : Votre sésame pour le freedom camping légal en 2025."
                            },
                            {
                                title: 'Les Nouvelles Règles 2024 SC',
                                text: "La loi a changé. Pour faire du camping sauvage dans la plupart des endroits, vous avez désormais besoin de toilettes 'fixes'. Les anciennes certifications avec toilettes portables sont en cours de suppression.",
                                expertTip: "Les vans avec un macaron vert (répondant aux dernières normes 2024/2025) ont une valeur de revente nettement plus élevée. C'est un investissement intelligent."
                            },
                            {
                                type: 'callout',
                                variant: 'info',
                                title: 'Application Indispensable',
                                text: "Téléchargez CamperMate ou WikiCamps. Ils sont indispensables pour trouver des spots légaux et éviter les amendes de 400$."
                            }
                        ]
                    },
                    {
                        title: 'Choisir votre Destrier',
                        icon: 'Car',
                        items: [
                            {
                                type: 'image',
                                url: '/freedom_camping_sunrise_nz_1772133726411.png',
                                caption: "Se réveiller au bord du lac Pukaki n'est possible qu'en van certifié autonome."
                            },
                            {
                                title: 'Toyota Hiace : Le Roi',
                                text: "Il y a une raison pour laquelle 70% des flottes de location utilisent le Hiace. C'est increvable. Vous trouverez des pièces dans les plus petites villes de la West Coast.",
                                expertTip: "Le moteur 1KZ est puissant mais gourmand. Les moteurs 2KD ou 1TR sont plus modernes et économes pour les longs trajets."
                            },
                            { title: 'Nissan Caravan', text: "Spacieux, fiable et souvent 2 000$ à 3 000$ moins cher qu'un Hiace. Une excellente alternative pour les budgets serrés." },
                            { title: 'Mazda Bongo', text: "Parfait pour les voyageurs solo ou les couples qui préfèrent un van plus compact. Facile à garer en ville." },
                        ]
                    },
                    {
                        title: 'Prix du Marché & Stratégie',
                        icon: 'DollarSign',
                        items: [
                            { title: 'Le Piège de la Saisonnalité', text: "Les prix culminent en novembre/décembre et chutent en avril. Si vous achetez au printemps, attendez-vous à payer 20% de plus, mais vous aurez le meilleur choix." },
                            {
                                type: 'callout',
                                variant: 'info',
                                title: 'Négociation Pro',
                                text: "Négociez toujours en personne. Arriver avec le cash (ou un virement prêt) vous donne un avantage considérable."
                            },
                        ]
                    }
                ],
                cta: {
                    title: 'Votre Aventure Commence Ici',
                    text: "Notre marketplace est dédiée aux campervans vérifiés avec un historique clair et des options de rachat.",
                    buttonText: 'Voir les Vans Disponibles',
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
            heroImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200',
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
        },
        'top-10-best-vans-nz': {
            title: 'Top 10 des Meilleurs Campervans à Acheter en Nouvelle-Zélande (2025)',
            description: 'Le classement définitif des 10 meilleurs campervans pour backpackers en Nouvelle-Zélande. Prix, fiabilité, valeur de revente et conseils d\'expert.',
            heroImage: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200',
            content: {
                intro: `Choisir le bon campervan est LA décision la plus importante de votre voyage en Nouvelle-Zélande. Le mauvais van = pannes sur des routes isolées, WOF raté et revente stressante. Ce classement est basé sur des données réelles du marché, des retours de mécaniciens et des milliers d'expériences de backpackers.`,
                sections: [
                    {
                        title: 'Les Légendes (Tier 1)',
                        icon: 'Star',
                        items: [
                            { title: '1. Toyota Hiace (1990–2005)', text: 'Le roi incontesté. 70% des flottes de location en NZ utilisent le Hiace car il est quasi indestructible. Les pièces se trouvent partout, même dans les plus petites villes de la West Coast. Le diesel 2.8L (3L) est le compromis idéal puissance/économie. Comptez NZ$8 000–$18 000 selon la qualité de conversion.', expertTip: 'Le moteur 1KZ-TE est légendaire mais attention au joint de culasse sur les gros kilométrages. Le 1TR essence est increvable mais plus gourmand.' },
                            { title: '2. Toyota HiAce (2005–2018 "Série 200")', text: 'L\'évolution moderne. Plus confortable, meilleure consommation et conduite plus douce. Plus rare en campervan mais vaut le supplément. Budget NZ$15 000–$30 000.', expertTip: 'Le diesel 2KD-FTV est l\'un des moteurs les plus fiables jamais construits. Si vous en trouvez un sous 250 000 km, foncez.' },
                            { title: '3. Nissan Caravan (E25)', text: 'Le roi du budget. Offre presque le même espace qu\'un Hiace mais typiquement $2 000–$4 000 moins cher. Le diesel ZD30 est solide. Top pour les couples avec un budget serré. NZ$6 000–$14 000.', expertTip: 'Vérifiez le bruit de chaîne de distribution au démarrage à froid. Une chaîne bruyante coûte $1 500 à réparer mais ce n\'est pas mortel.' },
                        ]
                    },
                    {
                        title: 'Les Choix Malins (Tier 2)',
                        icon: 'CheckCircle',
                        items: [
                            { title: '4. Nissan Elgrand (E51)', text: 'Surnommé le "Roi des Vans" — à juste titre. Confort supérieur, V6 puissant, et intérieur luxueux. Populaire pour les conversions haut de gamme. Pas le plus économe mais le plaisir de conduite est incomparable. NZ$8 000–$16 000.' },
                            { title: '5. Mitsubishi Delica (L400/D5)', text: 'Le seul vrai 4x4 de cette liste. Si vous voulez explorer les pistes de gravier, les stations de ski et les tracks DOC reculés, le Delica est votre unique option. Compact mais incroyablement capable. NZ$7 000–$15 000.', expertTip: 'Le L400 avec le diesel 2.8L est un cheval de labour. Le D5 plus récent est plus raffiné mais plus rare et plus cher.' },
                            { title: '6. Toyota Estima (Previa)', text: 'La pépite cachée pour les solos ou les couples. Le moteur central offre un plancher plat pour dormir. Étonnamment spacieux. Très économe en carburant. Le meilleur "stealth camper". NZ$4 000–$10 000.' },
                            { title: '7. Mazda Bongo Friendee', text: 'Compact, original et attachant. Les modèles avec toit relevable permettent de se tenir debout. Super économe et facile à garer en ville. NZ$5 000–$12 000.' },
                        ]
                    },
                    {
                        title: 'Les Guerriers du Budget (Tier 3)',
                        icon: 'DollarSign',
                        items: [
                            { title: '8. Ford Transit (2000–2012)', text: 'Fiabilité européenne dans un grand gabarit. Beaucoup d\'espace intérieur pour les conversions hautes. Moins cher à l\'achat mais les pièces peuvent être un peu plus dures à trouver que sur les vans japonais. NZ$5 000–$12 000.' },
                            { title: '9. Toyota TownAce / LiteAce', text: 'Le "mini campervan" parfait pour les solos. Petit, économe et étonnamment confortable pour une personne. Facile à conduire et à garer partout. NZ$3 000–$8 000.' },
                            { title: '10. Mitsubishi L300 Express', text: 'Brut, basique et pas cher. Une option sans fioritures qui fait le travail pour les trips de 2-3 mois. N\'attendez pas du luxe mais ça ne cassera pas la banque. NZ$2 500–$6 000.', expertTip: 'Parfait pour la stratégie "acheter pas cher, revendre pas cher". Idéal si vous ne restez que quelques mois.' },
                        ]
                    },
                    {
                        title: 'Conseils Stratégiques d\'Achat',
                        icon: 'Shield',
                        items: [
                            { title: 'La Saisonnalité Compte', text: 'Achetez en mars-avril (fin de saison) pour les meilleurs prix. Revendez en octobre-novembre pour le maximum. La différence peut être de $2 000–$4 000 sur le même van.' },
                            { title: 'Toujours Faire une Inspection Mécanique', text: 'Pour $150, un mécanicien trouvera des problèmes valant des milliers. Ne sautez jamais cette étape, surtout sur les moteurs diesel.' },
                            { title: 'Vérifiez sur CarJam', text: 'Entrez la plaque sur CarJam.co.nz pour vérifier les dettes, le statut volé, le retour d\'odomètre et l\'historique d\'import. C\'est gratuit pour les checks de base.' },
                        ]
                    }
                ],
                warnings: [
                    'Fuyez tout vendeur qui refuse une inspection mécanique',
                    'Les imports japonais avec moins de 100 000 km au compteur peuvent être suspects — la fraude à l\'odomètre existe',
                    'Un bel aménagement intérieur ne veut rien dire si le moteur est en train de mourir',
                    'Prévoyez $1 000–$2 000 en plus du prix d\'achat pour les réparations WOF, l\'immatriculation et l\'assurance',
                ],
                cta: {
                    title: 'Trouvez Votre Van Idéal',
                    text: 'Parcourez des campervans vérifiés avec un historique transparent sur Kiwi Van Market.',
                    buttonText: 'Voir Tous les Vans',
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
                intro: `Comprar una campervan en Nueva Zelanda es el "rito de paso" definitivo para cualquier viajero. No es solo un vehículo; es tu hogar, tu libertad y tu pasaporte a los rincones más remotos de Aotearoa. Pero en un mercado lleno de furgonetas para mochileros, ¿cómo separar las joyas de la chatarra?`,
                sections: [
                    {
                        title: 'Masterclass de Mecánica',
                        icon: 'CheckCircle',
                        items: [
                            {
                                type: 'image',
                                url: '/van_inspection_expert_1772133711431.png',
                                caption: "Consejo de experto: Revisa siempre el color y la consistencia del aceite durante un arranque en frío."
                            },
                            {
                                title: 'WOF & REGO: Lo esencial y legal',
                                text: "El Warrant of Fitness (WOF) es tu escudo de seguridad. Para furgonetas de más de 12 años, lo necesitas cada 6 meses. Nunca compres una van con menos de 3 meses de WOF restantes; suele indicar que el vendedor evita una inspección que podría fallar.",
                                expertTip: "Un WOF reciente de VTNZ o AA vale mucho más que uno de un taller local pequeño. Demuestra que la van cumple con los estándares nacionales más exigentes."
                            },
                            {
                                type: 'callout',
                                variant: 'warning',
                                title: 'La Alerta de la "Mayonesa"',
                                text: "Abre el tapón del aceite. Si ves un residuo blanquecino o beige, es probable que la junta de culata esté rota. Es un fallo fatal del motor: huye de inmediato."
                            },
                            {
                                title: 'Inspección Mecánica Pre-compra',
                                text: "Por unos 150$, un mecánico profesional subirá la van a un elevador. Encontrará óxido y fugas que simplemente no puedes ver desde la acera."
                            },
                        ]
                    },
                    {
                        title: 'Certificación: Vivir la Libertad',
                        icon: 'Shield',
                        items: [
                            {
                                type: 'image',
                                url: '/self_contained_sticker_van_1772133744005.png',
                                caption: "La Pegatina Verde: Tu llave para el freedom camping legal en 2025."
                            },
                            {
                                title: 'Las Nuevas Reglas SC 2024',
                                text: "La ley ha cambiado. Para acampar libremente en la mayoría de sitios, ahora necesitas un inodoro 'fijo'. Las antiguas certificaciones con inodoros portátiles se están eliminando.",
                                expertTip: "Las vans con la pegatina verde (que cumplen las normas 2024/2025) tienen un valor de reventa mucho mayor. Es una inversión inteligente."
                            },
                            {
                                type: 'callout',
                                variant: 'info',
                                title: 'App Imprescindible',
                                text: "Descárgate CamperMate o WikiCamps. Son innegociables para encontrar sitios legales y evitar multas de 400$."
                            }
                        ]
                    },
                    {
                        title: 'Eligiendo tu Compañera de Ruta',
                        icon: 'Car',
                        items: [
                            {
                                type: 'image',
                                url: '/freedom_camping_sunrise_nz_1772133726411.png',
                                caption: "Despertar en el Lago Pukaki solo es posible en una van certificada como autónoma."
                            },
                            {
                                title: 'Toyota Hiace: La Reina',
                                text: "Hay una razón por la que el 70% de las flotas de alquiler usan la Hiace. Es indestructible. Encontrarás piezas hasta en el pueblo más pequeño de la West Coast.",
                                expertTip: "El motor 1KZ es potente pero consume mucho. Los motores 2KD o 1TR son más modernos y eficientes para rutas largas."
                            },
                            { title: 'Nissan Caravan', text: "Espaciosa, fiable y suele ser entre 2.000$ y 3.000$ más barata que una Hiace. Una gran alternativa para presupuestos ajustados." },
                            { title: 'Mazda Bongo', text: "Perfecta para viajeros solitarios o parejas que prefieren un tamaño más compacto. Fácil de aparcar en ciudades." },
                        ]
                    },
                    {
                        title: 'Precios del Mercado y Estrategia',
                        icon: 'DollarSign',
                        items: [
                            { title: 'La Trampa de la Estacionalidad', text: "Los precios alcanzan su máximo en noviembre/diciembre y caen en abril. Si compras en primavera, espera pagar un 20% más, pero tendrás la mejor selección." },
                            {
                                type: 'callout',
                                variant: 'info',
                                title: 'Negociación Pro',
                                text: "Negocia siempre en persona. Aparecer con el efectivo (o una transferencia lista) te da la ventaja."
                            },
                        ]
                    }
                ],
                cta: {
                    title: 'Tu Aventura Empieza Aquí',
                    text: "Nuestro marketplace se dedica a campervans verificadas con historial claro y opciones de recompra.",
                    buttonText: 'Ver Vans Disponibles',
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
            heroImage: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200',
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
        },
        'top-10-best-vans-nz': {
            title: 'Top 10 Mejores Campervans para Comprar en Nueva Zelanda (2025)',
            description: 'El ranking definitivo de las 10 mejores campervans para mochileros en Nueva Zelanda. Precios, fiabilidad, valor de reventa y consejos de experto.',
            heroImage: 'https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200',
            content: {
                intro: `Elegir la campervan correcta es la decisión más importante de tu viaje por Nueva Zelanda. La furgoneta equivocada significa averías en carreteras remotas, WOF fallidos y una venta estresante al final. Este ranking se basa en datos reales del mercado, opiniones de mecánicos y miles de experiencias de mochileros.`,
                sections: [
                    {
                        title: 'Las Leyendas (Tier 1)',
                        icon: 'Star',
                        items: [
                            { title: '1. Toyota Hiace (1990–2005)', text: 'La reina indiscutible. El 70% de las flotas de alquiler en NZ usan la Hiace por algo: es casi indestructible. Las piezas se encuentran en cualquier pueblo. El diésel 2.8L (3L) es el equilibrio perfecto entre potencia y economía. Espera pagar NZ$8.000–$18.000 según la conversión.', expertTip: 'El motor 1KZ-TE es legendario pero cuidado con la junta de culata en unidades de alto kilometraje. El 1TR gasolina es infalible pero consume más.' },
                            { title: '2. Toyota HiAce (2005–2018 "Serie 200")', text: 'La evolución moderna. Más cómoda, mejor consumo y conducción más suave. Más difícil de encontrar como campervan pero merece el extra. Presupuesto NZ$15.000–$30.000.', expertTip: 'El diésel 2KD-FTV es uno de los motores más fiables jamás construidos. Si encuentras uno con menos de 250.000 km, cómpralo.' },
                            { title: '3. Nissan Caravan (E25)', text: 'La reina del presupuesto. Ofrece casi el mismo espacio que una Hiace pero normalmente $2.000–$4.000 más barata. El diésel ZD30 es sólido. Ideal para parejas con presupuesto ajustado. NZ$6.000–$14.000.', expertTip: 'Revisa el ruido de cadena de distribución en arranque frío. Una cadena ruidosa cuesta $1.500 pero no es mortal.' },
                        ]
                    },
                    {
                        title: 'Las Elecciones Inteligentes (Tier 2)',
                        icon: 'CheckCircle',
                        items: [
                            { title: '4. Nissan Elgrand (E51)', text: 'Conocida como el "Rey de las Vans". Confort superior, V6 potente e interior de lujo. Popular para conversiones premium. No la más eficiente pero la experiencia de conducción es incomparable. NZ$8.000–$16.000.' },
                            { title: '5. Mitsubishi Delica (L400/D5)', text: 'La única van 4x4 real de esta lista. Si quieres explorar caminos de grava, estaciones de esquí y pistas DOC remotas, la Delica es tu única opción. Compacta pero increíblemente capaz. NZ$7.000–$15.000.', expertTip: 'La L400 con el diésel 2.8L es una máquina de trabajo. La D5 más nueva es más refinada pero más rara y cara.' },
                            { title: '6. Toyota Estima (Previa)', text: 'Una joya oculta para solitarios o parejas. El motor central ofrece un suelo plano para dormir. Sorprendentemente espaciosa. Muy eficiente. La mejor "stealth camper". NZ$4.000–$10.000.' },
                            { title: '7. Mazda Bongo Friendee', text: 'Compacta, peculiar y adorable. Los modelos con techo elevable permiten estar de pie. Gran eficiencia y fácil de aparcar. NZ$5.000–$12.000.' },
                        ]
                    },
                    {
                        title: 'Los Guerreros del Presupuesto (Tier 3)',
                        icon: 'DollarSign',
                        items: [
                            { title: '8. Ford Transit (2000–2012)', text: 'Fiabilidad europea en un cuerpo grande. Mucho espacio interior para conversiones altas. Más barata de comprar pero las piezas pueden ser algo más difíciles de encontrar que las japonesas. NZ$5.000–$12.000.' },
                            { title: '9. Toyota TownAce / LiteAce', text: 'La "mini campervan" perfecta para mochileros solitarios. Pequeña, económica y sorprendentemente cómoda para una persona. Fácil de conducir y aparcar. NZ$3.000–$8.000.' },
                            { title: '10. Mitsubishi L300 Express', text: 'Cruda, básica y barata. Sin lujos pero hace su trabajo para viajes de 2-3 meses. No esperes lujo pero tampoco te arruinará. NZ$2.500–$6.000.', expertTip: 'Perfecta para la estrategia "comprar barato, vender barato". Ideal si solo vas a estar unos meses.' },
                        ]
                    },
                    {
                        title: 'Consejos de Compra',
                        icon: 'Shield',
                        items: [
                            { title: 'La Estacionalidad Importa', text: 'Compra en marzo-abril (fin de temporada) para los mejores precios. Vende en octubre-noviembre para máximo retorno. La diferencia puede ser de $2.000–$4.000 por la misma van.' },
                            { title: 'Siempre Haz una Inspección Mecánica', text: 'Por $150 un mecánico encontrará problemas que valen miles. Nunca te saltes este paso, especialmente en motores diésel.' },
                            { title: 'Revisa CarJam', text: 'Introduce la matrícula en CarJam.co.nz para verificar deudas, estado robado, manipulación de odómetro e historial de importación. Es gratis para verificaciones básicas.' },
                        ]
                    }
                ],
                warnings: [
                    'Evita cualquier van donde el vendedor rechace una inspección mecánica',
                    'Los imports japoneses con menos de 100.000 km pueden ser sospechosos — el fraude de odómetro existe',
                    'Un interior bonito no significa nada si el motor se está muriendo',
                    'Presupuesta $1.000–$2.000 extra para reparaciones de WOF, registro y seguro',
                ],
                cta: {
                    title: 'Encuentra tu Van Perfecta',
                    text: 'Explora campervans verificadas con historial transparente en Kiwi Van Market.',
                    buttonText: 'Ver Todas las Vans',
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
    Star,
};
