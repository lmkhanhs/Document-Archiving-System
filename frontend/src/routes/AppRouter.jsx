// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register";
import MyDocuments from "../pages/documents/MyDocuments";

const isAuthenticated = () => Boolean(localStorage.getItem("accessToken"));

const ProtectedRoute = ({ children }) => {
  return isAuthenticated() ? children : <Navigate to="/login" replace />;
};

const PublicOnlyRoute = ({ children }) => {
  return isAuthenticated() ? <Navigate to="/" replace /> : children;
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