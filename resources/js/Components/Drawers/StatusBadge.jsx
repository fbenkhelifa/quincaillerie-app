/**
 * StatusBadge
 * ===========
 * Premium status chip
 */

import { Chip, alpha, useTheme } from '@mui/material';

export default function StatusBadge({ status, label, color = 'default', size = 'small' }) {
  const theme = useTheme();
  
  // Map specific statuses to colors if not provided
  const getColor = () => {
    if (color !== 'default') return color;
    
    switch (status) {
      case 'paid':
      case 'completed':
      case 'active':
      case 'ok':
        return 'success';
      case 'pending':
      case 'low':
      case 'draft':
        return 'warning';
      case 'cancelled':
      case 'out':
      case 'overdue':
        return 'error';
      default:
        return 'default';
    }
  };

  const finalColor = getColor();
  
  return (
    <Chip
      label={label || status}
      size={size}
      color={finalColor}
      variant="filled"
      sx={{
        fontWeight: 600,
        textTransform: 'capitalize',
        ...(finalColor === 'default' && {
          bgcolor: alpha(theme.palette.text.primary, 0.08),
          color: 'text.primary',
        })
      }}
    />
  );
}
