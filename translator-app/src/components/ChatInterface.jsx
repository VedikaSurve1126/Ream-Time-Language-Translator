// src/components/ChatInterface.jsx
import { useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import { v4 as uuidv4 } from 'uuid';

function ChatInterface({ input, translated }) {
  const [sessionCode] = useState(uuidv4().slice(0, 6)); // 6-digit code

  return (
    <Box>
      <Typography variant="h6">Real-Time Chat</Typography>
      <Typography>Session Code: {sessionCode}</Typography>
      <Box sx={{ border: '1px solid gray', p: 2, mt: 2 }}>
        <Typography>You: {input}</Typography>
        <Typography>Translated: {translated}</Typography>
      </Box>
      <Button variant="contained" sx={{ mt: 1 }}>Send to Other User</Button>
    </Box>
  );
}

export default ChatInterface;
