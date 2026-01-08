/**
 * AppShell Layout Component
 * =========================
 * Modern SaaS dashboard layout with collapsible sidebar, topbar, and responsive design.
 */

import { useContext, useState, useCallback } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { AppContext } from '../app';
import { layout } from '../theme/tokens';
import {
    AppBar,
    Box,
    Drawer,
    IconButton,
    List,
    ListItem,
    ListItemButton,
    ListItemIcon,
    ListItemText,
    Toolbar,
    Typography,
    Menu,
    MenuItem,
    Divider,
    Avatar,
    Tooltip,
    useMediaQuery,
    useTheme,
    Badge,
    InputBase,
    alpha,
    Collapse,
    Fade,
} from '@mui/material';
import {
    Menu as MenuIcon,
    Dashboard as DashboardIcon,
    Inventory as InventoryIcon,
    People as PeopleIcon,
    Receipt as ReceiptIcon,
    Settings as SettingsIcon,
    Brightness4 as DarkModeIcon,
    Brightness7 as LightModeIcon,
    Translate as TranslateIcon,
    Logout as LogoutIcon,
    Person as PersonIcon,
    Category as CategoryIcon,
    LocalShipping as SupplierIcon,
    Search as SearchIcon,
    Notifications as NotificationsIcon,
    ChevronLeft as ChevronLeftIcon,
    ChevronRight as ChevronRightIcon,
    KeyboardArrowDown as ExpandMoreIcon,
    KeyboardArrowUp as ExpandLessIcon,
    Add as AddIcon,
    Store as StoreIcon,
    ShoppingCart as PurchasesIcon,
    TrendingUp as ReplenishmentIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';
import { PageHeader } from '../Components/ui';

const DRAWER_WIDTH = layout.sidebarWidth;
const DRAWER_COLLAPSED_WIDTH = layout.sidebarCollapsedWidth;

// Quick action menu for the topbar
function QuickActionMenu({ t }) {
    const [anchorEl, setAnchorEl] = useState(null);

    const actions = [
        { label: t('Nouveau produit'), icon: <InventoryIcon />, href: route('products.create') },
        { label: t('Nouvelle facture'), icon: <ReceiptIcon />, href: route('bills.create') },
        { label: t('Nouveau fournisseur'), icon: <SupplierIcon />, href: route('suppliers.index') },
    ];

    return (
        <>
            <Tooltip title={t('Actions rapides')}>
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{
                        bgcolor: 'primary.main',
                        color: 'white',
                        '&:hover': { bgcolor: 'primary.dark' },
                    }}
                    aria-label={t('Quick actions')}
                >
                    <AddIcon />
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
                {actions.map((action) => (
                    <MenuItem
                        key={action.label}
                        component={Link}
                        href={action.href}
                        onClick={() => setAnchorEl(null)}
                    >
                        <ListItemIcon>{action.icon}</ListItemIcon>
                        <ListItemText>{action.label}</ListItemText>
                    </MenuItem>
                ))}
            </Menu>
        </>
    );
}

// Global search in topbar
function GlobalSearch({ t }) {
    const theme = useTheme();
    const [focused, setFocused] = useState(false);
    const [query, setQuery] = useState('');

    const handleSearch = (e) => {
        if (e.key === 'Enter' && query.trim()) {
            router.get(route('products.index'), { search: query.trim() });
        }
    };

    return (
        <Box
            sx={{
                position: 'relative',
                borderRadius: 2,
                bgcolor: focused 
                    ? alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.15 : 0.9)
                    : alpha(theme.palette.common.white, theme.palette.mode === 'dark' ? 0.08 : 0.6),
                border: `1px solid ${focused ? theme.palette.primary.main : 'transparent'}`,
                transition: 'all 0.2s ease-in-out',
                width: { xs: 200, sm: 300, md: 400 },
                display: { xs: 'none', sm: 'flex' },
            }}
        >
            <Box sx={{ p: 1, display: 'flex', alignItems: 'center' }}>
                <SearchIcon sx={{ color: 'text.secondary', fontSize: 20 }} />
            </Box>
            <InputBase
                placeholder={t('Rechercher produits, factures...')}
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => setFocused(true)}
                onBlur={() => setFocused(false)}
                onKeyDown={handleSearch}
                sx={{
                    flex: 1,
                    fontSize: '0.875rem',
                    '& input': {
                        py: 1,
                        pr: 1,
                    },
                }}
                inputProps={{ 'aria-label': t('Global search') }}
            />
            <Box
                sx={{
                    display: { xs: 'none', md: 'flex' },
                    alignItems: 'center',
                    pr: 1,
                }}
            >
                <Typography
                    variant="caption"
                    sx={{
                        px: 1,
                        py: 0.25,
                        bgcolor: alpha(theme.palette.text.secondary, 0.1),
                        borderRadius: 1,
                        color: 'text.secondary',
                        fontSize: '0.7rem',
                    }}
                >
                    ⌘K
                </Typography>
            </Box>
        </Box>
    );
}

// User profile menu
function UserMenu({ auth, t, onLogout }) {
    const [anchorEl, setAnchorEl] = useState(null);
    const theme = useTheme();

    return (
        <>
            <Tooltip title={auth?.user?.name || t('Profil')}>
                <IconButton
                    onClick={(e) => setAnchorEl(e.currentTarget)}
                    sx={{ p: 0.5 }}
                    aria-label={t('User menu')}
                >
                    <Avatar
                        sx={{
                            width: 36,
                            height: 36,
                            bgcolor: 'primary.main',
                            fontSize: '0.875rem',
                            fontWeight: 600,
                        }}
                    >
                        {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                    </Avatar>
                </IconButton>
            </Tooltip>
            <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={() => setAnchorEl(null)}
                transformOrigin={{ horizontal: 'right', vertical: 'top' }}
                anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
                PaperProps={{ sx: { minWidth: 200, mt: 1 } }}
            >
                <Box sx={{ px: 2, py: 1.5 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                        {auth?.user?.name}
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                        {auth?.user?.email}
                    </Typography>
                    <Box sx={{ mt: 1 }}>
                        <Typography
                            variant="caption"
                            sx={{
                                px: 1,
                                py: 0.25,
                                bgcolor: alpha(theme.palette.primary.main, 0.1),
                                color: 'primary.main',
                                borderRadius: 1,
                                fontWeight: 500,
                                textTransform: 'capitalize',
                            }}
                        >
                            {auth?.user?.role}
                        </Typography>
                    </Box>
                </Box>
                <Divider />
                <MenuItem component={Link} href={route('settings.index')} onClick={() => setAnchorEl(null)}>
                    <ListItemIcon><SettingsIcon fontSize="small" /></ListItemIcon>
                    <ListItemText>{t('Paramètres')}</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={() => { setAnchorEl(null); onLogout(); }} sx={{ color: 'error.main' }}>
                    <ListItemIcon><LogoutIcon fontSize="small" sx={{ color: 'error.main' }} /></ListItemIcon>
                    <ListItemText>{t('Déconnexion')}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}

// Sidebar navigation item
function NavItem({ item, collapsed, isActive, onClick }) {
    const theme = useTheme();
    
    return (
        <ListItem disablePadding sx={{ display: 'block', px: collapsed ? 1 : 1.5 }}>
            <Tooltip title={collapsed ? item.text : ''} placement="right" arrow>
                <ListItemButton
                    component={Link}
                    href={item.href}
                    selected={isActive}
                    onClick={onClick}
                    sx={{
                        minHeight: 48,
                        justifyContent: collapsed ? 'center' : 'flex-start',
                        px: collapsed ? 2 : 2.5,
                        borderRadius: 2,
                        mb: 0.5,
                    }}
                >
                    <ListItemIcon
                        sx={{
                            minWidth: 0,
                            mr: collapsed ? 0 : 2,
                            justifyContent: 'center',
                        }}
                    >
                        {item.icon}
                    </ListItemIcon>
                    <ListItemText
                        primary={item.text}
                        sx={{
                            opacity: collapsed ? 0 : 1,
                            transition: 'opacity 0.2s',
                        }}
                        primaryTypographyProps={{
                            fontSize: '0.875rem',
                            fontWeight: isActive ? 600 : 400,
                        }}
                    />
                </ListItemButton>
            </Tooltip>
        </ListItem>
    );
}

// Main Layout Component
export default function Layout({ children, title, breadcrumbs = [] }) {
    const { locale, setLocale, theme, setTheme, t, sidebarCollapsed, setSidebarCollapsed } = useContext(AppContext);
    const { auth, flash, settings } = usePage().props;
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('lg'));
    
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleDrawerToggle = useCallback(() => {
        if (isMobile) {
            setMobileOpen(!mobileOpen);
        } else {
            setSidebarCollapsed(!sidebarCollapsed);
        }
    }, [isMobile, mobileOpen, sidebarCollapsed, setSidebarCollapsed]);

    const handleThemeToggle = useCallback(() => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        router.post(route('settings.theme'), { theme: newTheme }, {
            preserveState: true,
            preserveScroll: true,
        });
    }, [theme, setTheme]);

    const handleLocaleToggle = useCallback(() => {
        const newLocale = locale === 'fr' ? 'ar' : 'fr';
        setLocale(newLocale);
        router.post(route('settings.locale'), { locale: newLocale }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => window.location.reload(),
        });
    }, [locale, setLocale]);

    const handleLogout = useCallback(() => {
        router.post(route('logout'));
    }, []);

    // Show flash messages
    if (flash?.success) {
        toast.success(flash.success);
    }
    if (flash?.error) {
        toast.error(flash.error);
    }

    const navItems = [
        { text: t('Tableau de bord'), icon: <DashboardIcon />, href: route('dashboard') },
        { text: t('Produits'), icon: <InventoryIcon />, href: route('products.index') },
        { text: t('Catégories'), icon: <CategoryIcon />, href: route('categories.index') },
        { text: t('Fournisseurs'), icon: <SupplierIcon />, href: route('suppliers.index') },
        { text: t('Employés'), icon: <PeopleIcon />, href: route('workers.index') },
        { text: t('Factures'), icon: <ReceiptIcon />, href: route('bills.index') },
        { text: t('Achats'), icon: <PurchasesIcon />, href: route('purchases.index') },
        { text: t('Réappro.'), icon: <ReplenishmentIcon />, href: route('replenishment.index') },
    ];

    const collapsed = !isMobile && sidebarCollapsed;
    const drawerWidth = collapsed ? DRAWER_COLLAPSED_WIDTH : DRAWER_WIDTH;

    const drawer = (
        <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
            {/* Logo / Brand */}
            <Toolbar
                sx={{
                    px: collapsed ? 2 : 3,
                    justifyContent: collapsed ? 'center' : 'flex-start',
                    minHeight: '64px !important',
                }}
            >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                    <Box
                        sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 2,
                            bgcolor: 'primary.main',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                        }}
                    >
                        <StoreIcon sx={{ color: 'white', fontSize: 20 }} />
                    </Box>
                    <Fade in={!collapsed}>
                        <Typography
                            variant="h6"
                            noWrap
                            sx={{
                                fontWeight: 700,
                                fontSize: '1rem',
                                background: `linear-gradient(135deg, ${muiTheme.palette.primary.main} 0%, ${muiTheme.palette.secondary.main} 100%)`,
                                backgroundClip: 'text',
                                WebkitBackgroundClip: 'text',
                                WebkitTextFillColor: 'transparent',
                                display: collapsed ? 'none' : 'block',
                            }}
                        >
                            {settings?.store_name || 'Quincaillerie'}
                        </Typography>
                    </Fade>
                </Box>
            </Toolbar>
            
            <Divider />
            
            {/* Navigation */}
            <Box sx={{ flex: 1, overflow: 'auto', py: 1 }}>
                <List>
                    {navItems.map((item) => {
                        const isActive = window.location.href === item.href || 
                            window.location.pathname.startsWith(new URL(item.href).pathname);
                        return (
                            <NavItem
                                key={item.text}
                                item={item}
                                collapsed={collapsed}
                                isActive={isActive}
                                onClick={() => isMobile && setMobileOpen(false)}
                            />
                        );
                    })}
                </List>
            </Box>

            <Divider />

            {/* Settings at bottom */}
            <List sx={{ pb: 1 }}>
                <NavItem
                    item={{ text: t('Paramètres'), icon: <SettingsIcon />, href: route('settings.index') }}
                    collapsed={collapsed}
                    isActive={window.location.pathname.includes('/settings')}
                    onClick={() => isMobile && setMobileOpen(false)}
                />
            </List>

            {/* Collapse toggle (desktop only) */}
            {!isMobile && (
                <Box sx={{ p: 1.5, borderTop: 1, borderColor: 'divider' }}>
                    <IconButton
                        onClick={() => setSidebarCollapsed(!collapsed)}
                        sx={{
                            width: '100%',
                            borderRadius: 2,
                            bgcolor: 'action.hover',
                        }}
                        aria-label={collapsed ? t('Expand sidebar') : t('Collapse sidebar')}
                    >
                        {collapsed ? <ChevronRightIcon /> : <ChevronLeftIcon />}
                    </IconButton>
                </Box>
            )}
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* AppBar */}
            <AppBar
                position="fixed"
                elevation={0}
                sx={{
                    width: { lg: `calc(100% - ${drawerWidth}px)` },
                    ml: { lg: `${drawerWidth}px` },
                    transition: muiTheme.transitions.create(['width', 'margin'], {
                        easing: muiTheme.transitions.easing.sharp,
                        duration: muiTheme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Toolbar sx={{ gap: 2 }}>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ display: { lg: 'none' } }}
                        aria-label={t('Toggle navigation menu')}
                    >
                        <MenuIcon />
                    </IconButton>

                    <GlobalSearch t={t} />
                    
                    <Box sx={{ flexGrow: 1 }} />

                    {/* Actions */}
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <QuickActionMenu t={t} />

                        <Tooltip title={locale === 'fr' ? 'العربية' : 'Français'}>
                            <IconButton onClick={handleLocaleToggle} aria-label={t('Change language')}>
                                <TranslateIcon />
                            </IconButton>
                        </Tooltip>

                        <Tooltip title={theme === 'light' ? t('Mode sombre') : t('Mode clair')}>
                            <IconButton onClick={handleThemeToggle} aria-label={t('Toggle theme')}>
                                {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                            </IconButton>
                        </Tooltip>

                        <UserMenu auth={auth} t={t} onLogout={handleLogout} />
                    </Box>
                </Toolbar>
            </AppBar>

            {/* Sidebar */}
            <Box
                component="nav"
                sx={{
                    width: { lg: drawerWidth },
                    flexShrink: { lg: 0 },
                    transition: muiTheme.transitions.create('width', {
                        easing: muiTheme.transitions.easing.sharp,
                        duration: muiTheme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                {/* Mobile drawer */}
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={() => setMobileOpen(false)}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', lg: 'none' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: DRAWER_WIDTH,
                        },
                    }}
                >
                    {drawer}
                </Drawer>
                
                {/* Desktop drawer */}
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', lg: 'block' },
                        '& .MuiDrawer-paper': {
                            boxSizing: 'border-box',
                            width: drawerWidth,
                            transition: muiTheme.transitions.create('width', {
                                easing: muiTheme.transitions.easing.sharp,
                                duration: muiTheme.transitions.duration.leavingScreen,
                            }),
                            overflowX: 'hidden',
                        },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: { xs: 2, sm: 3 },
                    width: { lg: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px',
                    minHeight: 'calc(100vh - 64px)',
                    bgcolor: 'background.default',
                    transition: muiTheme.transitions.create(['width', 'margin'], {
                        easing: muiTheme.transitions.easing.sharp,
                        duration: muiTheme.transitions.duration.leavingScreen,
                    }),
                }}
            >
                <Box sx={{ maxWidth: layout.contentMaxWidth, mx: 'auto' }}>
                    {/* Page Header with breadcrumbs */}
                    {(title || breadcrumbs.length > 0) && (
                        <PageHeader
                            title={title}
                            breadcrumbs={breadcrumbs}
                        />
                    )}
                    
                    {children}
                </Box>
            </Box>
        </Box>
    );
}
