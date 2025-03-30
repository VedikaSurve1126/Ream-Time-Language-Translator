import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import { Box, Typography, Select, MenuItem, TextField, Button } from '@mui/material';

const TextInput = () => {
  const [inputText, setInputText] = useState('');
  const [translatedText, setTranslatedText] = useState('');
  const [inputLang, setInputLang] = useState('eng_Latn');
  const [outputLang, setOutputLang] = useState('spa_Latn');
  const [isLoading, setIsLoading] = useState(false);

  const navigate = useNavigate(); // Initialize useNavigate

  const handleTranslate = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('http://localhost:5000/api/translate-text', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: inputText, sourceLang: inputLang, targetLang: outputLang }),
      });
      const data = await response.json();
      setTranslatedText(data.translatedText);
    } catch (error) {
      console.error('Text translation failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClear = () => {
    setInputText('');
    setTranslatedText('');
  };

  const handleBack = () => {
    navigate(-1); // Navigate back to the previous page
  };

  return (
    <Box sx={{ maxWidth: 600, margin: '0 auto', padding: 2 }}>
      {/* Title */}
      <Typography variant="h5" align="center" gutterBottom>
        Text Translator
      </Typography>

      {/* Language Selection */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Select
          value={inputLang}
          onChange={(e) => setInputLang(e.target.value)}
          sx={{ width: '48%' }}
        >
          <MenuItem value="eng_Latn">English</MenuItem>
          <MenuItem value="fra_Latn">French</MenuItem>
          <MenuItem value="hin_Deva">Hindi</MenuItem>
        </Select>
        <Select
          value={outputLang}
          onChange={(e) => setOutputLang(e.target.value)}
          sx={{ width: '48%' }}
        >
          <MenuItem value="spa_Latn">Spanish</MenuItem>
          <MenuItem value="fra_Latn">French</MenuItem>
          <MenuItem value="hin_Deva">Hindi</MenuItem>
        </Select>
      </Box>

      {/* Text Input and Output */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', marginBottom: 2 }}>
        <Box sx={{ width: '48%' }}>
          <Typography variant="subtitle1" gutterBottom>
            Text Input
          </Typography>
          <TextField
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            placeholder="Enter text to translate"
            multiline
            rows={4}
            fullWidth
            variant="outlined"
          />
        </Box>
        <Box sx={{ width: '48%' }}>
          <Typography variant="subtitle1" gutterBottom>
            Translated Text
          </Typography>
          <TextField
            value={translatedText}
            disabled
            multiline
            rows={4}
            fullWidth
            variant="outlined"
            sx={{
              '& .MuiInputBase-input.Mui-disabled': {
                color: '#000000',
                WebkitTextFillColor: '#000000',
              },
            }}
          />
        </Box>
      </Box>

      {/* Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={handleBack}
          variant="outlined"
          color="primary"
        >
          Back
        </Button>
        <Button
          onClick={handleTranslate}
          disabled={isLoading}
          variant="contained"
          color="primary"
        >
          {isLoading ? 'Translating...' : 'Translate'}
        </Button>
        <Button
          onClick={handleClear}
          variant="outlined"
          color="secondary"
        >
          Clear
        </Button>
      </Box>
    </Box>
  );
};

export default TextInput;