export interface ShowcaseRiderHost {
  id: string
  business_name: string
  title: string
  tagline: string
  region: string // 'Coimbatore' | 'Pollachi' | etc.
  category: 'bike' | 'car' | 'van' | 'local_guide' | 'sightseeing_tour' | 'experience'
  starting_rate: number
  rating: number
  reviews_count: number
  image_url: string
  features: string[]
  badge?: string
  explore_query?: string
  is_active: boolean
}

export interface RegionBundleConfig {
  badge: string
  title: string
  subtitle: string
}

export interface HomepageFeaturedSettings {
  section_eyebrow: string
  section_title: string
  all_regions_badge: string
  all_regions_title: string
  all_regions_subtitle: string
  region_configs: Record<string, RegionBundleConfig>
  hosts: ShowcaseRiderHost[]
}

export const DEFAULT_SHOWCASE_HOSTS: ShowcaseRiderHost[] = [
  {
    id: 'host-1',
    business_name: 'Kovai Foothill Riders',
    title: 'Isha Adiyogi & Marudhamalai Foothill Cruisers',
    tagline: 'Certified motorcycle hosts with sanitized pillion helmets & GoPro mounts for foothill curves',
    region: 'Coimbatore',
    category: 'bike',
    starting_rate: 180,
    rating: 4.9,
    reviews_count: 142,
    image_url: 'https://images.unsplash.com/photo-1558981403-c5f9899a28bc?auto=format&fit=crop&w=800&q=80',
    features: ['Royal Enfield Hunter & Classic 350', 'Complimentary ISI Pillion Helmets', 'Sunset Divya Darshanam Stop'],
    badge: 'Top Rated Rider Host',
    explore_query: 'Kovai Foothill Riders',
    is_active: true,
  },
  {
    id: 'host-2',
    business_name: 'Kongu Chauffeur Tours',
    title: 'Siruvani Sweet Water & Kongu Heritage Drive',
    tagline: 'Prompt, background-verified personal car chauffeurs for comfortable family day trips',
    region: 'Coimbatore',
    category: 'car',
    starting_rate: 480,
    rating: 4.95,
    reviews_count: 218,
    image_url: 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80',
    features: ['Clean AC Sedans & Innova Crysta', 'Experienced Western Ghats Chauffeur', 'Flexible 1-12 Hour Tariffs'],
    badge: 'Premier Chauffeur',
    explore_query: 'Kongu Chauffeur Tours',
    is_active: true,
  },
  {
    id: 'host-3',
    business_name: 'Anamalai Luxury Fleet & Tours',
    title: 'Valparai 40 Hairpins & Cloud Plateau Luxury Tour',
    tagline: 'Spacious luxury cruisers with panoramic windows & seasoned mountain ghat drivers',
    region: 'Pollachi',
    category: 'van',
    starting_rate: 1100,
    rating: 4.88,
    reviews_count: 96,
    image_url: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=800&q=80',
    features: ['12-Seater Luxury Pushback Vans', 'Experienced Mountain Ghat Drivers', 'Family & Corporate Group Specials'],
    badge: 'Luxury Van Host',
    explore_query: 'Anamalai Luxury Fleet & Tours',
    is_active: true,
  },
  {
    id: 'host-4',
    business_name: 'Kovai Heritage Guild',
    title: 'Ancient Perur Chola Temple & Handloom Weavers Trail',
    tagline: 'Passionate regional historians guiding you through 1500-year-old stone temple secrets',
    region: 'Coimbatore',
    category: 'local_guide',
    starting_rate: 250,
    rating: 4.92,
    reviews_count: 84,
    image_url: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    features: ['Certified Temple Historian', 'Live English & Tamil Narration', 'Behind-the-scenes Artisan Looms'],
    badge: 'Certified Heritage Guide',
    explore_query: 'Kovai Heritage Guild',
    is_active: true,
  },
  {
    id: 'host-5',
    business_name: 'Western Ghats Eco Adventures',
    title: 'Sadivayal Reserve Forest & Muthikulam River Treks',
    tagline: 'Eco-certified naturalists conducting sustainable Western Ghats biosphere trails',
    region: 'Coimbatore',
    category: 'experience',
    starting_rate: 450,
    rating: 4.9,
    reviews_count: 112,
    image_url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    features: ['Zero-Plastic Nature Treks', 'Bird Watching & Flora Spotting', 'Permit Assistance Included'],
    badge: 'Eco Naturalist',
    explore_query: 'Western Ghats Eco Adventures',
    is_active: true,
  },
  {
    id: 'host-6',
    business_name: 'Kongu Food Trails',
    title: 'Authentic Kongunadu Kitchens & Bazaars Food Walk',
    tagline: 'Curated gastronomic walks through iconic messes, filter coffee houses, and spice markets',
    region: 'Coimbatore',
    category: 'experience',
    starting_rate: 320,
    rating: 4.97,
    reviews_count: 175,
    image_url: 'https://images.unsplash.com/photo-1505253758473-96b3015f240a?auto=format&fit=crop&w=800&q=80',
    features: ['6 Iconic Food Tasting Stops', 'Authentic Kongunadu Recipes', 'Morning & Evening Batches'],
    badge: 'Culinary Host',
    explore_query: 'Kongu Food Trails',
    is_active: true,
  },
  {
    id: 'host-7',
    business_name: 'Anamalai Foothill Riders',
    title: 'Aliyar Dam, Coconut Canal & Monkey Falls Bike Circuit',
    tagline: 'Breezy canal-side rides past endless coconut groves and pristine foothill cascades',
    region: 'Pollachi',
    category: 'bike',
    starting_rate: 190,
    rating: 4.89,
    reviews_count: 130,
    image_url: 'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
    features: ['Royal Enfield Himalayan 450', 'Scenic Coconut Canal Paths', 'Fresh Farm Coconut Stop'],
    badge: 'Rural Rider Host',
    explore_query: 'Anamalai Foothill Riders',
    is_active: true,
  },
  {
    id: 'host-8',
    business_name: 'Pollachi Countryside Mobility',
    title: 'Topslip Elephant Safari & Rural Village Farmland Tour',
    tagline: 'Local village chauffeurs guiding you through elephant camps and organic farm gates',
    region: 'Pollachi',
    category: 'car',
    starting_rate: 520,
    rating: 4.93,
    reviews_count: 164,
    image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    features: ['Air-Conditioned Countryside Sedan', 'Sethumadai Gate Early Token Help', 'Traditional Village Stop'],
    badge: 'Countryside Chauffeur',
    explore_query: 'Pollachi Countryside Mobility',
    is_active: true,
  },
  {
    id: 'host-9',
    business_name: 'Anamalai Heritage Expeditions',
    title: 'Thirumoorthy Hills, Ancient Rock Shrines & Dam Escapes',
    tagline: 'Complete family sightseeing covering scenic waterfalls, water sports, and tranquil temples',
    region: 'Pollachi',
    category: 'sightseeing_tour',
    starting_rate: 600,
    rating: 4.91,
    reviews_count: 98,
    image_url: 'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    features: ['Full Day Sightseeing Package', 'Amanalingeswarar Temple Visit', 'Panchalingam Falls Trek'],
    badge: 'Expedition Partner',
    explore_query: 'Anamalai Heritage Expeditions',
    is_active: true,
  },
]

export const DEFAULT_HOMEPAGE_FEATURED_SETTINGS: HomepageFeaturedSettings = {
  section_eyebrow: 'Explore by Region',
  section_title: 'Select an active region to view bundled tourist packages:',
  all_regions_badge: 'Multi-Region Marketplace',
  all_regions_title: 'Featured Hourly Trips Across Active Regions',
  all_regions_subtitle: 'Select an active region to view bundled tour packages curated with certified local rider hosts in their personal vehicles.',
  region_configs: {
    Coimbatore: {
      badge: 'Coimbatore Regional Bundles',
      title: 'Featured Hourly Trips in & around Coimbatore',
      subtitle: 'Explore temples, mountain ghats, sweet water cascades, and tea plateaus with verified local rider hosts on your schedule.',
    },
    Pollachi: {
      badge: 'Pollachi Regional Bundles',
      title: 'Featured Hourly Trips in & around Pollachi',
      subtitle: 'Tour cinema-famous coconut canal roads, Valparai 40 hairpin bends, Topslip elephant safari, and Aliyar dam with local vehicle owners.',
    },
    'Ooty & Nilgiris': {
      badge: 'Nilgiris Regional Bundles',
      title: 'Featured Hourly Trips in & around Ooty & Nilgiris',
      subtitle: 'Ascend into mist-covered Doddabetta peaks, Pykara waterfalls, and rolling tea estates with certified hill chauffeurs.',
    },
  },
  hosts: DEFAULT_SHOWCASE_HOSTS,
}
