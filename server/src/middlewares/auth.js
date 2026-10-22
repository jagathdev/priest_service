import jwt from 'jsonwebtoken';

const isLikelyAdminRoute = (req) => {
  return Boolean(
    req.baseUrl?.startsWith('/api/admin') ||
    req.originalUrl?.includes('/api/admin') ||
    req.headers.referer?.includes('/admin') ||
    (req.method !== 'GET' && (
      req.baseUrl?.startsWith('/api/pujas') ||
      req.originalUrl?.includes('/api/pujas') ||
      req.baseUrl?.startsWith('/api/homas') ||
      req.originalUrl?.includes('/api/homas') ||
      req.baseUrl?.startsWith('/api/hero-banners') ||
      req.originalUrl?.includes('/api/hero-banners') ||
      req.baseUrl?.startsWith('/api/promos') ||
      req.originalUrl?.includes('/api/promos')
    ))
  );
};

const extractToken = (req) => {
  const authHeader = req.headers.authorization;
  const isAdminRoute = isLikelyAdminRoute(req);

  if (authHeader && authHeader.startsWith('Bearer ')) {
    const headerToken = authHeader.split(' ')[1];
    if (headerToken && headerToken !== 'undefined' && headerToken !== 'null' && headerToken.trim()) {
      // If this is an admin route/context, ensure the header token has admin privileges.
      // If it's a non-admin token but a valid adminToken cookie exists, prefer adminToken.
      if (isAdminRoute && req.headers?.cookie) {
        try {
          const decoded = jwt.decode(headerToken);
          if (decoded && decoded.role === 'admin') {
            return headerToken;
          }
          const adminMatch = req.headers.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
          if (adminMatch) {
            return decodeURIComponent(adminMatch[1]);
          }
        } catch {
          // If decoding fails, return headerToken
        }
      }
      return headerToken;
    }
  }

  if (req.headers.cookie) {
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
      // If token failed but we have an adminToken cookie in admin context, try that
      if (req.headers?.cookie && isLikelyAdminRoute(req)) {
        const adminMatch = req.headers.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
        if (adminMatch) {
          try {
            decoded = jwt.verify(decodeURIComponent(adminMatch[1]), process.env.JWT_SECRET);
          } catch {
            return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
          }
        } else {
          return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
        }
      } else {
        return res.status(401).json({ success: false, message: 'Not authorized, token failed' });
      }
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
    return next();
  }

  // Extra safety fallback: Check if request carries a valid adminToken in cookies
  if (req.headers?.cookie) {
    const adminMatch = req.headers.cookie.match(/(?:^|;\s*)adminToken=([^;]+)/);
    if (adminMatch) {
      try {
        const decoded = jwt.verify(decodeURIComponent(adminMatch[1]), process.env.JWT_SECRET);
        if (decoded && decoded.role === 'admin') {
          req.user = {
            id: decoded.id,
            role: decoded.role,
          };
          return next();
        }
      } catch {
        // Invalid or expired admin token
      }
    }
  }

  return res.status(403).json({ success: false, message: 'Not authorized as an admin' });
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
