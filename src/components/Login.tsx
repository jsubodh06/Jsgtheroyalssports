import React, { useState } from 'react';
import { User, UserRole } from '../App';
import { authApi } from '../utils/api';

interface LoginProps {
  onLogin: (user: User) => void;
}

export function Login({ onLogin }: LoginProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [role, setRole] = useState<UserRole>('user');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const { session } = await authApi.signIn(email, password);
      
      if (session) {
        // Fetch user data from backend
        const { user: userData } = await authApi.getCurrentUser();
        onLogin({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          teamId: userData.teamId
        });
      }
    } catch (err: any) {
      console.error('Sign in error:', err);
      setError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Create user account
      await authApi.signUp(email, password, name, role);
      
      // Automatically sign in after sign up
      const { session } = await authApi.signIn(email, password);
      
      if (session) {
        const { user: userData } = await authApi.getCurrentUser();
        onLogin({
          id: userData.id,
          name: userData.name,
          email: userData.email,
          role: userData.role,
          teamId: userData.teamId
        });
      }
    } catch (err: any) {
      console.error('Sign up error:', err);
      setError(err.message || 'Failed to create account. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const quickLogin = async (demoRole: UserRole) => {
    setLoading(true);
    setError('');

    const demoCredentials = {
      admin: { email: 'admin@sports.com', password: 'admin123', name: 'Admin User' },
      team_owner: { email: 'owner@sports.com', password: 'owner123', name: 'Team Owner' },
      user: { email: 'user@sports.com', password: 'user123', name: 'Demo User' },
    };

    const creds = demoCredentials[demoRole];
    if (!creds) return;

    try {
      // Try to sign in first
      try {
        const { session } = await authApi.signIn(creds.email, creds.password);
        if (session) {
          const { user: userData } = await authApi.getCurrentUser();
          onLogin({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            teamId: userData.teamId
          });
          return;
        }
      } catch (signInError) {
        // If sign in fails, try to create account
        console.log('Creating demo account...');
        await authApi.signUp(creds.email, creds.password, creds.name, demoRole);
        const { session } = await authApi.signIn(creds.email, creds.password);
        if (session) {
          const { user: userData } = await authApi.getCurrentUser();
          onLogin({
            id: userData.id,
            name: userData.name,
            email: userData.email,
            role: userData.role,
            teamId: userData.teamId
          });
        }
      }
    } catch (err: any) {
      console.error('Quick login error:', err);
      setError('Failed to login. Please try manual sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] flex items-center justify-center bg-gradient-to-br from-blue-50 to-purple-50 px-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
            </h2>
            <p className="text-gray-600">
              {mode === 'signin' ? 'Sign in to access your dashboard' : 'Join the sports league platform'}
            </p>
          </div>

          {/* Toggle between Sign In and Sign Up */}
          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('signin')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                mode === 'signin'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign In
            </button>
            <button
              onClick={() => setMode('signup')}
              className={`flex-1 py-2 rounded-lg font-medium transition-colors ${
                mode === 'signup'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              Sign Up
            </button>
          </div>

          <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-4">
            {mode === 'signup' && (
              <>
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Full Name
                  </label>
                  <input
                    id="name"
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="John Doe"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
                    Account Type
                  </label>
                  <select
                    id="role"
                    value={role || 'user'}
                    onChange={(e) => setRole(e.target.value as UserRole)}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  >
                    <option value="user">User/Player</option>
                    <option value="team_owner">Team Owner</option>
                    <option value="admin">Admin</option>
                  </select>
                </div>
              </>
            )}

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                Password
              </label>
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="••••••••"
                required
                minLength={6}
              />
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-medium transition-colors disabled:bg-blue-400 disabled:cursor-not-allowed"
            >
              {loading ? 'Loading...' : mode === 'signin' ? 'Sign In' : 'Create Account'}
            </button>
          </form>

          <div className="mt-8 pt-8 border-t border-gray-200">
            <p className="text-sm text-gray-600 text-center mb-4">Quick Login (Demo Mode)</p>
            <div className="space-y-2">
              <button
                onClick={() => quickLogin('admin')}
                disabled={loading}
                className="w-full px-4 py-2 bg-purple-100 text-purple-700 rounded-lg hover:bg-purple-200 text-sm font-medium transition-colors disabled:opacity-50"
              >
                🔐 Login as Admin
              </button>
              <button
                onClick={() => quickLogin('team_owner')}
                disabled={loading}
                className="w-full px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 text-sm font-medium transition-colors disabled:opacity-50"
              >
                👥 Login as Team Owner
              </button>
              <button
                onClick={() => quickLogin('user')}
                disabled={loading}
                className="w-full px-4 py-2 bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 text-sm font-medium transition-colors disabled:opacity-50"
              >
                👤 Login as User
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}