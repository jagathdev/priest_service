import jwt from 'jsonwebtoken';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)(?:adminToken|token)=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (!token || token === 'undefined' || token === 'null' || !token.trim()) {
      return res.status(401).json({ success: false, message: 'Not authorized, no token' });
    }

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

    // If userId exists in params, verify ownership
    const paramUserId = req.params?.userId;
    if (paramUserId && req.user.role !== 'admin' && String(paramUserId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: access denied to requested resource' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

export const requireUserOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  const targetUserId = req.params?.userId || req.body?.userId;
  if (targetUserId && req.user.role !== 'admin' && String(targetUserId) !== String(req.user.id)) {
    return res.status(403).json({ success: false, message: 'Forbidden: access denied' });
  }
  next();
};

export const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ success: false, message: 'Not authorized as an admin' });
  }
};

export const optionalAuth = async (req, res, next) => {
  try {
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else if (req.headers.cookie) {
      const match = req.headers.cookie.match(/(?:^|;\s*)(?:adminToken|token)=([^;]+)/);
      if (match) {
        token = decodeURIComponent(match[1]);
      }
    }

    if (token) {
      try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
          id: decoded.id,
          role: decoded.role,
        };
      } catch (err) {
        // Token invalid/expired - continue as guest
      }
    }

    next();
  } catch (error) {
    next();
  }
};
