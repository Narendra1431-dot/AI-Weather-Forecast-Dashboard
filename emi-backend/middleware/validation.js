/**
 * Input Validation Middleware
 * Validates request parameters using Joi
 */

const Joi = require('joi');

// Validation schemas
const emiCalculationSchema = Joi.object({
  principalAmount: Joi.number()
    .positive()
    .min(1000)
    .max(100000000)
    .required()
    .messages({
      'number.positive': 'Principal amount must be positive',
      'number.min': 'Minimum principal amount is 1000',
      'number.max': 'Maximum principal amount is 100 crore',
      'any.required': 'Principal amount is required'
    }),
  interestRate: Joi.number()
    .positive()
    .min(0.1)
    .max(50)
    .required()
    .messages({
      'number.positive': 'Interest rate must be positive',
      'number.min': 'Minimum interest rate is 0.1%',
      'number.max': 'Maximum interest rate is 50%',
      'any.required': 'Interest rate is required'
    }),
  tenureMonths: Joi.number()
    .integer()
    .positive()
    .min(1)
    .max(600)
    .required()
    .messages({
      'number.integer': 'Tenure must be a whole number',
      'number.positive': 'Tenure must be positive',
      'number.min': 'Minimum tenure is 1 month',
      'number.max': 'Maximum tenure is 600 months (50 years)',
      'any.required': 'Tenure is required'
    }),
  propertyType: Joi.string()
    .valid('home_loan', 'personal_loan', 'car_loan', 'education_loan', 'other')
    .default('other')
});

const eligibilityCheckSchema = Joi.object({
  monthlyIncome: Joi.number()
    .positive()
    .min(1000)
    .required()
    .messages({
      'number.positive': 'Monthly income must be positive',
      'number.min': 'Minimum monthly income is 1000',
      'any.required': 'Monthly income is required'
    }),
  existingEMI: Joi.number()
    .min(0)
    .default(0),
  creditScore: Joi.number()
    .integer()
    .min(300)
    .max(900)
    .default(650)
    .messages({
      'number.integer': 'Credit score must be a whole number',
      'number.min': 'Minimum credit score is 300',
      'number.max': 'Maximum credit score is 900'
    }),
  loanAmount: Joi.number()
    .positive()
    .min(1000)
    .max(100000000)
    .required()
    .messages({
      'number.positive': 'Loan amount must be positive',
      'number.min': 'Minimum loan amount is 1000',
      'number.max': 'Maximum loan amount is 100 crore',
      'any.required': 'Loan amount is required'
    }),
  interestRate: Joi.number()
    .positive()
    .min(0.1)
    .max(50)
    .required()
    .messages({
      'number.positive': 'Interest rate must be positive',
      'number.min': 'Minimum interest rate is 0.1%',
      'number.max': 'Maximum interest rate is 50%',
      'any.required': 'Interest rate is required'
    }),
  tenureMonths: Joi.number()
    .integer()
    .positive()
    .min(1)
    .max(600)
    .required()
    .messages({
      'number.integer': 'Tenure must be a whole number',
      'number.positive': 'Tenure must be positive',
      'number.min': 'Minimum tenure is 1 month',
      'number.max': 'Maximum tenure is 600 months',
      'any.required': 'Tenure is required'
    }),
  propertyType: Joi.string()
    .valid('home_loan', 'personal_loan', 'car_loan', 'education_loan', 'other')
    .default('other')
});

const historyQuerySchema = Joi.object({
  page: Joi.number().integer().min(1).default(1),
  limit: Joi.number().integer().min(1).max(100).default(10),
  propertyType: Joi.string().valid('home_loan', 'personal_loan', 'car_loan', 'education_loan', 'other'),
  startDate: Joi.date(),
  endDate: Joi.date()
});

/**
 * Validate EMI calculation request
 */
const validateEMICalculation = (req, res, next) => {
  const { error, value } = emiCalculationSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  req.validatedBody = value;
  next();
};

/**
 * Validate eligibility check request
 */
const validateEligibilityCheck = (req, res, next) => {
  const { error, value } = eligibilityCheckSchema.validate(req.body, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  req.validatedBody = value;
  next();
};

/**
 * Validate history query parameters
 */
const validateHistoryQuery = (req, res, next) => {
  const { error, value } = historyQuerySchema.validate(req.query, {
    abortEarly: false,
    stripUnknown: true
  });

  if (error) {
    const errors = error.details.map(detail => ({
      field: detail.path.join('.'),
      message: detail.message
    }));
    return res.status(400).json({
      success: false,
      error: 'Validation Error',
      details: errors
    });
  }

  req.validatedQuery = value;
  next();
};

module.exports = {
  validateEMICalculation,
  validateEligibilityCheck,
  validateHistoryQuery,
  schemas: {
    emiCalculationSchema,
    eligibilityCheckSchema,
    historyQuerySchema
  }
};