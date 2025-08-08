import React, { useState } from 'react';
import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const AdminLogin = ({role}) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const navigate = useNavigate();

  const isFormValid = email.trim() && password.trim();
useEffect(() => {
   
  if (role) {
        
      navigate('/admin/dashboard');
    }
  }, [role]);
  const handleLogin = async () => {
    if (!isFormValid) return;

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || 'Login failed');
        return;
      }

      navigate('/admin/dashboard');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Server error. Please try again.');
    }
  };

  return (
    <div className="bg-gray-50">
      <div className="min-h-screen flex flex-col items-center justify-center py-6 px-4">
        <div className="max-w-[480px] w-full">
          <div className="p-6 sm:p-8 rounded-2xl bg-white border border-gray-200 shadow-sm">
            <h1 className="text-slate-900 text-center text-3xl font-semibold font-mono uppercase">Admin Login</h1>

            <div className="mt-12 space-y-6">
              {error && (
                <div className="text-red-600 text-sm text-center">{error}</div>
              )}

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">Email</label>
                <input
                  name="email"
                  type="email"
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-8 rounded-md outline-blue-600"
                  placeholder="Enter admin email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="text-slate-900 text-sm font-medium mb-2 block">Password</label>
                <input
                  name="password"
                  type="password"
                  className="w-full text-slate-900 text-sm border border-slate-300 px-4 py-3 pr-8 rounded-md outline-blue-600"
                  placeholder="Enter password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <div className="!mt-12">
                <button
                  type="button"
                  onClick={handleLogin}
                  disabled={!isFormValid}
                  className={`w-full py-2 px-4 text-[15px] font-medium tracking-wide rounded-lg text-white ${
                    isFormValid ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-400 cursor-not-allowed'
                  } focus:outline-none`}
                >
                  Sign in
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
