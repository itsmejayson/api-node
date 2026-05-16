const mongoose = require("mongoose"); // mongoose for MongoDB connection handling
const dns = require('dns'); // DNS module to adjust resolver behavior when needed

const connectDB = async () => { // async function to establish DB connection
  try {
    // Ensure Node uses reliable DNS resolvers for SRV lookups (helps when local DNS blocks UDP queries)
    dns.setServers(['1.1.1.1', '8.8.8.8']); // prefer Cloudflare and Google DNS for SRV resolution

    await mongoose.connect(process.env.MONGO_URI); // connect using MONGO_URI from environment
    console.log("MongoDB connected"); // log success
  } catch (err) {
    console.error('MongoDB connection error:', err); // log failure details
    throw err; // rethrow so calling code can handle startup failure
  }
};

module.exports = connectDB; // export connection function