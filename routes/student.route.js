const express = require('express');
const router = express.Router();
const studentController = require('../controllers/student.controller');
const { authenticate, authorize, schoolAccess } = require('../middleware/auth.middleware');
const rateLimiter = require('../middleware/rateLimiter.middleware');

// Apply rate limiter to all routes
router.use(rateLimiter.createRateLimiter({}));

// Student routes
router.post('/schools/:schoolId/students',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.createStudent
);

router.post('/schools/:schoolId/classrooms/:classroomId/bulk-enroll',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.bulkEnrollStudents
);

router.get('/schools/:schoolId/students',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.getStudentsBySchool
);

router.get('/students/:studentId',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.getStudentById
);

router.put('/students/:studentId',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.updateStudent
);

router.post('/students/:studentId/transfer',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.transferStudent
);

router.delete('/students/:studentId',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.deleteStudent
);

module.exports = router;