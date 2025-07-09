// src/components/AppTitle.tsx
import { Typography } from "@mui/material";
import { Link } from "react-router-dom";

const AppTitle = () => {
  return (
    <Typography variant="h6" component={Link} to="/" sx={{ textDecoration: "none", color: "inherit", fontWeight: 600 }}>
      My Blog
    </Typography>
  );
};

export default AppTitle;
