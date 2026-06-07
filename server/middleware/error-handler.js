import { logger } from '../config/logger.js';

export function errorHandler(err, req, res, next) {
  logger.error(err.stack || err.message);
  const message = process.env.NODE_ENV === 'production' ? 'Error interno del servidor' : (err.message || 'Internal server error');
  res.status(err.status || 500).json({
    error: {
      message,
      ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
    },
  });
}
