import React, { ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { 
  QrCode, 
  Package, 
  User, 
  LogOut,
  Menu,
  X
} from 'lucide-react';
import { useState } from 'react';

interface MobileLayoutProps {
  children: ReactNode;
  user: any;
}

const MobileLayout: React.FC<MobileLayoutProps> = ({ children }) => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [showMenu, setShowMenu] = useState(false);

  const navItems = [
    { path: '/scan', icon: QrCode, label: 'Scan', primary: true },
    { path: '/inventory', icon: Package, label: 'Inventory' },
    { path: '/profile', icon: User, label: 'Profile' },
  ];

  const handleLogout = () => {
    logout();
    setShowMenu(false);
  };

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Mobile Header */}
      <header className="bg-white shadow-sm border-b px-4 py-3 flex items-center justify-between relative z-50">
        <div className="flex items-center">
          <h1 className="text-lg font-semibold text-gray-900">
            ISP Inventory
          </h1>
        </div>
        
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="p-2 rounded-lg text-gray-600 hover:bg-gray-100"
        >
          {showMenu ? <X size={24} /> : <Menu size={24} />}
        </button>

        {/* Mobile Menu Overlay */}
        {showMenu && (
          <>
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setShowMenu(false)}
            />
            <div className="absolute top-full right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border z-50">
              <div className="p-4 border-b">
                <p className="font-medium text-gray-900">{user?.username}</p>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <span className="inline-block px-2 py-1 mt-1 text-xs bg-blue-100 text-blue-800 rounded-full">
                  {user?.role}
                </span>
              </div>
              
              <nav className="p-2">
                {navItems.map(({ path, icon: Icon, label }) => (
                  <Link
                    key={path}
                    to={path}
                    onClick={() => setShowMenu(false)}
                    className={`flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                      location.pathname === path
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    <Icon size={18} className="mr-3" />
                    {label}
                  </Link>
                ))}
                
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center px-3 py-2 mt-2 rounded-lg text-sm font-medium text-red-700 hover:bg-red-50 transition-colors"
                >
                  <LogOut size={18} className="mr-3" />
                  Logout
                </button>
              </nav>
            </div>
          </>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      <nav className="bg-white border-t px-4 py-2 flex justify-around items-center">
        {navItems.map(({ path, icon: Icon, label, primary }) => (
          <Link
            key={path}
            to={path}
            className={`flex flex-col items-center px-3 py-2 rounded-lg transition-colors ${
              location.pathname === path
                ? primary
                  ? 'text-blue-600 bg-blue-50'
                  : 'text-blue-600'
                : 'text-gray-600 hover:text-gray-900'
            }`}
          >
            <Icon 
              size={primary && location.pathname === path ? 28 : 24} 
              className="mb-1" 
            />
            <span className="text-xs font-medium">{label}</span>
          </Link>
        ))}
      </nav>

      {/* PWA Install Prompt */}
      <div id="pwa-install-prompt" className="hidden">
        <div className="fixed bottom-20 left-4 right-4 bg-blue-600 text-white p-4 rounded-lg shadow-lg">
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <h3 className="font-medium">Install App</h3>
              <p className="text-sm opacity-90">Add to home screen for quick access</p>
            </div>
            <button
              id="pwa-install-btn"
              className="ml-4 px-4 py-2 bg-white text-blue-600 rounded font-medium text-sm"
            >
              Install
            </button>
            <button
              id="pwa-dismiss-btn"
              className="ml-2 p-2 text-white opacity-75"
            >
              <X size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MobileLayout;
