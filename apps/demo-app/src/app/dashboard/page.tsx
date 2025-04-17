"use client";

import { useEffect, useState } from "react";
import {
  Box,
  Typography,
  Paper,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider,
  Avatar,
  Button,
  ListItemIcon,
} from "@mui/material";
import { styled } from "@mui/material/styles";
import { ListItemButton } from "@mui/material";

import {
  VideoLibrary as VideoLibraryIcon,
  CloudUpload as CloudUploadIcon,
  Collections as CollectionsIcon,
  AttachMoney as AttachMoneyIcon,
  Leaderboard as LeaderboardIcon,
  AccountCircle as AccountCircleIcon,
  Logout as LogoutIcon,
} from "@mui/icons-material";

import { doc, getDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../components/util/firebase";

// Section Pages
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
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      const user = auth.currentUser;
      if (user) {
        setUserId(user.uid);
        const docRef = doc(db, "tutors", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setFormData(docSnap.data() as {
            username: string;
            name: string;
            profilePicture: string;
          });
        }
      }
    };
    fetchUserData();
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    // Optionally redirect to login here
  };

  const sections = [
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
        src={formData.profilePicture || "/text_logo.png"}
        alt="Logo"
        style={{
          width: 180,
          height: 40,
          display: "block",
          margin: "0 auto",
          marginBottom: 16,
        }}
      />

      <Divider sx={{ my: 2 }} />
      <List>
        {sections.map(({ label, icon }) => (
          <ListItemButton
            key={label}
            onClick={() => setActiveSection(label)}
            sx={{
              background: activeSection === label ? "gold" : "transparent",
              cursor: "pointer",
            }}
          >
            <ListItemIcon>{icon}</ListItemIcon>
            <ListItemText primary={label} />
          </ListItemButton>
        ))}
      </List>
      <Divider sx={{ my: 2 }} />
      <StyledButton
        variant="contained"
        color="error"
        startIcon={<LogoutIcon />}
        onClick={handleLogout}
      >
        Logout
      </StyledButton>
    </Box>
  );
  

  return (
    <Box sx={{ display: "flex", background: "#F3F7F9", minHeight: "100vh" }}>
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        sx={{ "& .MuiDrawer-paper": { width: drawerWidth } }}
      >
        {drawer}
      </Drawer>
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: "none", sm: "block" },
          "& .MuiDrawer-paper": { width: drawerWidth },
        }}
        open
      >
        {drawer}
      </Drawer>

      <Box sx={{ flexGrow: 1, marginLeft: { sm: `${drawerWidth}px` } }}>
        {activeSection === "Feed" && <Feed />}
        {activeSection === "Upload Video" && <UploadVideo />}
        {activeSection === "My Content" && <MyContents />}
        {activeSection === "Earnings & Payouts" && <Payouts />}
        {activeSection === "Leaderboard" && <Leaderboard />}
        {activeSection === "Profile" && <Settings />}
      </Box>
    </Box>
  );
};

export default Dashboard;
