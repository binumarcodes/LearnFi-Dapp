'use client';
import { useColorMode } from './ThemeProvider';
import { IconButton, Tooltip } from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';

export default function ThemeToggleButton() {
  const { toggleColorMode, mode } = useColorMode();

  return (
    <Tooltip title="Toggle theme">
      <IconButton onClick={toggleColorMode} color="inherit">
        {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
      </IconButton>
    </Tooltip>
  );
}
