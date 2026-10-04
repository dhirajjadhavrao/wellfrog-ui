import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowRight, User, Mail, AlertCircle, CheckCircle2 } from 'lucide-react';
import { api, setAuth } from '../api';

export default function AuthModal({ initialMode = 'signup', onAuthSuccess, onClose, isModal = false }) {
  const [mode, setMode] = useState(initialMode); // 'signin' or 'signup'
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [googleClientId, setGoogleClientId] = useState('');

  // Fetch server auth config
  useEffect(() => {
    api.getAuthConfig()
      .then((cfg) => {
        if (cfg && cfg.googleClientId) {
          setGoogleClientId(cfg.googleClientId);
          initGoogleGsi(cfg.googleClientId);
        }
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    setMode(initialMode);
  }, [initialMode]);

  // Initialize Google Identity Services if client ID is configured
  const initGoogleGsi = (clientId) => {
    if (window.google?.accounts?.id) {
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleCredentialResponse,
        });

        const btnElement = document.getElementById('gsiCustomBtn');
        if (btnElement) {
          window.google.accounts.id.renderButton(btnElement, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
          });
        }
      } catch (err) {
        console.warn('Google GSI Init:', err);
      }
    }
  };

  const handleGoogleCredentialResponse = async (response) => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.loginWithGoogle(response.credential);
      setAuth(res.token, res.user);
      if (onAuthSuccess) onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Google sign-in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (googleClientId && window.google?.accounts?.id) {
      window.google.accounts.id.prompt();
    } else {
      // Fallback if Google Cloud Client ID hasn't been configured by user in .env
      const promptEmail = window.prompt(
        'Enter your Gmail address to sign ' + (mode === 'signup' ? 'up' : 'in') + ' directly with Google:',
        email || 'dhiraj.jadhavrao@gmail.com'
      );
      if (promptEmail) {
        const promptName = mode === 'signup' ? (window.prompt('Enter your name:', 'Dhiraj Jadhavrao') || 'Google User') : '';
        submitAuth(promptEmail, promptName, mode === 'signup');
      }
    }
  };

  const submitAuth = async (userEmail, userName, isSignUpFlag) => {
    if (!userEmail) {
      setError('Please provide an email address');
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await api.emailAuth(userEmail, userName, isSignUpFlag);
      setAuth(res.token, res.user);
      if (onAuthSuccess) onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Authentication failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    submitAuth(email, name, mode === 'signup');
  };

  const handleDevLogin = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await api.devLogin('dhiraj.jadhavrao@gmail.com', 'Dhiraj Jadhavrao');
      setAuth(res.token, res.user);
      if (onAuthSuccess) onAuthSuccess(res.user);
    } catch (err) {
      setError(err.message || 'Demo login failed');
    } finally {
      setLoading(false);
    }
  };

  const cardContent = (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xl p-6 sm:p-8 max-w-md w-full mx-auto animate-in fade-in zoom-in-95 duration-200">
      
      {/* Brand Header */}
      <div className="text-center space-y-1 pb-4">
        <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-forest-600 text-white text-2xl shadow-md shadow-forest-600/20 mb-1">
          🐸
        </div>
        <h3 className="text-xl font-bold text-slate-900 tracking-tight">
          {mode === 'signup' ? 'Create your Wellfrog Account' : 'Welcome back to Wellfrog'}
        </h3>
        <p className="text-xs text-slate-500">
          {mode === 'signup'
            ? 'Start tracking your daily life, finances, and habits'
            : 'Sign in to access your personal activity hubs'}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex p-1 bg-slate-100 rounded-xl mb-6">
        <button
          type="button"
          onClick={() => { setMode('signin'); setError(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            mode === 'signin'
              ? 'bg-white text-slate-900 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign In
        </button>
        <button
          type="button"
          onClick={() => { setMode('signup'); setError(null); }}
          className={`flex-1 py-2 text-xs font-bold rounded-lg transition ${
            mode === 'signup'
              ? 'bg-white text-forest-700 shadow-xs'
              : 'text-slate-500 hover:text-slate-800'
          }`}
        >
          Sign Up
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 text-red-700 text-xs font-medium rounded-xl border border-red-200 flex items-center gap-2">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Google Sign-In / Sign-Up Button */}
      <div className="space-y-3">
        <div id="gsiCustomBtn" className="w-full">
          <button
            type="button"
            onClick={handleGoogleClick}
            disabled={loading}
            className="w-full flex items-center justify-center gap-3 py-2.5 px-4 bg-white border border-slate-300 hover:border-slate-400 hover:bg-slate-50 text-slate-700 font-semibold text-sm rounded-xl shadow-xs transition"
          >
            {/* Official Google G Logo */}
            <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
              <path
                fill="#4285F4"
                d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
              />
              <path
                fill="#34A853"
                d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
              />
              <path
                fill="#FBBC05"
                d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
              />
              <path
                fill="#EA4335"
                d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
              />
            </svg>
            <span>{mode === 'signup' ? 'Sign up with Google' : 'Sign in with Google'}</span>
          </button>
        </div>

        {/* Divider */}
        <div className="relative flex py-2 items-center">
          <div className="flex-grow border-t border-slate-200"></div>
          <span className="flex-shrink mx-3 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
            or with email
          </span>
          <div className="flex-grow border-t border-slate-200"></div>
        </div>

        {/* Manual Email / Name Form */}
        <form onSubmit={handleSubmit} className="space-y-3.5">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <div className="relative">
                <User className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  required
                  placeholder="e.g. Dhiraj Jadhavrao"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email / Gmail Address</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="email"
                required
                placeholder="you@gmail.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm border border-slate-300 rounded-xl focus:ring-2 focus:ring-forest-500 focus:outline-none"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2.5 px-4 bg-forest-600 hover:bg-forest-700 text-white font-bold text-sm rounded-xl shadow-md shadow-forest-600/20 transition flex items-center justify-center gap-2"
          >
            <span>{loading ? 'Processing...' : mode === 'signup' ? 'Create Account & Sign In' : 'Sign In to Wellfrog'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Demo Fast Login Option */}
        <div className="pt-2 text-center">
          <button
            type="button"
            onClick={handleDevLogin}
            disabled={loading}
            className="text-xs font-semibold text-forest-700 hover:text-forest-800 hover:underline inline-flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-500" />
            Quick Demo Login (Dhiraj)
          </button>
        </div>

        {/* Toggle Mode Footer */}
        <div className="text-center pt-3 border-t border-slate-100 text-xs text-slate-500">
          {mode === 'signup' ? (
            <span>
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => { setMode('signin'); setError(null); }}
                className="font-bold text-forest-700 hover:underline"
              >
                Sign In
              </button>
            </span>
          ) : (
            <span>
              Don't have an account yet?{' '}
              <button
                type="button"
                onClick={() => { setMode('signup'); setError(null); }}
                className="font-bold text-forest-700 hover:underline"
              >
                Sign Up
              </button>
            </span>
          )}
        </div>

      </div>
    </div>
  );

  if (!isModal) {
    return cardContent;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
      <div className="relative w-full max-w-md">
        <button
          onClick={onClose}
          className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-white text-slate-400 hover:text-slate-700 shadow-md flex items-center justify-center z-10 font-bold text-sm"
        >
          ✕
        </button>
        {cardContent}
      </div>
    </div>
  );
}
