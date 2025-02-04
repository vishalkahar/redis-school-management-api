const express = require('express');
const router = express.Router();
const classroomController = require('../controllers/classroom.controller');
const { authenticate, authorize, schoolAccess } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter.middleware');

// Apply rate limiter to all routes
router.use(rateLimiter.createRateLimiter({}));

// Classroom routes
router.post('/schools/:schoolId/classrooms',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    classroomController.createClassroom
);

router.get('/schools/:schoolId/classrooms',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    classroomController.getClassroomsBySchool
);

router.get('/classrooms/:classroomId',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    classroomController.getClassroomById
);

router.put('/classrooms/:classroomId',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    classroomController.updateClassroom
);

router.delete('/classrooms/:classroomId',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    classroomController.deleteClassroom
);

module.exports = router;