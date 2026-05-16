const mongoose = require('mongoose'); // mongoose for schema and model definitions

const userSchema = new mongoose.Schema({ // define user document structure
    name: { // user's full name
        type: String, // string type for name
        required: true, // name is required
    },
    email: { // user's email address
        type: String, // string type for email
        required: true, // email required for account
        unique: true, // enforce unique emails
    },
    password: { // hashed password
        type: String, // stored as a string (hashed)
        required: true, // password required
    },
    refreshTokens: { // list of issued refresh tokens for this user
        type: [String], // array of token strings
        default: [] // default to empty array when user created
    },
}, {
    timestamps: true, // automatically add createdAt and updatedAt timestamps
});

const User = mongoose.model('User', userSchema); // compile the model from schema

module.exports = User; // export the model for use elsewhere