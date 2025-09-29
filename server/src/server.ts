import dotenv from 'dotenv';
import express, { Application } from 'express';
import cors from 'cors';
// import routes from './routes';

dotenv.config();

const app: Application = express();
app.use(cors);
app.use(express.json());

// app.use('/api', routes);

const PORT = process.env.PORT || 5000;

const start = async (): Promise<void> => {
    try {

    } catch (err) {
        console.error('Failed to start server:', err);
        process.exit(1);
    }
} 

start();