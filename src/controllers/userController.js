const User = require('../models/userModel'); // user model for DB operations
const jwt = require('jsonwebtoken'); // JWT library for token creation and verification

class UserController { // controller class grouping related user handlers
    async userLogin(req, res, next) { // POST /login handler
        try {
            const { email, password } = req.body; // read credentials from request body
            const user = await User.findOne({ email }); // find user by email
            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' }); // no user -> unauthorized
            }
            // TODO: verify password - assume comparePassword implemented on model
            // Generate access token and refresh token
            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' }); // short-lived token
            const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET; // separate refresh secret optional
            const refreshToken = jwt.sign({ id: user._id }, refreshSecret, { expiresIn: '7d' }); // longer-lived token

            // Store refresh token (simple rotation not implemented)
            user.refreshTokens = user.refreshTokens || []; // ensure array exists
            user.refreshTokens.push(refreshToken); // save issued refresh token
            await user.save(); // persist change

            res.json({ accessToken, refreshToken }); // return both tokens to client
        } catch (err) {
            next(err); // forward errors to central handler
        }
    }

    async refreshToken(req, res, next) { // POST /refresh-token handler
        try {
            const { refreshToken } = req.body; // read refresh token from request body
            if (!refreshToken) return res.status(401).json({ message: 'Missing refresh token' }); // missing token

            const refreshSecret = process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET; // secret used to sign refresh tokens
            let payload;
            try {
                payload = jwt.verify(refreshToken, refreshSecret); // verify refresh token
            } catch (e) {
                return res.status(403).json({ message: 'Invalid refresh token' }); // invalid or expired
            }

            const user = await User.findById(payload.id); // find user referenced in token
            if (!user) return res.status(404).json({ message: 'User not found' }); // user missing
            if (!user.refreshTokens || !user.refreshTokens.includes(refreshToken)) {
                return res.status(403).json({ message: 'Refresh token not recognized' }); // token not stored
            }

            const accessToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '15m' }); // issue new access token
            res.json({ accessToken }); // return new access token
        } catch (err) {
            next(err); // forward unexpected errors
        }
    }

    async logout(req, res, next) { // POST /logout handler to revoke refresh token
        try {
            const { refreshToken } = req.body; // client sends refresh token to invalidate
            if (!refreshToken) return res.status(400).json({ message: 'Missing refresh token' }); // bad request

            const user = await User.findOne({ refreshTokens: refreshToken }); // find user who holds token
            if (!user) return res.status(204).end(); // token already absent -> no content

            user.refreshTokens = user.refreshTokens.filter(t => t !== refreshToken); // remove token from list
            await user.save(); // persist removal
            res.status(204).end(); // success, no content
        } catch (err) {
            next(err); // forward error
        }
    }

    async createUser(req, res, next) { // POST / register handler
        try {
            const { name, email, password } = req.body; // read user info
            const existing = await User.findOne({ email }); // check for duplicates
            if (existing) return res.status(409).json({ message: 'User already exists' }); // conflict

            const user = await User.create({ name, email, password }); // create new user document
            res.status(201).json(user); // return created user
        } catch (err) {
            next(err); // forward error
        }
    }

    async getUsers(req, res, next) { // GET / handler to list users
        try {
            if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // require auth
            const users = await User.find();    // fetch all users
            res.json(users); // return users
        } catch (err) {
            next(err); // forward error
        }
    }

    async getUser(req, res, next) { // GET /:id handler to fetch specific user
        try {
            if (!req.user) return res.status(401).json({ message: 'Unauthorized' }); // require auth

            const userId = req.params.id; // extract id from route
            const user = await User.findById(userId); // fetch user by id

            if (!user) return res.status(404).json({ message: 'User not found' }); // not found

            res.json(user); // return user data
        } catch (err) {
            next(err); // forward error
        }
    }

    async updateUser(req, res, next) { // PUT /:id handler to update user
        try {
            const userId = req.params.id; // id to update
            const updates = req.body; // fields to update
            const user = await User.findByIdAndUpdate(userId, updates, { new: true, runValidators: true }); // update and return new doc
            if (!user) return res.status(404).json({ message: 'User not found' }); // not found
            res.json(user); // return updated user
        } catch (err) {
            next(err); // forward error
        }
    }

    async deleteUser(req, res, next) { // DELETE /:id handler to remove user
        try {
            const userId = req.params.id; // id to delete
            const user = await User.findByIdAndDelete(userId); // delete user
            if (!user) return res.status(404).json({ message: 'User not found' }); // not found
            res.status(204).end(); // success, no content
        } catch (err) {
            next(err); // forward error
        }
    }
}

module.exports = UserController; // export controller class
