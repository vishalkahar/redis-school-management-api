const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('../models/user.model');
const School = require('../models/school.model');
const Classroom = require('../models/classroom.model');
const Student = require('../models/student.model');
const config = require('../config/index.config.js');

const MONGODB_URI = config.dotEnv.MONGO_URI;

async function seedDatabase() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        // Clear existing data
        await Promise.all([
            User.deleteMany({}),
            School.deleteMany({}),
            Classroom.deleteMany({}),
            Student.deleteMany({})
        ]);
        console.log('Cleared existing data');

        // Create Schools
        const schools = await School.create([
            {
                name: 'Springfield Elementary',
                address: {
                    street: '123 School Lane',
                    city: 'Springfield',
                    state: 'IL',
                    country: 'USA',
                    zipCode: '62701'
                },
                contactInfo: {
                    email: 'springfield@edu.com',
                    phone: '555-0101',
                    website: 'www.springfield.edu'
                },
                status: 'active'
            },
            {
                name: 'Central High School',
                address: {
                    street: '456 Education Ave',
                    city: 'Central City',
                    state: 'IL',
                    country: 'USA',
                    zipCode: '62702'
                },
                contactInfo: {
                    email: 'central@edu.com',
                    phone: '555-0102',
                    website: 'www.central.edu'
                },
                status: 'active'
            },
            {
                name: 'Riverside Academy',
                address: {
                    street: '789 River Road',
                    city: 'Riverside',
                    state: 'IL',
                    country: 'USA',
                    zipCode: '62703'
                },
                contactInfo: {
                    email: 'riverside@edu.com',
                    phone: '555-0103',
                    website: 'www.riverside.edu'
                },
                status: 'active'
            }
        ]);
        console.log('Schools created');

        // Create Users (including superadmin and school admins)
        const password = 'Password123!';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);
        const users = await User.create([
            {
                email: 'superadmin@system.com',
                password: hashedPassword,
                role: 'superadmin',
                status: 'active'
            },
            {
                email: 'admin1@springfield.edu',
                password: hashedPassword,
                role: 'school_admin',
                school: schools[0]._id,
                status: 'active'
            },
            {
                email: 'admin2@central.edu',
                password: hashedPassword,
                role: 'school_admin',
                school: schools[1]._id,
                status: 'active'
            }
        ]);
        console.log('Users created');

        // Create Classrooms
        const classrooms = await Classroom.create([
            {
                name: 'Class 1A',
                school: schools[0]._id,
                capacity: 30,
                grade: '1',
                section: 'A',
                resources: ['projector', 'smartboard'],
                currentStudentCount: 25,
                academicYear: '2023-2024'
            },
            {
                name: 'Class 2B',
                school: schools[1]._id,
                capacity: 25,
                grade: '2',
                section: 'B',
                resources: ['computers', 'laboratory'],
                currentStudentCount: 20,
                academicYear: '2023-2024'
            },
            {
                name: 'Class 3C',
                school: schools[2]._id,
                capacity: 35,
                grade: '3',
                section: 'C',
                resources: ['projector', 'computers'],
                currentStudentCount: 30,
                academicYear: '2023-2024'
            }
        ]);
        console.log('Classrooms created');

        // Create Students
        await Student.create([
            {
                firstName: 'John',
                lastName: 'Doe',
                dateOfBirth: new Date('2015-05-15'),
                gender: 'male',
                enrollmentNumber: '23001', // Added enrollment number
                school: schools[0]._id,
                classroom: classrooms[0]._id,
                guardianInfo: {
                    name: 'Jane Doe',
                    relationship: 'Mother',
                    contact: '555-0201',
                    email: 'jane.doe@email.com'
                },
                academicRecord: [{
                    year: '2023-2024',
                    grade: 'A',
                    classroom: classrooms[0]._id,
                    status: 'active'
                }]
            },
            {
                firstName: 'Sarah',
                lastName: 'Smith',
                dateOfBirth: new Date('2014-08-20'),
                gender: 'female',
                enrollmentNumber: '23002', // Added enrollment number
                school: schools[1]._id,
                classroom: classrooms[1]._id,
                guardianInfo: {
                    name: 'Mike Smith',
                    relationship: 'Father',
                    contact: '555-0202',
                    email: 'mike.smith@email.com'
                },
                academicRecord: [{
                    year: '2023-2024',
                    grade: 'B',
                    classroom: classrooms[1]._id,
                    status: 'active'
                }]
            },
            {
                firstName: 'Michael',
                lastName: 'Johnson',
                dateOfBirth: new Date('2015-03-10'),
                gender: 'male',
                enrollmentNumber: '23003', // Added enrollment number
                school: schools[2]._id,
                classroom: classrooms[2]._id,
                guardianInfo: {
                    name: 'Lisa Johnson',
                    relationship: 'Mother',
                    contact: '555-0203',
                    email: 'lisa.johnson@email.com'
                },
                academicRecord: [{
                    year: '2023-2024',
                    grade: 'A',
                    classroom: classrooms[2]._id,
                    status: 'active'
                }]
            }
        ]);
        console.log('Students created');

        console.log('Database seeded successfully!');
        console.log('\nYou can now login with:');
        console.log('Email: superadmin@system.com');
        console.log('Password: Password123!');

    } catch (error) {
        console.error('Error seeding database:', error);
    } finally {
        await mongoose.disconnect();
        console.log('Disconnected from MongoDB');
    }
}

seedDatabase();