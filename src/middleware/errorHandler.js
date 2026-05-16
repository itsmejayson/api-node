module.exports = (err, req, res, next) => { // centralized error handling middleware signature
    console.error(err.stack); // log the full error stack to the console for debugging
    res.status(500).json({ // send a generic 500 response with a short error message
        message: 'An error occurred', // generic message for clients
        error: err.message // include brief error message (avoid leaking sensitive info)
    });
};