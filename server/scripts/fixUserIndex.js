import 'dotenv/config';
import mongoose from 'mongoose';

async function fixUserIndex() {
  await mongoose.connect(process.env.MONGO_URI);
  const collection = mongoose.connection.collection('users');
  try {
    await collection.dropIndex('email_1');
    console.log('Dropped old email_1 index');
  } catch (e) {
    console.log('Drop note:', e.message);
  }
  const unsetOp = {};
  unsetOp['$unset'] = { email: 1 };
  await collection.updateMany({ email: '' }, unsetOp);
  console.log('Unset empty emails');
  await collection.createIndex({ email: 1 }, { unique: true, sparse: true });
  console.log('Created sparse unique index for email');
  process.exit(0);
}

fixUserIndex().catch(err => {
  console.error(err);
  process.exit(1);
});
