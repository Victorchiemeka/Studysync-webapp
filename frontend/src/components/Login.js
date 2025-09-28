import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, Eye, EyeOff, Mail, Apple, Github, Zap } from 'lucide-react';
import toast from 'react-hot-toast';

const Login = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  useEffect(() => {
    // Check for OAuth callback parameters
    const urlParams = new URLSearchParams(window.location.search);
    const success = urlParams.get('success');
    const error = urlParams.get('error');

    if (success === 'true') {
      // OAuth success - check auth status and redirect
      toast.success('Successfully signed in with Google!');
      checkAuthStatus();
    } else if (error) {
      // Handle specific error types
      let errorMessage = 'Google authentication failed. Please try again.';
      
      switch (error) {
        case 'no_principal':
          errorMessage = 'Authentication failed. Please check your Google account permissions.';
          break;
        case 'no_email':
          errorMessage = 'Unable to access your email address. Please check your Google account settings.';
          break;
        case 'server_error':
          errorMessage = 'Server error during authentication. Please try again later.';
          break;
        default:
          errorMessage = 'Google authentication failed. Please try again.';
      }
      
      toast.error(errorMessage);
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const response = await fetch('http://localhost:8081/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const user = await response.json();
        if (user.profileCompleted && user.major) {
          navigate('/dashboard');
        } else {
          navigate('/setup');
        }
      }
    } catch (error) {
      // User not authenticated, stay on login page
      console.log('User not authenticated, staying on login page');
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to backend Google OAuth endpoint
      window.location.href = 'http://localhost:8081/oauth2/authorization/google';
    } catch (error) {
      toast.error('Failed to initiate Google login');
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to backend Apple OAuth endpoint
      window.location.href = 'http://localhost:8081/oauth2/authorization/apple';
    } catch (error) {
      toast.error('Failed to initiate Apple login');
      setIsLoading(false);
    }
  };

  const handleGithubLogin = async () => {
    setIsLoading(true);
    try {
      // Redirect to backend GitHub OAuth endpoint
      window.location.href = 'http://localhost:8081/oauth2/authorization/github';
    } catch (error) {
      toast.error('Failed to initiate GitHub login');
      setIsLoading(false);
    }
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please fill in all fields');
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:8081/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      const data = await response.json();
      if (data.success) {
        toast.success(`Welcome back, ${data.user.firstName}!`);
        // Wait a moment then redirect based on profile completion
        setTimeout(() => {
          if (data.user.profileCompleted === false || !data.user.major) {
            navigate('/setup');
          } else {
            navigate('/dashboard');
          }
        }, 1000);
      } else {
        toast.error(data.message || 'Invalid credentials');
      }
    } catch (error) {
      console.error('Login error:', error);
      toast.error('Unable to connect to server. Please check your connection.');
    }
    setIsLoading(false);
  };  const handleBackToHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-black text-white relative overflow-hidden">
      {/* Back to Home Button */}
      <button
        onClick={handleBackToHome}
        className="absolute top-6 left-6 z-20 flex items-center text-white/70 hover:text-white font-medium transition-colors duration-200"
      >
        <ArrowLeft className="w-5 h-5 mr-2" />
        Back to Home
      </button>

      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-br from-gray-900 via-black to-gray-800"></div>
      
      {/* Subtle Grid Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="h-full bg-[linear-gradient(rgba(255,255,255,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.1)_1px,transparent_1px)] bg-[size:100px_100px]"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="w-full max-w-md"
        >
          {/* Header */}
          <div className="text-center mb-12">
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="mb-6"
            >
              <div className="w-20 h-20 mx-auto mb-4 bg-gradient-to-br from-brand-blue-500 to-brand-yellow-500 rounded-2xl flex items-center justify-center">
                <span className="text-2xl font-bold text-white">S</span>
              </div>
            </motion.div>
            <h1 className="text-4xl font-light mb-3">
              Welcome to <span className="font-medium text-brand-blue-600">StudySync</span>
            </h1>
            <p className="text-white/60 text-lg">
              {isSignUp ? 'Create your account' : 'Sign in to continue'}
            </p>
          </div>

          {/* Auth Form */}
          <div className="space-y-4 mb-8">
            {/* Email/Password Form */}
            <form onSubmit={handleEmailLogin} className="space-y-4">
              {/* Email Input */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-white/40" />
                <input
                  type="email"
                  placeholder="Email address"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-12 pr-4 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl pl-4 pr-12 py-4 text-white placeholder-white/40 focus:outline-none focus:border-white/30 focus:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>

              {/* Sign In Button */}
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                type="submit"
                disabled={isLoading || !email.trim() || !password.trim()}
                className="whitepace-button-primary w-full py-4 rounded-2xl font-medium transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin mx-auto"></div>
                ) : (
                  isSignUp ? 'Create Account' : 'Sign In'
                )}
              </motion.button>

              {/* Forgot Password */}
              {!isSignUp && (
                <div className="text-center mt-3">
                  <button
                    type="button"
                    className="text-white/60 hover:text-white/80 text-sm transition-colors duration-200"
                    onClick={() => toast.success('Password reset coming soon!', {
                      duration: 3000,
                      style: {
                        background: '#3b82f6',
                        color: 'white',
                      },
                    })}
                  >
                    Forgot your password?
                  </button>
                </div>
              )}
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-black text-white/60">or continue with</span>
              </div>
            </div>

            {/* Social Login Buttons */}
            <div className="grid grid-cols-3 gap-3">
              {/* Apple Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleAppleLogin}
                disabled={isLoading}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <Apple className="w-6 h-6 text-white" />
              </motion.button>

              {/* Google Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGoogleLogin}
                disabled={isLoading}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-6 h-6" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
              </motion.button>

              {/* GitHub Button */}
              <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={handleGithubLogin}
                disabled={isLoading}
                className="bg-white/5 border border-white/10 rounded-2xl p-4 flex items-center justify-center hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
              >
                <Github className="w-6 h-6 text-white" />
              </motion.button>
            </div>
          </div>



          {/* Toggle Sign Up/Sign In */}
          <div className="text-center">
            <p className="text-white/60 mb-4">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-red-400 hover:text-red-300 font-medium transition-colors duration-200"
            >
              {isSignUp ? 'Sign In' : 'Create Account'}
            </button>
          </div>

          {/* Privacy Note */}
          <p className="mt-8 text-xs text-white/40 text-center leading-relaxed">
            By continuing, you agree to our{' '}
            <span className="text-white/60 hover:text-white transition-colors cursor-pointer">Terms of Service</span>
            {' '}and{' '}
            <span className="text-white/60 hover:text-white transition-colors cursor-pointer">Privacy Policy</span>.
            <br />
            Your data is protected with enterprise-grade security.
          </p>
        </motion.div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-20 left-10 w-32 h-32 bg-red-800/10 rounded-full blur-3xl"></div>
      <div className="absolute bottom-20 right-10 w-40 h-40 bg-yellow-500/10 rounded-full blur-3xl"></div>
      <div className="absolute top-1/2 left-1/4 w-24 h-24 bg-white/5 rounded-full blur-2xl"></div>
    </div>
  );
};

export default Login;
