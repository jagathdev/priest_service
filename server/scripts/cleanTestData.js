import 'dotenv/config';
import mongoose from 'mongoose';
import User from '../src/models/user.js';
import Puja from '../src/models/pujaModel.js';
import Order from '../src/models/Order.js';

async function clean() {
  await mongoose.connect(process.env.MONGO_URI);
  await User.deleteMany({ mobileNumber: { $regex: /^9876543/ } });
  await User.deleteMany({ mobileNumber: '9988776655' });
  await Puja.deleteMany({ title: 'Ganesh Mahapuja Test' });
  console.log('Cleaned test data');
  process.exit(0);
}

clean().catch(console.error);
