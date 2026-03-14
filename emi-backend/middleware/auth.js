/**
 * Authentication Middleware
 * Handles user session management and tracking
 */

const crypto = require('crypto');

// In-memory session store (in production, use Redis or database)
const sessions = new Map();

/**
 * Generate a unique session token
 */
const generateToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Create a new session for a user
 * @param {string} userId - User identifier
 * @returns {object} Session object with token
 */
const createSession = (userId) => {
  const token = generateToken();
  const session = {
    token,
    userId,
    createdAt: new Date(),
    lastAccessed: new Date(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
  };
  
  sessions.set(token, session);
  return session;
};

/**
 * Get session by token
 * @param {string} token - Session token
 * @returns {object|null} Session or null if not found/expired
 */
const getSession = (token) => {
  const session = sessions.get(token);
  
  if (!session) {
    return null;
  }
  
  // Check if session expired
  if (new Date() > session.expiresAt) {
    sessions.delete(token);
    return null;
  }
  
  // Update last accessed time
  session.lastAccessed = new Date();
  return session;
};

/**
 * Delete a session
 * @param {string} token - Session token
 */
const deleteSession = (token) => {
  sessions.delete(token);
};

/**
 * Clean up expired sessions
 */
const cleanupSessions = () => {
  const now = new Date();
  for (const [token, session] of sessions.entries()) {
    if (now > session.expiresAt) {
      sessions.delete(token);
    }
  }
};

// Run cleanup every hour
setInterval(cleanupSessions, 60 * 60 * 1000);

/**
 * Authentication middleware factory
 * @param {object} options - Options
 * @param {boolean} options.required - Whether authentication is required
 * @returns {function} Express middleware
 */
const authMiddleware = (options = {}) => {
  const { required = false } = options;
  
  return (req, res, next) => {
    // Get token from header or query
    const token = req.headers.authorization?.replace('Bearer ', '') || 
                  req.query.token;
    
    if (!token && required) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required',
        message: 'Please provide a valid authentication token'
      });
    }
    
    if (!token) {
      // Generate anonymous session for non-authenticated users
      const anonymousId = `anon_${generateToken()}`;
      req.user = {
        id: anonymousId,
        isAnonymous: true
      };
      return next();
    }
    
    const session = getSession(token);
    
    if (!session && required) {
      return res.status(401).json({
        success: false,
        error: 'Invalid or expired token',
        message: 'Please authenticate again'
      });
    }
    
    if (!session) {
      // Allow anonymous access if authentication not required
      const anonymousId = `anon_${generateToken()}`;
      req.user = {
        id: anonymousId,
        isAnonymous: true
      };
    } else {
      req.user = {
        id: session.userId,
        isAnonymous: false,
        token: session.token
      };
    }
    
    next();
  };
};

/**
 * Login handler - creates a new session
 */
const login = (req, res) => {
  try {
    const { userId } = req.body;
    
    if (!userId) {
      return res.status(400).json({
        success: false,
        error: 'User ID required',
        message: 'Please provide a user ID'
      });
    }
    
    const session = createSession(userId);
    
    res.status(200).json({
      success: true,
      data: {
        token: session.token,
        expiresAt: session.expiresAt
      },
      message: 'Login successful'
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      error: 'Login failed',
      message: 'An error occurred during login'
    });
  }
};

/**
 * Logout handler - destroys the session
 */
const logout = (req, res) => {
  const token = req.headers.authorization?.replace('Bearer ', '') ||
                req.query.token;
  
  if (token) {
    deleteSession(token);
  }
  
  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
};

/**
 * Get current user info
 */
const getCurrentUser = (req, res) => {
  res.status(200).json({
    success: true,
    data: {
      userId: req.user.id,
      isAnonymous: req.user.isAnonymous,
      authenticated: !req.user.isAnonymous
    }
  });
};

module.exports = {
  authMiddleware,
  createSession,
  getSession,
  deleteSession,
  login,
  logout,
  getCurrentUser
};