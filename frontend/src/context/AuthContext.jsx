import { createContext, useContext, useState, useEffect } from 'react';
import api from '../utils/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const verifyToken = async () => {
      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/auth/me');
        const userData = res.data.data || res.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        // If 401 or 403, clear session
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const googleLogin = async () => {
    try {
      const { signInWithGoogle } = await import('../utils/firebase');
      const firebaseUser = await signInWithGoogle();
      const idToken = await firebaseUser.getIdToken();
      
      const res = await api.post('/auth/google-login', { 
        idToken,
        email: firebaseUser.email,
        name: firebaseUser.displayName,
        googleId: firebaseUser.uid 
      });
      
      const { user: userData, token: userToken } = res.data.data || res.data;
      localStorage.setItem('token', userToken);
      localStorage.setItem('user', JSON.stringify(userData));
      setToken(userToken);
      setUser(userData);
      return res.data.data || res.data;
    } catch (error) {
      console.error("Firebase Google Login Detailed Error:", {
        message: error.message,
        code: error.code,
        response: error.response?.data
      });
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, setUser, googleLogin, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
