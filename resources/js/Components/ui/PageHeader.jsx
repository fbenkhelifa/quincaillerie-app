/**
 * PageHeader Component
 * ====================
 * Consistent page header with title, breadcrumbs, and actions.
 */

import { Box, Typography, Breadcrumbs, Button, Skeleton, alpha, useTheme } from '@mui/material';
import { Link } from '@inertiajs/react';
import { ChevronRight as ChevronRightIcon, Home as HomeIcon } from '@mui/icons-material';

export default function PageHeader({
  title,
  subtitle,
  breadcrumbs = [],
  actions,
  loading = false,
  sx = {},
}) {
  const theme = useTheme();

  if (loading) {
    return (
      <Box sx={{ mb: 4, ...sx }}>
        <Skeleton variant="text" width={160} height={20} sx={{ mb: 1 }} />
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box>
            <Skeleton variant="text" width={300} height={40} />
            <Skeleton variant="text" width={200} height={24} />
          </Box>
          <Skeleton variant="rounded" width={140} height={40} />
        </Box>
      </Box>
    );
  }

  return (
    <Box sx={{ mb: 4, ...sx }}>
      {/* Breadcrumbs */}
      {breadcrumbs.length > 0 && (
        <Breadcrumbs
          separator={<ChevronRightIcon sx={{ fontSize: 16, color: 'text.disabled' }} />}
          sx={{ mb: 1.5 }}
          aria-label="breadcrumb navigation"
        >
          <Box
            component={Link}
            href={route('dashboard')}
            sx={{
              display: 'flex',
              alignItems: 'center',
              color: 'text.secondary',
              textDecoration: 'none',
              fontSize: '0.875rem',
              '&:hover': { color: 'primary.main' },
            }}
          >
            <HomeIcon sx={{ fontSize: 18, mr: 0.5 }} />
          </Box>
          
          {breadcrumbs.map((crumb, index) => {
            const isLast = index === breadcrumbs.length - 1;
            
            return isLast ? (
              <Typography
                key={index}
                variant="body2"
                color="text.primary"
                fontWeight={500}
                aria-current="page"
              >
                {crumb.label}
              </Typography>
            ) : (
              <Box
                key={index}
                component={Link}
                href={crumb.href}
                sx={{
                  color: 'text.secondary',
                  textDecoration: 'none',
                  fontSize: '0.875rem',
                  '&:hover': { color: 'primary.main' },
                }}
              >
                {crumb.label}
              </Box>
            );
          })}
        </Breadcrumbs>
      )}

      {/* Header Content */}
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: { xs: 'flex-start', sm: 'center' },
          flexDirection: { xs: 'column', sm: 'row' },
          gap: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            component="h1"
            fontWeight={700}
            color="text.primary"
            sx={{ lineHeight: 1.3 }}
          >
            {title}
          </Typography>
          
          {subtitle && (
            <Typography
              variant="body1"
              color="text.secondary"
              sx={{ mt: 0.5 }}
            >
              {subtitle}
            </Typography>
          )}
        </Box>

        {actions && (
          <Box
            sx={{
              display: 'flex',
              gap: 1.5,
              flexWrap: 'wrap',
              width: { xs: '100%', sm: 'auto' },
            }}
          >
            {actions}
          </Box>
        )}
      </Box>
    </Box>
  );
}
