import { createContext, useContext, useState, useEffect } from "react";
import { getMe } from "../api/auth";

const AuthContext = createContext(null);

// Demo user — no DB, no token needed
const DEMO_USER = {
  id: "demo",
  name: "Demo User",
  email: "demo@interviewai.dev",
  avatar: null,
  theme: "dark",
  isDemo: true,
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if demo session
    const isDemo = sessionStorage.getItem("demoMode");
    if (isDemo) { setUser(DEMO_USER); setLoading(false); return; }

    // Check if real token exists
    const token = localStorage.getItem("accessToken");
    if (!token) { setLoading(false); return; }

    getMe()
      .then(({ data }) => setUser(data.user))
      .catch(() => { localStorage.clear(); })
      .finally(() => setLoading(false));
  }, []);

  const login = (userData, tokens) => {
    localStorage.setItem("accessToken", tokens.accessToken);
    localStorage.setItem("refreshToken", tokens.refreshToken);
    setUser(userData);
  };

  const loginAsDemo = () => {
    sessionStorage.setItem("demoMode", "true");
    setUser(DEMO_USER);
  };

  const logout = () => {
    localStorage.clear();
    sessionStorage.clear();
    setUser(null);
  };

  const updateTheme = (theme) => setUser((u) => ({ ...u, theme }));

  return (
    <AuthContext.Provider value={{ user, loading, login, loginAsDemo, logout, updateTheme }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => useContext(AuthContext);