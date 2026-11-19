import mongoose from 'mongoose';

await mongoose.connect('mongodb://Jagath9360:Jagath9360@ac-h6qynjc-shard-00-00.qzfl7jl.mongodb.net:27017/PriestServices?ssl=true&replicaSet=atlas-13y4kk-shard-0&authSource=admin');

const collection = mongoose.connection.collection('media');
const allDocs = await collection.find({}).toArray();

for (const doc of allDocs) {
  const cleanFilename = doc.filename;
  const newRelativeUrl = `/assets/${cleanFilename}`;
  await collection.updateOne(
    { _id: doc._id },
    { $set: { url: newRelativeUrl } }
  );
}

console.log(`Updated ${allDocs.length} documents in MongoDB to relative /assets/<filename>`);
const check = await collection.findOne({ filename: 'Tarpanam_03.png' });
console.log('Sample verified in MongoDB:', check);

await mongoose.disconnect();
