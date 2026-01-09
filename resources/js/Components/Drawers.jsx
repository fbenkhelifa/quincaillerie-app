/**
 * Detail Drawers
 * ==============
 * Right-side drawer components for detailed entity views.
 * Used for Products, Bills, Purchases, Findings, etc.
 */

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  Button,
  Chip,
  Grid,
  Paper,
  Skeleton,
  useTheme,
  alpha,
  Fade,
} from '@mui/material';
import {
  Close as CloseIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  MoreVert as MoreVertIcon,
  Download as DownloadIcon,
} from '@mui/icons-material';
import React from 'react';

/**
 * BaseDetailDrawer
 * Common structure for all detail drawers
 */
export function BaseDetailDrawer({
  open = false,
  onClose = () => {},
  title = '',
  subtitle = '',
  loading = false,
  children,
  actions = [],
  onEdit = null,
  onDelete = null,
  width = 500,
}) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      slotProps={{
        backdrop: {
          sx: { backgroundColor: alpha(theme.palette.common.black, 0.5) },
        },
      }}
      PaperProps={{
        sx: {
          width,
          maxWidth: '90%',
          borderRadius: '12px 0 0 12px',
        },
      }}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        {/* Header */}
        <Box sx={{ p: 3, borderBottom: `1px solid ${alpha(theme.palette.divider, 0.5)}` }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <Box>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                {title}
              </Typography>
              {subtitle && (
                <Typography variant="caption" sx={{ color: 'text.secondary', mt: 0.5, display: 'block' }}>
                  {subtitle}
                </Typography>
              )}
            </Box>
            <IconButton onClick={onClose} size="small" aria-label="Close drawer">
              <CloseIcon />
            </IconButton>
          </Box>
        </Box>

        {/* Content */}
        <Box sx={{ flex: 1, overflow: 'auto', p: 3 }}>
          {loading ? (
            <Stack spacing={2}>
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={100} />
              <Skeleton variant="text" height={40} />
              <Skeleton variant="rectangular" height={200} />
            </Stack>
          ) : (
            <Fade in={!loading}>{children}</Fade>
          )}
        </Box>

        {/* Actions Footer */}
        {(onEdit || onDelete || actions.length > 0) && (
          <>
            <Divider />
            <Box sx={{ p: 2, display: 'flex', gap: 1, justifyContent: 'flex-end' }}>
              {actions.map((action, idx) => (
                <Button
                  key={idx}
                  {...action}
                  variant={action.variant || 'outlined'}
                  size="small"
                >
                  {action.label}
                </Button>
              ))}
              {onEdit && (
                <Button
                  variant="contained"
                  startIcon={<EditIcon />}
                  onClick={onEdit}
                  size="small"
                >
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button
                  variant="outlined"
                  color="error"
                  startIcon={<DeleteIcon />}
                  onClick={onDelete}
                  size="small"
                >
                  Delete
                </Button>
              )}
            </Box>
          </>
        )}
      </Box>
    </Drawer>
  );
}

/**
 * DetailSection
 * Reusable section component for drawer content
 */
export function DetailSection({ title, children }) {
  const theme = useTheme();
  return (
    <Box sx={{ mb: 3 }}>
      {title && (
        <Typography
          variant="subtitle2"
          sx={{
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.05em',
            color: 'text.secondary',
            mb: 1.5,
            fontSize: '0.75rem',
          }}
        >
          {title}
        </Typography>
      )}
      <Box sx={{ pl: title ? 0 : 0 }}>{children}</Box>
    </Box>
  );
}

/**
 * DetailRow
 * Display a label-value pair
 */
export function DetailRow({ label, value, highlight = false }) {
  return (
    <Grid container spacing={2} sx={{ mb: 2 }}>
      <Grid item xs={5} sm={4}>
        <Typography variant="body2" sx={{ fontWeight: 500, color: 'text.secondary' }}>
          {label}
        </Typography>
      </Grid>
      <Grid item xs={7} sm={8}>
        <Typography
          variant="body2"
          sx={{
            fontWeight: highlight ? 600 : 400,
            color: highlight ? 'primary.main' : 'text.primary',
          }}
        >
          {value}
        </Typography>
      </Grid>
    </Grid>
  );
}

/**
 * StatusBadge
 * Display status with appropriate color
 */
export function StatusBadge({ status, variant = 'outlined' }) {
  const statusColors = {
    active: 'success',
    inactive: 'default',
    pending: 'warning',
    completed: 'success',
    cancelled: 'error',
    draft: 'default',
    shipped: 'info',
    delivered: 'success',
  };

  return (
    <Chip
      label={status}
      color={statusColors[status?.toLowerCase()] || 'default'}
      variant={variant}
      size="small"
    />
  );
}

/**
 * MetricDisplay
 * Display a key metric with label
 */
export function MetricDisplay({ label, value, unit = '', highlighted = false }) {
  const theme = useTheme();
  return (
    <Paper
      sx={{
        p: 2,
        backgroundColor: highlighted ? alpha(theme.palette.primary.main, 0.08) : 'background.paper',
        border: highlighted ? `1px solid ${theme.palette.primary.main}` : 'none',
        textAlign: 'center',
      }}
    >
      <Typography variant="caption" sx={{ color: 'text.secondary', display: 'block', mb: 0.5 }}>
        {label}
      </Typography>
      <Typography variant="h6" sx={{ fontWeight: 700 }}>
        {value}
        {unit && (
          <Typography component="span" variant="body2" sx={{ ml: 0.5, fontWeight: 400 }}>
            {unit}
          </Typography>
        )}
      </Typography>
    </Paper>
  );
}
