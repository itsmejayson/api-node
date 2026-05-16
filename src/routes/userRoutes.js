const express = require('express'); // import express for router
const UserController = require('../controllers/userController'); // controller with user handlers
const authMiddleware = require('../middleware/authMiddleware'); // middleware to protect routes using JWT

const router = express.Router(); // create a router instance
const userController = new UserController(); // instantiate controller to use its methods

const rateLimit = require("express-rate-limit"); // rate limiter to protect login endpoint

const loginLimiter = rateLimit({ // limiter configuration for login attempts
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 10, // allow 10 attempts per window
});

// Public: create (register)
router.post('/', userController.createUser); // register new users (no auth required)
// Protected routes
router.get('/:id', authMiddleware, userController.getUser); // get user by id (requires auth)
router.get('/', authMiddleware, userController.getUsers); // list users (requires auth)
router.put('/:id', authMiddleware, userController.updateUser); // update user by id (requires auth)
router.delete('/:id', authMiddleware, userController.deleteUser); // delete user by id (requires auth)
router.post('/login', loginLimiter, userController.userLogin); // login with rate limiting to prevent abuse
// Token endpoints
router.post('/refresh-token', userController.refreshToken); // exchange refresh token for access token
router.post('/logout', userController.logout); // revoke refresh token / logout

module.exports = router; // export router to be mounted by the app