// src/pages/Home.jsx
import React from 'react';
import { Box, Typography, Button, Container, Paper, IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import KeyboardVoiceIcon from '@mui/icons-material/KeyboardVoice';
import KeyboardIcon from '@mui/icons-material/Keyboard';

const Home = () => {
  const navigate = useNavigate();

  return (
    <Box 
      sx={{
        width: '100%',
        height: '100vh',
        backgroundImage: 'url("https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2070&q=80")',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        position: 'relative',
        overflow: 'hidden',
        pt: 2,
      }}
    >
      {/* Overlay gradient */}
      <Box 
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.65)',
          zIndex: 1
        }}
      />
      
      {/* Content */}
      <Container maxWidth="lg" sx={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
        <Box sx={{ textAlign: 'center', mb: 6 }}>
          <Typography 
            variant="h2" 
            component="h1" 
            sx={{ 
              fontWeight: 'bold', 
              mb: 1,
              fontSize: { xs: '2.5rem', md: '3.5rem' },
              fontFamily: '"Georgia", serif',
              color: '#333'
            }}
          >
            Choose your <KeyboardVoiceIcon sx={{ fontSize: 40, mx: 1, transform: 'translateY(5px)' }} /> input method
          </Typography>
          <Typography 
            variant="h4" 
            sx={{ 
              color: '#666', 
              fontWeight: 300,
              fontSize: { xs: '1.5rem', md: '2rem' },
              fontFamily: '"Georgia", serif'
            }}
          >
            Communicate smarter
          </Typography>
        </Box>

        <Box sx={{ 
          maxWidth: 600, 
          mx: 'auto', 
          width: '100%', 
          borderRadius: 2,
          p: 2
        }}>
          <Paper 
            elevation={3} 
            sx={{ 
              borderRadius: 2, 
              overflow: 'hidden',
              backgroundColor: 'rgba(255, 255, 255, 0.9)'
            }}
          >
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              alignItems: 'center',
              justifyContent: 'space-between', 
              p: 3,
              gap: 2
            }}>
              <Button 
                variant="contained" 
                size="large"
                fullWidth
                startIcon={<KeyboardIcon />}
                onClick={() => navigate('/text-input')}
                sx={{ 
                  py: 1.5,
                  backgroundColor: '#1976d2',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }}
              >
                TEXT INPUT
              </Button>

              <Button 
                variant="contained" 
                size="large"
                fullWidth
                startIcon={<KeyboardVoiceIcon />}
                onClick={() => navigate('/audio-input')}
                sx={{ 
                  py: 1.5,
                  backgroundColor: '#1976d2',
                  fontSize: '1rem',
                  fontWeight: 'bold',
                  '&:hover': {
                    backgroundColor: '#1565c0',
                  }
                }}
              >
                AUDIO INPUT
              </Button>
            </Box>
          </Paper>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;