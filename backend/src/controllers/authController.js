import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { ApiError } from '../utils/api-error.js';
import { ApiResponse } from '../utils/api-response.js';
import { createAccessToken } from '../utils/token.js';
import { loginPostBodySchema, signupPostBodySchema } from '../validator/request.validator.js';

function publicUser(user) {
  return { id: user._id, name: user.name, username: user.username };
}

function loginData(user) {
  return {
    user: publicUser(user),
    accessToken: createAccessToken(user._id),
    tokenType: 'Bearer',
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  };
}

export async function register(req, res, next) {
  try {
    const result = signupPostBodySchema.safeParse(req.body);
    if (!result.success) throw new ApiError(400, result.error.issues[0].message);

    const { name, username, password } = result.data;

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await User.create({ name, username, passwordHash });


    return res.status(201).json(new ApiResponse(201, user, 'User registered successfully'));
  } catch (error) {
    if (error.code === 11000) return next(new ApiError(409, 'Username is already taken', { cause: error }));
    return next(error);
  }
}

export async function login(req, res, next) {
  try {
    const result = loginPostBodySchema.safeParse(req.body);
    if (!result.success) throw new ApiError(400, result.error.issues[0].message);

    const { username, password } = result.data;

    const user = await User.findOne({ username }).select('+passwordHash');
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      throw new ApiError(401, 'Invalid username or password');
    }

    return res.status(200).json(new ApiResponse(200, loginData(user), 'User logged in successfully'));
  } catch (error) {
    return next(error);
  }
}
