/**
 * DetailRow
 * =========
 * Key-value row for displaying metadata
 */

import { Box, Typography } from '@mui/material';

export default function DetailRow({ label, value, children }) {
  return (
    <Box sx={{ display: 'flex', justifyContent: 'space-between', py: 1.5, borderBottom: '1px solid', borderColor: 'divider', '&:last-child': { borderBottom: 0 } }}>
      <Typography variant="body2" color="text.secondary" sx={{ flex: 1 }}>
        {label}
      </Typography>
      <Box sx={{ flex: 1.5, textAlign: 'right', display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
        {children || (
          <Typography variant="body2" fontWeight={500} color="text.primary">
            {value || '-'}
          </Typography>
        )}
      </Box>
    </Box>
  );
}
