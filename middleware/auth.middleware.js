const jwt = require('jsonwebtoken');
const config = require('../config/index.config.js');
const User = require('../models/user.model');

const authMiddleware = {
    authenticate: async (req, res, next) => {
        try {
            const token = req.header('Authorization')?.replace('Bearer ', '');
            if (!token) {
                return res.status(401).json({ message: 'Authentication required' });
            }

            const decoded = jwt.verify(token, config.dotEnv.JWT_SECRET);
            const user = await User.findOne({
                _id: decoded._id,
                status: 'active',
                isDeleted: false
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid authentication' });
            }

            req.user = user;
            req.token = token;
            next();
        } catch (error) {
            res.status(401).json({ message: 'Invalid authentication' });
        }
    },

    authorize: (roles) => {
        return (req, res, next) => {
            if (!roles.includes(req.user.role)) {
                return res.status(403).json({
                    message: 'You do not have permission to perform this action'
                });
            }
            next();
        };
    },

    schoolAccess: async (req, res, next) => {
        try {
            const schoolId = req.params.schoolId || req.body.schoolId;

            // Superadmin can access all schools
            if (req.user.role === 'superadmin') {
                return next();
            }

            // School admin can only access their assigned school
            if (req.user.role === 'school_admin' &&
                req.user.school.toString() !== schoolId) {
                return res.status(403).json({
                    message: 'You can only access your assigned school'
                });
            }

            next();
        } catch (error) {
            res.status(500).json({ message: 'Server error' });
        }
    }
};

module.exports = authMiddleware;