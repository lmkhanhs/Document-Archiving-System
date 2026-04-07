// src/routes/AppRouter.jsx
import { Routes, Route, Navigate } from "react-router-dom";
import Home from "../pages/Home";
import Login from "../pages/auth/Login";

const AppRouter = () => {
  return (
    <Routes>
      {/* Trang chính */}
      <Route path="/" element={<Home />} />

      {/* Trang login */}
      <Route path="/login" element={<Login />} />

      {/* fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRouter;