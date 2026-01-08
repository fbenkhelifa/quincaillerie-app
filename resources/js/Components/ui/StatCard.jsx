/**
 * StatCard Component
 * ==================
 * Premium KPI card with optional sparkline, trend indicators, and subtle animations.
 */

import { Box, Card, CardContent, Typography, Skeleton, alpha, useTheme } from '@mui/material';
import { TrendingUp, TrendingDown, TrendingFlat } from '@mui/icons-material';

/**
 * MiniSparkline - Simple SVG sparkline chart
 */
function MiniSparkline({ data = [], color = 'primary', height = 32 }) {
  const theme = useTheme();
  const chartColor = theme.palette[color]?.main || color;
  
  if (!data || data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const width = 80;
  
  const points = data.map((value, index) => {
    const x = (index / (data.length - 1)) * width;
    const y = height - ((value - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  const areaPoints = `0,${height} ${points} ${width},${height}`;

  return (
    <svg width={width} height={height} viewBox={`0 0 ${width} ${height}`}>
      <defs>
        <linearGradient id={`gradient-${color}`} x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor={chartColor} stopOpacity="0.3" />
          <stop offset="100%" stopColor={chartColor} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polygon
        points={areaPoints}
        fill={`url(#gradient-${color})`}
      />
      <polyline
        points={points}
        fill="none"
        stroke={chartColor}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

/**
 * TrendBadge - Shows percentage change with icon
 */
function TrendBadge({ value, showIcon = true }) {
  const theme = useTheme();
  
  if (value === null || value === undefined) return null;

  const isPositive = value > 0;
  const isNeutral = value === 0;
  const Icon = isNeutral ? TrendingFlat : (isPositive ? TrendingUp : TrendingDown);
  const color = isNeutral ? 'text.secondary' : (isPositive ? 'success.main' : 'error.main');
  const bgColor = isNeutral 
    ? alpha(theme.palette.grey[500], 0.1)
    : (isPositive 
      ? alpha(theme.palette.success.main, 0.1) 
      : alpha(theme.palette.error.main, 0.1));

  return (
    <Box
      sx={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 0.5,
        px: 1,
        py: 0.5,
        borderRadius: 1,
        backgroundColor: bgColor,
      }}
    >
      {showIcon && <Icon sx={{ fontSize: 16, color }} />}
      <Typography variant="caption" fontWeight={600} sx={{ color }}>
        {isPositive ? '+' : ''}{value}%
      </Typography>
    </Box>
  );
}

/**
 * StatCard - Main component
 */
export default function StatCard({
  title,
  value,
  subtitle,
  icon,
  color = 'primary',
  trend,
  sparklineData,
  loading = false,
  onClick,
  sx = {},
}) {
  const theme = useTheme();
  const colorValue = theme.palette[color]?.main || color;
  const lightColor = theme.palette[color]?.light || color;

  if (loading) {
    return (
      <Card sx={{ height: '100%', ...sx }}>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Skeleton variant="text" width={100} height={20} />
            <Skeleton variant="circular" width={48} height={48} />
          </Box>
          <Skeleton variant="text" width={140} height={40} />
          <Skeleton variant="text" width={80} height={16} sx={{ mt: 1 }} />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card
      sx={{
        height: '100%',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease-in-out',
        '&:hover': onClick ? {
          transform: 'translateY(-2px)',
          boxShadow: theme.shadows[8],
        } : {},
        ...sx,
      }}
      onClick={onClick}
    >
      <CardContent sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
          <Box sx={{ flex: 1 }}>
            <Typography
              variant="body2"
              color="text.secondary"
              fontWeight={500}
              sx={{ mb: 0.5, textTransform: 'uppercase', letterSpacing: '0.05em', fontSize: '0.75rem' }}
            >
              {title}
            </Typography>
            
            <Typography
              variant="h4"
              fontWeight={700}
              sx={{
                color: 'text.primary',
                lineHeight: 1.2,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' },
              }}
            >
              {value}
            </Typography>
          </Box>

          {icon && (
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: alpha(colorValue, 0.1),
                color: colorValue,
                flexShrink: 0,
              }}
            >
              {icon}
            </Box>
          )}
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
            {trend !== undefined && <TrendBadge value={trend} />}
            {subtitle && (
              <Typography variant="caption" color="text.secondary">
                {subtitle}
              </Typography>
            )}
          </Box>

          {sparklineData && sparklineData.length > 0 && (
            <MiniSparkline data={sparklineData} color={color} />
          )}
        </Box>
      </CardContent>
    </Card>
  );
}

export { MiniSparkline, TrendBadge };
