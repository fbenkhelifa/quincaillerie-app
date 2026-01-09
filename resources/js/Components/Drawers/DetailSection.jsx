/**
 * DetailSection
 * =============
 * Section wrapper for drawer content
 */

import { Box, Typography, Paper, Divider } from '@mui/material';

export default function DetailSection({ title, children, action, noDivider = false }) {
  return (
    <Box sx={{ mb: 0 }}>
      {(title || action) && (
        <Box sx={{ px: 3, py: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center', bgcolor: 'background.default' }}>
          {title && (
            <Typography variant="subtitle2" fontWeight={600} color="text.primary" sx={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              {title}
            </Typography>
          )}
          {action}
        </Box>
      )}
      <Box sx={{ p: 3 }}>
        {children}
      </Box>
      {!noDivider && <Divider />}
    </Box>
  );
}
