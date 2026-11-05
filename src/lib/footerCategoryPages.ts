export interface HourlyServiceItem {
  id: string
  title: string
  category: string
  tagline: string
  startingRate: number
  minHours: number
  maxHours: number
  badge: string
  inclusions: string[]
  idealFor: string[]
  exploreLink: string
}

export interface ComparisonRow {
  feature: string
  hourlyAdvantage: string
  traditionalTaxi: string
  fullDayRental: string
}

export interface HourlyServicesSettings {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  services: HourlyServiceItem[]
  comparison_title: string
  comparison_subtitle: string
  comparison_rows: ComparisonRow[]
  cta_title: string
  cta_subtitle: string
}

export interface TouristPortalFeature {
  title: string
  description: string
  link: string
  badge: string
}

export interface TouristStep {
  step: string
  title: string
  description: string
}

export interface TouristProtection {
  title: string
  description: string
}

export interface TouristPortalSettings {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  features: TouristPortalFeature[]
  steps_title: string
  steps_subtitle: string
  steps: TouristStep[]
  protections: TouristProtection[]
  banner_title: string
  banner_subtitle: string
  helpline_phone: string
}

export interface HostOperatorClass {
  title: string
  earningRange: string
  tagline: string
  requirements: string[]
  link: string
}

export interface HostBenefit {
  title: string
  description: string
}

export interface HostTool {
  title: string
  description: string
  link: string
  badge: string
}

export interface ProvidersHostsSettings {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  benefits: HostBenefit[]
  operator_classes: HostOperatorClass[]
  tools: HostTool[]
  cta_title: string
  cta_subtitle: string
}

export interface LegalDocumentItem {
  title: string
  tagline: string
  link: string
  badge: string
  keyPoints: string[]
}

export interface DisputeStep {
  step: string
  title: string
  desc: string
}

export interface SupportLegalSettings {
  hero_eyebrow: string
  hero_title: string
  hero_subtitle: string
  documents: LegalDocumentItem[]
  dispute_title: string
  dispute_subtitle: string
  dispute_steps: DisputeStep[]
  helpline_phone: string
  whatsapp_number: string
  support_email: string
}

export interface FooterContactSettings {
  helpline_phone: string
  whatsapp_number: string
  tagline: string
  bio: string
  instagram_url: string
  twitter_url: string
  facebook_url: string
  linkedin_url: string
}

export interface FooterPagesSettings {
  hourly_services: HourlyServicesSettings
  tourist_portal: TouristPortalSettings
  providers_hosts: ProvidersHostsSettings
  support_legal: SupportLegalSettings
  footer_contacts: FooterContactSettings
}

export const DEFAULT_FOOTER_PAGES_SETTINGS: FooterPagesSettings = {
  hourly_services: {
    hero_eyebrow: 'On-Demand Travel Freedom',
    hero_title: 'Hourly Tourism Services Explained',
    hero_subtitle:
      'Why pay for a full 24-hour car rental or suffer unpredictable metered cab fares? With Hourly Tourism, you rent verified vehicles, certified heritage guides, and curated experiences strictly for the hours you need.',
    services: [
      {
        id: 'bike',
        title: 'Bikes by the Hour',
        category: 'bike',
        tagline: 'Agile scooters and cruiser motorcycles for rapid city commuting and scenic hill rides.',
        startingRate: 149,
        minHours: 1,
        maxHours: 12,
        badge: 'Popular for Solo & Couples',
        inclusions: [
          'Sanitized pillion helmets provided',
          'Phone mount for GPS navigation',
          'Comprehensive third-party vehicle insurance',
          'Emergency roadside assistance within 30 mins',
          'Flexible hourly extensions with 1 click',
        ],
        idealFor: [
          'Quick city errand runs & temple visits',
          'Scenic foothill cruising (Marudhamalai, Isha)',
          'Budget travelers seeking independent mobility',
        ],
        exploreLink: '/explore?category=bike',
      },
      {
        id: 'car',
        title: 'Cars & Chauffeurs',
        category: 'car',
        tagline: 'Air-conditioned sedans and premium SUVs with courteous, route-savvy local drivers.',
        startingRate: 349,
        minHours: 2,
        maxHours: 16,
        badge: 'Best for Families & Executives',
        inclusions: [
          'Professional verified chauffeur in uniform',
          'Clean air-conditioned sedan / compact SUV',
          'Complimentary bottled water & wet wipes',
          'Zero surge pricing during peak hours',
          'Multiple stops & waiting without taxi meter stress',
        ],
        idealFor: [
          'Family day outings & shopping trips',
          'Business client meetings across the city',
          'Comfortable day trips to nearby hill towns',
        ],
        exploreLink: '/explore?category=car',
      },
      {
        id: 'van',
        title: 'Touring Vans & Tempos',
        category: 'van',
        tagline: 'Spacious 9 to 18-seater pushback touring vans for large family groups and corporate teams.',
        startingRate: 799,
        minHours: 4,
        maxHours: 24,
        badge: 'Large Group Comfort',
        inclusions: [
          'Experienced hill-station certified driver',
          'Pushback reclining seats & ample luggage space',
          'High-roof AC cabin with music entertainment system',
          'Dedicated luggage carrier & safety first-aid kit',
          'Custom group pickup from hotel, railway station, or airport',
        ],
        idealFor: [
          'Multi-family pilgrimages & temple circuits',
          'Corporate team retreats to Pollachi & Valparai',
          'Wedding guest transport & airport transfers',
        ],
        exploreLink: '/explore?category=van',
      },
      {
        id: 'local_guide',
        title: 'Local Heritage Guides',
        category: 'local_guide',
        tagline: 'Certified storytelling guides fluent in Tamil, English, and regional languages.',
        startingRate: 249,
        minHours: 2,
        maxHours: 8,
        badge: 'Cultural Discovery',
        inclusions: [
          'Govt-certified or vetted historical storytellers',
          'Multilingual commentary (Tamil, English, Hindi)',
          'Insider access to lesser-known artisan workshops',
          'Assistance with temple queue timings & local protocol',
          'Accompaniment on your vehicle or walking trail',
        ],
        idealFor: [
          'Heritage enthusiasts & architectural photographers',
          'First-time tourists wanting authentic local immersion',
          'Educational student tours & research trips',
        ],
        exploreLink: '/explore?category=local_guide',
      },
      {
        id: 'sightseeing_tour',
        title: 'Sightseeing Tours & Circuits',
        category: 'sightseeing_tour',
        tagline: 'Curated 4-hour, 8-hour, and 12-hour themed loops featuring top spots and hidden gems.',
        startingRate: 499,
        minHours: 4,
        maxHours: 12,
        badge: 'All-Inclusive Routes',
        inclusions: [
          'Pre-planned scenic circuit with optimal timings',
          'Curated mix of landmark attractions & secret viewpoints',
          'Dedicated vehicle and driver for the complete duration',
          'Free photography stops at scenic lookouts',
          'Customizable start times from your hotel doorstep',
        ],
        idealFor: [
          'Weekend getaways with limited time',
          'Visiting tourists wanting zero-hassle itinerary planning',
          'Spiritual circuits (Isha + Perur + Marudhamalai)',
        ],
        exploreLink: '/explore?category=sightseeing_tour',
      },
      {
        id: 'experience',
        title: 'Local Experiences & Workshops',
        category: 'experience',
        tagline: 'Immersive culinary walks, tea garden tastings, and village craft workshops by local artisans.',
        startingRate: 299,
        minHours: 2,
        maxHours: 6,
        badge: 'Unique & Unforgettable',
        inclusions: [
          'Hands-on guidance from native master artisans',
          'Tasting samples of authentic Kongu cuisine & beverages',
          'Access to private organic farms and tea plantations',
          'Interactive cultural storytelling and souvenir keepsake',
          'Small intimate groups (max 8 persons for quality)',
        ],
        idealFor: [
          'Foodies eager to savor genuine regional recipes',
          'Couples looking for unique experiential dates',
          'Families introducing children to traditional arts',
        ],
        exploreLink: '/explore?category=experience',
      },
    ],
    comparison_title: 'Why Hourly Tourism is Better Than Taxis & 24h Car Rentals',
    comparison_subtitle:
      'Traditional options force you into rigid contracts and meter anxiety. Here is how our model compares:',
    comparison_rows: [
      {
        feature: 'Billing Structure',
        hourlyAdvantage: 'Pay only for the exact hours used (1h to 12h)',
        traditionalTaxi: 'Surge-prone per-km + waiting charges',
        fullDayRental: 'Full 24-hour mandatory charge',
      },
      {
        feature: 'Driver & Fuel',
        hourlyAdvantage: 'Transparent rates with vetted chauffeur',
        traditionalTaxi: 'Rushed drivers rejecting return trips',
        fullDayRental: 'Self-drive security deposit of ₹5,000+',
      },
      {
        feature: 'Trip Flexibility',
        hourlyAdvantage: 'Multiple stops, unlimited waiting time in your hourly slot',
        traditionalTaxi: 'Meter ticks anxiously during shopping or temple darshan',
        fullDayRental: 'Strict return time penalty',
      },
      {
        feature: 'Payment Safety',
        hourlyAdvantage: '100% Escrow Protection (funds held until completed)',
        traditionalTaxi: 'Cash-first, zero dispute resolution',
        fullDayRental: 'Delayed deposit return (7-14 days)',
      },
      {
        feature: 'Hourly Extensions',
        hourlyAdvantage: '1-Tap Extension in Tourist App at standard rates',
        traditionalTaxi: 'Driver demands inflated arbitrary cash',
        fullDayRental: 'Requires contract renewal',
      },
    ],
    cta_title: 'Ready to Book Your Hourly Ride or Guide?',
    cta_subtitle:
      'Filter by vehicle type, seating capacity, hourly rates, and tourist ratings across Coimbatore, Pollachi, Ooty, and Valparai.',
  },
  tourist_portal: {
    hero_eyebrow: 'Tourist & Traveler Hub',
    hero_title: 'Your Complete Tourist Booking Portal',
    hero_subtitle:
      'Book hourly local transportation, hire certified storytelling guides, track live drivers via GPS, and manage trip itineraries with complete financial protection.',
    features: [
      {
        title: 'Search & Compare Rides',
        description: 'Explore live available bikes, chauffeured cars, and touring vans filtered by rating, price, and city.',
        link: '/explore',
        badge: 'Public Marketplace',
      },
      {
        title: 'Tourist Personal Dashboard',
        description: 'View upcoming trips, active hourly rides, completed journeys, and saved regional spots.',
        link: '/dashboard',
        badge: 'Account Central',
      },
      {
        title: 'My Trip Bookings & History',
        description: 'Access booking confirmation vouchers, live OTP codes, driver contact numbers, and downloadable GST invoices.',
        link: '/dashboard/bookings',
        badge: 'Live & Past Trips',
      },
      {
        title: 'Support & Dispute Resolution',
        description: 'Raise mediation tickets for extra hour disputes, no-shows, or immediate refund requests under 100% Escrow.',
        link: '/dashboard/support',
        badge: '24x7 SLA Under 2h',
      },
    ],
    steps_title: '5 Steps to a Perfect Hourly Trip',
    steps_subtitle: 'Clear, transparent, and designed for travelers who value freedom over strict schedules.',
    steps: [
      {
        step: '01',
        title: 'Choose Destination & Hours',
        description: 'Select your city (e.g. Coimbatore, Pollachi, Ooty) and specify how many hours you need (from 1 hour to 16 hours).',
      },
      {
        step: '02',
        title: 'Pick Your Verified Host',
        description: 'Review transparent hourly tariffs, past traveler reviews, vehicle photos, and driver credentials.',
      },
      {
        step: '03',
        title: 'Secure Escrow Payment',
        description: 'Pay via UPI, credit card, or net banking. Your payment stays securely in escrow until your trip concludes safely.',
      },
      {
        step: '04',
        title: 'Board with OTP Verification',
        description: 'Meet your driver at your doorstep or airport. Share the 4-digit start OTP to begin your metered hourly tour.',
      },
      {
        step: '05',
        title: 'Explore Without Meter Stress',
        description: 'Make multiple stops, shop, take photos, or pray at temples without paying frantic waiting meter charges.',
      },
    ],
    protections: [
      {
        title: '100% Escrow Guarantee',
        description: 'Your money is never sent directly to a driver in cash. We hold funds in an RBI-compliant escrow until your trip ends properly.',
      },
      {
        title: 'Verified Hosts & Vehicles',
        description: 'Every driver undergoes KYC Aadhaar/Driving License checks and police background verification. Vehicles must pass fitness tests.',
      },
      {
        title: 'Instant 1-Tap Extensions',
        description: 'Want to stay an extra hour at the temple or waterfall? Extend easily from your trip tracking page at standard hourly rates.',
      },
    ],
    banner_title: 'Need Help with an Active Booking?',
    banner_subtitle: 'Our 24x7 customer support desk is available via phone, WhatsApp, or through the online ticket center.',
    helpline_phone: '1800-200-8899',
  },
  providers_hosts: {
    hero_eyebrow: 'Partner & Host Community',
    hero_title: 'Earn Predictably with Hourly Tourism',
    hero_subtitle:
      'Stop waiting on unpredictable ride-hailing commissions or fighting for daily tourist rentals. Set your own transparent hourly tariffs, receive guaranteed escrow payouts, and get paid for every hour you serve.',
    benefits: [
      {
        title: 'Zero Unpaid Waiting',
        description: 'Tourists pay for the full time booked. Whether they spend 3 hours at a temple or in a restaurant, you earn your agreed hourly rate without anxiety.',
      },
      {
        title: 'Fast Escrow Payouts',
        description: 'Funds are held in secure escrow during the ride and settled directly to your verified bank account or UPI immediately upon trip completion.',
      },
      {
        title: 'No-Show Protection',
        description: 'If a tourist cancels late or fails to arrive at the agreed pickup point, our automated cancellation penalty policy compensates you for your time.',
      },
      {
        title: '100% Calendar Control',
        description: 'Work when you want. Toggle your fleet status between "Available" and "Offline" with a single switch on your mobile host dashboard.',
      },
    ],
    operator_classes: [
      {
        title: 'Bike Rental & Rider Hosts',
        earningRange: '₹1,500 – ₹3,200',
        tagline: 'Ideal for local youth & bike enthusiasts owning scooters or cruiser motorcycles.',
        requirements: ['Valid Driving License & RC', 'Two sanitized helmets', 'Clean vehicle in good mechanical condition'],
        link: '/become-provider?category=bike',
      },
      {
        title: 'Car Chauffeurs & Cab Owners',
        earningRange: '₹3,000 – ₹6,500',
        tagline: 'For commercial or tourist taxi permit holders with sedans, compact SUVs, and luxury cars.',
        requirements: ['Commercial or tourist permit', 'Clean air-conditioned cabin', 'Safe driving record & courteous conduct'],
        link: '/become-provider?category=car',
      },
      {
        title: 'Touring Van & Tempo Operators',
        earningRange: '₹6,000 – ₹14,000',
        tagline: 'For 9 to 18-seater tempo travellers operating foothill circuits and family retreats.',
        requirements: ['Tourist transport badge', 'Hill-station driving experience', 'Working AC & pushback seating'],
        link: '/become-provider?category=van',
      },
      {
        title: 'Certified Local Guides',
        earningRange: '₹2,000 – ₹4,800',
        tagline: 'For historians, culture enthusiasts, and multilingual storytellers passionate about Tamil Nadu.',
        requirements: ['Fluency in Tamil & English/Hindi', 'Deep knowledge of temples & heritage', 'Guide certification or vetting'],
        link: '/become-provider?category=local_guide',
      },
    ],
    tools: [
      {
        title: 'Become a Verified Provider',
        description: 'Submit your operator credentials and vehicle papers for express 24h approval.',
        link: '/become-provider',
        badge: 'Start Here',
      },
      {
        title: 'Provider Command Center',
        description: 'Real-time overview of active bookings, incoming trip requests, and revenue trends.',
        link: '/provider',
        badge: 'Host Desk',
      },
      {
        title: 'Fleet & Service Listings',
        description: 'Create and edit your vehicles, set hourly rates, upload photos, and pause availability.',
        link: '/provider/listings',
        badge: 'Manage Rides',
      },
      {
        title: 'Earnings & Bank Payouts',
        description: 'Track daily gross earnings, commission breakdowns, and request instant UPI or NEFT settlements.',
        link: '/provider/earnings',
        badge: 'Fast Settlements',
      },
      {
        title: 'KYC Document Verification',
        description: 'Upload Aadhaar, Driving License, RC, Insurance, and Police Verification certificates.',
        link: '/provider/verification',
        badge: 'Trust Badge',
      },
      {
        title: 'Host Protection Desk',
        description: 'Resolve unpaid overtime, passenger disputes, or no-show compensation with admin support.',
        link: '/provider/support',
        badge: 'Host Safety',
      },
    ],
    cta_title: 'Ready to Launch Your Hourly Travel Service?',
    cta_subtitle: 'Submit your documents in 5 minutes. Our team approves verified hosts within 24 business hours.',
  },
  support_legal: {
    hero_eyebrow: 'Trust, Safety & Governance',
    hero_title: 'Support & Legal Knowledge Center',
    hero_subtitle:
      'We operate under strict Ministry of Tourism standards with 100% escrow payment protection, transparent cancellation terms, and a certified 2-hour dispute resolution SLA.',
    documents: [
      {
        title: '100% Escrow & Cancellation Policy',
        tagline: 'Transparent refund tiers, no-show protections, and fair cancellation fee guidelines.',
        link: '/cancellation-policy',
        badge: 'Escrow Protected',
        keyPoints: [
          'Free cancellation up to 6 hours before trip start',
          '100% full refund if host cancels or fails to arrive',
          'Escrow payout released only after passenger safety confirmation',
        ],
      },
      {
        title: 'Terms & Conditions of Service',
        tagline: 'The contractual user agreement governing hourly bookings, vehicle use, and conduct.',
        link: '/terms',
        badge: 'Binding Agreement',
        keyPoints: [
          'Hourly metered usage boundaries and driver rest hours',
          'Rules on luggage limits, pet policies, and prohibited items',
          'Platform liability and mutual indemnification terms',
        ],
      },
      {
        title: 'Privacy & Data Protection Policy',
        tagline: 'How we collect, store, and safeguard your personal details, phone numbers, and live GPS data.',
        link: '/privacy',
        badge: 'Data Safety',
        keyPoints: [
          'End-to-end encrypted GPS tracking during active rides',
          'Zero selling of phone numbers or email addresses to advertisers',
          'PCI-DSS compliant payment processing powered by Razorpay',
        ],
      },
      {
        title: 'Frequently Asked Questions (FAQs)',
        tagline: 'Quick, detailed answers to the 25 most common questions asked by tourists and hosts.',
        link: '/faqs',
        badge: 'Instant Answers',
        keyPoints: [
          'How hourly billing extensions work mid-trip',
          'Guidelines for tipping, toll taxes, and parking fees',
          'Procedures for forgotten items in vehicles',
        ],
      },
      {
        title: 'Contact Customer Care & Helpdesk',
        tagline: 'Reach our regional headquarters, emergency phone lines, or file an escalation case.',
        link: '/contact',
        badge: '24/7 Support',
        keyPoints: [
          'Toll-Free national helpline: 1800-200-8899',
          'Dedicated WhatsApp coordination desk: +91 98421 00000',
          'Physical office in Coimbatore & partner centers in Pollachi',
        ],
      },
      {
        title: 'Dispute Mediation & Admin Workbench',
        tagline: 'Administrative arbitration desk for unresolved trip conflicts, refunds, and driver disputes.',
        link: '/admin/login',
        badge: 'Mediation Desk',
        keyPoints: [
          'Dedicated Grievance Officer review within 2 business hours',
          'Neutral escrow mediation based on GPS timestamps & logs',
          'Direct authority to issue immediate financial compensation',
        ],
      },
    ],
    dispute_title: 'How the 2-Hour Escrow Mediation Desk Works',
    dispute_subtitle:
      'Encountered a problem during an hourly booking? Our mediation team follows this guaranteed 4-step protocol:',
    dispute_steps: [
      {
        step: '1',
        title: 'File Case in Portal',
        desc: 'Submit ticket from your dashboard with your booking number, category, and explanation.',
      },
      {
        step: '2',
        title: 'Escrow Frozen',
        desc: 'Platform automatically locks the trip escrow balance to prevent premature payout release.',
      },
      {
        step: '3',
        title: 'Evidence Verification',
        desc: 'Support team reviews live GPS logs, start/end OTP timestamps, and driver records within 2h.',
      },
      {
        step: '4',
        title: 'Binding Verdict',
        desc: 'Fair resolution issued with instant online refund or payment credit processed directly.',
      },
    ],
    helpline_phone: '1800-200-8899',
    whatsapp_number: '+91 98421 00000',
    support_email: 'support@hourlytourism.com',
  },
  footer_contacts: {
    helpline_phone: '1800-200-8899',
    whatsapp_number: '+91 98421 00000',
    tagline: 'Discover More. One Hour at a Time.',
    bio: 'India’s premier on-demand hourly tourism platform. Book verified vehicles and local guides strictly for the hours you need with 100% escrow protection.',
    instagram_url: 'https://instagram.com',
    twitter_url: 'https://twitter.com',
    facebook_url: 'https://facebook.com',
    linkedin_url: 'https://linkedin.com',
  },
}

