const { authenticate, authorize, schoolAccess } = require('../middleware/auth.middleware');

router.get('/schools',
    authenticate,
    authorize(['superadmin']),
    schoolController.getAllSchools
);

router.get('/schools/:schoolId/students',
    authenticate,
    authorize(['superadmin', 'school_admin']),
    schoolAccess,
    studentController.getStudentsBySchool
);