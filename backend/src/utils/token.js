import jwt from 'jsonwebtoken';

export function createAccessToken(userId) {
  return jwt.sign({},process.env.ACCESS_TOKEN_SECRET, {
    algorithm: 'HS256',
    subject: String(userId),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

