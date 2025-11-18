require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const User = require('./server/models/User');

async function run() {
  const mongoUri = process.env.MONGO_URI;

  if (!mongoUri) {
    console.error('MONGO_URI is not defined in environment variables.');
    process.exit(1);
  }

  try {
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    const email = 'admin@gmail.com';
    const password = 'Admin1234';

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      console.log('Admin already exists');
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await User.create({
      name: 'Admin',
      email,
      password: hashedPassword,
      role: 'admin',
    });

    console.log('Admin created successfully');
  } catch (err) {
    console.error('Error creating admin user:', err.message);
  } finally {
    await mongoose.disconnect();
    process.exit();
  }
}

run();
