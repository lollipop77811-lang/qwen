import { body, param, query as queryValidator, validationResult } from 'express-validator';

/**
 * Middleware to handle validation errors
 */
export const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map(err => ({
        field: err.path,
        message: err.msg
      }))
    });
  }
  
  next();
};

/**
 * Login validation rules
 */
export const loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  
  handleValidationErrors
];

/**
 * Register user validation rules
 */
export const registerUserValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 8 }).withMessage('Password must be at least 8 characters')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
    .withMessage('Password must contain at least one uppercase letter, one lowercase letter, one number, and one special character'),
  
  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['Admin', 'Doctor', 'Nurse', 'FrontDesk', 'LabTechnician', 'Pharmacist'])
    .withMessage('Invalid role'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
  
  body('specialization')
    .optional()
    .trim(),
  
  body('licenseNumber')
    .optional()
    .trim(),
  
  handleValidationErrors
];

/**
 * Update user validation rules
 */
export const updateUserValidation = [
  param('id')
    .isUUID().withMessage('Invalid user ID format'),
  
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 }).withMessage('Name must be between 2 and 100 characters'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
  
  body('address')
    .optional()
    .trim(),
  
  body('specialization')
    .optional()
    .trim(),
  
  body('licenseNumber')
    .optional()
    .trim(),
  
  body('isActive')
    .optional()
    .isBoolean().withMessage('isActive must be a boolean'),
  
  handleValidationErrors
];

/**
 * Create patient validation rules
 */
export const createPatientValidation = [
  body('firstName')
    .trim()
    .notEmpty().withMessage('First name is required')
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
  
  body('lastName')
    .optional()
    .trim(),
  
  body('dob')
    .notEmpty().withMessage('Date of birth is required')
    .isISO8601().withMessage('Invalid date format')
    .custom((value) => {
      const dob = new Date(value);
      const today = new Date();
      if (dob > today) {
        throw new Error('Date of birth cannot be in the future');
      }
      return true;
    }),
  
  body('gender')
    .notEmpty().withMessage('Gender is required')
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender'),
  
  body('phone')
    .trim()
    .notEmpty().withMessage('Phone number is required')
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
  
  body('alternatePhone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid alternate phone number'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email')
    .normalizeEmail(),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  
  body('address')
    .optional()
    .trim(),
  
  body('city')
    .optional()
    .trim(),
  
  body('state')
    .optional()
    .trim(),
  
  body('pincode')
    .optional()
    .trim()
    .matches(/^\d{6}$/).withMessage('Invalid pincode format'),
  
  body('emergencyContactName')
    .optional()
    .trim(),
  
  body('emergencyContactPhone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid emergency contact phone number'),
  
  handleValidationErrors
];

/**
 * Update patient validation rules
 */
export const updatePatientValidation = [
  param('id')
    .isUUID().withMessage('Invalid patient ID format'),
  
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 }).withMessage('First name must be between 1 and 100 characters'),
  
  body('lastName')
    .optional()
    .trim(),
  
  body('dob')
    .optional()
    .isISO8601().withMessage('Invalid date format'),
  
  body('gender')
    .optional()
    .isIn(['Male', 'Female', 'Other', 'Prefer not to say'])
    .withMessage('Invalid gender'),
  
  body('phone')
    .optional()
    .trim()
    .matches(/^\+?[\d\s-]{10,}$/).withMessage('Please provide a valid phone number'),
  
  body('email')
    .optional()
    .trim()
    .isEmail().withMessage('Please provide a valid email'),
  
  body('bloodGroup')
    .optional()
    .isIn(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).withMessage('Invalid blood group'),
  
  handleValidationErrors
];

/**
 * UUID parameter validation
 */
export const uuidParamValidation = [
  param('id')
    .isUUID().withMessage('Invalid ID format'),
  handleValidationErrors
];

/**
 * Pagination query validation
 */
export const paginationValidation = [
  queryValidator('page')
    .optional()
    .isInt({ min: 1 }).withMessage('Page must be a positive integer'),
  
  queryValidator('limit')
    .optional()
    .isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
  
  handleValidationErrors
];

export default {
  handleValidationErrors,
  loginValidation,
  registerUserValidation,
  updateUserValidation,
  createPatientValidation,
  updatePatientValidation,
  uuidParamValidation,
  paginationValidation
};
