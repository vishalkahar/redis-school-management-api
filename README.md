# School Management System API

A RESTful API for managing schools, classrooms, and students. Built with Node.js, Express, and MongoDB.

## Features

- User Authentication & Authorization (JWT)
- Role-based Access Control (Superadmin, School Admin)
- School Management
- Classroom Management
- Student Management
- API Documentation with Swagger
- Rate Limiting
- Input Validation
- Unit Testing

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Redis (optional, for rate limiting)

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd school-management-api
```
2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory:
```bash
env
PORT=3000
MONGO_URI=mongodb://localhost:27017/school_management
JWT_SECRET=your_jwt_secret_key
LONG_TOKEN_SECRET=your_long_token_secret
SHORT_TOKEN_SECRET=your_short_token_secret
NACL_SECRET=your_nacl_secret
NODE_ENV=development
```

4. Start the server:

## Development
```bash
npm run dev
```

## Production
```bash
npm start
```

## API Documentation

Access the Swagger documentation at:
```bash
http://localhost:3000/api-docs
```

## API Endpoints

### Authentication
- POST `/api/auth/register` - Register new user (Superadmin only)
- POST `/api/auth/login` - User login
- POST `/api/auth/change-password` - Change password

### Schools
- POST `/api/schools` - Create school
- GET `/api/schools` - List all schools
- GET `/api/schools/:schoolId` - Get school details
- PUT `/api/schools/:schoolId` - Update school
- DELETE `/api/schools/:schoolId` - Delete school

### Classrooms
- POST `/api/schools/:schoolId/classrooms` - Create classroom
- GET `/api/schools/:schoolId/classrooms` - List school classrooms
- GET `/api/classrooms/:classroomId` - Get classroom details
- PUT `/api/classrooms/:classroomId` - Update classroom
- DELETE `/api/classrooms/:classroomId` - Delete classroom

### Students
- POST `/api/schools/:schoolId/students` - Enroll student
- GET `/api/schools/:schoolId/students` - List school students
- GET `/api/students/:studentId` - Get student details
- PUT `/api/students/:studentId` - Update student
- POST `/api/students/:studentId/transfer` - Transfer student
- DELETE `/api/students/:studentId` - Delete student

## Testing

Run the test suite:

```bash
npm test
```
## Security Features

- JWT Authentication
- Password Hashing (bcrypt)
- Rate Limiting
- CORS Protection
- Helmet Security Headers
- Input Validation (Joi)
- Role-based Access Control

## Project Structure
├── config/ # Configuration files

├── controllers/ # Route controllers

├── middleware/ # Custom middleware

├── models/ # Database models

├── routes/ # API routes

├── validators/ # Input validation schemas

├── tests/ # Test files

├── docs/ # API documentation

├── scripts/ # Utility scripts

├── app.js # Express app setup

└── index.js # Application entry point