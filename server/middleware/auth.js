const jwt = require('jsonwebtoken');

// Middleware to verify JWT and attach user info to the request
module.exports = function auth(req, res, next) {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token missing' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    return next();
  } catch (err) {
    console.error('Invalid token:', err);
    return res.status(401).json({ message: 'Invalid or expired token' });
  }
};
