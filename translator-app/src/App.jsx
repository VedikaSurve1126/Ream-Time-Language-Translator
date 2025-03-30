// src/App.jsx
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Box, CssBaseline } from '@mui/material';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login'
import SignUp from './pages/SignUp';
import TextInput from './components/TextInput';
import AudioInput from './components/AudioInput';

function App() {
  return (
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
          </Routes>
        </Box>
      </Box>
    </Router>
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