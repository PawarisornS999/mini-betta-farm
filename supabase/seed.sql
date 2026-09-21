insert into public.products (
  id,name,slug,price,original_price,description,species,color,difficulty_level,
  stock_qty,stock_status,water_temp_min,water_temp_max,water_temp,feeding_notes,
  images,badge,featured,published,seo_title,seo_description
) values
('hm-blue-001','Halfmoon Royal Blue','hm-blue-001',350,450,'A stunning Halfmoon betta with a vibrant royal blue coloration and a perfect 180-degree tail spread. This fish is a show-quality specimen with excellent finnage and deep, consistent color throughout.','Halfmoon','Blue','medium',10,'in_stock',null,null,'24-28°C','Feed high-quality betta pellets 2-3 times daily. Supplement with frozen bloodworms and brine shrimp weekly.',array['https://placehold.co/600x600/0284c7/ffffff?text=Halfmoon+Blue','https://placehold.co/600x600/0369a1/ffffff?text=Halfmoon+Blue+2']::text[],'Best Seller',true,true,null,null),
('ct-red-002','Crowntail Fire Red','ct-red-002',280,null,'An eye-catching Crowntail betta with intense fire red coloring. Its distinctive spiky fin rays create a crown-like appearance that makes this fish truly unique.','Crowntail','Red','beginner',10,'in_stock',null,null,'24-28°C','Feed betta pellets twice daily. Occasional treats of frozen or live foods are recommended.',array['https://placehold.co/600x600/dc2626/ffffff?text=Crowntail+Red','https://placehold.co/600x600/b91c1c/ffffff?text=Crowntail+Red+2']::text[],null,false,true,null,null),
('pk-galaxy-003','Plakat Galaxy Koi','pk-galaxy-003',550,650,'A premium Plakat betta featuring mesmerizing galaxy koi patterns. Short-finned and active, this fish displays unique spots of red, blue, and white across its body.','Plakat','Galaxy','beginner',10,'in_stock',null,null,'24-30°C','Feed high-protein pellets 2x daily. Plakat bettas are active swimmers and benefit from a varied diet.',array['https://placehold.co/600x600/7c3aed/ffffff?text=Plakat+Galaxy','https://placehold.co/600x600/6d28d9/ffffff?text=Plakat+Galaxy+2']::text[],'Premium',true,true,null,null),
('gb-blue-004','Giant Betta Blue','gb-blue-004',1200,1500,'An impressive Giant Betta reaching up to 12cm in length. This magnificent specimen features a deep blue color and commanding presence that will be the centerpiece of any aquarium.','Giant Betta','Blue','advanced',3,'low_stock',null,null,'25-28°C','Requires more food than standard bettas. Feed large pellets 2-3 times daily with regular protein supplements.',array['https://placehold.co/600x600/1e40af/ffffff?text=Giant+Blue','https://placehold.co/600x600/1e3a8a/ffffff?text=Giant+Blue+2']::text[],'Rare',true,true,null,null),
('dt-marble-005','Double Tail Marble','dt-marble-005',420,null,'A beautiful Double Tail betta with stunning marble patterns. Its split tail creates an elegant, symmetrical display. Colors may shift over time due to the marble gene.','Double Tail','Marble','medium',10,'in_stock',null,null,'24-28°C','Feed quality pellets twice daily. Avoid overfeeding as Double Tails are prone to swim bladder issues.',array['https://placehold.co/600x600/6366f1/ffffff?text=Double+Tail+Marble','https://placehold.co/600x600/4f46e5/ffffff?text=Double+Tail+Marble+2']::text[],null,false,true,null,null),
('de-copper-006','Dumbo Ear Copper','de-copper-006',480,580,'A stunning Dumbo Ear (Elephant Ear) betta with shimmering copper coloring. Its oversized pectoral fins resemble elephant ears and create a breathtaking display when flared.','Dumbo Ear','Copper','medium',10,'in_stock',null,null,'24-28°C','Feed small pellets 2x daily. Their large fins require clean water and a gentle current.',array['https://placehold.co/600x600/d97706/ffffff?text=Dumbo+Copper','https://placehold.co/600x600/b45309/ffffff?text=Dumbo+Copper+2']::text[],'Popular',true,true,null,null),
('hm-koi-007','Halfmoon Koi Fancy','hm-koi-007',650,null,'A spectacular Halfmoon Koi betta with vivid red, white, and orange markings reminiscent of Japanese koi fish. Show-quality finnage with perfect spread.','Halfmoon','Koi','medium',10,'in_stock',null,null,'24-28°C','Feed premium betta pellets and supplement with color-enhancing foods to maintain vibrant koi patterns.',array['https://placehold.co/600x600/ea580c/ffffff?text=Halfmoon+Koi','https://placehold.co/600x600/c2410c/ffffff?text=Halfmoon+Koi+2']::text[],null,false,true,null,null),
('ct-blue-008','Crowntail Steel Blue','ct-blue-008',250,null,'A classic Crowntail betta in steel blue coloring with metallic sheen. Excellent fin extension and well-defined ray structure make this a great specimen for both beginners and collectors.','Crowntail','Blue','beginner',10,'in_stock',null,null,'24-28°C','Easy to feed — accepts most commercial betta pellets readily. Feed 2-3 pellets twice daily.',array['https://placehold.co/600x600/2563eb/ffffff?text=Crowntail+Blue','https://placehold.co/600x600/1d4ed8/ffffff?text=Crowntail+Blue+2']::text[],null,false,true,null,null),
('pk-red-009','Plakat Super Red','pk-red-009',300,null,'A fierce Plakat betta in vibrant super red coloring. Short-finned and aggressive, this fish is highly active and displays brilliant color under proper lighting.','Plakat','Red','beginner',10,'in_stock',null,null,'24-30°C','Hardy eater that accepts pellets, frozen, and live foods. Feed moderate portions twice daily.',array['https://placehold.co/600x600/ef4444/ffffff?text=Plakat+Red','https://placehold.co/600x600/dc2626/ffffff?text=Plakat+Red+2']::text[],null,false,true,null,null),
('hm-galaxy-010','Halfmoon Galaxy','hm-galaxy-010',750,900,'An ultra-premium Halfmoon betta with galaxy coloring — dark body speckled with iridescent blue and white spots resembling a starry night sky. A true collector''s piece.','Halfmoon','Galaxy','advanced',3,'low_stock',null,null,'24-27°C','Feed premium pellets and frozen foods. Maintain pristine water quality to preserve color intensity.',array['https://placehold.co/600x600/312e81/ffffff?text=Halfmoon+Galaxy','https://placehold.co/600x600/1e1b4b/ffffff?text=Halfmoon+Galaxy+2']::text[],'Limited',true,true,null,null),
('de-red-011','Dumbo Ear Red Dragon','de-red-011',520,null,'A magnificent Dumbo Ear betta with red dragon scaling. The thick metallic white scales contrast beautifully with deep red fins and oversized pectoral fins.','Dumbo Ear','Red','advanced',10,'in_stock',null,null,'24-28°C','Feed high-quality pellets and bloodworms. Dragon scale bettas may develop eye issues — monitor closely.',array['https://placehold.co/600x600/be123c/ffffff?text=Dumbo+Dragon','https://placehold.co/600x600/9f1239/ffffff?text=Dumbo+Dragon+2']::text[],null,false,true,null,null),
('gb-red-012','Giant Betta Red','gb-red-012',1500,null,'A rare Giant Betta in deep red coloring, reaching over 10cm. These impressive fish require larger tanks and make a dramatic statement piece in any aquarium setup.','Giant Betta','Red','advanced',0,'out_of_stock',null,null,'25-28°C','Needs larger food portions. Feed jumbo pellets and chunky frozen foods 2-3 times daily.',array['https://placehold.co/600x600/991b1b/ffffff?text=Giant+Red','https://placehold.co/600x600/7f1d1d/ffffff?text=Giant+Red+2']::text[],'Sold Out',true,true,null,null)
on conflict (id) do update set
  name=excluded.name, slug=excluded.slug, price=excluded.price,
  original_price=excluded.original_price, description=excluded.description,
  species=excluded.species, color=excluded.color, difficulty_level=excluded.difficulty_level,
  stock_qty=excluded.stock_qty, stock_status=excluded.stock_status,
  water_temp_min=excluded.water_temp_min, water_temp_max=excluded.water_temp_max,
  water_temp=excluded.water_temp, feeding_notes=excluded.feeding_notes,
  images=excluded.images, badge=excluded.badge, featured=excluded.featured,
  published=excluded.published, seo_title=excluded.seo_title,
  seo_description=excluded.seo_description;

insert into public.blog_posts (
  title,slug,excerpt,content,cover_image,category,tags,author,read_time,
  related_slugs,published,published_at,seo_title,seo_description
) values
('The Complete Guide to Betta Fish Care','how-to-care-for-betta-fish','Everything you need to know about caring for your betta fish — from tank setup to daily maintenance. A must-read for new betta owners.','
## Introduction

Betta fish (Siamese fighting fish) are one of the most popular freshwater aquarium fish in the world. Known for their stunning colors and flowing fins, bettas make wonderful pets when properly cared for.

## Tank Setup

### Tank Size
- **Minimum**: 5 gallons (19 liters)
- **Recommended**: 10 gallons (38 liters) or larger
- Never keep bettas in small bowls or vases

### Water Parameters
- **Temperature**: 24-28°C (76-82°F)
- **pH**: 6.5-7.5
- **Ammonia/Nitrite**: 0 ppm
- **Nitrate**: Below 20 ppm

### Essential Equipment
1. Heater (adjustable preferred)
2. Gentle filter (sponge filter recommended)
3. Thermometer
4. LED light with timer
5. Hiding spots and live plants

## Daily Care

### Feeding
- Feed 2-3 high-quality betta pellets twice daily
- Supplement with frozen bloodworms or brine shrimp 1-2 times per week
- Fast one day per week to prevent bloating

### Water Changes
- Perform 25% water changes weekly
- Use a water conditioner to remove chlorine
- Match the temperature of new water to the tank

## Common Mistakes to Avoid

1. **Overfeeding** — A betta''s stomach is about the size of its eye
2. **Small tanks** — Bettas need space to swim and explore
3. **No heater** — Bettas are tropical fish and need warm water
4. **Placing two males together** — They will fight

## Conclusion

With proper care, betta fish can live 3-5 years and bring daily joy. Invest in the right setup, maintain consistent water quality, and your betta will thrive.
    ','https://placehold.co/800x400/0284c7/ffffff?text=Betta+Care+Guide','Care Guide','{}'::text[],'Aurora Betta Farm','8 min read',array['best-water-temperature-for-betta','betta-feeding-guide']::text[],true,'2025-05-20','Complete Betta Fish Care Guide 2025 | Aurora Betta Farm','Learn how to properly care for betta fish. Tank setup, feeding, water parameters, and common mistakes. Expert guide from Aurora Betta Farm.'),
('How to Treat White Spot Disease (Ich) in Betta Fish','how-to-treat-ich-white-spot-disease','White spot disease (Ich) is one of the most common betta fish illnesses. Learn how to identify, treat, and prevent this parasitic infection.','
## What is Ich (White Spot Disease)?

Ich (Ichthyophthirius multifiliis) is a parasitic disease that appears as small white spots on your betta''s body and fins. It''s one of the most common and treatable fish diseases.

## Symptoms

- Small white spots (like grains of salt) on body and fins
- Flashing (rubbing against objects)
- Clamped fins
- Loss of appetite
- Lethargy
- Rapid breathing

## Treatment Steps

### Step 1: Raise Temperature
Gradually increase water temperature to 30°C (86°F) over 24-48 hours. This speeds up the parasite''s life cycle.

### Step 2: Add Aquarium Salt
- Add 1 tablespoon of aquarium salt per 5 gallons
- Dissolve salt before adding to tank
- Do NOT use table salt

### Step 3: Medication
- Use ich-specific medication (malachite green or formalin-based)
- Follow dosage instructions carefully
- Remove activated carbon from filter during treatment

### Step 4: Water Changes
- Perform 25% water changes daily during treatment
- Continue treatment for 3 days after last visible spot disappears

## Prevention

1. Quarantine new fish for 2 weeks before adding to main tank
2. Maintain consistent water temperature
3. Keep water quality high
4. Reduce stress factors
5. Don''t overcrowd the tank

## When to See a Vet

If symptoms don''t improve after 7-10 days of treatment, consult an aquatic veterinarian.
    ','https://placehold.co/800x400/dc2626/ffffff?text=Ich+Treatment+Guide','Health','{}'::text[],'Aurora Betta Farm','6 min read',array['how-to-care-for-betta-fish','best-water-temperature-for-betta']::text[],true,'2025-05-15','How to Treat Ich (White Spot Disease) in Betta Fish | Aurora Betta Farm','Step-by-step guide to treating white spot disease (Ich) in betta fish. Symptoms, treatment, and prevention tips from betta fish experts.'),
('Best Water Temperature for Betta Fish: Complete Guide','best-water-temperature-for-betta','Maintaining the right water temperature is crucial for your betta''s health. Learn the ideal range and how to keep it stable.','
## The Ideal Temperature Range

Betta fish are tropical fish native to Southeast Asia. They thrive in water temperatures between **24-28°C (76-82°F)**.

### Temperature Breakdown
- **Too Cold** (below 22°C): Lethargy, weakened immune system, stress
- **Cool** (22-24°C): Reduced activity, slower metabolism
- **Ideal** (24-28°C): Active, healthy, vibrant colors
- **Warm** (28-30°C): Acceptable short-term, increased metabolism
- **Too Hot** (above 30°C): Stress, reduced oxygen, dangerous

## Why Temperature Matters

### Metabolism
Bettas are ectothermic — their body temperature matches their water. Cold water slows their metabolism, digestion, and immune response.

### Disease Prevention
Consistent, warm temperatures help prevent diseases like:
- Ich (white spot disease)
- Fin rot
- Velvet disease
- Fungal infections

## How to Maintain Temperature

### Use a Heater
- Invest in an adjustable aquarium heater
- Choose a heater rated for your tank size (5 watts per gallon)
- Set to 26°C (78°F) for most bettas

### Monitor with a Thermometer
- Use a digital thermometer for accuracy
- Check temperature at least once daily
- Place thermometer away from the heater

### Avoid Temperature Swings
- Keep tank away from windows and AC vents
- Don''t place tank in direct sunlight
- Use a heater with a built-in thermostat
- Temperature changes should not exceed 2°C per day

## Seasonal Considerations

In Thailand, room temperature is often suitable for bettas. However, in air-conditioned rooms, a heater is still recommended to maintain consistent temperatures.
    ','https://placehold.co/800x400/06b6d4/ffffff?text=Water+Temperature','Care Guide','{}'::text[],'Aurora Betta Farm','5 min read',array['how-to-care-for-betta-fish','how-to-treat-ich-white-spot-disease']::text[],true,'2025-05-10','Best Water Temperature for Betta Fish (2025 Guide) | Aurora Betta Farm','What''s the ideal water temperature for betta fish? Learn the perfect range, how to maintain it, and why it matters for your betta''s health.'),
('Betta Fish Feeding Guide: What, How Much & How Often','betta-feeding-guide','A complete guide to feeding your betta fish. Learn the best foods, proper portions, and feeding schedules for a healthy betta.','
## What Do Betta Fish Eat?

Betta fish are carnivores. In the wild, they eat insects, larvae, and small crustaceans. In captivity, provide a protein-rich diet.

### Best Foods for Bettas

#### Primary Diet (Daily)
- **Betta Pellets**: Choose high-quality pellets with protein as the first ingredient
- Recommended brands: Hikari Betta Bio-Gold, New Life Spectrum

#### Supplementary Foods (2-3 times per week)
- **Frozen Bloodworms**: Excellent protein source
- **Frozen Brine Shrimp**: Good variety
- **Freeze-dried Daphnia**: Aids digestion

#### Occasional Treats
- Live mosquito larvae
- Live brine shrimp
- Blanched peas (for constipation)

## How Much to Feed

A betta''s stomach is approximately the size of its eye. Overfeeding is the #1 mistake.

### Portion Guide
- **Pellets**: 2-3 pellets per feeding
- **Frozen foods**: A small pinch (1/4 of a cube)
- **Total daily food**: Should be consumed within 2 minutes

## Feeding Schedule

| Day | Morning | Evening |
|-----|---------|---------|
| Mon | Pellets | Pellets |
| Tue | Pellets | Bloodworms |
| Wed | Pellets | Pellets |
| Thu | Pellets | Brine Shrimp |
| Fri | Pellets | Pellets |
| Sat | Pellets | Daphnia |
| Sun | **Fast Day** | **Fast Day** |

## Signs of Overfeeding
- Bloated belly
- Uneaten food in tank
- Cloudy water
- Constipation
- Lethargy

## Tips
1. Remove uneaten food after 2 minutes
2. Soak pellets briefly before feeding for easier digestion
3. Vary the diet for optimal nutrition
4. Fast one day per week to prevent digestive issues
    ','https://placehold.co/800x400/16a34a/ffffff?text=Feeding+Guide','Care Guide','{}'::text[],'Aurora Betta Farm','6 min read',array['how-to-care-for-betta-fish','breeding-betta-fish-basics']::text[],true,'2025-05-05','Betta Fish Feeding Guide: Diet, Portions & Schedule | Aurora Betta Farm','What should you feed your betta fish? Complete feeding guide with recommended foods, portions, and weekly schedule. Avoid overfeeding mistakes.'),
('Breeding Betta Fish: A Beginner''s Guide','breeding-betta-fish-basics','Interested in breeding betta fish? This guide covers the basics of betta breeding, from selecting pairs to raising fry.','
## Before You Start

Breeding betta fish is rewarding but challenging. Before starting, consider:
- You''ll need multiple tanks (breeding tank, grow-out tanks)
- A single spawn can produce 50-300 fry
- You need homes for all the babies
- The process takes 3-4 months from spawn to sellable size

## Selecting a Breeding Pair

### Male Selection
- Healthy, active, vibrant colors
- Strong fins without damage
- 4-12 months old
- Builds bubble nests (sign of readiness)

### Female Selection
- Healthy with visible egg spot (ovipositor)
- Slightly rounded belly when conditioned
- 4-12 months old
- Similar size to the male

## Conditioning

2 weeks before breeding:
- Feed both fish high-protein foods (live/frozen)
- Increase feeding to 3-4 times daily
- Maintain pristine water quality
- Keep at 27°C (80°F)

## The Breeding Tank

- **Size**: 10 gallons minimum
- **Water level**: 15cm (6 inches) deep
- **Temperature**: 27-28°C
- **Filter**: Sponge filter (gentle)
- **Decorations**: Indian almond leaf, floating plants
- **No substrate**: Makes it easier to see eggs

## The Breeding Process

1. **Introduce the female** in a clear container inside the breeding tank
2. **Male builds bubble nest** (usually within 24 hours)
3. **Release the female** when she shows vertical breeding stripes
4. **Spawning** occurs under the bubble nest (wrapping embrace)
5. **Remove the female** immediately after spawning
6. **Male tends eggs** in the bubble nest
7. **Remove the male** once fry are free-swimming (2-3 days)

## Raising Fry

- First food: Infusoria or liquid fry food (days 1-7)
- Second food: Baby brine shrimp (days 7-30)
- Transition to: Crushed pellets (day 30+)
- Separate males at 8-12 weeks when aggression starts

## Tips for Success
1. Never rush the conditioning phase
2. Always have a backup plan for the female''s safety
3. Indian almond leaves improve water conditions
4. Maintain excellent water quality in the fry tank
    ','https://placehold.co/800x400/7c3aed/ffffff?text=Breeding+Guide','Breeding','{}'::text[],'Aurora Betta Farm','10 min read',array['types-of-betta-fish','betta-feeding-guide']::text[],true,'2025-04-28','How to Breed Betta Fish: Beginner''s Guide | Aurora Betta Farm','Complete guide to breeding betta fish. Learn pair selection, conditioning, spawning process, and fry care. Expert tips from Aurora Betta Farm.'),
('Types of Betta Fish: Halfmoon, Crowntail, Giant & More','types-of-betta-fish','Explore the stunning variety of betta fish types. From elegant Halfmoons to fierce Plakats, discover which betta is right for you.','
## Popular Betta Fish Types

### 1. Halfmoon (HM)
The Halfmoon betta is named for its tail that spreads a full 180 degrees, forming a half-moon shape.

- **Tail spread**: 180° or more
- **Difficulty**: Intermediate
- **Price range**: ฿300-800
- **Best for**: Show competitions, display tanks
- **Care note**: Large fins make them slower swimmers; avoid strong currents

### 2. Crowntail (CT)
Crowntail bettas have extended fin rays that create a crown-like appearance.

- **Tail type**: Spiked, crown-like rays
- **Difficulty**: Beginner
- **Price range**: ฿200-400
- **Best for**: Beginners, unique appearance
- **Care note**: Fin rays can be delicate; maintain clean water

### 3. Plakat (PK)
Plakat bettas have short fins and are closest to wild betta fish in appearance.

- **Tail type**: Short, round
- **Difficulty**: Beginner
- **Price range**: ฿200-600
- **Best for**: Active fish lovers, community considerations
- **Care note**: Most active betta type; great jumpers — need a lid!

### 4. Giant Betta
Giant bettas are selectively bred to reach 7-12cm, much larger than standard bettas (5-7cm).

- **Size**: 7-12cm
- **Difficulty**: Advanced
- **Price range**: ฿800-2,000+
- **Best for**: Experienced keepers, centerpiece fish
- **Care note**: Need larger tanks (10+ gallons minimum)

### 5. Double Tail (DT)
Double Tail bettas have a split caudal fin that creates two distinct tail lobes.

- **Tail type**: Split into two lobes
- **Difficulty**: Intermediate
- **Price range**: ฿300-500
- **Best for**: Collectors, unique display
- **Care note**: Prone to swim bladder issues; don''t overfeed

### 6. Dumbo Ear (Elephant Ear)
Named for their enlarged pectoral fins that resemble elephant ears.

- **Pectoral fins**: Oversized, fan-like
- **Difficulty**: Intermediate
- **Price range**: ฿400-700
- **Best for**: Visual impact, unique movement
- **Care note**: Large fins need gentle water flow

## Color Varieties

Bettas come in virtually every color:
- **Solid colors**: Red, blue, black, white, yellow
- **Bi-color**: Two distinct colors
- **Marble**: Irregular color patches that can change over time
- **Galaxy/Koi**: Multi-colored spots resembling koi fish
- **Copper/Metallic**: Shimmering metallic sheen
- **Dragon Scale**: Thick, white/metallic scaling on body

## How to Choose Your Betta

Consider these factors:
1. **Experience level**: Beginners should start with Plakat or Crowntail
2. **Tank size**: Giants need larger tanks
3. **Maintenance**: Long-finned varieties need more water changes
4. **Activity level**: Plakats are most active, Halfmoons are more sedentary
5. **Budget**: Prices vary widely based on type and quality
    ','https://placehold.co/800x400/0ea5e9/ffffff?text=Betta+Types','Education','{}'::text[],'Aurora Betta Farm','8 min read',array['how-to-care-for-betta-fish','breeding-betta-fish-basics']::text[],true,'2025-04-20','Types of Betta Fish: Complete Guide to All Varieties | Aurora Betta Farm','Explore all types of betta fish — Halfmoon, Crowntail, Plakat, Giant, Double Tail, Dumbo Ear. Compare features, difficulty, and prices.')
on conflict (slug) do update set
  title=excluded.title, excerpt=excluded.excerpt, content=excluded.content,
  cover_image=excluded.cover_image, category=excluded.category, tags=excluded.tags,
  author=excluded.author, read_time=excluded.read_time,
  related_slugs=excluded.related_slugs, published=excluded.published,
  published_at=excluded.published_at, seo_title=excluded.seo_title,
  seo_description=excluded.seo_description;
