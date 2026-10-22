import jwt from 'jsonwebtoken';

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.split(' ')[1];
  }

  if (req.headers.cookie) {
    const isAdminRoute = Boolean(req.baseUrl?.startsWith('/api/admin') || req.originalUrl?.includes('/api/admin'));
    if (isAdminRoute) {
      const adminMatch = req.headers.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
      if (adminMatch) return decodeURIComponent(adminMatch[1]);
    }

    const userMatch = req.headers.cookie.match(/(?:^|;\s*)token=([^;]+)/);
    if (userMatch) return decodeURIComponent(userMatch[1]);

    if (!isAdminRoute) {
      const fallbackAdminMatch = req.headers.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
      if (fallbackAdminMatch) return decodeURIComponent(fallbackAdminMatch[1]);
    }
  }

  return null;
};

export const requireAuth = async (req, res, next) => {
  try {
    const token = extractToken(req);

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

    // Verify ownership if target user identifier is present in params or query
    const targetUserId = req.params?.userId || req.query?.userId;
    if (targetUserId && req.user.role !== 'admin' && String(targetUserId) !== String(req.user.id)) {
      return res.status(403).json({ success: false, message: 'Forbidden: access denied to requested resource' });
    }

    next();
  } catch (error) {
    console.error('Auth middleware error:', error.message);
    res.status(401).json({ success: false, message: 'Not authorized' });
  }
};

export const requireUserOrAdmin = (req, res, next) => {
  if (!req.user) {
    return res.status(401).json({ success: false, message: 'Not authorized, no token' });
  }
  const targetUserId = req.params?.userId || req.body?.userId || req.query?.userId;
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
    const token = extractToken(req);

    if (token && token !== 'undefined' && token !== 'null' && token.trim()) {
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
