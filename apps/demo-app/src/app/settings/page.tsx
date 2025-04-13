import React from 'react';
<<<<<<< HEAD
import { Box, Grid, Paper, Typography, Avatar, Button, IconButton, Card } from '@mui/material';
import { styled } from '@mui/system';
import { CloudOff } from '@mui/icons-material';
import { Edit, PersonAdd } from '@mui/icons-material';


// Custom button component (as per your usage in React Native)
const CustomButton = ({
  title,
  icon,
  variant = 'contained',
  sx = {},
}: {
  title: string;
  icon?: React.ReactNode;
  variant?: string;
  sx?: object;
}) => {
  return (
    <Button
      variant={variant}
      startIcon={icon}
      sx={{
        width: '100%',
        borderRadius: 6,
        textTransform: 'none',
        color: variant === 'contained' ? '#fff' : '#000',
        backgroundColor: variant === 'contained' ? '#000' : 'transparent',
        border: variant === 'outline' ? '1px solid #000' : 'none',
        ...sx,
      }}
    >
      {title}
    </Button>
  );
};


// Profile Page component
const ProfilePage = () => {
  const user = {
    name: 'Anonymous',
    bio: '...',
    avatar: 'https://media.istockphoto.com/id/1465504312/vector/young-smiling-man-avatar-man-with-brown-beard-mustache-and-hair-wearing-yellow-sweater-or.jpg?s=612x612&w=0&k=20&c=9AyNmOwjadmLC1PKpANKEXj56e1KxHj9h9hGknd-Rb0=',
    lessons: 3,
    likes: 0,
    followers: 0,
    xp: 3,
=======
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
>>>>>>> 2b1fdb9bc3e2b4879f28c0520d1790c30b7cf470
    streak: 0,
  };

  return (
<<<<<<< HEAD
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        minHeight: '100vh',
        backgroundColor: '#F5F5F5',
        padding: 3, // Adjusted padding for overall balance
      }}
    >
      {/* User Details */}
      <Paper
        sx={{
          width: '100%',
          padding: 4,
          backgroundColor: '#fff',
          marginBottom: 4,
          borderRadius: 6,
          textAlign: 'center',
          boxShadow: 2, // Added subtle shadow for elevation
        }}
      >
        <Grid container justifyContent="center" alignItems="center" spacing={4}>
          {/* Profile Picture and Details */}
          <Grid item xs={12} sm={4} sx={{ textAlign: 'center' }}>
  <Avatar
    alt="Profile Avatar"
    src={user.avatar}
    sx={{
      width: 120,
      height: 120,
      marginBottom: 2,
      borderRadius: '50%',
      border: '3px solid #000',
      backgroundColor: 'gold', // This will show through transparent PNGs
    }}
    imgProps={{ style: { backgroundColor: 'transparent' } }} // Make sure the image doesn't override it
  />
  <Typography variant="h5" sx={{ color: '#000', fontWeight: 600 }}>
    {user.name}
  </Typography>
  <Typography variant="body2" sx={{ color: '#000', fontWeight: 400 }}>
    {user.bio}
  </Typography>
</Grid>


          {/* Stats + Buttons Combined in One Column */}
<Grid item xs={12} sm={8}>
  <Box display="flex" flexDirection="column" alignItems="center" gap={4}>
    {/* Stats */}
    <Grid container justifyContent="space-between" spacing={3}>
      <Grid item xs={4}>
        <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
          {user.lessons}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Lessons
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
          {user.likes}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Likes
        </Typography>
      </Grid>
      <Grid item xs={4}>
        <Typography variant="h6" sx={{ color: '#000', fontWeight: 600 }}>
          {user.followers}
        </Typography>
        <Typography variant="body2" sx={{ color: 'rgba(0,0,0,0.8)' }}>
          Friends
        </Typography>
      </Grid>
    </Grid>

    {/* Action Buttons */}
    <Grid container justifyContent="center" spacing={3}>
      <Grid item xs={12} sm={6}>
        <CustomButton
          title="Edit Profile"
          icon={<Edit />}
          variant="contained"
          sx={{
            backgroundColor: '#FFD700',
            color: '#000',
            fontWeight: 600,
            borderRadius: '4px',
            padding: '12px 24px',
            '&:hover': {
              backgroundColor: '#FFC107',
            },
          }}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <CustomButton
          title="Find Friends"
          icon={<PersonAdd />}
          variant="outline"
          sx={{
            borderColor: '#000',
            color: '#000',
            fontWeight: 600,
            borderRadius: '4px',
            padding: '12px 24px',
            borderWidth: 2,
            '&:hover': {
              backgroundColor: '#000',
              color: '#fff',
            },
          }}
        />
      </Grid>
    </Grid>
  </Box>
</Grid>


        </Grid>
      </Paper>

      {/* Completed Lessons, XP, Streaks with SVGs */}
<Grid
  container
  justifyContent="center"
  spacing={4}
  sx={{ width: '100%', maxWidth: '1200px', marginTop: 4 }}
>
  {[ 
    { icon: '/level.svg', label: 'Completed Lessons', value: user.lessons },
    { icon: '/xp.svg', label: 'XP Earned', value: user.xp },
    { icon: '/lesson.svg', label: 'Current Streak', value: `${user.streak} days` },
  ].map((item, idx) => (
    <Grid key={idx} item>
      <Paper
        sx={{
          width: 200,
          height: 200,
          borderRadius: 4,
          textAlign: 'center',
          backgroundColor: '#000',
          color: '#fff',
          padding: 2,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          boxShadow: 4,
        }}
      >
        <img
          src={item.icon}
          alt={item.label}
          style={{ width: 50, height: 50, marginBottom: 12 }}
        />
        <Typography variant="subtitle1" sx={{ color: '#fff', marginBottom: 1 }}>
          {item.label}
        </Typography>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>
          {item.value}
        </Typography>
      </Paper>
    </Grid>
  ))}
</Grid>


=======
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
>>>>>>> 2b1fdb9bc3e2b4879f28c0520d1790c30b7cf470
    </Box>
  );
};

<<<<<<< HEAD
export default ProfilePage;
=======
export default page;
>>>>>>> 2b1fdb9bc3e2b4879f28c0520d1790c30b7cf470
