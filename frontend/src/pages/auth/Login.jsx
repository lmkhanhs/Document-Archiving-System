// src/pages/auth/Login.jsx
import { useEffect, useState } from "react";
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
  Snackbar,
  Checkbox,
  Divider,
  FormControlLabel,
  Link,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import {
  Visibility,
  VisibilityOff,
  LockOutlined,
  PersonOutline,
} from "@mui/icons-material";
import { GoogleLogin } from "@react-oauth/google";

const Login = () => {
  const navigate = useNavigate();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  const googleButtonWidth = isMobile ? "280" : "420";

  const [formData, setFormData] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success",
  });

  useEffect(() => {
    const rememberedUsername = localStorage.getItem("rememberedUsername");
    if (rememberedUsername) {
      setFormData((prev) => ({ ...prev, username: rememberedUsername }));
      setRememberMe(true);
    }
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleClickShowPassword = () => setShowPassword((show) => !show);

  const handleCloseSnackbar = (event, reason) => {
    if (reason === "clickaway") return;
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      setLoading(true);
      const idToken = credentialResponse?.credential;

      if (!idToken) {
        throw new Error("Không lấy được thông tin Google credential");
      }

      const data = await googleLogin(idToken);

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setSnackbar({
        open: true,
        message: "Đăng nhập Google thành công!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Đăng nhập Google thất bại: ${err.message}`,
        severity: "error",
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
        severity: "error",
      });
      return;
    }

    try {
      setLoading(true);

      const data = await login(formData);

      if (rememberMe) {
        localStorage.setItem("rememberedUsername", formData.username.trim());
      } else {
        localStorage.removeItem("rememberedUsername");
      }

      localStorage.setItem("accessToken", data.accessToken);
      localStorage.setItem("refreshToken", data.refreshToken);

      setSnackbar({
        open: true,
        message: "Đăng nhập thành công!",
        severity: "success",
      });

      setTimeout(() => {
        navigate("/");
      }, 1000);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Đăng nhập thất bại: ${err.message}`,
        severity: "error",
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
        background:
          "radial-gradient(circle at 10% 10%, #dbeafe 0%, #eff6ff 35%, #f8fafc 70%, #ffffff 100%)",
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
            backgroundColor: "rgba(255, 255, 255, 0.92)",
            backdropFilter: "blur(10px)",
            boxShadow: "0 20px 60px rgba(15, 39, 71, 0.12)",
          }}
        >
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: "1fr",
            }}
          >
            <Box sx={{ p: { xs: 3, sm: 4 } }}>
              <Typography
                component="h1"
                sx={{
                  fontSize: { xs: "1.9rem", sm: "2.1rem" },
                  fontWeight: 800,
                  color: "#0f2747",
                  letterSpacing: 0.2,
                }}
              >
                Welcome Back
              </Typography>

              <Typography sx={{ mt: 0.8, color: "#5b6b7f", mb: 3 }}>
                Sign in to your account to continue managing your documents.
              </Typography>

              <Box component="form" onSubmit={handleSubmit} sx={{ width: "100%" }}>
                <TextField
                  fullWidth
                  id="username"
                  label="Email or Username"
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
                  autoComplete="current-password"
                  value={formData.password}
                  onChange={handleChange}
                  sx={{ mb: 1.1 }}
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
                />

                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    mb: 2.4,
                    flexWrap: "wrap",
                    rowGap: 0.8,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox
                        checked={rememberMe}
                        onChange={(e) => setRememberMe(e.target.checked)}
                      />
                    }
                    label={
                      <Typography sx={{ color: "#526073", fontSize: 14 }}>
                        Remember me
                      </Typography>
                    }
                    sx={{ m: 0 }}
                  />

                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    sx={{ color: "#1f6feb", fontWeight: 600, fontSize: 14 }}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: "Tính năng quên mật khẩu sẽ được cập nhật sớm",
                        severity: "success",
                      });
                    }}
                  >
                    Forgot password?
                  </Link>
                </Box>

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
                  {loading ? <CircularProgress size={24} color="inherit" /> : "Login"}
                </Button>

                <Divider sx={{ my: 2.6, color: "#8b9ab0", fontSize: 13 }}>
                  Or continue with
                </Divider>

                <Box
                  sx={{
                    display: "grid",
                    gap: 1.2,
                    width: "100%",
                    mt: 0.2,
                    borderRadius: 2.5,
                    p: 1.2,
                    border: "1px solid #d6e4f8",
                    background:
                      "linear-gradient(180deg, #f9fbff 0%, #edf4ff 100%)",
                  }}
                >
                  <Typography
                    sx={{
                      textAlign: "center",
                      fontSize: 13,
                      color: "#62758f",
                      px: 1,
                    }}
                  >
                    Use your Google account for quick and secure access
                  </Typography>

                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "center",
                      mt: 0.2,
                      "& > div": {
                        width: "100% !important",
                        display: "flex",
                        justifyContent: "center",
                      },
                      "& [role='button']": {
                        borderRadius: "999px !important",
                        boxShadow: "0 8px 20px rgba(55, 109, 214, 0.16)",
                      },
                    }}
                  >
                    <GoogleLogin
                      onSuccess={handleGoogleSuccess}
                      onError={() => {
                        setSnackbar({
                          open: true,
                          message: "Tính năng đăng nhập Google tạm thời bị lỗi",
                          severity: "error",
                        });
                      }}
                      useOneTap={false}
                      theme="outline"
                      text="continue_with"
                      shape="pill"
                      size="large"
                      width={googleButtonWidth}
                      logo_alignment="left"
                      locale="en"
                    />
                  </Box>
                </Box>

                <Typography
                  sx={{
                    mt: 2.8,
                    textAlign: "center",
                    color: "#5b6b7f",
                    fontSize: 14,
                  }}
                >
                  Don&apos;t have an account?{" "}
                  <Link
                    component="button"
                    type="button"
                    underline="hover"
                    sx={{ color: "#1f6feb", fontWeight: 700, fontSize: 14 }}
                    onClick={() => {
                      setSnackbar({
                        open: true,
                        message: "Trang đăng ký sẽ được cập nhật sớm",
                        severity: "success",
                      });
                    }}
                  >
                    Sign up
                  </Link>
                </Typography>
              </Box>
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

export default Login;