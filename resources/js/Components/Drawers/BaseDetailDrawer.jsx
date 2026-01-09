/**
 * BaseDetailDrawer
 * ================
 * A consistent right-side drawer for detail views.
 * Supports header with actions, scrollable content, and footer.
 */

import {
  Drawer,
  Box,
  Typography,
  IconButton,
  Divider,
  Stack,
  alpha,
  useTheme,
  Slide,
} from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

export default function BaseDetailDrawer({
  open,
  onClose,
  title,
  subtitle,
  icon,
  actions,
  children,
  width = 600,
  footer,
}) {
  const theme = useTheme();

  return (
    <Drawer
      anchor="right"
      open={open}
      onClose={onClose}
      PaperProps={{
        sx: {
          width: { xs: '100%', sm: width },
          maxWidth: '100vw',
          boxShadow: theme.shadows[20],
          display: 'flex',
          flexDirection: 'column',
        },
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 3,
          backgroundColor: 'background.paper',
          borderBottom: `1px solid ${theme.palette.divider}`,
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 10,
        }}
      >
        <Box sx={{ display: 'flex', gap: 2, alignItems: 'center' }}>
          {icon && (
            <Box
              sx={{
                width: 48,
                height: 48,
                borderRadius: 1.5,
                backgroundColor: alpha(theme.palette.primary.main, 0.1),
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              {icon}
            </Box>
          )}
          <Box>
            <Typography variant="h6" fontWeight={700} sx={{ lineHeight: 1.2 }}>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                {subtitle}
              </Typography>
            )}
          </Box>
        </Box>
        <Stack direction="row" spacing={1} alignItems="center">
          {actions}
          <IconButton onClick={onClose} edge="end" aria-label="close">
            <CloseIcon />
          </IconButton>
        </Stack>
      </Box>

      {/* Content */}
      <Box sx={{ flex: 1, overflowY: 'auto', p: 0 }}>
        {children}
      </Box>

      {/* Footer */}
      {footer && (
        <Box
          sx={{
            p: 2,
            borderTop: `1px solid ${theme.palette.divider}`,
            backgroundColor: 'background.default',
            position: 'sticky',
            bottom: 0,
            zIndex: 10,
          }}
        >
          {footer}
        </Box>
      )}
    </Drawer>
  );
}
