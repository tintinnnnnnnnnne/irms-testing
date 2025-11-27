/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../config/axios'; // Import natin para sa logout

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

  useEffect(() => {
    // Check if user is logged in on app start via LocalStorage
    // (Pwede rin tayong mag-api call dito sa future para i-verify ang session)
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []); // Empty array is fine here, setUser is stable.

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = async () => {
    try {
      // Optional: Tawagin ang backend para burahin ang HTTP Cookie
      // Kung wala pang logout endpoint ang backend mo, okay lang, mag-eerror lang to pero tuloy pa rin ang logout sa UI
      await api.post('/api/auth/logout'); 
    } catch (error) {
      console.log("Server logout skipped or failed: ", error);
    } finally {
      // Clear Client Side Data
      setUser(null);
      localStorage.removeItem('user');
      localStorage.removeItem('authToken');
      // Pwede ka magdagdag ng navigate('/login') dito sa component level kung gusto mo
    }
  };

  const value = { 
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};