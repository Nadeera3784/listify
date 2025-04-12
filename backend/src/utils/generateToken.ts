import jwt from 'jsonwebtoken';

const generateToken = (id: string): string => {
  const payload = { id };
  const secret = process.env.JWT_SECRET || 'secret';
  
  return jwt.sign(payload, secret as any, { 
    expiresIn: '7d'
  });
};

export default generateToken; 