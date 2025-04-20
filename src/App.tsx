import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HomePage from './pages/HomePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import UserProfile from './pages/UserProfile';
import ModeratorProfilePage from './pages/ModeratorProfilePage';
import OrganizerProfilePage from './pages/OrganizerProfilePage';
import Header from './components/Header';
// import ProtectedRoute from './components/ProtectedRoute'; // Закомментируем импорт
import { UserRole } from './types/User';

const App: React.FC = () => {
  return (
    <Router>
      <Header />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route 
          path="/profile" 
          element={
            // <ProtectedRoute allowedRoles={[UserRole.PARTICIPANT, UserRole.ORGANIZER, UserRole.MODERATOR]}>
              <UserProfile />
            // </ProtectedRoute>
          } 
        />
        <Route 
          path="/moderator" 
          element={
            // <ProtectedRoute allowedRoles={[UserRole.MODERATOR]}>
              <ModeratorProfilePage />
            // </ProtectedRoute>
          } 
        />
        <Route 
          path="/organizer" 
          element={
            // <ProtectedRoute allowedRoles={[UserRole.ORGANIZER]}>
              <OrganizerProfilePage />
            // </ProtectedRoute>
          } 
        />
        <Route path="*" element={<div>Страница не найдена</div>} />
      </Routes>
    </Router>
  );
};

export default App; 