const mongoose = require('mongoose');
const User = require('../../models/user.model');
const School = require('../../models/school.model');
const Classroom = require('../../models/classroom.model');
const Student = require('../../models/student.model');

const setupTestDB = () => {
    beforeAll(async () => {
        await mongoose.connect(process.env.TEST_MONGO_URI);
    });

    afterAll(async () => {
        await mongoose.connection.close();
    });

    beforeEach(async () => {
        await Promise.all([
            User.deleteMany({}),
            School.deleteMany({}),
            Classroom.deleteMany({}),
            Student.deleteMany({})
        ]);
    });
};

const getAuthToken = async (app, userData) => {
    const response = await request(app)
        .post('/api/auth/login')
        .send(userData);
    return response.body.data.token;
};

module.exports = {
    setupTestDB,
    getAuthToken
};