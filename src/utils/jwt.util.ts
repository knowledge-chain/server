import jwt from 'jsonwebtoken';

export interface TokenPayload {
  userId: any;
  walletAddress: string;
  email?: string;
  phoneNumber?: string;
}

function generateUserToken(payload: TokenPayload): string {
  const tokenPayload: TokenPayload = {
    userId: payload.userId,
    walletAddress: payload.walletAddress
  };

  return jwt.sign(tokenPayload, process.env.JWT_USER_SECRET_KEY!, { expiresIn: '4d' });
}

export { generateUserToken }