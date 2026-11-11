import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const mongoUri = process.env.MONGO_URI || 'mongodb://Jagath9360:Jagath9360@ac-h6qynjc-shard-00-00.qzfl7jl.mongodb.net:27017,ac-h6qynjc-shard-00-01.qzfl7jl.mongodb.net:27017,ac-h6qynjc-shard-00-02.qzfl7jl.mongodb.net:27017/PriestServices?ssl=true&replicaSet=atlas-13y4kk-shard-0&authSource=admin&appName=Jagath';

async function run() {
  await mongoose.connect(mongoUri);
  const collections = await mongoose.connection.db.collections();
  const allImages = new Set();

  for (const col of collections) {
    const docs = await col.find({}).toArray();
    const str = JSON.stringify(docs);
    const matches = str.match(/([a-zA-Z0-9_\-\.]+\.(?:png|jpg|jpeg|webp|svg|gif))/gi) || [];
    for (const m of matches) {
      allImages.add(m.split('/').pop().toLowerCase());
    }
  }

  console.log('TOTAL_IMAGES_FOUND_IN_DB:', allImages.size);
  console.log(JSON.stringify(Array.from(allImages)));
  process.exit(0);
}

run().catch(e => {
  console.error('Error:', e.message);
  process.exit(1);
});

