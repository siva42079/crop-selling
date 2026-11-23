// ── Categories (8 product categories + Blogs menu entry) ─────────────────────
export const CATEGORIES = [
  {
    slug: 'seeds',
    name: 'Seeds',
    icon: '🌾',
    image: 'https://images.unsplash.com/photo-1574943320219-553eb213f72d?auto=format&fit=crop&w=640&q=70',
    blurb: 'Hybrid paddy, cotton, chilli & vegetable seeds',
    subcategories: ['Paddy Seeds', 'Cotton Seeds', 'Vegetable Seeds', 'Maize Seeds', 'Chilli Seeds', 'Oilseed Seeds'],
  },
  {
    slug: 'crop-protection',
    name: 'Crop Protection',
    icon: '🛡️',
    image: 'https://images.unsplash.com/photo-1625246333195-78d4f61ad8dc?auto=format&fit=crop&w=640&q=70',
    blurb: 'Insecticides, fungicides, herbicides & bio-pesticides',
    subcategories: ['Insecticides', 'Fungicides', 'Herbicides', 'Bio Pesticides', 'Pheromone Traps', 'Plant Growth Regulators'],
  },
  {
    slug: 'crop-nutrition',
    name: 'Crop Nutrition',
    icon: '🧪',
    image: 'https://images.unsplash.com/photo-1464226184884-fa280b87c399?auto=format&fit=crop&w=640&q=70',
    blurb: 'Fertilizers, micronutrients & foliar sprays',
    subcategories: ['NPK Fertilizers', 'Micronutrients', 'Bio Fertilizers', 'Foliar Sprays', 'Water Soluble Fertilizers', 'Soil Conditioners'],
  },
  {
    slug: 'equipment',
    name: 'Equipment',
    icon: '🚜',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=640&q=70',
    blurb: 'Sprayers, tools, irrigation & solar pumps',
    subcategories: ['Power Sprayers', 'Knapsack Sprayers', 'Drip Irrigation', 'Hand Tools', 'Solar Pumps', 'Harvesting Tools'],
  },
  {
    slug: 'animal-husbandry',
    name: 'Animal Husbandry',
    icon: '🐄',
    image: 'https://images.unsplash.com/photo-1523348837708-15d4a09cfac2?auto=format&fit=crop&w=640&q=70',
    blurb: 'Cattle feed, mineral mixtures & poultry care',
    subcategories: ['Cattle Feed', 'Mineral Mixtures', 'Poultry Feed', 'Veterinary Care', 'Silage & Fodder', 'Dairy Supplements'],
  },
  {
    slug: 'organic',
    name: 'Organic',
    icon: '🌿',
    image: 'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=640&q=70',
    blurb: 'Vermicompost, neem cake & organic bio-inputs',
    subcategories: ['Vermicompost', 'Neem Cake', 'Organic Manure', 'Bio Pesticides', 'Organic Seeds', 'Jeevamrutham Cultures'],
  },
  {
    slug: 'fresh-produce',
    name: 'Fresh Produce',
    icon: '🍅',
    image: 'https://images.unsplash.com/photo-1560493676-04071c5f467b?auto=format&fit=crop&w=640&q=70',
    blurb: 'Farm-fresh vegetables, fruits & grains, direct to you',
    subcategories: ['Vegetables', 'Fruits', 'Grains & Pulses', 'Cold-pressed Oils', 'Spices', 'Dry Fruits'],
  },
  {
    slug: 'blogs',
    name: 'Blogs',
    icon: '📰',
    image: 'https://images.unsplash.com/photo-1500595046743-cd271d694d30?auto=format&fit=crop&w=640&q=70',
    blurb: 'Farming tips, mandi rates & government schemes',
    subcategories: ['Crop Advisory', 'Mandi Prices', 'Government Schemes', 'Success Stories', 'Organic Farming', 'Weather Updates'],
  },
];

export const getCategory = (slug) => CATEGORIES.find((c) => c.slug === slug);
