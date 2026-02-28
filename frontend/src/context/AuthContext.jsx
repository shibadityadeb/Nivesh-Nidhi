import { createContext, useContext, useState } from "react";
import SuccessModal from "@/components/SuccessModal";
import TermsModal from "@/components/TermsModal";
import LoginSuccessModal from "@/components/LoginSuccessModal";
import { auth as authApi } from "@/lib/api";

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
    let data;
    try {
      const res = await authApi.signup({ name, email, phone, password });
      data = res.data;
    } catch (error) {
      data = error.response?.data || { success: false, message: "Signup failed" };
    }

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

  const loginUser = async ({ email, password, role = "USER" }) => {
    let data;
    try {
      const res = await authApi.login({ email, password, role });
      data = res.data;
    } catch (error) {
      data = error.response?.data || { success: false, message: "Login failed" };
    }

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

  const googleLoginUser = async (credential) => {
    let data;
    try {
      const res = await authApi.googleLogin(credential);
      data = res.data;
    } catch (error) {
      data = error.response?.data || { success: false, message: "Google login failed" };
    }

    if (!data.success) {
      throw new Error(data.message || "Google login failed");
    }

    localStorage.setItem("nn_token", data.data.token);
    persistUser(data.data.user);
    setToken(data.data.token);
    setShowAuthModal(false);

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
      showTermsModal,
      showSuccessModal,
      showLoginSuccessModal,
      user,
      token,
      isAuthenticated: !!user && !!token,
      signupUser,
      loginUser,
      googleLoginUser,
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
