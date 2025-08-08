import React, { useState } from 'react';
import { User, Menu, X } from 'lucide-react';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import {  ChevronDown } from "lucide-react"; // You can change icons if needed

const Navbar = ({role,setrole}) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/auth/logout', {
        method: 'POST',
        credentials: 'include', // important to send cookies
      });

      if (response.ok) {
        setrole(null); // clear the role state
        navigate('/'); // redirect to login
      } else {
        console.error('Logout failed');
      }
    } catch (error) {
      console.error('Logout error:', error);
    }
  };
    const [isOpen, setIsOpen] = useState(false);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navigationLinks = [
    { name: 'Dashboard', href: '/admin/dashboard' },
    { name: 'Add Client', href: '/admin/add-client' },
    { name: 'Manage Clients', href: '/admin/manage-client' },
  ];

  const linkClass = ({ isActive }) =>
    `px-3 py-2 text-sm font-medium transition-colors duration-200 border-b-2 ${
      isActive
        ? 'text-blue-600 border-blue-600'
        : 'text-gray-600 hover:text-blue-600 hover:border-blue-600 border-transparent'
    }`;

  return (
    <nav className="bg-white shadow-inner border-b border-gray-200 fixed w-full z-20">
      {/* Row 1: Logo + Login/Profile + Mobile menu button */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <div className="h-8 w-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-sm">L</span>
            </div>
            <span className="ml-2 text-xl font-bold text-gray-900">Logo</span>
          </div>

          {/* Logout Button (Desktop) */}
     <div className="relative hidden md:block">
      <button
        onClick={toggleDropdown}
        className="flex items-center space-x-2 text-gray-700 hover:text-gray-900 p-2"
      >
        <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
          <User className="h-5 w-5 text-gray-600" />
        </div>
        <span className="text-sm font-medium capitalize">{role}</span>
        <ChevronDown className="h-4 w-4 text-gray-600" />
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-32 bg-white border border-gray-200 rounded-md shadow-lg z-10">
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
          >
            Logout
          </button>
        </div>
      )}
    </div>

          {/* Mobile Menu Toggle */}
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

      {/* Row 2: Desktop Nav Links */}
      <div className="bg-gray-50 hidden md:block">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 h-16 items-center justify-center">
            {navigationLinks.map((link) => (
              <NavLink key={link.name} to={link.href} className={linkClass}>
                {link.name}
              </NavLink>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile menu links */}
      {isMobileMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200 px-4 pb-3 space-y-2">
          {navigationLinks.map((link) => (
            <NavLink
              key={link.name}
              to={link.href}
              onClick={() => setIsMobileMenuOpen(false)}
              className={({ isActive }) =>
                `block py-2 px-3 rounded-md text-base font-medium transition ${
                  isActive
                    ? 'bg-blue-100 text-blue-600'
                    : 'text-gray-700 hover:bg-gray-100 hover:text-blue-600'
                }`
              }
            >
              {link.name}
            </NavLink>
          ))}

          {/* Logout Button (Mobile) */}
          <div className="pt-2 border-t border-gray-200">
            <button
              onClick={handleLogout}
              className="flex items-center space-x-3 py-2 text-base text-gray-600 hover:text-gray-900"
            >
              <div className="h-8 w-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-5 w-5 text-gray-600" />
              </div>
              <span>Logout</span>
            </button>
          </div>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
