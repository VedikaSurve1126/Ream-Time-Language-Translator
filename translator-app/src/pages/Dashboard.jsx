import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Container, Typography, Paper, Box, Grid, Card, CardContent, Button, CircularProgress, Alert } from '@mui/material';
import TranslateIcon from '@mui/icons-material/Translate';
import HistoryIcon from '@mui/icons-material/History';
import PersonIcon from '@mui/icons-material/Person';

const Dashboard = () => {
  const { user, token, logout } = useAuth();
  const [translations, setTranslations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    const fetchUserTranslations = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/translations', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (!response.ok) {
          throw new Error('Failed to fetch translations');
        }
        
        const data = await response.json();
        setTranslations(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    
    fetchUserTranslations();
  }, [token]);
  
  if (!user) {
    return (
      <Container>
        <Alert severity="error">User not authenticated</Alert>
      </Container>
    );
  }
  
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Welcome, {user.username}!
      </Typography>
      
      <Grid container spacing={3}>
        {/* User Profile Card */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <PersonIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Your Profile</Typography>
              </Box>
              <Box sx={{ pl: 2 }}>
                <Typography variant="body1">
                  <strong>Username:</strong> {user.username}
                </Typography>
                <Typography variant="body1">
                  <strong>Email:</strong> {user.email}
                </Typography>
                <Typography variant="body1">
                  <strong>Input Language:</strong> {user.preferred_input_lang}
                </Typography>
                <Typography variant="body1">
                  <strong>Output Language:</strong> {user.preferred_output_lang}
                </Typography>
              </Box>
              <Button 
                variant="outlined" 
                color="primary" 
                sx={{ mt: 2 }}
                onClick={() => { /* Navigate to profile edit page */ }}
              >
                Edit Profile
              </Button>
              <Button 
                variant="outlined" 
                color="error" 
                sx={{ mt: 2, ml: 2 }}
                onClick={logout}
              >
                Logout
              </Button>
            </CardContent>
          </Card>
        </Grid>
        
        {/* Translation Stats */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <TranslateIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Translation Dashboard</Typography>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : (
                <Box>
                  <Typography variant="body1">
                    <strong>Total Translations:</strong> {translations.length}
                  </Typography>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    sx={{ mt: 2 }}
                    onClick={() => { /* Navigate to translator */ }}
                  >
                    New Translation
                  </Button>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
        
        {/* Recent Translations */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <HistoryIcon sx={{ fontSize: 40, mr: 2 }} />
                <Typography variant="h6">Recent Translations</Typography>
              </Box>
              
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error">{error}</Alert>
              ) : translations.length === 0 ? (
                <Typography>No translations yet.</Typography>
              ) : (
                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                  <Grid container spacing={2}>
                    {translations.slice(0, 5).map((translation, index) => (
                      <Grid item xs={12} key={index}>
                        <Paper sx={{ p: 2 }}>
                          <Typography variant="body2" color="textSecondary">
                            {new Date(translation.timestamp).toLocaleString()}
                          </Typography>
                          <Typography variant="body1">
                            <strong>{translation.source_lang}:</strong> {translation.input_text}
                          </Typography>
                          <Typography variant="body1">
                            <strong>{translation.target_lang}:</strong> {translation.translated_text}
                          </Typography>
                        </Paper>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Container>
  );
};

export default Dashboard;