# EMI Calculator Application - Comprehensive Documentation

## Table of Contents
1. [Project Overview](#project-overview)
2. [Features Documentation](#features-documentation)
3. [Technical Architecture](#technical-architecture)
4. [API Documentation](#api-documentation)
5. [Database Schema](#database-schema)
6. [Validation Logic](#validation-logic)
7. [EMI Calculation Methodology](#emi-calculation-methodology)
8. [Data Flow](#data-flow)
9. [Test Cases](#test-cases)

---

## 1. Project Overview

### 1.1 Introduction
The **EMI Calculator Application** is a comprehensive financial tool designed to help users calculate Equated Monthly Installments (EMI) for various types of loans. The application provides precise calculations, amortization schedules, loan eligibility assessments, and payment breakdown visualizations.

### 1.2 Business Objectives
- **Financial Empowerment**: Enable users to make informed decisions about loans
- **Transparency**: Provide clear breakdown of principal vs interest payments
- **Accessibility**: Offer intuitive interface for all user segments
- **Accuracy**: Deliver precise financial calculations
- **History Tracking**: Allow users to save and compare loan scenarios

### 1.3 Supported Loan Types
- Home Loans
- Personal Loans
- Car Loans
- Education Loans
- Other/Custom Loans

---

## 2. Features Documentation

### 2.1 Loan Principal Input
**Description**: Users can input the principal loan amount they wish to borrow.

**User Flow**:
1. User navigates to EMI Calculator section
2. User enters principal amount in the input field
3. System validates the input (minimum: ₹1,000, maximum: ₹100 crore)
4. Real-time validation feedback is displayed

**Technical Details**:
- Field: `principalAmount`
- Type: Number (decimal)
- Validation: 1,000 ≤ amount ≤ 100,000,000
- Support for multiple currency formats
- Auto-formatting with thousand separators (e.g., 10,00,000)

**Error Messages**:
- "Principal amount must be positive"
- "Minimum principal amount is 1000"
- "Maximum principal amount is 100 crore"

### 2.2 Interest Rate Configuration
**Description**: Users can specify the annual interest rate offered by the lender with support for multiple rate types.

**Interest Rate Types**:

#### 2.2.1 Fixed Interest Rate
- Rate remains constant throughout the loan tenure
- Predictable monthly payments
- Protection from market fluctuations

#### 2.2.2 Variable/Floating Interest Rate
- Rate fluctuates based on market conditions (e.g., MCLR, PLR)
- EMI can increase or decrease over time
- Risk of payment variability

#### 2.2.3 Mixed Interest Rate
- Fixed rate for initial period (e.g., 2 years)
- Converts to floating rate thereafter

**User Flow**:
1. User selects interest rate type (Fixed/Variable/Floating)
2. User enters the annual interest rate
3. System validates the rate (minimum: 0.1%, maximum: 50%)
4. Real-time rate conversion display (annual to monthly)
5. Rate type indicator shown in results

**Technical Details**:
- Field: `interestRate`
- Field: `interestRateType` (enum: 'fixed', 'variable', 'floating', 'mixed')
- Field: `fixedPeriodMonths` (for mixed rate, optional)
- Type: Number (decimal)
- Validation: 0.1% ≤ rate ≤ 50%
- Internal conversion: `monthlyRate = annualRate / 12 / 100`

**Error Messages**:
- "Interest rate must be positive"
- "Minimum interest rate is 0.1%"
- "Maximum interest rate is 50%"
- "Please select a valid interest rate type"

### 2.3 Loan Tenure Selection
**Description**: Users can select the loan repayment period with flexible input options.

**Input Modes**:
1. **Months Mode**: Direct input in months (1-600)
2. **Years Mode**: Input in years with auto-conversion to months

**Conversion Formula**:
```
months = years × 12
```

**User Flow**:
1. User selects input mode (Months/Years toggle)
2. User enters tenure value
3. System validates and auto-converts if needed
4. Visual indicator shows equivalent value in other unit
5. Longer tenure = lower EMI but more total interest

**Technical Details**:
- Field: `tenureMonths`
- Field: `tenureInputMode` (enum: 'months', 'years')
- Type: Integer
- Validation: 1 ≤ months ≤ 600 (or 1 ≤ years ≤ 50)
- Auto-swap between modes maintaining equivalent value

**Error Messages**:
- "Tenure must be a whole number"
- "Minimum tenure is 1 month"
- "Maximum tenure is 600 months (50 years)"

### 2.4 EMI Calculation Engine
**Description**: Core calculation engine that computes the monthly payment using the standard EMI formula.

**Formula Used**:
```
EMI = [P × r × (1 + r)^n] / [(1 + r)^n – 1]

Where:
- P = Principal loan amount
- r = Monthly interest rate (annual rate / 12 / 100)
- n = Number of monthly installments
```

**Precision Handling**:
- All monetary values rounded to 2 decimal places
- Rate calculations use 10-digit precision before rounding
- Balance calculations use maximum precision to avoid rounding errors

**Returns**:
- EMI Amount (rounded to 2 decimal places)
- Total Payment over loan tenure
- Total Interest Payable
- Monthly interest rate used
- Effective annual rate

### 2.5 Amortization Schedule Generation
**Description**: Generates a month-by-month breakdown showing principal and interest portions of each payment.

**Schedule Includes**:
- Month/Payment number
- Principal portion for that month
- Interest portion for that month
- Remaining balance after payment
- Cumulative interest paid
- Cumulative principal paid

**User Flow**:
1. User enters loan details
2. User clicks "Calculate" or "Generate Schedule"
3. System displays complete amortization table
4. User can scroll through all months
5. Filter by year or range option
6. Export to PDF/Excel option

**Technical Implementation**:
```javascript
// Algorithm:
For each month from 1 to tenureMonths:
  - Interest Payment = Current Balance × Monthly Rate
  - Principal Payment = EMI - Interest Payment
  - Remaining Balance = Current Balance - Principal Payment
  - Cumulative Interest += Interest Payment
  - Cumulative Principal += Principal Payment
```

**Display Options**:
- Monthly view
- Yearly summary view
- Principal vs Interest chart

### 2.6 Payment Breakdown Visualization
**Description**: Visual representation of how payments are distributed between principal and interest.

**Visualization Features**:

#### 2.6.1 Pie Chart
- Shows principal vs interest ratio
- Interactive hover for exact values
- Color-coded segments

#### 2.6.2 Bar Chart
- Monthly/yearly payment breakdown
- Stacked bars showing principal vs interest
- Comparison across periods

#### 2.6.3 Summary Cards
- Total Principal Amount
- Total Interest Payable
- Total Payment (Principal + Interest)
- Interest to Principal Ratio
- Payoff date

**Chart Configuration**:
- Responsive sizing
- Dark/Light theme support
- Animation on load
- Export as image

### 2.7 Prepayment Calculation
**Description**: Calculate savings from making extra payments towards the principal.

**Prepayment Options**:

#### 2.7.1 One-time Prepayment
- Single lump sum payment at specified month
- Calculate new EMI or reduced tenure

#### 2.7.2 Recurring Prepayment
- Regular additional payments (monthly/quarterly)
- Projected savings over entire tenure

**User Flow**:
1. User enters base loan details
2. User navigates to prepayment section
3. User enters prepayment amount
4. User selects prepayment frequency (one-time/recurring)
5. User specifies start month
6. System calculates:
   - New EMI (if tenure maintained)
   - New tenure (if EMI maintained)
   - Total interest savings
   - Early payoff date

**Calculation Logic**:
```javascript
// After prepayment:
newPrincipal = currentBalance - prepaymentAmount
newEMI = calculateEMI(newPrincipal, rate, remainingMonths)
// OR
newTenure = recalculateTenure(newPrincipal, rate, currentEMI)
```

### 2.8 Foreclosure Calculation
**Description**: Calculate complete loan payoff amount for early settlement.

**Foreclosure Types**:
1. **Partial Foreclosure**: Pay off portion of remaining balance
2. **Full Foreclosure**: Complete loan settlement

**Foreclosure Considerations**:
- Foreclosure charges (typically 1-2% of outstanding)
- Processing fees
- Tax benefits impact

**User Flow**:
1. User selects "Foreclosure Calculator"
2. User enters original loan details
3. User specifies current month
4. System calculates:
   - Outstanding principal
   - Interest till date
   - Foreclosure charges
   - Total payoff amount

**Formula**:
```
Outstanding Principal = Original Principal - Principal Paid
Interest Till Date = Sum of interest portions paid
Foreclosure Amount = Outstanding Principal + Interest Till Date + Charges
```

### 2.9 Multi-Scenario Comparison
**Description**: Compare multiple loan scenarios side-by-side for informed decision-making.

**Comparison Features**:
- Compare up to 3 loan scenarios simultaneously
- Synchronized visualization
- Key metrics comparison table

**Comparison Metrics**:
| Metric | Scenario 1 | Scenario 2 | Scenario 3 |
|--------|-----------|------------|------------|
| EMI | | | |
| Total Interest | | | |
| Total Payment | | | |
| Interest/Principal Ratio | | | |
| Payoff Timeline | | | |

**User Flow**:
1. User creates first scenario and saves
2. User creates second scenario
3. User clicks "Compare"
4. Side-by-side comparison displayed
5. Highlight best option based on user priority

**Visualization**:
- Grouped bar charts
- Stacked area charts
- Difference indicators

### 2.10 Interest Savings Calculator
**Description**: Calculate total interest savings with different scenarios.

**Features**:
- Compare different tenures
- Compare different interest rates
- Show impact of extra payments
- Display break-even analysis
- Yearly savings projection

**Scenarios Analyzed**:
1. Current vs shorter tenure
2. Current vs lower rate
3. With vs without prepayments
4. Best case combination

### 2.11 User Authentication & Authorization
**Description**: Secure user registration and login system with role-based access control.

#### 2.11.1 Registration Flow
1. User clicks "Sign Up"
2. User enters email, password, name
3. System validates credentials
4. Account created with verification email
5. User redirected to dashboard

#### 2.11.2 Login Flow
1. User enters credentials
2. System validates and generates JWT
3. Session created with token
4. Protected routes accessible

#### 2.11.3 Role-Based Access Control (RBAC)

**Roles**:
| Role | Permissions |
|------|-------------|
| Guest | Calculate EMI, View results |
| User | + Save calculations, View history |
| Premium | + Unlimited scenarios, Export data |
| Admin | + All user data, Analytics |

**Access Matrix**:
- Guest: Read-only calculations
- User: Save up to 10 calculations
- Premium: Unlimited saves, export features
- Admin: Full access, user management

### 2.12 Data Validation & Error Handling
**Description**: Comprehensive input validation with user-friendly error messages.

#### 2.12.1 Client-Side Validation
- Real-time input validation
- Visual feedback (red borders, tooltips)
- Auto-suggestions for corrections
- Format masking (currency, percentages)

#### 2.12.2 Server-Side Validation
- Joi schema validation
- Type coercion and sanitization
- Rate limiting
- SQL/NoSQL injection prevention

#### 2.12.3 Error Handling
- Graceful degradation
- User-friendly messages
- Stack traces in development
- Error logging

### 2.13 Responsive Interface Design
**Description**: Mobile-first responsive design supporting all device types.

**Breakpoints**:
| Device | Width | Layout |
|--------|-------|--------|
| Mobile | < 640px | Single column, stacked |
| Tablet | 640-1024px | Two column where applicable |
| Desktop | > 1024px | Full layout, side panels |

**Responsive Features**:
- Fluid typography
- Touch-friendly controls
- Collapsible navigation
- Adaptive charts
- Pull-to-refresh on mobile
- Bottom navigation bar

---

## 3. Technical Architecture

### 3.1 Technology Stack

#### Frontend Technology
| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.2.0 | UI Framework |
| React DOM | 18.2.0 | DOM Rendering |
| Babel | Latest | JavaScript Compiler |
| Tailwind CSS | Latest | Styling Framework |
| Axios | ^1.13.6 | HTTP Client |
| Leaflet | 1.9.4 | Mapping (if needed) |
| Chart.js/Recharts | Latest | Data Visualization |

#### Backend Technology
| Technology | Version | Purpose |
|-----------|---------|---------|
| Node.js | LTS | Runtime Environment |
| Express | ^5.2.1 | Web Framework |
| Mongoose | ^9.3.0 | MongoDB ODM |
| Joi | Latest | Input Validation |
| JWT | Latest | Token Authentication |
| CORS | ^2.8.6 | Cross-Origin Support |
| Dotenv | ^17.3.1 | Environment Variables |
| bcrypt | Latest | Password Hashing |

#### Database
| Technology | Type | Purpose |
|-----------|------|---------|
| MongoDB | Document Store | Primary Database |
| In-Memory | Fallback | When DB unavailable |

### 3.2 System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT LAYER                             │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────────┐ │
│  │   Web UI    │  │  Mobile UI  │  │    API Consumers        │ │
│  │  (React)    │  │  (PWA)      │  │    (Mobile Apps)        │ │
│  └──────┬──────┘  └──────┬──────┘  └───────────┬─────────────┘ │
└─────────┼────────────────┼─────────────────────┼───────────────┘
          │                │                     │
          ▼                ▼                     ▼
┌─────────────────────────────────────────────────────────────────┐
│                       API GATEWAY LAYER                        │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │                    Express.js Server                        ││
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  ││
│  │  │  Auth Layer │  │ Validation   │  │  Error Handler  │  ││
│  │  │  (JWT/RBAC) │  │  (Joi)       │  │  (Centralized)  │  ││
│  │  └──────────────┘  └──────────────┘  └──────────────────┘  ││
│  └─────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                     BUSINESS LOGIC LAYER                        │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │ EMI Calculator │  │    Eligibility │  │  Flat Interest  │  │
│  │    Utility    │  │     Checker    │  │    Calculator   │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐  ┌──────────────────┐  │
│  │   Amortization │  │  Prepayment   │  │   Foreclosure   │  │
│  │    Generator   │  │   Calculator  │  │    Calculator   │  │
│  └────────────────┘  └────────────────┘  └──────────────────┘  │
│  ┌────────────────┐  ┌────────────────┐                       │
│  │    Logger      │  │   Scenario    │                       │
│  │   Utility     │  │  Comparator   │                       │
│  └────────────────┘  └────────────────┘                       │
└─────────────────────────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────────────────────────────────────────────────┐
│                        DATA LAYER                               │
│  ┌─────────────────────┐  ┌─────────────────────────────────┐  │
│  │   MongoDB Atlas     │  │      In-Memory Fallback         │  │
│  │   (Primary)         │  │      (When DB unavailable)      │  │
│  └─────────────────────┘  └─────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

### 3.3 Project Directory Structure

```
newproject-1/
├── .env                           # Environment variables
├── .env.example                   # Example environment config
├── package.json                   # Project dependencies
├── server.js                      # Main Express server
├── index.html                     # Frontend entry point
├── starfield.html                 # Additional frontend
│
├── emi-backend/                   # EMI Calculator Backend
│   ├── config/
│   │   └── db.js                  # MongoDB connection config
│   │
│   ├── middleware/
│   │   ├── auth.js                # Authentication middleware
│   │   ├── errorHandler.js        # Error handling middleware
│   │   └── validation.js          # Input validation middleware
│   │
│   ├── models/
│   │   ├── CalculationHistory.js  # Mongoose model for history
│   │   └── User.js               # User account model
│   │
│   ├── routes/
│   │   ├── emiRoutes.js          # EMI calculation routes
│   │   ├── authRoutes.js         # Authentication routes
│   │   └── userRoutes.js         # User management routes
│   │
│   └── utils/
│       ├── emiCalculator.js       # Core EMI calculation logic
│       ├── prepaymentCalculator.js # Prepayment calculations
│       ├── foreclosureCalculator.js # Foreclosure calculations
│       ├── scenarioComparator.js   # Multi-scenario comparison
│       └── logger.js              # Logging utility
│
└── .qodo/                         # Generated documentation
```

### 3.4 Component Interactions

#### User Request Flow
1. **Request Received**: User submits EMI calculation request via HTTP POST
2. **Authentication**: Auth middleware validates JWT token
3. **Validation**: Validation middleware checks input parameters
4. **Rate Limiting**: Check request frequency
5. **Processing**: EMI Calculator utility performs calculations
6. **Storage**: Calculation saved to database (if authenticated)
7. **Response**: Formatted response sent to client

#### Error Handling Flow
1. **Error Occurs**: Exception thrown in any layer
2. **Error Caught**: Express error handler catches the error
3. **Logging**: Error logged with full context
4. **Classification**: Error type determined (validation, auth, etc.)
5. **Response**: Appropriate HTTP status and error message returned

---

## 4. API Documentation

### 4.1 API Endpoints Overview

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| POST | /api/emi/calculate | Calculate EMI | Optional |
| POST | /api/emi/eligibility | Check loan eligibility | Optional |
| POST | /api/emi/prepayment | Calculate prepayment impact | Optional |
| POST | /api/emi/foreclosure | Calculate foreclosure amount | Optional |
| POST | /api/emi/compare | Compare multiple scenarios | Optional |
| POST | /api/emi/history | Save calculation | Required |
| GET | /api/emi/history | Get calculation history | Required |
| DELETE | /api/emi/history/:id | Delete calculation | Required |
| POST | /api/auth/register | User registration | Public |
| POST | /api/auth/login | User login | Public |
| POST | /api/auth/logout | User logout | Required |
| GET | /api/auth/user | Get current user | Required |
| PUT | /api/user/preferences | Update preferences | Required |

### 4.2 Calculate EMI

**Endpoint**: `POST /api/emi/calculate`

**Request Body**:
```json
{
  "principalAmount": 1000000,
  "interestRate": 8.5,
  "interestRateType": "fixed",
  "tenureMonths": 240,
  "propertyType": "home_loan"
}
```

**Request Parameters**:
| Field | Type | Required | Validation | Description |
|-------|------|----------|------------|-------------|
| principalAmount | Number | Yes | 1000 - 100000000 | Loan principal |
| interestRate | Number | Yes | 0.1 - 50 | Annual rate % |
| interestRateType | String | No | enum | Rate type |
| tenureMonths | Number | Yes | 1 - 600 | Months |
| propertyType | String | No | enum | Loan type |

**Success Response** (200):
```json
{
  "success": true,
  "data": {
    "principal": 1000000,
    "annualRate": 8.5,
    "interestRateType": "fixed",
    "tenureMonths": 240,
    "monthlyRate": 0.71,
    "emiAmount": 8356.57,
    "totalPayment": 2005576.80,
    "totalInterest": 1005576.80,
    "schedule": [
      {
        "month": 1,
        "principal": 2873.24,
        "interest": 5483.33,
        "balance": 997126.76
      }
    ]
  }
}
```

### 4.3 Check Loan Eligibility

**Endpoint**: `POST /api/emi/eligibility`

**Request Body**:
```json
{
  "monthlyIncome": 100000,
  "existingEMI": 5000,
  "creditScore": 750,
  "loanAmount": 2000000,
  "interestRate": 8.5,
  "tenureMonths": 240,
  "propertyType": "home_loan"
}
```

### 4.4 Prepayment Calculation

**Endpoint**: `POST /api/emi/prepayment`

**Request Body**:
```json
{
  "principalAmount": 1000000,
  "interestRate": 8.5,
  "tenureMonths": 240,
  "prepaymentAmount": 100000,
  "prepaymentMonth": 12,
  "recalculateOption": "reduced_tenure"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "originalEMI": 8356.57,
    "newEMI": null,
    "newTenureMonths": 189,
    "interestSavings": 285420.50,
    "earlyPayoffMonth": 189
  }
}
```

### 4.5 Foreclosure Calculation

**Endpoint**: `POST /api/emi/foreclosure`

**Request Body**:
```json
{
  "principalAmount": 1000000,
  "interestRate": 8.5,
  "tenureMonths": 240,
  "currentMonth": 24,
  "foreclosureCharges": 2
}
```

### 4.6 Multi-Scenario Comparison

**Endpoint**: `POST /api/emi/compare`

**Request Body**:
```json
{
  "scenarios": [
    {
      "name": "Option A",
      "principalAmount": 1000000,
      "interestRate": 8.5,
      "tenureMonths": 240
    },
    {
      "name": "Option B",
      "principalAmount": 1000000,
      "interestRate": 7.5,
      "tenureMonths": 180
    },
    {
      "name": "Option C",
      "principalAmount": 800000,
      "interestRate": 8.5,
      "tenureMonths": 240
    }
  ]
}
```

### 4.7 User Authentication

**Register** - `POST /api/auth/register`
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Login** - `POST /api/auth/login`
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1...",
    "user": {
      "id": "507f1f77bcf86cd799439011",
      "email": "user@example.com",
      "name": "John Doe",
      "role": "user"
    },
    "expiresAt": "2024-01-22T10:30:00.000Z"
  }
}
```

---

## 5. Database Schema

### 5.1 MongoDB Collections

#### Users Collection
```javascript
{
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true
  },
  password: {
    type: String,
    required: true,
    minLength: 8
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  role: {
    type: String,
    enum: ['guest', 'user', 'premium', 'admin'],
    default: 'user'
  },
  preferences: {
    currency: { type: String, default: 'INR' },
    defaultTenureUnit: { type: String, enum: ['months', 'years'], default: 'months' },
    theme: { type: String, enum: ['light', 'dark'], default: 'dark' }
  },
  maxCalculations: { type: Number, default: 10 },
  createdAt: Date,
  updatedAt: Date
}
```

#### CalculationHistory Collection
```javascript
{
  userId: { type: String, required: true, index: true },
  
  // Loan Details
  principalAmount: { type: Number, required: true, min: 0 },
  interestRate: { type: Number, required: true, min: 0, max: 100 },
  interestRateType: { 
    type: String, 
    enum: ['fixed', 'variable', 'floating', 'mixed'],
    default: 'fixed' 
  },
  tenureMonths: { type: Number, required: true, min: 1, max: 600 },
  
  // EMI Result
  emiAmount: { type: Number, required: true },
  totalInterest: { type: Number, required: true },
  totalPayment: { type: Number, required: true },
  
  // Prepayment/Foreclosure (if applicable)
  prepaymentAmount: { type: Number },
  prepaymentMonth: { type: Number },
  foreclosureAmount: { type: Number },
  
  // Eligibility
  eligibilityStatus: {
    type: String,
    enum: ['eligible', 'not_eligible', 'conditional'],
    default: 'eligible'
  },
  eligibilityScore: { type: Number, min: 0, max: 100 },
  monthlyIncome: { type: Number, min: 0 },
  existingEMI: { type: Number, default: 0 },
  creditScore: { type: Number, min: 300, max: 900 },
  
  // Metadata
  calculationType: {
    type: String,
    enum: ['emi_calculation', 'eligibility_check', 'prepayment', 'foreclosure', 'comparison'],
    default: 'emi_calculation'
  },
  propertyType: {
    type: String,
    enum: ['home_loan', 'personal_loan', 'car_loan', 'education_loan', 'other'],
    default: 'other'
  },
  
  // Tracking
  ipAddress: { type: String },
  userAgent: { type: String },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date }
}
```

#### SavedScenarios Collection
```javascript
{
  userId: { type: String, required: true, index: true },
  name: { type: String, required: true },
  scenarios: [
    {
      name: String,
      principalAmount: Number,
      interestRate: Number,
      tenureMonths: Number,
      propertyType: String
    }
  ],
  comparisonType: { type: String, enum: ['rate', 'tenure', 'amount', 'custom'] },
  createdAt: { type: Date, default: Date.now }
}
```

### 5.2 Database Indexes

```javascript
// User indexes
{ email: 1 }, { unique: true }

// CalculationHistory indexes
{ userId: 1, createdAt: -1 }
{ createdAt: -1 }
{ principalAmount: 1 }

// SavedScenarios indexes
{ userId: 1, createdAt: -1 }
```

### 5.3 Entity Relationships

```
┌─────────────────────────────────────────────────────────┐
│                         Users                            │
│  (Primary Entity)                                      │
├─────────────────────────────────────────────────────────┤
│  _id (PK)                                              │
│  email                                                 │
│  role                                                  │
└───────────────────────────┬─────────────────────────────┘
                            │
              ┌─────────────┴─────────────┐
              │                           │
              ▼                           ▼
┌─────────────────────────┐   ┌─────────────────────────┐
│   CalculationHistory    │   │     SavedScenarios      │
│  (One-to-Many)         │   │   (One-to-Many)        │
├─────────────────────────┤   ├─────────────────────────┤
│  userId (FK)           │   │  userId (FK)            │
│  calculationId (PK)    │   │  scenarioId (PK)       │
└─────────────────────────┘   └─────────────────────────┘
```

---

## 6. Validation Logic

### 6.1 Input Validation Rules

#### EMI Calculation Validation
| Field | Type | Min | Max | Required | Custom Rules |
|-------|------|-----|-----|----------|--------------|
| principalAmount | Number | 1,000 | 100,000,000 | Yes | Must be positive |
| interestRate | Number | 0.1 | 50 | Yes | Must be positive |
| interestRateType | String | - | - | No | Must be valid enum |
| tenureMonths | Number | 1 | 600 | Yes | Must be integer |

#### Eligibility Check Validation
| Field | Type | Min | Max | Default | Required |
|-------|------|-----|-----|---------|----------|
| monthlyIncome | Number | 1,000 | ∞ | - | Yes |
| existingEMI | Number | 0 | ∞ | 0 | No |
| creditScore | Number | 300 | 900 | 650 | No |
| loanAmount | Number | 1,000 | 100,000,000 | - | Yes |
| interestRate | Number | 0.1 | 50 | - | Yes |
| tenureMonths | Number | 1 | 600 | - | Yes |

#### User Registration Validation
| Field | Type | Rules | Required |
|-------|------|-------|----------|
| email | String | Valid email format, unique | Yes |
| password | String | Min 8 chars, 1 uppercase, 1 number | Yes |
| name | String | Min 2 chars, max 50 chars | Yes |

### 6.2 Error Messages

#### Principal Amount Errors
- **number.positive**: "Principal amount must be positive"
- **number.min**: "Minimum principal amount is 1000"
- **number.max**: "Maximum principal amount is 100 crore"
- **any.required**: "Principal amount is required"

#### Interest Rate Errors
- **number.positive**: "Interest rate must be positive"
- **number.min**: "Minimum interest rate is 0.1%"
- **number.max**: "Maximum interest rate is 50%"
- **any.required**: "Interest rate is required"
- **any.only**: "Please select a valid interest rate type"

#### Tenure Errors
- **number.integer**: "Tenure must be a whole number"
- **number.positive**: "Tenure must be positive"
- **number.min**: "Minimum tenure is 1 month"
- **number.max**: "Maximum tenure is 600 months (50 years)"
- **any.required**: "Tenure is required"

#### Credit Score Errors
- **number.integer**: "Credit score must be a whole number"
- **number.min**: "Minimum credit score is 300"
- **number.max**: "Maximum credit score is 900"

### 6.3 Validation Flow

```
User Input
    │
    ▼
┌─────────────────┐
│  Client        │
│  Validation    │
└────────┬────────┘
         │
         ▼
    API Request
         │
         ▼
┌─────────────────┐
│  JWT Check     │
│  (Auth)        │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│  Joi Schema    │
│  Validation    │
└────────┬────────┘
         │
    ┌────┴────┐
    │         │
    ▼         ▼
 Valid    Invalid
    │         │
    ▼         ▼
 Process   400 Error
 Request   Response
    │
    ▼
 Response
```

### 6.4 Edge Case Handling

| Scenario | Handling |
|----------|----------|
| Zero values | Reject with "must be positive" error |
| Negative values | Reject with validation error |
| Decimal tenure | Convert to integer or reject |
| Very large numbers | Cap at maximum allowed values |
| Null/undefined | Reject with "required" error |
| Special characters | Strip unknown fields |
| Invalid rate type | Default to 'fixed' |
| MongoDB unavailable | Use in-memory fallback |
| Token expired | Return 401, suggest re-login |
| Rate limit exceeded | Return 429 with retry-after |

---

## 7. EMI Calculation Methodology

### 7.1 Standard EMI Formula (Reducing Balance Method)

The EMI Calculator uses the standard reducing balance method:

```
EMI = [P × r × (1 + r)^n] / [(1 + r)^n – 1]

Where:
- EMI = Equated Monthly Installment
- P = Principal loan amount
- r = Monthly interest rate (annual rate / 12 / 100)
- n = Number of monthly installments
```

### 7.2 Calculation Steps

**Step 1: Convert Annual Rate to Monthly Rate**
```
monthlyRate = annualRate / 12 / 100
```

**Step 2: Calculate Compound Factor**
```
power = (1 + monthlyRate)^tenureMonths
```

**Step 3: Calculate EMI**
```
emi = (principal * monthlyRate * power) / (power - 1)
```

**Step 4: Calculate Total Payment**
```
totalPayment = emi × tenureMonths
```

**Step 5: Calculate Total Interest**
```
totalInterest = totalPayment - principal
```

### 7.3 Flat Interest Rate Method (Alternative)

For comparison, the application also supports flat interest rate calculation:

```
Total Interest = (Principal × Rate × Time) / 100
Total Payment = Principal + Total Interest
EMI = Total Payment / Months
```

### 7.4 Amortization Schedule Algorithm

```javascript
function generateAmortizationSchedule(principal, monthlyRate, emi, tenure) {
  let balance = principal;
  let cumulativeInterest = 0;
  let cumulativePrincipal = 0;
  const schedule = [];
  
  for (let month = 1; month <= tenure; month++) {
    // Interest portion = Current Balance × Monthly Rate
    const interestPayment = balance × monthlyRate;
    
    // Principal portion = EMI - Interest Payment
    const principalPayment = emi - interestPayment;
    
    // Update remaining balance
    balance = Math.max(0, balance - principalPayment);
    
    // Update cumulative values
    cumulativeInterest += interestPayment;
    cumulativePrincipal += principalPayment;
    
    schedule.push({
      month,
      emi,
      principalPayment,
      interestPayment,
      balance,
      cumulativeInterest,
      cumulativePrincipal
    });
  }
  
  return schedule;
}
```

### 7.5 Prepayment Calculation

**Scenario 1: Reduce EMI, Maintain Tenure**
```javascript
newEMI = calculateEMI(remainingPrincipal, rate, remainingTenure)
```

**Scenario 2: Reduce Tenure, Maintain EMI**
```javascript
// Recalculate tenure where EMI equals current payment
// Using iterative approach or formula inversion
```

**Interest Savings**:
```
savings = originalTotalInterest - newTotalInterest
```

### 7.6 Foreclosure Calculation

```javascript
// Outstanding Principal
outstandingPrincipal = originalPrincipal - principalPaid

// Interest Till Date
interestPaid = cumulativeInterest[currentMonth]

// Foreclosure Charges (percentage)
charges = outstandingPrincipal × (chargesPercent / 100)

// Total Payoff
payoffAmount = outstandingPrincipal + interestPaid + charges
```

### 7.7 Loan Eligibility Algorithm

**Step 1: Determine Maximum EMI Ratio**
```javascript
const maxEMItoIncomeRatio = {
  home_loan: 0.6,
  personal_loan: 0.5,
  car_loan: 0.4,
  education_loan: 0.5,
  other: 0.4
};
```

**Step 2: Calculate Available EMI**
```javascript
maxAllowedEMI = monthlyIncome × maxEMItoIncomeRatio[propertyType]
availableEMI = maxAllowedEMI - existingEMI
```

**Step 3: Calculate Required EMI**
```javascript
requiredEMI = calculateEMI(loanAmount, interestRate, tenureMonths)
```

**Step 4: Calculate Eligibility Score**
```javascript
emiRatio = requiredEMI / availableEMI
baseScore = max(0, min(100, (1 - emiRatio) × 100))

// Adjust for credit score
if (creditScore >= 750) score = min(100, baseScore + 20)
else if (creditScore >= 700) score = min(100, baseScore + 10)
else if (creditScore < 550) score = max(0, baseScore - 30)
```

**Step 5: Determine Status**
```javascript
if (score >= 70 && requiredEMI <= availableEMI) status = 'eligible'
else if (score >= 40 && requiredEMI <= availableEMI * 1.2) status = 'conditional'
else status = 'not_eligible'
```

---

## 8. Data Flow

### 8.1 Complete Data Flow Diagram

```
┌─────────────┐     ┌──────────────┐     ┌─────────────────┐
│   Client    │────▶│   Express    │────▶│  Auth Middle   │
│  (Browser)   │     │   Server     │     │    ware        │
└─────────────┘     └──────────────┘     └───────┬─────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │ Validation      │
                                         │ Middleware      │
                                         └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │ Rate Limiter    │
                                         │ Middleware      │
                                         └────────┬────────┘
                                                  │
                                                  ▼
                                         ┌─────────────────┐
                                         │ EMI Calculator  │
                                         │ Service         │
                                         └────────┬────────┘
                                                  │
                                    ┌────────────┼────────────┐
                                    ▼            ▼            ▼
                            ┌────────────┐ ┌──────────┐ ┌──────────┐
                            │ Database   │ │  Cache   │ │  Logger  │
                            │ (MongoDB)  │ │ (Redis)   │ │          │
                            └────────────┘ └──────────┘ └──────────┘
```

### 8.2 Request Processing Pipeline

```
HTTP Request
    │
    ▼
┌────────────────────────────────────────┐
│ 1. CORS Middleware                     │
│    - Add CORS headers                  │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 2. Body Parser                         │
│    - Parse JSON body                   │
│    - Limit: 1MB                        │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 3. Static Files                        │
│    - Serve frontend                    │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 4. Authentication Middleware           │
│    - Validate JWT                      │
│    - Check roles                       │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 5. Rate Limiter                        │
│    - Prevent abuse                     │
│    - Track requests                    │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 6. Validation Middleware               │
│    - Validate schema                   │
│    - Sanitize input                    │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 7. Route Handler                       │
│    - Process request                   │
│    - Calculate EMI                     │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 8. Database Operation                  │
│    - Save history                      │
│    - Retrieve data                     │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ 9. Response                            │
│    - Format JSON                       │
│    - Send to client                    │
└────────────────────────────────────────┘
```

### 8.3 Error Flow

```
Error Occurred
    │
    ▼
┌────────────────────────────────────────┐
│ Error Handler Middleware               │
│    - Catch exception                   │
│    - Log error                        │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ Error Classification                   │
│    - ValidationError (400)             │
│    - UnauthorizedError (401)            │
│    - ForbiddenError (403)              │
│    - NotFoundError (404)               │
│    - APIError (500)                    │
│    - RateLimitError (429)              │
└────────────────────────────────────────┘
    │
    ▼
┌────────────────────────────────────────┐
│ Error Response                         │
│    - Status code                      │
│    - Error message                    │
│    - Stack trace (dev only)           │
└────────────────────────────────────────┘
```

---

## 9. Test Cases

### 9.1 EMI Calculation Test Cases

#### Test Case 1: Basic Home Loan
**Input**:
- Principal: ₹10,00,000
- Interest Rate: 8.5% p.a.
- Tenure: 240 months (20 years)
- Rate Type: Fixed

**Expected Output**:
- EMI: ₹8,356.57
- Total Payment: ₹20,05,576.80
- Total Interest: ₹10,05,576.80

#### Test Case 2: Short Tenure Personal Loan
**Input**:
- Principal: ₹1,00,000
- Interest Rate: 12% p.a.
- Tenure: 12 months

**Expected Output**:
- EMI: ₹8,884.88
- Total Payment: ₹1,06,618.56
- Total Interest: ₹6,618.56

#### Test Case 3: Car Loan
**Input**:
- Principal: ₹5,00,000
- Interest Rate: 9% p.a.
- Tenure: 60 months

**Expected Output**:
- EMI: ₹10,374.79
- Total Payment: ₹6,22,487.40
- Total Interest: ₹1,22,487.40

#### Test Case 4: Education Loan
**Input**:
- Principal: ₹20,00,000
- Interest Rate: 7.5% p.a.
- Tenure: 120 months

**Expected Output**:
- EMI: ₹23,492.67
- Total Payment: ₹28,19,120.40
- Total Interest: ₹8,19,120.40

#### Test Case 5: Edge - Minimum Values
**Input**:
- Principal: ₹1,000
- Interest Rate: 0.1% p.a.
- Tenure: 1 month

**Expected Output**:
- EMI: ₹1,000.08
- Total Payment: ₹1,000.08
- Total Interest: ₹0.08

#### Test Case 6: Edge - Maximum Tenure
**Input**:
- Principal: ₹1,00,00,000
- Interest Rate: 15% p.a.
- Tenure: 600 months

**Expected Output**:
- EMI: ₹12,64,481.58
- Total Payment: ₹75,86,89,480.00
- Total Interest: ₹74,86,89,480.00

### 9.2 Eligibility Test Cases

#### Test Case 7: Eligible Home Loan
**Input**:
- Monthly Income: ₹1,00,000
- Existing EMI: ₹5,000
- Credit Score: 750
- Loan Amount: ₹20,00,000
- Interest Rate: 8.5%
- Tenure: 240 months
- Property Type: home_loan

**Expected Output**:
- Eligible: true
- Status: "eligible"
- Score: 85
- Max Allowed EMI: ₹60,000
- Available EMI: ₹55,000
- Required EMI: ₹16,713.14

#### Test Case 8: Not Eligible - High EMI
**Input**:
- Monthly Income: ₹30,000
- Existing EMI: ₹10,000
- Credit Score: 650
- Loan Amount: ₹50,00,000
- Interest Rate: 10%
- Tenure: 120 months

**Expected Output**:
- Eligible: false
- Status: "not_eligible"
- Score: 45
- Max Allowed EMI: ₹15,000
- Available EMI: ₹5,000
- Required EMI: ₹66,074.25

### 9.3 Prepayment Test Cases

#### Test Case 9: Prepayment - Reduce Tenure
**Input**:
- Principal: ₹10,00,000
- Rate: 8.5%
- Tenure: 240 months
- Prepayment: ₹1,00,000 at month 12
- Option: Reduce tenure

**Expected Output**:
- New Tenure: ~189 months
- Interest Savings: ~₹2,85,420

### 9.4 Foreclosure Test Cases

#### Test Case 10: Full Foreclosure
**Input**:
- Principal: ₹10,00,000
- Rate: 8.5%
- Original Tenure: 240 months
- Current Month: 24
- Foreclosure Charges: 2%

**Expected Output**:
- Outstanding Principal: ~₹9,76,000
- Interest Paid: ~₹1,32,000
- Foreclosure Charges: ~₹19,520
- Total Payoff: ~₹11,27,520

### 9.5 Validation Test Cases

#### Test Case 11: Invalid Principal - Below Minimum
**Input**: principalAmount: 500
**Expected Error**: "Minimum principal amount is 1000"

#### Test Case 12: Invalid Principal - Above Maximum
**Input**: principalAmount: 200000000
**Expected Error**: "Maximum principal amount is 100 crore"

#### Test Case 13: Invalid Interest Rate - Zero
**Input**: interestRate: 0
**Expected Error**: "Minimum interest rate is 0.1%"

#### Test Case 14: Invalid Tenure - Non-integer
**Input**: tenureMonths: 12.5
**Expected Error**: "Tenure must be a whole number"

#### Test Case 15: Invalid Credit Score
**Input**: creditScore: 950
**Expected Error**: "Maximum credit score is 900"

### 9.6 Authentication Test Cases

#### Test Case 16: Successful Registration
**Input**:
```json
{
  "email": "newuser@example.com",
  "password": "Password123",
  "name": "New User"
}
```
**Expected**: 201 Created, user object returned

#### Test Case 17: Invalid Login
**Input**:
```json
{
  "email": "user@example.com",
  "password": "wrongpassword"
}
```
**Expected**: 401 Unauthorized

---

## Appendix A: Environment Variables

| Variable | Default | Description |
|----------|---------|-------------|
| PORT | 3000 | Server port |
| MONGODB_URI | mongodb://localhost:27017/emi_calculator | Database connection string |
| JWT_SECRET | random string | JWT signing secret |
| JWT_EXPIRES_IN | 7d | Token expiration time |
| RATE_LIMIT | 100/min | API rate limit |
| NODE_ENV | development | Environment mode |

---

## Appendix B: Dependencies Version

```json
{
  "axios": "^1.13.6",
  "bcrypt": "^5.1.0",
  "cors": "^2.8.6",
  "dotenv": "^17.3.1",
  "express": "^5.2.1",
  "joi": "^17.11.0",
  "jsonwebtoken": "^9.0.2",
  "mongoose": "^9.3.0"
}
```

---

*Document Version: 2.0*
*Last Updated: 2024*
*Author: EMI Calculator Development Team*
