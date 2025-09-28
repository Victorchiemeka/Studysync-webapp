import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { motion } from 'framer-motion';
import { 
  Heart, 
  BookOpen, 
  Users, 
  MapPin, 
  Calendar, 
  Brain, 
  ArrowRight,
  Star,
  Sparkles,
  CheckCircle,
  Zap,
  Shield,
  Globe,
  TrendingUp,
  Award,
  Target
} from 'lucide-react';
import AuthModalContent from '../components/AuthModalContent';

const LandingPage = () => {
  const navigate = useNavigate();
  const [showModal, setShowModal] = useState(false);
  const [modalEmail, setModalEmail] = useState('');
  const [modalPassword, setModalPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleGetStarted = () => {
    // Open modal to let user choose email sign-up or OAuth
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setModalEmail('');
    setModalPassword('');
    setIsSubmitting(false);
  };

  const handleGoogle = () => {
    // fallback to backend Google OAuth
    window.location.href = 'http://localhost:8081/oauth2/authorization/google';
  };

  const handleApple = () => {
    toast('Apple Sign-In coming soon!', { icon: '🍎' });
  };

  const handleGithub = () => {
    toast('GitHub Sign-In coming soon!', { icon: '🐱' });
  };

  const handleEmailSignup = async (e) => {
    e && e.preventDefault();
    if (!modalEmail || !modalPassword) {
      toast.error('Please provide email and password');
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = { email: modalEmail, password: modalPassword, name: modalEmail.split('@')[0] };
      const res = await fetch('http://localhost:8081/api/auth/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        toast.success('Account created — redirecting...');
        handleModalClose();
        navigate(data.redirect || '/dashboard');
      } else {
        toast.error(data.message || 'Signup failed');
      }
    } catch (err) {
      console.error('Signup error', err);
      toast.error('Network error during signup');
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <Brain className="w-8 h-8" />,
      title: "AI-Powered Matching",
      description: "Our advanced AI analyzes your study habits, subjects, and goals to find your perfect study partner."
    },
    {
      icon: <MapPin className="w-8 h-8" />,
      title: "Location-Based Discovery",
      description: "Find study partners nearby or discover the best study spots in your area with our interactive map."
    },
    {
      icon: <Calendar className="w-8 h-8" />,
      title: "Smart Scheduling",
      description: "Coordinate study sessions effortlessly with integrated calendar and availability matching."
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: "Study Groups",
      description: "Join or create study groups for specific subjects, exams, or projects with like-minded students."
    }
  ];

  const stats = [
    { number: "10,000+", label: "Active Students" },
    { number: "25,000+", label: "Study Sessions" },
    { number: "98%", label: "Success Rate" },
    { number: "4.9/5", label: "User Rating" }
  ];

  const getPlaceholderAvatar = (name) => {
    const initials = name.split(' ').map(n => n[0]).join('').slice(0,2).toUpperCase();
    return `https://ui-avatars.com/api/?name=${encodeURIComponent(initials)}&background=DDDDDD&color=555555&size=128`;
  };

  const testimonials = [
    {
      name: "Sarah Chen",
      major: "Computer Science",
      text: "StudySync helped me find the perfect study group for my algorithms class. My grades improved by 20!",
      avatar: getPlaceholderAvatar('Sarah Chen')
    },
    {
      name: "Marcus Rodriguez",
      major: "Pre-Med",
      text: "The AI matching is incredible. It found me study partners who complemented my learning style perfectly.",
      avatar: getPlaceholderAvatar('Marcus Rodriguez')
    },
    {
      name: "Emily Watson",
      major: "Business",
      text: "I love how easy it is to schedule study sessions. The calendar integration is a game-changer!",
      avatar: getPlaceholderAvatar('Emily Watson')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <nav className="bg-white/95 backdrop-blur-lg border-b border-neutral-200/50 sticky top-0 z-50 shadow-soft">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <div className="flex items-center mr-3">
                <BookOpen className="h-8 w-8 text-brand-blue-500 mr-2" />
              </div>
              <span className="text-2xl font-bold text-neutral-900">
                StudySync
              </span>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => navigate('/login')}
                className="whitepace-button-ghost text-sm font-medium"
              >
                Sign In
              </button>
              <button
                onClick={handleGetStarted}
                className="whitepace-button-secondary text-sm font-medium"
              >
                Get Started
              </button>
              <button
                onClick={() => navigate('/map')}
                className="whitepace-button-primary text-sm font-medium"
              >
                Try Demo
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
            >
              <h1 className="whitepace-text-hero text-neutral-900 mb-6">
                Find Your Perfect Study Partner
                <span className="block bg-gradient-to-r from-brand-blue-500 to-brand-blue-600 bg-clip-text text-transparent">
                  with AI-Powered Matching
                </span>
              </h1>
              <p className="whitepace-text-body text-xl max-w-3xl mx-auto mb-12">
                Connect with students who share your classes, study style, and academic goals. Schedule sessions, join study groups, and achieve better results together through intelligent collaboration.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center mb-16"
            >
              <button
                onClick={handleGetStarted}
                className="whitepace-button-primary text-lg px-8 py-4 flex items-center"
              >
                Try StudySync free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button 
                onClick={() => navigate('/map')}
                className="whitepace-button-secondary text-lg px-8 py-4 flex items-center"
              >
                View Demo
                <Target className="ml-2 h-5 w-5" />
              </button>
            </motion.div>

            {/* Stats */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto"
            >
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-3xl md:text-4xl font-bold text-red-800 mb-2">
                    {stat.number}
                  </div>
                  <div className="text-gray-700">{stat.label}</div>
                </div>
              ))}
            </motion.div>
          </div>
        </div>

        {/* Background Elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden -z-10">
          <div className="absolute top-20 left-10 w-20 h-20 bg-yellow-200 rounded-full blur-xl opacity-70"></div>
          <div className="absolute top-40 right-20 w-32 h-32 bg-red-200 rounded-full blur-xl opacity-70"></div>
          <div className="absolute bottom-20 left-20 w-24 h-24 bg-pink-200 rounded-full blur-xl opacity-70"></div>
        </div>
      </section>

      {/* Get Started Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/60" onClick={handleModalClose}></div>
          <div className="relative z-60 w-full max-w-lg mx-4 bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900">Get Started</h3>
                  <p className="text-gray-600">Create an account or continue with a provider</p>
                </div>
                <button onClick={handleModalClose} className="text-gray-500 hover:text-gray-800">✕</button>
              </div>

              <AuthModalContent
                onSuccess={(redirectPath) => {
                  handleModalClose();
                  navigate(redirectPath);
                }}
                onCancel={handleModalClose}
              />
            </div>
          </div>
        </div>
      )}

      {/* Features Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Powerful Features for
                <span className="block text-red-800">Academic Success</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Everything you need to excel in your studies, powered by cutting-edge technology and thoughtful design.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-yellow-50 p-8 rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-yellow-300 group"
              >
                <div className="text-red-800 mb-4 group-hover:scale-110 transition-transform duration-300">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  {feature.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {feature.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-brand-blue-50 to-brand-blue-100">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                How StudySync Works
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                Get started in minutes and find your ideal study partners effortlessly.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-12">
            {[
              {
                step: "1",
                title: "Create Your Profile",
                description: "Sign in with Google and tell us about your academic goals, subjects, and study preferences.",
                icon: <Users className="w-12 h-12" />
              },
              {
                step: "2",
                title: "AI Finds Matches",
                description: "Our intelligent algorithm analyzes your profile to find compatible study partners and groups.",
                icon: <Brain className="w-12 h-12" />
              },
              {
                step: "3",
                title: "Start Studying",
                description: "Connect with your matches, schedule study sessions, and achieve your academic goals together.",
                icon: <Zap className="w-12 h-12" />
              }
            ].map((item, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                className="text-center"
              >
                <div className="bg-white rounded-full w-24 h-24 mx-auto mb-6 flex items-center justify-center shadow-lg border-4 border-indigo-100">
                  <div className="text-indigo-600">
                    {item.icon}
                  </div>
                </div>
                <div className="text-sm font-semibold text-indigo-600 mb-2">
                  STEP {item.step}
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">
                  {item.title}
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {item.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                Loved by Students
                <span className="block text-red-800">Everywhere</span>
              </h2>
              <p className="text-xl text-gray-700 max-w-3xl mx-auto">
                Join thousands of students who have transformed their academic journey with StudySync.
              </p>
            </motion.div>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {testimonials.map((testimonial, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.1 }}
                className="bg-gradient-to-br from-white to-yellow-50 p-8 rounded-2xl shadow-lg border border-yellow-200"
              >
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-5 h-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  "{testimonial.text}"
                </p>
                <div className="flex items-center">
                  <img
                    src={testimonial.avatar}
                    alt={testimonial.name}
                    className="w-12 h-12 rounded-full mr-4 object-cover"
                  />
                  <div>
                    <div className="font-semibold text-gray-900">
                      {testimonial.name}
                    </div>
                    <div className="text-gray-600 text-sm">
                      {testimonial.major}
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-brand-blue-600 to-brand-blue-700 border-t-4 border-brand-yellow-400">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Ready to Transform Your Studies?
            </h2>
            <p className="text-xl text-yellow-100 mb-8 max-w-2xl mx-auto">
              Join StudySync today and discover the power of collaborative learning with AI-powered matching.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <button
                onClick={handleGetStarted}
                className="bg-yellow-400 text-red-800 px-8 py-4 rounded-full text-lg font-semibold hover:bg-yellow-300 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center border-2 border-white"
              >
                Get Started for Free
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
              <button
                onClick={() => navigate('/map')}
                className="bg-white/20 text-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white/30 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105 inline-flex items-center border-2 border-white/50"
              >
                🚀 Experience Demo
                <Sparkles className="ml-2 h-5 w-5" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 px-4 sm:px-6 lg:px-8 border-t-4 border-yellow-400">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="col-span-1">
              <div className="flex items-center mb-4">
                <Sparkles className="h-6 w-6 text-yellow-400 mr-2" />
                <BookOpen className="h-6 w-6 text-red-400 mr-2" />
                <span className="text-xl font-bold">StudySync</span>
              </div>
              <p className="text-gray-400 leading-relaxed">
                Connecting students worldwide for better academic outcomes through intelligent matching and collaborative learning.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Mobile App</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Integrations</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">About</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Contact</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white transition-colors">Help Center</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white transition-colors">Status</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 StudySync. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;