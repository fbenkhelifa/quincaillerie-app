/**
 * MetricDisplay
 * =============
 * Display a metric with label and optional trend
 */

import { Box, Typography } from '@mui/material';
import { TrendingUp, TrendingDown, Remove } from '@mui/icons-material';

export default function MetricDisplay({ label, value, trend, trendValue, subtitle }) {
  return (
    <Box>
      <Typography variant="caption" color="text.secondary" display="block" gutterBottom>
        {label}
      </Typography>
      <Typography variant="h5" fontWeight={700} color="text.primary" sx={{ lineHeight: 1 }}>
        {value}
      </Typography>
      
      {(trend || subtitle) && (
        <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 0.5 }}>
          {trend === 'up' && <TrendingUp fontSize="small" color="success" sx={{ width: 16, height: 16 }} />}
          {trend === 'down' && <TrendingDown fontSize="small" color="error" sx={{ width: 16, height: 16 }} />}
          {trend === 'neutral' && <Remove fontSize="small" color="text.secondary" sx={{ width: 16, height: 16 }} />}
          
          {trendValue && (
            <Typography variant="caption" fontWeight={600} color={trend === 'up' ? 'success.main' : trend === 'down' ? 'error.main' : 'text.secondary'}>
              {trendValue}
            </Typography>
          )}
        </Box>
      )}
    </Box>
  );
}
