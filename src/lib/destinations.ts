// Dynamic City, State, Category, and Spot Bundling Infrastructure

export interface CitySpot {
  id: string
  name: string
  category: string
  description: string
  image_url: string
  recommended_hours: string
  location_address?: string
  lat?: number
  lng?: number
  is_hidden_gem: boolean
  insider_tip?: string
}

export interface RegionalGuideCircuit {
  id: string
  title: string
  category: string
  tagline: string
  distance_km?: number
  ideal_duration: string
  best_time_of_day: string
  recommended_transport: string
  transport_type: 'bike' | 'car' | 'van'
  estimated_rate?: number
  key_attractions: string[]
  pro_tip: string
  image_url: string
}

export interface RegionalGuideDistance {
  destination: string
  distance: string
  drive_time: string
  ideal_hours: string
  best_transport: string
}

export interface RegionalGuideTip {
  title: string
  content: string
}

export interface RegionalGuideDining {
  name: string
  specialty: string
  area: string
}

export interface CityRegionalGuide {
  headline?: string
  overview?: string
  circuits: RegionalGuideCircuit[]
  distance_matrix: RegionalGuideDistance[]
  insider_tips: RegionalGuideTip[]
  dining_recommendations?: RegionalGuideDining[]
}

export interface CityDestination {
  id: string
  name: string
  state: string
  category: string // e.g. "Kongu Heritage & Western Ghats Gateway", "Hill Stations & Scenic Ghats"
  is_active: boolean // Admin toggle: true = launched / available to users & providers
  description: string
  image_url: string
  lat: number
  lng: number
  top_spots: CitySpot[]
  hidden_spots: CitySpot[]
  guide?: CityRegionalGuide
}

export interface StateGroup {
  id: string
  name: string
  is_active: boolean
}

export const DEFAULT_CITY_CATEGORIES = [
  'Kongu Heritage & Western Ghats Gateway',
  'Hill Stations & Scenic Tea Estates',
  'Temple Cities & Spiritual Circuits',
  'Coastal Beaches & Adventure Harbors',
  'Metropolitan Business & Tech Hubs',
  'Wildlife Sanctuaries & Nature Reserves',
]

export const DEFAULT_STATES: StateGroup[] = [
  { id: 'tamil-nadu', name: 'Tamil Nadu', is_active: true },
  { id: 'kerala', name: 'Kerala', is_active: true },
  { id: 'karnataka', name: 'Karnataka', is_active: true },
  { id: 'goa', name: 'Goa', is_active: true },
]

export function getActiveDestinations(): CityDestination[] {
  return DEFAULT_DESTINATIONS.filter((d) => d.is_active)
}

export const DEFAULT_DESTINATIONS: CityDestination[] = [
  {
    id: 'coimbatore',
    name: 'Coimbatore',
    state: 'Tamil Nadu',
    category: 'Kongu Heritage & Western Ghats Gateway',
    is_active: true, // Currently launched and live by default
    description:
      'The vibrant gateway to the Western Ghats known for 112-ft Adiyogi, Siruvani sweet water, centuries-old Chola temples, and scenic mountain roads.',
    image_url:
      'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=1200&q=80',
    lat: 11.0168,
    lng: 76.9558,
    top_spots: [
      {
        id: 'adiyogi',
        name: 'Isha Yoga & 112-ft Adiyogi Shiva Statue',
        category: 'Spiritual & Meditation',
        description:
          'Monumental 112-foot bust of Adiyogi Shiva in the Velliangiri foothills. Features 7:00 PM 3D laser Divya Darshanam sound show, Dhyanalinga, and Surya Kund dip.',
        image_url:
          'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '3 to 5 Hours',
        location_address: 'Isha Yoga Center, Velliangiri Foothills, Ishana Vihar, Coimbatore - 641114',
        lat: 10.9731,
        lng: 76.7404,
        is_hidden_gem: false,
        insider_tip: 'Park in Lot 2 for rapid exit after the 7 PM 3D laser show.',
      },
      {
        id: 'marudhamalai',
        name: 'Marudhamalai Murugan Hill Temple',
        category: 'Sacred Hill Shrine',
        description:
          'Ancient 12th-century hill temple dedicated to Lord Murugan, set amidst lush Western Ghats medicinal herbs and tranquil mountain breezes.',
        image_url:
          'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        location_address: 'Marudhamalai Temple Rd, Coimbatore - 641046',
        lat: 11.0468,
        lng: 76.8524,
        is_hidden_gem: false,
        insider_tip: 'Take the scenic ghat road drive early morning between 6:30 AM - 8:00 AM.',
      },
      {
        id: 'siruvani-falls',
        name: 'Siruvani Waterfalls & Dam',
        category: 'Nature & Sweet Water',
        description:
          'Home to the world’s second sweetest drinking water, nestled deep in dense reserve forests with refreshing cascade pools.',
        image_url:
          'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '4 to 6 Hours',
        location_address: 'Siruvani Foothills, Sadivayal Checkpost, Coimbatore',
        lat: 10.9632,
        lng: 76.6881,
        is_hidden_gem: false,
        insider_tip: 'Sadivayal checkpost pass counter closes at 3:30 PM. Plastic bottles prohibited.',
      },
      {
        id: 'perur-temple',
        name: 'Perur Pateeswarar Temple',
        category: 'Chola Stone Architecture',
        description:
          'Over 1500 years old, built by Karikala Chola with magnificent stone Kanaka Sabha pillars, detailed Nataraja carvings, and serene Noyyal river banks.',
        image_url:
          'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        location_address: 'Siruvani Main Rd, Perur, Coimbatore - 641010',
        lat: 10.9702,
        lng: 76.9205,
        is_hidden_gem: false,
        insider_tip: 'Inspect the Kanaka Sabha pillars for single-stone hollow chain links.',
      },
      {
        id: 'gedee-car-museum',
        name: 'Gedee Car Museum & RS Puram',
        category: 'Heritage & Lifestyle',
        description:
          'World-class vintage and rare automobile museum featuring over 100 historical cars, followed by authentic Annapoorna filter coffee in RS Puram.',
        image_url:
          'https://images.unsplash.com/photo-1503376780353-7e6692767b70?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '3 to 4 Hours',
        location_address: 'Avinashi Rd, Race Course, Coimbatore - 641018',
        lat: 11.0028,
        lng: 76.9744,
        is_hidden_gem: false,
        insider_tip: 'Pair the museum tour with a hot Ghee Roast Dosa at Annapoorna on DB Road.',
      },
    ],
    hidden_spots: [
      {
        id: 'kovai-kutralam',
        name: 'Kovai Kutralam Secluded Forest Falls',
        category: 'Hidden Waterfall Trek',
        description:
          'Undiscovered cascade deep in the Siruvani hill range surrounded by bamboo groves and wild orchids, away from urban crowds.',
        image_url:
          'https://images.unsplash.com/photo-1546587348-d12660c30c50?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '3 to 4 Hours',
        location_address: 'Siruvani Range, Chadivayal, Tamil Nadu 641114',
        lat: 10.9412,
        lng: 76.6975,
        is_hidden_gem: true,
        insider_tip: 'Forest department safari van operates from check-post; arrive by 10 AM.',
      },
      {
        id: 'velliangiri-bamboo-stream',
        name: 'Velliangiri Foothills Bamboo Stream',
        category: 'Secret Nature Trail',
        description:
          'Hidden crystal-clear boulder stream behind the Poondi temple path where pilgrims rest before the seven hills trek.',
        image_url:
          'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        location_address: 'Poondi Foothills, Velliangiri Hills, Coimbatore',
        lat: 10.992,
        lng: 76.711,
        is_hidden_gem: true,
        insider_tip: 'Untouched spot ideal for quiet meditation and cold stream dips.',
      },
      {
        id: 'sengupathi-falls',
        name: 'Sengupathi Waterfalls & Forest Gap',
        category: 'Wild Cascade',
        description:
          'A hidden natural waterfall right on the border ghats between Coimbatore and Palakkad pass, surrounded by wild elephant corridor greenery.',
        image_url:
          'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '3 to 4 Hours',
        location_address: 'Palakkad Gap Highway, Sengupathi Ghats, TN-KL Border',
        lat: 10.852,
        lng: 76.843,
        is_hidden_gem: true,
        insider_tip: 'Best visited during post-monsoon between August and December.',
      },
    ],
  },
  {
    id: 'pollachi',
    name: 'Pollachi',
    state: 'Tamil Nadu',
    category: 'Kongu Heritage & Western Ghats Gateway',
    is_active: true, // Currently launched and live
    description:
      'Lush emerald coconut groves, scenic river canals, Aliyar dam, and gateway to Topslip Tiger Reserve and Anamalai Hills.',
    image_url:
      'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=1200&q=80',
    lat: 10.658,
    lng: 77.009,
    top_spots: [
      {
        id: 'topslip',
        name: 'Topslip Elephant Camp & Wildlife Safari',
        category: 'Wildlife Sanctuary',
        description: 'Pristine rainforest safari and ethical elephant rehabilitation camp in Anamalai Tiger Reserve.',
        image_url: 'https://images.unsplash.com/photo-1557050543-4d5f4e07ef46?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '4 to 6 Hours',
        location_address: 'Topslip, Anamalai Tiger Reserve, Pollachi',
        is_hidden_gem: false,
        insider_tip: 'Morning entry permits between 7:00 AM - 10:00 AM offer the best wildlife sightings.',
      },
      {
        id: 'aliyar-dam',
        name: 'Aliyar Dam & Reservoir Gardens',
        category: 'Scenic Nature & Boating',
        description: 'Magnificent reservoir nestled at the base of the Anamalai mountains with manicured gardens and boat rides.',
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        location_address: 'Aliyar Dam, Valparai Main Road, Pollachi - 642101',
        is_hidden_gem: false,
        insider_tip: 'Walk across the top reservoir bund for breathtaking views of the mist-clad hill ranges.',
      },
      {
        id: 'monkey-falls',
        name: 'Monkey Falls & Ghat Foothills',
        category: 'Natural Cascade & Springs',
        description: 'Vibrant natural waterfall cascading down rocky slopes along the Valparai ghat road, famous for refreshing dips.',
        image_url: 'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        location_address: 'Valparai Ghat Road, Near Aliyar, Pollachi',
        is_hidden_gem: false,
        insider_tip: 'Wear good grip sandals; best water flow between 9:00 AM and 1:00 PM.',
      },
      {
        id: 'masani-amman',
        name: 'Masani Amman Sacred Temple',
        category: 'Heritage & Pilgrim Shrine',
        description: 'Legendary ancient temple dedicated to Goddess Masani Amman set beside the tranquil Aliyar river.',
        image_url: 'https://images.unsplash.com/photo-1609766857041-ed402ea8069a?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '1.5 to 2 Hours',
        location_address: 'Anaimalai, Pollachi - 642104',
        is_hidden_gem: false,
        insider_tip: 'Traditional grinding stone justice ritual (Neethi Kal) is a unique cultural practice.',
      },
      {
        id: 'valparai-hairpins',
        name: 'Valparai 40 Hairpins Safari Point',
        category: 'Scenic Mountain Drive',
        description: 'Exhilarating climb up 40 hairpin curves with breathtaking views of the reservoir basin and wild Nilgiri Tahr.',
        image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '4 to 6 Hours',
        location_address: 'Valparai Hill Road, Anamalai Hills',
        is_hidden_gem: false,
        insider_tip: 'Stop at the 9th hairpin bend for panoramic bird-eye views of Aliyar Dam.',
      },
    ],
    hidden_spots: [
      {
        id: 'aliyar-canal',
        name: 'Aliyar Contour Canal Aqueduct Walk',
        category: 'Offbeat Engineering Marvel',
        description: 'Dramatic concrete aqueduct carrying mountain stream water through hills with scenic valley views.',
        image_url: 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        is_hidden_gem: true,
        insider_tip: 'Quiet walking path through coconut farms with cool canal breezes.',
      },
      {
        id: 'coconut-canal-trail',
        name: 'Pollachi Coconut Canal Road Trail',
        category: 'Scenic Countryside Drive',
        description: 'Scenic country roads beneath swaying coconut palm canopies famous as South Indian cinema shooting backdrops.',
        image_url: 'https://images.unsplash.com/photo-1596176530529-78163a4f7af2?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        is_hidden_gem: true,
        insider_tip: 'Enjoy fresh tender coconuts harvested straight from farm gates along the trail.',
      },
      {
        id: 'sethumadai-forest',
        name: 'Sethumadai Teak Forest Drive & Stream',
        category: 'Secret Forest Canopy',
        description: 'Dense teak forest corridor leading to the base of the Anamalai hills with peaceful village streams.',
        image_url: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '2 to 3 Hours',
        is_hidden_gem: true,
        insider_tip: 'Quiet spot for birdwatching and photography away from tourist highways.',
      },
    ],
  },
  {
    id: 'valparai',
    name: 'Valparai',
    state: 'Tamil Nadu',
    category: 'Hill Stations & Scenic Tea Estates',
    is_active: false, // In Draft/Testing - admin can enable with 1 click
    description:
      'Scenic hill station perched at 3,500 ft with 40 hairpin bends, wild Nilgiri Tahr cliffs, and boundless emerald tea gardens.',
    image_url:
      'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
    lat: 10.326,
    lng: 76.955,
    top_spots: [
      {
        id: 'hairpins-40',
        name: '40 Hairpin Ghats & Sholayar Dam',
        category: 'Scenic Mountain Drive',
        description: 'Exhilarating 40 hairpin curve climb with breathtaking views of the Aliyar reservoir basin.',
        image_url: 'https://images.unsplash.com/photo-1469854523086-cc02fe5d8800?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '8 to 12 Hours',
        is_hidden_gem: false,
      },
    ],
    hidden_spots: [
      {
        id: 'chinna-kallar',
        name: 'Chinna Kallar Wettest Spot of South India',
        category: 'Secret Rainforest',
        description: 'Remote suspension bridge and misty waterfall known as the Cherrapunji of South India.',
        image_url: 'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '4 to 5 Hours',
        is_hidden_gem: true,
      },
    ],
  },
  {
    id: 'ooty',
    name: 'Ooty & Nilgiris',
    state: 'Tamil Nadu',
    category: 'Hill Stations & Scenic Tea Estates',
    is_active: false, // In Draft - admin can enable
    description:
      'The Queen of Hill Stations featuring UNESCO heritage mountain toy train, eucalyptus forests, and Pykara lake.',
    image_url:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    lat: 11.4102,
    lng: 76.695,
    top_spots: [
      {
        id: 'botanical-gardens',
        name: 'Government Botanical Gardens & Doddabetta',
        category: 'Nature & Views',
        description: 'Vast terraced botanical gardens and the highest vantage peak in the Nilgiri hills.',
        image_url: 'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '4 to 6 Hours',
        is_hidden_gem: false,
      },
    ],
    hidden_spots: [
      {
        id: 'avalanche-lake',
        name: 'Avalanche Lake & Emerald Valley',
        category: 'Secluded Lake',
        description: 'Protected forest lake surrounded by rhododendrons and magnolia blooms, accessible via forest safari.',
        image_url: 'https://images.unsplash.com/photo-1470770841072-f978cf4d019e?auto=format&fit=crop&w=800&q=80',
        recommended_hours: '4 to 6 Hours',
        is_hidden_gem: true,
      },
    ],
  },
]

