const express = require('express');
const {
  checkAuth,
  syncUser,
} = require('../controllers/user.controller');
const router = express.Router();

const { clerkAuthMiddleware } = require('../middleware/clerk.middleware.js');

router.get('/check-auth', clerkAuthMiddleware, checkAuth);
router.post('/sync', clerkAuthMiddleware, syncUser);

module.exports = router;
