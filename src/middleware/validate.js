import { body, validationResult } from 'express-validator';

const priceRule = (chain) =>
  chain.optional().isFloat({ min: 0 }).withMessage('price must be a non-negative number');

const stockRule = (chain) =>
  chain.optional().isInt({ min: 0 }).withMessage('stock must be a non-negative integer');

export const createBookValidation = [
  body('title').notEmpty().withMessage('title is required'),
  body('author').notEmpty().withMessage('author is required'),
  priceRule(body('price')),
  stockRule(body('stock')),
];

export const updateBookValidation = [
  body('title').optional().notEmpty().withMessage('title must not be empty'),
  body('author').optional().notEmpty().withMessage('author must not be empty'),
  priceRule(body('price')),
  stockRule(body('stock')),
];

export function validate(req, res, next) {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({ errors: errors.array().map((e) => ({ field: e.path, message: e.msg })) });
  }
  next();
}
