import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import userRoute from './routes/userRoutes.js'
import connectDB from './config/db.js';

dotenv.config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/users", userRoute)

const PORT = process.env.PORT || 5000;



app.listen(PORT, () => {
    console.log(`Server is Running on http://localhost:${PORT}`)
})