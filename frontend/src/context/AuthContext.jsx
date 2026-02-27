import { createContext, useContext, useState } from "react";
import SuccessModal from "@/components/SuccessModal";
import TermsModal from "@/components/TermsModal";
import LoginSuccessModal from "@/components/LoginSuccessModal";

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);
  const [showLoginSuccessModal, setShowLoginSuccessModal] = useState(false);
  const [newUserName, setNewUserName] = useState("");
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem("nn_user")); } catch { return null; }
  });
  const [token, setToken] = useState(() => localStorage.getItem("nn_token") || null);

  const persistUser = (nextUser) => {
    if (!nextUser) {
      localStorage.removeItem("nn_user");
      setUser(null);
      return;
    }
    localStorage.setItem("nn_user", JSON.stringify(nextUser));
    setUser(nextUser);
  };

  const signupUser = async ({ name, email, phone, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/signup`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, phone, password }),
    });
    const data = await res.json();

    if (!data.success) {
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors.map(err => err.msg).join("\n"));
      }
      throw new Error(data.message || "Signup failed");
    }

    localStorage.setItem("nn_token", data.data.token);
    persistUser(data.data.user);
    setToken(data.data.token);
    setShowAuthModal(false);
    
    // Show success modal then terms modal
    setNewUserName(name);
    setShowSuccessModal(true);
    
    return data.data;
  };

  const loginUser = async ({ email, password }) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (!data.success) {
      if (data.errors && data.errors.length > 0) {
        throw new Error(data.errors.map(err => err.msg).join("\n"));
      }
      throw new Error(data.message || "Login failed");
    }

    localStorage.setItem("nn_token", data.data.token);
    persistUser(data.data.user);
    setToken(data.data.token);
    setShowAuthModal(false);
    
    // Show simple login success notification
    setNewUserName(data.data.user.name);
    setShowLoginSuccessModal(true);
    
    return data.data;
  };

  const updateUser = (nextUser) => {
    persistUser(nextUser);
  };

  const logoutUser = () => {
    localStorage.removeItem("nn_token");
    localStorage.removeItem("nn_user");
    setToken(null);
    setUser(null);
  };

  const handleSuccessClose = () => {
    setShowSuccessModal(false);
    setShowTermsModal(true);
  };

  const handleTermsAccept = () => {
    setShowTermsModal(false);
    // Terms accepted, user can now use the platform
  };

  const handleLoginSuccessClose = () => {
    setShowLoginSuccessModal(false);
  };

  return (
    <AuthContext.Provider value={{
      showAuthModal,
      setShowAuthModal,
      user,
      token,
      isAuthenticated: !!user && !!token,
      signupUser,
      loginUser,
      updateUser,
      logoutUser
    }}>
      {children}
      <SuccessModal 
        show={showSuccessModal} 
        onClose={handleSuccessClose} 
        userName={newUserName}
      />
      <TermsModal 
        show={showTermsModal} 
        onAccept={handleTermsAccept}
      />
      <LoginSuccessModal 
        show={showLoginSuccessModal} 
        onClose={handleLoginSuccessClose} 
        userName={newUserName}
      />
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};
