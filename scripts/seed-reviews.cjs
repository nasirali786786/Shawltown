const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.join(process.cwd(), 'data', 'showltown.db');
const db = new Database(dbPath);

const sampleReviews = [
  {
    product_id: 47,
    customer_id: 1,
    customer_name: 'Dr. Ayesha Malik (Lahore)',
    rating: 5,
    title: 'Exquisite weave and heavenly warmth',
    comment: 'Ordered this for a family winter wedding in Gulberg, Lahore. The needlework is unmistakably authentic and the wool is so soft against the skin. Delivered in 2 days via Trax COD.',
    is_verified_purchase: 1,
    status: 'approved'
  },
  {
    product_id: 48,
    customer_id: 2,
    customer_name: 'Zahra Tariq (Islamabad)',
    rating: 5,
    title: 'Royal Aari embroidery!',
    comment: 'The chinar leaf motifs along the border are done with unbelievable precision. Passed the ring test easily. Beautifully packaged in gift wrapping.',
    is_verified_purchase: 1,
    status: 'approved'
  },
  {
    product_id: 49,
    customer_id: 3,
    customer_name: 'Begum Pervez (Karachi)',
    rating: 5,
    title: 'True heritage piece',
    comment: 'It is rare to find pure Kingri border work of this caliber in Pakistan. Cash on delivery was seamless and the artisan team answered all my questions on WhatsApp.',
    is_verified_purchase: 1,
    status: 'approved'
  },
  {
    product_id: 52,
    customer_id: 4,
    customer_name: 'Hamza Abbasi (Rawalpindi)',
    rating: 5,
    title: 'Gift for my mother',
    comment: 'Purchased this Toosha stole as an anniversary present for my mother. She was thrilled with the drape and warmth. Highly recommended artisan store.',
    is_verified_purchase: 1,
    status: 'approved'
  }
];

const insertReview = db.prepare(`
  INSERT INTO reviews (product_id, customer_id, customer_name, rating, title, comment, is_verified_purchase, status)
  VALUES (@product_id, @customer_id, @customer_name, @rating, @title, @comment, @is_verified_purchase, @status)
`);

for (const rev of sampleReviews) {
  const exists = db.prepare('SELECT id FROM reviews WHERE product_id = ? AND customer_name = ?').get(rev.product_id, rev.customer_name);
  if (!exists) {
    insertReview.run(rev);
  }
}

console.log('Seeded verified customer reviews successfully.');
