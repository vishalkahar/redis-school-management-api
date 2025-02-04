const request = require('supertest');
const app = require('../app');
const { setupTestDB, getAuthToken } = require('./helpers/setup');
const School = require('../models/school.model');

describe('School Endpoints', () => {
    setupTestDB();
    let authToken;

    beforeEach(async () => {
        // Create a superadmin user and get token
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
    });

    describe('POST /api/schools', () => {
        it('should create a new school', async () => {
            const schoolData = {
                name: 'Test School',
                address: {
                    street: '123 Test St',
                    city: 'Test City',
                    state: 'Test State',
                    country: 'Test Country',
                    zipCode: '12345'
                },
                contactInfo: {
                    email: 'school@test.com',
                    phone: '1234567890',
                    website: 'http://testschool.com'
                }
            };

            const res = await request(app)
                .post('/api/schools')
                .set('Authorization', `Bearer ${authToken}`)
                .send(schoolData);

            expect(res.statusCode).toBe(201);
            expect(res.body.data).toHaveProperty('name', schoolData.name);
            expect(res.body.data.status).toBe('active');
        });

        it('should not create school without authentication', async () => {
            const res = await request(app)
                .post('/api/schools')
                .send({
                    name: 'Test School'
                });

            expect(res.statusCode).toBe(401);
        });
    });

    describe('GET /api/schools', () => {
        beforeEach(async () => {
            // Create test schools
            await School.create([
                {
                    name: 'School 1',
                    address: { city: 'City 1' },
                    contactInfo: { email: 'school1@test.com' }
                },
                {
                    name: 'School 2',
                    address: { city: 'City 2' },
                    contactInfo: { email: 'school2@test.com' }
                }
            ]);
        });

        it('should get all schools with pagination', async () => {
            const res = await request(app)
                .get('/api/schools')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ page: 1, limit: 10 });

            expect(res.statusCode).toBe(200);
            expect(res.body.data).toHaveLength(2);
            expect(res.body.pagination).toHaveProperty('total', 2);
        });

        it('should filter schools by status', async () => {
            const res = await request(app)
                .get('/api/schools')
                .set('Authorization', `Bearer ${authToken}`)
                .query({ status: 'active' });

            expect(res.statusCode).toBe(200);
            expect(res.body.data.every(school => school.status === 'active')).toBe(true);
        });
    });

    describe('PUT /api/schools/:schoolId', () => {
        let schoolId;

        beforeEach(async () => {
            const school = await School.create({
                name: 'School to Update',
                address: { city: 'Old City' },
                contactInfo: { email: 'old@test.com' }
            });
            schoolId = school._id;
        });

        it('should update school details', async () => {
            const updateData = {
                name: 'Updated School Name',
                'address.city': 'New City'
            };

            const res = await request(app)
                .put(`/api/schools/${schoolId}`)
                .set('Authorization', `Bearer ${authToken}`)
                .send(updateData);

            expect(res.statusCode).toBe(200);
            expect(res.body.data.name).toBe(updateData.name);
            expect(res.body.data.address.city).toBe(updateData['address.city']);
        });
    });

    describe('DELETE /api/schools/:schoolId', () => {
        let schoolId;

        beforeEach(async () => {
            const school = await School.create({
                name: 'School to Delete',
                address: { city: 'City' },
                contactInfo: { email: 'delete@test.com' }
            });
            schoolId = school._id;
        });

        it('should soft delete a school', async () => {
            const res = await request(app)
                .delete(`/api/schools/${schoolId}`)
                .set('Authorization', `Bearer ${authToken}`);

            expect(res.statusCode).toBe(200);

            const deletedSchool = await School.findById(schoolId);
            expect(deletedSchool.isDeleted).toBe(true);
        });
    });
});