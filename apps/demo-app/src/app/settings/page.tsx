import React from 'react';
import { Box, Grid, Paper, Typography, Avatar, LinearProgress, Button } from '@mui/material';
import { styled } from '@mui/system';

// Profile Card styling
const ProfileCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  borderRadius: 16,
  textAlign: 'center',
  boxShadow: '0 12px 40px rgba(0, 0, 0, 0.15)',
  backgroundColor: '#F8F9FA',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-10px)',
    boxShadow: '0 16px 60px rgba(0, 0, 0, 0.2)',
  },
}));

// Metric Card styling
const MetricCard = ({ title, value, emoji }: { title: string; value: string | number, emoji: string }) => (
  <Paper
    elevation={3}
    sx={{
      p: 3,
      borderRadius: 8,
      textAlign: 'center',
      backgroundColor: '#fff',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      boxShadow: '0 8px 20px rgba(0, 0, 0, 0.1)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
      '&:hover': {
        transform: 'scale(1.05)',
        boxShadow: '0 12px 30px rgba(0, 0, 0, 0.2)',
      },
      width: '100%',
      height: '100%',
      minHeight: 180, // Set a minimum height for consistent height across cards
    }}
  >
    <Typography variant="h4" sx={{ mb: 2 }}>
      {emoji}
    </Typography>
    <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 1 }}>
      {title}
    </Typography>
    <Typography variant="h5" sx={{ fontWeight: 700 }}>
      {value}
    </Typography>
  </Paper>
);

// Main Profile Page component
const page = () => {
  const user = {
    name: 'Jane Doe',
    subject: 'Mathematics',
    language: 'English',
    avatar: 'https://randomuser.me/api/portraits/women/90.jpg',
    lessonsCompleted: 3,
    xp: 0,
    streak: 0,
  };

  return (
    <Box sx={{ px: { xs: 2, md: 5 }, py: 6, display: 'flex', justifyContent: 'center', height: '100vh', backgroundColor: '#F1F3F5' }}>
      <Grid container spacing={4} justifyContent="center" sx={{ width: '100%', maxWidth: '1200px' }}>
        
        {/* Profile Card */}
        <Grid item xs={12} sm={4}>
          <ProfileCard>
            <Avatar
              alt="Profile Avatar"
              src={user.avatar}
              sx={{ width: 120, height: 120, margin: '0 auto 16px', borderRadius: '50%' }}
            />
            <Typography variant="h5" sx={{ fontWeight: 600, mb: 1 }}>
              {user.name}
            </Typography>
            {/* <Typography variant="body1" color="text.secondary" sx={{ mb: 2 }}>
              {user.subject} - {user.language}
            </Typography> */}

            {/* Streak Bar */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              Current Streak: {user.streak} days
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(user.streak / 30) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                mb: 2,
                backgroundColor: '#E9ECEF',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #4CAF50 0%, #81C784 100%)',
                },
              }}
            />

            {/* XP Progress */}
            <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1 }}>
              XP: {user.xp} / 3000
            </Typography>
            <LinearProgress
              variant="determinate"
              value={(user.xp / 3000) * 100}
              sx={{
                height: 6,
                borderRadius: 3,
                mb: 2,
                backgroundColor: '#E9ECEF',
                '& .MuiLinearProgress-bar': {
                  background: 'linear-gradient(90deg, #3f51b5 0%, #757de8 100%)',
                },
              }}
            />
            
            {/* Action Button */}
            <Button variant="contained" sx={{ mt: 2, borderRadius: 8, textTransform: 'none' }}>Go to Lessons</Button>
          </ProfileCard>
        </Grid>

        {/* Metrics Section */}
        <Grid item xs={12} sm={8}>
          <Grid container spacing={4}>
            <Grid item xs={12} sm={4}>
              <MetricCard title="Lessons Completed" value={user.lessonsCompleted} emoji="📚" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard title="XP Earned" value={user.xp} emoji="🌟" />
            </Grid>
            <Grid item xs={12} sm={4}>
              <MetricCard title="Current Streak" value={user.streak} emoji="🔥" />
            </Grid>
          </Grid>
        </Grid>
      </Grid>
    </Box>
  );
};

export default page;
