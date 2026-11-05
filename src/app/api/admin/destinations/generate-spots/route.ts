import { NextResponse } from 'next/server'
import { CitySpot, CityRegionalGuide, RegionalGuideCircuit, RegionalGuideDistance, RegionalGuideTip, RegionalGuideDining } from '@/lib/destinations'

export const dynamic = 'force-dynamic'

interface GenerateSpotsRequest {
  cityName: string
  lat: number
  lng: number
  state?: string
  category?: string
}

// Curated high-resolution tourist imagery mapped to categories
const CATEGORY_IMAGES: Record<string, string[]> = {
  viewpoint: [
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=800&q=80',
  ],
  waterfall: [
    'https://images.unsplash.com/photo-1432405972618-c60b0225b8f9?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1546548970-71785318a17b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1518457607834-6e8d80c183c5?auto=format&fit=crop&w=800&q=80',
  ],
  lake: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1439853941329-a99ce049f08c?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=800&q=80',
  ],
  temple: [
    'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1600100397608-f010e421e4a6?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1544717305-2782549b5136?auto=format&fit=crop&w=800&q=80',
  ],
  heritage: [
    'https://images.unsplash.com/photo-1590050752117-238cb0fb12b1?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1524492412937-b28074a5d7da?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1564507592333-c60657eea523?auto=format&fit=crop&w=800&q=80',
  ],
  forest: [
    'https://images.unsplash.com/photo-1448375240586-882707db888b?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1473448912268-2022ce9509d8?auto=format&fit=crop&w=800&q=80',
  ],
  plantation: [
    'https://images.unsplash.com/photo-1545652985-5edd365b12eb?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1596401057633-54a8fe8ef647?auto=format&fit=crop&w=800&q=80',
  ],
  beach: [
    'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    'https://images.unsplash.com/photo-1520250497591-112f2f40a3f4?auto=format&fit=crop&w=800&q=80',
  ],
}

function getRandomImage(categoryKey: string, fallbackIdx: number = 0): string {
  const list = CATEGORY_IMAGES[categoryKey] || CATEGORY_IMAGES.viewpoint
  return list[fallbackIdx % list.length]
}

// Deep Knowledge Base for Premier South Indian & Indian Destinations
const REGIONAL_KNOWLEDGE_BASE: Record<
  string,
  {
    category: string
    description: string
    cover_image: string
    top_spots: Array<{
      name: string
      category: string
      recommended_hours: string
      description: string
      image_category: string
      insider_tip?: string
    }>
    hidden_spots: Array<{
      name: string
      category: string
      recommended_hours: string
      description: string
      image_category: string
      insider_tip: string
    }>
  }
> = {
  ooty: {
    category: 'Hill Stations & Scenic Tea Estates',
    description:
      'The Queen of Hill Stations nestled in the blue Nilgiris, featuring mist-covered Doddabetta peaks, centuries-old colonial gardens, emerald lakes, and aroma-filled tea plantations.',
    cover_image:
      'https://images.unsplash.com/photo-1589308078059-be1415eab4c3?auto=format&fit=crop&w=1200&q=80',
    top_spots: [
      {
        name: 'Doddabetta Peak & Mountain Observatory',
        category: 'Panoramic Mountain Summit',
        recommended_hours: '2 to 3 Hours',
        description:
          'The highest summit in the Nilgiri Hills (2,637 m). Offers sweeping 360-degree vistas of the Western Ghats and Telescope House view across the Nilgiri plateau.',
        image_category: 'viewpoint',
        insider_tip: 'Reach by 9:00 AM before dense afternoon cloud banks roll across the telescope deck.',
      },
      {
        name: 'Ooty Botanical Gardens & Glass House',
        category: 'Colonial Botanical Heritage',
        recommended_hours: '2 to 3 Hours',
        description:
          'Sprawling 55-acre garden established in 1848, featuring thousands of exotic flora species, terraced lawns, and a 20-million-year-old fossilized tree trunk.',
        image_category: 'forest',
        insider_tip: 'Visit the Italian garden section early in the morning for quiet, bird-filled photo walks.',
      },
      {
        name: 'Pykara Lake & Cascading Waterfalls',
        category: 'Lake Boating & Waterfalls',
        recommended_hours: '3 to 4 Hours',
        description:
          'Pristine Toda sacred river cascading down stepped cliffs into a placid reservoir surrounded by pine-forested slopes. Features speedboating and peaceful boardwalks.',
        image_category: 'waterfall',
        insider_tip: 'Take the scenic wooden trail down to the lower Pykara falls for dramatic photography.',
      },
      {
        name: 'Government Rose Garden (Vijayanagaram)',
        category: 'Floral Horticulture',
        recommended_hours: '1.5 to 2 Hours',
        description:
          'One of the largest rose gardens in India terraced on the slopes of Elk Hill, cultivating over 20,000 distinct rose varieties in vivid hues.',
        image_category: 'plantation',
        insider_tip: 'Spectacular blooming views are best appreciated on the upper fifth terrace viewing pergola.',
      },
      {
        name: 'Nilgiri Mountain Railway (Toy Train Circuit)',
        category: 'UNESCO Heritage Railway',
        recommended_hours: '2 to 3 Hours',
        description:
          'Historic rack-and-pinion steam railway chugging through dramatic tunnels, stone viaducts, and sheer forested gorges between Ooty and Coonoor.',
        image_category: 'heritage',
        insider_tip: 'Sit on the right side when traveling down toward Coonoor for dramatic gorge scenery.',
      },
    ],
    hidden_spots: [
      {
        name: 'Silent Valley View & Pine Forest Pathway',
        category: 'Secret Forest Vista',
        recommended_hours: '1.5 to 2 Hours',
        description:
          'An off-beat hillside clearing tucked away past Old Pykara road where tourists rarely tread. Pine needle carpets and sweeping silence over deep valleys.',
        image_category: 'forest',
        insider_tip: 'Follow the unpaved forestry trail 400m past the pine gate for secluded sunset photography.',
      },
      {
        name: 'Cairn Hill Historic Walking Woods',
        category: 'Ancient Cypress Woods',
        recommended_hours: '1 to 2 Hours',
        description:
          'One of the oldest surviving cypress plantations in Ooty with a historic wooden watchtower overlooking tranquil Nilgiri mountain ridges.',
        image_category: 'viewpoint',
        insider_tip: 'Listen for Nilgiri laughingthrushes and crested serpent eagles near the watchtower tree canopy.',
      },
      {
        name: 'Avalanche Emerald Secret Viewpoint',
        category: 'Tranquil Mountain Lake',
        recommended_hours: '2 to 3 Hours',
        description:
          'A quiet scenic point over Emerald Lake far from city commercial crowds, bordered by silver oak trees and wild rhododendrons.',
        image_category: 'lake',
        insider_tip: 'The local village tea stall serves fresh piping hot Nilgiri cardamom brew alongside the viewpoint.',
      },
    ],
  },
  kodaikanal: {
    category: 'Hill Stations & Scenic Tea Estates',
    description:
      'The Princess of Hill Stations in the Palani Hills, renowned for its star-shaped central lake, mist-swirled pillar rocks, cascading forest waterfalls, and pine tree ridges.',
    cover_image:
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80',
    top_spots: [
      {
        name: 'Kodaikanal Star Lake & Promenade Walk',
        category: 'Scenic Lake & Boating',
        recommended_hours: '2 to 3 Hours',
        description:
          'Picturesque star-shaped artificial lake built in 1863 surrounded by weeping willows, rowboats, pedalboats, and a 5 km paved perimeter cycling path.',
        image_category: 'lake',
        insider_tip: 'Rent a bicycle at the East Gate for a brisk circuit around the misty water before 9:00 AM.',
      },
      {
        name: 'Pillar Rocks & Mist Gorge',
        category: 'Dramatic Cliff Formations',
        recommended_hours: '1.5 to 2 Hours',
        description:
          'Three towering granite vertical rock pillars rising 400 feet into the sky, frequently enveloped in cinematic swirling white clouds and deep gorge echoes.',
        image_category: 'viewpoint',
        insider_tip: 'Visit when winds clear the mist momentarily for breathtaking views into the deep abyss.',
      },
      {
        name: "Coaker's Walk Panoramic Rim Trail",
        category: 'Mountain Promenade',
        recommended_hours: '1 to 2 Hours',
        description:
          'Paved 1 km pedestrian path along steep mountain slopes offering birds-eye views of the plains, Dolphin’s Nose, and the valley of Pambar river.',
        image_category: 'viewpoint',
        insider_tip: 'Catch the rare Brocken Spectre phenomenon on misty winter mornings when your shadow is cast on clouds.',
      },
      {
        name: 'Silver Cascade Forest Waterfalls',
        category: 'Natural Mountain Cascade',
        recommended_hours: '1 Hour',
        description:
          'Spectacular 180-foot natural waterfall fed by Kodai lake overflow tumbling over rugged boulders directly beside the scenic ghat approach road.',
        image_category: 'waterfall',
        insider_tip: 'Stop here on the uphill climb for roadside roasted spiced sweet corn and photo stops.',
      },
    ],
    hidden_spots: [
      {
        name: "Vattakanal Dolphin's Nose & Echo Rock",
        category: 'Dramatic Edge of the World',
        recommended_hours: '2 to 3 Hours',
        description:
          'A flat rock protrusion jutting out over a 6,600-foot precipice nestled in the bohemian hamlet of Vattakanal. Surrounded by eucalyptus woods and cloud oceans.',
        image_category: 'viewpoint',
        insider_tip: 'Trek down carefully with sturdy footwear; early morning rewards you with silent valley clouds.',
      },
      {
        name: 'Guna Caves Shola Forest Roots',
        category: 'Primeval Shola Canopy',
        recommended_hours: '1.5 Hours',
        description:
          'Gnarled, twisting shola tree roots above cavernous rock clefts (Devil’s Kitchen), set in a dramatic dense forest canopy shrouded in year-round fog.',
        image_category: 'forest',
        insider_tip: 'Admire the architectural wooden canopy walkway installed for forest floor preservation.',
      },
      {
        name: 'Mannavanur Eco-Lake & Sheep Farm',
        category: 'Rolling Grassland Plateau',
        recommended_hours: '3 Hours',
        description:
          'Peaceful agrarian valley 30 km from town featuring tranquil coracle rides on a pristine lake, rolling sheep pastures, and pine woodland borders.',
        image_category: 'lake',
        insider_tip: 'The drive through the terraced garlic farming villages is equally breathtaking.',
      },
    ],
  },
  pollachi: {
    category: 'Kongu Heritage & Western Ghats Gateway',
    description:
      'Lush agrarian coconut capital of Tamil Nadu at the base of the Anamalai Hills, known for Topslip wildlife sanctuary, Aliyar dam, and historic cinema landscapes.',
    cover_image:
      'https://images.unsplash.com/photo-1545652985-5edd365b12eb?auto=format&fit=crop&w=1200&q=80',
    top_spots: [
      {
        name: 'Aliyar Dam Reservoir & Foothill Gardens',
        category: 'Reservoir & Landscaped Parks',
        recommended_hours: '2 to 3 Hours',
        description:
          'Scenic reservoir located at the foot of Valparai hills featuring sprawling landscaped gardens, boating, children’s play area, and mountain backdrops.',
        image_category: 'lake',
        insider_tip: 'Sunset views over the mountain backdrop from the dam crest are magnificent.',
      },
      {
        name: 'Topslip & Anamalai Tiger Reserve Core',
        category: 'Wildlife Sanctuary & Safari',
        recommended_hours: '4 to 5 Hours',
        description:
          'Elephant camp, dense teak forests, and bamboo thickets home to leopards, gaurs, and lion-tailed macaques. Offers forest department van safaris.',
        image_category: 'forest',
        insider_tip: 'Report to Sethumadai forest check post before 7:00 AM to register for morning safari batches.',
      },
      {
        name: 'Masani Amman Temple (Anaimalai)',
        category: 'Spiritual Heritage Shrine',
        recommended_hours: '1.5 to 2 Hours',
        description:
          'Venerable Shakti pilgrimage site featuring a unique 17-foot reclining clay idol of Goddess Masani Amman on the banks of Aliyar river.',
        image_category: 'temple',
        insider_tip: 'Tuesdays and Fridays draw devoted pilgrims; morning visits allow calmer darshan.',
      },
    ],
    hidden_spots: [
      {
        name: 'Thirumoorthy Hills & Amanalingeswarar Temple',
        category: 'Sacred Waterfalls & Hills',
        recommended_hours: '2.5 to 3 Hours',
        description:
          'Picturesque foothills where a perennial waterfall (Panchalingam) tumbles over granite cliffs beside an ancient rock-cut temple dedicated to the Holy Trinity.',
        image_category: 'waterfall',
        insider_tip: 'A brisk 2 km trek uphill through shady rocks leads to the refreshing natural waterfall pool.',
      },
      {
        name: 'Ambrampalayam Riverfront Coconut Groves',
        category: 'Rural Countryside Haven',
        recommended_hours: '1 to 2 Hours',
        description:
          'Quiet rural riverbanks lined with swaying coconut palms where classic Tamil village films are shot. Serene water flows and rural serenity.',
        image_category: 'plantation',
        insider_tip: 'Great spot to savor fresh tender coconut directly from local farmers at nominal cost.',
      },
    ],
  },
  valparai: {
    category: 'Hill Stations & Scenic Tea Estates',
    description:
      'Untouched hill paradise in the Anamalai range situated 3,500 feet above sea level, accessed via 40 hair-raising hairpin bends with regular wildlife sightings and sprawling tea carpets.',
    cover_image:
      'https://images.unsplash.com/photo-1545652985-5edd365b12eb?auto=format&fit=crop&w=1200&q=80',
    top_spots: [
      {
        name: 'Loam’s Viewpoint (Hairpin Bend #9)',
        category: 'Panoramic Ghat Vista',
        recommended_hours: '1 Hour',
        description:
          'Famous vantage point situated at the 9th hairpin bend on Pollachi-Valparai ghat road, presenting bird-eye views of Aliyar reservoir and the valley.',
        image_category: 'viewpoint',
        insider_tip: 'Look out for endangered Nilgiri Tahr mountain goats grazing on the rocky cliff faces.',
      },
      {
        name: 'Sholayar Dam (Upper & Lower Cascades)',
        category: 'Engineering & Reservoir Marvel',
        recommended_hours: '2 to 3 Hours',
        description:
          'One of the deepest and largest reservoirs in Asia surrounded by dense evergreen rainforests, tea gardens, and mist-covered mountain silhouettes.',
        image_category: 'lake',
        insider_tip: 'Drive across the dam spillway bridge during monsoons for thunderous water spray.',
      },
      {
        name: 'Koolangal River & Crystal Pebble Stream',
        category: 'Natural Forest Stream',
        recommended_hours: '2 Hours',
        description:
          'Gentle shallow river with smooth colorful pebbles flowing through emerald tea estates. Safe for wading in pure mountain stream water.',
        image_category: 'waterfall',
        insider_tip: 'Clean and calm early in the day; respect eco-zone rules and do not litter plastics.',
      },
    ],
    hidden_spots: [
      {
        name: 'Nallamudi Viewpoint & Tea Valley Abyss',
        category: 'Secret Precipice & Waterfalls',
        recommended_hours: '2 Hours',
        description:
          'Walk 1 km through private tea plantations to a secluded cliff edge that peers into deep Kerala forest gorges with distant wild waterfalls.',
        image_category: 'viewpoint',
        insider_tip: 'Frequent spot for wild elephant herds grazing in the distant valley below; bring binoculars.',
      },
      {
        name: 'Karamalai Annai Velankanni Shrine',
        category: 'Quiet Hilltop Sanctuary',
        recommended_hours: '1.5 Hours',
        description:
          'Tranquil church built on a tea-clad hillock beside a babbling river spring. Peace and solitude enveloped by rolling green carpet ridges.',
        image_category: 'heritage',
        insider_tip: 'The peaceful walking trail through the tea factory is exceptionally photogenic.',
      },
    ],
  },
  munnar: {
    category: 'Hill Stations & Scenic Tea Estates',
    description:
      'Kerala’s iconic high-altitude haven situated at the confluence of three mountain streams, famous for undulating tea plantations, Anamudi peak, and endangered Nilgiri Tahr.',
    cover_image:
      'https://images.unsplash.com/photo-1545652985-5edd365b12eb?auto=format&fit=crop&w=1200&q=80',
    top_spots: [
      {
        name: 'Eravikulam National Park (Rajamalai)',
        category: 'Wildlife Sanctuary & Peak',
        recommended_hours: '3 to 4 Hours',
        description:
          'Home to the highest peak in South India (Anamudi) and the largest surviving population of Nilgiri Tahr. Rolling montane shola grasslands.',
        image_category: 'forest',
        insider_tip: 'Pre-book online tickets to skip long queues at the park boarding point in Old Munnar.',
      },
      {
        name: 'Mattupetty Dam & Eco-Point Boating',
        category: 'Hydro Reservoir & Echo Basin',
        recommended_hours: '2 to 3 Hours',
        description:
          'Storage concrete gravity dam with serene speedboating, surrounded by tea plantations and dense forests where wild elephants drink at dawn.',
        image_category: 'lake',
        insider_tip: 'Test your natural acoustic echo across the forested bay at Eco Point.',
      },
      {
        name: 'Tata Tea Museum & Heritage Factory',
        category: 'Tea History & Processing Walk',
        recommended_hours: '1.5 to 2 Hours',
        description:
          'Demonstrates the transformation of fresh two leaves and a bud into aromatic tea powder, featuring colonial machinery from 1905.',
        image_category: 'plantation',
        insider_tip: 'Join the tea tasting session to sample freshly made white and orthodox varieties.',
      },
    ],
    hidden_spots: [
      {
        name: 'Kolukkumalai Sunrise & Highest Tea Estate',
        category: 'Highest Organic Tea Plantation',
        recommended_hours: '4 to 5 Hours',
        description:
          'Perched at 7,900 feet, accessible only by 4x4 rugged jeep, offering the most dramatic sunrise above floating ocean-like cloud formations.',
        image_category: 'viewpoint',
        insider_tip: 'Start at 4:30 AM in a 4WD jeep for the sunrise show above the clouds.',
      },
      {
        name: 'Chinnakanal Secret Waterfall Cascades',
        category: 'Untouched Mountain Waters',
        recommended_hours: '1.5 Hours',
        description:
          'Also known as Power House Waterfalls, cascading over steep rocky slopes surrounded by deep valleys and wild tea shrubs.',
        image_category: 'waterfall',
        insider_tip: 'Spectacular water volume during post-monsoon months between August and January.',
      },
    ],
  },
  wayanad: {
    category: 'Wildlife Sanctuaries & Nature Reserves',
    description:
      'Misty highland district in Kerala with prehistoric rock engravings, sprawling coffee and cardamom plantations, waterfalls, and tranquil bamboo river islands.',
    cover_image:
      'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=1200&q=80',
    top_spots: [
      {
        name: 'Banasura Sagar Earth Dam',
        category: 'Largest Earth Dam in India',
        recommended_hours: '2 to 3 Hours',
        description:
          'Massive earthen dam across Karamanathodu river holding back crystal blue water with picturesque floating islands against Banasura Peak.',
        image_category: 'lake',
        insider_tip: 'Try the thrilling speedboat ride that weaves between the forested submerged hillocks.',
      },
      {
        name: 'Edakkal Caves & Neolithic Stone Carvings',
        category: 'Prehistoric Archaeology',
        recommended_hours: '2.5 to 3 Hours',
        description:
          'Split-rock cavern perched on Ambukuthi Mala showcasing petroglyphs and human pictographs dating back over 6,000 years to the Stone Age.',
        image_category: 'heritage',
        insider_tip: 'Steep climb of ~300 steps through coffee shops; carry drinking water.',
      },
      {
        name: 'Soochipara (Sentinel Rock) Waterfalls',
        category: 'Three-Tier Forest Waterfall',
        recommended_hours: '3 Hours',
        description:
          'Spectacular three-tiered waterfall cascading down 200 meters into a large natural pool surrounded by dense deciduous and evergreen forests.',
        image_category: 'waterfall',
        insider_tip: 'The 15-minute downhill forest walk through tea gardens is delightfully breezy.',
      },
    ],
    hidden_spots: [
      {
        name: 'Kuruva Island Bamboo River Crossing',
        category: 'Protected River Archipelago',
        recommended_hours: '2.5 Hours',
        description:
          'Cluster of 950 acres of uninhabited delta islands on Kabini river navigated by eco-friendly bamboo rafts and rope bridges.',
        image_category: 'forest',
        insider_tip: 'Closed during monsoon high-tide; permits required at forest counter.',
      },
      {
        name: 'Karlad Lake Bamboo Zip-Line Point',
        category: 'Tranquil Adventure Lake',
        recommended_hours: '2 Hours',
        description:
          'Quiet inland lake surrounded by nature trails, kayaking, and a scenic aerial zip line across the water mirror.',
        image_category: 'lake',
        insider_tip: 'Ideal for travelers looking for peaceful kayaking without tourist crowds.',
      },
    ],
  },
  madurai: {
    category: 'Temple Cities & Spiritual Circuits',
    description:
      'The ancient cultural capital of Tamil Nadu on the banks of the Vaigai, world-famous for the grand Meenakshi Amman Temple, Thirumalai Nayakkar Palace, and jigarthanda street food.',
    cover_image:
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    top_spots: [
      {
        name: 'Arulmigu Meenakshi Sundareswarar Temple',
        category: 'Dravidian Temple Masterpiece',
        recommended_hours: '3 to 4 Hours',
        description:
          'Historic landmark featuring 14 towering gopurams encrusted with thousands of mythological stucco sculptures, Hall of Thousand Pillars, and Golden Lotus tank.',
        image_category: 'temple',
        insider_tip: 'Attend the 9:00 PM Palliarai procession when Lord Sundareswarar is ceremoniously carried to Goddess Meenakshi’s sanctum.',
      },
      {
        name: 'Thirumalai Nayakkar Mahal & Light Show',
        category: 'Indo-Saracenic Palace',
        recommended_hours: '1.5 to 2 Hours',
        description:
          '17th-century palace built by King Thirumalai Nayak, renowned for massive 82-foot circular pillars, stucco archways, and evening sound-and-light history shows.',
        image_category: 'heritage',
        insider_tip: 'The massive courtyard pillars remain cool even in the peak of South Indian summer heat.',
      },
      {
        name: 'Gandhi Memorial Museum & Freedom Archive',
        category: 'Historic Archive & Heritage',
        recommended_hours: '1.5 Hours',
        description:
          'Housed in the 17th-century palace of Rani Mangammal, exhibiting Mahatma Gandhi’s historic blood-stained dhoti and India’s freedom movement records.',
        image_category: 'heritage',
        insider_tip: 'Peaceful garden grounds and well-curated visual timelines of independence.',
      },
    ],
    hidden_spots: [
      {
        name: 'Thirupparankundram Rock-Cut Shrine',
        category: 'Ancient Hill Cave Temple',
        recommended_hours: '2 Hours',
        description:
          'The first of the six sacred abodes of Murugan, carved out of a massive monolithic granite hill with 8th-century rock carvings and temple elephant blessings.',
        image_category: 'temple',
        insider_tip: 'Climb the gentle rock surface on the south side for panoramic city views at twilight.',
      },
      {
        name: 'Vandiyur Mariamman Teppakulam Water Pavillion',
        category: 'Historic Water Tank',
        recommended_hours: '1 Hour',
        description:
          'Enormous square tank with a picturesque Mandapam in the middle adorned with flowering trees, famous for the grand Float Festival.',
        image_category: 'lake',
        insider_tip: 'Visit in the evening when the illuminated central pavilion reflects across the calm water.',
      },
    ],
  },
}

// Algorithmic spot synthesizer for any city name and coordinate
function synthesizeGenericSpots(
  cityName: string,
  state: string = 'Tamil Nadu',
  category: string = 'Tourism Circuit',
  lat: number,
  lng: number
): {
  top_spots: CitySpot[]
  hidden_spots: CitySpot[]
  suggested_description: string
  suggested_image_url: string
  suggested_category: string
  guide?: CityRegionalGuide
} {
  const cleanCity = cityName.trim()
  const slug = cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '-')

  const isHillStation =
    /ooty|kodai|munnar|wayanad|valparai|coorg|chikmagalur|shimla|manali|darjeeling|yercaud|hills|ghats/i.test(
      cleanCity + ' ' + category
    )
  const isCoastal = /goa|beach|port|kochi|chennai|pondicherry|puri|mumbai|vizag|mangalore|gokarna/i.test(
    cleanCity + ' ' + category
  )
  const isTemple = /temple|madurai|thanjavur|tirupati|varanasi|puri|rameshwaram|shrine|heritage/i.test(
    cleanCity + ' ' + category
  )

  let topSpots: CitySpot[] = []
  let hiddenSpots: CitySpot[] = []
  let suggestedDesc = `${cleanCity} is a premier travel destination in ${state}, offering rich cultural landmarks, captivating scenic landscapes, authentic local cuisine, and memorable hourly discovery trails.`
  let coverImg = CATEGORY_IMAGES.viewpoint[0]
  let suggestedCat = category || 'Kongu Heritage & Western Ghats Gateway'

  if (isHillStation) {
    suggestedCat = 'Hill Stations & Scenic Tea Estates'
    coverImg =
      'https://images.unsplash.com/photo-1545652985-5edd365b12eb?auto=format&fit=crop&w=1200&q=80'
    suggestedDesc = `Escape into the misty mountain ridges of ${cleanCity}, ${state}. Renowned for panoramic valley viewpoints, cascading forest waterfalls, aromatic plantations, and tranquil cool climate.`

    topSpots = [
      {
        id: `spot-${slug}-1`,
        name: `${cleanCity} Peak & Mountain Vista Point`,
        category: 'Panoramic Mountain Summit',
        recommended_hours: '2 to 3 Hours',
        description: `Highest viewpoint in ${cleanCity} offering expansive 360-degree vistas across lush valleys, tea estates, and cloud-covered Western Ghats ridges.`,
        image_url: getRandomImage('viewpoint', 0),
        is_hidden_gem: false,
        lat: Number((lat + 0.015).toFixed(4)),
        lng: Number((lng + 0.012).toFixed(4)),
        insider_tip: 'Reach by 8:30 AM before dense mountain mist covers the valley floor.',
      },
      {
        id: `spot-${slug}-2`,
        name: `${cleanCity} Natural Waterfalls & Stream`,
        category: 'Forest Waterfalls & Cascades',
        recommended_hours: '2 to 3 Hours',
        description: `Perennial forest waterfall cascading over smooth granite rocks into a refreshing crystal-clear natural pool surrounded by dense forest canopy.`,
        image_url: getRandomImage('waterfall', 1),
        is_hidden_gem: false,
        lat: Number((lat - 0.02).toFixed(4)),
        lng: Number((lng + 0.018).toFixed(4)),
        insider_tip: 'Wear water-friendly footwear with good grip for the short stone path.',
      },
      {
        id: `spot-${slug}-3`,
        name: `${cleanCity} Lake & Botanical Promenade`,
        category: 'Scenic Lake & Boating',
        recommended_hours: '2 Hours',
        description: `Placid lake nestled among pine hills featuring paddle boats, perimeter walking pathways, and vibrant seasonal mountain flowers.`,
        image_url: getRandomImage('lake', 2),
        is_hidden_gem: false,
        lat: Number((lat + 0.005).toFixed(4)),
        lng: Number((lng - 0.01).toFixed(4)),
        insider_tip: 'Sunset boat rides offer postcard-perfect reflections of the surrounding hills.',
      },
      {
        id: `spot-${slug}-4`,
        name: `${cleanCity} Heritage Tea & Spice Plantation`,
        category: 'Estate Walk & Tasting',
        recommended_hours: '1.5 to 2 Hours',
        description: `Expansive terraced estate where tourists can walk through manicured tea gardens, observe artisan processing, and taste freshly brewed single-estate tea.`,
        image_url: getRandomImage('plantation', 0),
        is_hidden_gem: false,
        lat: Number((lat - 0.012).toFixed(4)),
        lng: Number((lng - 0.015).toFixed(4)),
        insider_tip: 'The estate factory shop sells pure unblended orthodox tea at direct factory prices.',
      },
    ]

    hiddenSpots = [
      {
        id: `hidden-${slug}-1`,
        name: `Silent Shola Valley & Pine Forest Trail`,
        category: 'Secret Forest Walk',
        recommended_hours: '1.5 to 2 Hours',
        description: `Secluded forestry pathway enveloped in aromatic pine trees, morning dew, and gentle hill breezes completely away from mainstream tourist crowds.`,
        image_url: getRandomImage('forest', 0),
        is_hidden_gem: true,
        lat: Number((lat + 0.03).toFixed(4)),
        lng: Number((lng - 0.025).toFixed(4)),
        insider_tip: 'Follow the unpaved trail for 300 meters to reach an untouched scenic rock ledge.',
      },
      {
        id: `hidden-${slug}-2`,
        name: `Off-Beat Sunset Rock Ridge`,
        category: 'Secluded Golden Hour Point',
        recommended_hours: '1 to 2 Hours',
        description: `A quiet natural rock ledge favored by local villagers for dramatic golden sunset glows, sweeping views of distant plains, and calm bird calls.`,
        image_url: getRandomImage('viewpoint', 3),
        is_hidden_gem: true,
        lat: Number((lat - 0.025).toFixed(4)),
        lng: Number((lng - 0.03).toFixed(4)),
        insider_tip: 'Bring a warm jacket as temperature drops rapidly once the sun sets.',
      },
      {
        id: `hidden-${slug}-3`,
        name: `Secret Cascading Brook & Rock Pools`,
        category: 'Hidden Natural Springs',
        recommended_hours: '1.5 Hours',
        description: `Hidden mountain brook fed by medicinal Western Ghats rain springs with secluded shallow pools ideal for dipping feet and quiet meditation.`,
        image_url: getRandomImage('waterfall', 2),
        is_hidden_gem: true,
        lat: Number((lat + 0.022).toFixed(4)),
        lng: Number((lng + 0.028).toFixed(4)),
        insider_tip: 'Respect the fragile eco-sensitive environment and avoid leaving any plastic.',
      },
    ]
  } else if (isCoastal) {
    suggestedCat = 'Coastal Beaches & Adventure Harbors'
    coverImg =
      'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1200&q=80'
    suggestedDesc = `Experience the coastal charm of ${cleanCity}, ${state}. Golden sandy shores, palm-lined promenades, coastal heritage forts, and fresh local seafood.`

    topSpots = [
      {
        id: `spot-${slug}-1`,
        name: `${cleanCity} Golden Beach & Promenade`,
        category: 'Beach & Marine Drive',
        recommended_hours: '2 to 3 Hours',
        description: `Iconic expansive shoreline with swaying palms, gentle surf waves, sunset horse rides, and evening ocean breezes.`,
        image_url: getRandomImage('beach', 0),
        is_hidden_gem: false,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        insider_tip: 'Early morning sunrise walks are breezy and quiet before crowds arrive.',
      },
      {
        id: `spot-${slug}-2`,
        name: `Historic Sea Fort & Lighthouse Viewpoint`,
        category: 'Coastal Heritage & Fortress',
        recommended_hours: '1.5 to 2 Hours',
        description: `Centuries-old stone fortress overlooking the azure waters, providing 360-degree views of fishing boats and the open horizon.`,
        image_url: getRandomImage('heritage', 1),
        is_hidden_gem: false,
        lat: Number((lat + 0.01).toFixed(4)),
        lng: Number((lng + 0.008).toFixed(4)),
        insider_tip: 'Climb the spiral lighthouse stairs for spectacular coastal panoramas.',
      },
      {
        id: `spot-${slug}-3`,
        name: `Backwater Estuary & Mangrove Boat Safari`,
        category: 'Eco Mangroves & Lagoon',
        recommended_hours: '2 to 3 Hours',
        description: `Serene coastal backwater lagoon where sweet river waters meet the ocean, home to kingfishers, migratory birds, and quiet boat tours.`,
        image_url: getRandomImage('lake', 1),
        is_hidden_gem: false,
        lat: Number((lat - 0.015).toFixed(4)),
        lng: Number((lng - 0.01).toFixed(4)),
        insider_tip: 'Opt for non-motorized canoe rowing to observe kingfishers without startling them.',
      },
    ]

    hiddenSpots = [
      {
        id: `hidden-${slug}-1`,
        name: `Secret Cove & Cliff Edge Lookout`,
        category: 'Off-beat Secluded Bay',
        recommended_hours: '1.5 Hours',
        description: `Secluded bay framed by black volcanic rocks where tourists rarely visit. Turquoise water pools and crashing ocean surf.`,
        image_url: getRandomImage('beach', 1),
        is_hidden_gem: true,
        lat: Number((lat + 0.02).toFixed(4)),
        lng: Number((lng + 0.015).toFixed(4)),
        insider_tip: 'Trek down the rocky incline with care; ideal spot for tranquil sunset moments.',
      },
      {
        id: `hidden-${slug}-2`,
        name: `Fishermen’s Wharf & Heritage Seafood Quarter`,
        category: 'Living Heritage & Food Trail',
        recommended_hours: '1.5 Hours',
        description: `Authentic coastal village quarter with brightly painted catamarans, drying nets, and small shacks serving fresh pan-seared catch of the day.`,
        image_url: getRandomImage('heritage', 2),
        is_hidden_gem: true,
        lat: Number((lat - 0.01).toFixed(4)),
        lng: Number((lng + 0.005).toFixed(4)),
        insider_tip: 'Visit when daily trawlers return around 4:30 PM for fresh coastal sights.',
      },
    ]
  } else if (isTemple) {
    suggestedCat = 'Temple Cities & Spiritual Circuits'
    coverImg =
      'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80'
    suggestedDesc = `Discover the ancient architectural wonders and spiritual energy of ${cleanCity}, ${state}. Centuries-old stone temples, sacred tanks, vibrant cultural festivals, and rich craftsmanship.`

    topSpots = [
      {
        id: `spot-${slug}-1`,
        name: `${cleanCity} Grand Heritage Temple`,
        category: 'Sacred Dravidian Architecture',
        recommended_hours: '2 to 3 Hours',
        description: `Magnificent ancient temple complex featuring towering gopurams, intricate monolithic stone carvings, sacred tanks, and serene sanctums.`,
        image_url: getRandomImage('temple', 0),
        is_hidden_gem: false,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        insider_tip: 'Traditional modest attire required; morning darshan between 6:30 AM - 8:30 AM is most peaceful.',
      },
      {
        id: `spot-${slug}-2`,
        name: `Historic Palace & Royal Mandapam`,
        category: 'Royal Architecture & Museum',
        recommended_hours: '1.5 to 2 Hours',
        description: `Historic palace complex showcasing regal stucco arches, towering columns, courtyards, and exhibits documenting the royal lineage.`,
        image_url: getRandomImage('heritage', 0),
        is_hidden_gem: false,
        lat: Number((lat + 0.008).toFixed(4)),
        lng: Number((lng + 0.006).toFixed(4)),
        insider_tip: 'The light and sound show in the grand courtyard is an evening highlight.',
      },
      {
        id: `spot-${slug}-3`,
        name: `Sacred Temple Tank (Teppakulam) Promenade`,
        category: 'Water Heritage & Sanctum',
        recommended_hours: '1 Hour',
        description: `Grand centuries-old stone-stepped water reservoir with an island pavilion at the center, surrounded by temple street bazaars.`,
        image_url: getRandomImage('lake', 0),
        is_hidden_gem: false,
        lat: Number((lat - 0.01).toFixed(4)),
        lng: Number((lng - 0.008).toFixed(4)),
        insider_tip: 'Great spot to sample traditional hot ghee sweets and filter coffee.',
      },
    ]

    hiddenSpots = [
      {
        id: `hidden-${slug}-1`,
        name: `Ancient Rock-Cut Cave Inscriptions`,
        category: 'Prehistoric Rock Shrine',
        recommended_hours: '1.5 Hours',
        description: `Quiet rock-cut caves carved into granite foothills centuries ago, with ancient Brahmi stone scripts and tranquil shaded breezes.`,
        image_url: getRandomImage('temple', 1),
        is_hidden_gem: true,
        lat: Number((lat + 0.018).toFixed(4)),
        lng: Number((lng - 0.015).toFixed(4)),
        insider_tip: 'Carry a torch to observe the fine chisel marks on the interior cave pillars.',
      },
      {
        id: `hidden-${slug}-2`,
        name: `Traditional Master Artisan Handloom Lane`,
        category: 'Heritage Craft & Weaving',
        recommended_hours: '1.5 Hours',
        description: `Hidden alleyway where third-generation master weavers work wooden handlooms, creating intricate silk and cotton textiles.`,
        image_url: getRandomImage('heritage', 1),
        is_hidden_gem: true,
        lat: Number((lat - 0.012).toFixed(4)),
        lng: Number((lng + 0.01).toFixed(4)),
        insider_tip: 'Buy authentic handwoven fabrics directly from the artisan guilds with zero middlemen markups.',
      },
    ]
  } else {
    // General Gateway / Regional Hub
    topSpots = [
      {
        id: `spot-${slug}-1`,
        name: `${cleanCity} Central Heritage Landmark`,
        category: 'Historical Heritage',
        recommended_hours: '2 Hours',
        description: `Renowned historical landmark capturing the rich legacy, architectural prowess, and cultural evolution of ${cleanCity}.`,
        image_url: getRandomImage('heritage', 0),
        is_hidden_gem: false,
        lat: Number(lat.toFixed(4)),
        lng: Number(lng.toFixed(4)),
        insider_tip: 'Guides are available at the entrance; morning visits avoid midday heat.',
      },
      {
        id: `spot-${slug}-2`,
        name: `${cleanCity} Scenic Nature Park & Lake`,
        category: 'Nature Sanctuary & Park',
        recommended_hours: '2 Hours',
        description: `Sprawling green oasis featuring tranquil lake waters, walking tracks, native botanical trees, and recreational activities.`,
        image_url: getRandomImage('lake', 1),
        is_hidden_gem: false,
        lat: Number((lat + 0.012).toFixed(4)),
        lng: Number((lng + 0.01).toFixed(4)),
        insider_tip: 'Ideal for leisurely morning photography and bird-watching.',
      },
      {
        id: `spot-${slug}-3`,
        name: `${cleanCity} Regional Arts & Crafts Bazaar`,
        category: 'Cultural Street Bazaar',
        recommended_hours: '1.5 to 2 Hours',
        description: `Vibrant shopping street packed with authentic local handicrafts, aromatic spices, textiles, and street delicacies.`,
        image_url: getRandomImage('heritage', 2),
        is_hidden_gem: false,
        lat: Number((lat - 0.008).toFixed(4)),
        lng: Number((lng - 0.007).toFixed(4)),
        insider_tip: 'Don’t miss out on trying the local culinary specialties and filter coffee.',
      },
    ]

    hiddenSpots = [
      {
        id: `hidden-${slug}-1`,
        name: `Quiet Riverfront Sunset Steps`,
        category: 'Peaceful Water Promenade',
        recommended_hours: '1 to 1.5 Hours',
        description: `A tranquil stone-stepped ghat away from traffic sounds where locals relax during sunset to observe calm water reflections.`,
        image_url: getRandomImage('viewpoint', 1),
        is_hidden_gem: true,
        lat: Number((lat + 0.018).toFixed(4)),
        lng: Number((lng - 0.012).toFixed(4)),
        insider_tip: 'Peaceful atmosphere between 5:30 PM - 6:30 PM.',
      },
      {
        id: `hidden-${slug}-2`,
        name: `Heritage Old Quarter Secret Walk`,
        category: 'Old City Architecture',
        recommended_hours: '1.5 Hours',
        description: `Walk through quiet historic lanes lined with vintage wooden houses, ornate carved doorways, and nostalgic charm.`,
        image_url: getRandomImage('heritage', 0),
        is_hidden_gem: true,
        lat: Number((lat - 0.015).toFixed(4)),
        lng: Number((lng + 0.014).toFixed(4)),
        insider_tip: 'Best explored on foot or bicycle early in the morning.',
      },
    ]
  }

  const guide = buildRegionalGuide(cleanCity, state, category, topSpots, hiddenSpots)

  return {
    top_spots: topSpots,
    hidden_spots: hiddenSpots,
    suggested_description: suggestedDesc,
    suggested_image_url: coverImg,
    suggested_category: suggestedCat,
    guide,
  }
}

// Synthesizer for rich Regional Travel Guides (Circuits, Distance Matrix, Insider Tips)
function buildRegionalGuide(
  cityName: string,
  state: string = 'Tamil Nadu',
  category: string = 'Tourism Circuit',
  topSpots: CitySpot[],
  hiddenSpots: CitySpot[]
): CityRegionalGuide {
  const cleanCity = cityName.trim()
  const slug = cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '-')

  const spotNames = topSpots.map((s) => s.name).filter(Boolean)
  const hiddenNames = hiddenSpots.map((s) => s.name).filter(Boolean)

  const isHillStation =
    /ooty|kodai|munnar|wayanad|valparai|coorg|chikmagalur|shimla|manali|darjeeling|yercaud|hills|ghats/i.test(
      cleanCity + ' ' + category
    )
  const isCoastal = /goa|beach|port|kochi|chennai|pondicherry|puri|mumbai|vizag|mangalore|gokarna/i.test(
    cleanCity + ' ' + category
  )
  const isTemple = /temple|madurai|thanjavur|tirupati|varanasi|puri|rameshwaram|shrine|heritage/i.test(
    cleanCity + ' ' + category
  )

  let circuits: RegionalGuideCircuit[] = []
  let distanceMatrix: RegionalGuideDistance[] = []
  let insiderTips: RegionalGuideTip[] = []
  let dining: RegionalGuideDining[] = []

  if (isHillStation) {
    circuits = [
      {
        id: `circuit-${slug}-1`,
        title: `${cleanCity} Peak Panorama & Pine Valley Walk`,
        category: 'Panoramic Summit & Tea Walk',
        tagline: 'High-altitude viewpoints, crisp pine air, and aroma-filled tea garden strolls',
        distance_km: 22,
        ideal_duration: '3 to 4 Hours',
        best_time_of_day: '8:30 AM – 12:30 PM (Morning Clear Skies)',
        recommended_transport: 'Royal Enfield Cruiser Bike or Compact Sedan',
        transport_type: 'bike',
        estimated_rate: 220,
        key_attractions: [
          spotNames[0] || `${cleanCity} Summit Viewpoint`,
          spotNames[3] || `${cleanCity} Tea Plantation`,
          hiddenNames[0] || 'Pine Forest Trail',
        ],
        pro_tip: 'Morning hours offer the clearest panoramic vistas across the valley before afternoon mountain fog sweeps in.',
        image_url: topSpots[0]?.image_url || getRandomImage('viewpoint', 0),
      },
      {
        id: `circuit-${slug}-2`,
        title: `${cleanCity} Forest Waterfalls & Emerald Lake Circuit`,
        category: 'Lakes, Cascades & Nature',
        tagline: 'Scenic forest drive past cascading mountain waterfalls and placid boating waters',
        distance_km: 38,
        ideal_duration: '4 to 6 Hours',
        best_time_of_day: '11:00 AM – 4:00 PM',
        recommended_transport: 'Comfort AC Sedan or Chauffeur SUV',
        transport_type: 'car',
        estimated_rate: 480,
        key_attractions: [
          spotNames[1] || `${cleanCity} Natural Waterfalls`,
          spotNames[2] || `${cleanCity} Lake & Promenade`,
          hiddenNames[1] || 'Off-Beat Sunset Rock Ridge',
        ],
        pro_tip: 'Carry comfortable walking shoes with good grip for damp stone trails around the cascades.',
        image_url: topSpots[1]?.image_url || getRandomImage('waterfall', 1),
      },
      {
        id: `circuit-${slug}-3`,
        title: `${cleanCity} Grand Western Ghats Full-Day Safari`,
        category: 'Wild Reserves & Valley Escapes',
        tagline: 'Complete regional immersion covering remote shola woods, hidden rock pools, and secret sunset vistas',
        distance_km: 65,
        ideal_duration: '8 to 10 Hours',
        best_time_of_day: '8:00 AM – 6:30 PM (Full Day Adventure)',
        recommended_transport: 'Tempo Traveller 12-Seater or 4x4 Cruiser',
        transport_type: 'van',
        estimated_rate: 850,
        key_attractions: [
          spotNames[0] || `${cleanCity} Summit`,
          spotNames[1] || `${cleanCity} Waterfalls`,
          hiddenNames[0] || 'Silent Shola Trail',
          hiddenNames[2] || 'Secret Rock Pools',
        ],
        pro_tip: 'Pack light woolens even in summer as high-elevation ridge temperatures drop swiftly in the evening.',
        image_url: topSpots[2]?.image_url || getRandomImage('forest', 2),
      },
    ]

    distanceMatrix = [
      {
        destination: spotNames[0] || `${cleanCity} Peak Observatory`,
        distance: '14 km',
        drive_time: '35 mins',
        ideal_hours: '2 to 3 Hours',
        best_transport: 'Bike or Car',
      },
      {
        destination: spotNames[1] || `${cleanCity} Forest Waterfalls`,
        distance: '24 km',
        drive_time: '45 mins',
        ideal_hours: '3 to 4 Hours',
        best_transport: 'Adventure Bike or SUV',
      },
      {
        destination: spotNames[2] || `${cleanCity} Boating Lake`,
        distance: '5 km',
        drive_time: '15 mins',
        ideal_hours: '2 Hours',
        best_transport: 'Scooter or Sedan',
      },
      {
        destination: hiddenNames[0] || 'Pine Forest Secret Valley',
        distance: '18 km',
        drive_time: '40 mins',
        ideal_hours: '2 to 3 Hours',
        best_transport: 'Bike or Car',
      },
    ]

    insiderTips = [
      {
        title: 'Mountain Road Driving Protocol',
        content: `Ghat roads around ${cleanCity} feature winding curves and hairpin bends. Uphill vehicles always have right of way. Keep honking gentle at blind turns and never park on narrow road corners.`,
      },
      {
        title: 'Best Photography Hours & Golden Mist',
        content: `Between 6:45 AM and 8:30 AM, soft golden light pierces through mountain mists creating dramatic sunbeam shafts across pine groves and tea bushes.`,
      },
      {
        title: 'Eco-Sensitive Forest Regulations',
        content: `Single-use plastic bottles and polythene bags are strictly restricted in reserve forest gates. Always carry reusable steel water flasks and dispose of trash responsibly.`,
      },
      {
        title: 'Authentic Local Brews & Fresh Spices',
        content: `Purchase single-origin orthodox tea and fresh green cardamom directly from cooperative estate counters rather than crowded tourist souvenir stalls.`,
      },
    ]

    dining = [
      { name: 'Hilltop Planters Brew House', specialty: 'Hand-pulled cardamom tea & wood-fired snacks', area: 'Main Ridge Road' },
      { name: 'Heritage Shola Kitchen', specialty: 'Homestyle South Indian meals with mountain greens', area: 'Town Bazaar' },
    ]
  } else if (isCoastal) {
    circuits = [
      {
        id: `circuit-${slug}-1`,
        title: `${cleanCity} Shoreline Promenade & Sunset Trail`,
        category: 'Coastal Drive & Sunsets',
        tagline: 'Breezy palm-lined boulevards, sandy coves, and ocean horizon viewpoints',
        distance_km: 18,
        ideal_duration: '2 to 3 Hours',
        best_time_of_day: '4:30 PM – 7:30 PM (Golden Hour)',
        recommended_transport: 'Cruiser Scooter or Open Top Thar',
        transport_type: 'bike',
        estimated_rate: 190,
        key_attractions: [
          spotNames[0] || `${cleanCity} Beach`,
          hiddenNames[0] || 'Secluded Cove & Bay',
        ],
        pro_tip: 'Arrive at the cliff lookout before 5:15 PM to grab front-row sunset views over the coastal horizon.',
        image_url: topSpots[0]?.image_url || getRandomImage('beach', 0),
      },
      {
        id: `circuit-${slug}-2`,
        title: `${cleanCity} Historic Sea Fort & Mangrove Estuary`,
        category: 'Marine Heritage & Kayak',
        tagline: 'Centuries-old sea fortresses, colonial quarters, and peaceful mangrove waterways',
        distance_km: 32,
        ideal_duration: '4 to 5 Hours',
        best_time_of_day: '9:00 AM – 2:00 PM',
        recommended_transport: 'AC Sedan or Compact SUV',
        transport_type: 'car',
        estimated_rate: 420,
        key_attractions: [
          spotNames[1] || 'Sea Fort Landmark',
          spotNames[2] || 'Backwater Estuary',
          hiddenNames[1] || 'Artisan Fishermen Quarter',
        ],
        pro_tip: 'Opt for traditional non-motorized canoe boats in the mangroves to observe kingfishers without startling them.',
        image_url: topSpots[1]?.image_url || getRandomImage('heritage', 1),
      },
      {
        id: `circuit-${slug}-3`,
        title: `${cleanCity} Island Ferries & Coastal Safari Loop`,
        category: 'Full Day Coastal Expedition',
        tagline: 'Comprehensive coast-to-coast day tour crossing scenic river mouths and remote fishing hamlets',
        distance_km: 55,
        ideal_duration: '7 to 9 Hours',
        best_time_of_day: '8:30 AM – 5:30 PM',
        recommended_transport: 'Force Urbania or 12-Seater Van',
        transport_type: 'van',
        estimated_rate: 780,
        key_attractions: [
          spotNames[0] || `${cleanCity} Beach`,
          spotNames[1] || 'Sea Fort',
          spotNames[2] || 'Mangrove Estuary',
          hiddenNames[0] || 'Secret Cove',
        ],
        pro_tip: 'Bring hats and UV sun protection; midday reflection off sea waters is intense.',
        image_url: topSpots[2]?.image_url || getRandomImage('lake', 1),
      },
    ]

    distanceMatrix = [
      {
        destination: spotNames[0] || `${cleanCity} Beach Promenade`,
        distance: '3 km',
        drive_time: '10 mins',
        ideal_hours: '2 Hours',
        best_transport: 'Scooter or Bike',
      },
      {
        destination: spotNames[1] || 'Historic Sea Fort & Lighthouse',
        distance: '16 km',
        drive_time: '35 mins',
        ideal_hours: '2 to 3 Hours',
        best_transport: 'Bike or Car',
      },
      {
        destination: spotNames[2] || 'Backwater Mangrove Sanctuary',
        distance: '28 km',
        drive_time: '50 mins',
        ideal_hours: '3 to 4 Hours',
        best_transport: 'Car or Van',
      },
    ]

    insiderTips = [
      {
        title: 'Tidal Safety & Swimming Advice',
        content: `Always observe beach red flag indicators. Strong undercurrents can be deceptive along sandbars. Stick to designated lifeguard zones.`,
      },
      {
        title: 'Fresh Catch Harbour Timings',
        content: `Local fishing trawlers return with the fresh ocean catch between 4:00 PM and 6:00 PM daily.`,
      },
      {
        title: 'Eco-Friendly Coastal Touring',
        content: `Never leave plastic shells or drink bottles on beach dunes. Respect marine turtle nesting zones.`,
      },
    ]

    dining = [
      { name: 'Fishermen’s Wharf Kitchen', specialty: 'Pan-fried catch of the day & coconut curry', area: 'Harbour Road' },
      { name: 'Coastal Palm Shaded Cafe', specialty: 'Chilled tender coconut mocktails & banana fritters', area: 'Beach Boulevard' },
    ]
  } else if (isTemple) {
    circuits = [
      {
        id: `circuit-${slug}-1`,
        title: `${cleanCity} Sacred Temple Darshan & Gopuram Walk`,
        category: 'Spiritual Dravidian Heritage',
        tagline: 'Monumental stone architecture, sacred tanks, and tranquil morning chants',
        distance_km: 12,
        ideal_duration: '3 to 4 Hours',
        best_time_of_day: '6:30 AM – 10:00 AM or 5:30 PM – 8:30 PM',
        recommended_transport: 'Chauffeur Sedan or Comfortable Hatchback',
        transport_type: 'car',
        estimated_rate: 320,
        key_attractions: [
          spotNames[0] || `${cleanCity} Grand Temple`,
          spotNames[2] || 'Sacred Water Tank',
        ],
        pro_tip: 'Traditional modest attire required for inner sanctum entry. Morning hours offer peaceful contemplation.',
        image_url: topSpots[0]?.image_url || getRandomImage('temple', 0),
      },
      {
        id: `circuit-${slug}-2`,
        title: `${cleanCity} Royal Palace & Silk Weavers Trail`,
        category: 'Art, Architecture & Craft',
        tagline: 'Indo-Saracenic royal halls, stucco arches, and master artisan wooden handloom workshops',
        distance_km: 20,
        ideal_duration: '4 to 5 Hours',
        best_time_of_day: '10:00 AM – 3:30 PM',
        recommended_transport: 'Cruiser Bike or AC Sedan',
        transport_type: 'bike',
        estimated_rate: 380,
        key_attractions: [
          spotNames[1] || 'Historic Royal Palace',
          hiddenNames[1] || 'Master Handloom Lane',
        ],
        pro_tip: 'Purchase handwoven textiles directly from weaver guilds to support generational artisans.',
        image_url: topSpots[1]?.image_url || getRandomImage('heritage', 0),
      },
      {
        id: `circuit-${slug}-3`,
        title: `${cleanCity} Full-Day Spiritual & Heritage Pilgrimage`,
        category: 'Complete Heritage Pilgrimage',
        tagline: 'Full pilgrimage circuit across rock-cut caves, holy river ghats, and royal monuments',
        distance_km: 45,
        ideal_duration: '7 to 8 Hours',
        best_time_of_day: '7:00 AM – 4:00 PM',
        recommended_transport: 'Force Urbania or 12-Seater Van',
        transport_type: 'van',
        estimated_rate: 720,
        key_attractions: [
          spotNames[0] || `${cleanCity} Temple`,
          spotNames[1] || 'Royal Palace',
          hiddenNames[0] || 'Rock-Cut Cave Inscriptions',
          hiddenNames[1] || 'Weavers Lane',
        ],
        pro_tip: 'Carry slip-on footwear as shoes must be removed at multiple temple enclosures.',
        image_url: topSpots[2]?.image_url || getRandomImage('temple', 1),
      },
    ]

    distanceMatrix = [
      {
        destination: spotNames[0] || `${cleanCity} Main Temple`,
        distance: '2 km',
        drive_time: '10 mins',
        ideal_hours: '2 to 3 Hours',
        best_transport: 'Car or Guide',
      },
      {
        destination: spotNames[1] || 'Royal Palace Landmark',
        distance: '5 km',
        drive_time: '15 mins',
        ideal_hours: '1.5 to 2 Hours',
        best_transport: 'Car or Bike',
      },
      {
        destination: hiddenNames[0] || 'Sacred Rock-Cut Cave Shrine',
        distance: '14 km',
        drive_time: '30 mins',
        ideal_hours: '2 Hours',
        best_transport: 'Bike or Car',
      },
    ]

    insiderTips = [
      {
        title: 'Temple Sanctum Etiquette',
        content: `Dhoti or trousers with shirts for men, and sarees or salwar kameez for women. Electronic items and leather belts may need to be deposited at cloaking counters.`,
      },
      {
        title: 'Evening Arati & Sacred Music',
        content: `Don't miss the 7:30 PM evening Nadaswaram temple music and procession.`,
      },
      {
        title: 'Iconic Sweets & Ghee Specialties',
        content: `Taste pure ghee delicacies and authentic traditional filter coffee around the temple street stalls.`,
      },
    ]

    dining = [
      { name: 'Heritage Prasadam Bhojanalaya', specialty: 'Traditional banana leaf full meals & curd vadai', area: 'South Mada Street' },
      { name: 'Royal Temple Filter Coffee House', specialty: 'Wood-roasted Kumbakonam degree coffee & hot halwa', area: 'East Tower Gate' },
    ]
  } else {
    // General Gateway / Regional Hub
    circuits = [
      {
        id: `circuit-${slug}-1`,
        title: `${cleanCity} City Highlights & Heritage Loop`,
        category: 'Urban Heritage & Lifestyle',
        tagline: 'Iconic city landmarks, museums, and vibrant local cultural bazaars',
        distance_km: 18,
        ideal_duration: '3 to 4 Hours',
        best_time_of_day: '9:30 AM – 1:30 PM',
        recommended_transport: 'City Scooter or Comfortable Sedan',
        transport_type: 'car',
        estimated_rate: 340,
        key_attractions: [
          spotNames[0] || `${cleanCity} Central Landmark`,
          spotNames[2] || 'Regional Arts Bazaar',
          hiddenNames[1] || 'Heritage Old Quarter',
        ],
        pro_tip: 'Pair the city tour with local culinary stops at iconic regional cafes.',
        image_url: topSpots[0]?.image_url || getRandomImage('heritage', 0),
      },
      {
        id: `circuit-${slug}-2`,
        title: `${cleanCity} Nature Sanctuary & Lake Circuit`,
        category: 'Nature & Waterfront Escape',
        tagline: 'Lush botanical gardens, tranquil lake boating, and sunset river steps',
        distance_km: 25,
        ideal_duration: '3 to 5 Hours',
        best_time_of_day: '3:30 PM – 7:30 PM',
        recommended_transport: 'Cruiser Bike or AC Sedan',
        transport_type: 'bike',
        estimated_rate: 260,
        key_attractions: [
          spotNames[1] || 'Nature Park & Lake',
          hiddenNames[0] || 'Riverfront Sunset Steps',
        ],
        pro_tip: 'Sunset views over the lake offer postcard reflections and cooling evening breezes.',
        image_url: topSpots[1]?.image_url || getRandomImage('lake', 1),
      },
      {
        id: `circuit-${slug}-3`,
        title: `${cleanCity} Full-Day Countryside Discovery`,
        category: 'Regional Countryside Exploration',
        tagline: 'Complete day tour venturing into surrounding rural orchards and tranquil hillocks',
        distance_km: 50,
        ideal_duration: '6 to 8 Hours',
        best_time_of_day: '8:30 AM – 4:30 PM',
        recommended_transport: 'Tempo Traveller or Chauffeur SUV',
        transport_type: 'van',
        estimated_rate: 680,
        key_attractions: [
          spotNames[0] || `${cleanCity} Landmark`,
          spotNames[1] || 'Nature Park',
          hiddenNames[0] || 'Riverfront Steps',
          hiddenNames[1] || 'Old Quarter',
        ],
        pro_tip: 'Stop at highway farm stalls for fresh local seasonal fruits and refreshments.',
        image_url: topSpots[2]?.image_url || getRandomImage('viewpoint', 2),
      },
    ]

    distanceMatrix = [
      {
        destination: spotNames[0] || `${cleanCity} Central Heritage Landmark`,
        distance: '4 km',
        drive_time: '15 mins',
        ideal_hours: '2 Hours',
        best_transport: 'Car or Bike',
      },
      {
        destination: spotNames[1] || 'Scenic Nature Park & Lake',
        distance: '12 km',
        drive_time: '25 mins',
        ideal_hours: '2 to 3 Hours',
        best_transport: 'Bike or Car',
      },
      {
        destination: hiddenNames[0] || 'Riverfront Sunset Steps',
        distance: '8 km',
        drive_time: '20 mins',
        ideal_hours: '1.5 Hours',
        best_transport: 'Bike or Car',
      },
    ]

    insiderTips = [
      {
        title: 'Peak Traffic Avoidance',
        content: `Travel between 10:00 AM and 4:30 PM for smooth highway connectivity avoiding morning and evening office commutes.`,
      },
      {
        title: 'Local Artisan Markets',
        content: `Visit the central bazaar district in the morning for best prices on local handicrafts and textiles.`,
      },
    ]

    dining = [
      { name: 'Central Heritage Cafe', specialty: 'Authentic regional breakfast & filter coffee', area: 'Downtown' },
      { name: 'Grand Countryside Restaurant', specialty: 'Homestyle clay pot meals & ghee roast', area: 'Bypass Road' },
    ]
  }

  return {
    headline: `The Regional Hourly Travel & Day Escapes Guide for ${cleanCity}`,
    overview: `From pristine cultural landmarks to scenic country roads and tranquil nature retreats — explore ${cleanCity} on your own terms with verified local hosts and drivers, paying strictly for the hours you use.`,
    circuits,
    distance_matrix: distanceMatrix,
    insider_tips: insiderTips,
    dining_recommendations: dining,
  }
}

export async function POST(request: Request) {
  try {
    const body: GenerateSpotsRequest = await request.json()
    const { cityName, lat, lng, state, category } = body

    if (!cityName?.trim()) {
      return NextResponse.json(
        { error: 'City name is required for AI spot generation' },
        { status: 400 }
      )
    }

    const cleanCity = cityName.trim()
    const lowerCity = cleanCity.toLowerCase()
    const validLat = Number(lat) || 11.0168
    const validLng = Number(lng) || 76.9558

    // 1. Check if City matches our curated Regional Knowledge Base
    const matchedKey = Object.keys(REGIONAL_KNOWLEDGE_BASE).find((k) =>
      lowerCity.includes(k)
    )

    if (matchedKey) {
      const kb = REGIONAL_KNOWLEDGE_BASE[matchedKey]
      const slug = cleanCity.toLowerCase().replace(/[^a-z0-9]/g, '-')

      const topSpots: CitySpot[] = kb.top_spots.map((s, idx) => ({
        id: `spot-${slug}-${idx + 1}`,
        name: s.name,
        category: s.category,
        recommended_hours: s.recommended_hours,
        description: s.description,
        image_url: getRandomImage(s.image_category, idx),
        is_hidden_gem: false,
        lat: Number((validLat + (idx * 0.008 - 0.015)).toFixed(4)),
        lng: Number((validLng + (idx * 0.008 - 0.015)).toFixed(4)),
        insider_tip: s.insider_tip,
      }))

      const hiddenSpots: CitySpot[] = kb.hidden_spots.map((s, idx) => ({
        id: `hidden-${slug}-${idx + 1}`,
        name: s.name,
        category: s.category,
        recommended_hours: s.recommended_hours,
        description: s.description,
        image_url: getRandomImage(s.image_category, idx + 2),
        is_hidden_gem: true,
        lat: Number((validLat + (idx * 0.01 - 0.02)).toFixed(4)),
        lng: Number((validLng + (idx * 0.01 - 0.02)).toFixed(4)),
        insider_tip: s.insider_tip,
      }))

      const guide = buildRegionalGuide(
        cleanCity,
        state || 'Tamil Nadu',
        kb.category,
        topSpots,
        hiddenSpots
      )

      return NextResponse.json({
        success: true,
        source: 'regional_knowledge_base',
        cityName: cleanCity,
        suggested_category: kb.category,
        suggested_description: kb.description,
        suggested_image_url: kb.cover_image,
        top_spots: topSpots,
        hidden_spots: hiddenSpots,
        guide,
      })
    }

    // 2. Synthesize High-Fidelity Intelligent Spots based on Geolocation & Name
    const synthesized = synthesizeGenericSpots(
      cleanCity,
      state || 'Tamil Nadu',
      category || 'Kongu Heritage & Western Ghats Gateway',
      validLat,
      validLng
    )

    return NextResponse.json({
      success: true,
      source: 'ai_geo_synthesizer',
      cityName: cleanCity,
      ...synthesized,
    })
  } catch (err: any) {
    console.error('AI Spot Generation error:', err)
    return NextResponse.json(
      { error: err.message || 'Failed to generate spots' },
      { status: 500 }
    )
  }
}

