const request = require('supertest');
const app = require('../app');
const User = require('../models/user.model');
const mongoose = require('mongoose');

describe('Authentication Endpoints', () => {
    beforeAll(async () => {
        // Connect to test database
        await mongoose.connect(process.env.TEST_MONGO_URI);
    });

    afterAll(async () => {
        // Clean up database
        await User.deleteMany({});
        await mongoose.connection.close();
    });

    describe('POST /api/register', () => {
        it('should create a new superadmin user', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    email: 'superadmin@test.com',
                    password: 'Test@123',
                    role: 'superadmin'
                });

            expect(res.statusCode).toBe(201);
            expect(res.body).toHaveProperty('data.token');
            expect(res.body.data.user.role).toBe('superadmin');
        });

        it('should not allow duplicate email', async () => {
            const res = await request(app)
                .post('/api/register')
                .send({
                    email: 'superadmin@test.com',
                    password: 'Test@123',
                    role: 'superadmin'
                });

            expect(res.statusCode).toBe(409);
        });
    });

    describe('POST /api/login', () => {
        it('should authenticate valid user', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    email: 'superadmin@test.com',
                    password: 'Test@123'
                });

            expect(res.statusCode).toBe(200);
            expect(res.body).toHaveProperty('data.token');
        });

        it('should reject invalid credentials', async () => {
            const res = await request(app)
                .post('/api/login')
                .send({
                    email: 'superadmin@test.com',
                    password: 'wrongpassword'
                });

            expect(res.statusCode).toBe(401);
        });
    });
});