import { createContext, useContext, useState, useEffect } from 'react';
import { getProfile } from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('nn_token');
    if (token) {
      getProfile()
        .then((res) => setUser(res.data.data.user))
        .catch(() => localStorage.removeItem('nn_token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = (token, userData) => {
    localStorage.setItem('nn_token', token);
    setUser(userData);
  };

  const logout = () => {
    localStorage.removeItem('nn_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
