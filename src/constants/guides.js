import { CheckCircle, AlertTriangle, MapPin, Shield, Car, DollarSign, Star } from 'lucide-react';

export const GUIDES = {
    en: {
        'buying-campervan-nz': {
            "title": "How to Buy a Campervan in New Zealand: Checks, Costs & Paperwork",
            "description": "Buy a campervan in NZ with a practical checklist for prices, inspection, WoF, rego, RUC and green-warrant certification. Official sources and handover steps.",
            "heroImage": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "To buy a campervan in New Zealand, compare available vans, check the seller and vehicle history, arrange an independent inspection, agree the purchase in writing and complete the NZTA notification at handover. Budget for ownership as well as the asking price. This guide connects those decisions to the documents and checks you need, with official sources checked on 15 October 2026.",
                "sections": [
                    {
                        "title": "Start with your trip and a realistic ownership budget",
                        "items": [
                            {
                                "title": "Choose the van around how you will use it",
                                "text": "Write down your passenger count, sleeping arrangement, route, parking needs and equipment you will actually use. Compare the cost and complexity of a small people-mover, a medium van and a larger motorhome. Standing room, heating, a fridge and a separate leisure battery can be useful, but an attractive conversion cannot tell you whether the underlying vehicle has been maintained."
                            },
                            {
                                "title": "Calculate the cost of buying versus renting",
                                "text": "For your own comparison, use: purchase price minus eventual resale proceeds, plus inspection, repairs, servicing, insurance, licensing and selling costs. Add fuel, camping and ferry costs to each option consistently. Then divide by the number of travel days. Keep the purchase cash and an emergency reserve available: resale proceeds only arrive at the end, and may be lower than expected."
                            },
                            {
                                "type": "table",
                                "title": "Worked example — assumptions, not market prices or provider quotes",
                                "headers": [
                                    "Assumption",
                                    "NZD"
                                ],
                                "rows": [
                                    [
                                        "Purchase",
                                        "12,000"
                                    ],
                                    [
                                        "Assumed resale proceeds",
                                        "9,500"
                                    ],
                                    [
                                        "Inspection",
                                        "250"
                                    ],
                                    [
                                        "Repairs and servicing",
                                        "1,000"
                                    ],
                                    [
                                        "Insurance",
                                        "600"
                                    ],
                                    [
                                        "Licensing and other administration",
                                        "300"
                                    ],
                                    [
                                        "Net ownership cost for this example",
                                        "4,650"
                                    ]
                                ],
                                "caption": "Over 90 days, these assumptions give NZ$51.67 per day before fuel, campsites and ferries. Change the assumptions using your own quotes. This is not a resale forecast."
                            },
                            {
                                "title": "Use comparable asking prices, then inspect",
                                "text": "Our price page reports the active advertised inventory on Kiwi Van Market, with the sample size and calculation method. Compare the same model, year, kilometres, maintenance history and equipment. A cheap listing with an expensive repair can cost more overall; a high asking price does not prove quality. Obtain repair estimates before negotiating instead of assuming every seller will offer the same percentage discount."
                            },
                            {
                                "type": "cta",
                                "text": "Compare current campervan asking prices and sample size",
                                "to": "/campervan-prices-nz"
                            }
                        ]
                    },
                    {
                        "title": "Find vans you can actually view",
                        "items": [
                            {
                                "title": "Arrange viewings around your arrival city",
                                "text": "Start with Auckland or Christchurch if that fits your route, then broaden the search only when the travel and inspection costs make sense. Ask whether the van is still available, where it can be viewed and when the seller can hand it over. Save the advert and agree an appointment. Leave time for a workshop booking and a second option if the first van is unsuitable."
                            },
                            {
                                "type": "cta",
                                "text": "Browse campervans for sale in Auckland",
                                "to": "/location/auckland"
                            },
                            {
                                "type": "cta",
                                "text": "Browse campervans for sale in Christchurch",
                                "to": "/location/christchurch"
                            },
                            {
                                "title": "Know who is selling",
                                "text": "A marketplace advert does not make a private sale a dealer sale. Consumer Protection explains that private purchases have fewer protections and that the Consumer Guarantees Act generally applies to businesses, not private sellers. Establish the seller’s identity and authority to sell, and retain the advert and written statements."
                            },
                            {
                                "title": "Prepare useful questions before travelling",
                                "text": "Ask for the plate, VIN or chassis number, odometer reading, maintenance invoices and expiry dates on the relevant documents. Request photos of the engine bay, underside and conversion, not just the bed. Ask what is broken, why the van is being sold and whether an independent inspection and a cold start are possible. Treat evasive answers as missing evidence, not reassurance."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "Consumer Protection — Buying privately",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/finding-the-right-car/buying-car-privately"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Check the documents separately",
                        "items": [
                            {
                                "type": "table",
                                "headers": [
                                    "Document or check",
                                    "What to verify"
                                ],
                                "rows": [
                                    [
                                        "WoF / CoF",
                                        "Check the actual inspection document and expiry. A WoF is a safety inspection, not a guarantee of engine or gearbox condition."
                                    ],
                                    [
                                        "Rego",
                                        "This is vehicle licensing, distinct from registration. Confirm it is current; registration records the responsible person, not legal ownership."
                                    ],
                                    [
                                        "RUC, where applicable",
                                        "Check the vehicle’s RUC type, weight and distance licence against its odometer. Diesel and many electric vehicles pay RUC; it is not diesel-only."
                                    ],
                                    [
                                        "PPSR",
                                        "Search the correct identifiers for a registered security interest before agreeing to buy. If an interest exists, resolve it with the lender before completing the purchase."
                                    ],
                                    [
                                        "Service history",
                                        "Match invoices to the vehicle and odometer. Record overdue work and ask the mechanic to check the manufacturer’s maintenance requirements for that engine."
                                    ],
                                    [
                                        "Self-contained certification",
                                        "Read the current certificate and green warrant, not just an advert checkbox. The camping checks are explained below."
                                    ]
                                ]
                            },
                            {
                                "title": "Use current fees and dates",
                                "text": "Check NZTA’s current licensing and RUC information for the actual vehicle. The standard type 1 RUC rate for a vehicle up to 3,500 kg is currently NZ$76 per 1,000 km, with an administration fee added to the purchase. Other vehicle types and weights can differ. A generic “rego costs $100” budget is not a reliable substitute for the vehicle’s actual charge."
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "WoF rules are changing",
                                "text": "NZTA has announced inspection changes from 1 November 2026. Use the expiry on the vehicle’s document and check NZTA’s current rules for its inspection frequency; do not rely on an old age-based summary."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Warrant of fitness",
                                        "url": "https://www.nzta.govt.nz/vehicles/warrants-and-certificates/warrant-of-fitness"
                                    },
                                    {
                                        "name": "NZTA — Vehicle licensing (rego)",
                                        "url": "https://www.nzta.govt.nz/vehicles/licensing-rego/vehicle-licensing-rego"
                                    },
                                    {
                                        "name": "NZTA — About road user charges",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    },
                                    {
                                        "name": "NZTA — RUC rates and transaction fees",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/ruc-rates-and-transaction-fees"
                                    },
                                    {
                                        "name": "Companies Office — PPSR vehicle checks",
                                        "url": "https://ppsr.companiesoffice.govt.nz/help-centre/information-for-debtors-and-consumers/how-the-ppsr-can-help-when-buying-used-goods/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Inspect the vehicle and the conversion",
                        "items": [
                            {
                                "title": "Book an independent inspection with the right scope",
                                "text": "Ask a mechanic or inspection service what the report covers before booking. A roadworthiness check, a mechanical pre-purchase inspection and checks of the camper conversion answer different questions. Tell the inspector the intended trip and ask them to separate urgent safety work, likely maintenance and items needing further investigation. Use written findings and estimates to decide whether to continue."
                            },
                            {
                                "type": "checklist",
                                "title": "At the viewing: record observations for the inspector",
                                "items": [
                                    "Start with a genuinely cold engine. Watch how it starts and whether dashboard warning lamps behave normally; note persistent smoke, leaks or unusual noises.",
                                    "Ask for evidence of overheating repairs, cooling-system maintenance and timing-belt work where that engine uses a belt. A sticker without an invoice is incomplete evidence.",
                                    "Look for damp carpets, staining around windows and roof openings, musty smells and soft interior panels. Check the bed and storage after moving cushions.",
                                    "Look for corrosion around structural areas, seams and mounting points. Ask the inspector to assess the underside; do not crawl under a vehicle supported only by a jack.",
                                    "Compare tyre wear across the axle and note cracks or damage. On a permitted and insured test drive, report pulling, vibration, slipping, difficult shifts or abnormal temperature.",
                                    "Ask the seller to demonstrate the fridge, water pump, lighting, charging and leisure battery under load. A voltage reading alone does not establish battery capacity.",
                                    "Check doors, locks, seat belts, ventilation and access to equipment. Ask for documentation for modifications and gas or mains-electric installations; use an appropriately qualified professional for those checks."
                                ]
                            },
                            {
                                "title": "Turn findings into a decision",
                                "text": "A viewing checklist cannot diagnose an internal engine fault. If the report leaves a significant issue unresolved, ask for a specialist assessment or consider another van. Keep the written estimate beside your budget. Never open a hot cooling-system cap, and do not experiment with gas or mains wiring to test a seller’s claim."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Used vehicle inspection checks",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Read the detailed campervan inspection checklist",
                                "to": "/guide/how-to-inspect-campervan-nz"
                            }
                        ]
                    },
                    {
                        "title": "Verify self-contained status and your camping plan",
                        "items": [
                            {
                                "title": "Check the green warrant and the national register",
                                "text": "From 7 June 2026, the old blue warrant is no longer recognised for self-contained certification. PGDB says a valid green warrant card, certificate and national SCV register entry matter; a coloured promotional sticker has no official status. Certification requires a fixed toilet and other compliant facilities. Ask a certification authority about any uncertain conversion."
                            },
                            {
                                "title": "Certification does not make every overnight stop legal",
                                "text": "Check the rules and signs for the place you plan to stay. Restrictions can still apply to certified vans. A non-self-contained vehicle can use campgrounds, holiday parks and other permitted sites; build those costs into your route instead of assuming every night will be free."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Complete the sale and prepare to drive",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Set the terms",
                                        "text": "Write down the agreed price, vehicle identifiers, odometer, included equipment, disclosed defects and any conditions that must be satisfied before payment. Agree the handover and keep copies of the advert, inspection report and receipt."
                                    },
                                    {
                                        "title": "Check the WoF arrangements",
                                        "text": "NZTA says buyers can insist on a WoF less than one month old. Read its rules before accepting an older or expired WoF, including any written agreement and driving restrictions."
                                    },
                                    {
                                        "title": "Coordinate payment and handover",
                                        "text": "Use a payment method both parties understand and allow for transfer limits and bank processing times. Verify the recipient details directly. Do not use an emailed screenshot as confirmation of cleared funds. Record receipt of the vehicle, keys and documents."
                                    },
                                    {
                                        "title": "Notify NZTA immediately",
                                        "text": "Buyer and seller each notify NZTA. The buyer’s online transaction requires a New Zealand driver licence; without one, use an NZTA agent and check its identification requirements before visiting."
                                    },
                                    {
                                        "title": "Arrange cover and confirm road requirements",
                                        "text": "Get insurance quotes for your licence, age, travel plans and conversion before committing. Read the cover and excess, set the start time for handover, and confirm the vehicle’s licensing and any applicable RUC before driving."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "Visitors: check your driving entitlement",
                                "text": "Eligible overseas car-licence holders currently have an 18-month limit from their last arrival. NZTA announces a 12-month limit from 1 November 2026, while the 2024 rule includes a transitional provision for arrivals between 1 November 2024 and 31 October 2026. Check the rule that applies to your arrival date with NZTA before driving. Carry the current original licence and the required English translation or IDP if applicable."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    },
                                    {
                                        "name": "Consumer Protection — Sales agreements",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/paying-registering-insuring-car/car-sales-contracts-warranties"
                                    },
                                    {
                                        "name": "NZTA — Driving on New Zealand roads",
                                        "url": "https://www.nzta.govt.nz/travelling-on-our-roads/visitors-and-new-residents/driving-on-nz-roads"
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZ Legislation — Driver Licensing Amendment Rule 2024, transitional provision",
                                        "url": "https://www.legislation.govt.nz/regulation/public/2024/0222/11.0/LMS1000138.html"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Questions buyers ask",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Should I buy a van before arriving in New Zealand?",
                                        "a": "You can research and arrange viewings in advance. A purchase decision is stronger once you have checked the vehicle, seller and inspection findings. Leave time in your arrival city for those steps and for another option if the first van is unsuitable."
                                    },
                                    {
                                        "q": "Does a new WoF replace a mechanical inspection?",
                                        "a": "No. NZTA distinguishes a safety inspection from a pre-purchase inspection. Use the mechanic’s report to assess the vehicle’s condition rather than treating the WoF as a reliability guarantee."
                                    },
                                    {
                                        "q": "Can I rely on the advertised resale or buyback amount?",
                                        "a": "An asking-price comparison or calculator is not a guaranteed offer. For an actual buyback agreement, read who is committing to buy, the timing, mileage and condition requirements, deductions and payment terms. Allow for a lower resale outcome in your budget."
                                    },
                                    {
                                        "q": "What should I keep for resale?",
                                        "a": "Keep your purchase receipt, inspection report, maintenance invoices, document renewals and records of repairs. Photograph the equipment included in your eventual sale and describe any outstanding issues clearly."
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Browse available campervans across New Zealand",
                                "to": "/"
                            }
                        ]
                    }
                ]
            }
        },
        'campervan-buyer-checklist': {
            "title": "Used Campervan Inspection Checklist NZ: How to Check a Van Before Buying",
            "description": "A chronological pre-purchase routine for campervans in New Zealand — the homework the night before, the first minutes on site, the walk-around, the test drive, and the handover. Free printable version.",
            "heroImage": "/van_inspection_expert_1772133711431.webp",
            "content": {
                "intro": "Use this checklist to organise a campervan viewing: documents before you travel, the vehicle from cold, body and camper equipment, then the test drive and written handover. It helps you decide what needs professional investigation; it cannot establish the mechanical condition by itself. Book an independent inspection before committing.",
                "sections": [
                    {
                        "title": "The Night Before: Homework From the Hostel",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Check the documents before arranging the viewing",
                                "text": "Use the plate and VIN to compare the advert, inspection information and vehicle identity. Resolve missing records or inconsistencies with the seller before travelling."
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
                                        "text": "Search the PPSR using the vehicle identifiers and read the result for registered security interests. Check the current search fee on the official site. A registered interest can put a purchase at risk; obtain independent advice if an interest remains."
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
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "Companies Office — How the PPSR can help when buying used goods",
                                        "url": "https://ppsr.companiesoffice.govt.nz/help-centre/information-for-debtors-and-consumers/how-the-ppsr-can-help-when-buying-used-goods/"
                                    }
                                ]
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
                                        "text": "Look for an uneven stance and ask about the load, tyres and suspension. These observations need an inspector’s assessment before attributing a cause."
                                    },
                                    {
                                        "title": "Compare the four tyres",
                                        "text": "Check size, tread, condition and wear patterns, and ask whether the tyres meet the vehicle’s requirements. Different brands alone do not prove poor maintenance."
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
                                "url": "/van_inspection_expert_1772133711431.webp",
                                "caption": "Bring a torch. The van's real history is written underneath it."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Panel gaps and paint tone",
                                        "text": "Record uneven gaps, paint differences or signs of repair and ask for the repair history. These clues do not establish the cause or structural condition."
                                    },
                                    {
                                        "title": "Ask about previous body repairs",
                                        "text": "Ask for invoices and repair photos. A magnet test cannot reliably prove hidden rust, accident damage or sound structure; have suspect areas assessed professionally."
                                    },
                                    {
                                        "title": "Get underneath with your torch",
                                        "text": "Use a torch from a safe position to look for visible damage or corrosion. Do not crawl under an unsupported vehicle. Ask the inspector to assess chassis rails, floor and sills using suitable access equipment."
                                    },
                                    {
                                        "title": "Window rubbers and roof seams",
                                        "text": "Look for bubbling paint, disturbed seals and water marks. Ask the inspector to establish whether corrosion or leaks are present and how extensive they are."
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
                                        "text": "Inspect oil and coolant only when it is safe and follow the vehicle’s instructions. Never open a hot cooling system. Contamination, leaks or unexplained fluid loss need a mechanic’s diagnosis; an oil-cap deposit alone does not establish a failed head gasket."
                                    },
                                    {
                                        "title": "Ask the cambelt question",
                                        "text": "Identify the exact engine and whether it uses a belt or chain. Match maintenance invoices with the manufacturer’s schedule and ask the inspector to identify work due. Missing paperwork is not evidence that a replacement was done."
                                    },
                                    {
                                        "title": "Drive it like New Zealand drives",
                                        "text": "Agree a safe route with the seller and follow speed limits and conditions. Observe steering, braking, temperature and power at suitable speeds. Have unfamiliar noises, vibration or warning lights investigated rather than trying dangerous manoeuvres."
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
                                "text": "Ask an independent inspector for a quote, the report’s scope and any limits on checking the camper conversion. The value of an inspection is not determined by a $5,000 purchase threshold. Obtain written findings and repair estimates before deciding."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Tips for buying a used car",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    }
                                ]
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
                                        "text": "Check the actual certificate, expiry, green warrant card and national SCV register entry for this vehicle. The old blue warrant is no longer recognised from 7 June 2026. A promotional sticker does not prove certification."
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
                                        "text": "Run appliances with the seller and note the battery type, capacity, age and charging arrangements. Ten minutes of operation does not establish battery health. Ask a suitable specialist to test capacity and installation if uncertain."
                                    },
                                    {
                                        "title": "Make 'it has solar' mean something",
                                        "text": "Ask for the panel wattage and the controller brand. Without numbers, 'solar' can mean a trickle charger and an optimistic sticker."
                                    },
                                    {
                                        "title": "Check gas safety with a qualified gasfitter",
                                        "text": "Ask for the gasfitting documentation and arrange a qualified gasfitter’s check if uncertain. WorkSafe says portable gas cookers, heaters and lanterns must not be used inside a caravan or motorhome, including awnings. If you smell gas, stop testing the equipment and follow official gas-safety advice."
                                    },
                                    {
                                        "title": "Lift the mattress",
                                        "text": "Brown rings on the plywood underneath are the honest autobiography of every roof leak the van has ever had."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "WorkSafe — Gas safety for caravans and motorhomes",
                                        "url": "https://www.worksafe.govt.nz/managing-health-and-safety/consumers/safe-living-with-gas/recreational-safety/gas-safety-for-caravans-and-motorhomes/"
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
                                        "title": "Check inspection and licence separately",
                                        "text": "Read the WoF issue date and expiry, and the rego status. Buyers can insist on a WoF less than one month old; record acceptance of an older or expired inspection as NZTA requires."
                                    },
                                    {
                                        "title": "Does RUC apply? Read the distance licence",
                                        "text": "Compare the purchased distance with the odometer for any RUC vehicle, not only diesel vans. Resolve a shortfall before paying: the new registered person may become responsible for outstanding charges."
                                    },
                                    {
                                        "title": "Write the sale record before paying",
                                        "text": "Record buyer and seller details, date, price, plate, VIN, included equipment, known faults and agreed conditions. Keep signed copies and evidence of payment. “Sold as seen” does not settle every dispute or remove statutory obligations."
                                    },
                                    {
                                        "title": "Notify NZTA at the handover",
                                        "text": "Buyer and seller each notify NZTA immediately. The buyer’s online transaction needs a New Zealand driver licence; otherwise use an agent and check identification requirements. The registered-person record is not proof of legal ownership."
                                    },
                                    {
                                        "title": "Confirm insurance before driving",
                                        "text": "Get terms for your own licence, age, trip and conversion before committing, and arrange the cover’s start time for handover. Application time and acceptance vary by insurer."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    },
                                    {
                                        "name": "NZTA — About RUC",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    },
                                    {
                                        "name": "Consumer Protection — Car insurance",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/paying-registering-insuring-car/car-insurance"
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
                                "text": "Treat unresolved identity, finance, safety or inspection problems as reasons to pause or walk away. Do not let a departure deadline replace verification."
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
                                "text": "Listings show seller-provided details. A CarJam link, where a plate is supplied, is a route to third-party checks; it does not mean Kiwi Van Market has verified the vehicle or paid for a full report."
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
                                        "a": "A compatible scanner can provide useful fault and readiness information, but coverage differs by vehicle and tool. Cleared codes or intermittent faults may not appear. A clean scan is not evidence that the engine or gearbox is sound; ask the inspector what diagnostics are appropriate."
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
            },
            "dateModified": "2026-10-15"
        },
        'wof-rego-ruc-insurance-nz': {
            "title": "WoF, Rego, RUC & Insurance NZ: Checks Before Buying a Van",
            "description": "Check campervan WoF, vehicle licensing, RUC and insurance before buying in New Zealand. Official sources, upcoming inspection changes and handover checks.",
            "heroImage": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "Before paying for a campervan, check four separate things: its safety inspection, vehicle licensing, any distance charges, and your insurance. An advert badge cannot replace these documents. Record the plate, dates and odometer reading and compare them with the actual vehicle.",
                "sections": [
                    {
                        "title": "WoF: a safety inspection, with rules changing in November",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "What the inspection tells you",
                                "text": "A WoF checks specified safety requirements at the time of inspection. It does not establish engine reliability, gearbox condition or the quality of a camper conversion. Arrange a separate pre-purchase inspection and ask what it includes."
                            },
                            {
                                "title": "Check the actual expiry and current rules",
                                "text": "On 15 October 2026, inspection frequency still depends on the vehicle’s first-registration date. Changes begin on 1 November 2026, with some vehicles phased in later. Use the NZTA guidance for the actual vehicle instead of assuming every van needs a WoF every six or twelve months."
                            },
                            {
                                "title": "What matters when buying",
                                "text": "NZTA says a buyer can insist on a WoF less than one month old. If accepting an older WoF, confirm that in writing. Without a current inspection, road use is restricted to travel for repair or inspection; the vehicle must still be safe for that journey. Several months remaining does not mean the inspection was recent."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Warrant of fitness",
                                        "url": "https://www.nzta.govt.nz/vehicles/warrants-and-certificates/warrant-of-fitness"
                                    },
                                    {
                                        "name": "NZTA — Changes to light vehicle inspections",
                                        "url": "https://nzta.govt.nz/projects-and-consultations/have-your-say/past-consultations/considering-changes-to-light-vehicle-inspections/changes-to-light-vehicle-inspections"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Rego: vehicle licensing, separate from registration",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Check the licensing label and vehicle identity",
                                "text": "Rego is the licence to use a registered vehicle on the road. Registration identifies the person responsible for the vehicle; the registration record is not proof of legal ownership. Check the plate and VIN as well as the date."
                            },
                            {
                                "title": "Budget the actual fee",
                                "text": "Fees depend on the vehicle and use, and include ACC and administration charges. The NZTA page has current rates and a plate-specific fee checker. A generic “$100 a year” assumption is not a reliable campervan budget."
                            },
                            {
                                "title": "Expired or on hold",
                                "text": "Find out whether the licence has expired, is on hold, or registration has been cancelled: these are different situations. Confirm the steps and charges before driving. Both buyer and seller must notify NZTA immediately; buyers without a New Zealand driver licence use an agent."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Licensing (rego) fees",
                                        "url": "https://www.nzta.govt.nz/vehicles/licensing-rego/vehicle-fees/licensing-fees"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "RUC: check fuel type, vehicle class and paid distance",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "RUC is not diesel-only",
                                "text": "Diesel vehicles and many electric vehicles pay road user charges. Vehicle type and weight affect the rate. The standard type 1 rate up to 3,500 kg is NZ$76 per 1,000 km, plus the transaction fee. Check the actual rate rather than applying this example to every motorhome."
                            },
                            {
                                "title": "Compare the distance licence with the odometer",
                                "text": "A seller must supply a current RUC licence. NZTA warns that a buyer may become responsible for unpaid RUC. Resolve any shortfall before payment and record the agreement."
                            },
                            {
                                "title": "Unused RUC stays with the vehicle",
                                "text": "Selling the van does not entitle you to a refund of unused RUC. NZTA says the licence belongs to that vehicle; account for unused distance in the sale price. Different refund rules apply to eligible off-road use or registration cancellation."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — About RUC",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    },
                                    {
                                        "name": "NZTA — RUC rates and transaction fees",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/ruc-rates-and-transaction-fees"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Insurance: get a quote before committing",
                        "icon": "Shield",
                        "items": [
                            {
                                "type": "table",
                                "title": "Compare the policies",
                                "headers": [
                                    "Cover",
                                    "Questions to ask"
                                ],
                                "rows": [
                                    [
                                        "Third party",
                                        "What liability is covered if you damage someone else’s vehicle or property?"
                                    ],
                                    [
                                        "Third party, fire and theft",
                                        "What theft and fire cover applies to the van, conversion and contents?"
                                    ],
                                    [
                                        "Comprehensive",
                                        "What own-vehicle damage is covered, on what value basis and with what excess?"
                                    ]
                                ],
                                "caption": "Read the policy wording and exclusions. This table is a starting point for comparing quotes."
                            },
                            {
                                "title": "Declare the actual driver and use",
                                "text": "Ask about your overseas licence, age, named drivers, camper conversion, length of stay, work use and intended roads. Acceptance, price and claims depend on the insurer and policy. Do not assume a passport, hostel address or online application guarantees cover."
                            },
                            {
                                "title": "Ask about roadworthiness conditions",
                                "text": "Check these requirements with the insurer. Avoid assuming every expired WoF automatically voids every policy, or that a current WoF guarantees a claim will be paid."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "Consumer Protection — Car insurance",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/paying-registering-insuring-car/car-insurance"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "ACC and your handover checklist",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "ACC is injury cover, not vehicle or travel insurance",
                                "text": "ACC’s no-fault scheme can cover eligible accident injuries in New Zealand, including visitors. It does not replace cover for vehicle damage, illness, disrupted travel or getting home. There can be treatment costs you need to pay; check ACC’s visitor information and your travel policy."
                            },
                            {
                                "type": "checklist",
                                "items": [
                                    "Compare the plate and VIN with the documents.",
                                    "Read the WoF inspection date and expiry separately.",
                                    "Confirm the licensing status and actual renewal cost.",
                                    "If RUC applies, compare purchased distance with the odometer.",
                                    "Obtain insurance terms for your own licence and trip before handover.",
                                    "Keep the written sale and both NZTA notifications."
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "ACC — Visitors injured in New Zealand",
                                        "url": "https://www.acc.co.nz/im-injured/what-we-cover/if-youre-a-visitor-injured-in-new-zealand"
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Follow the full buying and handover process",
                                "to": "/guide/buying-campervan-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Take the inspection checklist to your viewing",
                                "to": "/guide/campervan-buyer-checklist"
                            }
                        ]
                    }
                ]
            }
        },
        'freedom-camping-nz': {
            "title": "Freedom Camping in New Zealand: Green Warrants, Local Rules & Fines",
            "description": "Check New Zealand freedom camping rules, current self-contained certification, site restrictions and infringement fees before planning a campervan trip.",
            "heroImage": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "Start with the land manager’s rules for the exact place you want to stay. A self-contained certificate concerns the vehicle; it does not grant permission to camp at every beach, car park or roadside. Build a route with permitted stops and a paid-campsite backup.",
                "sections": [
                    {
                        "title": "Check the vehicle and the site separately",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Current certification means a valid green warrant",
                                "text": "Since 7 June 2026, the old blue warrant is not recognised as self-contained certification. PGDB identifies the certificate, displayed green warrant card and national SCV register entry as the relevant evidence. A promotional green sticker has no official status. Compliant facilities include a fixed toilet."
                            },
                            {
                                "title": "Non-self-contained vehicles need an appropriate site",
                                "text": "The general vehicle requirement for freedom camping on public land is self-contained certification, with designated exceptions. Non-self-contained vehicles can use suitable campgrounds, holiday parks and specifically permitted sites. Read the rule for that place and its land manager."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Plan with official location information",
                        "icon": "MapPin",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Identify who manages the land",
                                        "text": "Find the council, Department of Conservation, LINZ or private operator responsible. Check its current map, notices and booking information."
                                    },
                                    {
                                        "title": "Read all the conditions",
                                        "text": "Look for vehicle certification, occupancy, overnight hours, stay limits, seasonal closures and waste rules. There is no single national “one or two nights” allowance for every site."
                                    },
                                    {
                                        "title": "Check signs when you arrive",
                                        "text": "Apps can help find options, but check official information and on-site signs. If a site is full or unclear, use a permitted alternative rather than assuming you can park nearby."
                                    },
                                    {
                                        "title": "Arrange water and waste stops",
                                        "text": "Use authorised disposal facilities and take rubbish away. Plan these stops alongside overnight accommodation; a van’s tank capacity limits how long you can stay independently."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "New Zealand Government — Freedom camping",
                                        "url": "https://www.govt.nz/browse/recreation-and-the-environment/freedom-camping/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Understand the penalties",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "type": "table",
                                "title": "Examples from the national infringement regulations",
                                "headers": [
                                    "Offence",
                                    "Infringement fee"
                                ],
                                "rows": [
                                    [
                                        "Camping in breach of a council prohibition or restriction",
                                        "NZ$400"
                                    ],
                                    [
                                        "Not displaying a warrant card where required",
                                        "NZ$200"
                                    ],
                                    [
                                        "Displaying an altered or fraudulent warrant card",
                                        "NZ$600"
                                    ],
                                    [
                                        "Depositing waste while freedom camping in a covered area",
                                        "NZ$800"
                                    ]
                                ],
                                "caption": "These are examples of infringement fees, not a complete list of offences or court penalties. The legal provision and circumstances matter."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "New Zealand Legislation — Freedom camping infringement penalties",
                                        "url": "https://www.legislation.govt.nz/regulation/public/2023/0136/latest/whole.html"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Before buying a van advertised as self-contained",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "checklist",
                                "items": [
                                    "Read the actual certificate, expiry and vehicle details.",
                                    "Check the current green warrant and SCV register entry.",
                                    "Ask whether changes to the layout or equipment affect the certification.",
                                    "Compare the proposed route with official camping restrictions.",
                                    "Budget campsite and disposal costs rather than assuming every night is free."
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Read the full campervan buying guide",
                                "to": "/guide/buying-campervan-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Compare vans advertised by their sellers as self-contained",
                                "to": "/?selfContained=true"
                            }
                        ]
                    }
                ]
            }
        },
        'selling-campervan-nz': {
            "title": "How to Sell a Campervan in New Zealand: Adverts, Payment & Handover",
            "description": "Prepare a campervan sale in New Zealand: asking price, honest photos, inspections, payment and NZTA notifications. A practical seller checklist with official sources.",
            "heroImage": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200",
            "content": {
                "intro": "Start preparing your advert before your departure deadline. Compare current asking prices, gather documents and allow time for viewings and inspections. There is no fixed sale time or guaranteed resale price; keep a backup plan if enquiries are slow.",
                "sections": [
                    {
                        "title": "Preparing Your Van for Sale",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "Deep Clean",
                                "text": "First impressions matter. Clean inside and out, remove personal items, make it smell fresh."
                            },
                            {
                                "title": "Minor Repairs",
                                "text": "Fix small issues - they're cheap but make buyers nervous. Worn wiper blades, broken lights, etc."
                            },
                            {
                                "title": "Check the WoF arrangements",
                                "text": "Buyers can insist on a WoF less than one month old. If they accept an older inspection, record that in writing; an expired WoF also requires the buyer’s written acknowledgement and limits road use. Read NZTA’s sale rules rather than assuming that six months remaining proves a recent inspection."
                            },
                            {
                                "title": "Gather the actual documents",
                                "text": "Collect service invoices, WoF and rego details, RUC distance where applicable and current certification for the camper conversion. Keep documents consistent with the advert and disclose known faults."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Selling a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/selling-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Taking Great Photos",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "Timing",
                                "text": "Shoot during golden hour (early morning or late afternoon) for best lighting."
                            },
                            {
                                "title": "Angles",
                                "text": "Include: front 3/4 view, rear, both sides, interior bed setup, kitchen area, dashboard, engine bay."
                            },
                            {
                                "title": "Show the vehicle clearly",
                                "text": "Include enough clear photographs to show its condition and equipment. Add close-ups of wear or damage instead of relying on an ideal photo count as a promise of a faster sale."
                            },
                            {
                                "title": "Honesty",
                                "text": "Include photos of any damage or wear. Buyers appreciate honesty and it saves time."
                            }
                        ]
                    },
                    {
                        "title": "Pricing Strategy",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Compare current asking prices",
                                "text": "Review similar year, engine, mileage, conversion, location and condition. Asking prices are not completed-sale values; use the site’s sample as one input and explain differences in your advert."
                            },
                            {
                                "title": "Set your own negotiation limit",
                                "text": "Include known repairs and your departure deadline when deciding what you can accept. No fixed negotiation percentage or seasonal discount applies to every van."
                            },
                            {
                                "type": "cta",
                                "text": "Read the asking-price sample and methodology",
                                "to": "/campervan-prices-nz"
                            }
                        ]
                    },
                    {
                        "title": "Where to List",
                        "icon": "MapPin",
                        "items": [
                            {
                                "title": "Kiwi Van Market",
                                "text": "Free listings, backpacker-focused audience. List here first!"
                            },
                            {
                                "title": "Facebook Groups",
                                "text": "Backpackers NZ groups have active buy/sell sections. Good for quick sales."
                            },
                            {
                                "title": "Hostel Noticeboards",
                                "text": "Physical flyers at backpacker hostels in main cities."
                            }
                        ]
                    },
                    {
                        "title": "Agree payment and finish the handover",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "checklist",
                                "items": [
                                    "Arrange viewings safely and allow an independent inspection.",
                                    "Write the vehicle identifiers, price, date, included equipment and agreed conditions into the sale record.",
                                    "Confirm cleared payment through your own bank before handing over the keys; a screenshot is not confirmation.",
                                    "Complete your seller notification to NZTA immediately and check the buyer has completed theirs.",
                                    "A RUC vehicle must have current purchased distance; unused RUC stays with the vehicle.",
                                    "If offering buyback, put the buyer, timing, price, mileage, condition, deductions and payment terms in writing."
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Selling a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/selling-a-vehicle"
                                    },
                                    {
                                        "name": "NZTA — About RUC",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    }
                                ]
                            }
                        ]
                    }
                ],
                "warnings": [
                    "Disclose known faults and keep a copy of the advert and written sale.",
                    "Allow time for inspections and have a plan if the van does not sell before departure."
                ],
                "cta": {
                    "title": "List your campervan for sale",
                    "text": "Create a free advert with clear photos, accurate vehicle details and a pickup location.",
                    "buttonText": "Create a free listing",
                    "buttonLink": "/sell"
                }
            },
            "dateModified": "2026-10-15"
        },
        'how-to-inspect-campervan-nz': {
            "title": "How to Arrange an Independent Campervan Inspection in New Zealand",
            "description": "Choose a campervan pre-purchase inspection in NZ: agree the mechanical and conversion checks, request a quote and written report, then assess repairs before buying.",
            "heroImage": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "A viewing helps you decide which van deserves further investigation. An independent inspection helps you assess its condition before paying. Choose a provider separately from the seller and agree in advance what the inspection can establish about the vehicle and the camper conversion.",
                "sections": [
                    {
                        "title": "1. Find a provider and agree the scope",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Send the actual vehicle details",
                                "text": "Give the inspector the plate, make, model, year, engine or fuel type, mileage and pickup location. Mention modifications, camper equipment and any concerns from your viewing. Ask whether that specification, vehicle size and conversion can be inspected at the proposed location."
                            },
                            {
                                "title": "Ask what the quoted service includes",
                                "text": "Request the price, availability, inspection method and exclusions in writing. Ask about a road test, underside access, diagnostic scanning, fluid leaks, corrosion, brakes, tyres, transmission and maintenance records. Ask which observations are visual and which are measured. Avoid assuming every service includes dismantling, internal engine tests or a forecast of future reliability."
                            },
                            {
                                "title": "Arrange access with the seller",
                                "text": "Confirm the booking, consent for any test drive, documents required and payment responsibility. Ask for a genuine cold start where practical. A seller’s report can be useful background, but discuss commissioning your own assessment rather than assuming an old report covers today’s condition."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Tips for buying a used car",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    },
                                    {
                                        "name": "AA — Pre Purchase Inspections",
                                        "url": "https://www.aa.co.nz/cars/buying-and-selling/pre-purchase-inspections/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "2. Separate mechanical inspection and camper equipment",
                        "icon": "Car",
                        "items": [
                            {
                                "type": "table",
                                "title": "Questions to put to the provider",
                                "headers": [
                                    "Area",
                                    "What to confirm"
                                ],
                                "rows": [
                                    [
                                        "Base vehicle",
                                        "What safety, mechanical and corrosion checks are included, and can the underside be examined safely?"
                                    ],
                                    [
                                        "Maintenance",
                                        "Will the report identify missing records and service items needing further investigation?"
                                    ],
                                    [
                                        "Living equipment",
                                        "Are water, fridge, batteries, charging and signs of leaks included, or does a separate specialist need to inspect them?"
                                    ],
                                    [
                                        "Gas and electrical systems",
                                        "Who can assess the installation and its required documentation? What is outside the mechanical inspector’s competence?"
                                    ],
                                    [
                                        "Self-contained status",
                                        "Check the actual green warrant, certificate and SCV register entry. Is any changed equipment relevant to certification?"
                                    ]
                                ],
                                "caption": "A mechanical inspection, gasfitting certification and self-contained certification answer different questions. Ask the relevant provider about each."
                            },
                            {
                                "title": "Do not test unsafe equipment",
                                "text": "Stop if you suspect a gas leak or unsafe wiring. WorkSafe says portable gas cookers, heaters and lanterns must not be used inside a campervan or its awning. Use a qualified gasfitter for uncertain gas installations."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "WorkSafe — Gas safety for caravans and motorhomes",
                                        "url": "https://www.worksafe.govt.nz/managing-health-and-safety/consumers/safe-living-with-gas/recreational-safety/gas-safety-for-caravans-and-motorhomes/"
                                    },
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "3. Read the written report and cost the findings",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Ask which findings are urgent",
                                        "text": "Have the inspector distinguish immediate safety concerns, maintenance due, defects needing diagnosis and observations that could not be checked. Ask about limits caused by access, weather or vehicle condition."
                                    },
                                    {
                                        "title": "Get repair quotes before changing your offer",
                                        "text": "Request estimates from a suitable repairer for significant work. Do not substitute a generic “head gasket price” or “suspension budget” for diagnosis and a quote on the actual vehicle."
                                    },
                                    {
                                        "title": "Compare with your budget and timeline",
                                        "text": "Add the inspection fee, immediate work and a reserve to the purchase price. Consider whether repairs can be completed before your trip. You can renegotiate, arrange further checks or decline the purchase; the report does not oblige you to proceed."
                                    }
                                ]
                            },
                            {
                                "title": "Keep the documents",
                                "text": "Retain the report, scope, seller’s statements and repair estimates. If the sale proceeds, keep the written sale and complete the NZTA buyer notification. A current WoF is a safety inspection, not a mechanical guarantee."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "4. Prepare for the viewing",
                        "icon": "MapPin",
                        "items": [
                            {
                                "type": "cta",
                                "text": "Use the detailed visual checklist before booking an inspection",
                                "to": "/guide/campervan-buyer-checklist"
                            },
                            {
                                "type": "cta",
                                "text": "Read the buying process, budget and handover steps",
                                "to": "/guide/buying-campervan-nz"
                            }
                        ]
                    }
                ],
                "cta": {
                    "title": "Shortlist a van for inspection",
                    "text": "Compare seller-provided details, organise a viewing and book independent checks before committing.",
                    "buttonText": "Browse current adverts",
                    "buttonLink": "/"
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
            "title": "10 Campervan Models to Compare Before Buying in New Zealand",
            "description": "Compare ten campervan models and variants for a New Zealand trip. Viewing questions, conversion checks and a way to compare asking prices without reliability guarantees.",
            "heroImage": "/top10-van.avif",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "Use this editorial shortlist to organise viewings, then judge each vehicle by its specification, condition and documents. The order is not a reliability ranking. Kiwi Van Market has not road-tested these vehicles or collected verified model-level sale prices. A maintained individual vehicle and a conversion that fits your trip matter more than a model’s reputation.",
                "sections": [
                    {
                        "title": "Ten models and variants: questions for the seller and inspector",
                        "icon": "Car",
                        "items": [
                            {
                                "type": "table",
                                "title": "Compare the actual vehicle",
                                "headers": [
                                    "Model family",
                                    "What to establish at the viewing"
                                ],
                                "rows": [
                                    [
                                        "Toyota Hiace, earlier generations",
                                        "Compare engine code, transmission, wheelbase and service invoices. Have the cooling system and corrosion assessed; the badge alone does not determine condition."
                                    ],
                                    [
                                        "Toyota Hiace, 200-series variants",
                                        "Confirm the exact year and engine, maintenance schedule, payload after conversion and dimensions. Compare vehicles of the same specification rather than combining every Hiace price."
                                    ],
                                    [
                                        "Nissan Caravan / Homy",
                                        "Identify the generation and engine before comparing adverts. Ask for cold-start and transmission checks, rust assessment and invoices for overdue maintenance."
                                    ],
                                    [
                                        "Nissan Elgrand",
                                        "Measure the usable bed and storage with the actual seats or conversion in place. Check legal seating capacity, payload and realistic fuel costs for your route."
                                    ],
                                    [
                                        "Mitsubishi Delica",
                                        "Check whether the actual vehicle is two- or four-wheel drive. If four-wheel drive matters, ask the inspector to assess its system, tyres and maintenance. Confirm road access and insurance conditions."
                                    ],
                                    [
                                        "Toyota Estima / Previa",
                                        "Test the sleeping layout with your luggage inside. Identify the exact engine, drivetrain and access for servicing; different generations are not interchangeable comparisons."
                                    ],
                                    [
                                        "Mazda Bongo / Friendee",
                                        "Distinguish a Bongo van from a Friendee conversion. If fitted with an elevating roof, inspect its operation, seals, fabric and signs of water damage."
                                    ],
                                    [
                                        "Ford Transit",
                                        "Record body size, engine, drivetrain, service history and total converted weight. Ask about maintenance due and whether local garages can support that exact specification."
                                    ],
                                    [
                                        "Toyota TownAce / LiteAce",
                                        "Compare usable interior dimensions, legal seating and payload with your needs. Confirm the engine and maintenance requirements rather than assuming a smaller body means low ownership cost."
                                    ],
                                    [
                                        "Mitsubishi L300 / Express",
                                        "Check the actual model and engine, structural condition, service records and conversion safety. Include repairs and inspection costs when comparing a low advertised price."
                                    ]
                                ],
                                "caption": "Generations, engines and conversions differ. These questions are a starting point for an independent inspection, not a diagnosis."
                            }
                        ]
                    },
                    {
                        "title": "Make a like-for-like shortlist",
                        "icon": "Shield",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Write down the specification",
                                        "text": "Record year, engine and fuel type, transmission, kilometres, seating, sleeping capacity, body dimensions and loaded weight. Compare these before deciding that one advert is cheaper."
                                    },
                                    {
                                        "title": "Separate asking price from the ownership budget",
                                        "text": "Add inspection, immediate servicing, tyres, insurance, licensing and applicable RUC. Allow for campsite costs and a lower resale outcome. A low purchase price can leave little room for a repair reserve."
                                    },
                                    {
                                        "title": "Verify the conversion and documents",
                                        "text": "Test water, fridge and electrics. Match certificates to the vehicle. Check current self-contained certification and any gas or electrical documentation with a qualified person where relevant."
                                    },
                                    {
                                        "title": "Get an independent written report",
                                        "text": "Ask the inspector about the exact engine, corrosion, transmission and maintenance due. A current WoF is not a mechanical warranty. Use findings and quotes rather than an assumed repair bill for a model."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Tips for buying a used car",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    },
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Use the site’s price data carefully",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "What an asking-price comparison can tell you",
                                "text": "The price index summarises eligible active adverts on Kiwi Van Market. It does not measure completed sales, a national market share, reliability or the resale return you will receive. A model group may have too few adverts to publish a median."
                            },
                            {
                                "type": "cta",
                                "text": "Read the current asking-price sample and its method",
                                "to": "/campervan-prices-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Follow the full buying checklist and paperwork steps",
                                "to": "/guide/buying-campervan-nz"
                            }
                        ]
                    }
                ],
                "cta": {
                    "title": "Compare current campervan adverts",
                    "text": "Review seller-provided details, arrange a viewing and verify the documents before purchase.",
                    "buttonText": "Browse campervans for sale",
                    "buttonLink": "/"
                }
            }
        }
    },
    fr: {
        'buying-campervan-nz': {
            "title": "Acheter un van en Nouvelle-Zélande : contrôles, budget et démarches",
            "description": "Préparez l’achat d’un van en NZ : prix, inspection, WoF, rego, RUC, certificat self-contained et remise des clés. Checklist et sources officielles.",
            "heroImage": "https://images.unsplash.com/photo-1523987355523-c7b5b0dd90a7?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "Pour acheter un van en Nouvelle-Zélande, comparez les annonces disponibles, vérifiez le vendeur et l’historique, faites réaliser une inspection indépendante, consignez l’accord par écrit et effectuez la notification NZTA à la remise du véhicule. Prévoyez les frais de possession en plus du prix affiché. Ce guide relie chaque décision aux documents et contrôles utiles, avec des sources officielles consultées le 15 octobre 2026.",
                "sections": [
                    {
                        "title": "Définir votre voyage et un budget complet",
                        "items": [
                            {
                                "title": "Choisir selon votre utilisation",
                                "text": "Notez le nombre de passagers, le couchage, l’itinéraire, les contraintes de stationnement et les équipements réellement utiles. Comparez le coût et la complexité d’un monospace, d’un van moyen et d’un camping-car. Pouvoir se tenir debout, disposer du chauffage, d’un frigo ou d’une batterie auxiliaire peut être appréciable ; un bel aménagement ne prouve toutefois pas l’entretien du véhicule."
                            },
                            {
                                "title": "Comparer achat et location",
                                "text": "Calculez : prix d’achat moins produit de la revente, plus inspection, réparations, entretien, assurance, licence du véhicule et frais de vente. Ajoutez de façon comparable carburant, campings et ferries aux deux options. Divisez ensuite par les jours de voyage. Gardez la trésorerie nécessaire à l’achat et une réserve : la revente n’arrive qu’à la fin et son montant reste incertain."
                            },
                            {
                                "type": "table",
                                "title": "Exemple de calcul — hypothèses, pas tarifs du marché ni devis",
                                "headers": [
                                    "Hypothèse",
                                    "NZD"
                                ],
                                "rows": [
                                    [
                                        "Achat",
                                        "12 000"
                                    ],
                                    [
                                        "Revente supposée",
                                        "9 500"
                                    ],
                                    [
                                        "Inspection",
                                        "250"
                                    ],
                                    [
                                        "Réparations et entretien",
                                        "1 000"
                                    ],
                                    [
                                        "Assurance",
                                        "600"
                                    ],
                                    [
                                        "Licence et autres démarches",
                                        "300"
                                    ],
                                    [
                                        "Coût net dans cet exemple",
                                        "4 650"
                                    ]
                                ],
                                "caption": "Sur 90 jours, ces hypothèses donnent 51,67 NZD par jour avant carburant, campings et ferries. Remplacez-les par vos propres devis. Ce n’est pas une prévision de revente."
                            },
                            {
                                "title": "Comparer les prix puis faire inspecter",
                                "text": "Notre page de prix présente les annonces actives de Kiwi Van Market, avec l’effectif et la méthode de calcul. Comparez modèle, année, kilométrage, historique et équipements similaires. Une annonce bon marché peut cacher une réparation coûteuse ; un prix élevé ne prouve pas la qualité. Obtenez des devis avant de négocier, sans présumer d’une remise identique chez tous les vendeurs."
                            },
                            {
                                "type": "cta",
                                "text": "Comparer les prix demandés et la taille de l’échantillon",
                                "to": "/campervan-prices-nz"
                            }
                        ]
                    },
                    {
                        "title": "Trouver des vans que vous pouvez visiter",
                        "items": [
                            {
                                "title": "Organiser les visites autour de votre arrivée",
                                "text": "Commencez par Auckland ou Christchurch si cela correspond à votre itinéraire. Élargissez seulement lorsque le déplacement et l’inspection restent intéressants. Confirmez la disponibilité, le lieu de visite et la date de remise possible. Conservez l’annonce et fixez un rendez-vous. Prévoyez du temps pour le garage et une solution de remplacement si le premier van ne convient pas."
                            },
                            {
                                "type": "cta",
                                "text": "Voir les vans à vendre à Auckland",
                                "to": "/location/auckland"
                            },
                            {
                                "type": "cta",
                                "text": "Voir les vans à vendre à Christchurch",
                                "to": "/location/christchurch"
                            },
                            {
                                "title": "Identifier le vendeur",
                                "text": "Une annonce sur une plateforme ne transforme pas une vente entre particuliers en vente professionnelle. Consumer Protection précise que l’acheteur bénéficie de moins de protections face à un particulier ; le Consumer Guarantees Act concerne généralement les professionnels. Vérifiez l’identité et le droit de vendre, puis conservez l’annonce et les déclarations écrites."
                            },
                            {
                                "title": "Poser les bonnes questions avant de vous déplacer",
                                "text": "Demandez plaque, VIN ou numéro de châssis, kilométrage, factures d’entretien et dates d’expiration des documents. Demandez des photos du compartiment moteur, du dessous et de l’aménagement, pas seulement du lit. Faites préciser les défauts, le motif de vente et la possibilité d’une inspection indépendante et d’un démarrage à froid. Une réponse évasive laisse un point à vérifier."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "Consumer Protection — Buying privately",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/finding-the-right-car/buying-car-privately"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Vérifier chaque document séparément",
                        "items": [
                            {
                                "type": "table",
                                "headers": [
                                    "Document ou vérification",
                                    "Points à contrôler"
                                ],
                                "rows": [
                                    [
                                        "WoF / CoF",
                                        "Vérifiez le document et son échéance. Le WoF contrôle la sécurité ; il ne garantit pas l’état du moteur ou de la boîte."
                                    ],
                                    [
                                        "Rego",
                                        "Il s’agit de la licence du véhicule, distincte de son immatriculation. Vérifiez sa validité. La personne enregistrée comme responsable n’est pas nécessairement le propriétaire légal."
                                    ],
                                    [
                                        "RUC, si applicable",
                                        "Comparez catégorie, poids et licence kilométrique au compteur. Les RUC concernent le diesel et de nombreux véhicules électriques, pas uniquement le diesel."
                                    ],
                                    [
                                        "PPSR",
                                        "Recherchez une sûreté enregistrée à partir des bons identifiants avant de vous engager. S’il en existe une, clarifiez sa levée avec le prêteur avant de finaliser."
                                    ],
                                    [
                                        "Historique d’entretien",
                                        "Rapprochez factures, véhicule et kilométrage. Notez les travaux en retard et faites vérifier les préconisations du constructeur pour ce moteur."
                                    ],
                                    [
                                        "Self-contained",
                                        "Lisez le certificat actuel et le green warrant ; une case cochée dans l’annonce ne suffit pas. Les contrôles camping figurent plus bas."
                                    ]
                                ]
                            },
                            {
                                "title": "Utiliser les tarifs et échéances actuels",
                                "text": "Consultez les informations NZTA correspondant au véhicule. Le taux RUC standard de type 1 jusqu’à 3 500 kg est actuellement de 76 NZD par 1 000 km, auxquels s’ajoutent des frais de transaction. D’autres catégories et poids ont d’autres taux. Une provision générique de « 100 dollars de rego » ne remplace pas le montant réel."
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "Les règles de WoF évoluent",
                                "text": "NZTA a annoncé des changements à partir du 1er novembre 2026. Vérifiez l’échéance du document et les règles actuelles de fréquence pour ce véhicule, plutôt qu’un ancien résumé fondé sur l’âge."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Warrant of fitness",
                                        "url": "https://www.nzta.govt.nz/vehicles/warrants-and-certificates/warrant-of-fitness"
                                    },
                                    {
                                        "name": "NZTA — Vehicle licensing (rego)",
                                        "url": "https://www.nzta.govt.nz/vehicles/licensing-rego/vehicle-licensing-rego"
                                    },
                                    {
                                        "name": "NZTA — About road user charges",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    },
                                    {
                                        "name": "NZTA — RUC rates and transaction fees",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/ruc-rates-and-transaction-fees"
                                    },
                                    {
                                        "name": "Companies Office — PPSR vehicle checks",
                                        "url": "https://ppsr.companiesoffice.govt.nz/help-centre/information-for-debtors-and-consumers/how-the-ppsr-can-help-when-buying-used-goods/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Inspecter la mécanique et l’aménagement",
                        "items": [
                            {
                                "title": "Choisir une inspection indépendante au périmètre adapté",
                                "text": "Demandez au garage ce que couvre son rapport avant de réserver. Contrôle de sécurité, inspection mécanique avant achat et vérification de l’aménagement répondent à des questions différentes. Expliquez votre voyage et demandez de distinguer urgences de sécurité, entretien probable et points nécessitant une expertise complémentaire. Décidez à partir des constats écrits et des devis."
                            },
                            {
                                "type": "checklist",
                                "title": "Pendant la visite : observations à transmettre au mécanicien",
                                "items": [
                                    "Commencez moteur réellement froid. Observez démarrage et voyants ; notez fumée persistante, fuites et bruits inhabituels.",
                                    "Demandez les justificatifs concernant surchauffe, circuit de refroidissement et distribution si le moteur possède une courroie. Un autocollant sans facture reste une preuve incomplète.",
                                    "Cherchez moquette humide, traces autour des fenêtres et ouvertures de toit, odeur de moisi et panneaux ramollis. Déplacez les coussins pour regarder couchage et rangements.",
                                    "Repérez la corrosion aux éléments structurels, raccords et points de fixation. Faites examiner le dessous par le professionnel ; ne passez pas sous un véhicule soutenu uniquement par un cric.",
                                    "Comparez l’usure des pneus et notez fissures ou dommages. Lors d’un essai autorisé et assuré, signalez tirage, vibrations, patinage, passages difficiles ou température anormale.",
                                    "Faites fonctionner frigo, pompe, éclairage, recharge et batterie auxiliaire en charge. Une simple tension mesurée ne démontre pas la capacité de la batterie.",
                                    "Vérifiez portes, serrures, ceintures, ventilation et accès aux équipements. Demandez les documents des modifications et installations gaz ou secteur ; confiez leur contrôle à un professionnel qualifié."
                                ]
                            },
                            {
                                "title": "Transformer les constats en décision",
                                "text": "Une checklist de visite ne diagnostique pas une panne interne du moteur. Si un problème important reste inexpliqué, demandez une expertise ciblée ou envisagez un autre véhicule. Comparez le devis écrit à votre budget. N’ouvrez jamais un bouchon de refroidissement chaud et ne manipulez pas le gaz ou le câblage secteur pour vérifier une promesse du vendeur."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Used vehicle inspection checks",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Consulter la checklist détaillée d’inspection",
                                "to": "/guide/how-to-inspect-campervan-nz"
                            }
                        ]
                    },
                    {
                        "title": "Vérifier le self-contained et votre itinéraire camping",
                        "items": [
                            {
                                "title": "Contrôler le green warrant et le registre national",
                                "text": "Depuis le 7 juin 2026, l’ancien blue warrant n’est plus reconnu pour cette certification. PGDB précise que carte verte valide, certificat et inscription au registre SCV sont déterminants ; un autocollant promotionnel n’a pas de valeur officielle. La certification exige notamment des toilettes fixes et d’autres équipements conformes. Interrogez une autorité de certification en cas de doute sur l’aménagement."
                            },
                            {
                                "title": "Le certificat ne permet pas de dormir partout",
                                "text": "Consultez règles et panneaux de chaque lieu. Des restrictions restent possibles pour un van certifié. Un véhicule non self-contained peut utiliser campings, holiday parks et autres emplacements autorisés. Intégrez ces frais à l’itinéraire au lieu de supposer que toutes les nuits seront gratuites."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Finaliser l’achat et préparer le départ",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Écrire les conditions",
                                        "text": "Consignez prix, identifiants du véhicule, kilométrage, équipements inclus, défauts déclarés et conditions avant paiement. Fixez la remise et conservez annonce, rapport d’inspection et reçu."
                                    },
                                    {
                                        "title": "Clarifier le WoF",
                                        "text": "NZTA indique que l’acheteur peut demander un WoF de moins d’un mois. Consultez les règles avant d’accepter un WoF plus ancien ou expiré, notamment les accords écrits et restrictions de circulation."
                                    },
                                    {
                                        "title": "Coordonner paiement et remise",
                                        "text": "Choisissez un paiement compris par les deux parties, en tenant compte des plafonds et délais bancaires. Confirmez directement le destinataire. Une capture envoyée par courriel ne prouve pas l’arrivée des fonds. Consignez la remise du véhicule, des clés et documents."
                                    },
                                    {
                                        "title": "Notifier immédiatement NZTA",
                                        "text": "Acheteur et vendeur effectuent chacun leur notification. La démarche en ligne de l’acheteur nécessite un permis néo-zélandais ; sinon, rendez-vous chez un agent NZTA et vérifiez à l’avance les pièces d’identité acceptées."
                                    },
                                    {
                                        "title": "Préparer assurance et documents routiers",
                                        "text": "Demandez des devis adaptés à votre permis, âge, voyage et aménagement avant l’engagement. Lisez garanties et franchise, faites démarrer la couverture à la remise et vérifiez licence du véhicule et RUC applicables avant de conduire."
                                    }
                                ]
                            },
                            {
                                "type": "callout",
                                "variant": "info",
                                "title": "Visiteurs : vérifier le droit de conduire",
                                "text": "Les titulaires admissibles d’un permis voiture étranger disposent actuellement de 18 mois depuis leur dernière arrivée. NZTA annonce 12 mois à partir du 1er novembre 2026 ; le texte de 2024 comporte une disposition transitoire pour les arrivées du 1er novembre 2024 au 31 octobre 2026. Vérifiez auprès de NZTA la règle applicable à votre date d’arrivée avant de conduire. Gardez le permis original valide et la traduction anglaise ou le permis international requis."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    },
                                    {
                                        "name": "Consumer Protection — Sales agreements",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/paying-registering-insuring-car/car-sales-contracts-warranties"
                                    },
                                    {
                                        "name": "NZTA — Driving on New Zealand roads",
                                        "url": "https://www.nzta.govt.nz/travelling-on-our-roads/visitors-and-new-residents/driving-on-nz-roads"
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZ Legislation — Driver Licensing Amendment Rule 2024, transitional provision",
                                        "url": "https://www.legislation.govt.nz/regulation/public/2024/0222/11.0/LMS1000138.html"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Questions fréquentes avant l’achat",
                        "items": [
                            {
                                "type": "faq",
                                "items": [
                                    {
                                        "q": "Faut-il acheter avant d’arriver en Nouvelle-Zélande ?",
                                        "a": "Vous pouvez préparer une sélection et des visites à distance. La décision repose sur de meilleures preuves après vérification du vendeur, du véhicule et du rapport d’inspection. Gardez du temps sur place pour ces étapes et une autre option si le premier van ne convient pas."
                                    },
                                    {
                                        "q": "Un WoF récent remplace-t-il l’inspection mécanique ?",
                                        "a": "Non. NZTA distingue contrôle de sécurité et inspection avant achat. Évaluez l’état à partir du rapport du mécanicien plutôt que de considérer le WoF comme une garantie de fiabilité."
                                    },
                                    {
                                        "q": "Puis-je me fier au montant annoncé de revente ou de rachat ?",
                                        "a": "Une comparaison de prix ou un calculateur ne constitue pas une offre garantie. Pour un contrat de rachat, examinez l’acheteur engagé, les dates, conditions de kilométrage et d’état, déductions et modalités de paiement. Prévoyez une hypothèse de revente moins favorable dans votre budget."
                                    },
                                    {
                                        "q": "Quels documents conserver pour revendre ?",
                                        "a": "Gardez reçu d’achat, rapport d’inspection, factures d’entretien, renouvellements et justificatifs de réparation. Photographiez les équipements inclus lors de la revente et décrivez clairement les défauts non résolus."
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Voir les vans disponibles en Nouvelle-Zélande",
                                "to": "/"
                            }
                        ]
                    }
                ]
            }
        },
        'campervan-buyer-checklist': {
            "title": "Checklist d'inspection d'un van d'occasion en NZ : comment vérifier avant d'acheter",
            "description": "Une routine pré-achat chronologique pour les campervans en Nouvelle-Zélande — les devoirs la veille, les premières minutes sur place, le tour du véhicule, l'essai routier et la remise des clés. Version imprimable gratuite.",
            "heroImage": "/van_inspection_expert_1772133711431.webp",
            "content": {
                "intro": "Cette checklist organise une visite : documents avant le déplacement, démarrage à froid, carrosserie et aménagement, puis essai et remise écrite. Elle repère les points à faire examiner ; elle ne suffit pas à établir l’état mécanique. Prévoyez une inspection indépendante avant de vous engager.",
                "sections": [
                    {
                        "title": "La veille : les devoirs depuis l'auberge",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Vérifier les documents avant la visite",
                                "text": "Comparez plaque, VIN, annonce et informations de contrôle. Résolvez les incohérences ou documents manquants avec le vendeur avant le déplacement."
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
                                        "text": "Interrogez le PPSR avec les identifiants du véhicule pour rechercher les sûretés inscrites. Vérifiez le tarif actuel sur le site officiel. Une sûreté peut mettre l’achat en danger ; demandez conseil si elle subsiste."
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
                                "text": "Imprime la version de poche en anglais de cette checklist (gratuit, aucune inscription)",
                                "href": "/checklist-print.html",
                                "download": true
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "Companies Office — How the PPSR can help when buying used goods",
                                        "url": "https://ppsr.companiesoffice.govt.nz/help-centre/information-for-debtors-and-consumers/how-the-ppsr-can-help-when-buying-used-goods/"
                                    }
                                ]
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
                                        "text": "Observez l’assiette et demandez des informations sur chargement, pneus et suspension. L’inspecteur doit évaluer la cause avant toute conclusion."
                                    },
                                    {
                                        "title": "Compare les quatre pneus",
                                        "text": "Contrôlez taille, sculpture, état et usure ; demandez si les pneus respectent les exigences du véhicule. Des marques différentes ne prouvent pas seules un mauvais entretien."
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
                                "url": "/van_inspection_expert_1772133711431.webp",
                                "caption": "Prends une lampe torche. La vraie histoire du van est écrite en dessous."
                            },
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Jeux de tôles et teinte de peinture",
                                        "text": "Notez jeux irréguliers, différences de peinture et réparations visibles, puis demandez l’historique. Ces indices ne déterminent pas seuls cause ou état structurel."
                                    },
                                    {
                                        "title": "Demander les anciennes réparations de carrosserie",
                                        "text": "Demandez factures et photos des travaux. Un aimant ne prouve pas de manière fiable rouille cachée, accident ou solidité ; faites examiner les zones suspectes."
                                    },
                                    {
                                        "title": "Passe dessous avec ta torche",
                                        "text": "Éclairez depuis une position sûre pour chercher dommage ou corrosion. Ne passez pas sous un véhicule non soutenu correctement. Faites contrôler longerons, plancher et bas de caisse avec un accès adapté."
                                    },
                                    {
                                        "title": "Joints de vitres et jonctions de toit",
                                        "text": "Cherchez cloques, joints altérés et auréoles. Demandez à l’inspecteur s’il y a corrosion ou infiltration et quelle en est l’étendue."
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
                                        "text": "Contrôlez huile et refroidissement uniquement sans risque et selon les consignes du véhicule. N’ouvrez jamais un circuit chaud. Mélange, fuite ou perte de liquide nécessitent un diagnostic ; un dépôt au bouchon ne prouve pas seul un joint de culasse."
                                    },
                                    {
                                        "title": "Pose la question de la courroie de distribution",
                                        "text": "Identifiez le moteur et sa distribution par courroie ou chaîne. Comparez factures et préconisations constructeur ; demandez à l’inspecteur les travaux à prévoir. L’absence de facture ne prouve pas un remplacement."
                                    },
                                    {
                                        "title": "Conduis-le comme on conduit en Nouvelle-Zélande",
                                        "text": "Convenez d’un parcours sûr et respectez limites et conditions. Observez direction, freinage, température et puissance à vitesse adaptée. Faites examiner bruits, vibrations et voyants sans tenter de manœuvre dangereuse."
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
                                "text": "Demandez un devis à un inspecteur indépendant, le contenu du rapport et les limites concernant l’aménagement. L’intérêt de l’inspection ne dépend pas d’un seuil d’achat de 5 000 $. Obtenez constats écrits et devis avant de décider."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Tips for buying a used car",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    }
                                ]
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
                                        "text": "Vérifiez certificat, échéance, warrant vert et inscription au registre SCV pour ce véhicule. L’ancien blue warrant n’est plus reconnu depuis le 7 juin 2026. Un autocollant promotionnel ne prouve pas la certification."
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
                                        "text": "Testez les appareils avec le vendeur et relevez type, capacité, âge et charge de la batterie. Dix minutes de fonctionnement ne prouvent pas son état. En cas de doute, faites contrôler capacité et installation."
                                    },
                                    {
                                        "title": "Fais dire quelque chose à « il y a du solaire »",
                                        "text": "Demande la puissance du panneau (en watts) et la marque du régulateur. Sans chiffres, « solaire » peut désigner un chargeur d'appoint et un autocollant optimiste."
                                    },
                                    {
                                        "title": "Faire vérifier le gaz par un professionnel qualifié",
                                        "text": "Demandez les documents de l’installation et faites intervenir un professionnel qualifié en cas de doute. WorkSafe interdit l’usage de réchauds, chauffages et lampes à gaz portables à l’intérieur d’un camping-car ou van, auvents compris. Si vous sentez du gaz, arrêtez le test et suivez les consignes officielles."
                                    },
                                    {
                                        "title": "Soulève le matelas",
                                        "text": "Les auréoles brunes sur le contreplaqué en dessous sont l'autobiographie honnête de chaque fuite de toit que le van a connue."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "WorkSafe — Gas safety for caravans and motorhomes",
                                        "url": "https://www.worksafe.govt.nz/managing-health-and-safety/consumers/safe-living-with-gas/recreational-safety/gas-safety-for-caravans-and-motorhomes/"
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
                                        "title": "Vérifier inspection et licence séparément",
                                        "text": "Lisez date et échéance du WoF puis état de la rego. L’acheteur peut exiger un WoF de moins d’un mois ; gardez l’accord pour un contrôle plus ancien ou expiré selon NZTA."
                                    },
                                    {
                                        "title": "Les RUC s’appliquent-ils ? Lire la licence",
                                        "text": "Pour tout véhicule soumis aux RUC, pas seulement diesel, comparez distance payée et compteur. Réglez les écarts avant paiement ; l’acheteur peut devoir les payer."
                                    },
                                    {
                                        "title": "Rédiger le contrat avant le paiement",
                                        "text": "Inscrivez coordonnées, date, prix, plaque, VIN, équipement, défauts connus et conditions. Gardez exemplaires signés et preuve du paiement. « Sold as seen » ne règle pas tout litige et ne supprime pas les obligations légales."
                                    },
                                    {
                                        "title": "Notifier NZTA à la remise",
                                        "text": "Acheteur et vendeur notifient immédiatement NZTA. La démarche acheteur en ligne exige un permis néo-zélandais ; sinon, passez par un agent avec les justificatifs requis. Le registre ne prouve pas la propriété juridique."
                                    },
                                    {
                                        "title": "Confirmer l’assurance avant de conduire",
                                        "text": "Demandez les conditions pour votre permis, âge, voyage et aménagement avant l’achat, avec prise d’effet à la remise. Acceptation et délai varient selon l’assureur."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    },
                                    {
                                        "name": "NZTA — About RUC",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    },
                                    {
                                        "name": "Consumer Protection — Car insurance",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/paying-registering-insuring-car/car-insurance"
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
                                "text": "Une identité incertaine, une sûreté, un problème de sécurité ou une inspection refusée justifient d’arrêter les démarches. L’urgence du départ ne remplace pas les vérifications."
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
                                "text": "Les informations des annonces viennent des vendeurs. Avec une plaque, le lien CarJam mène à des contrôles externes ; il ne prouve pas que Kiwi Van Market a vérifié le véhicule ou acheté un rapport complet."
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
                                        "a": "Un outil compatible peut lire certains défauts et informations de diagnostic, selon le véhicule et l’appareil. Des codes effacés ou défauts intermittents peuvent être absents. Un résultat vierge ne prouve pas la santé du moteur ou de la boîte ; demandez les contrôles adaptés à l’inspecteur."
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
            },
            "dateModified": "2026-10-15"
        },
        'wof-rego-ruc-insurance-nz': {
            "title": "WoF, rego, RUC et assurance NZ : contrôles avant l’achat d’un van",
            "description": "Vérifiez WoF, licence du véhicule, RUC et assurance avant d’acheter un van en Nouvelle-Zélande. Sources officielles et changements des inspections.",
            "heroImage": "https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "Avant de payer un campervan, contrôlez séparément son inspection de sécurité, sa licence de circulation, les éventuelles charges kilométriques et votre assurance. Un badge dans l’annonce ne remplace pas les documents. Relevez plaque, dates et kilométrage sur le véhicule.",
                "sections": [
                    {
                        "title": "WoF : inspection de sécurité et changements en novembre",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Ce que le contrôle indique",
                                "text": "Le WoF porte sur des critères de sécurité au moment de l’inspection. Il ne prouve ni la fiabilité du moteur, ni l’état de la boîte, ni la qualité de l’aménagement. Prévoyez une inspection préachat distincte et demandez ce qu’elle couvre."
                            },
                            {
                                "title": "Lire l’échéance et les règles actuelles",
                                "text": "Au 15 octobre 2026, la fréquence dépend encore de la première immatriculation. Les changements commencent le 1er novembre 2026, avec un calendrier différé pour certains véhicules. Consultez NZTA pour le véhicule concerné au lieu de supposer que tous les vans sont contrôlés tous les six ou douze mois."
                            },
                            {
                                "title": "Au moment de l’achat",
                                "text": "Selon NZTA, l’acheteur peut exiger un WoF de moins d’un mois. Accepter un contrôle plus ancien doit être confirmé par écrit. Sans inspection valide, la circulation est limitée aux déplacements pour réparation ou inspection et le véhicule doit rester sûr pour ce trajet. Plusieurs mois de validité restants ne prouvent pas que le contrôle est récent."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Warrant of fitness",
                                        "url": "https://www.nzta.govt.nz/vehicles/warrants-and-certificates/warrant-of-fitness"
                                    },
                                    {
                                        "name": "NZTA — Changes to light vehicle inspections",
                                        "url": "https://nzta.govt.nz/projects-and-consultations/have-your-say/past-consultations/considering-changes-to-light-vehicle-inspections/changes-to-light-vehicle-inspections"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Rego : licence de circulation distincte de l’immatriculation",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Lire l’étiquette et vérifier l’identité du véhicule",
                                "text": "La rego est la licence permettant d’utiliser un véhicule immatriculé sur route. L’immatriculation désigne la personne responsable ; le registre ne prouve pas la propriété juridique. Comparez plaque, VIN et dates."
                            },
                            {
                                "title": "Prévoir le tarif du véhicule",
                                "text": "Les frais dépendent du véhicule et de son usage, avec une composante ACC et des frais administratifs. NZTA publie les tarifs et un outil par plaque. Une hypothèse de « 100 $ par an » ne constitue pas un budget fiable pour un campervan."
                            },
                            {
                                "title": "Licence expirée ou suspendue",
                                "text": "Distinguez licence expirée, licence mise en attente et immatriculation annulée : les démarches diffèrent. Vérifiez les conditions avant de conduire. Vendeur et acheteur notifient immédiatement NZTA ; sans permis néo-zélandais, l’acheteur passe par un agent."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Licensing (rego) fees",
                                        "url": "https://www.nzta.govt.nz/vehicles/licensing-rego/vehicle-fees/licensing-fees"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "RUC : énergie, catégorie et distance payée",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Les RUC ne concernent pas uniquement le diesel",
                                "text": "Les véhicules diesel et de nombreux véhicules électriques paient des road user charges. Le type et le poids déterminent le tarif. Le type 1 standard jusqu’à 3 500 kg coûte 76 NZD par 1 000 km, plus les frais de transaction. Cet exemple ne s’applique pas à tous les camping-cars."
                            },
                            {
                                "title": "Comparer la licence kilométrique au compteur",
                                "text": "Le vendeur doit fournir une licence RUC à jour. NZTA avertit que l’acheteur peut devoir régler les kilomètres impayés. Résolvez tout écart avant paiement et gardez une trace écrite."
                            },
                            {
                                "title": "Les kilomètres inutilisés restent avec le véhicule",
                                "text": "La vente ne donne pas droit au remboursement des RUC inutilisés. La licence appartient à ce véhicule : tenez compte de la distance restante dans le prix. D’autres règles de remboursement concernent certains usages hors route ou l’annulation d’immatriculation."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — About RUC",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    },
                                    {
                                        "name": "NZTA — RUC rates and transaction fees",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/ruc-rates-and-transaction-fees"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Assurance : obtenir les conditions avant de s’engager",
                        "icon": "Shield",
                        "items": [
                            {
                                "type": "table",
                                "title": "Comparer les garanties",
                                "headers": [
                                    "Formule",
                                    "Questions à poser"
                                ],
                                "rows": [
                                    [
                                        "Au tiers",
                                        "Quels dommages causés au véhicule ou aux biens d’autrui sont couverts ?"
                                    ],
                                    [
                                        "Tiers, incendie et vol",
                                        "Quelles garanties concernent le van, l’aménagement et les affaires ?"
                                    ],
                                    [
                                        "Tous risques",
                                        "Quels dommages à votre véhicule sont couverts, sur quelle valeur et avec quelle franchise ?"
                                    ]
                                ],
                                "caption": "Lisez conditions et exclusions : ce tableau sert à comparer des devis."
                            },
                            {
                                "title": "Déclarer le conducteur et l’usage réels",
                                "text": "Demandez les conditions pour votre permis étranger, âge, conducteurs, aménagement, durée de séjour, travail et routes prévues. Acceptation, tarif et indemnisation dépendent du contrat. Passeport, adresse d’auberge ou formulaire en ligne ne garantissent pas la couverture."
                            },
                            {
                                "title": "Vérifier les conditions de sécurité",
                                "text": "Interrogez l’assureur sur ces exigences. N’affirmez pas qu’un WoF expiré annule automatiquement toute garantie, ni qu’un WoF valide assure l’indemnisation."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "Consumer Protection — Car insurance",
                                        "url": "https://www.consumerprotection.govt.nz/help-product-service/cars/paying-registering-insuring-car/car-insurance"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "ACC et checklist de remise du véhicule",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "L’ACC couvre des blessures, pas le véhicule ou tout le voyage",
                                "text": "Le régime sans faute peut couvrir des blessures accidentelles admissibles en Nouvelle-Zélande, y compris pour les visiteurs. Il ne remplace pas l’assurance du véhicule, les maladies, les perturbations du voyage ou le retour chez vous. Certains frais de soins peuvent rester à payer : consultez ACC et votre assurance voyage."
                            },
                            {
                                "type": "checklist",
                                "items": [
                                    "Comparer plaque et VIN aux documents.",
                                    "Lire séparément date du WoF et échéance.",
                                    "Confirmer l’état de la rego et le tarif réel.",
                                    "Si les RUC s’appliquent, comparer distance payée et compteur.",
                                    "Obtenir les conditions d’assurance pour votre permis et votre voyage.",
                                    "Conserver le contrat et les deux notifications NZTA."
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "ACC — Visitors injured in New Zealand",
                                        "url": "https://www.acc.co.nz/im-injured/what-we-cover/if-youre-a-visitor-injured-in-new-zealand"
                                    }
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Suivre le guide complet d’achat et de remise du van",
                                "to": "/guide/buying-campervan-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Emporter la checklist lors de la visite",
                                "to": "/guide/campervan-buyer-checklist"
                            }
                        ]
                    }
                ]
            }
        },
        'freedom-camping-nz': {
            "title": "Freedom camping en Nouvelle-Zélande : warrant vert, règles et amendes",
            "description": "Vérifiez certification self-contained actuelle, règles locales et amendes avant de préparer un voyage en van en Nouvelle-Zélande.",
            "heroImage": "https://images.unsplash.com/photo-1504280390367-361c6d9f38f4?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "Commencez par les règles du gestionnaire pour l’endroit précis où vous souhaitez dormir. Le certificat concerne le véhicule ; il ne donne pas accès à toutes les plages, parkings ou routes. Prévoyez des arrêts autorisés et une solution de secours en camping.",
                "sections": [
                    {
                        "title": "Vérifier séparément véhicule et emplacement",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "La certification actuelle exige un warrant vert valide",
                                "text": "Depuis le 7 juin 2026, l’ancien blue warrant n’est plus reconnu. PGDB précise que certificat, carte verte affichée et inscription au registre SCV sont les preuves pertinentes. Un autocollant vert promotionnel n’a pas de valeur officielle. Les équipements doivent notamment comprendre des toilettes fixes."
                            },
                            {
                                "title": "Sans certification, choisir un emplacement adapté",
                                "text": "Le principe général pour le freedom camping en véhicule sur terrain public est la certification, avec des exceptions désignées. Les vans non certifiés peuvent utiliser des campings adaptés, holiday parks et emplacements expressément autorisés. Vérifiez la règle du lieu et de son gestionnaire."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Préparer les étapes avec les informations officielles",
                        "icon": "MapPin",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Identifier le gestionnaire",
                                        "text": "Recherchez le conseil local, Department of Conservation, LINZ ou opérateur privé responsable. Consultez carte, avis et conditions de réservation actuels."
                                    },
                                    {
                                        "title": "Lire toutes les conditions",
                                        "text": "Vérifiez certification, nombre de personnes, horaires, durée, fermetures saisonnières et déchets. Une limite nationale de « une ou deux nuits » ne s’applique pas uniformément partout."
                                    },
                                    {
                                        "title": "Lire les panneaux à l’arrivée",
                                        "text": "Les applications facilitent la recherche ; contrôlez les informations officielles et la signalisation sur place. Si le site est complet ou ambigu, choisissez une solution autorisée plutôt qu’un stationnement voisin supposé permis."
                                    },
                                    {
                                        "title": "Prévoir eau et vidange",
                                        "text": "Utilisez les installations autorisées et emportez les déchets. Planifiez ces étapes avec les nuits ; l’autonomie dépend de la capacité réelle des réservoirs."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "New Zealand Government — Freedom camping",
                                        "url": "https://www.govt.nz/browse/recreation-and-the-environment/freedom-camping/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Comprendre les sanctions",
                        "icon": "AlertTriangle",
                        "items": [
                            {
                                "type": "table",
                                "title": "Exemples du règlement national",
                                "headers": [
                                    "Infraction",
                                    "Frais d’infraction"
                                ],
                                "rows": [
                                    [
                                        "Camper en violation d’une interdiction ou restriction locale",
                                        "400 NZD"
                                    ],
                                    [
                                        "Ne pas afficher le warrant lorsque requis",
                                        "200 NZD"
                                    ],
                                    [
                                        "Afficher un warrant altéré ou frauduleux",
                                        "600 NZD"
                                    ],
                                    [
                                        "Déposer des déchets en freedom camping dans une zone concernée",
                                        "800 NZD"
                                    ]
                                ],
                                "caption": "Ce sont des exemples de frais d’infraction, pas une liste complète ni les maxima au tribunal. Le texte et les circonstances comptent."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "New Zealand Legislation — Freedom camping infringement penalties",
                                        "url": "https://www.legislation.govt.nz/regulation/public/2023/0136/latest/whole.html"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Avant d’acheter un van annoncé self-contained",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "checklist",
                                "items": [
                                    "Lire le certificat, sa date et les références du véhicule.",
                                    "Vérifier le warrant vert actuel et le registre SCV.",
                                    "Demander si des modifications affectent la certification.",
                                    "Comparer l’itinéraire aux restrictions officielles.",
                                    "Budgéter campings et vidanges au lieu de supposer toutes les nuits gratuites."
                                ]
                            },
                            {
                                "type": "cta",
                                "text": "Lire le guide complet d’achat d’un campervan",
                                "to": "/guide/buying-campervan-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Comparer les vans déclarés self-contained par les vendeurs",
                                "to": "/?selfContained=true"
                            }
                        ]
                    }
                ]
            }
        },
        'selling-campervan-nz': {
            "title": "Vendre un campervan en Nouvelle-Zélande : annonce, paiement et remise",
            "description": "Préparez la vente d’un van en NZ : prix affiché, photos honnêtes, inspection, paiement et notifications NZTA. Checklist avec sources officielles.",
            "heroImage": "https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=1200",
            "content": {
                "intro": "Préparez l’annonce avant votre date de départ. Comparez les prix affichés, rassemblez les documents et gardez du temps pour visites et inspections. Aucun délai ni prix de revente n’est garanti ; prévoyez une solution si les demandes tardent.",
                "sections": [
                    {
                        "title": "Préparer le Van à la Vente",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "title": "Nettoyage en Profondeur",
                                "text": "La première impression est capitale. Présentez un van propre, vide de vos objets personnels et qui sent bon."
                            },
                            {
                                "title": "Petit Entretien",
                                "text": "Réparez les petits défauts : balais d'essuie-glace, ampoules... ça rassure l'acheteur sur le soin apporté."
                            },
                            {
                                "title": "Vérifier les conditions du WoF",
                                "text": "L’acheteur peut exiger un WoF de moins d’un mois. S’il accepte un contrôle plus ancien, conservez son accord écrit. Un WoF expiré impose aussi un accord écrit et limite la circulation. Consultez les règles de vente NZTA ; six mois restants ne prouvent pas un contrôle récent."
                            },
                            {
                                "title": "Rassembler les documents réels",
                                "text": "Regroupez factures d’entretien, WoF, rego, distance RUC applicable et certification actuelle de l’aménagement. Faites correspondre documents et annonce, en déclarant les défauts connus."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Selling a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/selling-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Réussir ses Photos",
                        "icon": "Car",
                        "items": [
                            {
                                "title": "Le Bon Moment",
                                "text": "Prenez les photos à la \"golden hour\" (lever ou coucher du soleil) pour une lumière flatteuse."
                            },
                            {
                                "title": "Tous les Angles",
                                "text": "Extérieur (avant/arrière/côtés), lit déplié, cuisine, poste de conduite et moteur."
                            },
                            {
                                "title": "Montrer clairement le véhicule",
                                "text": "Publiez assez de photos nettes pour présenter état et équipement. Ajoutez des gros plans de l’usure et des défauts plutôt que de traiter un nombre de photos comme une promesse de vente rapide."
                            },
                            {
                                "title": "Honnêteté",
                                "text": "Montrez aussi les petits défauts ou rayures. Ça évite de perdre du temps en visite."
                            }
                        ]
                    },
                    {
                        "title": "Stratégie de Prix",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Comparer les prix affichés actuels",
                                "text": "Rapprochez année, moteur, kilométrage, aménagement, lieu et état. Un prix d’annonce n’est pas une vente conclue ; utilisez l’échantillon du site comme un élément et expliquez les écarts."
                            },
                            {
                                "title": "Fixer votre propre limite de négociation",
                                "text": "Tenez compte des réparations connues et de la date de départ. Aucun pourcentage de négociation ni rabais saisonnier fixe ne s’applique à tous les vans."
                            },
                            {
                                "type": "cta",
                                "text": "Lire l’échantillon des prix affichés et sa méthode",
                                "to": "/campervan-prices-nz"
                            }
                        ]
                    },
                    {
                        "title": "Où Publier",
                        "icon": "MapPin",
                        "items": [
                            {
                                "title": "Kiwi Van Market",
                                "text": "Annonces gratuites, public 100% backpacker. Publiez ici en priorité !"
                            },
                            {
                                "title": "Groupes Facebook",
                                "text": "Certains groupes \"Backpackers NZ\" sont très actifs pour les ventes rapides."
                            },
                            {
                                "title": "Auberges de Jeunesse",
                                "text": "Les tableaux d'affichage physiques dans les grandes villes marchent toujours."
                            }
                        ]
                    },
                    {
                        "title": "Paiement et remise du véhicule",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "checklist",
                                "items": [
                                    "Organiser une visite sûre et permettre une inspection indépendante.",
                                    "Inscrire identifiants, prix, date, équipement inclus et conditions dans le contrat.",
                                    "Vérifier le paiement reçu auprès de votre banque avant les clés ; une capture d’écran ne suffit pas.",
                                    "Notifier immédiatement NZTA côté vendeur et vérifier la démarche de l’acheteur.",
                                    "Un véhicule soumis aux RUC doit avoir une distance payée à jour ; les kilomètres inutilisés restent avec le véhicule.",
                                    "Pour un buyback, préciser signataires, date, prix, kilométrage, état, déductions et paiement par écrit."
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Selling a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/selling-a-vehicle"
                                    },
                                    {
                                        "name": "NZTA — About RUC",
                                        "url": "https://www.nzta.govt.nz/vehicles/road-user-charges/about-ruc"
                                    }
                                ]
                            }
                        ]
                    }
                ],
                "warnings": [
                    "Déclarez les défauts connus et gardez annonce et contrat.",
                    "Prévoyez du temps pour les inspections et une solution si le van ne se vend pas avant le départ."
                ],
                "cta": {
                    "title": "Mettre votre campervan en vente",
                    "text": "Créez une annonce gratuite avec photos claires, caractéristiques exactes et lieu de remise.",
                    "buttonText": "Créer une annonce gratuite",
                    "buttonLink": "/sell"
                }
            },
            "dateModified": "2026-10-15"
        },
        'how-to-inspect-campervan-nz': {
            "title": "Organiser une inspection indépendante d’un campervan en Nouvelle-Zélande",
            "description": "Choisir une inspection préachat en NZ : définir les contrôles mécaniques et de l’aménagement, obtenir devis et rapport, puis évaluer les travaux avant l’achat.",
            "heroImage": "https://images.unsplash.com/photo-1487754180451-c456f719a1fc?w=1200",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "La visite permet de sélectionner un van à examiner davantage. L’inspection indépendante aide à évaluer son état avant paiement. Choisissez un prestataire séparément du vendeur et convenez à l’avance de ce qui pourra être établi sur le véhicule et son aménagement.",
                "sections": [
                    {
                        "title": "1. Choisir un prestataire et préciser sa mission",
                        "icon": "Shield",
                        "items": [
                            {
                                "title": "Transmettre les informations du véhicule",
                                "text": "Donnez plaque, marque, modèle, année, moteur ou carburant, kilométrage et lieu. Mentionnez modifications, équipement et inquiétudes relevées à la visite. Demandez si cette version, ce gabarit et cet aménagement peuvent être contrôlés au lieu prévu."
                            },
                            {
                                "title": "Demander le contenu du devis",
                                "text": "Obtenez prix, disponibilité, méthode et exclusions par écrit. Demandez si essai routier, accès au dessous, diagnostic électronique, fuites, corrosion, freins, pneus, transmission et factures sont inclus. Distinguez observations visuelles et mesures. Ne supposez pas que démontage, tests internes du moteur ou prévision de fiabilité font partie de toute inspection."
                            },
                            {
                                "title": "Organiser l’accès avec le vendeur",
                                "text": "Confirmez rendez-vous, accord pour l’essai, documents et paiement. Demandez si possible un vrai démarrage à froid. Un ancien rapport du vendeur apporte du contexte ; discutez d’un examen commandé par vous plutôt que de présumer qu’il décrit l’état actuel."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Tips for buying a used car",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    },
                                    {
                                        "name": "AA — Pre Purchase Inspections",
                                        "url": "https://www.aa.co.nz/cars/buying-and-selling/pre-purchase-inspections/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "2. Distinguer mécanique et équipement de vie",
                        "icon": "Car",
                        "items": [
                            {
                                "type": "table",
                                "title": "Questions à poser au prestataire",
                                "headers": [
                                    "Domaine",
                                    "Points à confirmer"
                                ],
                                "rows": [
                                    [
                                        "Véhicule de base",
                                        "Quels contrôles de sécurité, mécanique et corrosion sont compris ? Le dessous peut-il être examiné sans risque ?"
                                    ],
                                    [
                                        "Entretien",
                                        "Le rapport relève-t-il documents manquants et travaux à étudier ?"
                                    ],
                                    [
                                        "Équipement de vie",
                                        "Eau, frigo, batteries, recharge et infiltrations sont-ils inclus ou faut-il un autre spécialiste ?"
                                    ],
                                    [
                                        "Gaz et électricité",
                                        "Qui peut examiner installation et documents requis ? Quels points dépassent la compétence de l’inspecteur mécanique ?"
                                    ],
                                    [
                                        "Statut self-contained",
                                        "Vérifiez warrant vert, certificat et registre SCV. Les modifications concernent-elles la certification ?"
                                    ]
                                ],
                                "caption": "Inspection mécanique, certification gaz et certification self-contained répondent à des questions différentes. Contactez le prestataire compétent pour chacune."
                            },
                            {
                                "title": "Ne pas tester un équipement suspect",
                                "text": "Arrêtez en cas de fuite de gaz ou câblage dangereux présumé. WorkSafe interdit les réchauds, chauffages et lampes à gaz portables à l’intérieur du van et sous l’auvent. Faites examiner toute installation incertaine par un professionnel du gaz qualifié."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "WorkSafe — Gas safety for caravans and motorhomes",
                                        "url": "https://www.worksafe.govt.nz/managing-health-and-safety/consumers/safe-living-with-gas/recreational-safety/gas-safety-for-caravans-and-motorhomes/"
                                    },
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "3. Lire le rapport et chiffrer les travaux",
                        "icon": "CheckCircle",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Distinguer les urgences",
                                        "text": "Demandez de séparer sécurité immédiate, entretien à prévoir, défauts à diagnostiquer et points non examinés. Identifiez les limites dues à l’accès, à la météo ou à l’état du véhicule."
                                    },
                                    {
                                        "title": "Obtenir des devis avant de négocier",
                                        "text": "Faites estimer les travaux importants par un réparateur adapté. Un « prix de joint de culasse » ou « budget suspension » générique ne remplace pas diagnostic et devis pour le véhicule réel."
                                    },
                                    {
                                        "title": "Comparer budget et calendrier",
                                        "text": "Ajoutez inspection, travaux immédiats et réserve au prix d’achat. Les réparations peuvent-elles être terminées avant le voyage ? Vous pouvez négocier, demander d’autres contrôles ou renoncer ; le rapport ne vous oblige pas à acheter."
                                    }
                                ]
                            },
                            {
                                "title": "Conserver les documents",
                                "text": "Gardez rapport, périmètre, déclarations et devis. Si la vente se fait, conservez le contrat et notifiez NZTA côté acheteur. Un WoF valide est un contrôle de sécurité, pas une garantie mécanique."
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "4. Préparer la visite",
                        "icon": "MapPin",
                        "items": [
                            {
                                "type": "cta",
                                "text": "Utiliser la checklist visuelle détaillée avant l’inspection",
                                "to": "/guide/campervan-buyer-checklist"
                            },
                            {
                                "type": "cta",
                                "text": "Lire budget, achat et remise du véhicule",
                                "to": "/guide/buying-campervan-nz"
                            }
                        ]
                    }
                ],
                "cta": {
                    "title": "Sélectionner un van à faire inspecter",
                    "text": "Comparez les informations déclarées, organisez une visite et prévoyez des contrôles indépendants avant de vous engager.",
                    "buttonText": "Voir les annonces actuelles",
                    "buttonLink": "/"
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
            "title": "10 modèles de campervans à comparer avant un achat en Nouvelle-Zélande",
            "description": "Comparez dix modèles et variantes de vans pour un voyage en NZ : questions de visite, aménagement et prix affichés, sans promesse de fiabilité ou de revente.",
            "heroImage": "/top10-van.avif",
            "dateModified": "2026-10-15",
            "content": {
                "intro": "Cette sélection éditoriale aide à organiser vos visites ; évaluez ensuite chaque véhicule par ses caractéristiques, son état et ses documents. L’ordre n’est pas un classement de fiabilité. Kiwi Van Market n’a pas testé ces véhicules ni collecté des ventes conclues par modèle. L’état individuel et l’aménagement adapté à votre voyage comptent davantage qu’une réputation.",
                "sections": [
                    {
                        "title": "Dix modèles et variantes : questions pour le vendeur et l’inspecteur",
                        "icon": "Car",
                        "items": [
                            {
                                "type": "table",
                                "title": "Comparer le véhicule réel",
                                "headers": [
                                    "Famille",
                                    "Points à établir lors de la visite"
                                ],
                                "rows": [
                                    [
                                        "Toyota Hiace, anciennes générations",
                                        "Comparez code moteur, transmission, empattement et factures. Faites évaluer refroidissement et corrosion ; le logo ne détermine pas l’état."
                                    ],
                                    [
                                        "Toyota Hiace, variantes série 200",
                                        "Confirmez année, moteur, entretien, charge utile après aménagement et dimensions. Comparez des spécifications équivalentes plutôt que tous les Hiace ensemble."
                                    ],
                                    [
                                        "Nissan Caravan / Homy",
                                        "Identifiez génération et moteur. Demandez contrôles à froid, transmission, rouille et factures des travaux nécessaires."
                                    ],
                                    [
                                        "Nissan Elgrand",
                                        "Mesurez lit et rangement avec sièges et aménagement réels. Vérifiez places légales, charge utile et budget carburant sur votre trajet."
                                    ],
                                    [
                                        "Mitsubishi Delica",
                                        "Vérifiez si le véhicule est réellement à deux ou quatre roues motrices. Faites contrôler le système 4x4, ses pneus et son entretien s’il compte pour vous. Confirmez accès aux routes et assurance."
                                    ],
                                    [
                                        "Toyota Estima / Previa",
                                        "Testez le couchage avec vos bagages. Identifiez moteur, transmission et accès pour l’entretien ; les générations ne sont pas des comparaisons interchangeables."
                                    ],
                                    [
                                        "Mazda Bongo / Friendee",
                                        "Distinguez utilitaire Bongo et aménagement Friendee. Si le toit se relève, contrôlez mécanisme, joints, toile et traces d’infiltration."
                                    ],
                                    [
                                        "Ford Transit",
                                        "Relevez carrosserie, moteur, transmission, entretien et poids aménagé. Demandez les travaux à prévoir et la prise en charge locale de cette version."
                                    ],
                                    [
                                        "Toyota TownAce / LiteAce",
                                        "Comparez dimensions utilisables, places légales et charge utile à vos besoins. Confirmez entretien et moteur ; petit gabarit ne garantit pas faible coût global."
                                    ],
                                    [
                                        "Mitsubishi L300 / Express",
                                        "Vérifiez modèle, moteur, structure, factures et sécurité de l’aménagement. Intégrez réparations et inspection dans la comparaison d’un petit prix."
                                    ]
                                ],
                                "caption": "Générations, moteurs et aménagements varient. Ces questions préparent une inspection indépendante et ne constituent pas un diagnostic."
                            }
                        ]
                    },
                    {
                        "title": "Comparer des véhicules équivalents",
                        "icon": "Shield",
                        "items": [
                            {
                                "type": "steps",
                                "items": [
                                    {
                                        "title": "Noter la version précise",
                                        "text": "Relevez année, moteur, carburant, transmission, kilométrage, places, couchages, dimensions et poids chargé. Comparez-les avant de conclure qu’une annonce est moins chère."
                                    },
                                    {
                                        "title": "Séparer prix affiché et budget total",
                                        "text": "Ajoutez inspection, entretien immédiat, pneus, assurance, rego et RUC applicables. Prévoyez campings et revente moins favorable. Un petit prix peut laisser peu de marge pour les réparations."
                                    },
                                    {
                                        "title": "Contrôler aménagement et documents",
                                        "text": "Testez eau, frigo et électricité. Rapprochez les certificats du véhicule. Faites vérifier certification self-contained actuelle et documents gaz ou électricité par une personne qualifiée si nécessaire."
                                    },
                                    {
                                        "title": "Obtenir un rapport indépendant",
                                        "text": "Interrogez l’inspecteur sur moteur précis, corrosion, transmission et entretien à prévoir. Un WoF valide ne garantit pas la mécanique. Utilisez constats et devis plutôt qu’un coût supposé par modèle."
                                    }
                                ]
                            },
                            {
                                "type": "sources",
                                "items": [
                                    {
                                        "name": "NZTA — Tips for buying a used car",
                                        "url": "https://www.nzta.govt.nz/vehicles/choosing-the-right-vehicle/tips-for-buying-a-used-car"
                                    },
                                    {
                                        "name": "NZTA — Buying a vehicle",
                                        "url": "https://www.nzta.govt.nz/vehicles/buying-or-selling-a-vehicle/buying-a-vehicle"
                                    },
                                    {
                                        "name": "PGDB — Self-contained certification for private vehicles",
                                        "url": "https://www.pgdb.co.nz/self_contained_vehicles/private_vehicle_owners/"
                                    }
                                ]
                            }
                        ]
                    },
                    {
                        "title": "Utiliser prudemment les prix du site",
                        "icon": "DollarSign",
                        "items": [
                            {
                                "title": "Ce que permet la comparaison des annonces",
                                "text": "L’index résume des annonces actives admissibles sur Kiwi Van Market. Il ne mesure pas les ventes conclues, une part du marché national, la fiabilité ou votre future revente. Certains groupes ont trop peu d’annonces pour publier une médiane."
                            },
                            {
                                "type": "cta",
                                "text": "Lire l’échantillon de prix affichés et sa méthode",
                                "to": "/campervan-prices-nz"
                            },
                            {
                                "type": "cta",
                                "text": "Suivre les contrôles et démarches du guide d’achat",
                                "to": "/guide/buying-campervan-nz"
                            }
                        ]
                    }
                ],
                "cta": {
                    "title": "Comparer les annonces actuelles",
                    "text": "Étudiez les informations déclarées par le vendeur, organisez une visite et vérifiez les documents avant l’achat.",
                    "buttonText": "Voir les campervans à vendre",
                    "buttonLink": "/"
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
                                "url": "/van_inspection_expert_1772133711431.webp",
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
                                "url": "/self_contained_sticker_van_1772133744005.webp",
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
            "heroImage": "/van_inspection_expert_1772133711431.webp",
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
                                "url": "/van_inspection_expert_1772133711431.webp",
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
