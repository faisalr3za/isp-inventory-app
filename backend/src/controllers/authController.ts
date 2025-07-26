import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import Joi from 'joi';
import { UserModel, User } from '../models/User';

// Generate JWT Token
const generateToken = (id: number): string => {
  return jwt.sign({ id }, process.env.JWT_SECRET!, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

// Validation schemas
const loginSchema = Joi.object({
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi'
  })
});

const registerSchema = Joi.object({
  username: Joi.string().alphanum().min(3).max(30).required().messages({
    'string.alphanum': 'Username hanya boleh huruf dan angka',
    'string.min': 'Username minimal 3 karakter',
    'string.max': 'Username maksimal 30 karakter',
    'any.required': 'Username wajib diisi'
  }),
  email: Joi.string().email().required().messages({
    'string.email': 'Format email tidak valid',
    'any.required': 'Email wajib diisi'
  }),
  password: Joi.string().min(6).required().messages({
    'string.min': 'Password minimal 6 karakter',
    'any.required': 'Password wajib diisi'
  }),
  nama_lengkap: Joi.string().min(2).max(100).required().messages({
    'string.min': 'Nama lengkap minimal 2 karakter',
    'string.max': 'Nama lengkap maksimal 100 karakter',
    'any.required': 'Nama lengkap wajib diisi'
  }),
  role: Joi.string().valid('admin', 'teknisi', 'sales', 'manager').required().messages({
    'any.only': 'Role harus salah satu dari: admin, teknisi, sales, manager',
    'any.required': 'Role wajib diisi'
  }),
  no_telp: Joi.string().pattern(/^[0-9+\-\s]+$/).messages({
    'string.pattern.base': 'Format nomor telepon tidak valid'
  }),
  alamat: Joi.string().max(255).messages({
    'string.max': 'Alamat maksimal 255 karakter'
  })
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasi input
    const { error, value } = loginSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }

    const { email, password } = value;

    // Cari user berdasarkan email
    const user = await UserModel.findByEmail(email);
    if (!user) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
      return;
    }

    // Cek status user
    if (user.status !== 'aktif') {
      res.status(401).json({
        success: false,
        message: 'Akun Anda tidak aktif. Hubungi administrator.'
      });
      return;
    }

    // Verifikasi password
    const isPasswordValid = await UserModel.verifyPassword(password, user.password_hash!);
    if (!isPasswordValid) {
      res.status(401).json({
        success: false,
        message: 'Email atau password salah'
      });
      return;
    }

    // Generate token
    const token = generateToken(user.id!);

    // Response sukses
    res.json({
      success: true,
      message: 'Login berhasil',
      data: {
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          nama_lengkap: user.nama_lengkap,
          role: user.role,
          no_telp: user.no_telp
        }
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public (untuk demo, di production sebaiknya hanya admin)
export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    // Validasi input
    const { error, value } = registerSchema.validate(req.body);
    if (error) {
      res.status(400).json({
        success: false,
        message: error.details[0].message
      });
      return;
    }

    const { username, email, password, nama_lengkap, role, no_telp, alamat } = value;

    // Cek apakah email sudah terdaftar
    const existingUserByEmail = await UserModel.findByEmail(email);
    if (existingUserByEmail) {
      res.status(400).json({
        success: false,
        message: 'Email sudah terdaftar'
      });
      return;
    }

    // Cek apakah username sudah terdaftar
    const existingUserByUsername = await UserModel.findByUsername(username);
    if (existingUserByUsername) {
      res.status(400).json({
        success: false,
        message: 'Username sudah digunakan'
      });
      return;
    }

    // Buat user baru
    const newUser = await UserModel.create({
      username,
      email,
      password,
      nama_lengkap,
      role,
      no_telp,
      alamat,
      status: 'aktif'
    });

    // Generate token
    const token = generateToken(newUser.id!);

    // Response sukses
    res.status(201).json({
      success: true,
      message: 'Registrasi berhasil',
      data: {
        token,
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email,
          nama_lengkap: newUser.nama_lengkap,
          role: newUser.role,
          no_telp: newUser.no_telp
        }
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Terjadi kesalahan pada server'
    });
  }
};
