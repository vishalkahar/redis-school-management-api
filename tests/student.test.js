const request = require('supertest');
const app = require('../app');
const { setupTestDB, getAuthToken } = require('./helpers/setup');
const School = require('../models/school.model');
const Classroom = require('../models/classroom.model');
const Student = require('../models/student.model');

describe('Student Endpoints', () => {
    setupTestDB();
    let authToken;
    let schoolId;
    let classroomId;

    beforeEach(async () => {
        // Create superadmin and get token
        await request(app)
            .post('/api/auth/register')
            .send({
                email: 'superadmin@test.com',
                password: 'Test@123',
                role: 'superadmin'
            });

        authToken = await getAuthToken(app, {
            email: 'superadmin@test.com',
            password: 'Test@123'
        });

        // Create test school and classroom
        const school = await School.create({
            name: 'Test School',
            address: { city: 'Test City' },
            contactInfo: { email: 'school@test.com' }
        });
        schoolId = school._id;

        const classroom = await Classroom.create({
            name: 'Class 1-A',
            school: schoolId,
            capacity: 30,
            grade: '1st',
            academicYear: '2024-2025'
        });
        classroomId = classroom._id;
    });

    describe('POST /api/schools/:schoolId/students', () => {
        it('should enroll a new student', async () => {
            const studentData = {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: '2018-01-01',
                gender: 'male',
                classroom: classroomId,
                guardianInfo: {
                    name: 'Jane Doe',
                    relationship: 'mother',
                    contact: '1234567890',
                    email: 'jane@test.com'
                }
            };

            const res = await request(app)
                .post(`/api/schools/${schoolId}/students`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(studentData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data).toMatchObject({
                firstName: studentData.firstName,
                lastName: studentData.lastName
            });
            expect(res.body.data.enrollmentNumber).toBeDefined();
        });

        it('should validate classroom capacity', async () => {
            // First, fill up the classroom
            const students = Array(30).fill({
                firstName: 'Test',
                lastName: 'Student',
                dateOfBirth: '2018-01-01',
                gender: 'male',
                classroom: classroomId,
                guardianInfo: {
                    name: 'Guardian',
                    relationship: 'parent',
                    contact: '1234567890',
                    email: 'guardian@test.com'
                }
            });

            await Student.create(students);
            await Classroom.findByIdAndUpdate(classroomId, { currentStudentCount: 30 });

            // Try to add one more student
            const res = await request(app)
                .post(`/api/schools/${schoolId}/students`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    firstName: 'Extra',
                    lastName: 'Student',
                    dateOfBirth: '2018-01-01',
                    gender: 'male',
                    classroom: classroomId,
                    guardianInfo: {
                        name: 'Guardian',
                        relationship: 'parent',
                        contact: '1234567890',
                        email: 'guardian@test.com'
                    }
                });

            expect(res.statusCode).toBe(400);
            expect(res.body.message).toContain('capacity');
        });
    });

    describe('POST /api/students/:studentId/transfer', () => {
        let studentId;
        let newClassroomId;

        beforeEach(async () => {
            // Create a new classroom for transfer
            const newClassroom = await Classroom.create({
                name: 'Class 1-B',
                school: schoolId,
                capacity: 30,
                grade: '1st',
                academicYear: '2024-2025'
            });
            newClassroomId = newClassroom._id;

            // Create a test student
            const student = await Student.create({
                firstName: 'Transfer',
                lastName: 'Student',
                dateOfBirth: '2018-01-01',
                gender: 'male',
                school: schoolId,
                classroom: classroomId,
                guardianInfo: {
                    name: 'Guardian',
                    relationship: 'parent',
                    contact: '1234567890',
                    email: 'guardian@test.com'
                }
            });
            studentId = student._id;
        });

        it('should transfer student to new classroom', async () => {
            const res = await request(app)
                .post(`/api/students/${studentId}/transfer`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    newClassroom: newClassroomId,
                    reason: 'Class balance'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.classroom.toString()).toBe(newClassroomId.toString());

            // Verify classroom counts
            const oldClassroom = await Classroom.findById(classroomId);
            const newClassroom = await Classroom.findById(newClassroomId);
            expect(oldClassroom.currentStudentCount).toBe(0);
            expect(newClassroom.currentStudentCount).toBe(1);
        });
    });
});