'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  MapPin,
  Clock,
  ShieldCheck,
  Star,
  Users,
  Check,
  X,
  Calendar,
  Languages,
  Fuel,
  Info,
  Share2,
  Heart,
  ChevronLeft,
  MessageCircle,
  Sparkles,
  Compass,
  Phone,
  AlertCircle,
  FileText,
  CheckCircle2,
} from 'lucide-react'
import { Header } from '@/components/layout/Header'
import { Footer } from '@/components/layout/Footer'
import { BookingForm } from '@/components/booking/BookingForm'
import { ReviewCard } from '@/components/reviews/ReviewCard'
import { MapDisplay } from '@/components/maps/MapDisplay'
import { Avatar } from '@/components/ui/Avatar'
import { Rating } from '@/components/ui/Rating'
import { Button } from '@/components/ui/Button'
import { Modal } from '@/components/ui/Modal'
import { FullPageLoader } from '@/components/ui/LoadingSpinner'
import { CURRENCY_SYMBOL } from '@/lib/constants'
import { normalizeListingImages } from '@/lib/utils'

// Fallback demo dataset for initial previews or offline testing
const demoListingsData: Record<string, any> = {
  'bike-cbe-01': {
    id: 'bike-cbe-01',
    title: 'Royal Enfield Hunter 350 — Isha & Velliangiri Foothills Ride',
    category: 'bike',
    short_description:
      'Cruise along palm-lined Western Ghats foothills to the 112-ft Adiyogi Shiva statue and Isha Yoga Center.',
    description:
      'Experience the thrill of riding towards the mystical Velliangiri Foothills on a brand new Royal Enfield Hunter 350. The route from Coimbatore city center via Thondamuthur winds through lush coconut groves, sugarcane fields, and cool mountain breezes. Visit Dhyanalinga, the sacred Surya Kund, and stand before the monumental 112-ft Adiyogi statue. The bike comes equipped with a mobile mount, fast USB charging port, crash guards, and complimentary ISI certified dual helmets.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'DB Road, RS Puram / Siruvani Main Road, Coimbatore',
    latitude: 11.0018,
    longitude: 76.9558,
    hourly_rate: 180,
    min_booking_hours: 2,
    max_booking_hours: 12,
    buffer_time_minutes: 30,
    average_rating: 4.9,
    total_reviews: 58,
    is_featured: true,
    pickup_location: 'RS Puram Hub / Gandhipuram / Peelamedu Airport Delivery',
    meeting_point: 'RS Puram Head Office or Isha Gateway Toll Point',
    max_participants: 2,
    planned_spots: [
      {
        id: 'spot-1',
        name: 'Isha Yoga & 112-ft Adiyogi Shiva Statue',
        duration: '1.5 Hours',
        category: 'Spiritual & Sightseeing',
        description: 'Marvel at the monumental 112-foot bust of Adiyogi Shiva, Dhyanalinga silence, and sacred Theerthakund dip.',
        insider_tip: 'Stay for the spectacular 7:00 PM 3D laser sound and light projection.',
      },
      {
        id: 'spot-2',
        name: 'Velliangiri Foothills Palm-Lined Country Loop',
        duration: '45 Mins',
        category: 'Scenic Foothills',
        description: 'Breeze along shaded coconut canopies, sugarcane fields, and refreshing mountain slopes.',
        insider_tip: 'Ask host to stop at the historic village stream bridge for panoramic photos.',
      },
      {
        id: 'spot-3',
        name: 'Thondamuthur Village Wood-Fired Chai Stop',
        duration: '30 Mins',
        category: 'Local Hospitality',
        description: 'Enjoy traditional jaggery filter coffee and fresh tender coconut with your local rider host.',
        insider_tip: 'Authentic palm sugar snacks available directly from local farm stalls.',
      },
    ],
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
      'https://images.unsplash.com/photo-1558981806-ec527fa84c39?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Accompanied by verified local rider host on their personal Royal Enfield',
      'Fuel for the entire booked tour duration (no extra fuel cost)',
      'Complimentary sanitized ISI-certified helmet for guest pillion rider',
      'Waterproof phone mount with fast USB charging',
      'Local insider storytelling, cultural guidance, and photo assistance',
    ],
    excluded_services: [
      'Personal temple donation or souvenir purchases',
      'Dining expenses beyond complimentary chai',
    ],
    terms_and_conditions:
      'This is a rider-hosted hourly tourist service. Your registered local host meets you at the pickup location with their personal vehicle and drives/guides you to all scheduled spots during your booked hours.',
    cancellation_policy:
      'Free cancellation up to 4 hours before the booked start time. 50% refund for cancellations within 4 hours. No refund after start time.',
    vehicle_details: {
      vehicle_type: 'bike',
      brand: 'Royal Enfield',
      model: 'Hunter 350 Dapper Ash',
      year: 2023,
      passenger_capacity: 2,
      fuel_type: 'Petrol',
      features: ['Personal Host Rider Included', 'Dual Channel ABS', 'Mobile Charger', 'Luggage Carrier'],
    },
    packages: [
      { id: 'pkg-1', name: 'Adiyogi Sunset Express', duration_hours: 3, price: 520, description: 'Direct ride to Isha, Theerthakund, and evening Adiyogi laser show' },
      { id: 'pkg-2', name: 'Western Ghats Foothills Loop', duration_hours: 6, price: 999, description: 'Isha, Kovai Kutralam waterfalls, and scenic village backroads' },
      { id: 'pkg-3', name: 'Full Day Nilgiri Country', duration_hours: 10, price: 1599, description: 'Unlimited riding covering Mettupalayam foothills and Bhavani river' },
    ],
    provider: {
      business_name: 'Kovai Foothill Riders & Hosts',
      description: 'Verified motorcycle enthusiast hosting guided hourly foothill rides and scenic tours in Coimbatore in their free time.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-cbe-1',
        rating: 5,
        review_text:
          'Rode to Adiyogi for the 7 PM Divya Darshanam light show. The bike was silky smooth and the ride through Thondamuthur canopy road was pure bliss! Hourly pricing meant I paid for 4 hours instead of a full day.',
        created_at: '2024-03-20T11:30:00Z',
        provider_response: 'Delighted you enjoyed the ride! Come back for the Siruvani trail next.',
        provider_responded_at: '2024-03-20T15:00:00Z',
        customer: { full_name: 'Karthik Subramanian', avatar_url: null },
      },
    ],
  },
  'car-cbe-02': {
    id: 'car-cbe-02',
    title: 'Toyota Innova Crysta Chauffeur — Isha & Marudhamalai Circuit',
    category: 'car',
    short_description:
      'Premium AC SUV with courteous local chauffeur for family trips to Adiyogi, Dhyanalinga, Marudhamalai Temple, and Perur Pateeswarar.',
    description:
      'Travel in luxury and comfort with your family in a sanitized, air-conditioned Toyota Innova Crysta driven by a courteous, background-verified local chauffeur. Perfect for airport pickups from CJB, pilgrimages to Marudhamalai Murugan temple, and tranquil visits to Isha Yoga Center. Our drivers know every scenic detour and best Kongu traditional dining stops.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Avinashi Road, Near Airport Junction, Coimbatore',
    latitude: 11.0298,
    longitude: 77.0392,
    hourly_rate: 650,
    min_booking_hours: 3,
    max_booking_hours: 12,
    buffer_time_minutes: 30,
    average_rating: 5.0,
    total_reviews: 74,
    is_featured: true,
    pickup_location: 'Any hotel in Coimbatore, Airport (CJB), or Railway Junction',
    meeting_point: 'Direct doorstep pickup at your scheduled start time',
    max_participants: 6,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Professional polite chauffeur in uniform',
      'Fuel charges included for booked duration & designated radius',
      'Air-conditioned 7-seater luxury comfort',
      'Chilled bottled mineral water and wet wipes',
      'Assistance with elderly family passengers at temple steps',
    ],
    excluded_services: ['Toll gate charges (billed at actuals)', 'Temple special darshan tickets'],
    terms_and_conditions: 'Punctual pickup. Smoking and alcohol consumption prohibited inside vehicle.',
    cancellation_policy: 'Free cancellation up to 4 hours prior to trip start time.',
    vehicle_details: {
      vehicle_type: 'car',
      brand: 'Toyota',
      model: 'Innova Crysta 2.4Z',
      year: 2023,
      passenger_capacity: 6,
      fuel_type: 'Diesel',
      features: ['Rear AC Vents', 'Captain Seats', 'Airbags', 'Fastag Enabled'],
    },
    packages: [
      { id: 'pkg-c2-1', name: 'Isha Adiyogi Express', duration_hours: 4, price: 2400, description: 'Doorstep pickup, 2.5 hours at Isha Dhyanalinga & Adiyogi, safe return' },
      { id: 'pkg-c2-2', name: 'Spiritual Coimbatore Circuit', duration_hours: 6, price: 3600, description: 'Marudhamalai Murugan temple, Perur Pateeswarar & Isha Center' },
      { id: 'pkg-c2-3', name: 'Full Day Heritage & Hills', duration_hours: 8, price: 4800, description: 'Coimbatore city highlights, Siruvani foothills & Adiyogi' },
    ],
    provider: {
      business_name: 'Kongu Chauffeur Mobility',
      description: 'Coimbatore’s premier executive and pilgrim transport fleet operating since 2015.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Hindi', 'Telugu'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-cbe-2',
        rating: 5,
        review_text:
          'Driver Murugan was extremely polite and punctual! We booked the 6-hour package for my parents visiting from Chennai. He helped with temple darshan and drove smoothly through the ghats.',
        created_at: '2024-03-18T14:20:00Z',
        customer: { full_name: 'Dr. Meenakshi Sundaram', avatar_url: null },
      },
    ],
  },
  'van-cbe-03': {
    id: 'van-cbe-03',
    title: 'Force Urbania 12-Seater Luxury Van — Valparai 40 Hairpins Safari',
    category: 'van',
    short_description:
      'Spacious reclining seats and seasoned hill driver for Valparai tea estates, Aliyar Dam, Monkey Falls, and Anamalai Tiger Reserve.',
    description:
      'Climb the legendary 40 hairpin bends of the Anamalai hills in supreme comfort. Our luxury 12-seater Force Urbania van features individual plush reclining seats, panoramic view windows, high-roof headroom, dual AC, and air suspension. Our hill-expert driver ensures a safe, nausea-free journey to tea gardens, Aliyar Dam, Loam’s View Point, and Sholayar Dam.',
    destination_city: 'Pollachi',
    destination_state: 'Tamil Nadu',
    address: 'Pollachi Main Road / Coimbatore Junction Hub',
    latitude: 10.6609,
    longitude: 77.0048,
    hourly_rate: 1100,
    min_booking_hours: 4,
    max_booking_hours: 12,
    buffer_time_minutes: 45,
    average_rating: 4.9,
    total_reviews: 42,
    is_featured: true,
    pickup_location: 'Coimbatore City / Pollachi Town / Hotel Doorstep',
    meeting_point: 'Coimbatore Junction or Pollachi Bus Stand',
    max_participants: 12,
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      '12-seater AC Luxury Urbania Van',
      'Hill-certified professional mountain driver',
      'Clean audio system and mobile charging points at every seat',
      'Generous luggage boot for large group bags',
    ],
    excluded_services: ['Forest department vehicle entry toll', 'Personal entry tickets to falls'],
    terms_and_conditions: 'Strictly 12 passengers maximum. Night driving restricted on forest roads.',
    cancellation_policy: 'Free cancellation up to 6 hours before start time.',
    vehicle_details: {
      vehicle_type: 'van',
      brand: 'Force Motors',
      model: 'Urbania 3615 Luxury Van',
      year: 2023,
      passenger_capacity: 12,
      fuel_type: 'Diesel',
      features: ['Reclining Pushback Seats', 'Individual AC Vents', 'Air Suspension', 'Large Windows'],
    },
    packages: [
      { id: 'pkg-v-1', name: 'Aliyar Dam & Monkey Falls Picnic', duration_hours: 6, price: 6000, description: 'Pollachi canals, Aliyar boat house, park, and Monkey Falls foothills' },
      { id: 'pkg-v-2', name: 'Valparai Tea Plateau Safari', duration_hours: 10, price: 9800, description: '40 Hairpins, Carver Marsh statue, tea factory tour, and wildlife viewpoints' },
    ],
    provider: {
      business_name: 'Anamalai Luxury Fleet & Tours',
      description: 'Specialized group transport operator for Pollachi, Valparai, and Western Ghats.',
      city: 'Pollachi',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-cbe-3',
        rating: 5,
        review_text:
          'Took our extended family of 10 to Valparai. The Urbania was so quiet and smooth on the 40 hairpin curves that no one felt motion sick. The driver knew great viewpoints to spot lion-tailed macaques!',
        created_at: '2024-03-12T16:00:00Z',
        customer: { full_name: 'Venkatesh Raman', avatar_url: null },
      },
    ],
  },
  'guide-cbe-04': {
    id: 'guide-cbe-04',
    title: 'Kongu Heritage, Silk & Ancient Temples Expert Guide',
    category: 'local_guide',
    short_description:
      'Explore 1500-year-old Chola carvings at Perur Pateeswarar Temple, historic textile mills, and handloom silk weaving centers in Coimbatore.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Perur Heritage Corridor, Coimbatore',
    latitude: 10.9708,
    longitude: 76.9208,
    hourly_rate: 400,
    min_booking_hours: 2,
    max_booking_hours: 6,
    average_rating: 5.0,
    total_reviews: 69,
    is_featured: true,
    pickup_location: 'Perur Temple Arch or GD Naidu Car Museum',
    meeting_point: 'Perur Pateeswarar Temple Main Rajagopuram',
    max_participants: 8,
    images: [
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1603228254119-e6aef383a83f?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Certified historian and architectural storyteller',
      'Guided walkthrough of 1500-year-old stone sculptures at Kanaka Sabha',
      'Introduction to master handloom weavers in Sirumugai silk tradition',
      'Local textile history walkthrough (Manchester of South India)',
    ],
    excluded_services: ['Temple special entry tickets', 'Personal shopping'],
    terms_and_conditions: 'Traditional attire advised for temple sanctum.',
    cancellation_policy: 'Free cancellation up to 4 hours before tour start time.',
    guide_details: {
      languages: ['Tamil', 'English', 'Malayalam'],
      specializations: ['Chola Dravidian Architecture', 'Kongu History', 'Textile Mill Heritage'],
      experience_years: 12,
      max_group_size: 10,
    },
    packages: [
      { id: 'pkg-g-1', name: 'Perur Temple Art Walk', duration_hours: 2, price: 750, description: 'Sculptures of Kanaka Sabha, gopurams, and Noyyal river heritage' },
      { id: 'pkg-g-2', name: 'Manchester of South India Trail', duration_hours: 4, price: 1450, description: 'GD Naidu car museum, vintage textile history, and silk bazaar walk' },
    ],
    provider: {
      business_name: 'Kovai Heritage Guild',
      description: 'Accredited historians and cultural storytellers documenting Kongu history.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-cbe-4',
        rating: 5,
        review_text:
          'Deep knowledge of Chola temple architecture! Our guide Senthil pointed out stone musical pillars and historical inscriptions that we would have completely walked past.',
        created_at: '2024-03-08T10:00:00Z',
        customer: { full_name: 'Anand Kumar', avatar_url: null },
      },
    ],
  },
  'tour-cbe-05': {
    id: 'tour-cbe-05',
    title: 'Siruvani Sweet Water Reserve Forest & Waterfalls Tour',
    category: 'sightseeing_tour',
    short_description:
      'Eco-trip into pristine Western Ghats reserve forest to taste the world-renowned sweet Siruvani mineral water and visit lush cascades.',
    description:
      'Siruvani water is widely celebrated as one of the sweetest tasting mineral waters on Earth, naturally filtered through the dense botanical roots of the Muthikulam hills. This guided hourly eco-tour takes you past Sadivayal forest check-post into the protected sanctuary. Walk through towering shola trees, bathe in cool cascading natural pools, and experience the untouched Western Ghats biosphere under the care of certified forest naturalists.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Sadivayal Forest Gate, Siruvani Hills, Coimbatore',
    latitude: 10.9634,
    longitude: 76.6874,
    hourly_rate: 550,
    min_booking_hours: 3,
    max_booking_hours: 8,
    buffer_time_minutes: 30,
    average_rating: 4.9,
    total_reviews: 51,
    is_featured: true,
    pickup_location: 'Coimbatore City Center / Thondamuthur / Sadivayal Gate',
    meeting_point: 'Sadivayal Forest Eco-Tourism Entry Office',
    max_participants: 8,
    images: [
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Certified eco-naturalist guide with forest permits assistance',
      'Guided rainforest interpretive trek to the primary waterfalls',
      'Pure fresh Siruvani natural spring water tasting experience',
      'First-aid equipped guide and emergency radio link',
    ],
    excluded_services: [
      'Forest department per-vehicle and camera entrance fees',
      'Personal swimming towels and spare change of clothes',
    ],
    terms_and_conditions:
      'Strict zero-plastic zone. Forest entry timings subject to Tamil Nadu Forest Department regulations (no entry after 3:30 PM). No alcoholic beverages permitted.',
    cancellation_policy:
      'Free cancellation up to 6 hours before booked time. 50% refund within 6 hours.',
    tour_details: {
      itinerary: [
        'Sadivayal Forest Entry clearance and eco-orientation',
        'Scenic drive along the Muthikulam catchment tree canopy',
        '45-minute nature walk along the crystal river stream',
        'Waterfalls view, natural stream dip, and fresh spring water tasting',
        'Return to Sadivayal base camp',
      ],
      meeting_point: 'Sadivayal Forest Checkpost, Siruvani Main Road',
      group_size: 'Small group (up to 8 visitors)',
      what_to_bring: ['Walking/trekking shoes', 'Reusable steel water bottle', 'Change of clothes'],
    },
    packages: [
      { id: 'pkg-sir-1', name: 'Waterfalls Eco Splash', duration_hours: 3, price: 1550, description: 'Sadivayal gate entry, falls trek, and freshwater pool experience' },
      { id: 'pkg-sir-2', name: 'Comprehensive Siruvani Dam Trail', duration_hours: 6, price: 2900, description: 'Complete forest loop, Kovai Kutralam, and Siruvani dam catchment viewpoint' },
    ],
    provider: {
      business_name: 'Western Ghats Eco Adventures',
      description: 'Forest-accredited eco-guides and sustainable tourism operators based in Thondamuthur.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-cbe-sir1',
        rating: 5,
        review_text:
          'The water really is unbelievably sweet! The guide was very knowledgeable about native plants and birds. Doing this on an hourly 4-hour booking saved us so much time compared to group bus tours.',
        created_at: '2024-03-15T09:15:00Z',
        customer: { full_name: 'Praveen Raj', avatar_url: null },
      },
    ],
  },
  'exp-cbe-06': {
    id: 'exp-cbe-06',
    title: 'Kongunadu Traditional Culinary & Spices Tasting Trail',
    category: 'experience',
    short_description:
      'Sample authentic Kongunadu specialties in RS Puram: Pallipalayam, Arisi Paruppu Sadam, fresh tender coconut, and iconic Kovai filter coffee.',
    description:
      'Kongunadu cuisine is renowned for its rustic culinary brilliance, subtle use of cold-pressed coconut oil, fresh shallots (chinna vengayam), dry roasted spices, and zero artificial coloring. Led by an experienced culinary insider, this delicious walking & tasting trail in RS Puram and Race Course brings you to legendary eateries and street vendors. Taste tender coconut pudding, authentic Arisi Paruppu Sadam, fragrant Pallipalayam specialties, and finish with legendary brass-tumbler Kovai filter coffee.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'DB Road & Diwan Bahadur Road, RS Puram, Coimbatore',
    latitude: 11.0116,
    longitude: 76.9535,
    hourly_rate: 480,
    min_booking_hours: 2,
    max_booking_hours: 4,
    buffer_time_minutes: 15,
    average_rating: 5.0,
    total_reviews: 83,
    is_featured: true,
    pickup_location: 'RS Puram Head Post Office / DB Road Junction',
    meeting_point: 'Annapoorna Hotel Foyer, RS Puram, Coimbatore',
    max_participants: 6,
    images: [
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'All food tastings and specialty beverage samples across 5 iconic stops',
      'Hosted by a local food culinary historian and food critic',
      'Vegetarian and non-vegetarian tasting portions customized to guests',
      'Insider souvenir recipe booklet of authentic Kongu spice blends',
    ],
    excluded_services: ['Takeaway parcel orders or packaged dry spice shopping'],
    terms_and_conditions: 'Please inform guide in advance of any specific nut or dairy allergies.',
    cancellation_policy: 'Free cancellation up to 4 hours before tour start time.',
    experience_details: {
      host_name: 'Chef Senthil Murugan',
      languages: ['Tamil', 'English'],
      cuisine_style: 'Traditional Kongunadu Heritage',
      menu_highlights: [
        'Legendary Sree Annapoorna Roast Dosa & Filter Coffee',
        'Authentic Arisi Paruppu Sadam with pure Ghee & Murungakkai Poriyal',
        'Kongu Pallipalayam specialties with shallots and curry leaves',
        'Fresh Pollachi Elaneer (Tender Coconut) Payasam',
      ],
    },
    packages: [
      { id: 'pkg-food-1', name: 'Classic Breakfast & Coffee Walk', duration_hours: 2, price: 950, description: 'Morning trail covering crispy dosas, filter coffee, and sweet stalls' },
      { id: 'pkg-food-2', name: 'Grand Kongu Feast & Evening Bites', duration_hours: 3, price: 1400, description: 'Full degustation trail with street eats, coconut pudding, and Kongu dinner tastings' },
    ],
    provider: {
      business_name: 'Kongu Food Trails',
      description: 'Passionate culinary guides celebrating the authentic flavours of western Tamil Nadu.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-cbe-f1',
        rating: 5,
        review_text:
          'An absolute highlight of our Coimbatore trip! Sree Annapoorna filter coffee is truly unmatched, and tasting authentic Arisi Paruppu Sadam prepared the traditional way was unforgettable.',
        created_at: '2024-03-22T18:45:00Z',
        customer: { full_name: 'Deepa Narayanan', avatar_url: null },
      },
    ],
  },
  'car-cbe-07': {
    id: 'car-cbe-07',
    title: 'Mahindra Thar 4x4 — Pollachi Coconut Canal & Foothills Drive',
    category: 'car',
    short_description:
      'Open-air 4x4 drive along the famous scenic canal roads, movie shooting locations, and coconut groves of Pollachi.',
    description:
      'Experience the lush, vibrant countryside of Pollachi in a tough yet comfortable Mahindra Thar 4x4. Drive beneath endless canopies of swaying coconut palms along the PAP canal, visit scenic village bridges famous in South Indian cinema, and enjoy panoramic vistas of the towering Western Ghats peaks rising above emerald farmlands. Available with an expert local driver who knows all the hidden photo stops.',
    destination_city: 'Pollachi',
    destination_state: 'Tamil Nadu',
    address: 'Palakkad Road, Pollachi Town / Aliyar Road',
    latitude: 10.6609,
    longitude: 77.0048,
    hourly_rate: 750,
    min_booking_hours: 3,
    max_booking_hours: 12,
    buffer_time_minutes: 30,
    average_rating: 4.9,
    total_reviews: 37,
    is_featured: false,
    pickup_location: 'Pollachi Bus Station / Coimbatore Junction / Hotel delivery',
    meeting_point: 'Pollachi PAP Canal Viewpoint or Direct Pickup',
    max_participants: 4,
    images: [
      'https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Well-maintained 4x4 SUV with convertible soft/hard top option',
      'Experienced rural chauffeur with deep knowledge of village routes',
      'Fuel for booked hours within 100km radius',
      'Chilled tender coconut stop included per guest',
    ],
    excluded_services: ['Interstate permits if crossing to Kerala border', 'Personal snacks'],
    terms_and_conditions: 'Driving is restricted to mapped gravel tracks and canal roads; no destructive off-roading.',
    cancellation_policy: 'Free cancellation up to 4 hours before pickup.',
    vehicle_details: {
      vehicle_type: 'car',
      brand: 'Mahindra',
      model: 'Thar 4x4 Hardtop / Convertible',
      year: 2023,
      passenger_capacity: 4,
      fuel_type: 'Diesel',
      features: ['4x4 High/Low', 'Bluetooth Sound System', 'High Ground Clearance', 'All-Terrain Tyres'],
    },
    packages: [
      { id: 'pkg-thar-1', name: 'Canal Road & Coconut Country', duration_hours: 3, price: 2150, description: 'PAP canal drive, Sethumadai village backwaters, and tender coconut stop' },
      { id: 'pkg-thar-2', name: 'Aliyar Foothills & Sunset Safari', duration_hours: 6, price: 4200, description: 'Canal routes, Aliyar Dam foothills, Monkey falls viewpoint, and village sunset' },
    ],
    provider: {
      business_name: 'Pollachi Rural Offroaders',
      description: 'Specialists in authentic rural tourism and scenic drives in Pollachi and Anamalai.',
      city: 'Pollachi',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-thar-1',
        rating: 5,
        review_text:
          'Cruising in the Thar along the PAP canal under thousands of coconut trees with the Ghats in the background was incredible. The driver took us to spots where several Tamil movies were shot!',
        created_at: '2024-03-10T15:30:00Z',
        customer: { full_name: 'Suresh Krishnan', avatar_url: null },
      },
    ],
  },
  'van-cbe-08': {
    id: 'van-cbe-08',
    title: 'Force Traveller 9-Seater — Ooty & Coonoor Hill Hop (Nilgiri Ghats)',
    category: 'van',
    short_description:
      'Flexible hourly mountain van from Coimbatore/Mettupalayam to Coonoor Tea Estates and Dolphin’s Nose without full-day commitments.',
    description:
      'Travelling up into the Nilgiris for just a few hours without being tied to a rigid 24-hour taxi package is now effortless. Our 9-seater Force Traveller picks up your group anywhere in Coimbatore or Mettupalayam and navigates the scenic Nilgiri Mountain Ghat roads. Visit Sim’s Park, Highfield Tea Factory, Lamb’s Rock, and enjoy panoramic views before smoothly returning down.',
    destination_city: 'Mettupalayam',
    destination_state: 'Tamil Nadu',
    address: 'Mettupalayam Road, Near Railway Junction, Coimbatore',
    latitude: 11.3000,
    longitude: 76.9367,
    hourly_rate: 950,
    min_booking_hours: 6,
    max_booking_hours: 12,
    buffer_time_minutes: 45,
    average_rating: 4.8,
    total_reviews: 44,
    is_featured: false,
    pickup_location: 'Coimbatore Airport / Mettupalayam Railway Station / City Doorstep',
    meeting_point: 'Doorstep pickup at scheduled start time',
    max_participants: 9,
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1570125909232-eb263c188f7e?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Spacious 9-seater pushback seating configuration',
      'Mountain-certified driver experienced with ghat hairpin roads',
      'Air conditioning and individual passenger lighting',
      'Nilgiri Hill toll and green tax permits included',
    ],
    excluded_services: ['Sightseeing entry tickets to parks or gardens', 'Driver night halt charges if past 10 PM'],
    terms_and_conditions: 'Uphill mountain route is subject to district administration e-pass rules during peak holiday seasons.',
    cancellation_policy: 'Free cancellation up to 6 hours before start time.',
    vehicle_details: {
      vehicle_type: 'van',
      brand: 'Force Motors',
      model: 'Traveller 9-Seater Executive',
      year: 2023,
      passenger_capacity: 9,
      fuel_type: 'Diesel',
      features: ['Pushback Seats', 'Hill-Hold Assist', 'High Roof', 'Music System'],
    },
    packages: [
      { id: 'pkg-nil-1', name: 'Coonoor Tea Estates Hop', duration_hours: 7, price: 6500, description: 'Mettupalayam to Coonoor Sim’s Park, Lamb’s Rock, and Tea Factory' },
      { id: 'pkg-nil-2', name: 'Ooty & Nilgiri Heights Day Out', duration_hours: 10, price: 9200, description: 'Botanical Garden, Ooty Lake, Doddabetta Peak, and safe return to Coimbatore' },
    ],
    provider: {
      business_name: 'Nilgiri Hill Transit',
      description: 'Safe, punctual, and comfortable mountain van services connecting Coimbatore and Nilgiris.',
      city: 'Mettupalayam',
      languages: ['Tamil', 'English', 'Badaga', 'Hindi'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-nil-1',
        rating: 5,
        review_text:
          'Clean, spacious van with a very calm and skilled driver. Taking a 7-hour booking to visit Coonoor tea gardens from Coimbatore was so much more practical and affordable than paying for two full days.',
        created_at: '2024-03-05T12:00:00Z',
        customer: { full_name: 'Rajeshwari Balan', avatar_url: null },
      },
    ],
  },
  'bike-cbe-09': {
    id: 'bike-cbe-09',
    title: 'Yamaha Aerox 155 Maxi-Scooter — Marudhamalai Hill & City Food Express',
    category: 'bike',
    short_description:
      'Zippy liquid-cooled maxi-scooter with under-seat helmet storage. Ideal for gliding up the Marudhamalai Murugan hill temple road and RS Puram cafes.',
    description:
      'Featuring Yamaha’s 155cc liquid-cooled VVA engine from the R15 sports bike, the Aerox 155 is the ultimate high-performance automatic scooter for Coimbatore. Effortlessly climb the winding tarmac road up Marudhamalai Hill without gearshifts, zip between textile hubs on Cross Cut Road, and store your bags in the massive 24.5-liter underseat compartment.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Vadavalli / Marudhamalai Main Road, Coimbatore',
    latitude: 11.0456,
    longitude: 76.8524,
    hourly_rate: 150,
    min_booking_hours: 2,
    max_booking_hours: 8,
    buffer_time_minutes: 30,
    average_rating: 4.9,
    total_reviews: 39,
    is_featured: false,
    pickup_location: 'Vadavalli Hub / Gandhipuram / RS Puram',
    meeting_point: 'Vadavalli Bus Stop or Marudhamalai Foothills Arch',
    max_participants: 2,
    images: [
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Two ISI-certified helmets',
      'Mobile phone holder with fast USB charging socket',
      'Clean sanitized scooter with fuel top-up guarantee',
      'Comprehensive insurance and roadside assistance',
    ],
    excluded_services: ['Temple parking fees', 'Personal accident insurance'],
    terms_and_conditions: 'Valid two-wheeler driving license required. ₹500 refundable security deposit.',
    cancellation_policy: 'Free cancellation up to 2 hours before pickup.',
    vehicle_details: {
      vehicle_type: 'bike',
      brand: 'Yamaha',
      model: 'Aerox 155 MotoGP Edition',
      year: 2023,
      passenger_capacity: 2,
      fuel_type: 'Petrol',
      features: ['Liquid-Cooled VVA Engine', 'ABS Brakes', 'LED Headlights', 'Massive Storage'],
    },
    packages: [
      { id: 'pkg-aero-1', name: 'Marudhamalai Darshan Express', duration_hours: 3, price: 420, description: 'Quick trip up Marudhamalai hill, Pambatti Siddhar cave, and return' },
      { id: 'pkg-aero-2', name: 'City Cafe & Temple Hop', duration_hours: 5, price: 680, description: 'Marudhamalai morning visit, RS Puram brunch, and Race Course evening ride' },
    ],
    provider: {
      business_name: 'Kovai Foothill Riders',
      description: 'Coimbatore’s top-rated two-wheeler self-drive mobility provider with over 4,000 satisfied riders.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-aero-1',
        rating: 5,
        review_text:
          'The Aerox climbed Marudhamalai hill with two of us without breaking a sweat! So smooth and convenient for a 3-hour morning temple visit.',
        created_at: '2024-03-14T08:30:00Z',
        customer: { full_name: 'Vijay Anand', avatar_url: null },
      },
    ],
  },
  'bike-cbe-10': {
    id: 'bike-cbe-10',
    title: 'Royal Enfield Himalayan 450 — Siruvani Forest & Sadivayal Foothills',
    category: 'bike',
    short_description:
      'Rugged adventure tourer built for Western Ghats twisties, forest checkposts, and gravel paths towards the Siruvani river catchment.',
    description:
      'Engineered for true adventure, the Himalayan 450 Sherpa engine delivers effortless torque for mountain grades and Western Ghats passes. Take this beast along Siruvani Main Road, through lush coconut farmlands of Alandurai and Pooluvapatti, and up to Sadivayal forest checkpost. Features Google Maps integrated Tripper Dash, tubeless cross-spoke wheels, and long-travel suspension.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Siruvani Main Road, Thondamuthur, Coimbatore',
    latitude: 10.9400,
    longitude: 76.7100,
    hourly_rate: 220,
    min_booking_hours: 3,
    max_booking_hours: 10,
    buffer_time_minutes: 30,
    average_rating: 5.0,
    total_reviews: 47,
    is_featured: false,
    pickup_location: 'Thondamuthur / RS Puram / Airport',
    meeting_point: 'Thondamuthur Hub or Hotel Delivery',
    max_participants: 2,
    images: [
      'https://images.unsplash.com/photo-1568772585407-9361f9bf3a87?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Dual DOT/ECE adventure helmets with Bluetooth intercoms',
      'Sturdy waterproof pannier bags and top rack',
      'Full tank on pickup',
      'Crash guards and auxiliary fog lights',
    ],
    excluded_services: ['Forest permit ticket fees', 'Fuel refills'],
    terms_and_conditions: 'Valid motorcycle with gear (MCWG) license mandatory. Security deposit of ₹1,500.',
    cancellation_policy: 'Free cancellation up to 4 hours before booking.',
    vehicle_details: {
      vehicle_type: 'bike',
      brand: 'Royal Enfield',
      model: 'Himalayan 450 Kamet White',
      year: 2024,
      passenger_capacity: 2,
      fuel_type: 'Petrol',
      features: ['Liquid-Cooled 40 HP Engine', 'Switchable ABS', 'TFT Navigation Dash', 'Long Travel Showa Forks'],
    },
    packages: [
      { id: 'pkg-him-1', name: 'Siruvani Foothills Sprint', duration_hours: 4, price: 850, description: 'Thondamuthur to Sadivayal checkpost, riverside stop, and return' },
      { id: 'pkg-him-2', name: 'Western Ghats Boundary Run', duration_hours: 8, price: 1650, description: 'Siruvani, Attappadi border pass, and Anaikatti forest loop' },
    ],
    provider: {
      business_name: 'Velliangiri Moto Expeditions',
      description: 'Premium adventure motorcycle tours and Western Ghats expedition specialists.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-him-1',
        rating: 5,
        review_text:
          'The Himalayan 450 was brand new and in pristine condition! Riding through the forest paths towards Siruvani was pure motorcycling joy. Will book again!',
        created_at: '2024-03-19T17:00:00Z',
        customer: { full_name: 'Gautham Menon', avatar_url: null },
      },
    ],
  },
  'car-cbe-11': {
    id: 'car-cbe-11',
    title: 'Maruti Suzuki Ertiga Hybrid — Perur Temple & Gedee Vintage Car Museum Tour',
    category: 'car',
    short_description:
      'Economical 6-seater AC car with driver for hassle-free city touring: Perur Pateeswarar Temple, Gedee Car Museum, Race Course, and shopping.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Avanashi Road / Race Course, Coimbatore',
    latitude: 11.0183,
    longitude: 76.9725,
    hourly_rate: 480,
    min_booking_hours: 2,
    max_booking_hours: 8,
    buffer_time_minutes: 30,
    average_rating: 4.8,
    total_reviews: 52,
    is_featured: false,
    pickup_location: 'Any hotel in Coimbatore, Railway Station, or Airport',
    meeting_point: 'Doorstep pickup at scheduled start time',
    max_participants: 6,
    images: [
      'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1502877338535-766e1452684a?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Chauffeur in clean uniform with city route knowledge',
      'Air-conditioned 6-seater spacious cabin',
      'Fuel for booked hours within city limits',
      'Bottled drinking water provided',
    ],
    excluded_services: ['Museum entry tickets', 'Shopping expenses'],
    terms_and_conditions: 'Punctual service. Tolls or special parking billed at actuals.',
    cancellation_policy: 'Free cancellation up to 3 hours before start time.',
    vehicle_details: {
      vehicle_type: 'car',
      brand: 'Maruti Suzuki',
      model: 'Ertiga Smart Hybrid ZXi',
      year: 2023,
      passenger_capacity: 6,
      fuel_type: 'Petrol Hybrid',
      features: ['Dual AC', 'Comfortable 3 Rows', 'High Mileage', 'Clean Sanitized Cabin'],
    },
    packages: [
      { id: 'pkg-ert-1', name: 'Coimbatore Heritage & Car Museum', duration_hours: 3, price: 1390, description: 'Gedee Car Museum, Perur Temple, and iconic Annapoorna coffee' },
      { id: 'pkg-ert-2', name: 'Textile Shopping & City Highlights', duration_hours: 5, price: 2290, description: 'Perur temple, silk handloom showrooms, Cross Cut Road, and Race Course' },
    ],
    provider: {
      business_name: 'Kongu Chauffeur Mobility',
      description: 'Coimbatore’s premier executive and pilgrim transport fleet operating since 2015.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Hindi', 'Telugu'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-ert-1',
        rating: 5,
        review_text:
          'Great value for a family of 5! The driver was waiting at Coimbatore railway station, took us to Gedee Car Museum and Perur temple, and got us back with zero hassle.',
        created_at: '2024-03-16T13:45:00Z',
        customer: { full_name: 'Lakshmi Narayanan', avatar_url: null },
      },
    ],
  },
  'van-cbe-12': {
    id: 'van-cbe-12',
    title: 'Tempo Traveller 12-Seater — Baralikadu Coracle & Pillur Dam Eco-Picnic',
    category: 'van',
    short_description:
      'Family and group van for the scenic mountain drive through Karamadai forest to Baralikadu eco-tourism, parisal coracle boat rides, and Pillur dam.',
    destination_city: 'Karamadai',
    destination_state: 'Tamil Nadu',
    address: 'Karamadai Forest Range Office Road, Coimbatore',
    latitude: 11.2333,
    longitude: 76.8167,
    hourly_rate: 1050,
    min_booking_hours: 5,
    max_booking_hours: 12,
    buffer_time_minutes: 45,
    average_rating: 4.9,
    total_reviews: 31,
    is_featured: false,
    pickup_location: 'Coimbatore City / Mettupalayam / Karamadai',
    meeting_point: 'Doorstep pickup at scheduled start time',
    max_participants: 12,
    images: [
      'https://images.unsplash.com/photo-1527786356703-4b100091cd2c?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      '12-passenger luxury pushback seats with high-roof comfort',
      'Experienced mountain driver with Baralikadu forest permit experience',
      'Air-conditioned spacious cabin with overhead luggage racks',
      'Stereo audio system with AUX/Bluetooth connectivity',
    ],
    excluded_services: ['Baralikadu forest entry & coracle package ticket fees', 'Meals'],
    terms_and_conditions: 'Baralikadu eco-tourism operates on weekends and designated forest slots. Advance booking strongly recommended.',
    cancellation_policy: 'Free cancellation up to 6 hours before start time.',
    vehicle_details: {
      vehicle_type: 'van',
      brand: 'Force Motors',
      model: 'Tempo Traveller 3050 Luxury 12-Seater',
      year: 2023,
      passenger_capacity: 12,
      fuel_type: 'Diesel',
      features: ['12 High-Back Reclining Seats', 'Dual Air Conditioning', 'Large Glass Windows', 'Spacious Luggage Boot'],
    },
    packages: [
      { id: 'pkg-bar-1', name: 'Baralikadu Eco Adventure', duration_hours: 6, price: 5900, description: 'Drive to Baralikadu, Pillur dam viewpoints, and forest picnic' },
      { id: 'pkg-bar-2', name: 'Complete Bhavani River Basin Tour', duration_hours: 9, price: 8600, description: 'Baralikadu coracle, Pillur dam catchment, and Mettupalayam fruit orchards' },
    ],
    provider: {
      business_name: 'Western Ghats Van Tours',
      description: 'Trusted group transport and tour provider for Western Ghats nature excursions and family reunions.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-bar-1',
        rating: 5,
        review_text:
          'We booked this for our college friends reunion trip to Baralikadu. Super comfortable van, smooth driving through the reserve forest, and plenty of space for all our bags!',
        created_at: '2024-03-11T19:00:00Z',
        customer: { full_name: 'Dinesh Balaji', avatar_url: null },
      },
    ],
  },
  'guide-cbe-13': {
    id: 'guide-cbe-13',
    title: 'Isha Dhyanalinga & Adiyogi Certified Spiritual Concierge',
    category: 'local_guide',
    short_description:
      'Personal guide through the spiritual processes at Isha Yoga Center: Nada Aradhana, Surya Kund dip, Dhyanalinga silence, and Adiyogi light show narration.',
    description:
      'Make your visit to the Isha Yoga Center deeply fulfilling and serene. Navigating the expansive ashram campus, understanding the unique consecration behind the Dhyanalinga, taking part in the Theerthakund sacred water dip, and securing the best viewing vantage for the spectacular 7:00 PM Adiyogi Divya Darshanam sound and light projection requires thoughtful timing. Your concierge handles all logistics with deep cultural reverence.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Velliangiri Foothills, Ishana Vihar, Coimbatore',
    latitude: 10.9774,
    longitude: 76.7360,
    hourly_rate: 380,
    min_booking_hours: 2,
    max_booking_hours: 6,
    buffer_time_minutes: 20,
    average_rating: 5.0,
    total_reviews: 64,
    is_featured: false,
    pickup_location: 'Isha Main Reception Arch / Sarva Dharma Sthamba',
    meeting_point: 'Sarva Dharma Sthamba (White Marble Pillar) Entrance',
    max_participants: 6,
    images: [
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Dedicated personal concierge familiar with all ashram timings',
      'Detailed orientation for Dhyanalinga, Linga Bhairavi, and Theerthakund',
      'Coordination for Nada Aradhana musical meditation schedule',
      'Reserved prime seating guidance for the 7:00 PM Adiyogi 3D projection show',
    ],
    excluded_services: ['Theerthakund entry token fee', 'Meals at Pepper Vine cafe'],
    terms_and_conditions: 'Modest ashram attire mandatory (covered shoulders and knees). Phones must remain on silent mode in consecrated spaces.',
    cancellation_policy: 'Free cancellation up to 4 hours before booking time.',
    guide_details: {
      languages: ['Tamil', 'English', 'Hindi', 'Telugu'],
      specializations: ['Yogic Traditions', 'Dhyanalinga Consecration', 'Velliangiri Sacred Geography'],
      experience_years: 7,
      max_group_size: 6,
    },
    packages: [
      { id: 'pkg-isha-1', name: 'Adiyogi Evening Spectacle & Bhairavi', duration_hours: 3, price: 1100, description: 'Linga Bhairavi arati, Theerthakund, and Adiyogi 3D sound & light show' },
      { id: 'pkg-isha-2', name: 'Comprehensive Isha Spiritual Immersion', duration_hours: 5, price: 1800, description: 'Dhyanalinga meditation, Nada Aradhana music, Theerthakund dip, and full campus walkthrough' },
    ],
    provider: {
      business_name: 'Velliangiri Spiritual Walkers',
      description: 'Devoted spiritual hosts guiding seekers through sacred Western Ghats destinations.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English', 'Hindi', 'Telugu'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-isha-1',
        rating: 5,
        review_text:
          'Having a guide made our visit 10x more meaningful! Priya explained the science of Dhyanalinga and knew the exact timing to ensure we experienced Nada Aradhana without rushing. Highly recommended.',
        created_at: '2024-03-21T20:30:00Z',
        customer: { full_name: 'Sunita Agarwal', avatar_url: null },
      },
    ],
  },
  'tour-cbe-14': {
    id: 'tour-cbe-14',
    title: 'Topslip Wildlife & Sethumadai Village Countryside Safari',
    category: 'sightseeing_tour',
    short_description:
      'Hourly guided safari to Topslip elephant camp in Anamalai Tiger Reserve, teak plantations, and Sethumadai rural coconut farmlands.',
    destination_city: 'Pollachi',
    destination_state: 'Tamil Nadu',
    address: 'Sethumadai Gate / Topslip Reception, Anamalai Hills',
    latitude: 10.4833,
    longitude: 76.8333,
    hourly_rate: 620,
    min_booking_hours: 4,
    max_booking_hours: 8,
    buffer_time_minutes: 30,
    average_rating: 4.9,
    total_reviews: 43,
    is_featured: false,
    pickup_location: 'Pollachi Town / Sethumadai Checkpost / Hotel',
    meeting_point: 'Sethumadai Forest Entry Checkpost',
    max_participants: 8,
    images: [
      'https://images.unsplash.com/photo-1516426122078-c23e76319801?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Certified wildlife tracker and naturalist guide',
      'Assistance with forest safari permits and elephant camp entry',
      'Interpretation of Anamalai Tiger Reserve flora, fauna, and hornbills',
      'Village walk through traditional jaggery and coconut drying fields',
    ],
    excluded_services: ['Forest department elephant camp vehicle token', 'Personal camera charges'],
    terms_and_conditions: 'Wildlife sightings are natural and cannot be guaranteed. Strictly follow forest naturalist safety instructions.',
    cancellation_policy: 'Free cancellation up to 6 hours before scheduled start.',
    tour_details: {
      itinerary: [
        'Sethumadai village pickup and introduction to Anamalai Tiger Reserve ecology',
        'Ascent through teak plantations to Topslip (800m altitude)',
        'Visit to Kozhikamuthi Elephant Camp (timing permitting)',
        'Nature trail observation for Malabar Giant Squirrel and Hornbills',
        'Descent through organic coconut farms and fresh jaggery tasting',
      ],
      meeting_point: 'Sethumadai Forest Entry Gate',
      group_size: 'Up to 8 guests',
      what_to_bring: ['Earth-toned clothing', 'Binoculars / camera', 'Sturdy walking shoes'],
    },
    packages: [
      { id: 'pkg-top-1', name: 'Topslip Forest & Elephant Camp', duration_hours: 4, price: 2350, description: 'Topslip safari, elephant interaction observation, and teak forest trail' },
      { id: 'pkg-top-2', name: 'Full Anamalai Wilderness & Countryside', duration_hours: 7, price: 3950, description: 'Topslip safari, Kozhikamuthi camp, Sethumadai farmlands, and tribal artisan visit' },
    ],
    provider: {
      business_name: 'Anamalai Eco Trails',
      description: 'Pioneers in responsible community wildlife tourism in the Anamalai hills.',
      city: 'Pollachi',
      languages: ['Tamil', 'English', 'Malayalam'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-top-1',
        rating: 5,
        review_text:
          'We spotted two Malabar Giant Squirrels and several great Indian hornbills! Our guide Shanmugam grew up in this forest and had incredible eyesight. Our children loved it.',
        created_at: '2024-03-17T11:00:00Z',
        customer: { full_name: 'Kavitha Ramachandran', avatar_url: null },
      },
    ],
  },
  'exp-cbe-15': {
    id: 'exp-cbe-15',
    title: 'Gedee Car Museum & Kovai Industrial Innovation Guided Walk',
    category: 'experience',
    short_description:
      'Curated walk through India’s foremost vintage automobile collection, showcasing 70+ iconic classic cars and G.D. Naidu’s pioneering indigenous inventions.',
    destination_city: 'Coimbatore',
    destination_state: 'Tamil Nadu',
    address: 'Gedee Technical Training Institute Campus, Avanashi Road, Coimbatore',
    latitude: 11.0125,
    longitude: 76.9808,
    hourly_rate: 350,
    min_booking_hours: 2,
    max_booking_hours: 4,
    buffer_time_minutes: 15,
    average_rating: 5.0,
    total_reviews: 57,
    is_featured: false,
    pickup_location: 'Gedee Museum Main Entrance, Avanashi Road',
    meeting_point: 'Gedee Car Museum Ticket Foyer, Avanashi Road',
    max_participants: 10,
    images: [
      'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=1200&q=80',
      'https://images.unsplash.com/photo-1511556532299-8f662fc26c06?auto=format&fit=crop&w=800&q=80',
    ],
    included_services: [
      'Specialist automotive historian and engineer guide',
      'Curated walkthrough of vintage Benz Patent Motorwagen replica, microcars, and classic Morris/Rolls',
      'Deep dive into G.D. Naidu’s legendary inventions (the "Edison of India")',
      'Interactive demonstration of early mechanical engines and Coimbatore industrial spirit',
    ],
    excluded_services: ['Museum admission entry ticket (₹100 at counter)', 'Personal camera pass'],
    terms_and_conditions: 'Museum is closed on Mondays. Touching display vehicles is strictly prohibited.',
    cancellation_policy: 'Free cancellation up to 2 hours before tour start time.',
    experience_details: {
      host_name: 'Er. R. Sivasankaran',
      languages: ['Tamil', 'English'],
      highlights: [
        '1886 Benz Patent Motorwagen replica & 1920s classic cars',
        'BMW Isetta bubble car and rare Peel P50 microcars',
        'G.D. Naidu indigenous razor blades, electric motors, and early mechanical calculators',
        'How Coimbatore transformed into India’s pump & engineering powerhouse',
      ],
    },
    packages: [
      { id: 'pkg-ged-1', name: 'Classic Car & Innovation Express', duration_hours: 2, price: 680, description: 'Curated 2-hour walkthrough of 70+ vintage automobiles and GD Naidu exhibits' },
      { id: 'pkg-ged-2', name: 'Automotive & Industrial Heritage Trail', duration_hours: 3.5, price: 1150, description: 'Gedee Car Museum + GD Science Museum + iconic Annapoorna coffee discussion' },
    ],
    provider: {
      business_name: 'Kovai Science & Heritage Society',
      description: 'Dedicated engineers and historians showcasing Coimbatore’s world-class technological legacy.',
      city: 'Coimbatore',
      languages: ['Tamil', 'English'],
      verification_status: 'approved',
    },
    reviews: [
      {
        id: 'rev-ged-1',
        rating: 5,
        review_text:
          'Did not realize Coimbatore has such a world-class automobile museum! Having an automotive engineer guide us through the mechanics of the microcars and GD Naidu’s inventions made it an unforgettable afternoon.',
        created_at: '2024-03-23T16:15:00Z',
        customer: { full_name: 'Manoj Kumar', avatar_url: null },
      },
    ],
  },
}

export default function ServiceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params?.id as string

  const [listing, setListing] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [activeImageIndex, setActiveImageIndex] = useState(0)
  const [showContactHostModal, setShowContactHostModal] = useState(false)

  useEffect(() => {
    async function fetchListing() {
      setLoading(true)
      try {
        const res = await fetch(`/api/services/${id}`)
        if (res.ok) {
          const data = await res.json()
          if (data.listing) {
            setListing(data.listing)
            setLoading(false)
            return
          }
        }

        // Fallback to demo datasets
        if (demoListingsData[id]) {
          setListing(demoListingsData[id])
        } else {
          // generic fallback to Coimbatore flagship listing
          setListing({
            ...demoListingsData['bike-cbe-01'],
            id,
            title: `Hourly Service: ${id}`,
          })
        }
      } catch (err) {
        setListing(demoListingsData[id] || demoListingsData['bike-cbe-01'])
      } finally {
        setLoading(false)
      }
    }

    if (id) fetchListing()
  }, [id])

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <FullPageLoader text="Loading hourly service details..." />
        <Footer />
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Header />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Service Not Found</h2>
          <p className="text-gray-500 mb-6">The requested listing could not be found or has been deactivated.</p>
          <Link href="/explore">
            <Button variant="primary">Return to Marketplace</Button>
          </Link>
        </div>
        <Footer />
      </div>
    )
  }

  const images = normalizeListingImages(listing.images, listing.category)

  // Extract clean human-readable terms & conditions
  let parsedTerms = ''
  let parsedCancellation = listing?.cancellation_policy || ''

  if (listing?.terms_and_conditions) {
    if (typeof listing.terms_and_conditions === 'string') {
      if (listing.terms_and_conditions.trim().startsWith('{')) {
        try {
          const meta = JSON.parse(listing.terms_and_conditions)
          parsedTerms = meta.rental_terms || meta.trip_terms || meta.terms || ''
          if (meta.cancellation_policy && !parsedCancellation) {
            parsedCancellation = meta.cancellation_policy
          }
        } catch {
          parsedTerms = listing.terms_and_conditions
        }
      } else {
        parsedTerms = listing.terms_and_conditions
      }
    } else if (typeof listing.terms_and_conditions === 'object') {
      parsedTerms = listing.terms_and_conditions.rental_terms || listing.terms_and_conditions.trip_terms || listing.terms_and_conditions.terms || ''
      if (listing.terms_and_conditions.cancellation_policy && !parsedCancellation) {
        parsedCancellation = listing.terms_and_conditions.cancellation_policy
      }
    }
  }

  if (!parsedTerms) {
    parsedTerms = 'Dedicated personal vehicle & verified host provided for the entire booked duration. Doorstep or hotel meeting point punctual pickup. Zero surge pricing guarantee.'
  }

  if (!parsedCancellation) {
    parsedCancellation = 'Free cancellation up to 4 hours prior to scheduled trip start time. 50% refund for cancellations within 4 hours. Non-refundable once trip starts.'
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50/50">
      <Header />

      {/* Breadcrumb Bar */}
      <div className="bg-white border-b border-gray-100 py-3">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between text-xs text-gray-500">
          <Link href="/explore" className="flex items-center hover:text-[#ff7a00] font-semibold">
            <ChevronLeft className="w-4 h-4 mr-1" />
            Back to Explore
          </Link>
          <div className="flex items-center space-x-2">
            <span className="capitalize">{listing.category?.replace(/_/g, ' ')}</span>
            <span>/</span>
            <span>{listing.destination_city}</span>
          </div>
        </div>
      </div>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex-1 w-full">
        {/* Title Header */}
        <div className="mb-6 flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2.5 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-green-100/80 text-[#0a4d29]">
                {listing.category?.replace(/_/g, ' ')}
              </span>
              <span className="flex items-center text-xs font-semibold text-gray-500">
                <MapPin className="w-3.5 h-3.5 text-[#ff7a00] mr-1" />
                {listing.destination_city}, {listing.destination_state || 'India'}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-black text-gray-900 font-display">
              {listing.title}
            </h1>
          </div>

          <div className="flex items-center space-x-3">
            <Rating
              value={Number(listing.average_rating || 5.0)}
              size="md"
              showCount
              count={listing.total_reviews || 0}
            />
          </div>
        </div>

        {/* Image Gallery */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-10">
          <div className="md:col-span-2 aspect-[16/10] rounded-3xl overflow-hidden bg-gray-200 shadow-sm">
            <img
              src={images[activeImageIndex] || images[0]}
              alt={listing.title}
              className="w-full h-full object-cover"
            />
          </div>
          <div className="flex md:flex-col gap-4 overflow-x-auto">
            {images.map((img: string, idx: number) => (
              <div
                key={idx}
                onClick={() => setActiveImageIndex(idx)}
                className={`relative aspect-[16/10] rounded-2xl overflow-hidden cursor-pointer border-2 transition-all flex-1 ${activeImageIndex === idx ? 'border-[#ff7a00] shadow-md' : 'border-transparent opacity-75 hover:opacity-100'
                  }`}
              >
                <img src={img} alt={`Thumbnail ${idx + 1}`} className="w-full h-full object-cover" />
              </div>
            ))}
          </div>
        </div>

        {/* Content & Booking Engine Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Details Column */}
          <div className="lg:col-span-7 space-y-8">
            {/* Host / Provider Profile Card */}
            <div className="p-6 rounded-3xl bg-white border border-gray-100 shadow-sm flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Avatar
                  name={listing.provider?.business_name || 'Host'}
                  size="lg"
                />
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-bold text-base text-gray-900">
                      Hosted by {listing.provider?.business_name || 'Verified Partner'}
                    </h3>
                    <span title="Verified Host">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {listing.provider?.description || 'Independent verified tourism service provider.'}
                  </p>
                  {listing.provider?.languages && (
                    <div className="flex items-center space-x-1.5 text-xs text-gray-400 mt-1">
                      <Languages className="w-3.5 h-3.5" />
                      <span>Speaks: {listing.provider.languages.join(', ')}</span>
                    </div>
                  )}
                </div>
              </div>

              <button
                onClick={() => setShowContactHostModal(true)}
                className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-orange-50 hover:border-orange-300 hover:text-[#ff7a00] transition-colors"
              >
                <MessageCircle className="w-4 h-4 mr-1.5 text-[#ff7a00]" />
                Contact Host
              </button>
            </div>

            {/* Rider-Hosted Notice Banner */}
            <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-50 border border-emerald-200/80 shadow-xs flex items-start gap-3.5">
              <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shrink-0 shadow-md shadow-emerald-700/20 text-lg">
                {listing.category === 'bike' ? '🏍️' : listing.category === 'car' ? '🚗' : listing.category === 'van' ? '🚐' : '🧭'}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h4 className="font-black text-xs uppercase tracking-wider text-emerald-950 font-display">
                    {listing.category === 'bike'
                      ? 'Rider-Hosted Two-Wheeler Tour'
                      : listing.category === 'car'
                        ? 'Host-Chauffeured Car Sightseeing'
                        : listing.category === 'van'
                          ? 'Local Driver Group Tour'
                          : 'Verified Local Guide Trip'}
                  </h4>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-700 text-white">
                    Rider & Fuel Included
                  </span>
                </div>
                <p className="text-xs text-emerald-900 leading-relaxed">
                  This is an hourly tourist service provided by a verified registered local vehicle owner in their free time. Your host meets you with their personal vehicle, drives/rides you across the planned places, and shares insider local knowledge throughout your booked hours.
                </p>
              </div>
            </div>

            {/* Planned Trip Route & Stops */}
            {listing.planned_spots && listing.planned_spots.length > 0 && (
              <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-gray-100">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-100 text-[#0a4d29]">
                        Planned Trip Route
                      </span>
                      <span className="text-xs font-semibold text-gray-500">
                        {listing.planned_spots.length} Planned Stops
                      </span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 font-display mt-1">
                      Places & Attractions in this Hourly Tour
                    </h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Your local host will take you to these places in sequence during your booked hours.
                    </p>
                  </div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-2xl bg-emerald-50 text-emerald-800 text-xs font-bold shrink-0">
                    <Clock className="w-4 h-4 text-emerald-600" />
                    <span>Min {listing.min_booking_hours || 2} Hours Suggested</span>
                  </div>
                </div>

                {/* Visual Stop-by-Stop Timeline */}
                <div className="relative pl-6 sm:pl-8 space-y-6 before:absolute before:left-3 sm:before:left-4 before:top-3 before:bottom-3 before:w-0.5 before:bg-emerald-200">
                  {listing.planned_spots.map((spot: any, idx: number) => (
                    <div key={idx} className="relative group">
                      {/* Timeline node */}
                      <div className="absolute -left-6 sm:-left-8 top-1 w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-[10px] font-black shadow-md shadow-emerald-600/30 ring-4 ring-white">
                        {idx + 1}
                      </div>

                      <div className="p-4 sm:p-5 rounded-2xl bg-gray-50/90 border border-gray-100 hover:border-emerald-300 transition-all space-y-2">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <h4 className="text-sm font-bold text-gray-900 flex items-center gap-2">
                            <span>{spot.name}</span>
                            {spot.is_custom && (
                              <span className="px-2 py-0.5 rounded-md text-[9px] font-black uppercase bg-purple-100 text-purple-700">
                                Host Choice
                              </span>
                            )}
                          </h4>
                          {spot.duration && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white text-emerald-800 border border-emerald-200/80 shadow-xs flex items-center gap-1">
                              <Clock className="w-3 h-3 text-emerald-600" />
                              <span>{spot.duration}</span>
                            </span>
                          )}
                        </div>

                        {spot.description && (
                          <p className="text-xs text-gray-600 leading-relaxed">
                            {spot.description}
                          </p>
                        )}

                        {spot.insider_tip && (
                          <div className="pt-2 border-t border-gray-200/60 text-xs text-orange-900 bg-orange-50/70 p-2.5 rounded-xl border border-orange-200/60 flex items-start gap-1.5">
                            <Sparkles className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
                            <span><strong>Host Insider Tip:</strong> {spot.insider_tip}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Description */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-gray-900 font-display">About This Hourly Experience</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {listing.description}
              </p>

              {/* Vehicle specific attributes */}
              {listing.vehicle_details && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Vehicle Specifications
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="text-gray-400 block text-[10px]">Model</span>
                      <span className="font-bold text-gray-800">
                        {listing.vehicle_details.brand} {listing.vehicle_details.model}
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="text-gray-400 block text-[10px]">Capacity</span>
                      <span className="font-bold text-gray-800">
                        {listing.vehicle_details.passenger_capacity} Passengers
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="text-gray-400 block text-[10px]">Fuel</span>
                      <span className="font-bold text-gray-800">
                        {listing.vehicle_details.fuel_type || 'Petrol'}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Guide specific attributes */}
              {listing.guide_details && (
                <div className="mt-6 pt-6 border-t border-gray-100">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3">
                    Guide Credentials
                  </h4>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="text-gray-400 block text-[10px]">Experience</span>
                      <span className="font-bold text-gray-800">
                        {listing.guide_details.experience_years} Years Certified
                      </span>
                    </div>
                    <div className="p-3 rounded-2xl bg-gray-50 border border-gray-100 text-xs">
                      <span className="text-gray-400 block text-[10px]">Max Group Size</span>
                      <span className="font-bold text-gray-800">
                        Up to {listing.guide_details.max_group_size || 8} People
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Host Curated Unseen Tourist Spots & Hidden Gems */}
            {((listing.unseen_spots && listing.unseen_spots.length > 0) ||
              (listing.hidden_spots && listing.hidden_spots.length > 0)) && (
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-emerald-950 via-[#0a4d29] to-[#041a0d] text-white shadow-xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-orange-500/10 rounded-full blur-3xl pointer-events-none" />
                  <div className="relative z-10">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-orange-500/20 text-orange-300 border border-orange-400/30">
                        Host Exclusive Curations
                      </span>
                      <span className="text-xs text-emerald-300 font-semibold">• Off the Beaten Track</span>
                    </div>
                    <h2 className="text-xl sm:text-2xl font-black font-display text-white">
                      Unseen Tourist Spots & Secret Hidden Gems
                    </h2>
                    <p className="text-xs sm:text-sm text-emerald-100/80 mt-1">
                      This local host knows Coimbatore and surrounding circuits inside out. Discover authentic spots beyond standard tourist trails.
                    </p>
                  </div>

                  {/* Unseen Spots List */}
                  {listing.unseen_spots && listing.unseen_spots.length > 0 && (
                    <div className="space-y-3 relative z-10">
                      <h4 className="text-xs font-black uppercase tracking-wider text-emerald-300 flex items-center gap-1.5">
                        <Compass className="w-4 h-4 text-emerald-400" />
                        Unseen Tourist Spots ({listing.unseen_spots.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listing.unseen_spots.map((spot: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 hover:bg-white/15 transition-colors"
                          >
                            <div className="flex items-center justify-between">
                              <h5 className="font-bold text-sm text-white">{spot.name}</h5>
                              {spot.duration && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/30 text-emerald-200 border border-emerald-400/30">
                                  {spot.duration}
                                </span>
                              )}
                            </div>
                            {spot.description && (
                              <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                                {spot.description}
                              </p>
                            )}
                            {spot.tip && (
                              <p className="text-[11px] text-orange-300 font-medium pt-1 border-t border-white/10 flex items-center gap-1">
                                <span>💡</span>
                                <span><strong>Host Tip:</strong> {spot.tip}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Hidden Gems List */}
                  {listing.hidden_spots && listing.hidden_spots.length > 0 && (
                    <div className="space-y-3 relative z-10 pt-2 border-t border-white/10">
                      <h4 className="text-xs font-black uppercase tracking-wider text-orange-300 flex items-center gap-1.5">
                        <Sparkles className="w-4 h-4 text-orange-400" />
                        Hidden Gems & Secret Stops ({listing.hidden_spots.length})
                      </h4>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {listing.hidden_spots.map((gem: any, idx: number) => (
                          <div
                            key={idx}
                            className="p-4 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 space-y-2 hover:bg-white/15 transition-colors"
                          >
                            <h5 className="font-bold text-sm text-white flex items-center gap-1.5">
                              <span className="w-2 h-2 rounded-full bg-orange-400" />
                              {gem.name}
                            </h5>
                            {gem.description && (
                              <p className="text-xs text-emerald-100/90 leading-relaxed font-normal">
                                {gem.description}
                              </p>
                            )}
                            {gem.tip && (
                              <p className="text-[11px] text-amber-300 font-medium pt-1 border-t border-white/10 flex items-center gap-1">
                                <span>✨</span>
                                <span><strong>Secret Insight:</strong> {gem.tip}</span>
                              </p>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

            {/* Included & Excluded services */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6">
              <h2 className="text-xl font-bold text-gray-900 font-display">What's Included & Excluded</h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-[#0a4d29] mb-3 flex items-center">
                    <Check className="w-4 h-4 mr-1.5" />
                    Included in Hourly Rate
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {listing.included_services?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-[#15803d] mr-2 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-bold uppercase tracking-wider text-red-600 mb-3 flex items-center">
                    <X className="w-4 h-4 mr-1.5" />
                    Excluded
                  </h4>
                  <ul className="space-y-2 text-xs text-gray-600">
                    {listing.excluded_services?.map((item: string, i: number) => (
                      <li key={i} className="flex items-start">
                        <span className="text-red-500 mr-2 font-bold">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>

            {/* Location & Meeting Point Map */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-4">
              <h2 className="text-xl font-bold text-gray-900 font-display">Pickup & Meeting Location</h2>
              <p className="text-xs text-gray-500">
                {listing.pickup_location || listing.meeting_point || listing.address}
              </p>
              <MapDisplay
                latitude={listing.latitude}
                longitude={listing.longitude}
                address={listing.address}
                city={listing.destination_city}
              />
            </div>

            {/* Terms and Policies */}
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-gray-100 shadow-sm space-y-6 text-xs text-gray-600">
              <div className="flex items-center justify-between pb-3 border-b border-gray-100">
                <div className="flex items-center space-x-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-[#ff7a00] flex items-center justify-center font-bold">
                    <FileText className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-sm font-display">Terms & Cancellation Policy</h3>
                    <p className="text-[11px] text-gray-400">Clear, transparent rules with 100% Escrow Protection</p>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase bg-emerald-100 text-[#0a4d29] flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" />
                  Escrow Protected
                </span>
              </div>

              {/* Core Hourly Booking Inclusions & Terms */}
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                  Hourly Tourism Standard Booking Terms
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-base shrink-0">⛽</span>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Fuel & Maintenance Included</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Zero extra fuel charges for all planned route mileage during your booked hours.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-base shrink-0">🚗</span>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Dedicated Local Host</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Your personal host & vehicle stay exclusively with your group for the reserved time.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-base shrink-0">🛡️</span>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Zero Surge Pricing</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Guaranteed flat hourly rate with no peak-hour spikes or hidden platform fees.</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2.5 p-3 rounded-2xl bg-gray-50 border border-gray-100">
                    <span className="text-base shrink-0">⏱️</span>
                    <div>
                      <p className="font-bold text-gray-900 text-xs">Flexible Overtime Billing</p>
                      <p className="text-[11px] text-gray-500 mt-0.5">Need more time? Extend in 1-hour increments directly with your host at standard rate.</p>
                    </div>
                  </div>
                </div>

                {/* Specific Listing Terms */}
                {parsedTerms && (
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200/70 text-amber-950 space-y-1">
                    <span className="font-bold text-xs flex items-center gap-1.5">
                      <AlertCircle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      Host Experience Notes & Guidelines:
                    </span>
                    <p className="text-xs leading-relaxed text-amber-900">{parsedTerms}</p>
                  </div>
                )}
              </div>

              {/* Tiered Cancellation & Refund Policy */}
              <div className="space-y-3 pt-2">
                <h4 className="font-bold text-xs uppercase tracking-wider text-gray-700">
                  Tiered Cancellation & Refund Policy
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-4 gap-2">
                  <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-emerald-700 block">&gt; 4 Hours Notice</span>
                    <span className="text-lg font-black text-emerald-800 block">100% Refund</span>
                    <span className="text-[10px] text-emerald-600 block">Zero fee cancellation</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-yellow-50 border border-yellow-200 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-yellow-800 block">2 – 4 Hours Notice</span>
                    <span className="text-lg font-black text-yellow-900 block">75% Refund</span>
                    <span className="text-[10px] text-yellow-700 block">Minor host prep fee</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-orange-50 border border-orange-200 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-orange-800 block">&lt; 2 Hours Notice</span>
                    <span className="text-lg font-black text-orange-900 block">50% Refund</span>
                    <span className="text-[10px] text-orange-700 block">Late cancellation</span>
                  </div>

                  <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200 text-center space-y-1">
                    <span className="text-[10px] uppercase font-bold text-rose-800 block">After Start Time</span>
                    <span className="text-lg font-black text-rose-900 block">No Refund</span>
                    <span className="text-[10px] text-rose-700 block">Host dispatched</span>
                  </div>
                </div>

                <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 text-[#0a4d29] flex items-start gap-2">
                  <ShieldCheck className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <p className="text-xs leading-relaxed">
                    <strong>100% Escrow Protection:</strong> Your funds are held securely until the ride begins. 
                    The host receives payment only after you meet and verify your 4-digit Ride Start OTP. {parsedCancellation}
                  </p>
                </div>
              </div>
            </div>

            {/* Verified Reviews */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-xl font-bold text-gray-900 font-display">
                  Verified Reviews ({listing.total_reviews || 0})
                </h2>
                <Rating value={Number(listing.average_rating || 5.0)} size="md" />
              </div>

              {listing.reviews && listing.reviews.length > 0 ? (
                <div className="space-y-4">
                  {listing.reviews.map((r: any) => (
                    <ReviewCard key={r.id} review={r} />
                  ))}
                </div>
              ) : (
                <p className="text-xs text-gray-400 p-6 bg-white rounded-3xl border text-center">
                  No customer reviews yet. Be the first to review after completing your hourly trip!
                </p>
              )}
            </div>
          </div>

          {/* Right Sticky Column: Hourly Booking Engine */}
          <div className="lg:col-span-5">
            <div className="sticky top-24" id="hourly-booking-engine-card">
              <BookingForm
                listingId={listing.id}
                hourlyRate={Number(listing.hourly_rate)}
                minHours={listing.min_booking_hours || 1}
                maxHours={listing.max_booking_hours || 12}
                packages={listing.packages || []}
                maxParticipants={listing.max_participants || 6}
                pickupLocation={listing.pickup_location}
                meetingPoint={listing.meeting_point}
              />
            </div>
          </div>
        </div>
      </main>

      {/* Contact Host Modal */}
      {showContactHostModal && (
        <Modal
          isOpen={showContactHostModal}
          onClose={() => setShowContactHostModal(false)}
          title="Contact Verified Host"
          size="sm"
        >
          <div className="space-y-4">
            <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 flex items-center space-x-3">
              <Avatar
                src={listing.provider?.avatar_url || null}
                name={listing.provider?.business_name || 'Host'}
                size="md"
              />
              <div>
                <h4 className="font-bold text-sm text-emerald-950">
                  {listing.provider?.business_name || 'Verified Tourism Host'}
                </h4>
                <p className="text-xs text-emerald-800">
                  {listing.destination_city}, {listing.destination_state || 'Tamil Nadu'}
                </p>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <a
                href={`tel:${listing.provider?.phone || '+919488312345'}`}
                className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-200 hover:border-emerald-500 hover:bg-emerald-50/50 transition-all font-bold text-gray-800"
              >
                <span className="flex items-center gap-2">
                  <Phone className="w-4 h-4 text-[#0a4d29]" />
                  <span>Call Direct: {listing.provider?.phone || '+91 94883 12345'}</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                  Instant
                </span>
              </a>

              <a
                href={`https://wa.me/${(listing.provider?.phone || '919488312345').replace(/[^0-9]/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center justify-between p-3.5 rounded-2xl border border-emerald-200 bg-emerald-600 text-white hover:bg-emerald-700 transition-all font-bold"
              >
                <span className="flex items-center gap-2">
                  <MessageCircle className="w-4 h-4" />
                  <span>Chat on WhatsApp</span>
                </span>
                <span className="text-[10px] uppercase font-bold text-emerald-100 bg-white/20 px-2 py-0.5 rounded-full">
                  Online
                </span>
              </a>
            </div>

            <p className="text-[11px] text-gray-400 text-center">
              Available 7:00 AM – 10:00 PM • Average response time under 5 minutes
            </p>

            <div className="flex justify-end pt-2">
              <Button variant="secondary" size="sm" onClick={() => setShowContactHostModal(false)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* ── MOBILE STICKY FLOATING QUICK-BOOKING BAR (ZERO-SCROLL INSTANT ACCESS) ── */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-gray-200 px-4 py-3 shadow-2xl flex items-center justify-between gap-3">
        <div>
          <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block">Starts at</span>
          <div className="flex items-baseline space-x-1">
            <span className="text-xl font-black text-[#0a4d29]">
              {CURRENCY_SYMBOL}{Number(listing.hourly_rate).toLocaleString('en-IN')}
            </span>
            <span className="text-xs font-semibold text-gray-500">/ hour</span>
          </div>
        </div>

        <button
          onClick={() => {
            const formEl = document.getElementById('hourly-booking-engine-card')
            if (formEl) {
              formEl.scrollIntoView({ behavior: 'smooth' })
            }
          }}
          className="px-5 py-2.5 rounded-2xl bg-[#ff7a00] hover:bg-[#e06c00] text-white font-black text-xs shadow-lg flex items-center gap-1.5 active:scale-95 transition-transform"
        >
          <span>Instant Book & Pay Now ↗</span>
        </button>
      </div>

      <Footer />
    </div>
  )
}

