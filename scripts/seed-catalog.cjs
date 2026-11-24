const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'showltown.db');
const db = new Database(dbPath);

const newProducts = [
  {
    category_id: 6,
    name: 'Royal Antique Kashmiri Jamawar Pashmina Shawl',
    slug: 'royal-antique-kashmiri-jamawar-pashmina-shawl',
    sku: 'SG-JMW-01',
    short_description: 'Imperial pit-loom woven Jamawar with midnight black and antique gold paisley motifs.',
    description: 'An imperial heirloom masterpiece. Handwoven on historic pit-looms using wooden spools (Tujis), this Jamawar shawl features intricate paisley and floral motifs running seamlessly across a midnight black base with subtle antique gold thread highlights.\n\nSoft, lightweight, and offering extraordinary insulation for formal winter gatherings and wedding celebrations. Hand-finished with delicate eyelash fringes.',
    price: 14500,
    compare_at_price: 17500,
    cost_price: 9000,
    stock_quantity: 4,
    stock_status: 'in_stock',
    is_featured: 1,
    material: '100% Pure Himalayan Cashmere with Woven Silk Brocade',
    origin: 'Hand-Loomed in Srinagar, Kashmir',
    dimensions: '100 cm x 200 cm (Full Size Wrap)',
    weight_grams: 380,
    image_url: '/images/products/sui-ka-kaam-1.jpg',
    additional_images: JSON.stringify(['/images/products/sui-ka-kaam-2.jpg', '/images/products/sui-ka-kaam-3.jpg'])
  },
  {
    category_id: 6,
    name: 'Heritage Kani Weave Multi-Coloured Wool Shawl',
    slug: 'heritage-kani-weave-multi-coloured-wool-shawl',
    sku: 'SG-KNI-02',
    short_description: 'Celebrated Kani weave shawl using individual wooden bobbins for intricate jaal art.',
    description: 'Celebrated in Kashmiri textile folklore, this Kani weave shawl uses individual colour spools (kanis) to construct breathtaking geometric jaal patterns. Each square inch represents hours of calculated artisan precision, creating a reversible drape of royal distinction.\n\nWarm, breathable, and an authentic collector piece.',
    price: 12000,
    compare_at_price: 15000,
    cost_price: 7500,
    stock_quantity: 3,
    stock_status: 'low_stock',
    is_featured: 1,
    material: 'Pure Kashmiri Merino Wool',
    origin: 'Authentic Kanihama Looms, Kashmir',
    dimensions: '100 cm x 205 cm',
    weight_grams: 390,
    image_url: '/images/products/toosha-stole-1.jpg',
    additional_images: JSON.stringify(['/images/products/toosha-stole-2.jpg'])
  },
  {
    category_id: 6,
    name: 'Imperial Mughal Paisley Jamawar Shawl',
    slug: 'imperial-mughal-paisley-jamawar-shawl',
    sku: 'SG-JMW-03',
    short_description: 'High-density Mughal paisley jaal on rich burgundy wool foundation.',
    description: 'Dating back to Mughal royal court traditions, this exquisite Jamawar features high-density paisley buttis on a rich maroon-burgundy foundation. The drape is supple and hangs majestically over formal wear and wedding sherwanis alike.\n\nDry clean recommended to preserve silk luster.',
    price: 13500,
    compare_at_price: 16500,
    cost_price: 8000,
    stock_quantity: 2,
    stock_status: 'low_stock',
    is_featured: 0,
    material: 'Fine Himalayan Wool & Mulberry Silk',
    origin: 'Kashmir Valley Master Weavers',
    dimensions: '105 cm x 210 cm',
    weight_grams: 410,
    image_url: '/images/products/maroon-stole-1.jpg',
    additional_images: JSON.stringify(['/images/products/maroon-stole-2.jpg'])
  },
  {
    category_id: 2,
    name: 'Imperial Charcoal Kingri Pashmina Shawl',
    slug: 'imperial-charcoal-kingri-pashmina-shawl',
    sku: 'SG-KNG-04',
    short_description: 'Grade-A Changthangi Cashmere with hand-stitched triangular Kingri needlework.',
    description: 'Delicately edged with traditional hand-stitched Kingri triangular tooth work, this charcoal-grey piece is understated luxury. Fits effortlessly through an ordinary finger ring, testifying to the micron fineness of its spun fibers.\n\n100% natural fiber, lightweight yet intensely insulating.',
    price: 7500,
    compare_at_price: 9500,
    cost_price: 4500,
    stock_quantity: 5,
    stock_status: 'in_stock',
    is_featured: 1,
    material: 'Grade-A Changthangi Cashmere & Fine Wool',
    origin: 'Old Srinagar Craft Guild',
    dimensions: '100 cm x 200 cm',
    weight_grams: 260,
    image_url: '/images/products/kingri-shawl-1.jpg',
    additional_images: JSON.stringify(['/images/products/kingri-shawl-2.jpg'])
  },
  {
    category_id: 2,
    name: 'Heritage Ivory Ring Pashmina Wrap',
    slug: 'heritage-ivory-ring-pashmina-wrap',
    sku: 'SG-PSH-05',
    short_description: 'Natural unbleached white cashmere shawl passing effortlessly through a finger ring.',
    description: 'The quintessence of pure luxury: natural off-white, unbleached Himalayan fleece hand-spun into an ultra-featherweight weave. Features delicate eyelash fringes along the hem and an unadulterated soft touch that caresses the skin.',
    price: 8900,
    compare_at_price: 11000,
    cost_price: 5200,
    stock_quantity: 3,
    stock_status: 'low_stock',
    is_featured: 1,
    material: '100% Unbleached Natural White Cashmere',
    origin: 'Hand-Spun in Kashmir',
    dimensions: '100 cm x 200 cm',
    weight_grams: 220,
    image_url: '/images/products/offwhite-stole-1.jpg',
    additional_images: JSON.stringify(['/images/products/offwhite-stole-2.jpg'])
  },
  {
    category_id: 3,
    name: 'Masterpiece Jaaldar Sozni Needlework Shawl',
    slug: 'masterpiece-jaaldar-sozni-needlework-shawl',
    sku: 'SG-SOZ-06',
    short_description: 'Microscopic single-strand silk needle embroidery requiring 90+ days of artisan craft.',
    description: 'A triumph of microscopic needlework. The entire body is ornamented with a dense floral Jaal using single-strand silk thread on a whisper-soft wool base. Over 90 days of continuous artisan labour are woven into this one-of-a-kind garment.',
    price: 11500,
    compare_at_price: 14000,
    cost_price: 7000,
    stock_quantity: 2,
    stock_status: 'low_stock',
    is_featured: 1,
    material: 'Pure Fine Wool with Organic Silk Thread Embroidery',
    origin: 'Heritage Sozni Ateliers, Kashmir',
    dimensions: '100 cm x 200 cm',
    weight_grams: 340,
    image_url: '/images/products/sui-ka-kaam-2.jpg',
    additional_images: JSON.stringify(['/images/products/sui-ka-kaam-1.jpg', '/images/products/sui-ka-kaam-3.jpg'])
  },
  {
    category_id: 4,
    name: 'Regal Floral Border Aari Embroidered Shawl',
    slug: 'regal-floral-border-aari-embroidered-shawl',
    sku: 'SG-AAR-07',
    short_description: 'Exuberant Kashmiri Chinar leaves and spring blossoms in concentric hook needlework.',
    description: 'Using the traditional curved awl needle (Aari), master craftsmen have embroidered exuberant Kashmiri chinar leaves and spring blossoms along the four borders in rich jewel-tone threads.\n\nSubstantial drape with graceful fall.',
    price: 7200,
    compare_at_price: 8800,
    cost_price: 4200,
    stock_quantity: 6,
    stock_status: 'in_stock',
    is_featured: 0,
    material: 'Kashmiri Wool with Concentric Hook Needle Embroidery',
    origin: 'Hand-Done in Kashmir',
    dimensions: '100 cm x 200 cm',
    weight_grams: 360,
    image_url: '/images/products/aari-work-shawl-1.jpg',
    additional_images: JSON.stringify(['/images/products/aari-work-shawl-2.jpg'])
  },
  {
    category_id: 5,
    name: 'Classic Warm Kashmiri Twill-Weave Shawl',
    slug: 'classic-warm-kashmiri-twill-weave-shawl',
    sku: 'SG-WOL-08',
    short_description: 'Heavyweight mountain winter wool wrap with hand-knotted fringe hem.',
    description: 'Engineered for deep mountain winters, this heavyweight twill weave delivers comforting warmth without itchiness. Finished with hand-knotted tassels along the border and a dense, insulating weave.',
    price: 4800,
    compare_at_price: 5800,
    cost_price: 2800,
    stock_quantity: 10,
    stock_status: 'in_stock',
    is_featured: 0,
    material: '100% Heavy Winter Wool',
    origin: 'Handcrafted in Kashmir',
    dimensions: '115 cm x 230 cm (Generous Gents & Ladies Wrap)',
    weight_grams: 480,
    image_url: '/images/products/kashmiri-woolen-shawl-1.jpg',
    additional_images: JSON.stringify(['/images/products/kashmiri-woolen-shawl-2.jpg'])
  },
  {
    category_id: 1,
    name: 'Contemporary Midnight Embroidered Wool Stole',
    slug: 'contemporary-midnight-embroidered-wool-stole',
    sku: 'SG-STL-09',
    short_description: 'Sleek, lightweight evening stole with fine Kashmiri floral borders.',
    description: 'Sleek and versatile for modern urban wear. Drape over formal coats or traditional eastern outfits for instant panache. Soft against the neck with zero bulkiness.',
    price: 2900,
    compare_at_price: 3500,
    cost_price: 1600,
    stock_quantity: 8,
    stock_status: 'in_stock',
    is_featured: 0,
    material: 'Soft Merino Blend with Subtle Border Work',
    origin: 'Handloom Weave, Kashmir',
    dimensions: '70 cm x 200 cm (Slim Evening Stole)',
    weight_grams: 180,
    image_url: '/images/products/black-stole-1.jpg',
    additional_images: JSON.stringify(['/images/products/black-stole-2.jpg', '/images/products/black-stole-3.jpg'])
  }
];

const insertStmt = db.prepare(`
  INSERT INTO products (
    category_id, name, slug, sku, short_description, description,
    price, compare_at_price, cost_price, stock_quantity, stock_status,
    is_featured, is_active, material, origin, dimensions, weight_grams,
    image_url, additional_images
  ) VALUES (
    @category_id, @name, @slug, @sku, @short_description, @description,
    @price, @compare_at_price, @cost_price, @stock_quantity, @stock_status,
    @is_featured, 1, @material, @origin, @dimensions, @weight_grams,
    @image_url, @additional_images
  )
`);

let count = 0;
for (const p of newProducts) {
  const existing = db.prepare('SELECT id FROM products WHERE slug = ?').get(p.slug);
  if (!existing) {
    insertStmt.run(p);
    count++;
  }
}

console.log(`Successfully seeded ${count} authentic products.`);

// Also verify product counts per category now
const stats = db.prepare(`
  SELECT c.id, c.name, COUNT(p.id) as product_count
  FROM categories c
  LEFT JOIN products p ON c.id = p.category_id AND p.is_active = 1
  GROUP BY c.id
`).all();

console.log('Category Counts:', stats);
