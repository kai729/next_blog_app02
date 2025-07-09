// src/components/Header.tsx
import { AppBar, Toolbar, IconButton, Typography } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AppTitle from "./AppTitle";

type Props = {
  onMenuClick: () => void;
};

const Header = ({ onMenuClick }: Props) => {
  return (
    <AppBar position="fixed" color="primary">
      <Toolbar>
        <IconButton edge="start" color="inherit" onClick={onMenuClick}>
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ ml: 2 }}>
          KA-I Blog
        </Typography>
      </Toolbar>
    </AppBar>
  );
};

export default Header;
