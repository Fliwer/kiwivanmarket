import { CheckCircle, AlertTriangle, MapPin, Shield, Car, DollarSign, Star } from 'lucide-react';

export const GUIDES = {
    en: {
        'buying-campervan-nz': {
            "title": "How to Buy a Campervan in New Zealand: The Backpacker Guide (2026)",
            "description": "Real prices, a step-by-step inspection routine, WOF, REGO, insurance and self-contained rules — everything you need to buy a campervan in New Zealand without getting burned.",
            "heroImage": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200",
            "content": {
                "intro": "So you've just landed in Auckland, everyone at the hostel is talking about buying a van, and you have no idea where to start. Good news: in the next 15 minutes you'll get the full picture — real prices, a proven inspection routine, the scams to dodge, and the exact paperwork. This is the guide we wish we'd had before our first NZ road trip.",
                "sections": [
                    {
                        "title": "Start Here: The 5-Minute Basics",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "Why buy instead of rent?",
                                "text": "Renting costs $60–150 a day. Buying a $7,000 van for 6 months and selling it for $6,000 costs you about $5 a day plus fuel. That's why almost every long-stay backpacker buys — and with a smart resale, some even break even. The catch: the savings only work if you buy a healthy van. That's what the rest of this guide is for."
                            },
                            {
                                "type": "table",
                                "title": "The NZ jargon, decoded",
                                "headers": [
                                    "Term",
                                    "What it means",
                                    "Why you care"
                                ],
                                "rows": [
                                    [
                                        "WOF",
                                        "Warrant of Fitness — the periodic safety inspection every vehicle needs",
                                        "No valid WOF = you can't legally drive"
                                    ],
                                    [
                                        "REGO",
                                        "Vehicle registration, paid to use public roads",
                                        "Sold per 3, 6 or 12 months (~$100/year for petrol vans)"
                                    ],
                                    [
                                        "RUC",
                                        "Road User Charges — a per-km tax paid only by diesel vehicles",
                                        "About $76 per 1,000 km, on top of fuel"
                                    ],
                                    [
                                        "Self-contained",
                                        "Certified with toilet + water tanks (green or blue sticker)",
                                        "Required for most freedom camping"
                                    ],
                                    [
                                        "CarJam",
                                        "An online vehicle history report",
                                        "Reveals debts, odometer fraud and stolen vehicles"
                                    ],
                                    [
                                        "PPSR",
                                        "Personal Property Securities Register — the official debt register",
                                        "A $3 check that stops you inheriting someone's loan"
                                    ]
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Good to know",
                                "text": "You do NOT need to be a NZ resident to buy a vehicle. A passport and a local address (your hostel works) are enough. Most backpackers drive on their home licence or an International Driving Permit — just make sure it's valid in English."
                            },
                            {
                                "title": "How long does it take?",
                                "text": "Plan 3 to 7 days in a big city: a couple of days browsing listings, a few viewings, one mechanical inspection, and 15 minutes of paperwork. Rushing it on day one is exactly how people buy lemons.",
                                "expertTip": "Book your first week of accommodation in Auckland or Christchurch — that's where the van supply lives."
                            },
                            {
                                "type": "cta",
                                "text": "See what's for sale right now across New Zealand",
                                "to": "/"
                            }
                        ]
                    },
                    {
                        "title": "What a Campervan Really Costs",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "type": "table",
                                "title": "Price tiers on the backpacker market (NZD)",
                                "headers": [
                                    "Budget",
                                    "What you get",
                                    "Watch out for"
                                ],
                                "rows": [
                                    [
                                        "Under $4,000",
                                        "Old people-movers (Estima, Serena, Odyssey) with a mattress in the back",
                                        "High kms, rust, short WOF — inspection is non-negotiable"
                                    ],
                                    [
                                        "$4,000–$8,000",
                                        "The classic backpacker vans: Hiace, Bongo, Vanette, L300 — often self-contained",
                                        "The sweet spot for value; verify the certification is genuine"
                                    ],
                                    [
                                        "$8,000–$15,000",
                                        "Younger vans with proper builds: solar, fridge, insulation",
                                        "Pay for what helps YOU travel, not for fairy lights"
                                    ],
                                    [
                                        "$15,000+",
                                        "High-top vans, 4WD Delicas, small motorhomes",
                                        "Harder to resell fast at the end of a trip"
                                    ]
                                ],
                                "caption": "For reference: the average listing on Kiwi Van Market sits around $8,000–10,000."
                            },
                            {
                                "type": "checklist",
                                "title": "✅ Quick Checklist: the hidden costs first-timers forget",
                                "items": [
                                    "Insurance: $300–600/year (third party is the backpacker standard)",
                                    "WOF test: $60–80 each time",
                                    "REGO: about $100/year for petrol vans",
                                    "RUC (diesel only): ~$76 per 1,000 km",
                                    "Pre-purchase mechanical inspection: $150–180 — the best money you'll spend",
                                    "Cook Strait ferry with a van: $250–450 return",
                                    "A $1,000 emergency fund for repairs (battery, tyres, water pump)"
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Common Mistake",
                                "text": "Spending every dollar on the van itself. Keep $1,000 aside for surprises — a battery, a tyre, a water pump. A breakdown with an empty account is how road trips end early."
                            },
                            {
                                "title": "Can you negotiate? (Yes. Politely.)",
                                "text": "Almost every listed price has 10–15% of room — more at the end of the season, when sellers have a flight to catch. Point at real things: WOF expiry, tyre wear, kilometres, a tired leisure battery. Cash today beats promises tomorrow.",
                                "expertTip": "💡 Ask when the seller flies out. Three days before departure, an $8,500 van becomes a $7,200 van."
                            },
                            {
                                "title": "Petrol or diesel? The honest maths",
                                "text": "Diesel is cheaper at the pump but pays RUC (~$76 per 1,000 km) and services cost more. Petrol is simpler: no RUC, cheaper maintenance, and for a typical 10,000–15,000 km trip the total cost difference is small. Rule of thumb: under 15,000 km, petrol usually wins on simplicity."
                            }
                        ]
                    },
                    {
                        "title": "Where to Buy (and Where to Be Careful)",
                        "icon": "MapPin",
                        "items": [
                            {
                                "type": "table",
                                "title": "Your options, compared honestly",
                                "headers": [
                                    "Where",
                                    "Pros",
                                    "Cons"
                                ],
                                "rows": [
                                    [
                                        "Online marketplaces (like Kiwi Van Market)",
                                        "Photos, WOF/REGO shown upfront, CarJam history button, direct chat with the owner",
                                        "Popular vans go fast — check daily"
                                    ],
                                    [
                                        "Facebook backpacker groups",
                                        "Huge volume, real bargains exist",
                                        "Zero verification, scams, half the posts are already sold"
                                    ],
                                    [
                                        "Backpacker car markets",
                                        "See many vans in one morning",
                                        "Dealers posing as travellers, entry fees"
                                    ],
                                    [
                                        "Dealers",
                                        "Consumer guarantees, lower risk",
                                        "20–40% more expensive, few true backpacker vans"
                                    ]
                                ]
                            },
                            {
                                "title": "Timing beats everything",
                                "text": "Buy where travellers land: Auckland all year, Christchurch for the South Island. And buy when they leave — February to April floods the market with departing backpackers' vans. October to December is a seller's market: arrive early or pay more."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ The classic scams",
                                "text": "A 'friend overseas' who will ship the van after a deposit. A seller refusing a mechanical inspection. A price way under market with pressure to decide today. A request for a deposit just to 'hold' a van you haven't seen. Any one of these: walk away. There is always another van."
                            }
                        ]
                    },
                    {
                        "title": "The 30-Minute Inspection That Saves You Thousands",
                        "icon": "Shield",
                        "items": [
                            {
                                "type": "image",
                                "url": "/van_inspection_expert_1772133711431.png",
                                "caption": "Always check the oil BEFORE the engine warms up — a cold start tells the truth."
                            },
                            {
                                "title": "The mayo test (30 seconds, deal-breaker)",
                                "text": "Open the oil cap. A milky, mayonnaise-like paste under it usually means the head gasket is gone — a $2,000+ repair on a $5,000 van. Close the bonnet, say thank you, and leave."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Cold start",
                                        "text": "Ask the seller NOT to warm up the engine before you arrive. A pre-warmed engine is the oldest trick for hiding rough starts."
                                    },
                                    {
                                        "title": "Watch the exhaust",
                                        "text": "White or blue smoke at start-up means engine trouble. A puff of steam on a cold morning is fine; a cloud that keeps coming is not."
                                    },
                                    {
                                        "title": "Cambelt / timing belt history",
                                        "text": "Critical on Hiace and many diesels. Ask when it was last replaced and at what kms — if this belt lets go while driving, it can take the whole engine with it. No proof of replacement on a high-km van? Budget for the job or lower your offer."
                                    },
                                    {
                                        "title": "Brakes",
                                        "text": "Straight-line stop from 50 km/h: no squealing, no pulling to one side, pedal firm."
                                    },
                                    {
                                        "title": "Gearbox",
                                        "text": "Test every gear — including reverse. Crunching or hesitation is a repair bill in waiting."
                                    },
                                    {
                                        "title": "Steering at speed",
                                        "text": "Take it on the motorway. Any wobble at 100 km/h points to alignment, tyres or suspension."
                                    },
                                    {
                                        "title": "Rust — the NZ killer",
                                        "text": "Wheel arches, window seals, under the carpet, and underneath the van. Surface rust on panels is manageable; rust on structural rails or floor pans is a walk-away."
                                    },
                                    {
                                        "title": "Suspension",
                                        "text": "Drive over a speed bump slowly and listen for clunks. Push down on each corner — it should settle, not bounce."
                                    },
                                    {
                                        "title": "Everything electric",
                                        "text": "Windows, lights, wipers, stereo, USB plugs, interior lights. Small failures reveal how the van was cared for."
                                    },
                                    {
                                        "title": "Water systems and mould",
                                        "text": "Run the taps, check under the sink, lift the mattress. Brown ceiling rings and a damp smell mean water ingress."
                                    },
                                    {
                                        "title": "Tyres",
                                        "text": "Uneven wear across the tread = alignment or suspension issues. A set of four van tyres costs $600–1,000."
                                    },
                                    {
                                        "title": "VIN matches everywhere",
                                        "text": "Compare the VIN on the dashboard, the door jamb and the paperwork. Mismatches can mean accident history or a stolen vehicle."
                                    }
                                ]
                            },
                            {
                                "title": "Then pay a professional — always",
                                "text": "A pre-purchase inspection at VTNZ, AA or any garage costs $150–180. They put the van on a hoist and find what you physically cannot see. A seller who refuses an inspection is telling you everything.",
                                "expertTip": "🎯 Run the plate through CarJam before you even travel to a viewing — money owing on a van becomes YOUR problem after purchase."
                            },
                            {
                                "type": "cta",
                                "text": "Get the full 30-point printable buyer checklist",
                                "to": "/guide/campervan-buyer-checklist"
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Good to know",
                                "text": "On Kiwi Van Market, every listing shows WOF and REGO expiry upfront, and includes a CarJam history button when the seller provides the plate — so you can do the two big checks before you even message anyone."
                            }
                        ]
                    },
                    {
                        "title": "Paperwork: Legal in 15 Minutes",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "The good news",
                                "text": "New Zealand makes vehicle paperwork genuinely easy. No notary, no lawyer, no waiting weeks. Six steps, done the same day, most of them free."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Run the history checks",
                                        "text": "CarJam with the plate number (stolen status, odometer history, WOF record), plus a $3 PPSR check with the VIN — if finance is still owing, the lender can repossess the van from YOU after purchase."
                                    },
                                    {
                                        "title": "Verify WOF and REGO",
                                        "text": "At least 3 months of WOF left (or freshly passed), and REGO current — not 'on hold'. Both visible on the windscreen and on the listing."
                                    },
                                    {
                                        "title": "Write a receipt",
                                        "text": "Price, date, both names and passport numbers, plate and VIN, the words 'sold as seen'. Two copies, both signed. It takes five minutes and settles every future argument."
                                    },
                                    {
                                        "title": "Transfer ownership TOGETHER",
                                        "text": "Both of you complete the change of ownership online at nzta.govt.nz (or at any NZ Post shop) the day you buy. About $9, needs your passport and an address — your hostel is fine."
                                    },
                                    {
                                        "title": "Activate insurance before driving off",
                                        "text": "Third-party cover takes 20 minutes online and works with a foreign licence. Driving uninsured is gambling your whole trip on one intersection."
                                    },
                                    {
                                        "title": "Buy RUC if it's a diesel",
                                        "text": "Check the odometer against the RUC distance already purchased. Unpaid RUC becomes your debt. Top up online at nzta.govt.nz in 1,000 km blocks."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Common Mistake",
                                "text": "Paying now and 'sorting the papers later'. If the seller never files the transfer, their speeding tickets become yours — and legally, the van may not even be yours. Same day, together, no exceptions."
                            },
                            {
                                "type": "cta",
                                "text": "New to WOF, REGO and RUC? Read the plain-English rules guide",
                                "to": "/guide/wof-rego-ruc-insurance-nz"
                            }
                        ]
                    },
                    {
                        "title": "Self-Contained: Your Ticket to Free Camping",
                        "icon": "Star",
                        "items": [
                            {
                                "type": "image",
                                "url": "/self_contained_sticker_van_1772133744005.png",
                                "caption": "The certification sticker: your key to legal freedom camping."
                            },
                            {
                                "title": "What the sticker actually means",
                                "text": "A certified self-contained van carries fresh water, a grey-water tank and a toilet. Since the rule change, new certifications (green sticker) require a fixed toilet — older blue-sticker certifications are being phased out as they expire. The certificate belongs to the vehicle and has an expiry date."
                            },
                            {
                                "title": "Why it's worth real money",
                                "text": "Without certification, you'll pay $20–50 a night for campsites. With it, thousands of legal freedom camping spots become free. Over 4 months, that's easily $1,500+ saved — and certified vans resell faster, at better prices."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Common Mistake",
                                "text": "Trusting the words 'self-contained' in an ad. Ask to SEE the certificate and check its expiry — then verify the certification number. A $400 freedom-camping fine ruins a good week."
                            },
                            {
                                "title": "Download these two apps tonight",
                                "text": "CamperMate and Rankers show every legal camping spot, dump station and public shower in the country, with reviews from other travellers. They're free, and they're how everyone actually finds where to sleep."
                            }
                        ]
                    },
                    {
                        "title": "Selling It When You Leave (Think About It Now)",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Your exit plan starts at purchase",
                                "text": "The van you buy today is the van you must sell in 6 months, from whichever city you fly out of. Popular models — Hiace, Bongo, L300 — with valid WOF, REGO and self-contained certification sell in days. Rare or tired vans sell in weeks, under pressure, at a loss."
                            },
                            {
                                "title": "The seasonal money machine",
                                "text": "Buy in Christchurch in March from a leaving backpacker (low season, low price). Sell in Auckland in November to an arriving one (high season, high price). Travellers who ride this calendar regularly sell for MORE than they paid."
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Good to know",
                                "text": "Listing your van on Kiwi Van Market is free, with no commission — and you can offer a buy-back deal to make your listing stand out. Put it live 3–4 weeks before your flight, not 3 days."
                            },
                            {
                                "type": "cta",
                                "text": "List your van for free — no commission, direct contact with buyers",
                                "to": "/sell"
                            }
                        ]
                    },
                    {
                        "title": "FAQ: Quick Answers",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Can foreigners buy a campervan in New Zealand?",
                                        "a": "Yes. You don't need residency or a NZ licence: a passport and a local address (your hostel counts) are enough to buy and register a vehicle. Most backpackers drive on their home licence or an International Driving Permit."
                                    },
                                    {
                                        "q": "How much should I budget for a backpacker campervan?",
                                        "a": "Most travellers spend NZ$5,000–10,000. Solid vans exist under $4,000 but demand a rigorous inspection. The average listing on Kiwi Van Market sits around $8,000–10,000."
                                    },
                                    {
                                        "q": "Is car insurance mandatory in New Zealand?",
                                        "a": "No — but third-party insurance ($300–600/year) is the backpacker standard. It covers the expensive car you might hit; skipping it is gambling your whole trip on one intersection."
                                    },
                                    {
                                        "q": "Petrol or diesel campervan?",
                                        "a": "Diesel is cheaper at the pump but pays Road User Charges (about $76 per 1,000 km) and services cost more. If you'll drive under ~15,000 km, petrol usually wins on simplicity."
                                    },
                                    {
                                        "q": "What is a WOF and how often do I need it?",
                                        "a": "The Warrant of Fitness is New Zealand's periodic safety inspection: every 12 months for vehicles first registered after 2000, every 6 months for older ones. Buy a van with at least 3 months of WOF left."
                                    },
                                    {
                                        "q": "What is a PPSR check?",
                                        "a": "A $3 search of the Personal Property Securities Register (ppsr.govt.nz) using the VIN. It tells you whether money is still owing on the vehicle — if it is, the lender can repossess the van even after you've paid for it."
                                    },
                                    {
                                        "q": "Can I sleep anywhere in my van?",
                                        "a": "No. Freedom camping is only legal in permitted areas, and usually only for certified self-contained vehicles. Fines reach $400. CamperMate and Rankers show every legal spot for free."
                                    },
                                    {
                                        "q": "What happens if my van breaks down?",
                                        "a": "AA Membership (~$99/year) gets you roadside assistance nationwide — most backpackers consider it essential. Keep a $1,000 repair buffer: batteries, tyres and water pumps are the usual suspects on older vans."
                                    },
                                    {
                                        "q": "How fast can I sell my van at the end of my trip?",
                                        "a": "With a fair price, honest photos and valid paperwork: a few days in high season (October–December), two to four weeks otherwise. List it 3–4 weeks before your flight."
                                    },
                                    {
                                        "q": "Where do I check a van's history before buying?",
                                        "a": "CarJam, using the plate number: it reveals money owing, stolen status, odometer readings and import history. On Kiwi Van Market, the CarJam button is on the listing whenever the seller provides the plate."
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        'campervan-buyer-checklist': {
            "title": "Used Campervan Inspection Checklist NZ: How to Check a Van Before Buying",
            "description": "A chronological pre-purchase routine for campervans in New Zealand — the homework the night before, the first minutes on site, the walk-around, the test drive, and the handover. Free printable version.",
            "heroImage": "/van_inspection_expert_1772133711431.png",
            "content": {
                "intro": "Every hostel has the story: someone bought a van on day two, then spent week three paying a mechanic to explain what they missed. You don't avoid becoming that story with luck — you avoid it with a routine. This checklist follows a real viewing in the order it actually happens: the homework the night before, the first minutes on site, the walk-around, the test drive, and the fifteen minutes where money and paperwork change hands. Tick your way through, and by the end you'll know the van better than the seller expects.",
                "sections": [
                    {
                        "title": "The Night Before: Homework From the Hostel",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Twenty minutes on your phone, thousands protected",
                                "text": "Most disasters are visible online before you've spent a dollar on gas. Do this from your bunk, the evening before the viewing."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Plate into CarJam",
                                        "text": "The history report shows the ownership count, odometer readings over time, and the WOF pass/fail record. A van that failed its last WOF and went up for sale right after deserves pointed questions."
                                    },
                                    {
                                        "title": "VIN into the PPSR",
                                        "text": "Three dollars at ppsr.govt.nz tells you whether a lender still has a claim on the vehicle. Finance debt travels with the van — not with the seller."
                                    },
                                    {
                                        "title": "Sanity-check the price",
                                        "text": "Line the van up against comparable listings: same model, similar year, kms and certification. A price sitting far under the market is a question to answer, not a win to grab."
                                    },
                                    {
                                        "title": "Send two messages",
                                        "text": "'Could you send photos of the service records?' and 'Please don't start the engine before I arrive.' The answers — and the tone of them — tell you plenty before you've even met."
                                    },
                                    {
                                        "title": "Book daylight and dry weather",
                                        "text": "Rain flatters paint and hides oil spots on the driveway. A morning slot also makes a genuine cold start much more likely."
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Print the pocket version of this checklist (free, nothing to sign up for)",
                                "href": "/checklist-print.html",
                                "download": true
                            }
                        ]
                    },
                    {
                        "title": "First Five Minutes On Site",
                        "icon": "MapPin",
                        "items": [
                            {
                                "title": "Before you touch anything, stand back",
                                "text": "Vans talk, if you give them a few metres of distance and thirty seconds of silence."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Look at how it sits",
                                        "text": "A van leaning toward one corner is telling you about tired springs or suspension before you've opened a door."
                                    },
                                    {
                                        "title": "Compare the four tyres",
                                        "text": "Four different brands, or fresh fronts over bald rears, describe a van that gets maintained one emergency at a time."
                                    },
                                    {
                                        "title": "Open the door and breathe in",
                                        "text": "Damp has a smell you can't unsmell. Mould behind wall panels announces itself here first — before your nose adjusts to it."
                                    },
                                    {
                                        "title": "Ask how long they've owned it",
                                        "text": "Casually. Later, match the answer against the CarJam ownership dates. Honest sellers tell consistent stories without trying."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "The Walk-Around: Body and Rust",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "image",
                                "url": "/van_inspection_expert_1772133711431.png",
                                "caption": "Bring a torch. The van's real history is written underneath it."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Panel gaps and paint tone",
                                        "text": "Uneven gaps between panels, or one door in a slightly different shade, point to accident repairs that nobody volunteered."
                                    },
                                    {
                                        "title": "The fridge-magnet trick",
                                        "text": "Wrap a magnet in a tea towel and glide it along the sills and wheel arches. Where it stops sticking, someone has smoothed body filler over rust."
                                    },
                                    {
                                        "title": "Get underneath with your torch",
                                        "text": "Chassis rails, floor pans, sills. Flaking brown crust on anything structural is a walk-away; a light surface bloom on flat panels is a negotiation."
                                    },
                                    {
                                        "title": "Window rubbers and roof seams",
                                        "text": "NZ vans live outside, often near salt air. Paint bubbling around the glass is rust working from the inside out — the expensive direction."
                                    },
                                    {
                                        "title": "Lift whatever lifts",
                                        "text": "Carpet corners, floor mats, the boot liner. Floors rot quietly in the dark, and a two-second peek costs nothing."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Bonnet Up, Then the Test Drive",
                        "icon": "Car",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Confirm the cold start is cold",
                                        "text": "Touch the bonnet before anyone turns a key — it should be stone cold. Long cranking, a lumpy idle, or smoke that keeps coming are engine conversations, not details."
                                    },
                                    {
                                        "title": "Cap, dipstick, coolant",
                                        "text": "Creamy residue under the oil cap points to head-gasket trouble — on an old van, that repair often costs more than the van is worth. Oil should be dark but clean; coolant its proper colour and never oily."
                                    },
                                    {
                                        "title": "Ask the cambelt question",
                                        "text": "On high-km Japanese vans, ask when the timing belt was last replaced and get it in writing if possible. If that belt lets go mid-trip, it can wreck the engine — no receipt means you price the job into your offer."
                                    },
                                    {
                                        "title": "Drive it like New Zealand drives",
                                        "text": "Motorway up to 100 km/h (no shake through the wheel), a real hill if you can find one (temperature needle steady, power holding), a slow speed bump (no clunks), and one firm, straight brake."
                                    },
                                    {
                                        "title": "Radio off, window half down",
                                        "text": "You're listening for whines, knocks and grinding — a soundtrack is the cheapest way to hide all three."
                                    },
                                    {
                                        "title": "Every gear, twice",
                                        "text": "Reverse included. Hesitation or crunching between shifts is gearbox money you'd be volunteering to spend."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Good to know",
                                "text": "Above roughly $5,000, a professional pre-purchase inspection ($150–180 at a garage, AA or VTNZ) buys you a hoist, trained eyes and a written report you can negotiate with. Cheap insurance on a big decision."
                            }
                        ]
                    },
                    {
                        "title": "The Camper Kit: Test, Don't Admire",
                        "icon": "Star",
                        "items": [
                            {
                                "title": "A pretty build sells vans; a working build keeps trips alive",
                                "text": "Fairy lights are lovely. Water pressure, cold beer and charged phones are lovelier. Test the systems like you already live in it."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Certificate in hand, not in the ad",
                                        "text": "For self-containment, see the actual document: expiry date, and that it matches THIS vehicle. Adverts say 'self-contained'; only certificates prove it."
                                    },
                                    {
                                        "title": "Water in, water out",
                                        "text": "Run the tap, watch the drain flow, then open the cupboard under the sink and press the wood. Soft timber remembers every past leak."
                                    },
                                    {
                                        "title": "Plug your phone into every socket",
                                        "text": "The fastest audit of a 12V system ever invented. Bring your own cable."
                                    },
                                    {
                                        "title": "Run the fridge and lights on the battery",
                                        "text": "Engine off, ten minutes. A healthy leisure battery shrugs this off; a dying one sags visibly. Ask its age — past three or four years, budget for a replacement."
                                    },
                                    {
                                        "title": "Make 'it has solar' mean something",
                                        "text": "Ask for the panel wattage and the controller brand. Without numbers, 'solar' can mean a trickle charger and an optimistic sticker."
                                    },
                                    {
                                        "title": "Sniff the gas locker",
                                        "text": "Any gas smell — or a cooker with no compliance certificate — is a safety problem before it's a paperwork one."
                                    },
                                    {
                                        "title": "Lift the mattress",
                                        "text": "Brown rings on the plywood underneath are the honest autobiography of every roof leak the van has ever had."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Money and Paperwork: The Last Fifteen Minutes",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Re-read the two windscreen labels",
                                        "text": "WOF and REGO: both current, and ideally months from expiry. Anything about to lapse is a cost you're inheriting — say so, politely, with a number."
                                    },
                                    {
                                        "title": "Diesel? Read the RUC label",
                                        "text": "The distance purchased should cover the odometer reading. Any shortfall becomes your bill at the NZTA counter."
                                    },
                                    {
                                        "title": "Write the receipt before money moves",
                                        "text": "Price, date, both names and passport numbers, plate, VIN, the words 'sold as seen'. Two copies, both signed. Five minutes that settle every future argument."
                                    },
                                    {
                                        "title": "Transfer ownership together, on the spot",
                                        "text": "Ten minutes online at nzta.govt.nz, about $9, done side by side. 'We'll sort it tomorrow' is how travellers end up owning a stranger's speeding tickets — or not owning the van at all."
                                    },
                                    {
                                        "title": "Insure it before you turn the key",
                                        "text": "Third-party cover takes twenty minutes online and accepts foreign licences. The drive back to the hostel is already a drive."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Reasons to Walk Away",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "title": "None of these are negotiation openers",
                                "text": "They're exits. The NZ van market always has another one for sale — this week, at a fair price, from someone straightforward."
                            },
                            {
                                "type": "checklist",
                                "title": "🚩 If you meet one of these, leave",
                                "items": [
                                    "You're not allowed to arrange an independent inspection — whatever the excuse",
                                    "The timeline is doing the selling ('two other buyers are coming at four')",
                                    "The seller's story doesn't line up with the CarJam ownership dates",
                                    "'My mechanic mate already checked it' is offered instead of documents",
                                    "A special discount appears only if you pay cash today",
                                    "The VINs on the windscreen, door pillar and papers don't all match"
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Good to know",
                                "text": "On Kiwi Van Market, WOF, REGO and self-contained status sit on every listing, with a CarJam button when the plate is provided — the boring checks are done from your bunk, before you've spent a dollar on gas."
                            },
                            {
                                "type": "cta",
                                "text": "Browse campervans with the paperwork visible upfront",
                                "to": "/"
                            }
                        ]
                    },
                    {
                        "title": "FAQ",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Should I bring someone to a van viewing?",
                                        "a": "If you can, yes. A second person watches the seller's reactions while you watch the van — and pressure tactics deflate fast in front of an audience. Solo? Phone a friend during the viewing and think out loud."
                                    },
                                    {
                                        "q": "Is a cheap OBD2 scanner worth buying?",
                                        "a": "For about $30, absolutely. Plugged in under the dash, it reads stored engine fault codes in minutes and catches the classic trick of clearing a warning light the morning of a sale. It doesn't replace a mechanic — it decides whether you need one."
                                    },
                                    {
                                        "q": "How long should I allow for a proper viewing?",
                                        "a": "Ninety minutes minimum: fifteen standing back and walking around, thirty on systems and paperwork, thirty on the road, and buffer to think without pressure. Anyone rushing you through it is answering a question you didn't ask."
                                    },
                                    {
                                        "q": "Is it normal to leave a deposit?",
                                        "a": "Only after an inspection you're satisfied with, only with a written receipt stating the amount and the conditions, and never to 'reserve' a van you haven't seen in person. For the balance, an in-person bank transfer beats cash — it writes its own receipt."
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        'wof-rego-ruc-insurance-nz': {
            "title": "WOF, REGO, RUC & Insurance in New Zealand: Van Rules Explained Simply",
            "description": "The four vehicle rules every campervan traveller must understand in NZ — what they cost, when they're due, and the fines if you get them wrong. In plain English.",
            "heroImage": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200",
            "content": {
                "intro": "Four acronyms rule your van life in New Zealand: WOF, REGO, RUC and (unofficially) ACC. Get them right and you'll never think about them again. Get them wrong and you're looking at fines, a van you can't legally drive, or debts you inherited from the previous owner. Here's each one, in plain English, with real numbers.",
                "sections": [
                    {
                        "title": "WOF — the Warrant of Fitness",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "What it is",
                                "text": "The WOF is New Zealand's periodic vehicle safety inspection. It checks brakes, tyres, lights, steering, seatbelts, rust and more. Without a current WOF, you cannot legally drive — and your insurance can refuse to pay out."
                            },
                            {
                                "type": "table",
                                "title": "How often is a WOF due?",
                                "headers": [
                                    "Vehicle",
                                    "WOF frequency"
                                ],
                                "rows": [
                                    [
                                        "First registered after 1 January 2000",
                                        "Every 12 months"
                                    ],
                                    [
                                        "First registered before 2000 (most cheap backpacker vans!)",
                                        "Every 6 months"
                                    ],
                                    [
                                        "Brand new vehicles",
                                        "First WOF at 3 years"
                                    ]
                                ],
                                "caption": "A test costs $60–80 at VTNZ, AA or most garages, and takes about 45 minutes."
                            },
                            {
                                "title": "What if it fails?",
                                "text": "You get a list of what to fix, and you can't legally drive except to get repairs and re-test. Most places offer a free or cheap re-check within 28 days. This is why a van with a nearly-expired WOF is worth less: you're inheriting the gamble.",
                                "expertTip": "💡 Buying? A fresh WOF from VTNZ or AA carries more weight than one from an unknown garage — and 3+ months remaining should be your minimum."
                            }
                        ]
                    },
                    {
                        "title": "REGO — Vehicle Registration",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "What it is",
                                "text": "REGO is the licence fee to use public roads, shown by the label on your windscreen. You buy it in 3, 6 or 12-month blocks, online at nzta.govt.nz or at NZ Post — it takes five minutes."
                            },
                            {
                                "type": "table",
                                "title": "What REGO costs (typical van)",
                                "headers": [
                                    "Vehicle type",
                                    "Approx. cost per year"
                                ],
                                "rows": [
                                    [
                                        "Petrol van or car",
                                        "$100–110"
                                    ],
                                    [
                                        "Diesel van",
                                        "Less for REGO itself — but you pay RUC on top (next section)"
                                    ]
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ When buying a van",
                                "text": "Check the REGO isn't 'on hold' (a seller can suspend it to save money while selling). Reactivating is easy but it's YOUR cost, and driving while it's on hold is a $200 fine."
                            }
                        ]
                    },
                    {
                        "title": "RUC — Road User Charges (diesel only)",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "What it is",
                                "text": "Petrol vehicles pay road tax at the pump. Diesel vehicles pay it separately: Road User Charges, bought in 1,000 km blocks (about $76 each) online at nzta.govt.nz. Your windscreen label shows the odometer reading you've paid up to."
                            },
                            {
                                "title": "The maths for a typical trip",
                                "text": "A 10,000 km South-plus-North Island loop in a diesel van costs about $760 in RUC on top of fuel. Diesel is cheaper per litre, so on long trips it can still win — but for most backpacker itineraries under 15,000 km, petrol's simplicity is worth more than diesel's savings."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ The trap that catches buyers",
                                "text": "Unpaid RUC follows the VEHICLE, not the seller. Before buying any diesel van, compare the odometer with the RUC distance purchased — the difference is a debt you're about to inherit."
                            }
                        ]
                    },
                    {
                        "title": "Insurance & ACC — what's actually covered",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "The surprise: insurance is not legally required",
                                "text": "New Zealand doesn't mandate car insurance. But before you celebrate: if you cause a crash uninsured, you personally owe the damage — and hitting a $80,000 ute is a real possibility. That's why virtually every traveller carries at least third-party cover."
                            },
                            {
                                "type": "table",
                                "title": "Your three options",
                                "headers": [
                                    "Cover",
                                    "Protects",
                                    "Typical cost/year"
                                ],
                                "rows": [
                                    [
                                        "Third party",
                                        "Other people's vehicles and property (not your van)",
                                        "$300–600"
                                    ],
                                    [
                                        "Third party, fire & theft",
                                        "The above + your van if stolen or burned",
                                        "$400–700"
                                    ],
                                    [
                                        "Comprehensive",
                                        "Everything, including your own crash damage",
                                        "$700+ — rarely worth it on a $6,000 van"
                                    ]
                                ],
                                "caption": "Foreign licences are accepted by mainstream NZ insurers; you can sign up online with a passport and a NZ address."
                            },
                            {
                                "title": "And ACC?",
                                "text": "New Zealand's Accident Compensation Corporation covers INJURY treatment for everyone in NZ — including tourists — regardless of fault. It's real and it's free. But it covers people, not property: your medical bills after a crash, yes; your van or the other car, no. ACC is why travel insurance and vehicle insurance still matter."
                            }
                        ]
                    },
                    {
                        "title": "Fines & penalties cheat sheet",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "type": "checklist",
                                "title": "What it costs to get it wrong",
                                "items": [
                                    "Driving without a current WOF: $200 fine — and your insurance can refuse claims",
                                    "Expired or on-hold REGO: $200 fine",
                                    "Unpaid RUC: assessed against the vehicle, plus penalties",
                                    "Freedom camping without certification (where required): up to $400",
                                    "No insurance: no fine — but one at-fault crash can cost you tens of thousands"
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Ready to buy? Read the full step-by-step buying guide",
                                "to": "/guide/buying-campervan-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Going to an inspection? Take the 30-point checklist",
                                "to": "/guide/campervan-buyer-checklist"
                            }
                        ]
                    },
                    {
                        "title": "FAQ",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Can I drive a van with an expired WOF?",
                                        "a": "Only directly to a testing station or to a garage for booked repairs. Anywhere else risks a $200 fine — and voids most insurance policies."
                                    },
                                    {
                                        "q": "What does 'REGO on hold' mean when buying a van?",
                                        "a": "The seller suspended the registration to save money. The van can't legally be driven until it's reactivated (easy, online, but at your cost) — and it may need a new WOF first."
                                    },
                                    {
                                        "q": "How do I buy RUC for a diesel van?",
                                        "a": "Online at nzta.govt.nz or at NZ Post, in blocks of 1,000 km (~$76). Buy enough to cover your planned distance; unused RUC can be refunded when you sell."
                                    },
                                    {
                                        "q": "Can foreigners get NZ vehicle insurance?",
                                        "a": "Yes — mainstream insurers cover drivers on foreign licences or International Driving Permits. You sign up online in about 20 minutes with a passport and a NZ address (your hostel works)."
                                    },
                                    {
                                        "q": "Does ACC replace travel insurance?",
                                        "a": "No. ACC covers accident injuries in NZ for everyone, but not illness, not your belongings, not your van, and not liability. Keep your travel insurance, and put third-party cover on the van."
                                    }
                                ]
                            }
                        ]
                    }
                ]
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
            heroImage: '/top10-van.avif',
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
            "title": "Acheter un campervan en Nouvelle-Zélande : le guide backpacker (2026)",
            "description": "Prix réels, une routine d'inspection pas à pas, le WOF, la REGO, l'assurance et les règles self-contained — tout pour acheter un van en Nouvelle-Zélande sans se faire avoir.",
            "heroImage": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200",
            "content": {
                "intro": "Vous venez d'atterrir à Auckland, tout le monde à l'auberge parle d'acheter un van, et vous ne savez pas par où commencer. Bonne nouvelle : dans les 15 prochaines minutes, vous aurez le tableau complet — prix réels, méthode d'inspection éprouvée, arnaques à éviter et paperasse exacte. C'est le guide qu'on aurait aimé avoir avant notre premier road trip en NZ.",
                "sections": [
                    {
                        "title": "Commencez ici : les bases en 5 minutes",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "Pourquoi acheter plutôt que louer ?",
                                "text": "Louer coûte 60 à 150 $ par jour. Acheter un van à 7 000 $ pour 6 mois et le revendre 6 000 $ vous revient à environ 5 $ par jour, plus le carburant. C'est pour ça que presque tous les backpackers en long séjour achètent — et avec une revente maligne, certains rentrent même dans leurs frais. Le piège : ces économies ne tiennent que si vous achetez un van sain. C'est tout l'objet de ce guide."
                            },
                            {
                                "type": "table",
                                "title": "Le jargon néo-zélandais, décodé",
                                "headers": [
                                    "Terme",
                                    "Ce que ça veut dire",
                                    "Pourquoi ça vous concerne"
                                ],
                                "rows": [
                                    [
                                        "WOF",
                                        "Warrant of Fitness — le contrôle technique de sécurité périodique obligatoire",
                                        "Pas de WOF valide = interdiction de rouler"
                                    ],
                                    [
                                        "REGO",
                                        "L'immatriculation, payée pour circuler sur les routes publiques",
                                        "Vendue par 3, 6 ou 12 mois (~100 $/an pour un van essence)"
                                    ],
                                    [
                                        "RUC",
                                        "Road User Charges — une taxe au kilomètre payée uniquement par les diesels",
                                        "Environ 76 $ par 1 000 km, en plus du carburant"
                                    ],
                                    [
                                        "Self-contained",
                                        "Certifié avec toilettes + réservoirs d'eau (macaron vert ou bleu)",
                                        "Exigé pour la plupart du freedom camping"
                                    ],
                                    [
                                        "CarJam",
                                        "Un rapport d'historique du véhicule en ligne",
                                        "Révèle dettes, fraude au compteur et véhicules volés"
                                    ],
                                    [
                                        "PPSR",
                                        "Personal Property Securities Register — le registre officiel des dettes",
                                        "Une vérification à 3 $ qui vous évite d'hériter du crédit d'un autre"
                                    ]
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bon à savoir",
                                "text": "Vous n'avez PAS besoin d'être résident néo-zélandais pour acheter un véhicule. Un passeport et une adresse locale (votre auberge suffit) font l'affaire. La plupart des backpackers conduisent avec leur permis d'origine ou un permis international — assurez-vous simplement qu'il soit valide en anglais."
                            },
                            {
                                "title": "Combien de temps ça prend ?",
                                "text": "Comptez 3 à 7 jours dans une grande ville : un ou deux jours à éplucher les annonces, quelques visites, une inspection mécanique et 15 minutes de paperasse. Se précipiter dès le premier jour, c'est exactement comme ça qu'on achète une épave.",
                                "expertTip": "Réservez votre première semaine d'hébergement à Auckland ou Christchurch — c'est là que se trouve l'offre de vans."
                            },
                            {
                                "type": "cta",
                                "text": "Voyez ce qui est en vente en ce moment partout en Nouvelle-Zélande",
                                "to": "/"
                            }
                        ]
                    },
                    {
                        "title": "Ce qu'un campervan coûte vraiment",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "type": "table",
                                "title": "Les tranches de prix sur le marché backpacker (NZD)",
                                "headers": [
                                    "Budget",
                                    "Ce que vous obtenez",
                                    "À surveiller"
                                ],
                                "rows": [
                                    [
                                        "Moins de 4 000 $",
                                        "Vieux monospaces (Estima, Serena, Odyssey) avec un matelas à l'arrière",
                                        "Kilométrage élevé, rouille, WOF court — l'inspection est non négociable"
                                    ],
                                    [
                                        "4 000–8 000 $",
                                        "Les vans backpackers classiques : Hiace, Bongo, Vanette, L300 — souvent self-contained",
                                        "Le meilleur rapport qualité-prix ; vérifiez que la certification est authentique"
                                    ],
                                    [
                                        "8 000–15 000 $",
                                        "Des vans plus récents, bien aménagés : solaire, frigo, isolation",
                                        "Payez pour ce qui VOUS aide à voyager, pas pour les guirlandes"
                                    ],
                                    [
                                        "15 000 $ et +",
                                        "Vans surélevés, Delica 4x4, petits camping-cars",
                                        "Plus durs à revendre vite en fin de voyage"
                                    ]
                                ],
                                "caption": "Pour référence : l'annonce moyenne sur Kiwi Van Market tourne autour de 8 000–10 000 $."
                            },
                            {
                                "type": "checklist",
                                "title": "✅ Checklist rapide : les coûts cachés qu'on oublie la première fois",
                                "items": [
                                    "Assurance : 300–600 $/an (le tiers est le standard backpacker)",
                                    "Contrôle WOF : 60–80 $ à chaque fois",
                                    "REGO : environ 100 $/an pour un van essence",
                                    "RUC (diesel uniquement) : ~76 $ par 1 000 km",
                                    "Inspection mécanique pré-achat : 150–180 $ — le meilleur argent que vous dépenserez",
                                    "Ferry du détroit de Cook avec un van : 250–450 $ aller-retour",
                                    "Un fonds d'urgence de 1 000 $ pour les réparations (batterie, pneus, pompe à eau)"
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Erreur fréquente",
                                "text": "Dépenser chaque dollar dans le van lui-même. Gardez 1 000 $ de côté pour les imprévus — une batterie, un pneu, une pompe à eau. Une panne avec un compte vide, c'est comme ça qu'un road trip se termine trop tôt."
                            },
                            {
                                "title": "Peut-on négocier ? (Oui. Poliment.)",
                                "text": "Presque tout prix affiché a 10 à 15 % de marge — davantage en fin de saison, quand les vendeurs ont un avion à prendre. Appuyez-vous sur du concret : échéance du WOF, usure des pneus, kilométrage, batterie auxiliaire fatiguée. Du cash aujourd'hui vaut mieux que des promesses demain.",
                                "expertTip": "💡 Demandez quand le vendeur repart. Trois jours avant le départ, un van à 8 500 $ devient un van à 7 200 $."
                            },
                            {
                                "title": "Essence ou diesel ? Le calcul honnête",
                                "text": "Le diesel est moins cher à la pompe mais paie la RUC (~76 $ par 1 000 km) et ses révisions coûtent plus cher. L'essence est plus simple : pas de RUC, entretien moins cher, et pour un trajet type de 10 000–15 000 km, l'écart de coût total est faible. Règle du pouce : en dessous de 15 000 km, l'essence gagne généralement en simplicité."
                            }
                        ]
                    },
                    {
                        "title": "Où acheter (et où faire attention)",
                        "icon": "MapPin",
                        "items": [
                            {
                                "type": "table",
                                "title": "Vos options, comparées honnêtement",
                                "headers": [
                                    "Où",
                                    "Avantages",
                                    "Inconvénients"
                                ],
                                "rows": [
                                    [
                                        "Marketplaces en ligne (comme Kiwi Van Market)",
                                        "Photos, WOF/REGO affichés d'emblée, bouton historique CarJam, chat direct avec le propriétaire",
                                        "Les vans populaires partent vite — regardez chaque jour"
                                    ],
                                    [
                                        "Groupes Facebook backpackers",
                                        "Gros volume, de vraies bonnes affaires existent",
                                        "Zéro vérification, arnaques, la moitié des annonces sont déjà vendues"
                                    ],
                                    [
                                        "Marchés de voitures backpackers",
                                        "Voir beaucoup de vans en une matinée",
                                        "Des revendeurs déguisés en voyageurs, des frais d'entrée"
                                    ],
                                    [
                                        "Concessionnaires",
                                        "Garanties consommateur, moins de risque",
                                        "20–40 % plus chers, peu de vrais vans backpackers"
                                    ]
                                ]
                            },
                            {
                                "title": "Le timing prime sur tout",
                                "text": "Achetez là où les voyageurs atterrissent : Auckland toute l'année, Christchurch pour l'île du Sud. Et achetez quand ils repartent — de février à avril, le marché est inondé de vans de backpackers sur le départ. D'octobre à décembre, c'est le marché du vendeur : arrivez tôt ou payez plus."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Les arnaques classiques",
                                "text": "Un « ami à l'étranger » qui expédiera le van après un acompte. Un vendeur qui refuse une inspection mécanique. Un prix très en dessous du marché avec pression pour décider aujourd'hui. Une demande d'acompte juste pour « réserver » un van que vous n'avez pas vu. L'un de ces signaux : partez. Il y a toujours un autre van."
                            }
                        ]
                    },
                    {
                        "title": "L'inspection de 30 minutes qui vous économise des milliers",
                        "icon": "Shield",
                        "items": [
                            {
                                "type": "image",
                                "url": "/van_inspection_expert_1772133711431.png",
                                "caption": "Vérifiez toujours l'huile AVANT que le moteur ne chauffe — un démarrage à froid dit la vérité."
                            },
                            {
                                "title": "Le test de la mayo (30 secondes, rédhibitoire)",
                                "text": "Ouvrez le bouchon d'huile. Une pâte laiteuse, façon mayonnaise, sous le bouchon signifie en général que le joint de culasse est mort — une réparation à 2 000 $+ sur un van à 5 000 $. Refermez le capot, dites merci, et partez."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Démarrage à froid",
                                        "text": "Demandez au vendeur de NE PAS faire chauffer le moteur avant votre arrivée. Un moteur préchauffé est la plus vieille astuce pour masquer un démarrage capricieux."
                                    },
                                    {
                                        "title": "Observez l'échappement",
                                        "text": "Une fumée blanche ou bleue au démarrage signale un souci moteur. Un panache de vapeur par matin froid est normal ; un nuage qui persiste ne l'est pas."
                                    },
                                    {
                                        "title": "Historique de la courroie de distribution",
                                        "text": "Crucial sur le Hiace et beaucoup de diesels. Demandez quand elle a été remplacée et à quel kilométrage — si cette courroie lâche en roulant, elle peut emporter tout le moteur. Pas de preuve de remplacement sur un van à haut kilométrage ? Prévoyez le budget ou baissez votre offre."
                                    },
                                    {
                                        "title": "Freins",
                                        "text": "Freinage en ligne droite depuis 50 km/h : pas de couinement, pas de déport d'un côté, pédale ferme."
                                    },
                                    {
                                        "title": "Boîte de vitesses",
                                        "text": "Testez chaque rapport — y compris la marche arrière. Craquements ou hésitations = une facture de réparation en attente."
                                    },
                                    {
                                        "title": "Direction à vitesse",
                                        "text": "Emmenez-le sur la voie rapide. Le moindre flottement à 100 km/h pointe vers le parallélisme, les pneus ou la suspension."
                                    },
                                    {
                                        "title": "La rouille — le tueur néo-zélandais",
                                        "text": "Passages de roues, joints de vitres, sous la moquette, et sous le van. La rouille de surface sur les tôles se gère ; la rouille sur les longerons ou le plancher, on part."
                                    },
                                    {
                                        "title": "Suspension",
                                        "text": "Passez lentement un ralentisseur et écoutez les cognements. Appuyez sur chaque coin — il doit se stabiliser, pas rebondir."
                                    },
                                    {
                                        "title": "Tout ce qui est électrique",
                                        "text": "Vitres, phares, essuie-glaces, autoradio, prises USB, plafonniers. Les petites pannes révèlent comment le van a été entretenu."
                                    },
                                    {
                                        "title": "Circuits d'eau et moisissures",
                                        "text": "Ouvrez les robinets, regardez sous l'évier, soulevez le matelas. Auréoles brunes au plafond et odeur d'humidité = infiltration d'eau."
                                    },
                                    {
                                        "title": "Pneus",
                                        "text": "Usure inégale sur la bande de roulement = parallélisme ou suspension. Un jeu de quatre pneus de van coûte 600–1 000 $."
                                    },
                                    {
                                        "title": "Le VIN concorde partout",
                                        "text": "Comparez le VIN sur le tableau de bord, le montant de porte et les papiers. Une différence peut signaler un passé accidenté ou un véhicule volé."
                                    }
                                ]
                            },
                            {
                                "title": "Puis payez un pro — toujours",
                                "text": "Une inspection pré-achat chez VTNZ, AA ou n'importe quel garage coûte 150–180 $. Ils mettent le van sur un pont et trouvent ce que vous ne pouvez physiquement pas voir. Un vendeur qui refuse une inspection vous dit tout ce qu'il faut savoir.",
                                "expertTip": "🎯 Passez la plaque dans CarJam avant même de vous déplacer pour une visite — une dette sur un van devient VOTRE problème après l'achat."
                            },
                            {
                                "type": "cta",
                                "text": "Obtenez la checklist acheteur complète en 30 points, imprimable",
                                "to": "/guide/campervan-buyer-checklist"
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bon à savoir",
                                "text": "Sur Kiwi Van Market, chaque annonce affiche l'échéance du WOF et de la REGO, et inclut un bouton d'historique CarJam quand le vendeur fournit la plaque — vous pouvez donc faire les deux grosses vérifications avant même de contacter quiconque."
                            }
                        ]
                    },
                    {
                        "title": "Paperasse : en règle en 15 minutes",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "La bonne nouvelle",
                                "text": "La Nouvelle-Zélande rend la paperasse véhicule vraiment simple. Pas de notaire, pas d'avocat, pas d'attente de plusieurs semaines. Six étapes, bouclées le jour même, la plupart gratuites."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Faites les vérifications d'historique",
                                        "text": "CarJam avec le numéro de plaque (statut volé, historique du compteur, dossier WOF), plus une vérification PPSR à 3 $ avec le VIN — si un crédit court encore, le prêteur peut saisir le van chez VOUS après l'achat."
                                    },
                                    {
                                        "title": "Vérifiez WOF et REGO",
                                        "text": "Au moins 3 mois de WOF restants (ou fraîchement passé), et REGO à jour — pas « on hold ». Les deux visibles sur le pare-brise et sur l'annonce."
                                    },
                                    {
                                        "title": "Rédigez un reçu",
                                        "text": "Prix, date, les deux noms et numéros de passeport, plaque et VIN, la mention « sold as seen » (vendu en l'état). Deux exemplaires, signés tous les deux. Cinq minutes qui règlent toute dispute future."
                                    },
                                    {
                                        "title": "Transférez la propriété ENSEMBLE",
                                        "text": "Faites tous les deux le changement de propriétaire en ligne sur nzta.govt.nz (ou dans n'importe quel NZ Post) le jour de l'achat. Environ 9 $, avec votre passeport et une adresse — votre auberge convient."
                                    },
                                    {
                                        "title": "Activez l'assurance avant de démarrer",
                                        "text": "Une assurance au tiers prend 20 minutes en ligne et fonctionne avec un permis étranger. Rouler sans assurance, c'est parier tout votre voyage sur un seul carrefour."
                                    },
                                    {
                                        "title": "Achetez la RUC si c'est un diesel",
                                        "text": "Comparez le compteur à la distance RUC déjà achetée. Une RUC impayée devient votre dette. Rechargez en ligne sur nzta.govt.nz par blocs de 1 000 km."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Erreur fréquente",
                                "text": "Payer maintenant et « régler les papiers plus tard ». Si le vendeur ne dépose jamais le transfert, ses excès de vitesse deviennent les vôtres — et légalement, le van peut même ne pas être à vous. Le jour même, ensemble, sans exception."
                            },
                            {
                                "type": "cta",
                                "text": "WOF, REGO et RUC vous parlent chinois ? Lisez le guide des règles en clair",
                                "to": "/guide/wof-rego-ruc-insurance-nz"
                            }
                        ]
                    },
                    {
                        "title": "Self-contained : votre ticket pour le camping gratuit",
                        "icon": "Star",
                        "items": [
                            {
                                "type": "image",
                                "url": "/self_contained_sticker_van_1772133744005.png",
                                "caption": "Le macaron de certification : votre clé pour le freedom camping légal."
                            },
                            {
                                "title": "Ce que le macaron veut vraiment dire",
                                "text": "Un van certifié self-contained embarque de l'eau propre, un réservoir d'eaux grises et des toilettes. Depuis le changement de règle, les nouvelles certifications (macaron vert) exigent des toilettes fixes — les anciennes certifications à macaron bleu disparaissent au fil de leur expiration. Le certificat appartient au véhicule et a une date d'échéance."
                            },
                            {
                                "title": "Pourquoi ça vaut de l'argent réel",
                                "text": "Sans certification, vous paierez 20–50 $ la nuit en camping. Avec, des milliers de spots de freedom camping légaux deviennent gratuits. Sur 4 mois, c'est facilement 1 500 $+ économisés — et les vans certifiés se revendent plus vite, à meilleur prix."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Erreur fréquente",
                                "text": "Se fier au mot « self-contained » dans une annonce. Demandez à VOIR le certificat et vérifiez son échéance — puis vérifiez le numéro de certification. Une amende de 400 $ pour freedom camping gâche une bonne semaine."
                            },
                            {
                                "title": "Téléchargez ces deux applis ce soir",
                                "text": "CamperMate et Rankers montrent tous les spots de camping légaux, stations de vidange et douches publiques du pays, avec les avis d'autres voyageurs. Elles sont gratuites, et c'est comme ça que tout le monde trouve vraiment où dormir."
                            }
                        ]
                    },
                    {
                        "title": "Le revendre en partant (pensez-y dès maintenant)",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Votre plan de sortie commence à l'achat",
                                "text": "Le van que vous achetez aujourd'hui est celui que vous devrez revendre dans 6 mois, depuis la ville d'où vous décollez. Les modèles populaires — Hiace, Bongo, L300 — avec WOF, REGO et certification self-contained valides, se vendent en quelques jours. Les vans rares ou fatigués se vendent en semaines, sous pression, à perte."
                            },
                            {
                                "title": "La machine à cash saisonnière",
                                "text": "Achetez à Christchurch en mars à un backpacker qui repart (basse saison, prix bas). Revendez à Auckland en novembre à un backpacker qui arrive (haute saison, prix haut). Les voyageurs qui suivent ce calendrier revendent régulièrement PLUS cher qu'ils n'ont payé."
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bon à savoir",
                                "text": "Publier votre van sur Kiwi Van Market est gratuit, sans commission — et vous pouvez proposer un rachat pour faire ressortir votre annonce. Mettez-la en ligne 3–4 semaines avant votre vol, pas 3 jours."
                            },
                            {
                                "type": "cta",
                                "text": "Publiez votre van gratuitement — sans commission, contact direct avec les acheteurs",
                                "to": "/sell"
                            }
                        ]
                    },
                    {
                        "title": "FAQ : réponses rapides",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Un étranger peut-il acheter un campervan en Nouvelle-Zélande ?",
                                        "a": "Oui. Pas besoin de résidence ni de permis néo-zélandais : un passeport et une adresse locale (votre auberge compte) suffisent pour acheter et immatriculer un véhicule. La plupart des backpackers conduisent avec leur permis d'origine ou un permis international."
                                    },
                                    {
                                        "q": "Quel budget prévoir pour un campervan backpacker ?",
                                        "a": "La plupart des voyageurs dépensent 5 000–10 000 NZ$. De bons vans existent sous 4 000 $ mais exigent une inspection rigoureuse. L'annonce moyenne sur Kiwi Van Market tourne autour de 8 000–10 000 $."
                                    },
                                    {
                                        "q": "L'assurance auto est-elle obligatoire en Nouvelle-Zélande ?",
                                        "a": "Non — mais l'assurance au tiers (300–600 $/an) est le standard backpacker. Elle couvre la voiture coûteuse que vous pourriez emboutir ; s'en passer, c'est parier tout votre voyage sur un seul carrefour."
                                    },
                                    {
                                        "q": "Campervan essence ou diesel ?",
                                        "a": "Le diesel est moins cher à la pompe mais paie les Road User Charges (environ 76 $ par 1 000 km) et ses révisions coûtent plus. Si vous roulez moins de ~15 000 km, l'essence gagne généralement en simplicité."
                                    },
                                    {
                                        "q": "Qu'est-ce qu'un WOF et à quelle fréquence en faut-il un ?",
                                        "a": "Le Warrant of Fitness est le contrôle de sécurité périodique néo-zélandais : tous les 12 mois pour les véhicules immatriculés après 2000, tous les 6 mois pour les plus anciens. Achetez un van avec au moins 3 mois de WOF restants."
                                    },
                                    {
                                        "q": "Qu'est-ce qu'une vérification PPSR ?",
                                        "a": "Une recherche à 3 $ dans le Personal Property Securities Register (ppsr.govt.nz) via le VIN. Elle vous dit si un crédit court encore sur le véhicule — si oui, le prêteur peut saisir le van même après que vous l'ayez payé."
                                    },
                                    {
                                        "q": "Puis-je dormir n'importe où dans mon van ?",
                                        "a": "Non. Le freedom camping n'est légal que dans les zones autorisées, et généralement réservé aux véhicules certifiés self-contained. Les amendes atteignent 400 $. CamperMate et Rankers montrent gratuitement chaque spot légal."
                                    },
                                    {
                                        "q": "Que se passe-t-il si mon van tombe en panne ?",
                                        "a": "L'adhésion AA (~99 $/an) vous donne une assistance routière dans tout le pays — la plupart des backpackers la jugent essentielle. Gardez une réserve de 1 000 $ : batteries, pneus et pompes à eau sont les suspects habituels sur les vieux vans."
                                    },
                                    {
                                        "q": "En combien de temps puis-je revendre mon van en fin de voyage ?",
                                        "a": "Avec un prix juste, des photos honnêtes et des papiers valides : quelques jours en haute saison (octobre–décembre), deux à quatre semaines sinon. Publiez-le 3–4 semaines avant votre vol."
                                    },
                                    {
                                        "q": "Où vérifier l'historique d'un van avant d'acheter ?",
                                        "a": "CarJam, avec le numéro de plaque : il révèle les dettes, le statut volé, les relevés de compteur et l'historique d'importation. Sur Kiwi Van Market, le bouton CarJam est sur l'annonce dès que le vendeur fournit la plaque."
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        'campervan-buyer-checklist': {
            "title": "Checklist d'inspection d'un van d'occasion en NZ : comment vérifier avant d'acheter",
            "description": "Une routine pré-achat chronologique pour les campervans en Nouvelle-Zélande — les devoirs la veille, les premières minutes sur place, le tour du véhicule, l'essai routier et la remise des clés. Version imprimable gratuite.",
            "heroImage": "/van_inspection_expert_1772133711431.png",
            "content": {
                "intro": "Chaque auberge a son histoire : quelqu'un qui a acheté un van le deuxième jour, puis passé la troisième semaine à payer un mécano pour lui expliquer ce qu'il avait raté. On n'évite pas de devenir cette histoire avec de la chance — on l'évite avec une méthode. Cette checklist suit une vraie visite dans l'ordre où elle se déroule vraiment : les devoirs la veille, les premières minutes sur place, le tour du véhicule, l'essai routier, et le quart d'heure où l'argent et les papiers changent de mains. Cochez au fil de l'eau et, à la fin, vous connaîtrez le van mieux que le vendeur ne s'y attend.",
                "sections": [
                    {
                        "title": "La veille : les devoirs depuis l'auberge",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Vingt minutes sur ton téléphone, des milliers de dollars protégés",
                                "text": "La plupart des catastrophes sont visibles en ligne avant d'avoir dépensé un dollar d'essence. Fais ça depuis ton lit, la veille de la visite."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "La plaque dans CarJam",
                                        "text": "Le rapport d'historique montre le nombre de propriétaires, les relevés de compteur dans le temps et le registre des WOF (réussis/échoués). Un van qui a raté son dernier WOF et s'est retrouvé en vente juste après mérite des questions ciblées."
                                    },
                                    {
                                        "title": "Le VIN dans le PPSR",
                                        "text": "Trois dollars sur ppsr.govt.nz te disent si un prêteur a encore un droit sur le véhicule. La dette de financement suit le van — pas le vendeur."
                                    },
                                    {
                                        "title": "Vérifie que le prix tient la route",
                                        "text": "Compare le van à des annonces équivalentes : même modèle, année, kilométrage et certification proches. Un prix très en dessous du marché est une question à élucider, pas une bonne affaire à saisir."
                                    },
                                    {
                                        "title": "Envoie deux messages",
                                        "text": "« Pouvez-vous m'envoyer des photos du carnet d'entretien ? » et « Merci de ne pas démarrer le moteur avant mon arrivée. » Les réponses — et leur ton — en disent long avant même de vous être rencontrés."
                                    },
                                    {
                                        "title": "Réserve de jour et par temps sec",
                                        "text": "La pluie flatte la peinture et masque les taches d'huile sur la place de parking. Un créneau le matin rend aussi un vrai démarrage à froid bien plus probable."
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Imprime la version de poche de cette checklist (gratuit, aucune inscription)",
                                "href": "/checklist-print.html",
                                "download": true
                            }
                        ]
                    },
                    {
                        "title": "Les cinq premières minutes sur place",
                        "icon": "MapPin",
                        "items": [
                            {
                                "title": "Avant de toucher à quoi que ce soit, prends du recul",
                                "text": "Les vans parlent, si tu leur laisses quelques mètres de distance et trente secondes de silence."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Regarde comment il repose",
                                        "text": "Un van qui penche vers un coin te parle de ressorts ou d'une suspension fatigués avant même que tu aies ouvert une portière."
                                    },
                                    {
                                        "title": "Compare les quatre pneus",
                                        "text": "Quatre marques différentes, ou des pneus avant neufs sur des arrière lisses, décrivent un van entretenu une urgence à la fois."
                                    },
                                    {
                                        "title": "Ouvre la portière et respire",
                                        "text": "L'humidité a une odeur qu'on n'oublie pas. La moisissure derrière les panneaux se signale ici en premier — avant que ton nez ne s'y habitue."
                                    },
                                    {
                                        "title": "Demande depuis combien de temps il l'a",
                                        "text": "Mine de rien. Plus tard, recoupe la réponse avec les dates de propriété de CarJam. Les vendeurs honnêtes racontent des histoires cohérentes sans effort."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Le tour du véhicule : carrosserie et rouille",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "image",
                                "url": "/van_inspection_expert_1772133711431.png",
                                "caption": "Prends une lampe torche. La vraie histoire du van est écrite en dessous."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Jeux de tôles et teinte de peinture",
                                        "text": "Des écarts irréguliers entre les panneaux, ou une portière d'une nuance légèrement différente, trahissent des réparations après accident que personne n'a mentionnées."
                                    },
                                    {
                                        "title": "L'astuce de l'aimant",
                                        "text": "Enveloppe un aimant dans un torchon et fais-le glisser le long des bas de caisse et des passages de roues. Là où il cesse d'accrocher, quelqu'un a masqué de la rouille sous du mastic."
                                    },
                                    {
                                        "title": "Passe dessous avec ta torche",
                                        "text": "Longerons, planchers, bas de caisse. Une croûte brune qui s'effrite sur un élément structurel, on part ; un léger voile de surface sur des tôles plates, ça se négocie."
                                    },
                                    {
                                        "title": "Joints de vitres et jonctions de toit",
                                        "text": "Les vans néo-zélandais vivent dehors, souvent près de l'air salin. Une peinture qui cloque autour des vitres, c'est de la rouille qui travaille de l'intérieur — le sens qui coûte cher."
                                    },
                                    {
                                        "title": "Soulève tout ce qui se soulève",
                                        "text": "Coins de moquette, tapis de sol, cache-bagages. Les planchers pourrissent en silence dans le noir, et un coup d'œil de deux secondes ne coûte rien."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Capot ouvert, puis l'essai routier",
                        "icon": "Car",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Confirme que le démarrage à froid est froid",
                                        "text": "Touche le capot avant que quiconque ne tourne la clé — il doit être glacé. Un long démarrage, un ralenti irrégulier ou une fumée qui persiste sont des conversations de moteur, pas des détails."
                                    },
                                    {
                                        "title": "Bouchon, jauge, liquide de refroidissement",
                                        "text": "Un résidu crémeux sous le bouchon d'huile pointe vers un joint de culasse — sur un vieux van, cette réparation coûte souvent plus que le van ne vaut. L'huile doit être sombre mais propre ; le liquide de refroidissement de sa vraie couleur, jamais huileux."
                                    },
                                    {
                                        "title": "Pose la question de la courroie de distribution",
                                        "text": "Sur les vans japonais à haut kilométrage, demande quand la courroie a été changée pour la dernière fois et obtiens-le par écrit si possible. Si elle lâche en cours de route, elle peut détruire le moteur — sans facture, tu intègres le remplacement dans ton offre."
                                    },
                                    {
                                        "title": "Conduis-le comme on conduit en Nouvelle-Zélande",
                                        "text": "Voie rapide jusqu'à 100 km/h (aucun tremblement au volant), une vraie côte si tu en trouves une (aiguille de température stable, puissance qui tient), un ralentisseur au pas (aucun cognement), et un freinage ferme et droit."
                                    },
                                    {
                                        "title": "Radio éteinte, vitre à moitié baissée",
                                        "text": "Tu écoutes les sifflements, les cognements et les grincements — une bande-son est le moyen le moins cher de cacher les trois."
                                    },
                                    {
                                        "title": "Chaque rapport, deux fois",
                                        "text": "Marche arrière comprise. Une hésitation ou un craquement entre les rapports, c'est de la boîte de vitesses que tu te porterais volontaire pour payer."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bon à savoir",
                                "text": "Au-delà d'environ 5 000 $, une inspection pré-achat professionnelle (150–180 $ dans un garage, chez AA ou VTNZ) t'offre un pont, des yeux entraînés et un rapport écrit avec lequel négocier. Une assurance pas chère sur une grosse décision."
                            }
                        ]
                    },
                    {
                        "title": "L'aménagement : teste, ne contemple pas",
                        "icon": "Star",
                        "items": [
                            {
                                "title": "Un bel aménagement vend des vans ; un aménagement qui marche sauve des voyages",
                                "text": "Les guirlandes, c'est joli. La pression d'eau, la bière fraîche et les téléphones chargés, c'est mieux. Teste les systèmes comme si tu vivais déjà dedans."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Le certificat en main, pas dans l'annonce",
                                        "text": "Pour le self-contained, exige le vrai document : date d'échéance, et qu'il corresponde à CE véhicule. Les annonces disent « self-contained » ; seuls les certificats le prouvent."
                                    },
                                    {
                                        "title": "L'eau entre, l'eau sort",
                                        "text": "Ouvre le robinet, regarde l'évacuation couler, puis ouvre le placard sous l'évier et appuie sur le bois. Un bois mou se souvient de chaque fuite passée."
                                    },
                                    {
                                        "title": "Branche ton téléphone sur chaque prise",
                                        "text": "L'audit le plus rapide jamais inventé pour un circuit 12 V. Apporte ton propre câble."
                                    },
                                    {
                                        "title": "Fais tourner le frigo et les lumières sur la batterie",
                                        "text": "Moteur coupé, dix minutes. Une batterie auxiliaire en forme encaisse sans broncher ; une mourante s'affaisse à vue d'œil. Demande son âge — au-delà de trois ou quatre ans, prévois un remplacement."
                                    },
                                    {
                                        "title": "Fais dire quelque chose à « il y a du solaire »",
                                        "text": "Demande la puissance du panneau (en watts) et la marque du régulateur. Sans chiffres, « solaire » peut désigner un chargeur d'appoint et un autocollant optimiste."
                                    },
                                    {
                                        "title": "Renifle le coffre à gaz",
                                        "text": "La moindre odeur de gaz — ou un réchaud sans certificat de conformité — est un problème de sécurité avant d'être un problème de paperasse."
                                    },
                                    {
                                        "title": "Soulève le matelas",
                                        "text": "Les auréoles brunes sur le contreplaqué en dessous sont l'autobiographie honnête de chaque fuite de toit que le van a connue."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Argent et paperasse : le dernier quart d'heure",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Relis les deux étiquettes du pare-brise",
                                        "text": "WOF et REGO : les deux à jour, et idéalement à plusieurs mois de l'échéance. Tout ce qui est sur le point d'expirer est un coût dont tu hérites — dis-le, poliment, avec un chiffre."
                                    },
                                    {
                                        "title": "Diesel ? Lis l'étiquette RUC",
                                        "text": "La distance achetée doit couvrir le relevé du compteur. Tout manque devient ta facture au guichet NZTA."
                                    },
                                    {
                                        "title": "Rédige le reçu avant que l'argent bouge",
                                        "text": "Prix, date, les deux noms et numéros de passeport, plaque, VIN, la mention « sold as seen » (vendu en l'état). Deux exemplaires, signés tous les deux. Cinq minutes qui règlent toute dispute future."
                                    },
                                    {
                                        "title": "Transférez la propriété ensemble, sur place",
                                        "text": "Dix minutes en ligne sur nzta.govt.nz, environ 9 $, côte à côte. « On règlera ça demain », c'est comme ça qu'un voyageur se retrouve avec les excès de vitesse d'un inconnu — ou sans le van du tout."
                                    },
                                    {
                                        "title": "Assure-le avant de tourner la clé",
                                        "text": "Une assurance au tiers prend vingt minutes en ligne et accepte les permis étrangers. Le retour à l'auberge est déjà un trajet."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Les raisons de partir",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "title": "Aucune n'est un point de négociation",
                                "text": "Ce sont des sorties. Le marché néo-zélandais du van en a toujours un autre à vendre — cette semaine, à prix juste, chez quelqu'un de droit."
                            },
                            {
                                "type": "checklist",
                                "title": "🚩 Si tu rencontres l'un de ces signaux, pars",
                                "items": [
                                    "On t'interdit d'organiser une inspection indépendante — quelle que soit l'excuse",
                                    "Le calendrier fait la vente (« deux autres acheteurs passent à 16 h »)",
                                    "L'histoire du vendeur ne colle pas avec les dates de propriété de CarJam",
                                    "« Mon pote mécano l'a déjà vérifié » est proposé à la place de documents",
                                    "Une remise spéciale n'apparaît que si tu paies cash aujourd'hui",
                                    "Les VIN du pare-brise, du montant de porte et des papiers ne concordent pas tous"
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bon à savoir",
                                "text": "Sur Kiwi Van Market, le WOF, la REGO et le statut self-contained figurent sur chaque annonce, avec un bouton CarJam dès que la plaque est fournie — les vérifications ennuyeuses se font depuis ton lit, avant d'avoir dépensé un dollar d'essence."
                            },
                            {
                                "type": "cta",
                                "text": "Parcours les campervans avec les papiers affichés d'emblée",
                                "to": "/"
                            }
                        ]
                    },
                    {
                        "title": "FAQ",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Faut-il venir accompagné à une visite de van ?",
                                        "a": "Si tu peux, oui. Une deuxième personne observe les réactions du vendeur pendant que tu observes le van — et les techniques de pression se dégonflent vite devant un public. Seul ? Appelle un ami pendant la visite et réfléchis à voix haute."
                                    },
                                    {
                                        "q": "Un scanner OBD2 bon marché vaut-il l'achat ?",
                                        "a": "Pour environ 30 $, absolument. Branché sous le tableau de bord, il lit les codes défaut enregistrés en quelques minutes et repère l'astuce classique du voyant effacé le matin de la vente. Il ne remplace pas un mécano — il décide si tu en as besoin."
                                    },
                                    {
                                        "q": "Combien de temps prévoir pour une vraie visite ?",
                                        "a": "Quatre-vingt-dix minutes minimum : quinze à prendre du recul et faire le tour, trente sur les systèmes et les papiers, trente sur la route, et de la marge pour réfléchir sans pression. Quiconque te presse répond à une question que tu n'as pas posée."
                                    },
                                    {
                                        "q": "Est-il normal de laisser un acompte ?",
                                        "a": "Seulement après une inspection qui te satisfait, seulement avec un reçu écrit indiquant le montant et les conditions, et jamais pour « réserver » un van que tu n'as pas vu en personne. Pour le solde, un virement bancaire fait sur place vaut mieux que du cash — il écrit son propre reçu."
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        'wof-rego-ruc-insurance-nz': {
            "title": "WOF, REGO, RUC et assurance en Nouvelle-Zélande : les règles du van, en clair",
            "description": "Les quatre règles véhicule que tout voyageur en campervan doit comprendre en NZ — ce qu'elles coûtent, quand elles sont dues, et les amendes en cas d'erreur. En français simple.",
            "heroImage": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200",
            "content": {
                "intro": "Quatre sigles régissent ta vie en van en Nouvelle-Zélande : WOF, REGO, RUC et (officieusement) ACC. Maîtrise-les et tu n'y penseras plus jamais. Rate-les et tu risques des amendes, un van que tu ne peux pas conduire légalement, ou des dettes héritées du précédent propriétaire. Voici chacun, en clair, avec de vrais chiffres.",
                "sections": [
                    {
                        "title": "WOF — le Warrant of Fitness",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Ce que c'est",
                                "text": "Le WOF est le contrôle technique de sécurité périodique néo-zélandais. Il vérifie freins, pneus, feux, direction, ceintures, rouille et plus encore. Sans WOF à jour, tu ne peux pas conduire légalement — et ton assurance peut refuser d'indemniser."
                            },
                            {
                                "type": "table",
                                "title": "À quelle fréquence un WOF est-il dû ?",
                                "headers": [
                                    "Véhicule",
                                    "Fréquence du WOF"
                                ],
                                "rows": [
                                    [
                                        "Immatriculé pour la première fois après le 1ᵉʳ janvier 2000",
                                        "Tous les 12 mois"
                                    ],
                                    [
                                        "Immatriculé avant 2000 (la plupart des vans backpackers pas chers !)",
                                        "Tous les 6 mois"
                                    ],
                                    [
                                        "Véhicules neufs",
                                        "Premier WOF à 3 ans"
                                    ]
                                ],
                                "caption": "Un contrôle coûte 60–80 $ chez VTNZ, AA ou la plupart des garages, et prend environ 45 minutes."
                            },
                            {
                                "title": "Et s'il échoue ?",
                                "text": "Tu reçois la liste de ce qu'il faut réparer, et tu ne peux légalement conduire que pour aller réparer et repasser le contrôle. La plupart des centres offrent une contre-visite gratuite ou peu chère sous 28 jours. C'est pour ça qu'un van au WOF presque expiré vaut moins : tu hérites du pari.",
                                "expertTip": "💡 Tu achètes ? Un WOF récent de VTNZ ou AA pèse plus lourd qu'un WOF d'un garage inconnu — et 3 mois restants minimum devrait être ta règle."
                            }
                        ]
                    },
                    {
                        "title": "REGO — l'immatriculation",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "Ce que c'est",
                                "text": "La REGO est la redevance pour circuler sur les routes publiques, matérialisée par l'étiquette sur ton pare-brise. Tu l'achètes par blocs de 3, 6 ou 12 mois, en ligne sur nzta.govt.nz ou à NZ Post — ça prend cinq minutes."
                            },
                            {
                                "type": "table",
                                "title": "Ce que coûte la REGO (van type)",
                                "headers": [
                                    "Type de véhicule",
                                    "Coût annuel approximatif"
                                ],
                                "rows": [
                                    [
                                        "Van ou voiture essence",
                                        "100–110 $"
                                    ],
                                    [
                                        "Van diesel",
                                        "Moins cher pour la REGO elle-même — mais tu paies la RUC en plus (section suivante)"
                                    ]
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ À l'achat d'un van",
                                "text": "Vérifie que la REGO n'est pas « on hold » (un vendeur peut la suspendre pour économiser pendant la vente). La réactiver est facile mais c'est TON coût, et rouler pendant qu'elle est suspendue, c'est une amende de 200 $."
                            }
                        ]
                    },
                    {
                        "title": "RUC — Road User Charges (diesel uniquement)",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Ce que c'est",
                                "text": "Les véhicules essence paient la taxe routière à la pompe. Les diesels la paient à part : les Road User Charges, achetées par blocs de 1 000 km (environ 76 $ chacun) en ligne sur nzta.govt.nz. Ton étiquette de pare-brise indique le kilométrage jusqu'auquel tu as payé."
                            },
                            {
                                "title": "Le calcul pour un trajet type",
                                "text": "Une boucle de 10 000 km île du Sud + île du Nord dans un van diesel coûte environ 760 $ de RUC en plus du carburant. Le diesel est moins cher au litre, donc sur les longs trajets il peut quand même gagner — mais pour la plupart des itinéraires backpackers sous 15 000 km, la simplicité de l'essence vaut plus que les économies du diesel."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Le piège qui coince les acheteurs",
                                "text": "La RUC impayée suit le VÉHICULE, pas le vendeur. Avant d'acheter tout van diesel, compare le compteur avec la distance RUC achetée — l'écart est une dette dont tu es sur le point d'hériter."
                            }
                        ]
                    },
                    {
                        "title": "Assurance & ACC — ce qui est vraiment couvert",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "La surprise : l'assurance n'est pas obligatoire",
                                "text": "La Nouvelle-Zélande n'impose pas d'assurance auto. Mais avant de te réjouir : si tu causes un accident sans assurance, tu dois personnellement les dégâts — et emboutir un pick-up à 80 000 $ est une vraie possibilité. C'est pour ça que quasiment tous les voyageurs prennent au moins une couverture au tiers."
                            },
                            {
                                "type": "table",
                                "title": "Tes trois options",
                                "headers": [
                                    "Couverture",
                                    "Protège",
                                    "Coût annuel typique"
                                ],
                                "rows": [
                                    [
                                        "Au tiers",
                                        "Les véhicules et biens des autres (pas ton van)",
                                        "300–600 $"
                                    ],
                                    [
                                        "Au tiers, incendie & vol",
                                        "Ci-dessus + ton van s'il est volé ou brûlé",
                                        "400–700 $"
                                    ],
                                    [
                                        "Tous risques",
                                        "Tout, y compris tes propres dégâts en cas d'accident",
                                        "700 $+ — rarement rentable sur un van à 6 000 $"
                                    ]
                                ],
                                "caption": "Les permis étrangers sont acceptés par les assureurs néo-zélandais classiques ; tu peux souscrire en ligne avec un passeport et une adresse en NZ."
                            },
                            {
                                "title": "Et l'ACC ?",
                                "text": "L'Accident Compensation Corporation néo-zélandaise couvre les soins des BLESSURES pour tout le monde en NZ — touristes compris — quelle que soit la responsabilité. C'est réel et gratuit. Mais ça couvre les personnes, pas les biens : tes frais médicaux après un accident, oui ; ton van ou l'autre voiture, non. L'ACC, c'est pourquoi l'assurance voyage et l'assurance véhicule comptent quand même."
                            }
                        ]
                    },
                    {
                        "title": "Amendes & pénalités : l'antisèche",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "type": "checklist",
                                "title": "Ce que ça coûte de se tromper",
                                "items": [
                                    "Conduire sans WOF à jour : 200 $ d'amende — et ton assurance peut refuser les sinistres",
                                    "REGO expirée ou « on hold » : 200 $ d'amende",
                                    "RUC impayée : mise à la charge du véhicule, plus pénalités",
                                    "Freedom camping sans certification (là où elle est requise) : jusqu'à 400 $",
                                    "Pas d'assurance : pas d'amende — mais un seul accident responsable peut te coûter des dizaines de milliers"
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Prêt à acheter ? Lis le guide d'achat complet, étape par étape",
                                "to": "/guide/buying-campervan-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Tu vas à une inspection ? Prends la checklist en 30 points",
                                "to": "/guide/campervan-buyer-checklist"
                            }
                        ]
                    },
                    {
                        "title": "FAQ",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Puis-je conduire un van avec un WOF expiré ?",
                                        "a": "Uniquement directement vers un centre de contrôle ou un garage pour des réparations prévues. Ailleurs, tu risques 200 $ d'amende — et l'annulation de la plupart des assurances."
                                    },
                                    {
                                        "q": "Que veut dire « REGO on hold » à l'achat d'un van ?",
                                        "a": "Le vendeur a suspendu l'immatriculation pour économiser. Le van ne peut légalement pas rouler avant réactivation (facile, en ligne, mais à ta charge) — et il peut lui falloir un nouveau WOF avant."
                                    },
                                    {
                                        "q": "Comment acheter de la RUC pour un van diesel ?",
                                        "a": "En ligne sur nzta.govt.nz ou à NZ Post, par blocs de 1 000 km (~76 $). Achètes-en assez pour couvrir ta distance prévue ; la RUC non utilisée peut être remboursée à la revente."
                                    },
                                    {
                                        "q": "Un étranger peut-il obtenir une assurance véhicule en NZ ?",
                                        "a": "Oui — les assureurs classiques couvrent les conducteurs avec permis étranger ou permis international. Tu souscris en ligne en environ 20 minutes avec un passeport et une adresse en NZ (ton auberge convient)."
                                    },
                                    {
                                        "q": "L'ACC remplace-t-elle l'assurance voyage ?",
                                        "a": "Non. L'ACC couvre les blessures d'accident en NZ pour tous, mais pas la maladie, ni tes affaires, ni ton van, ni la responsabilité civile. Garde ton assurance voyage, et mets une couverture au tiers sur le van."
                                    }
                                ]
                            }
                        ]
                    }
                ]
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
            heroImage: '/top10-van.avif',
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
            "title": "Comprar una campervan en Nueva Zelanda: la guía para mochileros (2026)",
            "description": "Precios reales, una rutina de inspección paso a paso, el WOF, la REGO, el seguro y las reglas self-contained — todo para comprar una furgoneta en Nueva Zelanda sin que te engañen.",
            "heroImage": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200",
            "content": {
                "intro": "Acabas de aterrizar en Auckland, todos en el hostel hablan de comprar una van y no sabes por dónde empezar. Buenas noticias: en los próximos 15 minutos tendrás el panorama completo — precios reales, un método de inspección probado, las estafas que esquivar y los papeles exactos. Es la guía que nos habría gustado tener antes de nuestro primer viaje por NZ.",
                "sections": [
                    {
                        "title": "Empieza aquí: lo básico en 5 minutos",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "¿Por qué comprar en vez de alquilar?",
                                "text": "Alquilar cuesta 60–150 $ al día. Comprar una van de 7.000 $ para 6 meses y revenderla por 6.000 $ te sale a unos 5 $ al día, más combustible. Por eso casi todos los mochileros de larga estancia compran — y con una reventa inteligente, algunos hasta recuperan lo invertido. La trampa: el ahorro solo funciona si compras una van sana. De eso trata el resto de esta guía."
                            },
                            {
                                "type": "table",
                                "title": "La jerga neozelandesa, descifrada",
                                "headers": [
                                    "Término",
                                    "Qué significa",
                                    "Por qué te importa"
                                ],
                                "rows": [
                                    [
                                        "WOF",
                                        "Warrant of Fitness — la inspección técnica de seguridad periódica obligatoria",
                                        "Sin WOF válido = no puedes conducir legalmente"
                                    ],
                                    [
                                        "REGO",
                                        "La matrícula, que se paga para circular por las vías públicas",
                                        "Se vende por 3, 6 o 12 meses (~100 $/año para vans de gasolina)"
                                    ],
                                    [
                                        "RUC",
                                        "Road User Charges — un impuesto por km que solo pagan los diésel",
                                        "Unos 76 $ por cada 1.000 km, además del combustible"
                                    ],
                                    [
                                        "Self-contained",
                                        "Certificada con inodoro + depósitos de agua (pegatina verde o azul)",
                                        "Exigida para la mayoría del freedom camping"
                                    ],
                                    [
                                        "CarJam",
                                        "Un informe de historial del vehículo en línea",
                                        "Revela deudas, fraude en el cuentakilómetros y vehículos robados"
                                    ],
                                    [
                                        "PPSR",
                                        "Personal Property Securities Register — el registro oficial de deudas",
                                        "Una comprobación de 3 $ que te evita heredar el crédito de otro"
                                    ]
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bueno saberlo",
                                "text": "NO necesitas ser residente neozelandés para comprar un vehículo. Un pasaporte y una dirección local (tu hostel sirve) bastan. La mayoría de los mochileros conducen con su carnet de origen o un permiso internacional — solo asegúrate de que sea válido en inglés."
                            },
                            {
                                "title": "¿Cuánto tarda?",
                                "text": "Calcula 3 a 7 días en una ciudad grande: un par de días mirando anuncios, algunas visitas, una inspección mecánica y 15 minutos de papeleo. Lanzarte el primer día es justo como la gente acaba comprando una chatarra.",
                                "expertTip": "Reserva tu primera semana de alojamiento en Auckland o Christchurch — ahí está la oferta de vans."
                            },
                            {
                                "type": "cta",
                                "text": "Mira lo que hay en venta ahora mismo en toda Nueva Zelanda",
                                "to": "/"
                            }
                        ]
                    },
                    {
                        "title": "Lo que cuesta de verdad una campervan",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "type": "table",
                                "title": "Tramos de precio en el mercado mochilero (NZD)",
                                "headers": [
                                    "Presupuesto",
                                    "Lo que obtienes",
                                    "Ojo con"
                                ],
                                "rows": [
                                    [
                                        "Menos de 4.000 $",
                                        "Monovolúmenes viejos (Estima, Serena, Odyssey) con un colchón detrás",
                                        "Muchos km, óxido, WOF corto — la inspección es innegociable"
                                    ],
                                    [
                                        "4.000–8.000 $",
                                        "Las vans mochileras clásicas: Hiace, Bongo, Vanette, L300 — a menudo self-contained",
                                        "La mejor relación calidad-precio; verifica que la certificación sea auténtica"
                                    ],
                                    [
                                        "8.000–15.000 $",
                                        "Vans más nuevas y bien equipadas: solar, nevera, aislamiento",
                                        "Paga por lo que TE ayuda a viajar, no por las lucecitas"
                                    ],
                                    [
                                        "15.000 $ y +",
                                        "Vans de techo alto, Delica 4x4, pequeñas autocaravanas",
                                        "Más difíciles de revender rápido al final del viaje"
                                    ]
                                ],
                                "caption": "Como referencia: el anuncio medio en Kiwi Van Market ronda los 8.000–10.000 $."
                            },
                            {
                                "type": "checklist",
                                "title": "✅ Checklist rápida: los costes ocultos que se olvidan la primera vez",
                                "items": [
                                    "Seguro: 300–600 $/año (a terceros es el estándar mochilero)",
                                    "Prueba WOF: 60–80 $ cada vez",
                                    "REGO: unos 100 $/año para una van de gasolina",
                                    "RUC (solo diésel): ~76 $ por cada 1.000 km",
                                    "Inspección mecánica pre-compra: 150–180 $ — el mejor dinero que gastarás",
                                    "Ferry del estrecho de Cook con van: 250–450 $ ida y vuelta",
                                    "Un fondo de emergencia de 1.000 $ para reparaciones (batería, neumáticos, bomba de agua)"
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Error común",
                                "text": "Gastar hasta el último dólar en la propia van. Guarda 1.000 $ para imprevistos — una batería, un neumático, una bomba de agua. Una avería con la cuenta a cero es como los viajes terminan antes de tiempo."
                            },
                            {
                                "title": "¿Se puede negociar? (Sí. Con educación.)",
                                "text": "Casi todo precio anunciado tiene un 10–15 % de margen — más al final de temporada, cuando los vendedores tienen un vuelo que coger. Apóyate en cosas reales: vencimiento del WOF, desgaste de neumáticos, kilometraje, una batería auxiliar cansada. Efectivo hoy vale más que promesas mañana.",
                                "expertTip": "💡 Pregunta cuándo se va el vendedor. Tres días antes del vuelo, una van de 8.500 $ se convierte en una de 7.200 $."
                            },
                            {
                                "title": "¿Gasolina o diésel? Las cuentas honestas",
                                "text": "El diésel es más barato en el surtidor pero paga RUC (~76 $ por 1.000 km) y sus revisiones cuestan más. La gasolina es más simple: sin RUC, mantenimiento más barato, y para un viaje típico de 10.000–15.000 km la diferencia de coste total es pequeña. Regla general: por debajo de 15.000 km, la gasolina suele ganar en simplicidad."
                            }
                        ]
                    },
                    {
                        "title": "Dónde comprar (y dónde tener cuidado)",
                        "icon": "MapPin",
                        "items": [
                            {
                                "type": "table",
                                "title": "Tus opciones, comparadas con honestidad",
                                "headers": [
                                    "Dónde",
                                    "Ventajas",
                                    "Inconvenientes"
                                ],
                                "rows": [
                                    [
                                        "Marketplaces online (como Kiwi Van Market)",
                                        "Fotos, WOF/REGO a la vista, botón de historial CarJam, chat directo con el dueño",
                                        "Las vans populares vuelan — revisa a diario"
                                    ],
                                    [
                                        "Grupos de Facebook para mochileros",
                                        "Mucho volumen, existen chollos reales",
                                        "Cero verificación, estafas, la mitad ya están vendidas"
                                    ],
                                    [
                                        "Mercados de coches mochileros",
                                        "Ver muchas vans en una mañana",
                                        "Vendedores disfrazados de viajeros, tarifas de entrada"
                                    ],
                                    [
                                        "Concesionarios",
                                        "Garantías al consumidor, menos riesgo",
                                        "20–40 % más caros, pocas vans mochileras de verdad"
                                    ]
                                ]
                            },
                            {
                                "title": "El momento lo es todo",
                                "text": "Compra donde aterrizan los viajeros: Auckland todo el año, Christchurch para la Isla Sur. Y compra cuando se van — de febrero a abril el mercado se llena de vans de mochileros que regresan. De octubre a diciembre es mercado de vendedor: llega pronto o paga más."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Las estafas clásicas",
                                "text": "Un « amigo en el extranjero » que enviará la van tras una señal. Un vendedor que rechaza una inspección mecánica. Un precio muy por debajo del mercado con presión para decidir hoy. Una petición de depósito solo para « reservar » una van que no has visto. Cualquiera de estas señales: márchate. Siempre hay otra van."
                            }
                        ]
                    },
                    {
                        "title": "La inspección de 30 minutos que te ahorra miles",
                        "icon": "Shield",
                        "items": [
                            {
                                "type": "image",
                                "url": "/van_inspection_expert_1772133711431.png",
                                "caption": "Revisa siempre el aceite ANTES de que el motor se caliente — un arranque en frío dice la verdad."
                            },
                            {
                                "title": "La prueba de la mayonesa (30 segundos, decisiva)",
                                "text": "Abre el tapón del aceite. Una pasta lechosa, tipo mayonesa, bajo el tapón suele significar que la junta de culata está muerta — una reparación de 2.000 $+ en una van de 5.000 $. Cierra el capó, da las gracias y vete."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Arranque en frío",
                                        "text": "Pide al vendedor que NO caliente el motor antes de que llegues. Un motor precalentado es el truco más viejo para ocultar arranques difíciles."
                                    },
                                    {
                                        "title": "Observa el escape",
                                        "text": "Humo blanco o azul al arrancar indica problemas de motor. Una nubecilla de vapor en una mañana fría es normal; una nube que no para, no."
                                    },
                                    {
                                        "title": "Historial de la correa de distribución",
                                        "text": "Crucial en la Hiace y muchos diésel. Pregunta cuándo se cambió por última vez y a qué kilometraje — si esa correa se rompe en marcha, puede llevarse todo el motor. ¿Sin prueba del cambio en una van de muchos km? Presupuesta el trabajo o baja tu oferta."
                                    },
                                    {
                                        "title": "Frenos",
                                        "text": "Frenada en línea recta desde 50 km/h: sin chirridos, sin tirar hacia un lado, pedal firme."
                                    },
                                    {
                                        "title": "Caja de cambios",
                                        "text": "Prueba cada marcha — incluida la reversa. Ruidos o titubeos son una factura de reparación en espera."
                                    },
                                    {
                                        "title": "Dirección a velocidad",
                                        "text": "Llévala a la autovía. Cualquier vibración a 100 km/h apunta a alineación, neumáticos o suspensión."
                                    },
                                    {
                                        "title": "El óxido — el asesino neozelandés",
                                        "text": "Pasos de rueda, juntas de las ventanas, bajo la moqueta y por debajo de la van. El óxido superficial en las chapas se gestiona; el óxido en los largueros o el piso, te vas."
                                    },
                                    {
                                        "title": "Suspensión",
                                        "text": "Pasa despacio un badén y escucha golpeteos. Empuja hacia abajo cada esquina — debe asentarse, no rebotar."
                                    },
                                    {
                                        "title": "Todo lo eléctrico",
                                        "text": "Ventanillas, luces, limpiaparabrisas, radio, puertos USB, luces interiores. Los fallos pequeños revelan cómo se cuidó la van."
                                    },
                                    {
                                        "title": "Sistemas de agua y moho",
                                        "text": "Abre los grifos, mira bajo el fregadero, levanta el colchón. Cercos marrones en el techo y olor a humedad = entrada de agua."
                                    },
                                    {
                                        "title": "Neumáticos",
                                        "text": "Desgaste irregular en la banda = problemas de alineación o suspensión. Un juego de cuatro neumáticos de van cuesta 600–1.000 $."
                                    },
                                    {
                                        "title": "El VIN coincide en todas partes",
                                        "text": "Compara el VIN del salpicadero, el marco de la puerta y los papeles. Diferencias pueden indicar historial de accidente o vehículo robado."
                                    }
                                ]
                            },
                            {
                                "title": "Luego paga a un profesional — siempre",
                                "text": "Una inspección pre-compra en VTNZ, AA o cualquier taller cuesta 150–180 $. Suben la van a un elevador y encuentran lo que físicamente no puedes ver. Un vendedor que rechaza una inspección te lo está diciendo todo.",
                                "expertTip": "🎯 Pasa la matrícula por CarJam antes incluso de desplazarte a una visita — una deuda sobre una van pasa a ser TU problema tras la compra."
                            },
                            {
                                "type": "cta",
                                "text": "Consigue la checklist completa de comprador en 30 puntos, imprimible",
                                "to": "/guide/campervan-buyer-checklist"
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bueno saberlo",
                                "text": "En Kiwi Van Market, cada anuncio muestra el vencimiento del WOF y la REGO, e incluye un botón de historial CarJam cuando el vendedor facilita la matrícula — así puedes hacer las dos grandes comprobaciones antes incluso de contactar a nadie."
                            }
                        ]
                    },
                    {
                        "title": "Papeleo: legal en 15 minutos",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "La buena noticia",
                                "text": "Nueva Zelanda hace el papeleo del vehículo realmente fácil. Sin notario, sin abogado, sin esperas de semanas. Seis pasos, resueltos el mismo día, casi todos gratis."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Haz las comprobaciones de historial",
                                        "text": "CarJam con el número de matrícula (estado de robo, historial del cuentakilómetros, registro del WOF), más una comprobación PPSR de 3 $ con el VIN — si aún hay financiación pendiente, el prestamista puede embargar la van en TU poder tras la compra."
                                    },
                                    {
                                        "title": "Verifica WOF y REGO",
                                        "text": "Al menos 3 meses de WOF restantes (o recién pasado), y REGO al día — no « on hold ». Ambos visibles en el parabrisas y en el anuncio."
                                    },
                                    {
                                        "title": "Redacta un recibo",
                                        "text": "Precio, fecha, ambos nombres y números de pasaporte, matrícula y VIN, las palabras « sold as seen » (vendido tal cual). Dos copias, firmadas por ambos. Cinco minutos que zanjan cualquier disputa futura."
                                    },
                                    {
                                        "title": "Transferid la propiedad JUNTOS",
                                        "text": "Ambos hacéis el cambio de titular en línea en nzta.govt.nz (o en cualquier NZ Post) el día de la compra. Unos 9 $, con tu pasaporte y una dirección — tu hostel sirve."
                                    },
                                    {
                                        "title": "Activa el seguro antes de arrancar",
                                        "text": "Un seguro a terceros se hace en 20 minutos en línea y funciona con carnet extranjero. Conducir sin seguro es apostar todo tu viaje a un solo cruce."
                                    },
                                    {
                                        "title": "Compra RUC si es diésel",
                                        "text": "Compara el cuentakilómetros con la distancia RUC ya comprada. La RUC impagada pasa a ser tu deuda. Recarga en línea en nzta.govt.nz en bloques de 1.000 km."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Error común",
                                "text": "Pagar ahora y « arreglar los papeles luego ». Si el vendedor nunca tramita la transferencia, sus multas de velocidad pasan a ser tuyas — y legalmente, la van puede que ni siquiera sea tuya. El mismo día, juntos, sin excepciones."
                            },
                            {
                                "type": "cta",
                                "text": "¿WOF, REGO y RUC te suenan a chino? Lee la guía de reglas en claro",
                                "to": "/guide/wof-rego-ruc-insurance-nz"
                            }
                        ]
                    },
                    {
                        "title": "Self-contained: tu billete al camping gratis",
                        "icon": "Star",
                        "items": [
                            {
                                "type": "image",
                                "url": "/self_contained_sticker_van_1772133744005.png",
                                "caption": "La pegatina de certificación: tu llave para el freedom camping legal."
                            },
                            {
                                "title": "Qué significa de verdad la pegatina",
                                "text": "Una van certificada self-contained lleva agua limpia, un depósito de aguas grises y un inodoro. Desde el cambio de norma, las nuevas certificaciones (pegatina verde) exigen inodoro fijo — las antiguas de pegatina azul van desapareciendo según caducan. El certificado pertenece al vehículo y tiene fecha de vencimiento."
                            },
                            {
                                "title": "Por qué vale dinero de verdad",
                                "text": "Sin certificación, pagarás 20–50 $ por noche en campings. Con ella, miles de sitios de freedom camping legales pasan a ser gratis. En 4 meses son fácilmente 1.500 $+ ahorrados — y las vans certificadas se revenden más rápido y a mejor precio."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Error común",
                                "text": "Fiarte de la palabra « self-contained » en un anuncio. Pide VER el certificado y comprueba su vencimiento — luego verifica el número de certificación. Una multa de 400 $ por freedom camping arruina una buena semana."
                            },
                            {
                                "title": "Descarga estas dos apps esta noche",
                                "text": "CamperMate y Rankers muestran cada sitio de acampada legal, punto de vaciado y ducha pública del país, con reseñas de otros viajeros. Son gratis, y así es como todo el mundo encuentra de verdad dónde dormir."
                            }
                        ]
                    },
                    {
                        "title": "Venderla al irte (piénsalo ya)",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Tu plan de salida empieza en la compra",
                                "text": "La van que compras hoy es la que deberás vender en 6 meses, desde la ciudad de la que vueles. Los modelos populares — Hiace, Bongo, L300 — con WOF, REGO y certificación self-contained válidos, se venden en días. Las vans raras o cansadas se venden en semanas, bajo presión, a pérdida."
                            },
                            {
                                "title": "La máquina de dinero estacional",
                                "text": "Compra en Christchurch en marzo a un mochilero que se va (temporada baja, precio bajo). Vende en Auckland en noviembre a uno que llega (temporada alta, precio alto). Los viajeros que siguen este calendario revenden a menudo por MÁS de lo que pagaron."
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bueno saberlo",
                                "text": "Publicar tu van en Kiwi Van Market es gratis, sin comisión — y puedes ofrecer un pacto de recompra para destacar tu anuncio. Ponlo en línea 3–4 semanas antes de tu vuelo, no 3 días."
                            },
                            {
                                "type": "cta",
                                "text": "Publica tu van gratis — sin comisión, contacto directo con compradores",
                                "to": "/sell"
                            }
                        ]
                    },
                    {
                        "title": "FAQ: respuestas rápidas",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "¿Puede un extranjero comprar una campervan en Nueva Zelanda?",
                                        "a": "Sí. No necesitas residencia ni carnet neozelandés: un pasaporte y una dirección local (tu hostel cuenta) bastan para comprar y matricular un vehículo. La mayoría de los mochileros conducen con su carnet de origen o un permiso internacional."
                                    },
                                    {
                                        "q": "¿Qué presupuesto prever para una campervan mochilera?",
                                        "a": "La mayoría de los viajeros gastan 5.000–10.000 NZ$. Existen vans sólidas por menos de 4.000 $ pero exigen una inspección rigurosa. El anuncio medio en Kiwi Van Market ronda los 8.000–10.000 $."
                                    },
                                    {
                                        "q": "¿Es obligatorio el seguro del coche en Nueva Zelanda?",
                                        "a": "No — pero el seguro a terceros (300–600 $/año) es el estándar mochilero. Cubre el coche caro que podrías golpear; saltártelo es apostar todo tu viaje a un solo cruce."
                                    },
                                    {
                                        "q": "¿Campervan de gasolina o diésel?",
                                        "a": "El diésel es más barato en el surtidor pero paga Road User Charges (unos 76 $ por 1.000 km) y sus revisiones cuestan más. Si vas a conducir menos de ~15.000 km, la gasolina suele ganar en simplicidad."
                                    },
                                    {
                                        "q": "¿Qué es un WOF y cada cuánto lo necesito?",
                                        "a": "El Warrant of Fitness es la inspección de seguridad periódica de Nueva Zelanda: cada 12 meses para vehículos matriculados después de 2000, cada 6 meses para los más antiguos. Compra una van con al menos 3 meses de WOF restantes."
                                    },
                                    {
                                        "q": "¿Qué es una comprobación PPSR?",
                                        "a": "Una búsqueda de 3 $ en el Personal Property Securities Register (ppsr.govt.nz) con el VIN. Te dice si aún hay financiación pendiente sobre el vehículo — si la hay, el prestamista puede embargar la van incluso después de que la hayas pagado."
                                    },
                                    {
                                        "q": "¿Puedo dormir en cualquier sitio con mi van?",
                                        "a": "No. El freedom camping solo es legal en zonas permitidas, y normalmente solo para vehículos certificados self-contained. Las multas llegan a 400 $. CamperMate y Rankers muestran gratis cada sitio legal."
                                    },
                                    {
                                        "q": "¿Qué pasa si mi van se avería?",
                                        "a": "La membresía AA (~99 $/año) te da asistencia en carretera por todo el país — la mayoría de los mochileros la consideran esencial. Guarda un colchón de 1.000 $: baterías, neumáticos y bombas de agua son los sospechosos habituales en vans viejas."
                                    },
                                    {
                                        "q": "¿En cuánto tiempo puedo vender mi van al final del viaje?",
                                        "a": "Con un precio justo, fotos honestas y papeles válidos: unos días en temporada alta (octubre–diciembre), dos a cuatro semanas el resto. Publícala 3–4 semanas antes de tu vuelo."
                                    },
                                    {
                                        "q": "¿Dónde compruebo el historial de una van antes de comprar?",
                                        "a": "CarJam, con el número de matrícula: revela deudas, estado de robo, lecturas del cuentakilómetros e historial de importación. En Kiwi Van Market, el botón CarJam está en el anuncio en cuanto el vendedor facilita la matrícula."
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        'campervan-buyer-checklist': {
            "title": "Checklist de inspección de una van de segunda mano en NZ: cómo revisarla antes de comprar",
            "description": "Una rutina pre-compra cronológica para campervans en Nueva Zelanda — los deberes la noche antes, los primeros minutos en el sitio, la vuelta al vehículo, la prueba de conducción y la entrega. Versión imprimible gratis.",
            "heroImage": "/van_inspection_expert_1772133711431.png",
            "content": {
                "intro": "Cada hostel tiene su historia: alguien que compró una van el segundo día y luego pasó la tercera semana pagando a un mecánico para que le explicara lo que se le pasó. No evitas convertirte en esa historia con suerte — la evitas con un método. Esta checklist sigue una visita real en el orden en que ocurre de verdad: los deberes la noche antes, los primeros minutos en el sitio, la vuelta al vehículo, la prueba de conducción, y el cuarto de hora en que el dinero y los papeles cambian de manos. Ve marcando y, al final, conocerás la van mejor de lo que el vendedor espera.",
                "sections": [
                    {
                        "title": "La noche antes: deberes desde el hostel",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Veinte minutos en el móvil, miles de dólares protegidos",
                                "text": "La mayoría de los desastres se ven en línea antes de gastar un dólar en gasolina. Hazlo desde tu litera, la noche antes de la visita."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "La matrícula en CarJam",
                                        "text": "El informe de historial muestra el número de dueños, las lecturas del cuentakilómetros en el tiempo y el registro de WOF (aprobados/fallidos). Una van que falló su último WOF y salió a la venta justo después merece preguntas afiladas."
                                    },
                                    {
                                        "title": "El VIN en el PPSR",
                                        "text": "Tres dólares en ppsr.govt.nz te dicen si un prestamista aún tiene un derecho sobre el vehículo. La deuda de financiación viaja con la van — no con el vendedor."
                                    },
                                    {
                                        "title": "Comprueba que el precio tiene sentido",
                                        "text": "Compara la van con anuncios equivalentes: mismo modelo, año, km y certificación parecidos. Un precio muy por debajo del mercado es una pregunta que resolver, no un chollo que agarrar."
                                    },
                                    {
                                        "title": "Envía dos mensajes",
                                        "text": "« ¿Puedes mandarme fotos del libro de mantenimiento? » y « Por favor, no arranques el motor antes de que llegue. » Las respuestas — y su tono — dicen mucho antes incluso de conoceros."
                                    },
                                    {
                                        "title": "Reserva con luz de día y tiempo seco",
                                        "text": "La lluvia favorece la pintura y oculta las manchas de aceite en el suelo. Un hueco por la mañana también hace mucho más probable un arranque en frío de verdad."
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Imprime la versión de bolsillo de esta checklist (gratis, sin registro)",
                                "href": "/checklist-print.html",
                                "download": true
                            }
                        ]
                    },
                    {
                        "title": "Los primeros cinco minutos en el sitio",
                        "icon": "MapPin",
                        "items": [
                            {
                                "title": "Antes de tocar nada, echa el paso atrás",
                                "text": "Las vans hablan, si les das unos metros de distancia y treinta segundos de silencio."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Mira cómo se apoya",
                                        "text": "Una van inclinada hacia una esquina te habla de muelles o suspensión cansados antes de que hayas abierto una puerta."
                                    },
                                    {
                                        "title": "Compara los cuatro neumáticos",
                                        "text": "Cuatro marcas distintas, o delanteros nuevos sobre traseros lisos, describen una van que se mantiene de emergencia en emergencia."
                                    },
                                    {
                                        "title": "Abre la puerta y respira",
                                        "text": "La humedad tiene un olor que no se olvida. El moho tras los paneles se anuncia aquí primero — antes de que tu nariz se acostumbre."
                                    },
                                    {
                                        "title": "Pregunta cuánto tiempo lleva con ella",
                                        "text": "Con naturalidad. Luego, cruza la respuesta con las fechas de propiedad de CarJam. Los vendedores honestos cuentan historias coherentes sin esfuerzo."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "La vuelta al vehículo: carrocería y óxido",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "image",
                                "url": "/van_inspection_expert_1772133711431.png",
                                "caption": "Lleva una linterna. La verdadera historia de la van está escrita por debajo."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Holguras de chapa y tono de pintura",
                                        "text": "Separaciones irregulares entre paneles, o una puerta de un tono algo distinto, apuntan a reparaciones de accidente que nadie mencionó."
                                    },
                                    {
                                        "title": "El truco del imán",
                                        "text": "Envuelve un imán en un trapo y deslízalo por los bajos y los pasos de rueda. Donde deje de pegarse, alguien ha disimulado óxido con masilla."
                                    },
                                    {
                                        "title": "Métete debajo con la linterna",
                                        "text": "Largueros, piso, bajos. Una costra marrón que se descama en algo estructural es para irse; una leve capa superficial en chapas planas es negociación."
                                    },
                                    {
                                        "title": "Gomas de ventanas y juntas del techo",
                                        "text": "Las vans neozelandesas viven fuera, a menudo cerca del aire salino. La pintura que se abomba alrededor del cristal es óxido trabajando de dentro hacia fuera — la dirección cara."
                                    },
                                    {
                                        "title": "Levanta todo lo que se levante",
                                        "text": "Esquinas de moqueta, alfombrillas, la bandeja del maletero. Los pisos se pudren en silencio en la oscuridad, y un vistazo de dos segundos no cuesta nada."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Capó arriba, luego la prueba de conducción",
                        "icon": "Car",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Confirma que el arranque en frío es frío",
                                        "text": "Toca el capó antes de que nadie gire la llave — debe estar helado. Un arranque largo, un ralentí irregular o humo que no para son conversaciones de motor, no detalles."
                                    },
                                    {
                                        "title": "Tapón, varilla, refrigerante",
                                        "text": "Un residuo cremoso bajo el tapón del aceite apunta a la junta de culata — en una van vieja, esa reparación suele costar más de lo que vale la van. El aceite debe ser oscuro pero limpio; el refrigerante de su color correcto y nunca aceitoso."
                                    },
                                    {
                                        "title": "Haz la pregunta de la correa de distribución",
                                        "text": "En vans japonesas de muchos km, pregunta cuándo se cambió por última vez la correa y consíguelo por escrito si es posible. Si esa correa se rompe a mitad de viaje, puede destrozar el motor — sin recibo, metes el trabajo en tu oferta."
                                    },
                                    {
                                        "title": "Condúcela como se conduce en Nueva Zelanda",
                                        "text": "Autovía hasta 100 km/h (sin vibración en el volante), una cuesta de verdad si la encuentras (aguja de temperatura estable, potencia que aguanta), un badén despacio (sin golpeteos), y una frenada firme y recta."
                                    },
                                    {
                                        "title": "Radio apagada, ventana medio bajada",
                                        "text": "Escuchas silbidos, golpeteos y roces — una banda sonora es la forma más barata de ocultar los tres."
                                    },
                                    {
                                        "title": "Cada marcha, dos veces",
                                        "text": "Reversa incluida. Titubeos o ruidos entre cambios son dinero de caja de cambios que te ofrecerías a gastar."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bueno saberlo",
                                "text": "Por encima de unos 5.000 $, una inspección pre-compra profesional (150–180 $ en un taller, AA o VTNZ) te da un elevador, ojos entrenados y un informe escrito con el que negociar. Un seguro barato para una decisión grande."
                            }
                        ]
                    },
                    {
                        "title": "El equipamiento camper: prueba, no admires",
                        "icon": "Star",
                        "items": [
                            {
                                "title": "Un montaje bonito vende vans; un montaje que funciona mantiene vivos los viajes",
                                "text": "Las lucecitas son preciosas. La presión del agua, la cerveza fría y los móviles cargados lo son más. Prueba los sistemas como si ya vivieras dentro."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "El certificado en mano, no en el anuncio",
                                        "text": "Para el self-contained, ve el documento real: fecha de vencimiento, y que corresponda a ESTE vehículo. Los anuncios dicen « self-contained »; solo los certificados lo prueban."
                                    },
                                    {
                                        "title": "El agua entra, el agua sale",
                                        "text": "Abre el grifo, mira correr el desagüe, luego abre el armario bajo el fregadero y presiona la madera. La madera blanda recuerda cada fuga pasada."
                                    },
                                    {
                                        "title": "Enchufa tu móvil en cada toma",
                                        "text": "La auditoría más rápida jamás inventada para un sistema de 12 V. Trae tu propio cable."
                                    },
                                    {
                                        "title": "Haz funcionar la nevera y las luces con la batería",
                                        "text": "Motor apagado, diez minutos. Una batería auxiliar sana lo encaja sin inmutarse; una moribunda se hunde a la vista. Pregunta su edad — pasados tres o cuatro años, presupuesta un reemplazo."
                                    },
                                    {
                                        "title": "Haz que « tiene solar » signifique algo",
                                        "text": "Pregunta los vatios del panel y la marca del regulador. Sin números, « solar » puede ser un cargador de mantenimiento y una pegatina optimista."
                                    },
                                    {
                                        "title": "Huele el compartimento del gas",
                                        "text": "Cualquier olor a gas — o una cocina sin certificado de conformidad — es un problema de seguridad antes que de papeleo."
                                    },
                                    {
                                        "title": "Levanta el colchón",
                                        "text": "Los cercos marrones en el contrachapado de debajo son la autobiografía honesta de cada fuga de techo que la van ha tenido."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Dinero y papeleo: los últimos quince minutos",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Relee las dos etiquetas del parabrisas",
                                        "text": "WOF y REGO: ambas al día, e idealmente a meses del vencimiento. Todo lo que esté a punto de caducar es un coste que heredas — dilo, con educación, con una cifra."
                                    },
                                    {
                                        "title": "¿Diésel? Lee la etiqueta RUC",
                                        "text": "La distancia comprada debe cubrir la lectura del cuentakilómetros. Cualquier déficit se convierte en tu factura en el mostrador de NZTA."
                                    },
                                    {
                                        "title": "Redacta el recibo antes de que se mueva el dinero",
                                        "text": "Precio, fecha, ambos nombres y números de pasaporte, matrícula, VIN, las palabras « sold as seen » (vendido tal cual). Dos copias, firmadas por ambos. Cinco minutos que zanjan cualquier disputa futura."
                                    },
                                    {
                                        "title": "Transferid la propiedad juntos, en el momento",
                                        "text": "Diez minutos en línea en nzta.govt.nz, unos 9 $, hechos codo con codo. « Lo arreglamos mañana » es como los viajeros acaban con las multas de un desconocido — o sin la van en absoluto."
                                    },
                                    {
                                        "title": "Asegúrala antes de girar la llave",
                                        "text": "Un seguro a terceros se hace en veinte minutos en línea y acepta carnets extranjeros. El regreso al hostel ya es un trayecto."
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Razones para marcharte",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "title": "Ninguna es un punto de negociación",
                                "text": "Son salidas. El mercado neozelandés de vans siempre tiene otra en venta — esta semana, a precio justo, de alguien recto."
                            },
                            {
                                "type": "checklist",
                                "title": "🚩 Si te encuentras una de estas, vete",
                                "items": [
                                    "No te dejan organizar una inspección independiente — sea cual sea la excusa",
                                    "El calendario hace la venta (« otros dos compradores vienen a las cuatro »)",
                                    "La historia del vendedor no cuadra con las fechas de propiedad de CarJam",
                                    "« Mi colega mecánico ya la revisó » se ofrece en vez de documentos",
                                    "Un descuento especial solo aparece si pagas en efectivo hoy",
                                    "Los VIN del parabrisas, el pilar de la puerta y los papeles no coinciden todos"
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "📝 Bueno saberlo",
                                "text": "En Kiwi Van Market, el WOF, la REGO y el estado self-contained están en cada anuncio, con un botón CarJam cuando se facilita la matrícula — las comprobaciones aburridas se hacen desde tu litera, antes de gastar un dólar en gasolina."
                            },
                            {
                                "type": "cta",
                                "text": "Explora campervans con el papeleo a la vista desde el principio",
                                "to": "/"
                            }
                        ]
                    },
                    {
                        "title": "FAQ",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "¿Debo llevar a alguien a ver una van?",
                                        "a": "Si puedes, sí. Una segunda persona observa las reacciones del vendedor mientras tú observas la van — y las tácticas de presión se desinflan rápido ante público. ¿Solo? Llama a un amigo durante la visita y piensa en voz alta."
                                    },
                                    {
                                        "q": "¿Merece la pena un escáner OBD2 barato?",
                                        "a": "Por unos 30 $, sin duda. Enchufado bajo el salpicadero, lee los códigos de avería guardados en minutos y pilla el truco clásico de borrar un testigo la mañana de la venta. No sustituye a un mecánico — decide si lo necesitas."
                                    },
                                    {
                                        "q": "¿Cuánto tiempo debo dejar para una visita en condiciones?",
                                        "a": "Noventa minutos mínimo: quince tomando distancia y dando la vuelta, treinta en sistemas y papeles, treinta en carretera, y margen para pensar sin presión. Quien te meta prisa responde a una pregunta que no hiciste."
                                    },
                                    {
                                        "q": "¿Es normal dejar una señal?",
                                        "a": "Solo tras una inspección que te convenza, solo con un recibo escrito que indique el importe y las condiciones, y nunca para « reservar » una van que no has visto en persona. Para el resto, una transferencia bancaria en persona es mejor que el efectivo — escribe su propio recibo."
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        },
        'wof-rego-ruc-insurance-nz': {
            "title": "WOF, REGO, RUC y seguro en Nueva Zelanda: las reglas de la van, explicadas simple",
            "description": "Las cuatro reglas de vehículo que todo viajero en campervan debe entender en NZ — cuánto cuestan, cuándo vencen y las multas si te equivocas. En español sencillo.",
            "heroImage": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200",
            "content": {
                "intro": "Cuatro siglas gobiernan tu vida en van en Nueva Zelanda: WOF, REGO, RUC y (extraoficialmente) ACC. Acláralas y no volverás a pensar en ellas. Fállalas y te enfrentas a multas, a una van que no puedes conducir legalmente, o a deudas heredadas del dueño anterior. Aquí tienes cada una, en claro, con cifras reales.",
                "sections": [
                    {
                        "title": "WOF — el Warrant of Fitness",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Qué es",
                                "text": "El WOF es la inspección técnica de seguridad periódica de Nueva Zelanda. Revisa frenos, neumáticos, luces, dirección, cinturones, óxido y más. Sin WOF al día, no puedes conducir legalmente — y tu seguro puede negarse a pagar."
                            },
                            {
                                "type": "table",
                                "title": "¿Cada cuánto toca WOF?",
                                "headers": [
                                    "Vehículo",
                                    "Frecuencia del WOF"
                                ],
                                "rows": [
                                    [
                                        "Matriculado por primera vez después del 1 de enero de 2000",
                                        "Cada 12 meses"
                                    ],
                                    [
                                        "Matriculado antes de 2000 (¡la mayoría de vans mochileras baratas!)",
                                        "Cada 6 meses"
                                    ],
                                    [
                                        "Vehículos nuevos",
                                        "Primer WOF a los 3 años"
                                    ]
                                ],
                                "caption": "Una prueba cuesta 60–80 $ en VTNZ, AA o la mayoría de talleres, y dura unos 45 minutos."
                            },
                            {
                                "title": "¿Y si no pasa?",
                                "text": "Recibes la lista de lo que hay que arreglar, y solo puedes conducir legalmente para ir a repararlo y volver a pasarlo. La mayoría de los centros ofrecen una revisión gratis o barata en 28 días. Por eso una van con el WOF casi vencido vale menos: heredas la apuesta.",
                                "expertTip": "💡 ¿Comprando? Un WOF reciente de VTNZ o AA pesa más que uno de un taller desconocido — y 3 meses restantes debería ser tu mínimo."
                            }
                        ]
                    },
                    {
                        "title": "REGO — la matrícula",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "Qué es",
                                "text": "La REGO es la tasa para circular por las vías públicas, indicada por la etiqueta de tu parabrisas. La compras en bloques de 3, 6 o 12 meses, en línea en nzta.govt.nz o en NZ Post — tarda cinco minutos."
                            },
                            {
                                "type": "table",
                                "title": "Lo que cuesta la REGO (van típica)",
                                "headers": [
                                    "Tipo de vehículo",
                                    "Coste anual aprox."
                                ],
                                "rows": [
                                    [
                                        "Van o coche de gasolina",
                                        "100–110 $"
                                    ],
                                    [
                                        "Van diésel",
                                        "Menos para la REGO en sí — pero pagas RUC aparte (siguiente sección)"
                                    ]
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ Al comprar una van",
                                "text": "Comprueba que la REGO no esté « on hold » (un vendedor puede suspenderla para ahorrar mientras vende). Reactivarla es fácil pero es TU coste, y conducir mientras está suspendida es una multa de 200 $."
                            }
                        ]
                    },
                    {
                        "title": "RUC — Road User Charges (solo diésel)",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Qué es",
                                "text": "Los vehículos de gasolina pagan el impuesto de circulación en el surtidor. Los diésel lo pagan aparte: los Road User Charges, comprados en bloques de 1.000 km (unos 76 $ cada uno) en línea en nzta.govt.nz. Tu etiqueta del parabrisas muestra la lectura del cuentakilómetros hasta la que has pagado."
                            },
                            {
                                "title": "Las cuentas de un viaje típico",
                                "text": "Un bucle de 10.000 km por la Isla Sur y la Norte en una van diésel cuesta unos 760 $ de RUC además del combustible. El diésel es más barato por litro, así que en viajes largos aún puede ganar — pero para la mayoría de los itinerarios mochileros por debajo de 15.000 km, la simplicidad de la gasolina vale más que el ahorro del diésel."
                            },
                            {
                                "type": "callout",
                                "variant": "warning",
                                "title": "⚠️ La trampa que pilla a los compradores",
                                "text": "La RUC impagada sigue al VEHÍCULO, no al vendedor. Antes de comprar cualquier van diésel, compara el cuentakilómetros con la distancia RUC comprada — la diferencia es una deuda que estás a punto de heredar."
                            }
                        ]
                    },
                    {
                        "title": "Seguro & ACC — qué cubre de verdad",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "La sorpresa: el seguro no es obligatorio por ley",
                                "text": "Nueva Zelanda no obliga a tener seguro de coche. Pero antes de celebrarlo: si causas un accidente sin seguro, debes personalmente los daños — y golpear una furgoneta de 80.000 $ es una posibilidad real. Por eso prácticamente todos los viajeros llevan al menos cobertura a terceros."
                            },
                            {
                                "type": "table",
                                "title": "Tus tres opciones",
                                "headers": [
                                    "Cobertura",
                                    "Protege",
                                    "Coste anual típico"
                                ],
                                "rows": [
                                    [
                                        "A terceros",
                                        "Los vehículos y bienes de los demás (no tu van)",
                                        "300–600 $"
                                    ],
                                    [
                                        "A terceros, incendio y robo",
                                        "Lo anterior + tu van si es robada o se quema",
                                        "400–700 $"
                                    ],
                                    [
                                        "A todo riesgo",
                                        "Todo, incluidos tus propios daños en un accidente",
                                        "700 $+ — rara vez rentable en una van de 6.000 $"
                                    ]
                                ],
                                "caption": "Los carnets extranjeros son aceptados por las aseguradoras neozelandesas habituales; puedes contratar en línea con un pasaporte y una dirección en NZ."
                            },
                            {
                                "title": "¿Y el ACC?",
                                "text": "La Accident Compensation Corporation de Nueva Zelanda cubre el tratamiento de LESIONES para todos en NZ — turistas incluidos — con independencia de la culpa. Es real y gratis. Pero cubre personas, no bienes: tus facturas médicas tras un accidente, sí; tu van o el otro coche, no. El ACC es por lo que el seguro de viaje y el de vehículo siguen importando."
                            }
                        ]
                    },
                    {
                        "title": "Multas y sanciones: chuleta",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "type": "checklist",
                                "title": "Lo que cuesta equivocarse",
                                "items": [
                                    "Conducir sin WOF al día: 200 $ de multa — y tu seguro puede rechazar reclamaciones",
                                    "REGO vencida o « on hold »: 200 $ de multa",
                                    "RUC impagada: imputada al vehículo, más penalizaciones",
                                    "Freedom camping sin certificación (donde se exige): hasta 400 $",
                                    "Sin seguro: sin multa — pero un solo accidente con culpa puede costarte decenas de miles"
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "¿Listo para comprar? Lee la guía completa paso a paso",
                                "to": "/guide/buying-campervan-nz"
                            },
                            {
                                "type": "cta",
                                "text": "¿Vas a una inspección? Llévate la checklist de 30 puntos",
                                "to": "/guide/campervan-buyer-checklist"
                            }
                        ]
                    },
                    {
                        "title": "FAQ",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "¿Puedo conducir una van con el WOF vencido?",
                                        "a": "Solo directamente a una estación de inspección o a un taller para reparaciones concertadas. En cualquier otro sitio arriesgas 200 $ de multa — y anula la mayoría de los seguros."
                                    },
                                    {
                                        "q": "¿Qué significa « REGO on hold » al comprar una van?",
                                        "a": "El vendedor suspendió la matrícula para ahorrar. La van no puede conducirse legalmente hasta reactivarla (fácil, en línea, pero a tu coste) — y puede que necesite un WOF nuevo primero."
                                    },
                                    {
                                        "q": "¿Cómo compro RUC para una van diésel?",
                                        "a": "En línea en nzta.govt.nz o en NZ Post, en bloques de 1.000 km (~76 $). Compra suficiente para cubrir tu distancia prevista; la RUC no usada se puede reembolsar al vender."
                                    },
                                    {
                                        "q": "¿Puede un extranjero contratar seguro de vehículo en NZ?",
                                        "a": "Sí — las aseguradoras habituales cubren a conductores con carnet extranjero o permiso internacional. Contratas en línea en unos 20 minutos con un pasaporte y una dirección en NZ (tu hostel sirve)."
                                    },
                                    {
                                        "q": "¿El ACC sustituye al seguro de viaje?",
                                        "a": "No. El ACC cubre lesiones por accidente en NZ para todos, pero no la enfermedad, ni tus pertenencias, ni tu van, ni la responsabilidad civil. Conserva tu seguro de viaje, y pon cobertura a terceros en la van."
                                    }
                                ]
                            }
                        ]
                    }
                ]
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
            heroImage: '/top10-van.avif',
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
