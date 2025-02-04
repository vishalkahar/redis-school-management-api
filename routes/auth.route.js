const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');
const { authenticate, authorize } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter.middleware');

// Apply stricter rate limiting for auth routes
const authRateLimiter = rateLimiter.createRateLimiter({
    points: 5,
    duration: 60 * 15, // 15 minutes
});

// Auth routes
router.post('/register',
    authRateLimiter,
    authenticate, // Only authenticated superadmins can register new users
    authorize(['superadmin']),
    authController.register
);

router.post('/login',
    authRateLimiter,
    authController.login
);

router.post('/change-password',
    authenticate,
    authController.changePassword
);

router.get('/profile',
    authenticate,
    authController.getProfile
);

router.post('/reset-limits',
    authenticate,
    authorize(['superadmin']),
    (req, res) => {
        authRateLimiter.resetKey(req.ip);  // Reset for specific IP
        protectedRateLimiter.resetKey(req.ip);
        res.json({ message: 'Rate limits reset successfully' });
    }
);

module.exports = router;