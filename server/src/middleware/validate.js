import { body, validationResult } from 'express-validator';

export function handleValidationErrors(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    const firstError = errors.array()[0];
    return res.status(400).json({
      error: { message: firstError.msg, field: firstError.path },
    });
  }
  next();
}

export const registerRules = [
  body('name')
    .notEmpty().withMessage('El nombre es obligatorio')
    .isLength({ max: 100 }).withMessage('El nombre no puede exceder 100 caracteres')
    .trim(),

  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d{10}$/).withMessage('El teléfono debe tener 10 dígitos'),

  body('email')
    .notEmpty().withMessage('El correo electrónico es obligatorio')
    .isEmail().withMessage('Ingresa un correo electrónico válido')
    .isLength({ max: 254 }).withMessage('El correo no puede exceder 254 caracteres')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 128 }).withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial'),

  body('acceptedTerms')
    .isBoolean().withMessage('Debes aceptar los Términos y Condiciones')
    .custom((value) => {
      if (value !== true) {
        throw new Error('Debes aceptar los Términos y Condiciones');
      }
      return true;
    }),

  body('privacyAccepted')
    .isBoolean().withMessage('Debes aceptar el Aviso de Privacidad')
    .custom((value) => {
      if (value !== true) {
        throw new Error('Debes aceptar el Aviso de Privacidad');
      }
      return true;
    }),

  handleValidationErrors,
];

export const verifyOtpRules = [
  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d{10}$/).withMessage('El teléfono debe tener 10 dígitos'),

  body('code')
    .notEmpty().withMessage('El código es obligatorio')
    .matches(/^\d{6}$/).withMessage('El código debe tener 6 dígitos'),

  body('sessionToken')
    .notEmpty().withMessage('La sesión de registro es obligatoria')
    .isString().withMessage('Sesión de registro inválida'),

  handleValidationErrors,
];

export const resendOtpRules = [
  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d{10}$/).withMessage('El teléfono debe tener 10 dígitos'),

  handleValidationErrors,
];
