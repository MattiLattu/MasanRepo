const Database = require('better-sqlite3');
const path = require('path');

const db = new Database(path.join(__dirname, 'inventory.db'));

db.exec(`
  CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT,
    price REAL NOT NULL,
    quantity INTEGER NOT NULL DEFAULT 0,
    category TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  )
`);

const count = db.prepare('SELECT COUNT(*) as count FROM products').get();
if (count.count === 0) {
  const insert = db.prepare(
    'INSERT INTO products (name, description, price, quantity, category) VALUES (?, ?, ?, ?, ?)'
  );
  const products = [
    ['Laptop Pro 15"', 'High-performance laptop with 15" display, 16GB RAM, 512GB SSD', 999.99, 15, 'Electronics'],
    ['Wireless Headphones', 'Active noise cancelling over-ear headphones with 30h battery', 79.99, 42, 'Electronics'],
    ['USB-C Hub 7-Port', 'Multi-port USB-C hub with HDMI, USB 3.0, SD card reader', 34.99, 87, 'Electronics'],
    ['Smart Watch Series 5', 'Fitness tracking smartwatch with heart rate monitor and GPS', 249.99, 23, 'Electronics'],
    ['Bluetooth Speaker', 'Portable waterproof speaker with 360° surround sound', 59.99, 31, 'Electronics'],
    ["Men's Running Shoes", 'Lightweight breathable running shoes with cushioned sole', 89.99, 56, 'Clothing'],
    ["Women's Yoga Pants", 'High-waist stretch yoga pants with moisture-wicking fabric', 44.99, 78, 'Clothing'],
    ['Winter Jacket', 'Insulated waterproof winter jacket with faux fur hood', 129.99, 19, 'Clothing'],
    ['Cotton T-Shirt Pack (3)', 'Pack of 3 premium 100% cotton crew-neck t-shirts', 24.99, 145, 'Clothing'],
    ['Baseball Cap', 'Adjustable structured baseball cap with embroidered logo', 19.99, 63, 'Clothing'],
    ['Organic Coffee Beans 1kg', 'Single-origin organic Arabica coffee beans, medium roast', 18.99, 92, 'Food'],
    ['Protein Bars Box (12)', 'High-protein snack bars, 20g protein each, mixed flavors', 29.99, 48, 'Food'],
    ['Green Tea Collection', 'Assorted premium loose-leaf green teas from Japan', 14.99, 67, 'Food'],
    ['Dark Chocolate Premium', '72% cocoa dark chocolate bars, ethically sourced', 12.99, 114, 'Food'],
    ['Mixed Nuts 500g', 'Premium roasted mixed nuts: almonds, cashews, walnuts', 15.99, 73, 'Food'],
    ['Indoor Plant Pot Set', 'Set of 3 ceramic plant pots with drainage holes, various sizes', 34.99, 29, 'Home & Garden'],
    ['Garden Tool Kit', '5-piece stainless steel garden tool set with ergonomic handles', 49.99, 17, 'Home & Garden'],
    ['Scented Candle Set', 'Set of 4 soy wax scented candles: lavender, vanilla, cedar, citrus', 22.99, 84, 'Home & Garden'],
    ['Yoga Mat', 'Non-slip 6mm thick exercise mat with carrying strap, 183x61cm', 39.99, 52, 'Sports'],
    ['Water Bottle Insulated', '1L double-wall vacuum insulated stainless steel water bottle', 27.99, 96, 'Sports'],
  ];
  const insertMany = db.transaction((products) => {
    for (const p of products) insert.run(...p);
  });
  insertMany(products);
}

module.exports = db;
