"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import { doc, getDoc } from "firebase/firestore";
import { auth, db } from "../../components/util/firebase";
import Feed from "../feed/page";
import Payouts from "../payouts/page";
import Settings from "../settings/page";
import { FaWallet, FaUserFriends } from 'react-icons/fa';

const drawerWidth = 280;

const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Feed");
  const [formData, setFormData] = useState({
    username: "",
    name: "",
    profilePicture: "",
  });
  const [userId, setUserId] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, "tutors", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data());
        }
      }
    };
    fetchUserData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const sections = [
    { label: "Feed", icon: <VideoLibraryIcon /> },
    { label: "Wallet", icon: <FaWallet /> },
    { label: "Me", icon: <AccountCircleIcon /> },
  ];

  const drawer = (
    <Box sx={{ 
      p: 2, 
      textAlign: "center", 
      background: "#15202B", 
      flex: 1,
      height: "100%",
      display: "flex",
      flexDirection: "column"
    }}>
      {/* Logo and Text Container */}
      <Box sx={{ 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "left",
        gap: 1,  // Adds spacing between image and text
        mb: 2    // Adds margin bottom
      }}>
        <img
          src={formData.profilePicture || "/logo.png"}
          alt="Logo"
          style={{ 
            width: 40, 
            height: 40, 
            objectFit: "contain" 
          }}
        />
        <Typography variant="h6" sx={{ 
          color: "#fff", 
          fontWeight: "400",
          fontSize: "1.25rem"
        }}>
          LearnFi
        </Typography>
      </Box>

      <Divider sx={{ 
        my: 2, 
        backgroundColor: "rgba(255, 255, 255, 0.12)" 
      }} />
      
      <List sx={{ flexGrow: 1 }}>
        {sections.map(({ label, icon }) => (
          <ListItem
            button
            key={label}
            onClick={() => setActiveSection(label)}
            sx={{ 
              cursor: "pointer",
              borderRadius: "8px",
              mb: 1,
              "&:hover": {
                backgroundColor: "rgba(248, 221, 0, 0.08)"
              }
            }}
          >
            <ListItemIcon sx={{ 
              color: activeSection === label ? "#F8DD00" : "#fff",
              minWidth: "40px"
            }}>
              {icon}
            </ListItemIcon>
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                style: { 
                  color: activeSection === label ? "#F8DD00" : "#fff",
                  fontWeight: activeSection === label ? "500" : "400"
                },
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ 
      display: "flex", 
      background: "#15202B", 
      minHeight: "100vh" 
    }}>
      {/* Sidebar Drawer */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#15202B",
            border: "none",
            boxShadow: "none",
          }
        }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            backgroundColor: "#15202B",
            border: "none",
            boxShadow: "none",
          }
        }}
        open
      >
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ 
        flexGrow: 1, 
        marginLeft: { sm: `${drawerWidth}px` },
        backgroundColor: "#f5f5f5" // Light background for content area
      }}>
        {activeSection === "Feed" && <Feed />}
        {activeSection === "Wallet" && <Payouts />}
        {activeSection === "Me" && <Settings />}
      </Box>
    </Box>
  );
};

export default Dashboard;