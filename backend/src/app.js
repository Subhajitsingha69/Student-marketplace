import express from 'express';
import cors from 'cors';
import authRouter from './routes/auth.js';
import feedRouter from './routes/feed.js';
import { ApiError } from './utils/api-error.js';
import { ApiResponse } from './utils/api-response.js';

const app = express();

app.use(cors({
    origin:process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",
    credentials:true,
    methods: ["GET","POST","PUT","PATCH","DELETE","OPTIONS"],
    allowedHeaders: ["Content-Type","Authorization"]
}))


app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.use('/api/auth', authRouter);
app.use('/api/feed', feedRouter);


app.use((error, _req, res, _next) => {
  console.error(error);
  const apiError = error instanceof ApiError ? error : new ApiError(500, 'Something went wrong');
  return res.status(apiError.statusCode).json({
    statusCode: apiError.statusCode,
    data: null,
    message: apiError.message,
    success: false,
  });
});

export default app;
