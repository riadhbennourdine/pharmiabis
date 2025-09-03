
const { MongoClient, ServerApiVersion } = require('mongodb');
const dotenv = require('dotenv');
const { INITIAL_DATA } = require('./initialData');

dotenv.config();

const uri = process.env.MONGODB_URI;
if (!uri) {
    throw new Error('Please define the MONGODB_URI environment variable inside .env');
}

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

let db;

const seedData = async (database) => {
    try {
        const themesCollection = database.collection('themes');
        const themesCount = await themesCollection.countDocuments();
        if (themesCount === 0) {
            console.log('Seeding themes...');
            await themesCollection.insertMany(INITIAL_DATA.themes);
        }

        const systemesOrganesCollection = database.collection('systemesOrganes');
        const systemesCount = await systemesOrganesCollection.countDocuments();
        if (systemesCount === 0) {
            console.log('Seeding systemes/organes...');
            await systemesOrganesCollection.insertMany(INITIAL_DATA.systemesOrganes);
        }
    } catch (error) {
        console.error("Error during data seeding:", error);
    }
};

const connectDB = async () => {
  if (db) return db;
  try {
    await client.connect();
    // The database name is taken from the connection string
    db = client.db(); 
    console.log("Successfully connected to MongoDB.");
    
    // Seed initial data if collections are empty
    await seedData(db);
    
    return db;
  } catch(err) {
    console.error("Could not connect to MongoDB", err);
    process.exit(1);
  }
};

const getDB = () => {
  if (!db) {
    throw new Error('Database not initialized! Call connectDB first.');
  }
  return db;
};

module.exports = { connectDB, getDB };
