import express from 'express';
import cors from 'cors';
import connectDB from './config/mongodb.js';
import userRouter from './routes/userRoute.js';
import childRouter from './routes/childRoute.js';
import activity5Router from './routes/activity5Route.js';  // Add this line
import curriculumRouter from './routes/curriculumRoute.js'; 
import adminRouter from './routes/adminRoutes.js';  // Fix the import path
import dotenv from 'dotenv';
dotenv.config();

import corsMiddleware from './middleware/cors.js';

const app = express();
const port = process.env.PORT || 5000;
connectDB();

// Update CORS configuration
app.use(cors({
    origin: ['http://localhost:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Add timeout middleware
app.use((req, res, next) => {
    res.setTimeout(30000, () => {
        console.log('Request has timed out.');
        res.status(408).send('Request has timed out.');
    });
    next();
});

app.use(express.json());

app.use(corsMiddleware);

// Add static file serving - place this before routes
app.use('/uploads', express.static('uploads'));

//api endpoints
app.use("/auth", userRouter);
app.use("/child", childRouter);
app.use("/childauth", childRouter);  // Add this line to support both paths
app.use('/activity5', activity5Router);
app.use('/curriculum', curriculumRouter);
app.use("/admin", adminRouter);  // Changed back to /admin from /api/admin

app.get('/', (req, res) => {
    res.send('Hello World!');
    }
);

// Add error handling middleware
app.use((err, req, res, next) => {
    console.error('Global error handler:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
});

app.listen(port, "0.0.0.0", () => console.log(`Server running on port ${port}`));