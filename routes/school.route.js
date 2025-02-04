const express = require('express');
const router = express.Router();
const schoolController = require('../controllers/school.controller');
const { authenticate, authorize, schoolAccess } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter.middleware');

// Apply rate limiter to all routes
router.use(rateLimiter.createRateLimiter({}));

// School routes
router.post('/schools',
    authenticate,
    authorize(['superadmin']),
    schoolController.createSchool
);

router.get('/schools',
    authenticate,
    authorize(['superadmin']),
    schoolController.getAllSchools
);

router.get('/schools/:schoolId',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    schoolController.getSchoolById
);

router.put('/schools/:schoolId',
    authenticate,
    authorize(['superadmin']),
    schoolController.updateSchool
);

router.delete('/schools/:schoolId',
    authenticate,
    authorize(['superadmin']),
    schoolController.deleteSchool
);

module.exports = router;