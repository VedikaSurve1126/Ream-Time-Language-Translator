// src/components/Navbar.jsx
import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';

function Navbar() {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = useState(null);
  const [user, setUser] = useState(null);
  const open = Boolean(anchorEl);

  // Check if user is logged in on component mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (error) {
        console.error('Error parsing user data:', error);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
  }, []);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
    navigate('/');
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/" 
          sx={{ 
            flexGrow: 1, 
            textDecoration: 'none', 
            color: 'inherit', 
            '&:hover': { cursor: 'pointer' }
          }}
        >
          RealTimeLang+
        </Typography>

        {user ? (
          // User is logged in
          <>
            <Button 
              color="inherit" 
              sx={{ 
                display: 'flex', 
                alignItems: 'center',
                gap: 1
              }}
              onClick={handleClick}
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.username ? user.username[0].toUpperCase() : <PersonIcon />}
              </Avatar>
              {user.username}
            </Button>
          </>
        ) : (
          // User is not logged in
          <>
            <Button color="inherit" component={Link} to="/Login">Login</Button>
            <Button color="inherit" component={Link} to="/SignUp">Sign Up</Button>
          </>
        )}

        <IconButton 
          color="inherit" 
          aria-label="more options" 
          aria-controls="menu-options" 
          aria-haspopup="true" 
          onClick={handleClick}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id="menu-options" 
          anchorEl={anchorEl} 
          open={open} 
          onClose={handleClose} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {user ? (
            // Menu items for logged-in users
            <>
              <MenuItem onClick={handleClose} component={Link} to="/History">History</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/Languages">Languages</MenuItem>
              <MenuItem onClick={handleClose} component={Link} to="/Profile">Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </>
          ) : (
            // Menu items for guests
            <>
              <MenuItem onClick={handleClose} component={Link} to="/Languages">Languages</MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;