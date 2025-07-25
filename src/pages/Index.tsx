
import React, { useState, useEffect } from 'react';
import SplashScreen from '@/components/SplashScreen';
import LoginPage from '@/components/LoginPage';
import AdminDashboard from '@/components/AdminDashboard';

const Index = () => {
  const [currentView, setCurrentView] = useState<'splash' | 'login' | 'dashboard'>('splash');

  useEffect(() => {
    // Check if admin is already logged in
    const adminLogin = localStorage.getItem("admin_login");
    if (adminLogin === "011090") {
      setCurrentView('dashboard');
    }
  }, []);

  const handleSplashComplete = () => {
    const adminLogin = localStorage.getItem("admin_login");
    if (adminLogin === "011090") {
      setCurrentView('dashboard');
    } else {
      setCurrentView('login');
    }
  };

  const handleLoginSuccess = () => {
    setCurrentView('dashboard');
  };

  const handleLogout = () => {
    setCurrentView('login');
  };

  if (currentView === 'splash') {
    return <SplashScreen onComplete={handleSplashComplete} />;
  }

  if (currentView === 'login') {
    return <LoginPage onLoginSuccess={handleLoginSuccess} />;
  }

  return <AdminDashboard onLogout={handleLogout} />;
};

export default Index;
