import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, allowedRoles }) => {
  const { role, loading } = useAuth();

  if (loading) {
    return (
      <div style={{
        height: '100vh',
        backgroundColor: '#0F172A',
        color: '#F8FAFC',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Inter, sans-serif'
      }}>
        <i className="ti ti-loader animate-spin" style={{ fontSize: '32px', marginBottom: '12px', color: '#1E88E5' }}></i>
        <div style={{ fontSize: '13px', color: '#64748B', fontWeight: '500' }}>Đang xác thực thông tin...</div>
      </div>
    );
  }

  if (!allowedRoles.includes(role)) {
    // Nếu không có quyền, chuyển hướng về trang đăng nhập
    return <Navigate to="/login" replace />;
  }

  return children;
};
export default ProtectedRoute;
