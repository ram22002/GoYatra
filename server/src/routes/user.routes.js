const express = require('express');
const {
  checkAuth,
  syncUser,
} = require('../controllers/user.controller');
const router = express.Router();

router.get('/check-auth', checkAuth);
router.post('/sync', syncUser);

module.exports = router;
