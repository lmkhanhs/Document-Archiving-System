// src/pages/auth/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login, googleLogin } from "../../services/authService";
import { 
  Box, 
  Container, 
  Paper, 
  Typography, 
  TextField, 
  Button, 
  CircularProgress, 
  Alert,
  InputAdornment,
  IconButton,
  Snackbar
} from "@mui/material";
import { Visibility, VisibilityOff, LockOutlined, PersonOutline } from "@mui/icons-material";
import { GoogleLogin } from '@react-oauth/google';
import loginImage from "../../assets/loginImage.png";

const Login = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" // 'success' hoặc 'error'
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar(prev => ({ ...prev, open: false }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const data = await googleLogin(credentialResponse.credential);
      
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setSnackbar({
        open: true,
        message: "Đăng nhập Google thành công!",
        severity: "success"
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Đăng nhập Google thất bại: ${err.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password) {
      setSnackbar({
        open: true,
        message: "Vui lòng nhập đầy đủ thông tin",
        severity: "error"
      });
      return;
    }

    try {
      setLoading(true);

      const data = await login(formData);

      // ✅ Lưu token
      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      // Hiện thông báo thành công
      setSnackbar({
        open: true,
        message: "Đăng nhập thành công!",
        severity: "success"
      });

      // Chờ nhỏ trước khi chuyển trang để user kịp thấy thông báo
      setTimeout(() => {
        navigate("/");
      }, 1000);

    } catch (err) {
      // Hiện thông báo thất bại
      setSnackbar({
        open: true,
        message: `Đăng nhập thất bại: ${err.message}`,
        severity: "error"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundImage: `url(${loginImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        padding: 2,
      }}
    >
      <Container maxWidth="xs">
        <Paper
          elevation={10}
          sx={{
            padding: 4,
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            borderRadius: 3,
            backgroundColor: "rgba(255, 255, 255, 0.95)",
            backdropFilter: "blur(10px)",
          }}
        >
          <Box 
            sx={{ 
              m: 1, 
              bgcolor: 'primary.main', 
              color: 'white', 
              width: 50, 
              height: 50, 
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              mb: 2,
              boxShadow: 2
            }}
          >
            <LockOutlined fontSize="large" />
          </Box>
          <Typography component="h1" variant="h5" fontWeight="bold" color="text.primary" gutterBottom>
            Đăng nhập
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
            Hệ thống quản lý tài liệu
          </Typography>

          <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: "100%" }}>
            <TextField
              margin="normal"
              fullWidth
              id="username"
              label="Tên đăng nhập"
              name="username"
              autoComplete="username"
              autoFocus
              value={formData.username}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <PersonOutline color="action" />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="normal"
              fullWidth
              name="password"
              label="Mật khẩu"
              type={showPassword ? 'text' : 'password'}
              id="password"
              autoComplete="current-password"
              value={formData.password}
              onChange={handleChange}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlined color="action" />
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      aria-label="toggle password visibility"
                      onClick={handleClickShowPassword}
                      edge="end"
                    >
                      {showPassword ? <VisibilityOff /> : <Visibility />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              size="large"
              disabled={loading}
              sx={{
                mt: 1,
                mb: 2,
                py: 1.5,
                fontWeight: "bold",
                borderRadius: 2,
                textTransform: "none",
                fontSize: "1rem",
                boxShadow: 3,
                "&:hover": {
                  boxShadow: 6,
                }
              }}
            >
              {loading ? <CircularProgress size={24} color="inherit" /> : "Đăng nhập"}
            </Button>

            <Box sx={{ mt: 1, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                Hoặc
              </Typography>
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={() => {
                  setSnackbar({
                    open: true,
                    message: "Tính năng đăng nhập Google tạm thời bị lỗi",
                    severity: "error"
                  });
                }}
              />
            </Box>
          </Box>
        </Paper>
      </Container>

      {/* Thông báo Snackbar MUI */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={3000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert 
          onClose={handleCloseSnackbar} 
          severity={snackbar.severity} 
          sx={{ width: '100%', boxShadow: 3 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Login;