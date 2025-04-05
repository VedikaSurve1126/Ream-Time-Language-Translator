import { useState, useRef, useEffect } from 'react';
import { AudioRecorder, useAudioRecorder } from 'react-audio-voice-recorder';
import { 
  Button, 
  Typography, 
  Select, 
  MenuItem, 
  Box, 
  CircularProgress, 
  Alert, 
  Snackbar,
  IconButton,
  Tooltip,
  Paper,
  Divider,
  LinearProgress
} from '@mui/material';
import MicIcon from '@mui/icons-material/Mic';
import StopIcon from '@mui/icons-material/Stop';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TranslateIcon from '@mui/icons-material/Translate';
import DeleteIcon from '@mui/icons-material/Delete';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import SettingsVoiceIcon from '@mui/icons-material/SettingsVoice';
import AutorenewIcon from '@mui/icons-material/Autorenew';

const LANGUAGE_MAP = {
  'en': 'eng_Latn',
  'es': 'spa_Latn',
  'fr': 'fra_Latn',
  'de': 'deu_Latn',
  'it': 'ita_Latn',
  'pt': 'por_Latn',
  'zh': 'zho_Hans',
  'ja': 'jpn_Jpan',
  'ru': 'rus_Cyrl',
  'ar': 'ara_Arab',
  'hi': 'hin_Deva',
  'auto': 'auto'
};

const LANGUAGE_OPTIONS = [
  { value: 'auto', label: 'Auto-Detect' },
  { value: 'en', label: 'English' },
  { value: 'es', label: 'Spanish' },
  { value: 'fr', label: 'French' },
  { value: 'de', label: 'German' },
  { value: 'it', label: 'Italian' },
  { value: 'pt', label: 'Portuguese' },
  { value: 'zh', label: 'Chinese' },
  { value: 'ja', label: 'Japanese' },
  { value: 'ru', label: 'Russian' },
  { value: 'ar', label: 'Arabic' },
  { value: 'hi', label: 'Hindi' }
];

const API_BASE_URL = 'http://localhost:5000';

function AudioInput({ mode, onBack }) {
  // Use the hook from react-audio-voice-recorder instead of managing recording state manually
  const audioRecorder = useAudioRecorder();
  
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioFile, setAudioFile] = useState(null);
  const [translatedAudioUrl, setTranslatedAudioUrl] = useState(null);
  const [translatedText, setTranslatedText] = useState('');
  const [originalText, setOriginalText] = useState('');
  const [detectedLanguage, setDetectedLanguage] = useState('');
  const [audioURL, setAudioURL] = useState('');
  
  // Load previously saved preferences or use defaults
  const getSavedPref = (key, defaultValue) => {
    const savedValue = localStorage.getItem(key);
    return (savedValue && LANGUAGE_MAP[savedValue]) ? savedValue : defaultValue;
  };
  
  const [inputLang, setInputLang] = useState(() => getSavedPref('preferredInputLang', 'auto'));
  const [outputLang, setOutputLang] = useState(() => getSavedPref('preferredOutputLang', 'en'));
  
  const [isTranslating, setIsTranslating] = useState(false);
  const [error, setError] = useState(null);
  const [showError, setShowError] = useState(false);
  const [isAutoTranslate, setIsAutoTranslate] = useState(mode === 'realtime');
  const [isAutoPlay, setIsAutoPlay] = useState(mode === 'realtime');
  const [translationProgress, setTranslationProgress] = useState(0);
  const [progressStage, setProgressStage] = useState('');
  
  const audioRef = useRef(null);
  const translatedAudioRef = useRef(null);
  const fileInputRef = useRef(null);
  const visualizerCanvasRef = useRef(null);
  const animationFrameRef = useRef(null);
  
  // Debug current language settings
  useEffect(() => {
    console.log(`Language settings updated - Input: ${inputLang} (${LANGUAGE_MAP[inputLang]}), Output: ${outputLang} (${LANGUAGE_MAP[outputLang]})`);
  }, [inputLang, outputLang]);
  
  // Save preferences when they change
  useEffect(() => {
    localStorage.setItem('preferredInputLang', inputLang);
  }, [inputLang]);
  
  useEffect(() => {
    localStorage.setItem('preferredOutputLang', outputLang);
  }, [outputLang]);

  // Cleanup audio URLs on unmount
  useEffect(() => {
    return () => {
      if (audioURL) URL.revokeObjectURL(audioURL);
      if (translatedAudioUrl && !translatedAudioUrl.startsWith('http')) {
        URL.revokeObjectURL(translatedAudioUrl);
      }
      
      // Cancel any ongoing animation frame
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    };
  }, [audioURL, translatedAudioUrl]);

  // Monitor recording state from the recorder hook
  useEffect(() => {
    setIsRecording(audioRecorder.isRecording);
    
    // When recording stops and we have audio data
    if (!audioRecorder.isRecording && audioRecorder.recordingBlob) {
      onRecordingComplete(audioRecorder.recordingBlob);
    }
  }, [audioRecorder.isRecording, audioRecorder.recordingBlob]);

  // Handle audio playback when URL updates
  useEffect(() => {
    if (translatedAudioUrl && translatedAudioRef.current) {
      console.log('Setting audio src:', translatedAudioUrl);
      translatedAudioRef.current.src = translatedAudioUrl;
      if (isAutoPlay) {
        translatedAudioRef.current.muted = true; // Mute to bypass browser restrictions
        translatedAudioRef.current.play()
          .then(() => {
            translatedAudioRef.current.muted = false; // Unmute after starting
            console.log('Auto-play started');
          })
          .catch(err => {
            console.error('Auto-play failed:', err);
            setError(`Playback failed: ${err.message}`);
            setShowError(true);
          });
      }
    }
  }, [translatedAudioUrl, isAutoPlay]);
  
  // Initialize canvas for visualization
  // Then, replace your visualization effect:
useEffect(() => {
  // Initialize canvas context
  if (visualizerCanvasRef.current) {
    const ctx = visualizerCanvasRef.current.getContext('2d');
    
    // Clear previous content
    ctx.clearRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
    
    // Draw default state or animation based on recording status
    if (isRecording) {
      // Start visualization animation
      const animate = () => {
        if (!visualizerCanvasRef.current) return;
        
        ctx.clearRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
        ctx.fillStyle = '#f5f5f5';
        ctx.fillRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
        
        const now = Date.now() / 1000;
        const waveCount = 5;
        
        ctx.strokeStyle = '#d32f2f';
        ctx.lineWidth = 2;
        ctx.beginPath();
        
        for (let x = 0; x < visualizerCanvasRef.current.width; x++) {
          const amplitude = 20 + 10 * Math.sin(now * 2);
          const y = visualizerCanvasRef.current.height/2 + 
                    amplitude * Math.sin(x / visualizerCanvasRef.current.width * Math.PI * waveCount + now * 5);
          
          if (x === 0) {
            ctx.moveTo(x, y);
          } else {
            ctx.lineTo(x, y);
          }
        }
        
        ctx.stroke();
        
        // Draw a recording indicator
        ctx.fillStyle = '#d32f2f';
        ctx.beginPath();
        ctx.arc(20, 20, 8, 0, Math.PI * 2);
        ctx.fill();
        
        // Add "Recording" text
        ctx.fillStyle = '#333';
        ctx.font = '12px Arial';
        ctx.fillText('Recording...', 35, 24);
        
        if (isRecording) {
          animationFrameRef.current = requestAnimationFrame(animate);
        }
      };
      
      // Start animation
      animationFrameRef.current = requestAnimationFrame(animate);
    } else {
      // Draw default state when not recording
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
      
      // Cancel any ongoing animation
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
    }
  }
  
  // Cleanup function
  return () => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
      animationFrameRef.current = null;
    }
  };
}, [isRecording]);


  const onRecordingComplete = (blob) => {
    console.log('Recording completed:', blob);
    const url = URL.createObjectURL(blob);
    setAudioURL(url);
    setAudioBlob(url);
    
    const audioFile = new File([blob], 'recording.webm', { type: 'audio/webm' });
    setAudioFile(audioFile);
    
    if (isAutoTranslate) {
      setTimeout(() => handleTranslate(audioFile), 50);
    }
  };

  const toggleRecording = () => {
    if (isRecording) {
      // Cancel animation frame before stopping recording
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      audioRecorder.stopRecording();
    } else {
      audioRecorder.startRecording();
    }
  };

  const handleTranslate = async (file = null) => {
    const audioToTranslate = file || audioFile;
    
    if (!audioToTranslate) {
      setError('Please record or upload audio first.');
      setShowError(true);
      return;
    }

    setIsTranslating(true);
    setError(null);
    setProgressStage('Transcribing audio...');
    setTranslationProgress(20);
    
    try {
      const formData = new FormData();
      formData.append('audio', audioToTranslate);
      
      // Get the current language settings from state
      const currentInputLang = inputLang;
      const currentOutputLang = outputLang;
      
      const sourceLangCode = LANGUAGE_MAP[currentInputLang];
      const targetLangCode = LANGUAGE_MAP[currentOutputLang];
      
      console.log(`Converting from ${currentInputLang} (${sourceLangCode}) to ${currentOutputLang} (${targetLangCode})`);
      
      formData.append('sourceLang', sourceLangCode);
      formData.append('targetLang', targetLangCode);

      setProgressStage('Processing...');
      setTranslationProgress(40);
      
      console.log('Form data prepared for submission:', {
        sourceLang: sourceLangCode,
        targetLang: targetLangCode,
        audioType: audioToTranslate.type
      });
      
      const response = await fetch(`${API_BASE_URL}/api/audio-to-audio`, {
        method: 'POST',
        body: formData,
      });
      
      setProgressStage('Generating translated audio...');
      setTranslationProgress(70);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Server error (${response.status}): ${errorText || 'Unknown error'}`);
      }

      const data = await response.json();
      if (data.error) {
        throw new Error(`${data.error}: ${data.details || 'No details'}`);
      }

      console.log('Translation API response:', {
        receivedTextLength: data.translatedText?.length || 0,
        receivedOriginalLength: data.originalText?.length || 0,
        audioUrlProvided: !!data.audioUrl,
        detectedLang: data.detectedLang || 'none'
      });

      setTranslatedText(data.translatedText || '[No text returned]');
      
      if (data.originalText) {
        setOriginalText(data.originalText);
      }
      
      const audioUrl = data.audioUrl.startsWith('http') 
        ? data.audioUrl 
        : `${API_BASE_URL}${data.audioUrl}`;
      setTranslatedAudioUrl(audioUrl);

      setProgressStage('Completing...');
      setTranslationProgress(90);

      // Verify the audio URL
      try {
        const urlCheck = await fetch(audioUrl, { method: 'HEAD', mode: 'cors' });
        console.log('Audio URL check:', {
          ok: urlCheck.ok,
          status: urlCheck.status,
          contentType: urlCheck.headers.get('content-type')
        });
        if (!urlCheck.ok) {
          throw new Error(`Audio URL inaccessible: Status ${urlCheck.status}`);
        }
        if (!urlCheck.headers.get('content-type')?.includes('audio/')) {
          throw new Error('URL doesn\'t point to audio');
        }
      } catch (urlError) {
        console.error('URL verification failed:', urlError);
        setError(`Audio unavailable: ${urlError.message}`);
        setShowError(true);
      }

      if (currentInputLang === 'auto' && data.detectedLang) {
        setDetectedLanguage(data.detectedLang);
      }
      
      setProgressStage('Done');
      setTranslationProgress(100);
    } catch (error) {
      console.error('Translation failed:', error);
      setError(error.message || 'Translation failed');
      setShowError(true);
    } finally {
      setIsTranslating(false);
      // Reset progress after a brief delay to show completion
      setTimeout(() => {
        setTranslationProgress(0);
        setProgressStage('');
      }, 1000);
    }
  };

  const handleClear = () => {
    setIsRecording(false);
    if (audioRecorder.isRecording) {
      // Cancel animation frame before stopping recording
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
        animationFrameRef.current = null;
      }
      audioRecorder.stopRecording();
    }
    setAudioBlob(null);
    setAudioFile(null);
    setAudioURL('');
    setTranslatedAudioUrl(null);
    setTranslatedText('');
    setOriginalText('');
    setDetectedLanguage('');
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
    setTranslationProgress(0);
    setProgressStage('');
    
    // Reset the canvas
    if (visualizerCanvasRef.current) {
      const ctx = visualizerCanvasRef.current.getContext('2d');
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
    }
  };

  const handleCloseError = () => setShowError(false);

  const handleUploadAudio = (e) => {
    const file = e.target.files[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAudioBlob(url);
      setAudioURL(url);
      setAudioFile(file);
      if (isAutoTranslate) handleTranslate(file);
    }
  };

  const handleInputLangChange = (e) => {
    const newLang = e.target.value;
    console.log(`Changing input language to: ${newLang} (${LANGUAGE_MAP[newLang]})`);
    if (LANGUAGE_MAP[newLang]) setInputLang(newLang);
  };

  const handleOutputLangChange = (e) => {
    const newLang = e.target.value;
    console.log(`Changing output language to: ${newLang} (${LANGUAGE_MAP[newLang]})`);
    if (LANGUAGE_MAP[newLang]) {
      setOutputLang(newLang);
      // Force a UI update by clearing any existing translation
      if (translatedText || translatedAudioUrl) {
        setTranslatedText('');
        setTranslatedAudioUrl(null);
      }
    }
  };

  // Helper to find language label
  const getLanguageLabel = (langCode) => {
    const option = LANGUAGE_OPTIONS.find(opt => LANGUAGE_MAP[opt.value] === langCode);
    return option ? option.label : langCode;
  };

  // Create a simple audio visualizer using Canvas API
  const createAudioVisualizer = () => {
    if (!visualizerCanvasRef.current) return;
    
    const ctx = visualizerCanvasRef.current.getContext('2d');
    ctx.clearRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
    
    if (!isRecording) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
      return;
    }
    
    // Draw a simple animation to indicate recording
    ctx.fillStyle = '#f5f5f5';
    ctx.fillRect(0, 0, visualizerCanvasRef.current.width, visualizerCanvasRef.current.height);
    
    const now = Date.now() / 1000;
    const waveCount = 5;
    
    ctx.strokeStyle = '#d32f2f'; // Use a more noticeable red color for recording
    ctx.lineWidth = 2;
    ctx.beginPath();
    
    for (let x = 0; x < visualizerCanvasRef.current.width; x++) {
      const amplitude = 20 + 10 * Math.sin(now * 2); // Vary the amplitude
      const y = visualizerCanvasRef.current.height/2 + 
                amplitude * Math.sin(x / visualizerCanvasRef.current.width * Math.PI * waveCount + now * 5);
      
      if (x === 0) {
        ctx.moveTo(x, y);
      } else {
        ctx.lineTo(x, y);
      }
    }
    
    ctx.stroke();
    
    // Draw a recording indicator
    ctx.fillStyle = '#d32f2f';
    ctx.beginPath();
    ctx.arc(20, 20, 8, 0, Math.PI * 2);
    ctx.fill();
    
    // Add "Recording" text
    ctx.fillStyle = '#333';
    ctx.font = '12px Arial';
    ctx.fillText('Recording...', 35, 24);
    
    if (isRecording) {
      animationFrameRef.current = requestAnimationFrame(createAudioVisualizer);
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'flex-start', minHeight: 'calc(100vh - 64px)', width: '100%', padding: 2 }}>
      <Paper elevation={3} sx={{ maxWidth: '900px', width: '100%', padding: 3, borderRadius: 2 }}>
        <Typography variant="h5" sx={{ mb: 3, textAlign: 'center' }}>
          {mode === 'realtime' ? 'Real-time Audio Translator' : 'Audio Translator'}
          <Typography variant="caption" component="div" sx={{ mt: 1, color: 'text.secondary' }}>
            Powered by Whisper + TTS Pipeline
          </Typography>
        </Typography>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>From:</Typography>
            <Select value={inputLang} onChange={handleInputLangChange} size="small" sx={{ minWidth: 130 }} disabled={isRecording || isTranslating}>
              {LANGUAGE_OPTIONS.map(option => <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>)}
            </Select>
            {detectedLanguage && inputLang === 'auto' && (
              <Typography variant="caption" sx={{ ml: 1 }}>
                Detected: {getLanguageLabel(detectedLanguage)}
              </Typography>
            )}
          </Box>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Typography>To:</Typography>
            <Select 
              value={outputLang} 
              onChange={handleOutputLangChange} 
              size="small" 
              sx={{ minWidth: 130 }} 
              disabled={isRecording || isTranslating}
              MenuProps={{ style: { zIndex: 9999 } }}
            >
              {LANGUAGE_OPTIONS.filter(option => option.value !== 'auto').map(option => (
                <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
              ))}
            </Select>
          </Box>
        </Box>
        
        {/* Debug info */}
        <Box sx={{ mb: 2, p: 1, bgcolor: '#f5f5f5', borderRadius: 1, fontSize: '0.75rem' }}>
          <Typography variant="caption">Currently translating: {inputLang === 'auto' ? 'Auto-detect' : getLanguageLabel(LANGUAGE_MAP[inputLang])} → {getLanguageLabel(LANGUAGE_MAP[outputLang])}</Typography>
        </Box>
        
        <Divider sx={{ mb: 3 }} />
        
        {isTranslating && (
          <Box sx={{ width: '100%', mb: 3, textAlign: 'center' }}>
            <Typography variant="body2" sx={{ mb: 1 }}>{progressStage}</Typography>
            <LinearProgress variant="determinate" value={translationProgress} sx={{ height: 10, borderRadius: 1 }} />
          </Box>
        )}
        
        <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3, mb: 3, alignItems: 'stretch' }}>
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', borderRadius: 1, padding: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}><SettingsVoiceIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Audio Input</Typography>
            
            {/* Visualization container */}
            <Box 
              id="visualizer-container"
              sx={{ 
                width: '100%', 
                height: '120px', 
                overflow: 'hidden', 
                border: '1px solid #e0e0e0', 
                borderRadius: 1, 
                mb: 2,
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                backgroundColor: '#f5f5f5',
                position:'relative'
              }}
            >
              <canvas ref={visualizerCanvasRef} width={300} height={100} style={{width:'100%', height:'100%'}} />
              {!isRecording && !audioFile && (
                <Typography variant="body2" color="text.secondary" 
                sx={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>Click Record to start</Typography>
              )}
            </Box>
            
            <Box sx={{ display: 'flex', justifyContent: 'center', gap: 1, mb: 2 }}>
              <Button 
                variant="contained" 
                color={isRecording ? "error" : "primary"} 
                startIcon={isRecording ? <StopIcon /> : <MicIcon />} 
                onClick={toggleRecording} 
                disabled={isTranslating}
              >
                {isRecording ? 'Stop' : 'Record'}
              </Button>
              
              <Button component="label" variant="outlined" startIcon={<UploadFileIcon />} disabled={isRecording || isTranslating}>
                Upload
                <input ref={fileInputRef} type="file" accept="audio/*" hidden onChange={handleUploadAudio} />
              </Button>
            </Box>
            
            {audioBlob && <Box sx={{ mt: 'auto' }}><audio ref={audioRef} controls src={audioBlob} style={{ width: '100%' }} /></Box>}
            
            {originalText && (
              <Paper variant="outlined" sx={{ p: 2, mt: 2, maxHeight: '80px', overflow: 'auto' }}>
                <Typography variant="caption" color="text.secondary">Transcribed Text:</Typography>
                <Typography variant="body2">{originalText}</Typography>
              </Paper>
            )}
          </Box>
          
          <Box sx={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid #e0e0e0', borderRadius: 1, padding: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}><TranslateIcon sx={{ verticalAlign: 'middle', mr: 1 }} />Translated Output</Typography>
            <Box sx={{ width: '100%', height: '120px', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f5f5f5', border: '1px solid #e0e0e0', borderRadius: 1, mb: 2 }}>
              {isTranslating ? <CircularProgress size={40} /> : translatedAudioUrl ? (
                <PlayArrowIcon sx={{ fontSize: 48, color: '#1976d2', cursor: 'pointer' }} onClick={() => translatedAudioRef.current?.play()} />
              ) : <Typography variant="body2" color="text.secondary">Translated audio will appear here</Typography>}
            </Box>
            {translatedText && (
              <Paper variant="outlined" sx={{ p: 2, mb: 2, maxHeight: '80px', overflow: 'auto' }}>
                <Typography variant="caption" color="text.secondary">Translated Text:</Typography>
                <Typography variant="body2">{translatedText}</Typography>
              </Paper>
            )}
            {translatedAudioUrl && <Box sx={{ mt: 'auto' }}><audio ref={translatedAudioRef} controls src={translatedAudioUrl} style={{ width: '100%' }} /></Box>}
          </Box>
        </Box>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 3 }}>
          <Button variant="outlined" startIcon={<TranslateIcon />} onClick={() => handleTranslate()} disabled={isTranslating || !audioFile} color="primary">
            {isTranslating ? 'Translating...' : 'Translate'}
          </Button>
          <Box sx={{ display: 'flex', gap: 1 }}>
            {mode === 'realtime' && (
              <>
                <Tooltip title={isAutoTranslate ? "Disable auto-translation" : "Enable auto-translation"}>
                  <Button variant="outlined" color={isAutoTranslate ? "success" : "inherit"} onClick={() => setIsAutoTranslate(!isAutoTranslate)} startIcon={<AutorenewIcon />}>
                    Auto-Translate
                  </Button>
                </Tooltip>
                <Tooltip title={isAutoPlay ? "Disable auto-play" : "Enable auto-play"}>
                  <Button variant="outlined" color={isAutoPlay ? "success" : "inherit"} onClick={() => setIsAutoPlay(!isAutoPlay)} startIcon={<PlayArrowIcon />}>
                    Auto-Play
                  </Button>
                </Tooltip>
              </>
            )}
            <Button variant="outlined" onClick={onBack}>Back</Button>
            <Tooltip title="Clear all"><IconButton color="warning" onClick={handleClear} disabled={isTranslating}><DeleteIcon /></IconButton></Tooltip>
          </Box>
        </Box>
        
        <Snackbar open={showError} autoHideDuration={6000} onClose={handleCloseError} anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}>
          <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>{error}</Alert>
        </Snackbar>
      </Paper>
    </Box>
  );
}

export default AudioInput;