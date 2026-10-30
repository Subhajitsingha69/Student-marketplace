import { Router } from 'express';
import { getFeed } from '../controllers/feedController.js';
import { verifyJWT } from '../middleware/auth.middleware.js';

const router = Router();
router.get('/', verifyJWT, getFeed);

export default router;
