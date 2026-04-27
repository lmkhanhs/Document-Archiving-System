import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { register } from "../../services/authService";
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  Container,
  IconButton,
  InputAdornment,
  Link,
  Paper,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import {
  LockOutlined,
  PersonOutline,
  Visibility,
  VisibilityOff,
} from "@mui/icons-material";

const Register = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    username: "",
    password: "",
    confirmPassword: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const showError = (message) => {
    setSnackbar({
      open: true,
      message,
      severity: "error",
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.username || !formData.password || !formData.confirmPassword) {
      showError("Vui lòng nhập đầy đủ thông tin");
      return;
    }

    if (formData.password.length < 6) {
      showError("Mật khẩu cần tối thiểu 6 ký tự");
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      showError("Mật khẩu xác nhận không khớp");
      return;
    }

    try {
      setLoading(true);

      await register({
        username: formData.username.trim(),
        password: formData.password,
        confirmPassword: formData.confirmPassword,
      });

      setSnackbar({
        open: true,
        message: "Đăng ký thành công! Mời bạn đăng nhập.",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/login", {
          replace: true,
          state: { registeredUsername: formData.username.trim() },
        });
      }, 900);
    } catch (err) {
      showError(err.message || "Đăng ký thất bại");
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
        background:
          "radial-gradient(circle at 0% 0%, #d8eefe 0%, #ecf4ff 45%, #f6f9ff 72%, #ffffff 100%)",
        p: { xs: 2, md: 3 },
        fontFamily: '"Inter", "Poppins", sans-serif',
      }}
    >
      <Container
        maxWidth={false}
        sx={{
          maxWidth: "560px",
          width: "100%",
          mx: "auto",
        }}
      >
        <Paper
          elevation={0}
          sx={{
            borderRadius: 6,
            overflow: "hidden",
            border: "1px solid #dbe5f2",
            backgroundColor: "rgba(255, 255, 255, 0.93)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(15, 39, 71, 0.12)",
          }}
        >
          <Box sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              component="h1"
              sx={{
                fontSize: { xs: "1.85rem", sm: "2.1rem" },
                fontWeight: 800,
                color: "#0f2747",
                letterSpacing: 0.2,
              }}
            >
              Create Account
            </Typography>

            <Typography sx={{ mt: 0.8, color: "#5b6b7f", mb: 3 }}>
              Register to start managing your documents securely.
            </Typography>

            <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
              <TextField
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                autoFocus
                value={formData.username}
                onChange={handleChange}
                sx={{ mb: 2 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <PersonOutline color="action" />
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? "text" : "password"}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                sx={{ mb: 2 }}
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
                        onClick={() => setShowPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <TextField
                fullWidth
                name="confirmPassword"
                label="Confirm Password"
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                autoComplete="new-password"
                value={formData.confirmPassword}
                onChange={handleChange}
                sx={{ mb: 2.5 }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <LockOutlined color="action" />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        aria-label="toggle confirm password visibility"
                        onClick={() => setShowConfirmPassword((prev) => !prev)}
                        edge="end"
                      >
                        {showConfirmPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                type="submit"
                fullWidth
                variant="contained"
                size="large"
                disabled={loading}
                sx={{
                  py: 1.45,
                  fontWeight: 700,
                  borderRadius: 2.5,
                  textTransform: "none",
                  fontSize: "1rem",
                  background: "linear-gradient(135deg, #1f6feb 0%, #3b82f6 100%)",
                  boxShadow: "0 12px 26px rgba(31, 111, 235, 0.35)",
                  "&:hover": {
                    boxShadow: "0 14px 30px rgba(31, 111, 235, 0.45)",
                  },
                }}
              >
                {loading ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Create Account"
                )}
              </Button>

              <Typography
                sx={{
                  mt: 2.8,
                  textAlign: "center",
                  color: "#5b6b7f",
                  fontSize: 14,
                }}
              >
                Already have an account?{" "}
                <Link
                  component="button"
                  type="button"
                  underline="hover"
                  sx={{ color: "#1f6feb", fontWeight: 700, fontSize: 14 }}
                  onClick={() => navigate("/login")}
                >
                  Sign in
                </Link>
              </Typography>
            </Box>
          </Box>
        </Paper>
      </Container>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbar.severity}
          sx={{ width: "100%", boxShadow: 3 }}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Register;
