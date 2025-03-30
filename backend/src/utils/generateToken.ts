import jwt from 'jsonwebtoken';

const generateToken = (id: string): string => {
  // Cast parameters to appropriate types for jwt.sign
  const payload = { id };
  const secret = process.env.JWT_SECRET || 'secret';
  
  // Use type assertion to 'any' to bypass TypeScript's strict type checking
  return jwt.sign(payload, secret as any, { 
    expiresIn: '7d'
  });
};

export default generateToken; 