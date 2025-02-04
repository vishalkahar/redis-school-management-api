const request = require('supertest');
const app = require('../app');
const { setupTestDB, getAuthToken } = require('./helpers/setup');
const School = require('../models/school.model');
const Classroom = require('../models/classroom.model');
const mongoose = require('mongoose');

describe('Classroom Endpoints', () => {
    setupTestDB();
    let authToken;
    let schoolId;

    beforeEach(async () => {
        // Create superadmin and get token
        await request(app)
            .post('/api/register')
            .send({
                email: 'superadmin@test.com',
                password: 'Test@123',
                role: 'superadmin'
            });

        authToken = await getAuthToken(app, {
            email: 'superadmin@test.com',
            password: 'Test@123'
        });

        // Create a test school
        const school = await School.create({
            name: 'Test School',
            address: { city: 'Test City' },
            contactInfo: { email: 'school@test.com' }
        });
        schoolId = school._id;
    });

    describe('POST /api/schools/:schoolId/classrooms', () => {
        it('should create a new classroom', async () => {
            const classroomData = {
                name: 'Class 1-A',
                capacity: 30,
                grade: '1st',
                section: 'A',
                academicYear: '2024-2025',
                resources: ['projector', 'smartboard']
            };

            const res = await request(app)
                .post(`/api/schools/${schoolId}/classrooms`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(classroomData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data).toMatchObject({
                name: classroomData.name,
                capacity: classroomData.capacity,
                currentStudentCount: 0
            });
        });

        it('should validate capacity limits', async () => {
            const res = await request(app)
                .post(`/api/schools/${schoolId}/classrooms`)
                .set('Authorization', `Bearer ${authToken}`)
                .send({
                    name: 'Invalid Class',
                    capacity: 0,
                    grade: '1st',
                    academicYear: '2024-2025'
                });

            expect(res.statusCode).toBe(400);
        });
    });

    describe('GET /api/schools/:schoolId/classrooms', () => {
        beforeEach(async () => {
            // Create test classrooms
            await Classroom.create([
                {
                    name: 'Class 1-A',
                    school: schoolId,
                    capacity: 30,
                    grade: '1st',
                    academicYear: '2024-2025'
                },
                {
                    name: 'Class 1-B',
                    school: schoolId,
                    capacity: 30,
                    grade: '1st',
                    academicYear: '2024-2025'
                }
            ]);
        });

        it('should get all classrooms for a school', async () => {
            const res = await request(app)
                .get(`/api/schools/${schoolId}/classrooms`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(2);
        });

        it('should filter classrooms by grade', async () => {
            const res = await request(app)
                .get(`/api/schools/${schoolId}/classrooms`)
                .set('Authorization', `Bearer ${authToken}`)
                .query({ grade: '1st' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.every(classroom => classroom.grade === '1st')).toBe(true);
        });
    });
});