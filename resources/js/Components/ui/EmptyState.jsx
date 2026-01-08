/**
 * EmptyState Component
 * ====================
 * Consistent empty state with illustration, title, description, and optional action.
 */

import { Box, Typography, Button, alpha, useTheme } from '@mui/material';
import {
  Inbox as InboxIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Add as AddIcon,
} from '@mui/icons-material';

const illustrations = {
  empty: InboxIcon,
  search: SearchIcon,
  filter: FilterIcon,
};

export default function EmptyState({
  type = 'empty',
  icon: CustomIcon,
  title,
  description,
  action,
  actionLabel,
  onAction,
  size = 'medium',
  sx = {},
}) {
  const theme = useTheme();
  const Icon = CustomIcon || illustrations[type] || InboxIcon;

  const sizes = {
    small: {
      iconSize: 48,
      iconWrapper: 80,
      titleVariant: 'subtitle1',
      descVariant: 'body2',
      spacing: 2,
    },
    medium: {
      iconSize: 64,
      iconWrapper: 120,
      titleVariant: 'h6',
      descVariant: 'body1',
      spacing: 3,
    },
    large: {
      iconSize: 80,
      iconWrapper: 160,
      titleVariant: 'h5',
      descVariant: 'body1',
      spacing: 4,
    },
  };

  const config = sizes[size];

  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        py: config.spacing * 2,
        px: config.spacing,
        ...sx,
      }}
    >
      <Box
        sx={{
          width: config.iconWrapper,
          height: config.iconWrapper,
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: alpha(theme.palette.primary.main, 0.08),
          mb: config.spacing,
        }}
      >
        <Icon
          sx={{
            fontSize: config.iconSize,
            color: alpha(theme.palette.primary.main, 0.4),
          }}
        />
      </Box>

      {title && (
        <Typography
          variant={config.titleVariant}
          fontWeight={600}
          color="text.primary"
          sx={{ mb: 1 }}
        >
          {title}
        </Typography>
      )}

      {description && (
        <Typography
          variant={config.descVariant}
          color="text.secondary"
          sx={{ maxWidth: 360, mb: action ? config.spacing : 0 }}
        >
          {description}
        </Typography>
      )}

      {action && (
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={onAction}
          sx={{ mt: 1 }}
        >
          {actionLabel || action}
        </Button>
      )}
    </Box>
  );
}
