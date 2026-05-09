import { createContext, useContext, useState, useEffect, useRef } from 'react';
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
      // Check for Firebase Redirect Result (for production stability)
      try {
        const { handleRedirectResult } = await import('../utils/firebase');
        const firebaseUser = await handleRedirectResult();
        if (firebaseUser) {
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
        }
      } catch (err) {
        console.error("Auth Redirect Processing Error:", err);
      }

      if (!token) { setLoading(false); return; }
      try {
        const res = await api.get('/auth/me');
        const userData = res.data.data || res.data;
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      } catch (err) {
        if (err.response?.status === 401 || err.response?.status === 403) {
          logout();
        }
      } finally {
        setLoading(false);
      }
    };
    verifyToken();
  }, [token]);

  const [dashboardCounts, setDashboardCounts] = useState({ pendingUsers: 0, pendingOrders: 0, acceptedOrders: 0 });
  const prevPendingCount = useRef(0);

  // Simple Global Polling (1 minute)
  useEffect(() => {
    if (!token || (user?.role !== 'admin' && user?.role !== 'staff')) return;

    const pollData = async () => {
      try {
        // Pull orders and pending users
        const [ordersRes, usersRes] = await Promise.all([
          api.get('/orders'),
          user.role === 'admin' ? api.get('/admin/users/pending') : Promise.resolve({ data: [] })
        ]);

        const orders = ordersRes.data.data || ordersRes.data || [];
        const pendingUsers = usersRes.data || usersRes || [];

        const counts = {
          pendingUsers: pendingUsers.length,
          pendingOrders: orders.filter(o => o.status === 'pending').length,
          acceptedOrders: orders.filter(o => o.status === 'accepted' && (user.role === 'admin' || o.handled_by === user.id)).length
        };

        if (counts.pendingOrders > prevPendingCount.current) {
          window.dispatchEvent(new CustomEvent('new-order-alert', { detail: counts.pendingOrders }));
        }

        prevPendingCount.current = counts.pendingOrders;
        setDashboardCounts(counts);
      } catch (err) {
        console.error('Polling error:', err);
      }
    };

    pollData();
    const interval = setInterval(pollData, 60000);
    return () => clearInterval(interval);
  }, [token, user?.role]);

  const googleLogin = async () => {
    try {
      const { signInWithGoogle } = await import('../utils/firebase');
      await signInWithGoogle();
      // Execution stops here due to page redirect
    } catch (error) {
      console.error("Firebase Google Login Error:", error);
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
    <AuthContext.Provider value={{ user, token, setUser, googleLogin, logout, loading, dashboardCounts }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
