import React from 'react';
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
    streak: 0,
  };

  return (
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


    </Box>
  );
};

export default ProfilePage;
