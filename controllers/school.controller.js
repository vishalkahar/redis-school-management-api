const School = require('../models/school.model');
const schoolValidator = require('../validators/school.validator');

class SchoolController {
    async createSchool(req, res) {
        try {
            // Validate request body
            const { error, value } = schoolValidator.create.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            // Create new school
            const school = new School(value);
            await school.save();

            res.status(201).json({
                message: 'School created successfully',
                data: school
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating school', error: error.message });
        }
    }

    async getAllSchools(req, res) {
        try {
            const { page = 1, limit = 10, status } = req.query;
            const query = { isDeleted: false };

            if (status) {
                query.status = status;
            }

            const schools = await School.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .select('-__v');

            const total = await School.countDocuments(query);

            res.json({
                data: schools,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching schools', error: error.message });
        }
    }

    async getSchoolById(req, res) {
        try {
            const school = await School.findOne({
                _id: req.params.schoolId,
                isDeleted: false
            }).select('-__v');

            if (!school) {
                return res.status(404).json({ message: 'School not found' });
            }

            res.json({ data: school });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching school', error: error.message });
        }
    }

    async updateSchool(req, res) {
        try {
            const { error, value } = schoolValidator.update.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const school = await School.findOneAndUpdate(
                { _id: req.params.schoolId, isDeleted: false },
                { $set: value },
                { new: true }
            );

            if (!school) {
                return res.status(404).json({ message: 'School not found' });
            }

            res.json({
                message: 'School updated successfully',
                data: school
            });
        } catch (error) {
            res.status(500).json({ message: 'Error updating school', error: error.message });
        }
    }

    async deleteSchool(req, res) {
        try {
            const school = await School.findOneAndUpdate(
                { _id: req.params.schoolId, isDeleted: false },
                { $set: { isDeleted: true } },
                { new: true }
            );

            if (!school) {
                return res.status(404).json({ message: 'School not found' });
            }

            res.json({ message: 'School deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting school', error: error.message });
        }
    }
}

module.exports = new SchoolController();