// const config                = require('./config/index.config.js');
// const Cortex                = require('ion-cortex');
// const ManagersLoader        = require('./loaders/ManagersLoader.js');
// const Aeon                  = require('aeon-machine');

// process.on('uncaughtException', err => {
//     console.log(`Uncaught Exception:`)
//     console.log(err, err.stack);

//     process.exit(1)
// })

// process.on('unhandledRejection', (reason, promise) => {
//     console.log('Unhandled rejection at ', promise, `reason:`, reason);
//     process.exit(1)
// })

// const cache      = require('./cache/cache.dbh')({
//     prefix: config.dotEnv.CACHE_PREFIX ,
//     url: config.dotEnv.CACHE_REDIS
// });

// const Oyster  = require('oyster-db');
// const oyster     = new Oyster({ 
//     url: config.dotEnv.OYSTER_REDIS, 
// 	prefix: config.dotEnv.OYSTER_PREFIX 
// });

// const mongoDB = require('./connect/mongo')({
//     uri: config.dotEnv.MONGO_URI
// });

// const cortex     = new Cortex({
//     prefix: config.dotEnv.CORTEX_PREFIX,
//     url: config.dotEnv.CORTEX_REDIS,
//     type: config.dotEnv.CORTEX_TYPE,
//     state: ()=>{
//         return {
//             activeSchools: 0,
//             activeUsers: 0,
//             totalStudents: 0
//         }
//     },
//     activeDelay: "50",
//     idlDelay: "200",
// });
// const aeon = new Aeon({ cortex , timestampFrom: Date.now(), segmantDuration: 500 });

// const managersLoader = new ManagersLoader({config, cache, cortex, oyster, aeon});
// const managers = managersLoader.load();

// managers.userServer.run();

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');

// Import routes
const schoolRoutes = require('./routes/school.route');
const classroomRoutes = require('./routes/classroom.route');
const studentRoutes = require('./routes/student.route');
const authRoutes = require('./routes/auth.route');


const app = express();

// Middleware
app.use(express.json());
app.use(cors());
app.use(helmet());

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'School Management API' });
});

app.use('/api', authRoutes);
app.use('/api', schoolRoutes);
app.use('/api', classroomRoutes);
app.use('/api', studentRoutes);

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});