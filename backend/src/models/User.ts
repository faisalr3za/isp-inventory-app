import { db } from '../config/database';
import bcrypt from 'bcryptjs';

export interface User {
  id?: number;
  username: string;
  email: string;
  password?: string;
  password_hash?: string;
  role: 'admin' | 'teknisi' | 'sales' | 'manager';
  nama_lengkap: string;
  no_telp?: string;
  alamat?: string;
  status: 'aktif' | 'nonaktif';
  created_at?: Date;
  updated_at?: Date;
}

export class UserModel {
  // Create user baru
  static async create(userData: Omit<User, 'id' | 'created_at' | 'updated_at'>): Promise<User> {
    const hashedPassword = await bcrypt.hash(userData.password!, 12);
    
    const [user] = await db('users')
      .insert({
        ...userData,
        password_hash: hashedPassword,
        password: undefined
      })
      .returning('*');
    
    return user;
  }

  // Find user by email
  static async findByEmail(email: string): Promise<User | null> {
    const user = await db('users').where({ email }).first();
    return user || null;
  }

  // Find user by username
  static async findByUsername(username: string): Promise<User | null> {
    const user = await db('users').where({ username }).first();
    return user || null;
  }

  // Find user by ID
  static async findById(id: number): Promise<User | null> {
    const user = await db('users').where({ id }).first();
    return user || null;
  }

  // Get all users dengan pagination
  static async findAll(page: number = 1, limit: number = 10, role?: string): Promise<{
    users: User[];
    total: number;
    totalPages: number;
    currentPage: number;
  }> {
    let query = db('users').select('id', 'username', 'email', 'role', 'nama_lengkap', 'no_telp', 'status', 'created_at');
    
    if (role) {
      query = query.where({ role });
    }

    const total = await query.clone().count('id as count').first();
    const users = await query
      .orderBy('created_at', 'desc')
      .limit(limit)
      .offset((page - 1) * limit);

    return {
      users,
      total: Number(total?.count) || 0,
      totalPages: Math.ceil((Number(total?.count) || 0) / limit),
      currentPage: page
    };
  }

  // Update user
  static async update(id: number, userData: Partial<User>): Promise<User | null> {
    const { password, ...updateData } = userData;
    
    if (password) {
      updateData.password_hash = await bcrypt.hash(password, 12);
    }

    const [user] = await db('users')
      .where({ id })
      .update({
        ...updateData,
        updated_at: new Date()
      })
      .returning(['id', 'username', 'email', 'role', 'nama_lengkap', 'no_telp', 'status']);
    
    return user || null;
  }

  // Delete user (soft delete)
  static async delete(id: number): Promise<boolean> {
    const result = await db('users')
      .where({ id })
      .update({ 
        status: 'nonaktif',
        updated_at: new Date()
      });
    
    return result > 0;
  }

  // Verify password
  static async verifyPassword(plainPassword: string, hashedPassword: string): Promise<boolean> {
    return await bcrypt.compare(plainPassword, hashedPassword);
  }

  // Get teknisi list untuk assignment
  static async getTeknisiList(): Promise<User[]> {
    return await db('users')
      .select('id', 'nama_lengkap', 'no_telp')
      .where({ role: 'teknisi', status: 'aktif' })
      .orderBy('nama_lengkap');
  }

  // Get sales list untuk assignment
  static async getSalesList(): Promise<User[]> {
    return await db('users')
      .select('id', 'nama_lengkap', 'no_telp')
      .where({ role: 'sales', status: 'aktif' })
      .orderBy('nama_lengkap');
  }
}
