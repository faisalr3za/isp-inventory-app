import express from 'express';
import asyncHandler from '../middleware/asyncHandler';
import { login, register } from '../controllers/authController';

const router = express.Router();

// @route  POST api/auth/login
// @desc   Login user
// @access Public
router.post('/login', asyncHandler(login));

// @route  POST api/auth/register
// @desc   Register new user
// @access Public
router.post('/register', asyncHandler(register));

export default router;
