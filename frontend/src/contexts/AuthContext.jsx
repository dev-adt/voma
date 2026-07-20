import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [role, setRole] = useState('guest'); // guest, member, admin
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Khôi phục phiên làm việc khi load trang
  useEffect(() => {
    const checkAuth = async () => {
      const adminToken = localStorage.getItem('voma_admin_token');
      const adminUserStr = localStorage.getItem('voma_admin_user');
      const memberToken = localStorage.getItem('voma_member_token');
      const memberUserStr = localStorage.getItem('voma_member_user');

      if (adminToken && adminUserStr) {
        try {
          // Thử check-auth phía admin
          const res = await fetch('/api/admin/check-auth', {
            headers: { 'Authorization': 'Bearer ' + adminToken }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setRole('admin');
              setUser(data.admin);
              setToken(adminToken);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Admin session verification failed", e);
        }
        // Nếu token hết hạn hoặc lỗi, dọn dẹp
        localStorage.removeItem('voma_admin_token');
        localStorage.removeItem('voma_admin_user');
      }

      if (memberToken && memberUserStr) {
        try {
          // Thử check-auth phía member
          const res = await fetch('/api/member/check-auth', {
            headers: { 'Authorization': 'Bearer ' + memberToken }
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success) {
              setRole('member');
              setUser(data.member);
              setToken(memberToken);
              setLoading(false);
              return;
            }
          }
        } catch (e) {
          console.error("Member session verification failed", e);
        }
        // Nếu token hết hạn hoặc lỗi, dọn dẹp
        localStorage.removeItem('voma_member_token');
        localStorage.removeItem('voma_member_user');
      }

      // Fallback về guest
      setRole('guest');
      setUser(null);
      setToken(null);
      setLoading(false);
    };

    checkAuth();
  }, []);

  const login = async (username, password) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Đăng nhập không thành công.');
    }

    setToken(data.token);
    setRole(data.role);

    if (data.role === 'admin') {
      setUser(data.admin);
      localStorage.setItem('voma_admin_token', data.token);
      localStorage.setItem('voma_admin_user', JSON.stringify(data.admin));
      // Dọn dẹp token member nếu có
      localStorage.removeItem('voma_member_token');
      localStorage.removeItem('voma_member_user');
    } else if (data.role === 'member') {
      setUser(data.user);
      localStorage.setItem('voma_member_token', data.token);
      localStorage.setItem('voma_member_user', JSON.stringify(data.user));
      // Dọn dẹp token admin nếu có
      localStorage.removeItem('voma_admin_token');
      localStorage.removeItem('voma_admin_user');
    }

    return data;
  };

  const logout = async () => {
    try {
      if (role === 'admin' && token) {
        await fetch('/api/admin/logout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
      } else if (role === 'member' && token) {
        await fetch('/api/member/logout', {
          method: 'POST',
          headers: { 'Authorization': 'Bearer ' + token }
        });
      }
    } catch (e) {
      console.error("Logout API call failed", e);
    }

    // Luôn xóa local storage và reset state kể cả khi gọi API lỗi
    localStorage.removeItem('voma_admin_token');
    localStorage.removeItem('voma_admin_user');
    localStorage.removeItem('voma_member_token');
    localStorage.removeItem('voma_member_user');
    
    setRole('guest');
    setUser(null);
    setToken(null);
  };

  const setGuestMode = () => {
    localStorage.removeItem('voma_admin_token');
    localStorage.removeItem('voma_admin_user');
    localStorage.removeItem('voma_member_token');
    localStorage.removeItem('voma_member_user');
    setRole('guest');
    setUser(null);
    setToken(null);
  };

  const getAuthHeaders = () => {
    return token ? { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' } : { 'Content-Type': 'application/json' };
  };

  return (
    <AuthContext.Provider value={{ role, user, token, loading, login, logout, setGuestMode, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
