/**
 * EMI Calculator Utility Functions
 * Provides standard financial formulas for EMI calculations
 */

/**
 * Calculate EMI using the standard formula
 * EMI = [P × r × (1 + r)^n] / [(1 + r)^n – 1]
 * Where:
 *   P = Principal loan amount
 *   r = Monthly interest rate (annual rate / 12 / 100)
 *   n = Number of monthly installments
 * 
 * @param {number} principal - Principal loan amount
 * @param {number} annualRate - Annual interest rate in percentage
 * @param {number} tenureMonths - Loan tenure in months
 * @returns {object} EMI calculation result
 */
const calculateEMI = (principal, annualRate, tenureMonths) => {
  if (principal <= 0 || annualRate <= 0 || tenureMonths <= 0) {
    throw new Error('Invalid input parameters');
  }

  const monthlyRate = annualRate / 12 / 100;
  const power = Math.pow(1 + monthlyRate, tenureMonths);
  
  const emi = (principal * monthlyRate * power) / (power - 1);
  const totalPayment = emi * tenureMonths;
  const totalInterest = totalPayment - principal;

  // Generate amortization schedule
  const schedule = generateAmortizationSchedule(principal, monthlyRate, emi, tenureMonths);

  return {
    principal,
    annualRate,
    tenureMonths,
    monthlyRate: Math.round(monthlyRate * 10000) / 100,
    emiAmount: Math.round(emi * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    schedule: schedule.map(item => ({
      month: item.month,
      principal: Math.round(item.principalPayment * 100) / 100,
      interest: Math.round(item.interestPayment * 100) / 100,
      balance: Math.round(item.remainingBalance * 100) / 100
    }))
  };
};

/**
 * Generate monthly amortization schedule
 * @param {number} principal - Principal amount
 * @param {number} monthlyRate - Monthly interest rate
 * @param {number} emi - Monthly EMI amount
 * @param {number} tenureMonths - Total months
 * @returns {array} Amortization schedule
 */
const generateAmortizationSchedule = (principal, monthlyRate, emi, tenureMonths) => {
  const schedule = [];
  let balance = principal;

  for (let month = 1; month <= tenureMonths; month++) {
    const interestPayment = balance * monthlyRate;
    const principalPayment = emi - interestPayment;
    balance = Math.max(0, balance - principalPayment);

    schedule.push({
      month,
      principalPayment: Math.round(principalPayment * 100) / 100,
      interestPayment: Math.round(interestPayment * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100
    });
  }

  return schedule;
};

/**
 * Calculate Loan Eligibility based on various parameters
 * @param {object} params - Eligibility parameters
 * @returns {object} Eligibility result
 */
const calculateEligibility = ({
  monthlyIncome,
  existingEMI = 0,
  creditScore = 650,
  loanAmount,
  interestRate,
  tenureMonths,
  propertyType = 'other'
}) => {
  // Maximum EMI to income ratio varies by property type
  const maxEMItoIncomeRatio = {
    home_loan: 0.6,      // 60% of income
    personal_loan: 0.5,  // 50% of income
    car_loan: 0.4,       // 40% of income
    education_loan: 0.5, // 50% of income
    other: 0.4           // 40% of income
  };

  // Credit score thresholds
  const creditScoreThresholds = {
    excellent: 750,
    good: 700,
    fair: 650,
    poor: 550
  };

  const maxAllowedEMI = monthlyIncome * (maxEMItoIncomeRatio[propertyType] || 0.4);
  const availableEMI = maxAllowedEMI - existingEMI;

  // Calculate required EMI for the loan
  let requiredEMI = 0;
  if (loanAmount && interestRate && tenureMonths) {
    const result = calculateEMI(loanAmount, interestRate, tenureMonths);
    requiredEMI = result.emiAmount;
  }

  // Calculate eligibility score (0-100)
  let eligibilityScore = 0;
  
  if (availableEMI > 0 && requiredEMI > 0) {
    const emiRatio = requiredEMI / availableEMI;
    eligibilityScore = Math.max(0, Math.min(100, (1 - emiRatio) * 100));
  }

  // Adjust for credit score
  if (creditScore >= creditScoreThresholds.excellent) {
    eligibilityScore = Math.min(100, eligibilityScore + 20);
  } else if (creditScore >= creditScoreThresholds.good) {
    eligibilityScore = Math.min(100, eligibilityScore + 10);
  } else if (creditScore < creditScoreThresholds.poor) {
    eligibilityScore = Math.max(0, eligibilityScore - 30);
  }

  // Determine eligibility status
  let eligibilityStatus;
  if (eligibilityScore >= 70 && requiredEMI <= availableEMI) {
    eligibilityStatus = 'eligible';
  } else if (eligibilityScore >= 40 && requiredEMI <= availableEMI * 1.2) {
    eligibilityStatus = 'conditional';
  } else {
    eligibilityStatus = 'not_eligible';
  }

  return {
    eligible: eligibilityStatus === 'eligible',
    status: eligibilityStatus,
    score: Math.round(eligibilityScore),
    maxAllowedEMI: Math.round(maxAllowedEMI * 100) / 100,
    availableEMI: Math.round(availableEMI * 100) / 100,
    requiredEMI: Math.round(requiredEMI * 100) / 100,
    monthlyIncome: Math.round(monthlyIncome * 100) / 100,
    existingEMI: Math.round(existingEMI * 100) / 100,
    creditScore,
    recommendations: getRecommendations(eligibilityStatus, creditScore, loanAmount, requiredEMI, availableEMI)
  };
};

/**
 * Get eligibility recommendations based on results
 */
const getRecommendations = (status, creditScore, loanAmount, requiredEMI, availableEMI) => {
  const recommendations = [];

  if (status === 'not_eligible') {
    if (requiredEMI > availableEMI) {
      recommendations.push('Consider increasing loan tenure to reduce monthly EMI');
    }
    if (creditScore < 650) {
      recommendations.push('Improve your credit score above 650 for better eligibility');
    }
    recommendations.push('Consider reducing the loan amount');
  } else if (status === 'conditional') {
    recommendations.push('Your eligibility is conditional - provide additional documentation');
    if (creditScore < 700) {
      recommendations.push('Improving your credit score could help');
    }
  } else {
    recommendations.push('You are eligible for this loan amount');
  }

  return recommendations;
};

/**
 * Calculate flat interest rate EMI (alternative method)
 * @param {number} principal - Principal amount
 * @param {number} annualRate - Annual interest rate
 * @param {number} tenureMonths - Tenure in months
 * @returns {object} EMI result
 */
const calculateFlatInterestEMI = (principal, annualRate, tenureMonths) => {
  const totalInterest = (principal * annualRate * tenureMonths) / (12 * 100);
  const totalPayment = principal + totalInterest;
  const emi = totalPayment / tenureMonths;

  return {
    principal,
    annualRate,
    tenureMonths,
    emiAmount: Math.round(emi * 100) / 100,
    totalPayment: Math.round(totalPayment * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100
  };
};

module.exports = {
  calculateEMI,
  calculateEligibility,
  calculateFlatInterestEMI,
  generateAmortizationSchedule
};