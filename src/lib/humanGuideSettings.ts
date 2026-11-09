export interface HumanGuidePackage {
  id: string
  name: string
  duration_hours: number
  price: number
  discount_label: string
  description: string
  popular?: boolean
}

export interface HumanGuideUseCase {
  title: string
  subtitle: string
  icon: string
  description: string
  tag: string
}

export interface HumanGuideFAQ {
  q: string
  a: string
}

export interface HumanGuideSettings {
  badgeText: string
  heroHeadline: string
  heroSubheadline: string
  baseHourlyRate: number
  minimumHours: number
  maximumHours: number
  supportPhone: string
  packages: HumanGuidePackage[]
  useCases: HumanGuideUseCase[]
  faqs: HumanGuideFAQ[]
  updatedAt?: string
}

export const DEFAULT_HUMAN_GUIDE_SETTINGS: HumanGuideSettings = {
  badgeText: 'Official Service Guide • Book Human-Ⅰ',
  heroHeadline: 'Book Human-Ⅰ: How Booking a Person for Your Needs Works',
  heroSubheadline:
    'Need an extra pair of hands, an experienced local negotiator, or a trusted companion? Book a background-verified local Human-Ⅰ by the hour with zero full-day lock-ins, 100% Platform Escrow, and direct OTP verification.',
  baseHourlyRate: 299,
  minimumHours: 1,
  maximumHours: 12,
  supportPhone: '+91 94883 12345',
  packages: [
    {
      id: 'pkg-1',
      name: '1-Hour Quick Assist',
      duration_hours: 1,
      price: 299,
      discount_label: 'Standard Rate',
      description: 'Quick local errand, parcel dispatch, courier pickup, or short translation meetup.',
    },
    {
      id: 'pkg-2',
      name: '3-Hour Half-Day Buddy',
      duration_hours: 3,
      price: 799,
      discount_label: 'Save 11%',
      description: 'Shopping escort, silk bazaar bargaining, elderly hospital visit, or cafe food walk.',
      popular: true,
    },
    {
      id: 'pkg-3',
      name: '6-Hour Full Day Companion',
      duration_hours: 6,
      price: 1499,
      discount_label: 'Save 16%',
      description: 'Comprehensive city exploration, multiple markets, document assistance, or elderly care.',
    },
    {
      id: 'pkg-4',
      name: '10-Hour All-Day VIP Human-Ⅰ',
      duration_hours: 10,
      price: 2299,
      discount_label: 'Save 23%',
      description: 'Full-day dedicated assistant for family functions, tours, or intensive city errands.',
    },
  ],
  useCases: [
    {
      icon: '🛍️',
      title: 'Market Shopping & Bargaining',
      subtitle: 'Town Hall & Cross-Cut Silk Hubs',
      tag: 'Most Popular',
      description:
        'Navigate bustling bazaars without tourist markups. Your Human-Ⅰ identifies authentic silks, negotiates fair prices, and helps carry your shopping bags.',
    },
    {
      icon: '👵',
      title: 'Elderly Hospital & Appointment Escort',
      subtitle: 'Compassionate Local Accompaniment',
      tag: 'Care & Safety',
      description:
        'Cannot be there in person? Book a patient, verified Human-Ⅰ to accompany your senior parents to hospital checkups, handle queue tokens, and ensure safe returns.',
    },
    {
      icon: '🗣️',
      title: 'Language & Dialect Translation',
      subtitle: 'Tamil, English & Regional Dialects',
      tag: 'Zero Language Barrier',
      description:
        'Visiting Tamil Nadu from out of state or abroad? Your bilingual Human-Ⅰ communicates effortlessly with shopkeepers, auto drivers, and officials on your behalf.',
    },
    {
      icon: '📸',
      title: 'Solo Traveler Photography & Safety Buddy',
      subtitle: 'Never Travel Alone or Miss a Shot',
      tag: 'Solo Travel',
      description:
        'Explore scenic temples, tea gardens, and vibrant streets with a respectful local buddy who takes aesthetic photos of you and ensures safe city navigation.',
    },
    {
      icon: '🏃',
      title: 'Local Errand Runner & Queue Standee',
      subtitle: 'We Save Your Valuable Time',
      tag: 'Productivity',
      description:
        'Short on time? Let your Human-Ⅰ stand in document lines, pick up medical supplies, courier items across town, or inspect rental properties on your behalf.',
    },
    {
      icon: '☕',
      title: 'Food Trails & Authentic Tiffin Walks',
      subtitle: 'Hidden Flavors & Great Conversations',
      tag: 'Local Culture',
      description:
        'Taste legendary ghee roasts, authentic filter coffee, and hidden culinary gems known only to locals, paired with warm, respectful local conversations.',
    },
  ],
  faqs: [
    {
      q: 'What exactly is a "Human-Ⅰ"?',
      a: 'A Human-Ⅰ is a background-verified, friendly local person you can book strictly by the hour to help with any personal need—shopping bargaining, carrying bags, hospital accompaniment, regional language translation, solo travel safety, or running local errands.',
    },
    {
      q: 'Can I book a Human-Ⅰ for just 1 hour?',
      a: 'Yes! Unlike traditional full-day guide services that force 8-hour lock-ins, Hourly Tourism allows you to book a Human-Ⅰ starting from just 1 hour for ₹299.',
    },
    {
      q: 'How does payment work?',
      a: 'You can choose "Pay After Service Completes" and pay your Human-Ⅰ directly via Cash or their personal UPI QR code at the end of the trip, or pay online securely. All bookings are protected by our 100% Platform Escrow guarantee.',
    },
    {
      q: 'How does the 4-Digit Start OTP work?',
      a: 'Every confirmed booking generates a unique, confidential 4-digit OTP in your customer app. You share this code with your Human-Ⅰ only when you meet face-to-face. This guarantees that your booked time starts only after your host physically arrives.',
    },
    {
      q: 'How are Human-Ⅰ companions verified for safety?',
      a: 'Every Human-Ⅰ must complete mandatory government identity verification, phone OTP authentication, police background checks, and an in-person orientation on platform safety and etiquette.',
    },
    {
      q: 'Can I extend my hours during the trip?',
      a: 'Yes! If you need your Human-Ⅰ for additional hours, you can easily request an extension directly through your active booking dashboard or settle the extra hours with your host at standard hourly rates.',
    },
  ],
}

