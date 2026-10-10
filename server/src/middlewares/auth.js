import jwt from 'jsonwebtoken';
import User from '../models/user.js';
import Admin from '../models/Admin.js';

export const requireAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

    const token = authHeader.split(' ')[1];
    
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (err) {
      return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
    }

    req.user = {
      id: decoded.id,
      role: decoded.role
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};
