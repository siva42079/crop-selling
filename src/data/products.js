// ── Product catalogue (48 products across all categories) ─────────────────────
// A small helper keeps pack sizes DRY: sizes are [label, priceMultiplier] pairs
// and MRPs are derived from the product's base MRP with the same multiplier.
import { discountPct } from './constants';

const img = (id) => `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=640&q=70`;
const FIELD = img('1464226184884-fa280b87c399');  // green crop field
const WHEAT = img('1574943320219-553eb213f72d');  // wheat field
const TRACTOR = img('1500595046743-cd271d694d30'); // tractor in farm
const FARMER = img('1625246333195-78d4f61ad8dc'); // farmer with tablet
const SEEDLING = img('1523348837708-15d4a09cfac2'); // seedling in hands
const GARDEN = img('1416879595882-3373a0480b5b'); // gardening / planting
const CROPROWS = img('1560493676-04071c5f467b');   // aerial crop rows
const SPRAY = img('1592982537447-7440770cbfc9');   // crop spraying

let counter = 0;

/**
 * Build a fully-formed product object.
 * sizes: [[label, multiplier], ...] — first size is the default/displayed price.
 */
function makeProduct({
  name, brand, category, crop = null, image,
  basePrice, mrp, rating, reviewCount, stock,
  description, usage, tags = [],
  sizes = [['250 g', 1], ['500 g', 1.8], ['1 kg', 3.2]],
  deal = false, bestSeller = false, isNew = false, bought = 0,
}) {
  counter += 1;
  const packSizes = sizes.map(([label, m]) => ({
    label,
    price: Math.round(basePrice * m),
    mrp: Math.round(mrp * m),
  }));
  const price = packSizes[0].price;
  const packMrp = packSizes[0].mrp;
  return {
    id: `p-${String(counter).padStart(3, '0')}`,
    name,
    brand,
    category,
    crop,
    image,
    price,
    mrp: packMrp,
    discount: discountPct(price, packMrp),
    rating,
    reviewCount,
    packSizes,
    stock,
    description,
    usage,
    tags,
    deal,
    bestSeller,
    isNew,
    bought, // "X bought in last month" social proof
  };
}

export const PRODUCTS = [
  // ── SEEDS (1–7) ───────────────────────────────────────────────────────────
  makeProduct({
    name: 'Pioneer Arize 6444 Gold Paddy Hybrid Seeds', brand: 'pioneer', category: 'seeds', crop: 'paddy',
    image: WHEAT, basePrice: 640, mrp: 800, rating: 4.7, reviewCount: 2314, stock: 240,
    description: 'High-yielding paddy hybrid with excellent tillering, drought tolerance and blast disease resistance. Suitable for irrigated and shallow rainfed conditions across the kharif season.',
    usage: 'Sow 8–10 kg/acre by transplanting 21–25 day old seedlings at 20 × 15 cm spacing. Apply basal NPK as per soil test.',
    tags: ['paddy', 'hybrid', 'kharif', 'high-yield'], sizes: [['1 kg', 1], ['2 kg', 1.85], ['5 kg', 4.2]],
    bestSeller: true, deal: true, bought: 1800,
  }),
  makeProduct({
    name: 'Pioneer 30V92 Maize Hybrid Seeds', brand: 'pioneer', category: 'seeds', crop: 'maize',
    image: CROPROWS, basePrice: 890, mrp: 1100, rating: 4.6, reviewCount: 1420, stock: 180,
    description: 'Single-cross maize hybrid for grain and silage. Uniform cobs, high test weight and stay-green trait for late-season vigour.',
    usage: 'Sow 8 kg/acre at 60 × 20 cm spacing, 4–5 cm deep. Irrigate every 7–8 days in summer.',
    tags: ['maize', 'hybrid', 'grain'], sizes: [['1 kg', 1], ['3 kg', 2.6], ['5 kg', 4.0]], bought: 950,
  }),
  makeProduct({
    name: 'Mahyco Bollgard II BG-II Cotton Hybrid', brand: 'mahyco', category: 'seeds', crop: 'cotton',
    image: FIELD, basePrice: 820, mrp: 1050, rating: 4.8, reviewCount: 3102, stock: 300,
    description: 'Bollgard II double-gene Bt cotton with superior bollworm protection, longer staple length and high ginning out-turn.',
    usage: 'Sow 450 g/acre (Bt packet) at 90 × 60 cm spacing. Refugia planting of pigeonpea is mandatory.',
    tags: ['cotton', 'bt', 'kharif', 'bollworm'], sizes: [['450 g', 1]], bestSeller: true, bought: 2600,
  }),
  makeProduct({
    name: 'Mahyco Deliana F1 Chilli Hybrid Seeds', brand: 'mahyco', category: 'seeds', crop: 'chilli',
    image: SEEDLING, basePrice: 560, mrp: 720, rating: 4.5, reviewCount: 980, stock: 150,
    description: 'High-pungency red chilli hybrid with wrinkle-free fruits, deep colour and excellent dry recovery. Resistant to leaf curl virus.',
    usage: 'Nursery: sow 200 g/acre. Transplant 45-day-old seedlings at 60 × 45 cm after hardening.',
    tags: ['chilli', 'hybrid', 'spices', 'virus-resistant'], sizes: [['10 g', 1], ['50 g', 4.2], ['100 g', 7.5]], bought: 780,
  }),
  makeProduct({
    name: 'Mahyco Saaho Tomato Hybrid Seeds', brand: 'mahyco', category: 'seeds', crop: 'tomato',
    image: GARDEN, basePrice: 480, mrp: 600, rating: 4.4, reviewCount: 860, stock: 95,
    description: 'Semi-determinate tomato hybrid with firm, deep-red fruits of 80–90 g. Good shelf life and tolerance to tomato leaf curl virus.',
    usage: 'Sow in nursery beds, transplant at 60 × 45 cm. Stake plants and mulch for best results.',
    tags: ['tomato', 'vegetable', 'hybrid'], sizes: [['10 g', 1], ['50 g', 4.0], ['100 g', 7.0]], isNew: true, bought: 340,
  }),
  makeProduct({
    name: 'Mahyco Basmati Sugandha Paddy Seeds', brand: 'mahyco', category: 'seeds', crop: 'paddy',
    image: WHEAT, basePrice: 720, mrp: 900, rating: 4.3, reviewCount: 640, stock: 120,
    description: 'Aged-aroma basmati-type paddy hybrid with extra-long slender grains and strong aroma after cooking. Ideal for premium rice markets.',
    usage: 'Transplant 25-day seedlings at 20 × 15 cm. Keep 2–3 cm standing water during tillering.',
    tags: ['paddy', 'basmati', 'premium'], sizes: [['1 kg', 1], ['2 kg', 1.8], ['5 kg', 4.1]], bought: 410,
  }),
  makeProduct({
    name: 'Pioneer 86M64 Maize Hybrid Seeds', brand: 'pioneer', category: 'seeds', crop: 'maize',
    image: CROPROWS, basePrice: 940, mrp: 1150, rating: 4.7, reviewCount: 520, stock: 140,
    description: 'High-oil maize hybrid optimised for poultry and feed markets. Excellent ear placement and strong stalk strength against lodging.',
    usage: 'Sow 8 kg/acre at 60 × 20 cm, dib 2 seeds per hill, thin to one after emergence.',
    tags: ['maize', 'feed', 'kharif', 'rabi'], sizes: [['1 kg', 1], ['3 kg', 2.6], ['5 kg', 4.0]], isNew: true, bought: 260,
  }),

  // ── CROP PROTECTION (8–14) ────────────────────────────────────────────────
  makeProduct({
    name: 'Bayer Nativo 300 SC Fungicide (Trifloxystrobin 25% + Tebuconazole 50%)', brand: 'bayer', category: 'crop-protection', crop: 'tomato',
    image: SPRAY, basePrice: 540, mrp: 680, rating: 4.6, reviewCount: 1750, stock: 220,
    description: 'Broad-spectrum strobilurin + triazole fungicide for early/late blight and powdery mildew in tomato and chilli. Systemic and translaminar action.',
    usage: 'Spray 200 ml/acre in 200 L water at first disease appearance. Repeat after 10–12 days. PHI 14 days.',
    tags: ['fungicide', 'blight', 'tomato', 'chilli'], sizes: [['100 ml', 1], ['250 ml', 2.1], ['500 ml', 3.8]], deal: true, bought: 1250,
  }),
  makeProduct({
    name: 'Syngenta Ampligo Insecticide (Chlorantraniliprole 10% + Lambda-cyhalothrin 5%)', brand: 'syngenta', category: 'crop-protection', crop: 'cotton',
    image: SPRAY, basePrice: 1250, mrp: 1500, rating: 4.7, reviewCount: 1340, stock: 160,
    description: 'Dual-action insecticide delivering rapid knockdown and long residual control of bollworms, armyworms and fruit borers.',
    usage: 'Spray 80 ml/acre in 200 L water. Do not spray during flowering in bee-active hours. PHI 7 days.',
    tags: ['insecticide', 'bollworm', 'cotton', 'maize'], sizes: [['100 ml', 1], ['250 ml', 2.2], ['500 ml', 4.0]], bought: 980,
  }),
  makeProduct({
    name: 'UPL Saaf Fungicide 75 WP (Mancozeb 63% + Carbendazim 12%)', brand: 'upl', category: 'crop-protection', crop: 'paddy',
    image: SPRAY, basePrice: 380, mrp: 460, rating: 4.5, reviewCount: 2210, stock: 320,
    description: 'Contact + systemic fungicide with protectant and curative action against blast, sheath blight and brown spot in paddy.',
    usage: 'Spray 300 g/acre in 200 L water. Avoid tank-mixing with alkaline products. PHI 14 days.',
    tags: ['fungicide', 'paddy', 'blast', 'broad-spectrum'], sizes: [['250 g', 1], ['500 g', 1.8], ['1 kg', 3.2]], bestSeller: true, bought: 2100,
  }),
  makeProduct({
    name: 'Rallis Contaf Plus Fungicide (Hexaconazole 5%)', brand: 'rallis', category: 'crop-protection', crop: 'paddy',
    image: SPRAY, basePrice: 290, mrp: 350, rating: 4.2, reviewCount: 1180, stock: 280,
    description: 'Systemic triazole fungicide for sheath blight, powdery mildew and rust. Absorbed and translocated within the plant.',
    usage: 'Spray 200 ml/acre in 200 L water at disease onset. Repeat in 14 days if needed. PHI 21 days.',
    tags: ['fungicide', 'sheath-blight', 'paddy', 'systemic'], sizes: [['250 ml', 1], ['500 ml', 1.8], ['1 L', 3.1]], bought: 1100,
  }),
  makeProduct({
    name: 'Sumitomo Serena Insecticide (Flonicamid 50% WG)', brand: 'sumitomo', category: 'crop-protection', crop: 'chilli',
    image: SPRAY, basePrice: 620, mrp: 800, rating: 4.4, reviewCount: 890, stock: 130,
    description: 'Selective systemic insecticide for sucking pests — aphids, whitefly and thrips. Safe on beneficial insects when used as directed.',
    usage: 'Spray 60 g/acre in 200 L water. Alternate with different mode-of-action products to delay resistance. PHI 7 days.',
    tags: ['insecticide', 'whitefly', 'chilli', 'thrips'], sizes: [['60 g', 1], ['150 g', 2.1], ['300 g', 3.6]], deal: true, bought: 700,
  }),
  makeProduct({
    name: 'UPL Pegasus Insecticide (Flonicamid 50% WG – Aphid Special)', brand: 'upl', category: 'crop-protection', crop: 'cotton',
    image: SPRAY, basePrice: 980, mrp: 1150, rating: 4.3, reviewCount: 560, stock: 90,
    description: 'Rapid-feeding-cessation insecticide against aphids and jassids in cotton and vegetables. Phytotonic side benefit reported in trials.',
    usage: 'Spray 60 g/acre at first appearance of sucking pests. Avoid spraying at >35°C afternoon heat.',
    tags: ['insecticide', 'aphids', 'cotton', 'jassid'], sizes: [['60 g', 1], ['300 g', 4.2]], isNew: true, bought: 210,
  }),
  makeProduct({
    name: 'Syngenta Amistar Top Fungicide (Azoxystrobin 18.2% + Difenoconazole 11.4%)', brand: 'syngenta', category: 'crop-protection', crop: 'tomato',
    image: SPRAY, basePrice: 1450, mrp: 1700, rating: 4.8, reviewCount: 720, stock: 75,
    description: 'Premium dual-mode fungicide for blight, anthracnose and target spot in tomato, chilli and potato. Yield and quality enhancer.',
    usage: 'Spray 200 ml/acre in 200 L water at first symptoms. Maximum 2 applications per season. PHI 14 days.',
    tags: ['fungicide', 'premium', 'tomato', 'anthracnose'], sizes: [['100 ml', 1], ['250 ml', 2.2], ['500 ml', 4.1]], isNew: true, bought: 320,
  }),

  // ── CROP NUTRITION (15–21) ────────────────────────────────────────────────
  makeProduct({
    name: 'IFFCO Nano Urea Plus Liquid Fertilizer', brand: 'iffco', category: 'crop-nutrition', crop: null,
    image: FIELD, basePrice: 240, mrp: 300, rating: 4.6, reviewCount: 3200, stock: 500,
    description: 'Nano-nitrogen liquid fertilizer (4% N) for foliar application. Reduces conventional urea requirement by up to 50% with equal or better yields.',
    usage: 'Spray 2–4 ml/L water at vegetative and flowering stages. Shake well before use. Do not mix with alkaline pesticides.',
    tags: ['nano-urea', 'nitrogen', 'foliar', 'all-crops'], sizes: [['500 ml', 1], ['1 L', 1.8]], bestSeller: true, deal: true, bought: 2900,
  }),
  makeProduct({
    name: 'Coromandel Gromor NPK 14:35:14 Complex Fertilizer', brand: 'coromandel', category: 'crop-nutrition', crop: 'paddy',
    image: FIELD, basePrice: 1350, mrp: 1600, rating: 4.5, reviewCount: 1500, stock: 260,
    description: 'High-phosphorus complex fertilizer for basal application in paddy, cotton and pulses. Balanced N-P-K with sulphur for oil and protein crops.',
    usage: 'Apply 50 kg/acre as basal dose mixed with FYM, before last ploughing. Follow with irrigation.',
    tags: ['npk', 'basal', 'paddy', 'cotton'], sizes: [['50 kg bag', 1]], bought: 1300,
  }),
  makeProduct({
    name: 'Zuari DAP Fertilizer 50 kg Bag (18-46-0)', brand: 'zuari', category: 'crop-nutrition', crop: 'maize',
    image: FIELD, basePrice: 1350, mrp: 1500, rating: 4.7, reviewCount: 2800, stock: 400,
    description: 'Di-ammonium phosphate with 18% N and 46% P₂O₅. Fast-acting phosphorus source for root establishment in cereals and oilseeds.',
    usage: 'Basal: 40–50 kg/acre near the seed furrow or broadcast before ploughing. Do not place in direct seed contact.',
    tags: ['dap', 'phosphorus', 'basal', 'maize'], sizes: [['50 kg bag', 1]], deal: true, bought: 2400,
  }),
  makeProduct({
    name: 'IFFCO Sagarika Seaweed Extract Bio-Stimulant', brand: 'iffco', category: 'crop-nutrition', crop: 'chilli',
    image: GARDEN, basePrice: 350, mrp: 430, rating: 4.4, reviewCount: 1150, stock: 210,
    description: '100% organic seaweed sap to relieve heat/moisture stress, boost flowering and improve fruit set in chilli and tomato.',
    usage: 'Spray 2 ml/L at flowering and fruit-set stages. Two sprays at 15-day interval are recommended.',
    tags: ['seaweed', 'bio-stimulant', 'flowering', 'chilli'], sizes: [['250 ml', 1], ['500 ml', 1.8], ['1 L', 3.2]], bought: 900,
  }),
  makeProduct({
    name: 'Coromandel Gromin Plus Multi-Micronutrient Mixture (Zn, Fe, Mn, B, Cu, Mo)', brand: 'coromandel', category: 'crop-nutrition', crop: null,
    image: FIELD, basePrice: 320, mrp: 400, rating: 4.3, reviewCount: 980, stock: 240,
    description: 'Chelated multi-micronutrient mixture correcting hidden hunger in vegetables and field crops. Improves chlorophyll and enzyme activity.',
    usage: 'Soil application 4 kg/acre or foliar 2 g/L at 30 and 60 DAS. Do not mix with calcium sprays.',
    tags: ['micronutrients', 'zinc', 'iron', 'vegetables'], sizes: [['1 kg', 1], ['5 kg', 4.0], ['25 kg', 16.0]], bought: 750,
  }),
  makeProduct({
    name: 'IFFCO NPK 19:19:19 Water Soluble Fertilizer', brand: 'iffco', category: 'crop-nutrition', crop: 'tomato',
    image: GARDEN, basePrice: 480, mrp: 560, rating: 4.6, reviewCount: 1890, stock: 330,
    description: 'Fully water soluble 19-19-19 grade for drip fertigation and foliar use. 100% assimilable nutrients, no residue or clogging.',
    usage: 'Drip: 2 kg/acre/week during vegetative stage. Foliar: 5 g/L solution every 10 days.',
    tags: ['19-19-19', 'water-soluble', 'drip', 'fertigation'], sizes: [['1 kg', 1], ['25 kg bag', 19.0]], bought: 1600,
  }),
  makeProduct({
    name: 'Syngenta Isabion Biostimulant (Amino Acid Complex)', brand: 'syngenta', category: 'crop-nutrition', crop: null,
    image: GARDEN, basePrice: 850, mrp: 1000, rating: 4.8, reviewCount: 640, stock: 110,
    description: 'Plant-derived amino acid biostimulant for stress recovery (transplant shock, heat, hail) and enhanced nutrient uptake.',
    usage: 'Foliar 2 ml/L or drench 250 ml/acre. Apply every 15 days during stress periods.',
    tags: ['amino-acid', 'bio-stimulant', 'stress-relief'], sizes: [['250 ml', 1], ['1 L', 3.4]], isNew: true, bought: 280,
  }),

  // ── EQUIPMENT (22–28) ─────────────────────────────────────────────────────
  makeProduct({
    name: 'UPL Neptune Knapsack Battery Sprayer 16 L with Double Nozzle', brand: 'upl', category: 'equipment', crop: null,
    image: TRACTOR, basePrice: 3200, mrp: 4200, rating: 4.5, reviewCount: 1340, stock: 85,
    description: '12V rechargeable battery sprayer with 16 L tank, 5.5 Ah battery and double brass nozzles. 4–6 hours runtime per charge, 2-year warranty.',
    usage: 'Charge 4–6 hours before first use. Use flat-fan nozzle for herbicides, hollow-cone for insecticides. Clean tank after every use.',
    tags: ['sprayer', 'battery', 'knapsack'], sizes: [['1 unit', 1]], deal: true, bought: 620,
  }),
  makeProduct({
    name: 'Coromandel Solar Drip Irrigation Kit for 1 Acre (Mainline + Laterals + Emitters)', brand: 'coromandel', category: 'equipment', crop: null,
    image: TRACTOR, basePrice: 12500, mrp: 15500, rating: 4.7, reviewCount: 430, stock: 40,
    description: 'Complete drip system — 16 mm laterals, online drippers at 0.8 Lph, filters and mainline for one acre. Saves 40–60% water vs flood irrigation.',
    usage: 'Lay sub-main along the plot edge, connect laterals per row. Flush filters weekly in hard-water areas.',
    tags: ['drip', 'irrigation', 'water-saving'], sizes: [['1 Acre kit', 1]], bought: 150,
  }),
  makeProduct({
    name: 'Coromandel Power Weeder 1.2 HP (2-Stroke, 32 CC)', brand: 'coromandel', category: 'equipment', crop: null,
    image: TRACTOR, basePrice: 15800, mrp: 18500, rating: 4.4, reviewCount: 310, stock: 25,
    description: 'Lightweight 1.2 HP power weeder for inter-cultivation in cotton, maize and orchards. 32 CC 2-stroke engine, rotary tiller attachment included.',
    usage: 'Mix 25:1 petrol-oil. Cultivate between rows at shallow depth (5–7 cm) to avoid root damage.',
    tags: ['power-weeder', 'inter-cultivation', '2-stroke'], sizes: [['1 unit', 1]], bought: 90,
  }),
  makeProduct({
    name: 'UPL Manual Chaff Cutter with Flywheel (For Dry & Green Fodder)', brand: 'upl', category: 'equipment', crop: null,
    image: TRACTOR, basePrice: 2350, mrp: 2800, rating: 4.2, reviewCount: 780, stock: 120,
    description: 'Heavy-duty manual chaff cutter with cast-iron base, 3-blade flywheel and fodder roller. Cuts dry stalks and green grass uniformly.',
    usage: 'Bolt firmly to a wooden platform. Feed fodder evenly; keep hands clear of the feed rollers.',
    tags: ['chaff-cutter', 'fodder', 'cattle'], sizes: [['1 unit', 1]], bought: 480,
  }),
  makeProduct({
    name: 'Coromandel Soil pH & NPK Tester Kit (Digital, with Buffer Solutions)', brand: 'coromandel', category: 'equipment', crop: null,
    image: FARMER, basePrice: 1850, mrp: 2400, rating: 4.1, reviewCount: 460, stock: 150,
    description: 'Pocket digital tester for soil pH, moisture and estimated N-P-K levels. Includes 3 buffer solutions and 20 test sheets.',
    usage: 'Take soil from 10–15 cm depth at 5 spots, mix, dissolve in distilled water, dip probe and read after 30 seconds.',
    tags: ['soil-test', 'ph', 'digital-kit'], sizes: [['1 kit', 1]], bought: 260,
  }),
  makeProduct({
    name: 'UPL Drip Lateral Pipe Kit 1 Acre (16 mm, 40 cm Dripper Spacing)', brand: 'upl', category: 'equipment', crop: null,
    image: FIELD, basePrice: 8200, mrp: 9800, rating: 4.6, reviewCount: 520, stock: 60,
    description: 'ISI-marked 16 mm LDPE laterals with in-line drippers at 40 cm spacing, 1.2 Lph. UV-stabilised for 3-season outdoor life.',
    usage: 'Connect to 32/40 mm mainline via take-off valves. Flush laterals before first use and after fertilizer doses.',
    tags: ['drip', 'lateral', 'irrigation'], sizes: [['1 Acre kit', 1]], bought: 210,
  }),
  makeProduct({
    name: 'Coromandel Harvesting Sickle – Carbon Steel (Set of 5)', brand: 'coromandel', category: 'equipment', crop: null,
    image: TRACTOR, basePrice: 450, mrp: 600, rating: 4.3, reviewCount: 1560, stock: 350,
    description: 'Forged carbon-steel sickles with serrated edge for paddy and wheat harvesting. Riveted wooden handles, anti-rust coating.',
    usage: 'Sharpen with a whetstone before season. Store dry. Ideal grip angle for standing crops.',
    tags: ['sickle', 'harvesting', 'tools'], sizes: [['Set of 5', 1]], bought: 1300,
  }),

  // ── ANIMAL HUSBANDRY (29–34) ──────────────────────────────────────────────
  makeProduct({
    name: 'IFFCO Cattle Feed Pellets 16% Protein (Dairy Special)', brand: 'iffco', category: 'animal-husbandry', crop: null,
    image: FIELD, basePrice: 700, mrp: 800, rating: 4.6, reviewCount: 1750, stock: 280,
    description: 'Balanced 16% protein pellet feed with bypass fat, minerals and biotin for 18–25 L/day dairy cows and buffaloes.',
    usage: '2–3 kg per animal per day split into two feeds, alongside green fodder and clean water.',
    tags: ['cattle-feed', 'dairy', 'pellets'], sizes: [['25 kg bag', 1], ['50 kg bag', 1.9]], bought: 1450,
  }),
  makeProduct({
    name: 'Zuari Mineral Mixture for Cattle (Calcium, Phosphorus, Trace Minerals)', brand: 'zuari', category: 'animal-husbandry', crop: null,
    image: SEEDLING, basePrice: 320, mrp: 400, rating: 4.5, reviewCount: 1150, stock: 240,
    description: 'BIS-marked mineral mixture correcting calcium–phosphorus imbalance, improving fertility, hoof health and milk fat.',
    usage: '50 g per cow per day mixed in feed. Double dose for buffaloes in peak lactation.',
    tags: ['mineral-mixture', 'dairy', 'fertility'], sizes: [['5 kg', 1], ['25 kg', 4.2]], bought: 980,
  }),
  makeProduct({
    name: 'IFFCO Poultry Layer Feed 18% Protein (Starter & Grower)', brand: 'iffco', category: 'animal-husbandry', crop: null,
    image: FIELD, basePrice: 640, mrp: 720, rating: 4.4, reviewCount: 890, stock: 190,
    description: 'Maize-soy layer mash with phytase enzyme and coccidiostat-free formula for layers aged 18–72 weeks.',
    usage: 'Feed ad-lib from week 18. Provide 110–115 g/bird/day with clean water and grit.',
    tags: ['poultry', 'layer-feed', 'eggs'], sizes: [['25 kg bag', 1], ['50 kg bag', 1.9]], bought: 720,
  }),
  makeProduct({
    name: 'Zuari Calcium Bolus for Dairy Cows (Post-Calving Care, 12 boluses)', brand: 'zuari', category: 'animal-husbandry', crop: null,
    image: SEEDLING, basePrice: 540, mrp: 650, rating: 4.7, reviewCount: 670, stock: 140,
    description: 'Fast-release calcium boluses preventing milk fever in high-yielding cows within 48 hours of calving. Vet-recommended.',
    usage: 'Give 2 boluses orally at calving and 2 more after 12 hours, with a bolusing gun.',
    tags: ['calcium', 'milk-fever', 'post-calving'], sizes: [['12 boluses', 1]], bought: 430,
  }),
  makeProduct({
    name: 'IFFCO Molasses Mineral Block 5 kg (Licking Brick for Cattle)', brand: 'iffco', category: 'animal-husbandry', crop: null,
    image: SEEDLING, basePrice: 280, mrp: 340, rating: 4.2, reviewCount: 540, stock: 170,
    description: 'Palatable molasses-based lick brick with urea, minerals and vitamins. Supports rumen function on dry fodder diets.',
    usage: 'Place near feeding trough at all times. One brick lasts a cow 3–4 weeks.',
    tags: ['mineral-block', 'urea-brick', 'ruminant'], sizes: [['5 kg block', 1]], isNew: true, bought: 190,
  }),
  makeProduct({
    name: 'Zuari Buffalo Lick Mineral Brick with Phosphorus (High Yield Formula)', brand: 'zuari', category: 'animal-husbandry', crop: null,
    image: SEEDLING, basePrice: 350, mrp: 420, rating: 4.3, reviewCount: 480, stock: 160,
    description: 'Phosphorus-enriched lick brick for buffaloes, improving estrus cycling and conception rate in seasonal breeding.',
    usage: 'Provide free access; replace when consumed to below 500 g.',
    tags: ['mineral-brick', 'buffalo', 'phosphorus'], sizes: [['5 kg brick', 1], ['10 kg brick', 1.8]], bought: 240,
  }),

  // ── ORGANIC (35–40) ───────────────────────────────────────────────────────
  makeProduct({
    name: 'IFFCO Vermicompost 40 kg (100% Organic, Enriched)', brand: 'iffco', category: 'organic', crop: null,
    image: GARDEN, basePrice: 380, mrp: 480, rating: 4.6, reviewCount: 2400, stock: 420,
    description: 'Fully composted vermicompost with 1.0–1.5% N, fine granulation and high microbial load. Ideal soil-health booster for all crops.',
    usage: 'Basal 2–3 tonnes/acre or 2 kg per planting pit. Mix with topsoil before transplanting.',
    tags: ['vermicompost', 'organic-manure', 'soil-health'], sizes: [['10 kg', 1], ['40 kg bag', 3.4]], bestSeller: true, bought: 2200,
  }),
  makeProduct({
    name: 'Coromandel Neem Cake Organic Fertilizer 25 kg (4% Azadirachtin)', brand: 'coromandel', category: 'organic', crop: null,
    image: GARDEN, basePrice: 690, mrp: 820, rating: 4.5, reviewCount: 1320, stock: 230,
    description: 'Cold-pressed neem cake granules — natural nitrification inhibitor and soil pest deterrent. Supplies NPK 5-1-1 plus limonoids.',
    usage: 'Broadcast 100–150 kg/acre before last ploughing. Also effective in planting pits for orchards.',
    tags: ['neem-cake', 'organic', 'soil-pest'], sizes: [['25 kg bag', 1]], bought: 1050,
  }),
  makeProduct({
    name: 'UPL Nimbicidine Bio Pesticide (Azadirachtin 0.15% EC)', brand: 'upl', category: 'organic', crop: null,
    image: SPRAY, basePrice: 420, mrp: 500, rating: 4.4, reviewCount: 910, stock: 200,
    description: 'Botanical bio-pesticide deterring whitefly, aphids and mites. Antifeedant and growth-regulator action, safe for IPM programmes.',
    usage: 'Spray 2–3 ml/L at first pest sighting. Repeat weekly. Do not mix with sulphur or alkaline products.',
    tags: ['neem', 'bio-pesticide', 'ipm', 'organic'], sizes: [['500 ml', 1], ['1 L', 1.8]], isNew: true, bought: 520,
  }),
  makeProduct({
    name: 'Rallis Bio-Phos Bio Fertilizer (Phosphate Solubilising Bacteria)', brand: 'rallis', category: 'organic', crop: null,
    image: SEEDLING, basePrice: 250, mrp: 300, rating: 4.1, reviewCount: 610, stock: 150,
    description: 'PSB culture converting bound soil phosphorus into plant-available forms. Reduces phosphatic fertilizer requirement by 25%.',
    usage: 'Seed treatment 10 g/kg seed or soil application 4 kg/acre mixed with FYM.',
    tags: ['bio-fertilizer', 'psb', 'phosphate'], sizes: [['1 kg', 1], ['5 kg', 4.0]], bought: 380,
  }),
  makeProduct({
    name: 'IFFCO Organic NPK Granules 6-1-2 (Fortified Manure 25 kg)', brand: 'iffco', category: 'organic', crop: null,
    image: GARDEN, basePrice: 520, mrp: 620, rating: 4.3, reviewCount: 760, stock: 210,
    description: 'Fortified organic manure combining vermicompost, poultry manure and neem cake for balanced organic nutrition.',
    usage: 'Basal 150–200 kg/acre. Water immediately after application.',
    tags: ['organic', 'npk', 'manure'], sizes: [['25 kg bag', 1]], bought: 490,
  }),
  makeProduct({
    name: 'UPL Jeevamrutham Culture Powder (Fermented Microbial Inoculant)', brand: 'upl', category: 'organic', crop: null,
    image: SEEDLING, basePrice: 180, mrp: 260, rating: 4.0, reviewCount: 430, stock: 260,
    description: 'Ready-to-use jeevamrutham powder — lactic-acid bacteria, yeast and Azotobacter to ferment FYM/water mixes for organic liquid manure.',
    usage: 'Mix 1 kg with 200 L water + 10 kg jaggery + 10 kg FYM; ferment 48 hrs; drench soil or foliar at 1:10 dilution.',
    tags: ['jeevamrutham', 'organic', 'microbial'], sizes: [['1 kg', 1]], deal: true, bought: 350,
  }),

  // ── FRESH PRODUCE (41–48) ─────────────────────────────────────────────────
  makeProduct({
    name: 'Farm Fresh Tomato – Hybrid (Sorted, Grade A)', brand: 'coromandel', category: 'fresh-produce', crop: 'tomato',
    image: CROPROWS, basePrice: 32, mrp: 45, rating: 4.5, reviewCount: 1240, stock: 500,
    description: 'Vine-ripened hybrid tomatoes, hand-sorted for size and firmness. Direct from contracted farms near Madanapalle.',
    usage: 'Store at room temperature, refrigerate only when fully ripe. Washes well for salads and curries.',
    tags: ['tomato', 'vegetable', 'grade-a'], sizes: [['1 kg', 1], ['2 kg', 1.9], ['5 kg', 4.5]], bought: 2100,
  }),
  makeProduct({
    name: 'Farm Fresh Onion – Nasik Red (Cured, Medium)', brand: 'coromandel', category: 'fresh-produce', crop: null,
    image: CROPROWS, basePrice: 28, mrp: 38, rating: 4.4, reviewCount: 1100, stock: 600,
    description: 'Cured Nasik red onions with low moisture content — long storage life, strong flavour for cooking.',
    usage: 'Store in a cool, dry, ventilated place away from potatoes. Do not refrigerate whole onions.',
    tags: ['onion', 'vegetable', 'nasik'], sizes: [['1 kg', 1], ['2 kg', 1.9], ['5 kg', 4.4]], deal: true, bought: 2300,
  }),
  makeProduct({
    name: 'Farm Fresh Potato – Jyoti (Washed)', brand: 'coromandel', category: 'fresh-produce', crop: null,
    image: CROPROWS, basePrice: 24, mrp: 32, rating: 4.3, reviewCount: 980, stock: 600,
    description: 'Washed Jyoti potatoes from Doaba, Punjab — uniform medium size, low damage, ideal for frying and curries.',
    usage: 'Store in dark, ventilated bins. Avoid sunlight exposure to prevent greening (solanine).',
    tags: ['potato', 'vegetable'], sizes: [['1 kg', 1], ['2 kg', 1.9], ['5 kg', 4.4]], bought: 1900,
  }),
  makeProduct({
    name: 'Sona Masoori Rice – Raw, Unpolished (Direct from Mill)', brand: 'coromandel', category: 'fresh-produce', crop: 'paddy',
    image: WHEAT, basePrice: 78, mrp: 105, rating: 4.7, reviewCount: 2050, stock: 800,
    description: 'Single-origin Sona Masoori from Andhra Pradesh, lightly polished, aged 3 months. Soft, fluffy texture — everyday favourite.',
    usage: 'Rinse 2–3 times. Cook 1:2 rice:water. Best within 6 months of milling.',
    tags: ['rice', 'sona-masoori', 'grains'], sizes: [['1 kg', 1], ['5 kg', 4.7], ['10 kg', 9.0]], deal: true, bought: 2600,
  }),
  makeProduct({
    name: 'Guntur Sannam Red Chilli Powder (Stone Ground, 500 g)', brand: 'coromandel', category: 'fresh-produce', crop: 'chilli',
    image: CROPROWS, basePrice: 145, mrp: 190, rating: 4.6, reviewCount: 1340, stock: 400,
    description: 'Sun-dried Guntur sannam chillies, stone-ground and double-sifted. Bright red colour with balanced heat (25,000 SHU).',
    usage: 'Store airtight away from sunlight. Use 1–2 tsp per curry serving.',
    tags: ['chilli', 'spices', 'guntur'], sizes: [['250 g', 1], ['500 g', 1.85], ['1 kg', 3.4]], bought: 1500,
  }),
  makeProduct({
    name: 'Tur Dal (Toor/Arhar) – Telangana Premium', brand: 'coromandel', category: 'fresh-produce', crop: null,
    image: WHEAT, basePrice: 135, mrp: 165, rating: 4.5, reviewCount: 1120, stock: 500,
    description: 'New-crop toor dal, hand-picked and polished. High protein, quick-cooking — staple for sambar and dal tadka.',
    usage: 'Soak 30 minutes before cooking. Pressure cook 3–4 whistles for soft dal.',
    tags: ['dal', 'pulses', 'protein'], sizes: [['1 kg', 1], ['2 kg', 1.9], ['5 kg', 4.5]], bought: 1700,
  }),
  makeProduct({
    name: 'Banganapalli Mango – Fresh (Kalepalli Orchards, 1 Dozen)', brand: 'coromandel', category: 'fresh-produce', crop: null,
    image: CROPROWS, basePrice: 650, mrp: 800, rating: 4.8, reviewCount: 890, stock: 150,
    description: 'Sweet, fibreless Banganapalli mangoes, tree-ripened without carbide. Hand-packed in ventilated cartons, 12 fruits per box.',
    usage: 'Ripen at room temperature 2–3 days. Serve chilled. Consume within 5 days of delivery.',
    tags: ['mango', 'fruit', 'seasonal'], sizes: [['1 dozen', 1], ['2 dozen', 1.9]], bought: 780,
  }),
  makeProduct({
    name: 'Cold Pressed Groundnut Oil – Wood Pressed (Kachi Ghani)', brand: 'coromandel', category: 'fresh-produce', crop: null,
    image: WHEAT, basePrice: 285, mrp: 340, rating: 4.7, reviewCount: 1480, stock: 350,
    description: 'Traditional wood-pressed (kachi ghani) groundnut oil with natural aroma and vitamin E. No refining, no preservatives.',
    usage: 'Ideal for frying, tadka and pickles. Store in a cool dark place; shake before use.',
    tags: ['groundnut', 'oil', 'cold-pressed'], sizes: [['500 ml', 1], ['1 L', 1.9], ['5 L', 8.5]], isNew: true, bought: 1250,
  }),
];

export const getProduct = (id) => PRODUCTS.find((p) => p.id === id);
