const express = require('express'); // import Express framework for routing and middleware
const mongoose = require('mongoose'); // import mongoose for MongoDB ORM (used in DB connect)
const userRoutes = require('./routes/userRoutes'); // import user routes for /api/users
const errorHandler = require('./middleware/errorHandler'); // import centralized error handler middleware
const connectDB = require('./config/db'); // import DB connection helper
require("dotenv").config(); // load environment variables from .env into process.env

const app = express(); // create Express application instance
const PORT = process.env.PORT || 5000; // port to listen on, default 5000

// Middleware
app.use(express.json()); // parse incoming JSON request bodies

// Connect to MongoDB
connectDB(); // establish database connection before handling requests

// Routes
app.use('/api/users', userRoutes); // mount user-related routes under /api/users

// Error handling middleware
app.use(errorHandler); // handle errors centrally with the imported error handler

// Start the server
app.listen(PORT, "0.0.0.0", () => {
  console.log(`Server running on port http://localhost:${PORT}`); // log server start
});