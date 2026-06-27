import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import RegisterSuccessPage from './pages/RegisterSuccessPage';
import EmailVerifiedPage from './pages/EmailVerifiedPage';
import DashboardPage from './pages/DashboardPage';

function App() {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const [registeredEmail, setRegisteredEmail] = useState(() => {
    return localStorage.getItem('registeredEmail') || '';
  });

  const handleLoginSuccess = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  const handleSetRegisteredEmail = (email) => {
    setRegisteredEmail(email);
    localStorage.setItem('registeredEmail', email);
  };

  return (
    <Router>
      <Routes>
        <Route 
          path="/login" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <LoginPage onLoginSuccess={handleLoginSuccess} />
          } 
        />
        <Route 
          path="/register" 
          element={
            user ? <Navigate to="/dashboard" replace /> : <RegisterPage setRegisteredEmail={handleSetRegisteredEmail} />
          } 
        />
        <Route 
          path="/success" 
          element={
            <RegisterSuccessPage email={registeredEmail} />
          } 
        />
        <Route 
          path="/verify" 
          element={
            <EmailVerifiedPage />
          } 
        />
        <Route 
          path="/dashboard" 
          element={
            user ? <DashboardPage user={user} onLogout={handleLogout} /> : <Navigate to="/login" replace />
          } 
        />
        {/* Redirect unknown routes */}
        <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} replace />} />
      </Routes>
    </Router>
  );
}

export default App;
