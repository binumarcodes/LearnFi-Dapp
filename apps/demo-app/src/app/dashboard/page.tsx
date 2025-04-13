"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Grid,
  Paper,
  AppBar,
  Toolbar,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  CssBaseline,
  Divider,
  Avatar,
  Button,
  ListItemIcon,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import VideoLibraryIcon from "@mui/icons-material/VideoLibrary";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import CollectionsIcon from "@mui/icons-material/Collections";
import AttachMoneyIcon from "@mui/icons-material/AttachMoney";
import LeaderboardIcon from "@mui/icons-material/Leaderboard";
import SettingsIcon from "@mui/icons-material/Settings";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import LogoutIcon from "@mui/icons-material/Logout";
import MenuIcon from "@mui/icons-material/Menu";

import { useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { auth, db } from "../../components/util/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import UploadVideo from "../uploadvideo/page";
import Feed from "../feed/page";
import MyContents from "../myContents/page";
import Payouts from "../payouts/page";
import Leaderboard from "../leaderboard/page";
import Settings from "../settings/page";

const drawerWidth = 280;

const StyledButton = styled(Button)({
  textTransform: "none",
  fontSize: "16px",
  padding: "10px 20px",
  borderRadius: "8px",
});



const Dashboard = () => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState("Feed");
  const [formData, setFormData] = useState({
      username: "",
      name: "",
      profilePicture: "",
    });
    const [userId, setUserId] = useState(null);
    const [imageFile, setImageFile] = useState(null);

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

//   const navigate = useNavigate(); // Initialize navigation hook

  const handleLogout = () => {
    // Clear authentication details (example: local storage)
    localStorage.removeItem("token"); // Adjust this based on your auth method

    // Redirect to login page
    // navigate("/login");
  };

  const sections = [
    // { label: "Feed", icon: <VideoLibraryIcon /> },
    { label: "Feed", icon: <VideoLibraryIcon /> },
    { label: "Upload Video", icon: <CloudUploadIcon /> },
    { label: "My Content", icon: <CollectionsIcon /> },
    { label: "Earnings & Payouts", icon: <AttachMoneyIcon /> },
    { label: "Leaderboard", icon: <LeaderboardIcon /> },
    { label: "Profile", icon: <AccountCircleIcon /> },
  ];

  
  

  const drawer = (
    <Box sx={{ p: 2, textAlign: "center", background: "#fff" }}>
      <img
  src={formData.profilePicture || "/text_logo.png"} // Use logo from public folder
  alt="Logo"
  style={{ width: 180, height: 40, display: "block", margin: "0 auto", marginBottom: "16px" }}
/>

<Typography variant="h6" sx={{ color: "#012b11", fontWeight: "800" }}>
  {formData.username || null} {/* Show Loading instead of 'User' */}
</Typography>


      <Divider sx={{ my: 2 }} />
      <List>
        {sections.map(({ label, icon }) => (
          <ListItem
            button
            key={label}
            onClick={() => setActiveSection(label)}
            sx={{ background: activeSection === label ? "gold" : "transparent", cursor: "pointer" }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <StyledButton variant="contained" color="error" startIcon={<LogoutIcon />} onClick={handleLogout}>
        Logout
      </StyledButton>
    </Box>
  );

  return (
    <Box sx={{ display: "flex", background: "#F3F7F9", minHeight: "100vh" }}>
      {/* <CssBaseline /> */}
      {/* <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "#fff",
          boxShadow: "none",
          borderBottom: "3px solid #EDF0F2",
        }}
      >
        <Toolbar>
          <IconButton color="inherit" aria-label="open drawer" edge="start" onClick={handleDrawerToggle} sx={{ mr: 2, display: { sm: "none" } }}>
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap sx={{ color: "#012b11" }}>
            {activeSection}
          </Typography>
        </Toolbar>
      </AppBar> */}

      {/* Sidebar Drawer */}
      <Drawer variant="temporary" open={mobileOpen} onClose={handleDrawerToggle} sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}>
        {drawer}
      </Drawer>
      <Drawer variant="permanent" sx={{ display: { xs: "none", sm: "block" }, "& .MuiDrawer-paper": { width: drawerWidth } }} open>
        {drawer}
      </Drawer>

      {/* Main Content */}
      <Box sx={{ flexGrow: 1, marginLeft: { sm: `${drawerWidth}px` } }}>
      {activeSection === "Dashboard" && (
        <Feed />
      )}

        {activeSection === "Upload Video" && <UploadVideo />}
        {activeSection === "Feed" && <Feed />}
        {activeSection === "Earnings & Payouts" && <Payouts />}
        {activeSection === "Leaderboard" && <Leaderboard />}
        {activeSection === "My Content" && <MyContents />}
        {activeSection === "Profile" && <Settings />}
      </Box>
    </Box>
  );
};

export default Dashboard;
