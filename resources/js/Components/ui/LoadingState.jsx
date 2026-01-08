/**
 * LoadingState Component
 * ======================
 * Various loading state patterns including skeleton loaders.
 */

import { Box, Skeleton, Card, CardContent, Grid, CircularProgress, Typography, alpha, useTheme } from '@mui/material';

/**
 * TableSkeleton - Skeleton for data tables
 */
export function TableSkeleton({ rows = 5, columns = 5 }) {
  return (
    <Box sx={{ width: '100%' }}>
      {/* Header */}
      <Box
        sx={{
          display: 'flex',
          gap: 2,
          p: 2,
          bgcolor: 'grey.50',
          borderRadius: '12px 12px 0 0',
        }}
      >
        {Array.from({ length: columns }).map((_, i) => (
          <Skeleton
            key={i}
            variant="text"
            width={`${100 / columns}%`}
            height={24}
          />
        ))}
      </Box>
      
      {/* Rows */}
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <Box
          key={rowIndex}
          sx={{
            display: 'flex',
            gap: 2,
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'divider',
          }}
        >
          {Array.from({ length: columns }).map((_, colIndex) => (
            <Skeleton
              key={colIndex}
              variant="text"
              width={`${100 / columns}%`}
              height={24}
              animation="wave"
            />
          ))}
        </Box>
      ))}
    </Box>
  );
}

/**
 * CardSkeleton - Skeleton for stat cards
 */
export function CardSkeleton({ count = 4 }) {
  return (
    <Grid container spacing={3}>
      {Array.from({ length: count }).map((_, i) => (
        <Grid item xs={12} sm={6} md={3} key={i}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
                <Box sx={{ flex: 1 }}>
                  <Skeleton variant="text" width="60%" height={20} />
                  <Skeleton variant="text" width="80%" height={40} sx={{ mt: 1 }} />
                </Box>
                <Skeleton variant="circular" width={56} height={56} />
              </Box>
              <Skeleton variant="text" width="40%" height={20} />
            </CardContent>
          </Card>
        </Grid>
      ))}
    </Grid>
  );
}

/**
 * FormSkeleton - Skeleton for forms
 */
export function FormSkeleton({ fields = 6 }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
      {Array.from({ length: fields }).map((_, i) => (
        <Box key={i}>
          <Skeleton variant="text" width={120} height={20} sx={{ mb: 1 }} />
          <Skeleton variant="rounded" width="100%" height={40} />
        </Box>
      ))}
      <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
        <Skeleton variant="rounded" width={100} height={40} />
        <Skeleton variant="rounded" width={100} height={40} />
      </Box>
    </Box>
  );
}

/**
 * ListSkeleton - Skeleton for list items
 */
export function ListSkeleton({ items = 5, avatar = true }) {
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
      {Array.from({ length: items }).map((_, i) => (
        <Box key={i} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {avatar && <Skeleton variant="circular" width={40} height={40} />}
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" width="60%" height={20} />
            <Skeleton variant="text" width="40%" height={16} />
          </Box>
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
      ))}
    </Box>
  );
}

/**
 * PageSkeleton - Full page skeleton
 */
export function PageSkeleton() {
  return (
    <Box>
      {/* Header */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 4 }}>
        <Skeleton variant="text" width={200} height={40} />
        <Skeleton variant="rounded" width={140} height={40} />
      </Box>

      {/* Stats */}
      <CardSkeleton count={4} />

      {/* Content */}
      <Box sx={{ mt: 4 }}>
        <Card>
          <CardContent>
            {/* Filters */}
            <Box sx={{ display: 'flex', gap: 2, mb: 3 }}>
              <Skeleton variant="rounded" width={300} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
              <Skeleton variant="rounded" width={120} height={40} />
            </Box>
            
            {/* Table */}
            <TableSkeleton rows={8} columns={6} />
          </CardContent>
        </Card>
      </Box>
    </Box>
  );
}

/**
 * SpinnerOverlay - Full overlay with spinner
 */
export function SpinnerOverlay({ message = 'Loading...' }) {
  const theme = useTheme();
  
  return (
    <Box
      sx={{
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: alpha(theme.palette.background.paper, 0.8),
        backdropFilter: 'blur(4px)',
        zIndex: 10,
        gap: 2,
      }}
    >
      <CircularProgress size={48} thickness={4} />
      {message && (
        <Typography variant="body2" color="text.secondary" fontWeight={500}>
          {message}
        </Typography>
      )}
    </Box>
  );
}

/**
 * InlineLoader - Small inline loading indicator
 */
export function InlineLoader({ size = 20, sx = {} }) {
  return (
    <Box sx={{ display: 'inline-flex', alignItems: 'center', ...sx }}>
      <CircularProgress size={size} thickness={4} />
    </Box>
  );
}

export default {
  TableSkeleton,
  CardSkeleton,
  FormSkeleton,
  ListSkeleton,
  PageSkeleton,
  SpinnerOverlay,
  InlineLoader,
};
