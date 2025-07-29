import cors from 'cors';

const corsMiddleware = cors({
    origin: ['http://localhost:8081'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
});

export default corsMiddleware;
