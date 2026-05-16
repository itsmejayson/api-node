const jwt = require('jsonwebtoken'); // jsonwebtoken library for token verification

module.exports = (req, res, next) => { // middleware function exported for route protection
    const authHeader = req.headers.authorization; // read Authorization header from request
    if (!authHeader) return res.status(401).json({ message: 'Missing token' }); // no header -> unauthorized

    const token = authHeader.split(' ')[1]; // extract token part from 'Bearer <token>' header
    jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => { // verify token signature and expiry
        if (err) return res.status(403).json({ message: 'Forbidden' }); // invalid token -> forbidden
        req.user = decoded; // attach decoded payload to request for downstream handlers
        next(); // proceed to next middleware or route handler
    });
};