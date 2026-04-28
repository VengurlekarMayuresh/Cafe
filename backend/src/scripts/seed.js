require('dotenv').config();
const { sequelize, Product } = require('../models');

const sampleProducts = [
  { name: 'Cappuccino', price: 150.00, is_available: true },
  { name: 'Latte', price: 130.00, is_available: true },
  { name: 'Espresso', price: 100.00, is_available: true },
  { name: 'Sandwich', price: 80.00, is_available: true },
  { name: 'Croissant', price: 60.00, is_available: true },
  { name: 'Muffin', price: 50.00, is_available: true },
  { name: 'Bottled Water', price: 20.00, is_available: true },
  { name: 'Fresh Juice', price: 60.00, is_available: true },
];

const seed = async () => {
  try {
    await sequelize.sync({ force: true });
    console.log('Database synced');

    await Product.bulkCreate(sampleProducts);
    console.log('Sample products added');

    process.exit(0);
  } catch (err) {
    console.error('Seed failed:', err);
    process.exit(1);
  }
};

seed();
