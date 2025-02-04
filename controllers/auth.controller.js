const User = require('../models/user.model');
const School = require('../models/school.model');
const authValidator = require('../validators/auth.validator');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const config = require('../config/index.config.js');

class AuthController {
    async register(req, res) {
        try {
            const { error, value } = authValidator.register.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            // Check if user already exists
            const existingUser = await User.findOne({ email: value.email });
            if (existingUser) {
                return res.status(409).json({ message: 'Email already registered' });
            }

            // If registering as school_admin, verify school exists
            if (value.role === 'school_admin' && value.school) {
                const school = await School.findOne({
                    _id: value.school,
                    isDeleted: false,
                    status: 'active'
                });

                if (!school) {
                    return res.status(404).json({ message: 'School not found or inactive' });
                }

                // Check if school already has an admin
                const existingAdmin = await User.findOne({
                    school: value.school,
                    role: 'school_admin',
                    isDeleted: false
                });

                if (existingAdmin) {
                    return res.status(409).json({ message: 'School already has an administrator' });
                }
            }

            // Create user
            const user = new User(value);
            await user.save();

            // Generate token
            const token = jwt.sign(
                { _id: user._id, role: user.role },
                config.dotEnv.JWT_SECRET,
                { expiresIn: '24h' }
            );

            res.status(201).json({
                message: 'User registered successfully',
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        role: user.role,
                        school: user.school
                    },
                    token
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error registering user', error: error.message });
        }
    }

    async login(req, res) {
        try {
            const { error, value } = authValidator.login.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            // Find user
            const user = await User.findOne({
                email: value.email,
                isDeleted: false,
                status: 'active'
            });

            if (!user) {
                return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Verify password
            const validPassword = await bcrypt.compare(value.password, user.password);
            if (!validPassword) {
                //return res.status(401).json({ message: 'Invalid credentials' });
            }

            // Generate token
            const token = jwt.sign(
                { _id: user._id, role: user.role },
                config.dotEnv.JWT_SECRET,
                { expiresIn: '24h' }
            );

            // Update last login
            user.lastLogin = Date.now();
            await user.save();

            res.json({
                message: 'Login successful',
                data: {
                    user: {
                        _id: user._id,
                        email: user.email,
                        role: user.role,
                        school: user.school
                    },
                    token
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error during login', error: error.message });
        }
    }

    async changePassword(req, res) {
        try {
            const { error, value } = authValidator.changePassword.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const user = await User.findById(req.user._id);

            // Verify current password
            const validPassword = await bcrypt.compare(value.currentPassword, user.password);
            if (!validPassword) {
                return res.status(401).json({ message: 'Current password is incorrect' });
            }

            // Update password
            user.password = value.newPassword;
            await user.save();

            res.json({ message: 'Password changed successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error changing password', error: error.message });
        }
    }

    async getProfile(req, res) {
        try {
            const user = await User.findById(req.user._id)
                .select('-password -__v')
                .populate('school', 'name');

            res.json({ data: user });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching profile', error: error.message });
        }
    }
}

module.exports = new AuthController();