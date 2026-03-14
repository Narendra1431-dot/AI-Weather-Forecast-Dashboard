/**
 * CalculationHistory Model
 * Mongoose schema for storing EMI calculation history
 */

const mongoose = require('mongoose');

const calculationHistorySchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    index: true
  },
  // Loan Details
  principalAmount: {
    type: Number,
    required: true,
    min: 0
  },
  interestRate: {
    type: Number,
    required: true,
    min: 0,
    max: 100
  },
  tenureMonths: {
    type: Number,
    required: true,
    min: 1,
    max: 600
  },
  // EMI Result
  emiAmount: {
    type: Number,
    required: true
  },
  totalInterest: {
    type: Number,
    required: true
  },
  totalPayment: {
    type: Number,
    required: true
  },
  // Eligibility
  eligibilityStatus: {
    type: String,
    enum: ['eligible', 'not_eligible', 'conditional'],
    default: 'eligible'
  },
  eligibilityScore: {
    type: Number,
    min: 0,
    max: 100
  },
  monthlyIncome: {
    type: Number,
    min: 0
  },
  existingEMI: {
    type: Number,
    default: 0
  },
  creditScore: {
    type: Number,
    min: 300,
    max: 900
  },
  loanToValue: {
    type: Number,
    min: 0,
    max: 100
  },
  // Metadata
  calculationType: {
    type: String,
    enum: ['emi_calculation', 'eligibility_check', 'both'],
    default: 'both'
  },
  propertyType: {
    type: String,
    enum: ['home_loan', 'personal_loan', 'car_loan', 'education_loan', 'other'],
    default: 'other'
  },
  ipAddress: {
    type: String
  },
  userAgent: {
    type: String
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for efficient querying
calculationHistorySchema.index({ userId: 1, createdAt: -1 });
calculationHistorySchema.index({ createdAt: -1 });
calculationHistorySchema.index({ principalAmount: 1 });

// Virtual for formatted date
calculationHistorySchema.virtual('formattedDate').get(function() {
  return this.createdAt.toISOString();
});

// Static method to get paginated history
calculationHistorySchema.statics.getHistoryByUser = async function(userId, page = 1, limit = 10, filters = {}) {
  const skip = (page - 1) * limit;
  
  const query = { userId, ...filters };
  
  const [calculations, total] = await Promise.all([
    this.find(query)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    this.countDocuments(query)
  ]);
  
  return {
    calculations,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit)
    }
  };
};

module.exports = mongoose.model('CalculationHistory', calculationHistorySchema);