import { CheckCircle, AlertTriangle, MapPin, Shield, Car, DollarSign } from 'lucide-react';

export const GUIDES = {
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
};

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
};

// Aliases for retro-compatibility
GUIDES['how-to-buy-campervan-nz'] = GUIDES['buying-campervan-nz'];
GUIDES['how-to-inspect-a-van'] = GUIDES['how-to-inspect-campervan-nz'];

export const IconMap = {
    CheckCircle,
    AlertTriangle,
    MapPin,
    Shield,
    Car,
    DollarSign,
};
