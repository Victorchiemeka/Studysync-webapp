import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Mail } from 'lucide-react';

const AuthModalContent = ({ onSuccess = () => {}, onCancel = () => {} }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [mode, setMode] = useState('signup'); // 'signup' or 'login'
  const [userExists, setUserExists] = useState(false);

  const handleEmailAuth = async (e) => {
    e && e.preventDefault();
    if (!email || !password) {
      toast.error('Please provide email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const endpoint = mode === 'signup' ? 'email-signup' : 'email-login';
      const payload = mode === 'signup' 
        ? { email, password, name: email.split('@')[0] }
        : { email, password };
      
      const res = await fetch(`http://localhost:8081/api/auth/${endpoint}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        const message = mode === 'signup' ? 'Account created — redirecting...' : 'Signed in successfully!';
        toast.success(message);
        onSuccess(data.redirect || '/dashboard');
      } else {
        if (data.userExists && mode === 'signup') {
          setMode('login');
          setUserExists(true);
          toast.error('Account exists. Please sign in instead.');
        } else {
          toast.error(data.message || `${mode === 'signup' ? 'Signup' : 'Login'} failed`);
        }
      }
    } catch (err) {
      console.error(`${mode} error`, err);
      toast.error(`Network error during ${mode}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const switchMode = () => {
    setMode(mode === 'signup' ? 'login' : 'signup');
    setUserExists(false);
    setPassword(''); // Clear password when switching modes
  };

  const handleGoogle = () => {
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const handleApple = () => {
    toast('Apple Sign-In coming soon!', { icon: '🍎' });
  };

  const handleGithub = () => {
    toast('GitHub Sign-In coming soon!', { icon: '🐱' });
  };

  return (
    <div>
      {userExists && (
        <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800">
          Account found! Please sign in with your password.
        </div>
      )}
      
      <form onSubmit={handleEmailAuth} className="space-y-4">
        <div className="relative">
          <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
            disabled={userExists} // Disable email field when user exists
          />
        </div>

        <div className="relative">
          <input
            type={showPassword ? 'text' : 'password'}
            placeholder={mode === 'signup' ? 'Create a password' : 'Enter your password'}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-white border border-gray-200 rounded-xl pl-4 pr-12 py-3 text-gray-900 placeholder-gray-400 focus:outline-none"
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
          </button>
        </div>

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={isSubmitting}
            className="whitepace-button-primary flex-1 py-3 rounded-xl font-semibold transition-all"
          >
            {isSubmitting 
              ? (mode === 'signup' ? 'Creating...' : 'Signing in...') 
              : (mode === 'signup' ? 'Create account' : 'Sign in')
            }
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 bg-white border border-gray-200 text-gray-800 py-3 rounded-xl font-medium"
          >
            Cancel
          </button>
        </div>
      </form>

      {!userExists && (
        <div className="mt-4 text-center">
          <button 
            onClick={switchMode}
            className="text-sm text-gray-600 hover:text-gray-800 underline"
          >
            {mode === 'signup' 
              ? 'Already have an account? Sign in' 
              : 'Need an account? Sign up'
            }
          </button>
        </div>
      )}

      <div className="my-4 flex items-center">
        <div className="flex-1 h-px bg-gray-200"></div>
        <div className="px-3 text-gray-500">or</div>
        <div className="flex-1 h-px bg-gray-200"></div>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <button onClick={handleApple} className="p-3 rounded-xl bg-gray-50 border">Apple</button>
        <button onClick={handleGoogle} className="p-3 rounded-xl bg-gray-50 border">Google</button>
        <button onClick={handleGithub} className="p-3 rounded-xl bg-gray-50 border">GitHub</button>
      </div>
    </div>
  );
};

export default AuthModalContent;
