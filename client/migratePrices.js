const { MongoClient } = require('mongodb');

const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  console.error('Please define the MONGODB_URI environment variable inside .env.local');
  process.exit(1);
}

const collectionsToUpdate = [
  'puja',
  'store',
  'offering',
  'chadhava'
];

async function main() {
  console.log('Connecting to MongoDB...');
  const client = new MongoClient(MONGODB_URI);
  await client.connect();
  console.log('Connected.');
  
  const db = client.db(); // Uses the default DB from the connection string

  for (const collectionName of collectionsToUpdate) {
    console.log(`Processing collection: ${collectionName}...`);
    const collection = db.collection(collectionName);
    
    // Find documents that have a 'price' field but no 'priceINR' field
    const cursor = collection.find({ price: { $exists: true }, priceINR: { $exists: false } });
    let count = 0;
    
    for await (const doc of cursor) {
      const updateDoc = {
        $set: {
          priceINR: doc.price
        }
      };

      // Specific logic for chadhava
      if (collectionName === 'chadhava') {
        const setFields = {};
        for (let i = 1; i <= 5; i++) {
          if (doc[`offering${i}Price`] !== undefined) {
            setFields[`offering${i}PriceINR`] = doc[`offering${i}Price`];
          }
        }
        if (Object.keys(setFields).length > 0) {
          updateDoc.$set = { ...updateDoc.$set, ...setFields };
        }
      }

      // Specific logic for packages within pujas
      if (collectionName === 'puja' && Array.isArray(doc.packages)) {
        const updatedPackages = doc.packages.map(pkg => {
          if (pkg.price !== undefined && pkg.priceINR === undefined) {
            return { ...pkg, priceINR: pkg.price };
          }
          return pkg;
        });
        updateDoc.$set.packages = updatedPackages;
      }

      await collection.updateOne({ _id: doc._id }, updateDoc);
      count++;
    }
    console.log(`Updated ${count} documents in ${collectionName}.`);
  }

  console.log('Migration completed successfully.');
  await client.close();
}

main().catch(console.error);
