// src/pages/Login.jsx
import { useState } from "react";
import { Link } from "react-router-dom";
import { Box, TextField, Button, Typography, Checkbox, FormControlLabel, Container, Paper, InputAdornment, IconButton } from "@mui/material";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import bg from '../assets/bg.jpg'

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  const handleSubmit = (e) => {
    e.preventDefault();
    // Add your login logic here
    console.log("Login attempt with:", { email, password });
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
          Login
        </Typography>
        
        <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
          <TextField
            margin="normal"
            required
            fullWidth
            id="email"
            label="Your Email"
            name="email"
            autoComplete="email"
            autoFocus
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
            name="password"
            label="Your Password"
            type={showPassword ? "text" : "password"}
            id="password"
            autoComplete="current-password"
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
          
          <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
            <FormControlLabel
              control={<Checkbox sx={{ color: "rgba(255, 255, 255, 0.7)", "&.Mui-checked": { color: "white" } }} />}
              label="Remember Me"
              sx={{ color: "rgba(255, 255, 255, 0.9)" }}
            />
            <Link to="/forgot-password" style={{ color: "#6EABF2", textDecoration: "none" }}>
              Forgot Password?
            </Link>
          </Box>
          
          <Button
            type="submit"
            fullWidth
            variant="contained"
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
            Login
          </Button>
          
          <Typography align="center" sx={{ mt: 2 }}>
            New Here?{" "}
            <Link to="/SignUp" style={{ color: "#6EABF2", textDecoration: "none" }}>
              Create an Account
            </Link>
          </Typography>
        </Box>
      </Paper>
    </Container>
  );
};

export default Login;