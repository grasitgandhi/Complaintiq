// frontend/src/context/AuthContext.jsx
import { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);

  // Rehydrate from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('complaintiq_auth');
    if (stored) {
      try {
        const { user, role, token } = JSON.parse(stored);
        setUser(user); setRole(role); setToken(token);
      } catch (_) { }
    }
    setLoading(false);
  }, []);

  async function login(email, password, role) {
    try {
      const { user_id, name, role: userRole, token, email: normalizedEmail } = await api.auth.login(email, password, role);
      const userData = { id: user_id, name, email: normalizedEmail || email };
      persist(userData, userRole, token);
      return { success: true, role: userRole };
    } catch (err) {
      const isNetworkError = !err.response;
      const message = isNetworkError
        ? 'Cannot reach backend API at http://localhost:8000. Start the backend server and try again.'
        : (err.message || 'Login failed. Please try again.');
      return { success: false, error: message };
    }
  }

  function persist(userData, userRole, userToken) {
    setUser(userData); setRole(userRole); setToken(userToken);
    localStorage.setItem('complaintiq_auth', JSON.stringify({ user: userData, role: userRole, token: userToken }));
  }

  function logout() {
    setUser(null); setRole(null); setToken(null);
    localStorage.removeItem('complaintiq_auth');
  }

  return (
    <AuthContext.Provider value={{ user, role, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
