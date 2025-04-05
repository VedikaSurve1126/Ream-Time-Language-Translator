// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import ProtectedRoute from './components/ProtectedRoute';

//importing my components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login'
import SignUp from './pages/SignUp';
import TextInput from './components/TextInput';
import AudioInput from './components/AudioInput';
import Profile from './pages/Profile';
import History from './pages/History';
import Languages from './pages/Languages';
import { AuthProvider } from './context/AuthContext';


function App() {
  return (
    <AuthProvider>
      <Router>
      <CssBaseline />
      <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', width: '100%' }}>
        <Navbar />
        <Box sx={{ flex: 1, width: '100%' }}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/text-input" element={<TextInputWithNavigate mode="realtime" />} />
            <Route path="/audio-input" element={<AudioInputWithNavigate mode="realtime" />} />
            <Route path="/Login" element={<Login />} />
            <Route path='/SignUp' element={<SignUp />}/>
            <Route path="/languages" element={<Languages />} />

            {/* Protected routes */}
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          <Route path="/history" element={
            <ProtectedRoute>
              <History />
            </ProtectedRoute>
          } />
          </Routes>
        </Box>
      </Box>
    </Router>
    </AuthProvider>
  );
}

// Wrapper components to inject navigate
function TextInputWithNavigate(props) {
  const navigate = useNavigate();
  return <TextInput {...props} onBack={() => { console.log('Navigating back to Home'); navigate('/'); }} />;
}

function AudioInputWithNavigate(props) {
  const navigate = useNavigate();
  return <AudioInput {...props} onBack={() => { console.log('Navigating back to Home'); navigate('/'); }} />;
}

export default App;