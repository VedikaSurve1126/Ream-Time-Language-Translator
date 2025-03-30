// src/components/Navbar.jsx
import { AppBar, Toolbar, Typography, Button, Menu, MenuItem, IconButton } from '@mui/material';
import { Link } from 'react-router-dom';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import {useState} from 'react';

function Navbar() {
  const [anchorE1, setanchorE1]=useState(null);
  const open=Boolean(anchorE1);

  const handleClick = (event) => {
    setanchorE1(event.currentTarget);
  };

  const handleClose = () =>{
    setanchorE1(null);
  }
  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <Typography variant="h6" component={Link} to="/" sx={{ flexGrow: 1, textDecoration: 'none', color:'inherit', '&:hover':{cursor:'pointer'}}}>
          Conclave
        </Typography>
        <Button color="inherit" component={Link} to="/Login">Login</Button>
        <Button color="inherit" component={Link} to="/SignUp">Sign Up</Button>

        <IconButton 
        color="inherit" aria-label="more options" aria-controls="menu-options" aria-haspopups="true" onClick={handleClick}>
          <MoreVertIcon />
        </IconButton>

        <Menu
        id="menu-options" anchorE1={anchorE1} open={open} onClose={handleClose} 
        anchorOrigin={{vertical:'bottom', horizontal:'right'}}
        transformOrigin={{vertical:'top', horizontal:'right'}}
        sx={{mt:-43}}>
          <MenuItem onClick={handleClose} component={Link} to="/History" >History</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/Languages" >Languages</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/Profile" >Profile</MenuItem>
          <MenuItem onClick={handleClose} component={Link} to="/Logout" >LogOut</MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
}

export default Navbar;