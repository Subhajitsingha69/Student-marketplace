import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import { ApiError } from '../utils/api-error.js';

export async function verifyJWT(req, res, next) {
  try {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return next(new ApiError(401, 'Unauthorized, please provide JWT'));

    const decodedToken = jwt.verify(
      token,
      process.env.ACCESS_TOKEN_SECRET || process.env.JWT_SECRET,
    );
    const user = await User.findById(decodedToken.sub).select('-passwordHash');
    if (!user) return next(new ApiError(401, 'User not found'));

    req.user = user;
    next();
  } catch {
    next(new ApiError(401, 'Unauthorized'));
  }
}
