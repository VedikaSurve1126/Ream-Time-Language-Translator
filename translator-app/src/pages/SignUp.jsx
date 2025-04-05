// src/pages/SignUp.jsx
import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Box, TextField, Button, Typography, Container, Paper, InputAdornment, IconButton, Alert } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import bg from '../assets/bg.jpg';

const SignUp = () => {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    
    // Validate input
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    
    if (password.length < 6) {
      setError("Password must be at least 6 characters long");
      return;
    }
    
    setLoading(true);
    
    try {
      const response = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username, email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || "Registration failed");
      }
      
      // Registration successful, redirect to login
      navigate("/login", { state: { message: "Registration successful! Please login." } });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container 
      maxWidth={false} 
      sx={{ 
        minHeight: "calc(100vh - 64px)",
        padding: 0,
        backgroundImage: `url(${bg})`, 
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center"
      }}
    >
      <Paper 
        elevation={10} 
        sx={{ 
          backgroundColor: "rgba(0, 0, 0, 0.6)",
          backdropFilter: "blur(5px)",
          padding: 4,
          borderRadius: 2,
          maxWidth: 400,
          width: "100%",
          color: "white"
        }}
      >
        <Typography variant="h4" component="h1" align="center" sx={{ mb: 4, fontWeight: "bold" }}>
          Register
        </Typography>
        
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="username"
            label="Username"
            name="username"
            autoComplete="username"
            autoFocus
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end"><Box component="span" sx={{ color: "white" }}>👤</Box></InputAdornment>,
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                "&:hover fieldset": { borderColor: "white" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Your Email"
            name="email"
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            InputProps={{
              endAdornment: <InputAdornment position="end"><Box component="span" sx={{ color: "white" }}>📧</Box></InputAdornment>,
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                "&:hover fieldset": { borderColor: "white" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="password"
            label="Your Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="new-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowPassword(!showPassword)}
                    edge="end"
                    sx={{ color: "white" }}
                  >
                    {showPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 2,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                "&:hover fieldset": { borderColor: "white" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }
            }}
          />
          
          <TextField
            margin="normal"
            required
            fullWidth
            name="confirmPassword"
            label="Confirm Password"
            type={showConfirmPassword ? "text" : "password"}
            id="confirmPassword"
            autoComplete="new-password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <IconButton
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    edge="end"
                    sx={{ color: "white" }}
                  >
                    {showConfirmPassword ? <VisibilityIcon /> : <VisibilityOffIcon />}
                  </IconButton>
                </InputAdornment>
              ),
            }}
            sx={{
              mb: 3,
              "& .MuiOutlinedInput-root": {
                color: "white",
                "& fieldset": { borderColor: "rgba(255, 255, 255, 0.5)" },
                "&:hover fieldset": { borderColor: "white" },
              },
              "& .MuiInputLabel-root": { color: "rgba(255, 255, 255, 0.7)" }
            }}
          />
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
            disabled={loading}
            sx={{
              mt: 2,
              mb: 3,
              py: 1.5,
              backgroundColor: "rgba(255, 255, 255, 0.9)",
              color: "rgba(0, 0, 0, 0.8)",
              "&:hover": {
                backgroundColor: "white",
              }
            }}
          >
            {loading ? "Creating Account..." : "Register"}
          </Button>
          
          <Typography align="center" sx={{ mt: 2 }}>
            Already have an account?{" "}
            <Link to="/Login" style={{ color: "#6EABF2", textDecoration: "none" }}>
              Login
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default SignUp;