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
    ['Air Max Runner', 'Lightweight breathable running shoe with responsive foam midsole and mesh upper', 129.99, 45, 'Running'],
    ['TrailBlaze Pro', 'All-terrain trail running shoe with aggressive grip outsole and waterproof upper', 109.99, 32, 'Running'],
    ['Speed Elite Marathon', 'Carbon-plate marathon racer with energy-return foam for peak performance', 199.99, 18, 'Running'],
    ['Pace Boost 2.0', 'Daily training shoe with plush cushioning and reflective details for visibility', 89.99, 61, 'Running'],
    ['Classic White Canvas', 'Timeless low-top canvas sneaker with vulcanised sole and cushioned insole', 69.99, 74, 'Casual'],
    ['Everyday Slip-On', 'Effortless laceless sneaker with elastic gusset and memory foam footbed', 49.99, 83, 'Casual'],
    ['Retro Loafer', 'Suede penny loafer with rubber crepe sole and gold bit hardware', 94.99, 51, 'Casual'],
    ["Kids' Velcro Sneakers", 'Durable kids sneaker with easy velcro fastening and non-slip rubber outsole', 39.99, 73, 'Casual'],
    ["Men's Oxford Leather", 'Full-grain leather Oxford with Goodyear welt construction and leather sole', 159.99, 22, 'Formal'],
    ["Women's Block Heel", 'Elegant block-heel pump in genuine leather with cushioned footbed', 119.99, 28, 'Formal'],
    ['Derby Brogue', 'Hand-stitched leather Derby with decorative brogue punching and rubber heel', 139.99, 15, 'Formal'],
    ["Women's Pointed Flat", 'Sleek pointed-toe ballet flat in soft nappa leather with padded lining', 99.99, 37, 'Formal'],
    ['Chelsea Boots', 'Pull-on Chelsea boot in premium leather with elastic side panels and stacked heel', 149.99, 21, 'Boots'],
    ['Rugged Ankle Boots', 'Lace-up ankle boot with Vibram outsole, steel toe cap and waterproof membrane', 129.99, 37, 'Boots'],
    ['Knee-High Riding Boots', 'Equestrian-inspired tall boot in smooth leather with inside zip', 189.99, 9, 'Boots'],
    ['Hiking Waterproof Boots', 'Gore-Tex lined hiking boot with Vibram outsole and ankle support system', 169.99, 12, 'Boots'],
    ['Leather Flip Flops', 'Genuine leather flip flop with contoured footbed and durable rubber sole', 44.99, 112, 'Sandals'],
    ['Strappy Heeled Sandals', 'Multi-strap heeled sandal in soft suede with adjustable ankle buckle', 79.99, 48, 'Sandals'],
    ['Comfort Slide Sandals', 'Cushioned recovery slide with adjustable single-strap and massage footbed', 39.99, 74, 'Sandals'],
    ['Basketball High-Top', 'High-ankle basketball shoe with lockdown lacing system and pivot point outsole', 119.99, 40, 'Sports'],
  ];
  const insertMany = db.transaction((products) => {
    for (const p of products) insert.run(...p);
  });
  insertMany(products);
}

module.exports = db;
