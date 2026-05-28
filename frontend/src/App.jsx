import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { AuthProvider, useAuth } from "./context/AuthContext";
import AuthPage from "./pages/AuthPage";
import ExamPage from "./pages/ExamPage";
import ExamResultPage from "./pages/ExamResultPage";
import LeaderboardPage from "./pages/LeaderboardPage";
import ProgressPage from "./pages/ProgressPage";

function PrivateRoute({ children }) {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ height: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: "#0d1117", color: "#58a6ff", fontFamily: "monospace" }}>
      Loading…
    </div>
  );
  return user ? children : <Navigate to="/login" replace />;
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
        <Routes>
          <Route path="/login" element={<AuthPage />} />

          {/* Placement exam */}
          <Route path="/" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
          <Route path="/exam" element={<PrivateRoute><ExamPage /></PrivateRoute>} />
          <Route path="/exam/result/:sessionId" element={<PrivateRoute><ExamResultPage /></PrivateRoute>} />
          <Route path="/exam/leaderboard" element={<PrivateRoute><LeaderboardPage /></PrivateRoute>} />
          <Route path="/progress" element={<PrivateRoute><ProgressPage /></PrivateRoute>} />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  );
}
