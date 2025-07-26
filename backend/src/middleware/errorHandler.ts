import { Request, Response, NextFunction } from 'express';

export interface AppError extends Error {
  statusCode?: number;
  isOperational?: boolean;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  // Log error
  console.error('Error:', err);

  // Default error
  let statusCode = error.statusCode || 500;
  let message = error.message || 'Terjadi kesalahan pada server';

  // Mongoose bad ObjectId
  if (err.name === 'CastError') {
    message = 'ID tidak valid';
    statusCode = 400;
  }

  // Mongoose duplicate key
  if (err.message.includes('duplicate key')) {
    message = 'Data sudah ada';
    statusCode = 400;
  }

  // Mongoose validation error
  if (err.name === 'ValidationError') {
    message = 'Data tidak valid';
    statusCode = 400;
  }

  // JWT errors
  if (err.name === 'JsonWebTokenError') {
    message = 'Token tidak valid';
    statusCode = 401;
  }

  if (err.name === 'TokenExpiredError') {
    message = 'Token sudah kadaluarsa';
    statusCode = 401;
  }

  res.status(statusCode).json({
    success: false,
    message,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack })
  });
};

export const asyncHandler = (fn: Function) => (req: Request, res: Response, next: NextFunction) =>
  Promise.resolve(fn(req, res, next)).catch(next);
