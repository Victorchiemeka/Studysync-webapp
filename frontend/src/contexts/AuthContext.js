import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Mock authentication service for when backend is not available
  const mockAuth = {
    async getCurrentUser() {
      const savedUser = localStorage.getItem('studysync_user');
      return savedUser ? JSON.parse(savedUser) : null;
    },

    async login(email, password) {
      // Create realistic mock user based on email
      const mockUser = {
        id: Date.now(),
        email: email,
        firstName: email === 'victor@example.com' ? 'Victor' : email.split('@')[0],
        lastName: email === 'victor@example.com' ? 'Smith' : 'User',
        username: email.split('@')[0],
        major: null,
        profileCompleted: false,
        classes: [],
        goals: [],
        studyStyle: null,
        preferredLocations: []
      };
      
      localStorage.setItem('studysync_user', JSON.stringify(mockUser));
      return mockUser;
    },

    async signup(email, password, name) {
      const nameParts = name.split(' ');
      const mockUser = {
        id: Date.now(),
        email: email,
        firstName: nameParts[0] || email.split('@')[0],
        lastName: nameParts[1] || 'User',
        username: email.split('@')[0],
        major: null,
        profileCompleted: false,
        classes: [],
        goals: [],
        studyStyle: null,
        preferredLocations: []
      };
      
      localStorage.setItem('studysync_user', JSON.stringify(mockUser));
      return mockUser;
    },

    async completeProfile(profileData) {
      const savedUser = localStorage.getItem('studysync_user');
      if (savedUser) {
        const user = JSON.parse(savedUser);
        const updatedUser = {
          ...user,
          firstName: profileData.firstName || user.firstName,
          lastName: profileData.lastName || user.lastName,
          major: profileData.major,
          studyYear: profileData.studentYear,
          classes: profileData.classes || [],
          goals: [profileData.studyGoal] || [],
          studyStyle: profileData.studyStyle,
          preferredLocations: profileData.preferredLocations || [],
          profileCompleted: true
        };
        
        localStorage.setItem('studysync_user', JSON.stringify(updatedUser));
        return updatedUser;
      }
      return null;
    },

    logout() {
      localStorage.removeItem('studysync_user');
    }
  };

  const checkAuthStatus = async () => {
    setLoading(true);
    try {
      // Try backend first
      const response = await fetch('http://localhost:8081/api/auth/user', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setIsAuthenticated(true);
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.log('Backend not available, using local authentication');
      // Use mock authentication when backend is not available
      const mockUser = await mockAuth.getCurrentUser();
      if (mockUser) {
        setUser(mockUser);
        setIsAuthenticated(true);
      }
    }
    setLoading(false);
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const login = async (email, password) => {
    try {
      // Try backend first
      const response = await fetch('http://localhost:8081/api/auth/email-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
          return { success: true, user: data.user };
        }
        return { success: false, message: data.message };
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.log('Using local authentication for login');
      // Fallback to mock
      const mockUser = await mockAuth.login(email, password);
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, user: mockUser };
    }
  };

  const signup = async (email, password, name) => {
    try {
      // Try backend first
      const response = await fetch('http://localhost:8081/api/auth/email-signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email, password, name })
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          setIsAuthenticated(true);
          return { success: true, user: data.user };
        }
        return { success: false, message: data.message };
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.log('Using local authentication for signup');
      // Fallback to mock
      const mockUser = await mockAuth.signup(email, password, name);
      setUser(mockUser);
      setIsAuthenticated(true);
      return { success: true, user: mockUser };
    }
  };

  const completeProfile = async (profileData) => {
    try {
      // Try backend first
      const response = await fetch('http://localhost:8081/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(profileData)
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setUser(data.user);
          return { success: true, user: data.user };
        }
        return { success: false, message: data.message };
      } else {
        throw new Error('Backend not available');
      }
    } catch (error) {
      console.log('Using local authentication for profile completion');
      // Fallback to mock
      const updatedUser = await mockAuth.completeProfile(profileData);
      setUser(updatedUser);
      return { success: true, user: updatedUser };
    }
  };

  const logout = async () => {
    try {
      // Try to logout from backend first
      await fetch('http://localhost:8081/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      });
    } catch (error) {
      console.log('Backend logout failed, using local logout');
    }
    
    // Clear local storage and state
    mockAuth.logout();
    setUser(null);
    setIsAuthenticated(false);
    
    // Redirect to landing page
    window.location.href = '/';
  };

  const value = {
    user,
    loading,
    isAuthenticated,
    login,
    signup,
    completeProfile,
    logout,
    checkAuthStatus
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};
