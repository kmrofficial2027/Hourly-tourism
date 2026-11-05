export interface HomepageShowcaseReview {
  id: string
  name: string
  city: string
  role: string
  rating: number
  service: string
  comment: string
  is_active: boolean
  display_order: number
}

export const DEFAULT_HOMEPAGE_REVIEWS: HomepageShowcaseReview[] = [
  {
    id: 'rev-1',
    name: 'Karthik Raja',
    city: 'Coimbatore',
    role: 'Weekend Traveler',
    rating: 5,
    service: 'Royal Enfield Hunter — 4 Hours to Marudhamalai',
    comment:
      'Booking by the hour is brilliant. I had 4 hours before my evening flight from Coimbatore, booked a bike instantly, visited Marudhamalai temple and reached the airport with zero stress.',
    is_active: true,
    display_order: 1,
  },
  {
    id: 'rev-2',
    name: 'Meera Nambiar',
    city: 'Kochi',
    role: 'Family Trip',
    rating: 5,
    service: 'Innova Crysta — 6 Hours Nilgiris Circuit',
    comment:
      'We traveled with elderly parents and kids. Booking the 6-hour package gave us flexibility to stop at tea gardens and viewpoints at our own pace. Driver was polite and prompt.',
    is_active: true,
    display_order: 2,
  },
  {
    id: 'rev-3',
    name: 'Alex Vance',
    city: 'Melbourne, Australia',
    role: 'International Tourist',
    rating: 5,
    service: 'Heritage Textile & Food Walk — 3 Hours',
    comment:
      'Our guide was fantastic! Walked through historic mill quarters, tried authentic Kongu cuisine, and explained everything in fluent English. Transparent hourly pricing.',
    is_active: true,
    display_order: 3,
  },
  {
    id: 'rev-4',
    name: 'Dr. Arvind Swaminathan',
    city: 'Bengaluru',
    role: 'Spiritual Traveler',
    rating: 5,
    service: 'Royal Enfield Classic — 5 Hours Isha Yoga Circuit',
    comment:
      'Booked a cruiser bike for Isha Adiyogi sunset and Divya Darshanam 3D light show. The rider host knew the fastest entry and parking routes. Pure bliss without worrying about cab surge pricing.',
    is_active: true,
    display_order: 4,
  },
  {
    id: 'rev-5',
    name: 'Sneha & Rohit Kapoor',
    city: 'Mumbai',
    role: 'Honeymooners',
    rating: 5,
    service: 'AC Chauffeur SUV — 8 Hours Valparai 40 Curves',
    comment:
      'Touring Valparai’s 40 hairpin bends in a comfortable SUV was the highlight of our Tamil Nadu holiday. The chauffeur was an expert on mountain fog, spotted wild Nilgiri Tahr, and made our day unforgettable.',
    is_active: true,
    display_order: 5,
  },
  {
    id: 'rev-6',
    name: 'Praveen Kumar',
    city: 'Chennai',
    role: 'Solo Backpacker',
    rating: 5,
    service: 'Himalayan 450 — 5 Hours Siruvani Rainforest',
    comment:
      'Visited Siruvani sweet water forest. Pure natural spring water tasting right from the mountain source. Host helped with the forest department permits and strictly maintained the zero-plastic rule.',
    is_active: true,
    display_order: 6,
  },
  {
    id: 'rev-7',
    name: 'Ananya Deshmukh',
    city: 'Pune',
    role: 'Wildlife Enthusiast',
    rating: 5,
    service: 'Countryside Sedan — 6 Hours Topslip Wildlife Tour',
    comment:
      'Topslip Elephant Safari was seamless. Driver reported before 7 AM at Sethumadai checkpost so we got the first safari batch. Saw wild elephants and giant squirrels up close.',
    is_active: true,
    display_order: 7,
  },
  {
    id: 'rev-8',
    name: 'David & Sarah Jenkins',
    city: 'London, UK',
    role: 'Heritage Seekers',
    rating: 5,
    service: 'Certified Local Guide — 2 Hours Perur Chola Art',
    comment:
      'Perur Pateeswarar Temple stone carving walk with a certified guide opened our eyes to 7th-century Chola art. Booking 2 hours was super convenient and worth every penny.',
    is_active: true,
    display_order: 8,
  },
]

