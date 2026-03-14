/**
 * Error Handling Middleware
 * Centralized error handling for the application
 */

const logger = require('../utils/logger');

/**
 * API error class for structured error handling
 */
class APIError extends Error {
  constructor(statusCode, message, isOperational = true) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

/**
 * Not Found Error (404)
 */
class NotFoundError extends APIError {
  constructor(message = 'Resource not found') {
    super(404, message);
  }
}

/**
 * Bad Request Error (400)
 */
class BadRequestError extends APIError {
  constructor(message = 'Bad request') {
    super(400, message);
  }
}

/**
 * Unauthorized Error (401)
 */
class UnauthorizedError extends APIError {
  constructor(message = 'Unauthorized access') {
    super(401, message);
  }
}

/**
 * Forbidden Error (403)
 */
class ForbiddenError extends APIError {
  constructor(message = 'Access forbidden') {
    super(403, message);
  }
}

/**
 * Validation Error (422)
 */
class ValidationError extends APIError {
  constructor(message = 'Validation failed') {
    super(422, message);
  }
}

/**
 * Express error handler middleware
 */
const errorHandler = (err, req, res, next) => {
  let error = err;
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    path: req.path,
    method: req.method,
    statusCode,
    body: req.body,
    params: req.params,
    query: req.query,
    userId: req.user?.id
  });

  // Handle Mongoose validation errors
  if (err.name === 'ValidationError') {
    statusCode = 400;
    const errors = Object.values(err.errors).map(e => ({
      field: e.path,
      message: e.message
    }));
    return res.status(statusCode).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  // Handle Mongoose duplicate key errors
  if (err.code === 11000) {
    statusCode = 400;
    const field = Object.keys(err.keyValue)[0];
    message = `Duplicate value for field: ${field}`;
    return res.status(statusCode).json({
      success: false,
      error: 'Duplicate Entry',
      message
    });
  }

  // Handle Mongoose cast errors (invalid ObjectId)
  if (err.name === 'CastError') {
    statusCode = 400;
    message = 'Invalid ID format';
    return res.status(statusCode).json({
      success: false,
      error: 'Invalid Request',
      message
    });
  }

  // Handle JWT errors
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token';
    return res.status(statusCode).json({
      success: false,
      error: 'Authentication Error',
      message
    });
  }

  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Token expired';
    return res.status(statusCode).json({
      success: false,
      error: 'Authentication Error',
      message
    });
  }

  // Send response
  res.status(statusCode).json({
    success: false,
    error: statusCode === 500 ? 'Internal Server Error' : err.name || 'Error',
    message: process.env.NODE_ENV === 'production' && statusCode === 500 
      ? 'Something went wrong' 
      : message,
    ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
  });
};

/**
 * Async handler wrapper to catch errors in async route handlers
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

/**
 * 404 handler for undefined routes
 */
const notFoundHandler = (req, res) => {
  res.status(404).json({
    success: false,
    error: 'Not Found',
    message: `Route ${req.method} ${req.originalUrl} not found`
  });
};

module.exports = {
  APIError,
  NotFoundError,
  BadRequestError,
  UnauthorizedError,
  ForbiddenError,
  ValidationError,
  errorHandler,
  asyncHandler,
  notFoundHandler
};