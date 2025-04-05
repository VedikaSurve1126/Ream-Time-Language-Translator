import { useState, useEffect } from 'react';
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import PersonIcon from '@mui/icons-material/Person';
import { useAuth } from '../context/AuthContext'; // Import useAuth hook

function Navbar() {
  const navigate = useNavigate();
  const { user, logout } = useAuth(); // Use the auth context
  const [anchorEl, setAnchorEl] = useState(null);
  const [moreMenuAnchorEl, setMoreMenuAnchorEl] = useState(null);
  const userMenuOpen = Boolean(anchorEl);
  const moreMenuOpen = Boolean(moreMenuAnchorEl);

  const handleUserMenuClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMoreMenuClick = (event) => {
    setMoreMenuAnchorEl(event.currentTarget);
  };

  const handleUserMenuClose = () => {
    setAnchorEl(null);
  };

  const handleMoreMenuClose = () => {
    setMoreMenuAnchorEl(null);
  };

  const handleLogout = () => {
    setAnchorEl(null);
    logout(); // Use the logout function from AuthContext
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
              onClick={handleUserMenuClick}
              aria-controls="user-menu"
              aria-haspopup="true"
            >
              <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                {user.username ? user.username[0].toUpperCase() : <PersonIcon />}
              </Avatar>
              {user.username}
            </Button>
            <Menu
              id="user-menu"
              anchorEl={anchorEl}
              open={userMenuOpen}
              onClose={handleUserMenuClose}
              anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
              transformOrigin={{ vertical: 'top', horizontal: 'right' }}
            >
              <MenuItem onClick={handleUserMenuClose} component={Link} to="/Profile">Profile</MenuItem>
              <MenuItem onClick={handleUserMenuClose} component={Link} to="/History">History</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
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
          onClick={handleMoreMenuClick}
          sx={{ ml: 1 }}
        >
          <MoreVertIcon />
        </IconButton>

        <Menu
          id="menu-options" 
          anchorEl={moreMenuAnchorEl} 
          open={moreMenuOpen} 
          onClose={handleMoreMenuClose} 
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          transformOrigin={{ vertical: 'top', horizontal: 'right' }}
        >
          {user ? (
            // Menu items for logged-in users
            <>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/text-input">Text Input</MenuItem>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/audio-input">Audio Input</MenuItem>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/Languages">Languages</MenuItem>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/History">History</MenuItem>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/Profile">Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </>
          ) : (
            // Menu items for guests
            <>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/text-input">Text Input</MenuItem>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/audio-input">Audio Input</MenuItem>
              <MenuItem onClick={handleMoreMenuClose} component={Link} to="/Languages">Languages</MenuItem>
            </>
          )}
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;