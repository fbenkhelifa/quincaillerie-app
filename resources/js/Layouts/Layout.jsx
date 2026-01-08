import { useContext, useState } from 'react';
import { Link, usePage, router } from '@inertiajs/react';
import { AppContext } from '../app';
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
    Breadcrumbs,
    Chip,
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
    ChevronRight,
    Home as HomeIcon,
} from '@mui/icons-material';
import toast from 'react-hot-toast';

const drawerWidth = 260;

export default function Layout({ children, title, breadcrumbs = [] }) {
    const { locale, setLocale, theme, setTheme, t } = useContext(AppContext);
    const { auth, flash, settings } = usePage().props;
    const muiTheme = useTheme();
    const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
    
    const [mobileOpen, setMobileOpen] = useState(false);
    const [anchorEl, setAnchorEl] = useState(null);

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleThemeToggle = () => {
        const newTheme = theme === 'light' ? 'dark' : 'light';
        setTheme(newTheme);
        router.post(route('settings.theme'), { theme: newTheme }, {
            preserveState: true,
            preserveScroll: true,
        });
    };

    const handleLocaleToggle = () => {
        const newLocale = locale === 'fr' ? 'ar' : 'fr';
        setLocale(newLocale);
        router.post(route('settings.locale'), { locale: newLocale }, {
            preserveState: true,
            preserveScroll: true,
            onSuccess: () => {
                window.location.reload();
            },
        });
    };

    const handleLogout = () => {
        router.post(route('logout'));
    };

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
        { text: t('Paramètres'), icon: <SettingsIcon />, href: route('settings.index') },
    ];

    const drawer = (
        <Box>
            <Toolbar>
                <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 'bold' }}>
                    {settings?.store_name || 'Quincaillerie'}
                </Typography>
            </Toolbar>
            <Divider />
            <List>
                {navItems.map((item) => {
                    const isActive = window.location.href === item.href;
                    return (
                        <ListItem key={item.text} disablePadding>
                            <ListItemButton
                                component={Link}
                                href={item.href}
                                selected={isActive}
                                onClick={() => isMobile && setMobileOpen(false)}
                            >
                                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItemButton>
                        </ListItem>
                    );
                })}
            </List>
        </Box>
    );

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            <AppBar
                position="fixed"
                sx={{
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    ml: { md: `${drawerWidth}px` },
                }}
            >
                <Toolbar>
                    <IconButton
                        color="inherit"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { md: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        {title || t('Tableau de bord')}
                    </Typography>

                    <Tooltip title={locale === 'fr' ? 'العربية' : 'Français'}>
                        <IconButton color="inherit" onClick={handleLocaleToggle}>
                            <TranslateIcon />
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={theme === 'light' ? t('Mode sombre') : t('Mode clair')}>
                        <IconButton color="inherit" onClick={handleThemeToggle}>
                            {theme === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
                        </IconButton>
                    </Tooltip>

                    <Tooltip title={auth?.user?.name || t('Utilisateur')}>
                        <IconButton
                            color="inherit"
                            onClick={(e) => setAnchorEl(e.currentTarget)}
                        >
                            <Avatar sx={{ width: 32, height: 32, bgcolor: 'secondary.main' }}>
                                {auth?.user?.name?.charAt(0)?.toUpperCase() || 'U'}
                            </Avatar>
                        </IconButton>
                    </Tooltip>

                    <Menu
                        anchorEl={anchorEl}
                        open={Boolean(anchorEl)}
                        onClose={() => setAnchorEl(null)}
                    >
                        <MenuItem disabled>
                            <PersonIcon sx={{ mr: 1 }} />
                            {auth?.user?.name}
                        </MenuItem>
                        <MenuItem disabled>
                            <Chip
                                label={auth?.user?.role}
                                size="small"
                                color="primary"
                                variant="outlined"
                            />
                        </MenuItem>
                        <Divider />
                        <MenuItem onClick={handleLogout}>
                            <LogoutIcon sx={{ mr: 1 }} />
                            {t('Déconnexion')}
                        </MenuItem>
                    </Menu>
                </Toolbar>
            </AppBar>

            <Box
                component="nav"
                sx={{ width: { md: drawerWidth }, flexShrink: { md: 0 } }}
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', md: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    {drawer}
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', md: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    {drawer}
                </Drawer>
            </Box>

            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    p: 3,
                    width: { md: `calc(100% - ${drawerWidth}px)` },
                    mt: '64px',
                    bgcolor: 'background.default',
                    minHeight: 'calc(100vh - 64px)',
                }}
            >
                {breadcrumbs.length > 0 && (
                    <Breadcrumbs
                        separator={<ChevronRight fontSize="small" />}
                        sx={{ mb: 2 }}
                    >
                        <Link href={route('dashboard')}>
                            <Box sx={{ display: 'flex', alignItems: 'center', color: 'text.secondary' }}>
                                <HomeIcon fontSize="small" sx={{ mr: 0.5 }} />
                                {t('Accueil')}
                            </Box>
                        </Link>
                        {breadcrumbs.map((crumb, index) => (
                            <Typography
                                key={index}
                                color={index === breadcrumbs.length - 1 ? 'text.primary' : 'text.secondary'}
                            >
                                {crumb.href ? (
                                    <Link href={crumb.href}>{crumb.label}</Link>
                                ) : (
                                    crumb.label
                                )}
                            </Typography>
                        ))}
                    </Breadcrumbs>
                )}
                
                {children}
            </Box>
        </Box>
    );
}
