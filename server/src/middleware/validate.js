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

export const loginRules = [
  body('identifier')
    .notEmpty().withMessage('El identificador es obligatorio')
    .isLength({ max: 254 }).withMessage('El identificador no puede exceder 254 caracteres')
    .trim(),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria'),

  handleValidationErrors,
];

export const resendOtpRules = [
  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d{10}$/).withMessage('El teléfono debe tener 10 dígitos'),

  handleValidationErrors,
];

export const forgotPasswordRules = [
  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d{10}$/).withMessage('El teléfono debe tener 10 dígitos'),

  handleValidationErrors,
];

export const resetPasswordRules = [
  body('phone')
    .notEmpty().withMessage('El teléfono es obligatorio')
    .matches(/^\d{10}$/).withMessage('El teléfono debe tener 10 dígitos'),

  body('code')
    .notEmpty().withMessage('El código es obligatorio')
    .matches(/^\d{6}$/).withMessage('El código debe tener 6 dígitos'),

  body('password')
    .notEmpty().withMessage('La contraseña es obligatoria')
    .isLength({ min: 8, max: 128 }).withMessage('La contraseña debe tener entre 8 y 128 caracteres')
    .matches(/[!@#$%^&*(),.?":{}|<>]/).withMessage('La contraseña debe contener al menos un carácter especial'),

  handleValidationErrors,
];

export const updateProfileRules = [
  body('gender')
    .notEmpty().withMessage('El género es obligatorio')
    .isIn(['Hombre', 'Mujer', 'Otro', 'Prefiero no decir']).withMessage('Género inválido'),

  body('age')
    .notEmpty().withMessage('El rango de edad es obligatorio')
    .isIn(['<20', '20-29', '30-39', '40-49', '50-59', '60+', 'OTRA']).withMessage('Rango de edad inválido'),

  body('esquema')
    .notEmpty().withMessage('El esquema de participación es obligatorio')
    .isIn(['Puntos de Acopio', 'Ruta en casa']).withMessage('Esquema inválido'),

  body('residuo')
    .notEmpty().withMessage('El tipo de residuo es obligatorio'),

  body('frecuencia')
    .notEmpty().withMessage('La frecuencia es obligatoria')
    .isIn(['Semanal', 'Quincenal']).withMessage('Frecuencia inválida'),

  handleValidationErrors,
];
