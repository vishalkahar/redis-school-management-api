const Classroom = require('../models/classroom.model');
const School = require('../models/school.model');
const classroomValidator = require('../validators/classroom.validator');

class ClassroomController {
    async createClassroom(req, res) {
        try {
            // Validate request body
            const { error, value } = classroomValidator.create.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            // Verify school exists
            const school = await School.findOne({
                _id: value.school,
                isDeleted: false,
                status: 'active'
            });

            if (!school) {
                return res.status(404).json({ message: 'School not found or inactive' });
            }

            // Create classroom
            const classroom = new Classroom(value);
            await classroom.save();

            res.status(201).json({
                message: 'Classroom created successfully',
                data: classroom
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating classroom', error: error.message });
        }
    }

    async getClassroomsBySchool(req, res) {
        try {
            const { schoolId } = req.params;
            const { page = 1, limit = 10, grade } = req.query;

            const query = {
                school: schoolId,
                isDeleted: false
            };

            if (grade) {
                query.grade = grade;
            }

            const classrooms = await Classroom.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .select('-__v')
                .populate('school', 'name');

            const total = await Classroom.countDocuments(query);

            res.json({
                data: classrooms,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching classrooms', error: error.message });
        }
    }

    async getClassroomById(req, res) {
        try {
            const classroom = await Classroom.findOne({
                _id: req.params.classroomId,
                isDeleted: false
            })
                .populate('school', 'name')
                .select('-__v');

            if (!classroom) {
                return res.status(404).json({ message: 'Classroom not found' });
            }

            res.json({ data: classroom });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching classroom', error: error.message });
        }
    }

    async updateClassroom(req, res) {
        try {
            const { error, value } = classroomValidator.update.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const classroom = await Classroom.findOneAndUpdate(
                { _id: req.params.classroomId, isDeleted: false },
                { $set: value },
                { new: true }
            ).populate('school', 'name');

            if (!classroom) {
                return res.status(404).json({ message: 'Classroom not found' });
            }

            res.json({
                message: 'Classroom updated successfully',
                data: classroom
            });
        } catch (error) {
            res.status(500).json({ message: 'Error updating classroom', error: error.message });
        }
    }

    async deleteClassroom(req, res) {
        try {
            // Check if classroom has active students
            const classroom = await Classroom.findOne({
                _id: req.params.classroomId,
                isDeleted: false
            });

            if (!classroom) {
                return res.status(404).json({ message: 'Classroom not found' });
            }

            if (classroom.currentStudentCount > 0) {
                return res.status(400).json({
                    message: 'Cannot delete classroom with active students'
                });
            }

            classroom.isDeleted = true;
            await classroom.save();

            res.json({ message: 'Classroom deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting classroom', error: error.message });
        }
    }
}

module.exports = new ClassroomController();