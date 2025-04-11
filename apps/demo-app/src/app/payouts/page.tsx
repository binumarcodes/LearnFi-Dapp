import React, { useEffect, useState } from 'react';
import { Box, Grid, Paper, Typography } from '@mui/material';
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { auth, db } from "../../components/util/firebase";

type MetricCardProps = {
  title: string;
  value: string | number;
  dark?: boolean;
};

const MetricCard = ({ title, value, dark = false }: MetricCardProps) => (
  <Paper
    elevation={4}
    sx={{
      height: '300px', // Fixed height of 300px
      width: '300px',  // Fixed width of 300px
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      alignItems: 'center',
      borderRadius: 4,
      backgroundColor: dark ? '#000' : '#fff',
      color: dark ? '#fff' : '#012b11',
      boxShadow: '0 8px 30px rgba(0,0,0,0.05)',
      textAlign: 'center',
    }}
  >
    <Typography
      variant="h6"
      sx={{ mb: 2, fontWeight: 500, color: dark ? '#ccc' : '#666' }}
    >
      {title}
    </Typography>
    <Typography variant="h3" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

function page() {
  const [videoCount, setVideoCount] = useState(0);

  useEffect(() => {
    const fetchVideoCount = async (userId: string) => {
      try {
        const contentsRef = collection(db, "videos");
        const q = query(contentsRef, where("userId", "==", userId));
        const querySnapshot = await getDocs(q);
        setVideoCount(querySnapshot.size);
      } catch (error) {
        console.error("Error fetching video count:", error);
      }
    };

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        fetchVideoCount(user.uid);
      } else {
        setVideoCount(0);
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh', // Center the grid vertically
        px: { xs: 2, md: 5 },
      }}
    >
      <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', maxWidth: '1200px' }}>
        <Grid item xs={12} sm={4} display="flex" justifyContent="center">
          <MetricCard title="Number of Tutorials" value={videoCount} />
        </Grid>
        <Grid item xs={12} sm={4} display="flex" justifyContent="center">
          <MetricCard title="Total Earnings (Xion Tokens)" value="Ξ0" dark />
        </Grid>
        <Grid item xs={12} sm={4} display="flex" justifyContent="center">
          <MetricCard title="Number of Likes" value={videoCount} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default page;
