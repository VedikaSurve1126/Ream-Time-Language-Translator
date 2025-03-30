import { useState } from 'react';
import { ReactMic } from 'react-mic';
import { Button, Typography, Select, MenuItem, Box } from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

function AudioInput({ mode, onBack }) {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState('path/to/mock-output-audio.mp3'); // Mock translated audio
  const [translated, setTranslated] = useState('');
  const [inputLang, setInputLang] = useState('auto');
  const [outputLang, setOutputLang] = useState('en');
  const [isTranslating, setIsTranslating] = useState(false); // Added for translation status

  const onStop = (recordedBlob) => {
    setAudioBlob(recordedBlob.blobURL);
    // Don't set translated text or URL here; wait for the Translate button
  };

  const handleTranslate = async () => {
    if (!audioBlob) {
      alert('Please record audio first.');
      return;
    }

    setIsTranslating(true);
    try {
      // Mock translation process (to be replaced with real implementation)
      // In a real implementation, this would:
      // 1. Convert audio to text (speech-to-text)
      // 2. Translate the text using the NLLB-200 model
      // 3. Convert the translated text back to audio (text-to-speech)
      setTimeout(() => {
        setTranslated('Translated audio text');
        setTranslatedAudioUrl('path/to/mock-translated-audio.mp3');
        setIsTranslating(false);
      }, 2000); // Simulate a 2-second translation process
    } catch (error) {
      console.error('Audio translation failed:', error);
      setIsTranslating(false);
    }
  };

  const handleClear = () => {
    setIsRecording(false);
    setAudioBlob(null);
    setTranslatedAudioUrl('path/to/mock-output-audio.mp3'); // Reset to default
    setTranslated('');
  };

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: 'calc(100vh - 64px)', // Adjust if navbar height differs
        width: '100vw',
        padding: 2,
        boxSizing: 'border-box',
      }}
    >
      <Box sx={{ maxWidth: '800px', width: '100%', textAlign: 'center' }}>
        <Typography variant="h5" sx={{ mb: 3 }}>Audio Translator</Typography>
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, mb: 3 }}>
          <Select value={inputLang} onChange={(e) => setInputLang(e.target.value)} sx={{ flex: 1, minWidth: '150px' }}>
            <MenuItem value="auto">Auto-Detect</MenuItem>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
          </Select>
          <Select value={outputLang} onChange={(e) => setOutputLang(e.target.value)} sx={{ flex: 1, minWidth: '150px' }}>
            <MenuItem value="en">English</MenuItem>
            <MenuItem value="es">Spanish</MenuItem>
          </Select>
        </Box>
        <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: '50%', overflow: 'hidden' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Audio Input</Typography>
            <Box sx={{ width: '100%', height: '100px', overflow: 'hidden' }}>
              <ReactMic
                record={isRecording}
                onStop={onStop}
                strokeColor="#000000"
                backgroundColor="#FF4081"
                sx={{ width: '100%', height: '100%' }}
              />
            </Box>
            <Button
              variant="contained"
              startIcon={isRecording ? <StopIcon /> : <MicIcon />}
              onClick={() => setIsRecording(!isRecording)}
              sx={{ m: 1, mt: 2, display: 'block', margin: '0 auto', width: '150px' }}
            >
              {isRecording ? 'Stop' : 'Record'}
            </Button>
          </Box>
          <Box sx={{ flex: 1, minWidth: 0, maxWidth: '50%' }}>
            <Typography variant="h6" sx={{ mb: 1 }}>Audio Output</Typography>
            <Box sx={{ width: '100%', height: '100px', backgroundColor: '#FF4081', mb: 2, overflow: 'hidden' }}>
              {/* Placeholder pink pitch box for translated output */}
              <div style={{ width: '100%', height: '100%', position: 'relative' }}>
                <div
                  style={{
                    position: 'absolute',
                    top: '50%',
                    left: '0',
                    width: '100%',
                    height: '2px',
                    backgroundColor: '#000000',
                    transform: 'translateY(-50%)',
                  }}
                />
              </div>
            </Box>
            <Button
              variant="contained"
              startIcon={<PlayArrowIcon />}
              onClick={() => { /* Add play logic here */ }}
              sx={{ m: 1, display: 'block', margin: '0 auto', width: '150px' }}
            >
              Play
            </Button>
            <Typography sx={{ mt: 1 }}>{translated}</Typography>
          </Box>
        </Box>
        {audioBlob && (
          <Box sx={{ mb: 3 }}>
            <Typography variant="body1" sx={{ mb: 1 }}>Recorded Audio Playback</Typography>
            <Button variant="outlined" startIcon={<PlayArrowIcon />} sx={{ m: 1, display: 'block', margin: '0 auto', width: '150px' }}>
              <audio controls src={audioBlob} />
            </Button>
          </Box>
        )}
        <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
          <Button variant="outlined" onClick={onBack}>Back</Button>
          <Button
            variant="outlined"
            color="primary"
            onClick={handleTranslate}
            disabled={isTranslating || !audioBlob}
          >
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
          <Button variant="outlined" color="warning" onClick={handleClear}>Clear</Button>
        </Box>
        {mode === 'realtime' && <Typography sx={{ mt: 2 }}>Real-time mode placeholder</Typography>}
      </Box>
    </Box>
  );
}

export default AudioInput;