const { MongoClient } = require('mongodb');
require('dotenv').config({ path: '.env.local' });

async function checkAdmin() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.log("No MONGODB_URI found");
    return;
  }
  const client = new MongoClient(uri);
  try {
    await client.connect();
    const db = client.db();
    const admins = await db.collection("admins").find({}).toArray();
    console.log("Admins in DB:", admins);
  } catch (e) {
    console.error("Error:", e);
  } finally {
    await client.close();
  }
}

checkAdmin();
