import jwt from 'jsonwebtoken';

function getSecret() {
  const secret = process.env.JWT_SECRET || process.env.ACCESS_TOKEN_SECRET;
  if (!secret) throw new Error('JWT_SECRET must be configured');
  return secret;
}

export function createAccessToken(userId) {
  return jwt.sign({}, getSecret(), {
    algorithm: 'HS256',
    subject: String(userId),
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

