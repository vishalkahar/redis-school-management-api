const Student = require('../models/student.model');
const Classroom = require('../models/classroom.model');
const School = require('../models/school.model');
const studentValidator = require('../validators/student.validator');

class StudentController {
    async createStudent(req, res) {
        try {
            const { error, value } = studentValidator.create.validate(req.body);
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

            // Verify classroom exists and has capacity
            if (value.classroom) {
                const classroom = await Classroom.findOne({
                    _id: value.classroom,
                    school: value.school,
                    isDeleted: false
                });

                if (!classroom) {
                    return res.status(404).json({ message: 'Classroom not found' });
                }

                if (classroom.currentStudentCount >= classroom.capacity) {
                    return res.status(400).json({ message: 'Classroom is at full capacity' });
                }

                // Update classroom count
                await Classroom.findByIdAndUpdate(value.classroom, {
                    $inc: { currentStudentCount: 1 }
                });
            }

            // Create student
            const student = new Student({
                ...value,
                academicRecord: [{
                    year: new Date().getFullYear().toString(),
                    classroom: value.classroom,
                    status: 'active'
                }]
            });

            await student.save();

            res.status(201).json({
                message: 'Student created successfully',
                data: student
            });
        } catch (error) {
            res.status(500).json({ message: 'Error creating student', error: error.message });
        }
    }

    async getStudentsBySchool(req, res) {
        try {
            const { schoolId } = req.params;
            const {
                page = 1,
                limit = 10,
                search,
                classroom,
                status = 'active'
            } = req.query;

            const query = {
                school: schoolId,
                isDeleted: false
            };

            if (search) {
                query.$or = [
                    { firstName: new RegExp(search, 'i') },
                    { lastName: new RegExp(search, 'i') },
                    { enrollmentNumber: new RegExp(search, 'i') }
                ];
            }

            if (classroom) {
                query.classroom = classroom;
            }

            if (status) {
                query['academicRecord.status'] = status;
            }

            const students = await Student.find(query)
                .skip((page - 1) * limit)
                .limit(parseInt(limit))
                .select('-__v')
                .populate('classroom', 'name grade')
                .sort({ lastName: 1, firstName: 1 });

            const total = await Student.countDocuments(query);

            res.json({
                data: students,
                pagination: {
                    total,
                    page: parseInt(page),
                    pages: Math.ceil(total / limit)
                }
            });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching students', error: error.message });
        }
    }

    async transferStudent(req, res) {
        try {
            const { error, value } = studentValidator.transfer.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            const student = await Student.findOne({
                _id: req.params.studentId,
                isDeleted: false
            });

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            // Verify new classroom exists and has capacity
            const newClassroom = await Classroom.findOne({
                _id: value.newClassroom,
                school: student.school,
                isDeleted: false
            });

            if (!newClassroom) {
                return res.status(404).json({ message: 'New classroom not found' });
            }

            if (newClassroom.currentStudentCount >= newClassroom.capacity) {
                return res.status(400).json({ message: 'New classroom is at full capacity' });
            }

            // Update old classroom count
            if (student.classroom) {
                await Classroom.findByIdAndUpdate(student.classroom, {
                    $inc: { currentStudentCount: -1 }
                });
            }

            // Update new classroom count
            await Classroom.findByIdAndUpdate(value.newClassroom, {
                $inc: { currentStudentCount: 1 }
            });

            // Update student record
            student.classroom = value.newClassroom;
            student.academicRecord.push({
                year: new Date().getFullYear().toString(),
                classroom: value.newClassroom,
                status: 'active'
            });

            await student.save();

            res.json({
                message: 'Student transferred successfully',
                data: student
            });
        } catch (error) {
            res.status(500).json({ message: 'Error transferring student', error: error.message });
        }
    }

    async getStudentById(req, res) {
        try {
            const student = await Student.findOne({
                _id: req.params.studentId,
                isDeleted: false
            })
                .populate('school', 'name')
                .populate('classroom', 'name grade section')
                .select('-__v');

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            res.json({ data: student });
        } catch (error) {
            res.status(500).json({ message: 'Error fetching student', error: error.message });
        }
    }

    async updateStudent(req, res) {
        try {
            const { error, value } = studentValidator.update.validate(req.body);
            if (error) {
                return res.status(400).json({ message: error.details[0].message });
            }

            // If classroom is being changed, verify capacity
            if (value.classroom) {
                const newClassroom = await Classroom.findOne({
                    _id: value.classroom,
                    isDeleted: false
                });

                if (!newClassroom) {
                    return res.status(404).json({ message: 'New classroom not found' });
                }

                if (newClassroom.currentStudentCount >= newClassroom.capacity) {
                    return res.status(400).json({ message: 'Classroom is at full capacity' });
                }

                // Get current student data to update classroom counts
                const currentStudent = await Student.findById(req.params.studentId);
                if (currentStudent.classroom) {
                    // Decrease count in old classroom
                    await Classroom.findByIdAndUpdate(currentStudent.classroom, {
                        $inc: { currentStudentCount: -1 }
                    });
                }

                // Increase count in new classroom
                await Classroom.findByIdAndUpdate(value.classroom, {
                    $inc: { currentStudentCount: 1 }
                });
            }

            const student = await Student.findOneAndUpdate(
                { _id: req.params.studentId, isDeleted: false },
                { $set: value },
                { new: true }
            )
                .populate('school', 'name')
                .populate('classroom', 'name grade section');

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            res.json({
                message: 'Student updated successfully',
                data: student
            });
        } catch (error) {
            res.status(500).json({ message: 'Error updating student', error: error.message });
        }
    }

    async deleteStudent(req, res) {
        try {
            const student = await Student.findOne({
                _id: req.params.studentId,
                isDeleted: false
            });

            if (!student) {
                return res.status(404).json({ message: 'Student not found' });
            }

            // Update classroom count
            if (student.classroom) {
                await Classroom.findByIdAndUpdate(student.classroom, {
                    $inc: { currentStudentCount: -1 }
                });
            }

            // Soft delete the student
            student.isDeleted = true;
            student.academicRecord[student.academicRecord.length - 1].status = 'withdrawn';
            await student.save();

            res.json({ message: 'Student deleted successfully' });
        } catch (error) {
            res.status(500).json({ message: 'Error deleting student', error: error.message });
        }
    }

    async bulkEnrollStudents(req, res) {
        try {
            const { students } = req.body;
            const { schoolId, classroomId } = req.params;

            // Verify school and classroom
            const classroom = await Classroom.findOne({
                _id: classroomId,
                school: schoolId,
                isDeleted: false
            });

            if (!classroom) {
                return res.status(404).json({ message: 'Classroom not found' });
            }

            // Check if classroom has enough capacity
            if (classroom.currentStudentCount + students.length > classroom.capacity) {
                return res.status(400).json({ message: 'Classroom capacity exceeded' });
            }

            // Process students
            const enrolledStudents = await Promise.all(students.map(async (studentData) => {
                const { error } = studentValidator.create.validate({
                    ...studentData,
                    school: schoolId,
                    classroom: classroomId
                });

                if (error) throw new Error(`Validation failed for student: ${error.message}`);

                const student = new Student({
                    ...studentData,
                    school: schoolId,
                    classroom: classroomId,
                    academicRecord: [{
                        year: new Date().getFullYear().toString(),
                        classroom: classroomId,
                        status: 'active'
                    }]
                });

                return student.save();
            }));

            // Update classroom count
            await Classroom.findByIdAndUpdate(classroomId, {
                $inc: { currentStudentCount: enrolledStudents.length }
            });

            res.status(201).json({
                message: 'Students enrolled successfully',
                data: enrolledStudents
            });
        } catch (error) {
            res.status(500).json({ message: 'Error enrolling students', error: error.message });
        }
    }
}

module.exports = new StudentController();