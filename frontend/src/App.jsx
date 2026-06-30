import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { LanguageProvider } from './contexts/LanguageContext';
import ProtectedRoute from './components/ProtectedRoute';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Members from './pages/Members';
import Posts from './pages/Posts';
import AIChat from './pages/AIChat';
import MemberDashboard from './pages/MemberDashboard';
import AdminDashboard from './pages/AdminDashboard';
import AdminMembers from './pages/AdminMembers';
import AdminPosts from './pages/AdminPosts';
import AdminConfig from './pages/AdminConfig';

function App() {
  return (
    <LanguageProvider>
      <AuthProvider>
        <Router>
          <Routes>
            {/* Tuyến đường công khai */}
            <Route path="/" element={<Home />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/members" element={<Members />} />
            <Route path="/posts" element={<Posts />} />
            <Route path="/ai-chat" element={<AIChat />} />

            {/* Tuyến đường bảo vệ dành cho Hội viên */}
            <Route 
              path="/member-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['member']}>
                  <MemberDashboard />
                </ProtectedRoute>
              } 
            />

            {/* Tuyến đường bảo vệ dành cho Admin */}
            <Route 
              path="/admin-dashboard" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminDashboard />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-members" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminMembers />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-posts" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminPosts />
                </ProtectedRoute>
              } 
            />
            <Route 
              path="/admin-config" 
              element={
                <ProtectedRoute allowedRoles={['admin']}>
                  <AdminConfig />
                </ProtectedRoute>
              } 
            />
          </Routes>
        </Router>
      </AuthProvider>
    </LanguageProvider>
  );
}

export default App;
