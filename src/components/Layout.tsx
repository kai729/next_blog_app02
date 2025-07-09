// src/components/Layout.tsx
import React, { useState } from "react";
import { Box, Drawer, IconButton, Toolbar, AppBar, Typography, useMediaQuery, useTheme } from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { Outlet } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { useResponsive } from "../hooks/useResponsive";

export default function Layout() {
  const isDesktop = useResponsive();

  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleCloseDrawer = () => {
    setMobileOpen(false);
  };

  const drawerWidth = 240;

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      {/* AppBar for Mobile */}
      {!isDesktop && <Header onMenuClick={toggleDrawer} />}
      {/* <Header onMenuClick={toggleDrawer} /> */}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isDesktop ? "permanent" : "temporary"}
        open={isDesktop ? true : mobileOpen}
        onClose={toggleDrawer}
        ModalProps={{ keepMounted: true }}
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            ...(isDesktop && { height: "100vh" }),
          },
        }}
        PaperProps={{
          elevation: isDesktop ? 0 : 4,
        }}
      >
        {/* Sidebarにclose用のイベントを渡す */}
        <Sidebar onLinkClick={handleCloseDrawer} />
      </Drawer>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: "100%",
          display: "flex",
          justifyContent: "center",
          backgroundColor: "#e3f2fd",
          overflowY: "auto",
          padding: "40px 4%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            backgroundColor: "#fff",
            borderRadius: 2,
            boxShadow: 1,
          }}
        >
          {!isDesktop && <Toolbar />}
          <Outlet />
        </Box>
      </Box>
    </Box>
  );
}
