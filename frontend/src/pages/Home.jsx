import React from 'react';
import { Typography, Container, Box } from '@mui/material';

const Home = () => {
  return (
    <Container maxWidth="sm">
      <Box sx={{ my: 4, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom color="primary">
          trang chủ
        </Typography>
      </Box>
    </Container>
  );
};

export default Home;
