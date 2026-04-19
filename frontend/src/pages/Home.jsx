import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  InputAdornment,
  LinearProgress,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import SearchIcon from "@mui/icons-material/Search";
import HomeOutlinedIcon from "@mui/icons-material/HomeOutlined";
import FolderOpenOutlinedIcon from "@mui/icons-material/FolderOpenOutlined";
import GroupOutlinedIcon from "@mui/icons-material/GroupOutlined";
import HistoryOutlinedIcon from "@mui/icons-material/HistoryOutlined";
import DeleteOutlineOutlinedIcon from "@mui/icons-material/DeleteOutlineOutlined";
import AccessTimeOutlinedIcon from "@mui/icons-material/AccessTimeOutlined";
import InsertDriveFileOutlinedIcon from "@mui/icons-material/InsertDriveFileOutlined";
import LogoutOutlinedIcon from "@mui/icons-material/LogoutOutlined";
import { getInfoUser, logout } from "../services/authService";
import { API_ORIGIN } from "../services/api";
import heroImage from "../assets/hero.png";

const menuItems = [
  { label: "Home", icon: <HomeOutlinedIcon fontSize="small" />, active: true },
  {
    label: "My Drive",
    icon: <FolderOpenOutlinedIcon fontSize="small" />,
    active: false,
  },
  {
    label: "Shared with me",
    icon: <GroupOutlinedIcon fontSize="small" />,
    active: false,
  },
  {
    label: "Recent",
    icon: <HistoryOutlinedIcon fontSize="small" />,
    active: false,
  },
  {
    label: "Trash",
    icon: <DeleteOutlineOutlinedIcon fontSize="small" />,
    active: false,
  },
];

const folderSuggestions = ["DoAn", "Phong Van", "Java spring Rest", "PPT"];

const fileSuggestions = [
  { name: "vocab.txt", time: "Opened 20 minutes ago" },
  { name: "train.jsonl", time: "Edited yesterday" },
  { name: "optimizer.pt", time: "Opened 2 days ago" },
  { name: "model.safetensors", time: "Edited 3 days ago" },
  { name: "planning-notes.md", time: "Opened 5 days ago" },
  { name: "slides-final.pptx", time: "Edited last week" },
];

const resolveThumbnailUrl = (thumbnailUrl) => {
  if (!thumbnailUrl) {
    return "";
  }

  if (thumbnailUrl.startsWith("http://") || thumbnailUrl.startsWith("https://")) {
    return thumbnailUrl;
  }

  if (thumbnailUrl.startsWith("/")) {
    return `${API_ORIGIN}${thumbnailUrl}`;
  }

  return `${API_ORIGIN}/${thumbnailUrl}`;
};

const Home = () => {
  const navigate = useNavigate();
  const [avatarUrl, setAvatarUrl] = useState("");
  const [avatarLabel, setAvatarLabel] = useState("U");
  const [avatarMenuAnchor, setAvatarMenuAnchor] = useState(null);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  useEffect(() => {
    let isMounted = true;

    const loadUserInfo = async () => {
      try {
        const user = await getInfoUser();
        if (!isMounted) {
          return;
        }

        setAvatarUrl(resolveThumbnailUrl(user?.thumbnailUrl));
        const nextLabel = user?.username?.trim()?.charAt(0)?.toUpperCase() || "U";
        setAvatarLabel(nextLabel);
      } catch (error) {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        navigate("/login", { replace: true });
      }
    };

    loadUserInfo();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleOpenAvatarMenu = (event) => {
    setAvatarMenuAnchor(event.currentTarget);
  };

  const handleCloseAvatarMenu = () => {
    setAvatarMenuAnchor(null);
  };

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);
    handleCloseAvatarMenu();

    const accessToken = localStorage.getItem("accessToken") || "";
    const refreshToken = localStorage.getItem("refreshToken") || "";

    try {
      await logout({ accessToken, refreshToken });
    } catch (error) {
      // Keep client state consistent even if API call fails.
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      setIsLoggingOut(false);
      navigate("/login", { replace: true });
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background:
          "radial-gradient(circle at 0% 0%, #e4f0ff 0%, #eef5ff 26%, #f7f9fc 62%, #f9fafb 100%)",
        p: { xs: 1.5, md: 2.5 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          borderRadius: 4,
          border: "1px solid #e3e8ef",
          backgroundColor: "#ffffffd9",
          backdropFilter: "blur(10px)",
          overflow: "hidden",
          minHeight: "calc(100vh - 20px)",
        }}
      >
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
            minHeight: "calc(100vh - 20px)",
          }}
        >
          <Box
            component="aside"
            sx={{
              borderRight: { md: "1px solid #eef2f7" },
              borderBottom: { xs: "1px solid #eef2f7", md: "none" },
              p: 2,
              display: "flex",
              flexDirection: "column",
              gap: 2,
            }}
          >
            <Stack direction="row" alignItems="center" spacing={1.2} sx={{ px: 1 }}>
              <Box
                component="img"
                src="/imagehethong.png"
                alt="imagehethong"
                onError={(event) => {
                  event.currentTarget.onerror = null;
                  event.currentTarget.src = heroImage;
                }}
                sx={{
                  width: 40,
                  height: 40,
                  borderRadius: 2,
                  objectFit: "cover",
                  border: "1px solid #dbe5f2",
                }}
              />
              <Typography fontWeight={700} color="#0f2747" letterSpacing={0.2}>
                 MK Driver
              </Typography>
            </Stack>

            <Button
              variant="contained"
              startIcon={<AddIcon />}
              sx={{
                alignSelf: "flex-start",
                borderRadius: 99,
                px: 2.4,
                textTransform: "none",
                fontWeight: 700,
                bgcolor: "#1f6feb",
                boxShadow: "0 10px 20px rgba(31,111,235,0.22)",
                "&:hover": { bgcolor: "#195fca" },
              }}
            >
              New
            </Button>

            <Stack spacing={0.5}>
              {menuItems.map((item) => (
                <Button
                  key={item.label}
                  startIcon={item.icon}
                  fullWidth
                  sx={{
                    justifyContent: "flex-start",
                    borderRadius: 2,
                    py: 1,
                    px: 1.4,
                    textTransform: "none",
                    color: item.active ? "#0f2747" : "#4e5d6f",
                    backgroundColor: item.active ? "#e9f2ff" : "transparent",
                    fontWeight: item.active ? 700 : 500,
                    "&:hover": {
                      backgroundColor: item.active ? "#e1edff" : "#f4f7fb",
                    },
                  }}
                >
                  {item.label}
                </Button>
              ))}
            </Stack>

            <Paper
              variant="outlined"
              sx={{
                mt: "auto",
                borderRadius: 3,
                p: 1.6,
                borderColor: "#e3e8ef",
                backgroundColor: "#f9fbff",
              }}
            >
              
            </Paper>
          </Box>

          <Box component="main" sx={{ p: { xs: 1.6, md: 2.5 } }}>
            <Stack
              direction="row"
              spacing={1}
              alignItems="center"
              sx={{
                mb: 2.5,
                flexWrap: "wrap",
                rowGap: 1,
              }}
            >
              <TextField
                placeholder="Search in Drive"
                size="small"
                fullWidth
                sx={{
                  flex: 1,
                  minWidth: { xs: "100%", md: 280 },
                  "& .MuiOutlinedInput-root": {
                    borderRadius: 99,
                    backgroundColor: "#f6f9ff",
                    "& fieldset": { borderColor: "#e1e8f2" },
                    "&:hover fieldset": { borderColor: "#ced9ea" },
                    "&.Mui-focused fieldset": { borderColor: "#1f6feb" },
                  },
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon sx={{ color: "#6b7a90" }} />
                    </InputAdornment>
                  ),
                }}
              />

              <Stack direction="row" spacing={0.4} sx={{ ml: { md: "auto" } }}>
                <IconButton
                  size="small"
                  onClick={handleOpenAvatarMenu}
                  disabled={isLoggingOut}
                  sx={{ p: 0.2 }}
                >
                  <Avatar
                    src={avatarUrl || undefined}
                    onError={() => setAvatarUrl("")}
                    sx={{ width: 34, height: 34, bgcolor: "#1f6feb", fontSize: 14 }}
                  >
                    {avatarLabel}
                  </Avatar>
                </IconButton>
                <Menu
                  anchorEl={avatarMenuAnchor}
                  open={Boolean(avatarMenuAnchor)}
                  onClose={handleCloseAvatarMenu}
                  anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
                  transformOrigin={{ vertical: "top", horizontal: "right" }}
                >
                  <MenuItem onClick={handleLogout} disabled={isLoggingOut}>
                    <LogoutOutlinedIcon fontSize="small" sx={{ mr: 1 }} />
                    {isLoggingOut ? "Đang đăng xuất..." : "Đăng xuất"}
                  </MenuItem>
                </Menu>
              </Stack>
            </Stack>

            <Typography variant="h5" fontWeight={800} color="#0f2747" sx={{ mb: 2 }}>
              Welcome to Drive
            </Typography>

            <Box sx={{ mb: 3 }}>
              <Stack
                direction="row"
                alignItems="center"
                justifyContent="space-between"
                sx={{ mb: 1.2 }}
              >
                <Typography variant="h6" fontSize={18} fontWeight={700} color="#1e293b">
                  Suggested folders
                </Typography>
                <Chip label="Smart picks" size="small" sx={{ bgcolor: "#edf4ff", color: "#1f6feb" }} />
              </Stack>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, minmax(0, 1fr))",
                    sm: "repeat(2, minmax(0, 1fr))",
                    lg: "repeat(4, minmax(0, 1fr))",
                  },
                  gap: 1.2,
                }}
              >
                {folderSuggestions.map((folder) => (
                  <Paper
                    key={folder}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      borderColor: "#e3e8ef",
                      p: 1.2,
                      display: "flex",
                      alignItems: "center",
                      gap: 1,
                      cursor: "pointer",
                      transition: "all 180ms ease",
                      "&:hover": {
                        transform: "translateY(-2px)",
                        boxShadow: "0 10px 24px rgba(16,24,40,0.08)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: 2,
                        bgcolor: "#e7f0ff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <FolderOpenOutlinedIcon sx={{ color: "#1f6feb", fontSize: 20 }} />
                    </Box>
                    <Typography fontWeight={600} color="#334155">
                      {folder}
                    </Typography>
                  </Paper>
                ))}
              </Box>
            </Box>

            <Box>
              <Typography variant="h6" fontSize={18} fontWeight={700} color="#1e293b" sx={{ mb: 1.2 }}>
                Suggested files
              </Typography>

              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: {
                    xs: "repeat(1, minmax(0, 1fr))",
                    sm: "repeat(2, minmax(0, 1fr))",
                    xl: "repeat(3, minmax(0, 1fr))",
                  },
                  gap: 1.2,
                }}
              >
                {fileSuggestions.map((file) => (
                  <Paper
                    key={file.name}
                    variant="outlined"
                    sx={{
                      borderRadius: 3,
                      borderColor: "#e3e8ef",
                      p: 1.2,
                      cursor: "pointer",
                      transition: "all 200ms ease",
                      "&:hover": {
                        borderColor: "#c8d6eb",
                        boxShadow: "0 10px 24px rgba(16,24,40,0.08)",
                        transform: "translateY(-2px)",
                      },
                    }}
                  >
                    <Box
                      sx={{
                        borderRadius: 2.2,
                        height: 90,
                        mb: 1,
                        background:
                          "linear-gradient(135deg, rgba(31,111,235,0.16) 0%, rgba(100,149,237,0.08) 52%, rgba(225,236,255,0.32) 100%)",
                        border: "1px solid #e2eaf6",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      <InsertDriveFileOutlinedIcon sx={{ color: "#1f6feb", fontSize: 30 }} />
                    </Box>

                    <Typography fontWeight={700} color="#1e293b" noWrap>
                      {file.name}
                    </Typography>
                    <Stack direction="row" spacing={0.7} alignItems="center" sx={{ mt: 0.4 }}>
                      <AccessTimeOutlinedIcon sx={{ color: "#64748b", fontSize: 16 }} />
                      <Typography variant="body2" color="#64748b" noWrap>
                        {file.time}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Box>
            </Box>
          </Box>
        </Box>
      </Paper>
    </Box>
  );
};

export default Home;
