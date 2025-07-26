import React, { useState } from 'react';
import { Eye, EyeOff, Scan, Lock, User as UserIcon } from 'lucide-react';
import apiService from '@/services/api';
import toast from 'react-hot-toast';
import { User } from '@/types';

interface LoginPageProps {
  onLogin: (user: User, token: string) => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await apiService.login(username, password);
      
      if (response.success && response.data) {
        toast.success('Login successful!');
        onLogin(response.data.user, response.data.token);
      } else {
        toast.error(response.message || 'Login failed');
      }
    } catch (error: any) {
      console.error('Login error:', error);
      toast.error(error.response?.data?.message || 'Login failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-50 to-primary-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
            <Scan className="w-8 h-8 text-primary-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">CloudBit Inventory Scanner</h1>
          <p className="text-gray-600">Internet Cepat & Stabil #pilihCloudBit</p>
          <p className="text-sm text-gray-500 mt-1">Sign in to start scanning</p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Username Field */}
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
              Username
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <UserIcon className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="username"
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your username"
                disabled={isLoading}
              />
            </div>
          </div>

          {/* Password Field */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Lock className="h-5 w-5 text-gray-400" />
              </div>
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="block w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-colors"
                placeholder="Enter your password"
                disabled={isLoading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                ) : (
                  <Eye className="h-5 w-5 text-gray-400 hover:text-gray-600" />
                )}
              </button>
            </div>
          </div>

          {/* Login Button */}
          <button
            type="submit"
            disabled={isLoading || !username || !password}
            className="w-full flex items-center justify-center px-4 py-3 bg-primary-600 text-white font-medium rounded-lg hover:bg-primary-700 focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Signing in...
              </>
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        {/* Demo Credentials */}
        <div className="mt-8 p-4 bg-gray-50 rounded-lg">
          <h3 className="text-sm font-medium text-gray-700 mb-2">Demo Credentials:</h3>
          <div className="space-y-1 text-sm text-gray-600">
            <p><strong>Admin:</strong> admin / admin123</p>
            <p><strong>Staff:</strong> staff / staff123</p>
            <p><strong>Technician:</strong> tech / tech123</p>
          </div>
        </div>

        {/* Features */}
        <div className="mt-8 text-center">
          <p className="text-sm text-gray-600 mb-4">Mobile-optimized barcode scanning for:</p>
          <div className="flex items-center justify-center space-x-6 text-xs text-gray-500">
            <span>📦 Inventory Tracking</span>
            <span>📱 Mobile Scanning</span>
            <span>📊 Real-time Updates</span>
          </div>
          
          {/* CloudBit Branding */}
          <div className="mt-6 pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 mb-2">Powered by</p>
            <a 
              href="https://cloudbit.net.id" 
              target="_blank" 
              rel="noopener noreferrer" 
              className="inline-block text-blue-600 hover:text-blue-700 font-semibold text-sm transition-colors"
            >
              CloudBit.net.id
            </a>
            <p className="text-xs text-gray-400 mt-1">Internet Cepat & Stabil untuk semua kebutuhan</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
