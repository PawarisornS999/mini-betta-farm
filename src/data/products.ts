import { Product } from "@/types";

export const products: Product[] = [
  {
    id: "hm-blue-001",
    name: "Halfmoon Royal Blue",
    price: 350,
    originalPrice: 450,
    description:
      "A stunning Halfmoon betta with a vibrant royal blue coloration and a perfect 180-degree tail spread. This fish is a show-quality specimen with excellent finnage and deep, consistent color throughout.",
    species: "Halfmoon",
    color: "Blue",
    difficulty: "intermediate",
    waterTemp: "24-28°C",
    feedingNotes:
      "Feed high-quality betta pellets 2-3 times daily. Supplement with frozen bloodworms and brine shrimp weekly.",
    images: [
      "https://placehold.co/600x600/0284c7/ffffff?text=Halfmoon+Blue",
      "https://placehold.co/600x600/0369a1/ffffff?text=Halfmoon+Blue+2",
    ],
    stockStatus: "in_stock",
    badge: "Best Seller",
  },
  {
    id: "ct-red-002",
    name: "Crowntail Fire Red",
    price: 280,
    description:
      "An eye-catching Crowntail betta with intense fire red coloring. Its distinctive spiky fin rays create a crown-like appearance that makes this fish truly unique.",
    species: "Crowntail",
    color: "Red",
    difficulty: "beginner",
    waterTemp: "24-28°C",
    feedingNotes:
      "Feed betta pellets twice daily. Occasional treats of frozen or live foods are recommended.",
    images: [
      "https://placehold.co/600x600/dc2626/ffffff?text=Crowntail+Red",
      "https://placehold.co/600x600/b91c1c/ffffff?text=Crowntail+Red+2",
    ],
    stockStatus: "in_stock",
  },
  {
    id: "pk-galaxy-003",
    name: "Plakat Galaxy Koi",
    price: 550,
    originalPrice: 650,
    description:
      "A premium Plakat betta featuring mesmerizing galaxy koi patterns. Short-finned and active, this fish displays unique spots of red, blue, and white across its body.",
    species: "Plakat",
    color: "Galaxy",
    difficulty: "beginner",
    waterTemp: "24-30°C",
    feedingNotes:
      "Feed high-protein pellets 2x daily. Plakat bettas are active swimmers and benefit from a varied diet.",
    images: [
      "https://placehold.co/600x600/7c3aed/ffffff?text=Plakat+Galaxy",
      "https://placehold.co/600x600/6d28d9/ffffff?text=Plakat+Galaxy+2",
    ],
    stockStatus: "in_stock",
    badge: "Premium",
  },
  {
    id: "gb-blue-004",
    name: "Giant Betta Blue",
    price: 1200,
    originalPrice: 1500,
    description:
      "An impressive Giant Betta reaching up to 12cm in length. This magnificent specimen features a deep blue color and commanding presence that will be the centerpiece of any aquarium.",
    species: "Giant Betta",
    color: "Blue",
    difficulty: "advanced",
    waterTemp: "25-28°C",
    feedingNotes:
      "Requires more food than standard bettas. Feed large pellets 2-3 times daily with regular protein supplements.",
    images: [
      "https://placehold.co/600x600/1e40af/ffffff?text=Giant+Blue",
      "https://placehold.co/600x600/1e3a8a/ffffff?text=Giant+Blue+2",
    ],
    stockStatus: "low_stock",
    badge: "Rare",
  },
  {
    id: "dt-marble-005",
    name: "Double Tail Marble",
    price: 420,
    description:
      "A beautiful Double Tail betta with stunning marble patterns. Its split tail creates an elegant, symmetrical display. Colors may shift over time due to the marble gene.",
    species: "Double Tail",
    color: "Marble",
    difficulty: "intermediate",
    waterTemp: "24-28°C",
    feedingNotes:
      "Feed quality pellets twice daily. Avoid overfeeding as Double Tails are prone to swim bladder issues.",
    images: [
      "https://placehold.co/600x600/6366f1/ffffff?text=Double+Tail+Marble",
      "https://placehold.co/600x600/4f46e5/ffffff?text=Double+Tail+Marble+2",
    ],
    stockStatus: "in_stock",
  },
  {
    id: "de-copper-006",
    name: "Dumbo Ear Copper",
    price: 480,
    originalPrice: 580,
    description:
      "A stunning Dumbo Ear (Elephant Ear) betta with shimmering copper coloring. Its oversized pectoral fins resemble elephant ears and create a breathtaking display when flared.",
    species: "Dumbo Ear",
    color: "Copper",
    difficulty: "intermediate",
    waterTemp: "24-28°C",
    feedingNotes:
      "Feed small pellets 2x daily. Their large fins require clean water and a gentle current.",
    images: [
      "https://placehold.co/600x600/d97706/ffffff?text=Dumbo+Copper",
      "https://placehold.co/600x600/b45309/ffffff?text=Dumbo+Copper+2",
    ],
    stockStatus: "in_stock",
    badge: "Popular",
  },
  {
    id: "hm-koi-007",
    name: "Halfmoon Koi Fancy",
    price: 650,
    description:
      "A spectacular Halfmoon Koi betta with vivid red, white, and orange markings reminiscent of Japanese koi fish. Show-quality finnage with perfect spread.",
    species: "Halfmoon",
    color: "Koi",
    difficulty: "intermediate",
    waterTemp: "24-28°C",
    feedingNotes:
      "Feed premium betta pellets and supplement with color-enhancing foods to maintain vibrant koi patterns.",
    images: [
      "https://placehold.co/600x600/ea580c/ffffff?text=Halfmoon+Koi",
      "https://placehold.co/600x600/c2410c/ffffff?text=Halfmoon+Koi+2",
    ],
    stockStatus: "in_stock",
  },
  {
    id: "ct-blue-008",
    name: "Crowntail Steel Blue",
    price: 250,
    description:
      "A classic Crowntail betta in steel blue coloring with metallic sheen. Excellent fin extension and well-defined ray structure make this a great specimen for both beginners and collectors.",
    species: "Crowntail",
    color: "Blue",
    difficulty: "beginner",
    waterTemp: "24-28°C",
    feedingNotes:
      "Easy to feed — accepts most commercial betta pellets readily. Feed 2-3 pellets twice daily.",
    images: [
      "https://placehold.co/600x600/2563eb/ffffff?text=Crowntail+Blue",
      "https://placehold.co/600x600/1d4ed8/ffffff?text=Crowntail+Blue+2",
    ],
    stockStatus: "in_stock",
  },
  {
    id: "pk-red-009",
    name: "Plakat Super Red",
    price: 300,
    description:
      "A fierce Plakat betta in vibrant super red coloring. Short-finned and aggressive, this fish is highly active and displays brilliant color under proper lighting.",
    species: "Plakat",
    color: "Red",
    difficulty: "beginner",
    waterTemp: "24-30°C",
    feedingNotes:
      "Hardy eater that accepts pellets, frozen, and live foods. Feed moderate portions twice daily.",
    images: [
      "https://placehold.co/600x600/ef4444/ffffff?text=Plakat+Red",
      "https://placehold.co/600x600/dc2626/ffffff?text=Plakat+Red+2",
    ],
    stockStatus: "in_stock",
  },
  {
    id: "hm-galaxy-010",
    name: "Halfmoon Galaxy",
    price: 750,
    originalPrice: 900,
    description:
      "An ultra-premium Halfmoon betta with galaxy coloring — dark body speckled with iridescent blue and white spots resembling a starry night sky. A true collector's piece.",
    species: "Halfmoon",
    color: "Galaxy",
    difficulty: "advanced",
    waterTemp: "24-27°C",
    feedingNotes:
      "Feed premium pellets and frozen foods. Maintain pristine water quality to preserve color intensity.",
    images: [
      "https://placehold.co/600x600/312e81/ffffff?text=Halfmoon+Galaxy",
      "https://placehold.co/600x600/1e1b4b/ffffff?text=Halfmoon+Galaxy+2",
    ],
    stockStatus: "low_stock",
    badge: "Limited",
  },
  {
    id: "de-red-011",
    name: "Dumbo Ear Red Dragon",
    price: 520,
    description:
      "A magnificent Dumbo Ear betta with red dragon scaling. The thick metallic white scales contrast beautifully with deep red fins and oversized pectoral fins.",
    species: "Dumbo Ear",
    color: "Red",
    difficulty: "advanced",
    waterTemp: "24-28°C",
    feedingNotes:
      "Feed high-quality pellets and bloodworms. Dragon scale bettas may develop eye issues — monitor closely.",
    images: [
      "https://placehold.co/600x600/be123c/ffffff?text=Dumbo+Dragon",
      "https://placehold.co/600x600/9f1239/ffffff?text=Dumbo+Dragon+2",
    ],
    stockStatus: "in_stock",
  },
  {
    id: "gb-red-012",
    name: "Giant Betta Red",
    price: 1500,
    description:
      "A rare Giant Betta in deep red coloring, reaching over 10cm. These impressive fish require larger tanks and make a dramatic statement piece in any aquarium setup.",
    species: "Giant Betta",
    color: "Red",
    difficulty: "advanced",
    waterTemp: "25-28°C",
    feedingNotes:
      "Needs larger food portions. Feed jumbo pellets and chunky frozen foods 2-3 times daily.",
    images: [
      "https://placehold.co/600x600/991b1b/ffffff?text=Giant+Red",
      "https://placehold.co/600x600/7f1d1d/ffffff?text=Giant+Red+2",
    ],
    stockStatus: "out_of_stock",
    badge: "Sold Out",
  },
];

export const speciesList: string[] = [
  "Halfmoon",
  "Crowntail",
  "Plakat",
  "Giant Betta",
  "Double Tail",
  "Dumbo Ear",
];

export const colorList: string[] = [
  "Blue",
  "Red",
  "Galaxy",
  "Koi",
  "Marble",
  "Copper",
];

export const difficultyList: string[] = [
  "beginner",
  "intermediate",
  "advanced",
];
