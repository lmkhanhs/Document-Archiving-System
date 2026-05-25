// src/routes/AppRouter.jsx
import { useEffect, useState } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import MyDocuments from "../pages/documents/MyDocuments";
import Trash from "../pages/documents/Trash";
import Summarize from "../pages/documents/Summarize";
import AdminDashboard from "../pages/admin/AdminDashboard";
import { getRoles } from "../services/authService";

const isAuthenticated = () => Boolean(localStorage.getItem("accessToken"));

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
};

const AdminRoute = ({ children }) => {
  const [state, setState] = useState({ isLoading: true, isAdmin: false });

  useEffect(() => {
    let isMounted = true;

    const loadRoles = async () => {
      if (!isAuthenticated()) {
        setState({ isLoading: false, isAdmin: false });
        return;
      }

      try {
        const payload = await getRoles();
        const roles = Array.isArray(payload?.roles) ? payload.roles : [];
        if (isMounted) {
          setState({ isLoading: false, isAdmin: roles.includes("ADMIN") });
        }
      } catch {
        if (isMounted) {
          setState({ isLoading: false, isAdmin: false });
        }
      }
    };

    loadRoles();

    return () => {
      isMounted = false;
    };
  }, []);

  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }

  if (state.isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 p-6">
        <div className="mx-auto max-w-3xl rounded-3xl border border-slate-200 bg-white p-6 text-slate-600 shadow-sm">
          Dang kiem tra quyen truy cap...
        </div>
      </div>
    );
  }

  return state.isAdmin ? children : <Navigate to="/" replace />;
};

const AppRouter = () => {
  return (
    <Routes>
      {/* Trang chính */}
      <Route
        path="/"
        element={(
          <ProtectedRoute>
            <Home />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/documents"
        element={(
          <ProtectedRoute>
            <MyDocuments />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/trash"
        element={(
          <ProtectedRoute>
            <Trash />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/summarize"
        element={(
          <ProtectedRoute>
            <Summarize />
          </ProtectedRoute>
        )}
      />

      <Route
        path="/admin"
        element={(
          <AdminRoute>
            <AdminDashboard />
          </AdminRoute>
        )}
      />

      {/* Trang login */}
      <Route
        path="/login"
        element={(
          <PublicOnlyRoute>
            <Login />
          </PublicOnlyRoute>
        )}
      />

      {/* Trang register */}
      <Route
        path="/register"
        element={(
          <PublicOnlyRoute>
            <Register />
          </PublicOnlyRoute>
        )}
      />

      {/* fallback */}
      <Route
        path="*"
        element={<Navigate to={isAuthenticated() ? "/" : "/login"} replace />}
      />
    </Routes>
  );
};

export default AppRouter;