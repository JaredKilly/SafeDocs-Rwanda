import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  Drawer,
  AppBar,
  Toolbar,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  IconButton,
  Typography,
  Avatar,
  Menu,
  MenuItem,
  Divider,
  useTheme,
  useMediaQuery,
  Chip,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Dashboard as DashboardIcon,
  Description as DocumentIcon,
  Folder as FolderIcon,
  Group as GroupIcon,
  Scanner as ScannerIcon,
  Menu as MenuIcon,
  ChevronLeft as ChevronLeftIcon,
  Settings as SettingsIcon,
  ExitToApp as LogoutIcon,
  Assignment as RequestIcon,
  AdminPanelSettings as AdminIcon,
  History as AuditIcon,
  Badge as HRIcon,
  AccountBalance as GovIcon,
  LocalHospital as HealthcareIcon,
  PermMedia as MediaLibraryIcon,
  Assessment as AnalyticsIcon,
} from '@mui/icons-material';
import { logout } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';
import BrandLogo from './BrandLogo';
import GlobalSearch from './GlobalSearch';
import NotificationsPopover from './NotificationsPopover';

const DRAWER_WIDTH = 260;
const DRAWER_WIDTH_COLLAPSED = 72;

interface LayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  label: string;
  icon: React.ReactNode;
  path: string;
  badge?: number;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const dispatch = useDispatch<AppDispatch>();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const { user } = useSelector((state: RootState) => state.auth);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(
    () => localStorage.getItem('sidebarCollapsed') === 'true'
  );
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const navItems: NavItem[] = [
    { label: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { label: 'Documents', icon: <DocumentIcon />, path: '/documents' },
    { label: 'Folders', icon: <FolderIcon />, path: '/folders' },
    { label: 'Scanner', icon: <ScannerIcon />, path: '/scanner' },
    { label: 'Groups', icon: <GroupIcon />, path: '/groups' },
    { label: 'Access Requests', icon: <RequestIcon />, path: '/access-requests' },
    { label: 'Audit Logs', icon: <AuditIcon />, path: '/audit-logs' },
    { label: 'Gov Documents', icon: <GovIcon />, path: '/government' },
    { label: 'Healthcare', icon: <HealthcareIcon />, path: '/healthcare' },
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [{ label: 'HR Documents', icon: <HRIcon />, path: '/hr' }]
      : []),
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [{ label: 'Media Library', icon: <MediaLibraryIcon />, path: '/media' }]
      : []),
    ...(user?.role === 'admin' || user?.role === 'manager'
      ? [{ label: 'Analytics', icon: <AnalyticsIcon />, path: '/analytics' }]
      : []),
    ...(user?.role === 'admin'
      ? [{ label: 'Admin Panel', icon: <AdminIcon />, path: '/admin' }]
      : []),
  ];

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleSidebarToggle = () => {
    const next = !sidebarCollapsed;
    setSidebarCollapsed(next);
    localStorage.setItem('sidebarCollapsed', String(next));
  };

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleProfileMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
    handleProfileMenuClose();
  };

  const handleNavigation = (path: string) => {
    navigate(path);
    if (isMobile) {
      setMobileOpen(false);
    }
  };

  const isActive = (path: string) => location.pathname === path;

  const drawerContent = (
    <Box
      sx={{
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        bgcolor: '#FFFFFF',
        borderRight: '1px solid',
        borderColor: 'divider',
      }}
    >
      {/* Logo Section */}
      <Box
        sx={{
          p: 2.5,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          borderBottom: '1px solid',
          borderColor: 'divider',
          minHeight: 72,
          bgcolor: '#FFFFFF',
        }}
      >
        <BrandLogo size={36} />
        {(!sidebarCollapsed || isMobile) && (
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              SafeDocs
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Rwanda
            </Typography>
          </Box>
        )}
        {!isMobile && (
          <IconButton
            size="small"
            onClick={handleSidebarToggle}
            sx={{
              bgcolor: 'action.hover',
              '&:hover': { bgcolor: 'action.selected' },
            }}
          >
            {sidebarCollapsed ? <MenuIcon fontSize="small" /> : <ChevronLeftIcon fontSize="small" />}
          </IconButton>
        )}
      </Box>

      {/* Navigation Items */}
      <List sx={{ flexGrow: 1, px: 1.5, py: 2 }}>
        {navItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Tooltip
              key={item.path}
              title={sidebarCollapsed && !isMobile ? item.label : ''}
              placement="right"
            >
              <ListItem disablePadding sx={{ mb: 0.5 }}>
                <ListItemButton
                  onClick={() => handleNavigation(item.path)}
                  sx={{
                    borderRadius: 2,
                    py: 1.5,
                    px: 2,
                    bgcolor: active ? 'primary.main' : 'transparent',
                    color: active ? 'primary.contrastText' : 'text.primary',
                    '&:hover': {
                      bgcolor: active ? 'primary.dark' : 'action.hover',
                    },
                    transition: 'all 0.2s',
                    justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
                  }}
                >
                  <ListItemIcon
                    sx={{
                      color: active ? 'primary.contrastText' : 'text.secondary',
                      minWidth: sidebarCollapsed && !isMobile ? 'auto' : 40,
                    }}
                  >
                    {item.icon}
                  </ListItemIcon>
                  {(!sidebarCollapsed || isMobile) && (
                    <>
                      <ListItemText
                        primary={item.label}
                        primaryTypographyProps={{
                          fontWeight: active ? 600 : 500,
                          fontSize: '0.95rem',
                        }}
                      />
                      {item.badge && (
                        <Chip
                          label={item.badge}
                          size="small"
                          sx={{
                            height: 20,
                            minWidth: 20,
                            bgcolor: active ? 'rgba(255,255,255,0.2)' : 'error.main',
                            color: 'white',
                            fontSize: '0.75rem',
                          }}
                        />
                      )}
                    </>
                  )}
                </ListItemButton>
              </ListItem>
            </Tooltip>
          );
        })}
      </List>

      <Divider />

      {/* User Profile Section */}
      <Box sx={{ p: 2 }}>
        <ListItemButton
          onClick={handleProfileMenuOpen}
          sx={{
            borderRadius: 2,
            py: 1.5,
            px: 1.5,
            bgcolor: 'action.hover',
            '&:hover': {
              bgcolor: 'action.selected',
            },
            justifyContent: sidebarCollapsed && !isMobile ? 'center' : 'flex-start',
          }}
        >
          <Avatar
            sx={{
              width: 36,
              height: 36,
              bgcolor: 'primary.main',
              fontSize: '1rem',
              fontWeight: 700,
            }}
          >
            {user?.fullName?.charAt(0) || user?.username?.charAt(0) || 'U'}
          </Avatar>
          {(!sidebarCollapsed || isMobile) && (
            <Box sx={{ ml: 1.5, flexGrow: 1, overflow: 'hidden' }}>
              <Typography variant="body2" sx={{ fontWeight: 600, lineHeight: 1.2 }} noWrap>
                {user?.fullName || user?.username}
              </Typography>
              <Typography variant="caption" color="text.secondary" noWrap>
                {user?.organizationName || user?.role}
              </Typography>
            </Box>
          )}
        </ListItemButton>
      </Box>
    </Box>
  );

  const drawerWidth = sidebarCollapsed && !isMobile ? DRAWER_WIDTH_COLLAPSED : DRAWER_WIDTH;

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* App Bar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          left: { md: `${drawerWidth}px` },
          width: { xs: '100%', md: `calc(100% - ${drawerWidth}px)` },
          bgcolor: 'background.paper',
          borderBottom: '1px solid',
          borderColor: 'divider',
          color: 'text.primary',
          transition: theme.transitions.create(['left', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ justifyContent: 'space-between', minHeight: { xs: 56, sm: 64 }, py: 0 }}>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 1, display: { md: 'none' } }}
          >
            <MenuIcon />
          </IconButton>

          {/* Page title shown on mobile only */}
          <Typography
            variant="subtitle1"
            sx={{
              fontWeight: 700,
              display: { xs: 'block', md: 'none' },
              flexGrow: 1,
            }}
          >
            {navItems.find((item) => item.path === location.pathname)?.label ?? 'SafeDocs'}
          </Typography>

          <Box sx={{ flexGrow: 1, display: { xs: 'none', md: 'block' } }} />

          <Stack direction="row" spacing={1} alignItems="center">
            <GlobalSearch />
            <NotificationsPopover />
            <Tooltip title="Settings">
              <IconButton color="inherit" onClick={() => navigate('/settings')}>
                <SettingsIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Toolbar>
      </AppBar>

      {/* Sidebar Navigation - Mobile */}
      <Drawer
        variant="temporary"
        open={mobileOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', md: 'none' },
          '& .MuiDrawer-paper': {
            width: DRAWER_WIDTH,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            zIndex: 1300,
          },
        }}
      >
        {drawerContent}
      </Drawer>

      {/* Sidebar Navigation - Desktop */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', md: 'block' },
          '& .MuiDrawer-paper': {
            width: drawerWidth,
            boxSizing: 'border-box',
            bgcolor: '#FFFFFF',
            transition: theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: theme.transitions.duration.enteringScreen,
            }),
            overflowX: 'hidden',
            zIndex: 1200,
          },
        }}
        open
      >
        {drawerContent}
      </Drawer>

      {/* Profile Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleProfileMenuClose}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
        transformOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        PaperProps={{
          sx: { minWidth: 200, mt: -1 },
        }}
      >
        <Box sx={{ px: 2, py: 1.5 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            {user?.fullName}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            {user?.email}
          </Typography>
        </Box>
        <Divider />
        <MenuItem onClick={() => { handleProfileMenuClose(); navigate('/settings'); }}>
          <ListItemIcon>
            <SettingsIcon fontSize="small" />
          </ListItemIcon>
          Settings
        </MenuItem>
        <MenuItem onClick={handleLogout}>
          <ListItemIcon>
            <LogoutIcon fontSize="small" />
          </ListItemIcon>
          Logout
        </MenuItem>
      </Menu>

      {/* Main Content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          ml: { md: `${drawerWidth}px` },
          minHeight: '100vh',
          bgcolor: 'background.default',
          transition: theme.transitions.create(['margin'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.leavingScreen,
          }),
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 56, sm: 64 } }} /> {/* Spacer for AppBar */}
        <Box sx={{ p: { xs: 2, sm: 2.5, md: 3 }, maxWidth: '100%', overflow: 'hidden' }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default Layout;
