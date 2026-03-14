/**
 * Logger Utility
 * Simple console logging with different levels
 */

const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  white: '\x1b[37m',
  gray: '\x1b[90m'
};

const formatMessage = (level, message, meta = {}) => {
  const timestamp = new Date().toISOString();
  const metaStr = Object.keys(meta).length > 0 ? ` ${JSON.stringify(meta)}` : '';
  return `[${timestamp}] ${level.toUpperCase()}: ${message}${metaStr}`;
};

const logger = {
  info: (message, meta = {}) => {
    console.log(colors.green + formatMessage('info', message, meta) + colors.reset);
  },
  
  warn: (message, meta = {}) => {
    console.warn(colors.yellow + formatMessage('warn', message, meta) + colors.reset);
  },
  
  error: (message, meta = {}) => {
    console.error(colors.red + formatMessage('error', message, meta) + colors.reset);
  },
  
  debug: (message, meta = {}) => {
    if (process.env.NODE_ENV !== 'production') {
      console.debug(colors.cyan + formatMessage('debug', message, meta) + colors.reset);
    }
  },
  
  // HTTP request logging
  http: (req, res, next) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const statusColor = res.statusCode >= 400 ? colors.red : 
                         res.statusCode >= 300 ? colors.yellow : 
                         colors.green;
      
      console.log(
        colors.gray + `[${new Date().toISOString()}]` + colors.reset +
        ` ${req.method} ${req.url} ` +
        statusColor + res.statusCode + colors.reset +
        ` ${duration}ms`
      );
    });
    
    next();
  }
};

module.exports = logger;