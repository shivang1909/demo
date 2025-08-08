import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';

const Navbar = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = () => {
    setIsLoggedIn(!isLoggedIn);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

 

  return (
    <nav className="bg-white shadow-inner border-b border-gray-200">
      {/* Row 1 */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Logo</span>
          </div>

          {/* Profile/Login */}
          <div className="hidden md:block">
            {isLoggedIn ? (
              <button className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2">
                <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                  <User className="h-5 w-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium">Profile</span>
              </button>
            ) : (
              <button 
                onClick={handleLogin}
                className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile menu toggle */}
          <div className="md:hidden">
            <button
              onClick={toggleMobileMenu}
              className="text-gray-700 p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      
      {/* Mobile menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-3">
          {isLoggedIn ? (
            <button className="flex items-center space-x-3 py-2 text-base text-gray-600 hover:text-gray-900">
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <span>Profile</span>
            </button>
          ) : (
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 text-white py-2 mt-2 rounded-lg text-base font-medium hover:bg-blue-700 transition"
            >
              Login
            </button>
          )}
        </div>
      )}
    </nav>
  );
};

export default Navbar;
