import React, { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import AppRouter from './routes/AppRouter';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './config/theme';
import { pingUser } from './services/userService';

const App = () => {
  useEffect(() => {
    // Ping mỗi 2 phút (120000 ms)
    const interval = setInterval(() => {
      if (localStorage.getItem("accessToken")) {
        pingUser();
      }
    }, 120000);

    // Ping lần đầu tiên nếu đã đăng nhập
    if (localStorage.getItem("accessToken")) {
      pingUser();
    }

    return () => clearInterval(interval);
  }, []);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AppRouter />
      </BrowserRouter>
    </ThemeProvider>
  );
};

export default App;
