const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Food = require('./models/Food');
const Order = require('./models/Order');

dotenv.config();

const seedDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB for Seeding...\n');

    // Clear existing data (optional but good for clean seed)
    await User.deleteMany({});
    await Food.deleteMany({});
    await Order.deleteMany({});
    console.log('Cleared existing data.');

    // 1. Create Admin
    const admin = await User.create({
      name: 'Admin',
      email: 'admin@freshplate.com',
      password: 'admin123',
      phone: '0770000000',
      role: 'admin',
      isApproved: true,
      isActive: true,
    });

    // 2. Create Cooks
    const cook1 = await User.create({
      name: 'Nimali Fernando',
      email: 'cook@freshplate.com',
      password: 'cook123',
      phone: '0711111111',
      role: 'cook',
      isApproved: true,
      isActive: true,
      kitchenName: 'Nimali\'s Authentic Kitchen',
      address: { street: '45 Galle Road', city: 'Colombo' }
    });

    const cook2 = await User.create({
      name: 'Sunil Perera',
      email: 'pendingcook@freshplate.com',
      password: 'cook123',
      phone: '0722222222',
      role: 'cook',
      isApproved: false,
      isActive: true,
      kitchenName: 'Sunil\'s Spicy Flavors',
      address: { street: '12 Kandy Road', city: 'Kandy' }
    });

    // 3. Create Drivers
    const driver1 = await User.create({
      name: 'Kamal Silva',
      email: 'driver@freshplate.com',
      password: 'driver123',
      phone: '0733333333',
      role: 'driver',
      isApproved: true,
      isActive: true,
      vehicleType: 'Motorcycle',
      vehicleNumber: 'WP BCD 1234',
      isAvailable: true,
      address: { street: '1st Lane', city: 'Colombo' }
    });

    const driver2 = await User.create({
      name: 'Saman Kumara',
      email: 'pendingdriver@freshplate.com',
      password: 'driver123',
      phone: '0744444444',
      role: 'driver',
      isApproved: false,
      isActive: true,
      vehicleType: 'Bicycle',
      vehicleNumber: 'N/A',
      address: { street: 'Main St', city: 'Colombo' }
    });

    // 4. Create Customers
    const customer = await User.create({
      name: 'Kasun Bandara',
      email: 'customer@freshplate.com',
      password: 'customer123',
      phone: '0755555555',
      role: 'customer',
      isApproved: true,
      isActive: true,
      address: { street: 'No 7, Flower Road', city: 'Colombo' }
    });

    // 5. Create Foods for Cook 1
    const food1 = await Food.create({
      cook: cook1._id,
      name: 'Chicken Kottu',
      description: 'Authentic Sri Lankan street food made with chopped roti, vegetables, egg, and spicy chicken curry.',
      price: 850,
      category: 'Sri Lankan',
      image: 'https://images.unsplash.com/photo-1626776876729-bab4369a5a5a?auto=format&fit=crop&w=800&q=80',
      preparationTime: 20,
      isVegetarian: false,
      isVegan: false,
      spiceLevel: 'hot',
      isAvailable: true
    });

    const food2 = await Food.create({
      cook: cook1._id,
      name: 'Rice and Curry (Vegetable)',
      description: 'Traditional Sri Lankan rice served with dhal, beans, gotukola sambol, and papadam.',
      price: 500,
      category: 'Sri Lankan',
      image: 'https://images.unsplash.com/photo-1596797038530-2c107229654b?auto=format&fit=crop&w=800&q=80',
      preparationTime: 15,
      isVegetarian: true,
      isVegan: true,
      spiceLevel: 'medium',
      isAvailable: true
    });
    
    const food3 = await Food.create({
      cook: cook1._id,
      name: 'Watalappan',
      description: 'Delicious traditional Sri Lankan dessert made of coconut milk, jaggery, cashew nuts, and spices.',
      price: 350,
      category: 'Desserts',
      image: 'https://images.unsplash.com/photo-1551024601-bec78aea704b?auto=format&fit=crop&w=800&q=80',
      preparationTime: 5,
      isVegetarian: true,
      isVegan: false,
      spiceLevel: 'mild',
      isAvailable: true
    });

    // 6. Create Orders
    const order1 = await Order.create({
      orderNumber: 'ORD' + Date.now().toString().slice(-6),
      customer: customer._id,
      cook: cook1._id,
      driver: driver1._id,
      items: [
        { food: food1._id, name: food1.name, quantity: 2, price: food1.price },
        { food: food3._id, name: food3.name, quantity: 2, price: food3.price }
      ],
      totalAmount: (food1.price * 2) + (food3.price * 2),
      status: 'preparing',
      paymentMethod: 'cash',
      deliveryAddress: customer.address,
      specialInstructions: 'Please make the kottu extra spicy!',
      estimatedDeliveryTime: new Date(Date.now() + 45 * 60000)
    });

    const order2 = await Order.create({
      orderNumber: 'ORD' + (Date.now() + 1).toString().slice(-6),
      customer: customer._id,
      cook: cook1._id,
      items: [
        { food: food2._id, name: food2.name, quantity: 1, price: food2.price }
      ],
      totalAmount: food2.price,
      status: 'pending',
      paymentMethod: 'card',
      deliveryAddress: customer.address
    });

    console.log('✅ Seed complete! All demo data loaded.\n');
    console.log('────────────────────────────────');
    console.log('TEST ACCOUNTS:');
    console.log('  Admin:    admin@freshplate.com    (admin123)');
    console.log('  Cook:     cook@freshplate.com     (cook123)');
    console.log('  Driver:   driver@freshplate.com   (driver123)');
    console.log('  Customer: customer@freshplate.com (customer123)');
    console.log('────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
