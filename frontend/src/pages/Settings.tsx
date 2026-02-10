import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Stack,
  Divider,
  Avatar,
  Chip,
  Alert,
  InputAdornment,
  IconButton,
  Switch,
  FormControlLabel,
} from '@mui/material';
import {
  Person as PersonIcon,
  Lock as LockIcon,
  Notifications as NotificationsIcon,
  Visibility,
  VisibilityOff,
  Save as SaveIcon,
} from '@mui/icons-material';
import { RootState, AppDispatch } from '../store';
import { fetchProfile } from '../store/authSlice';
import apiService from '../services/api';
import Layout from '../components/Layout';
import PageHeader from '../components/PageHeader';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

const TabPanel: React.FC<TabPanelProps> = ({ children, value, index }) => (
  <Box role="tabpanel" hidden={value !== index} sx={{ pt: 3 }}>
    {value === index && children}
  </Box>
);

const Settings: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { user, isAuthenticated } = useSelector((state: RootState) => state.auth);

  const [tab, setTab] = useState(0);

  // Profile tab state
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
  const [profileError, setProfileError] = useState<string | null>(null);

  // Security tab state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [securityLoading, setSecurityLoading] = useState(false);
  const [securitySuccess, setSecuritySuccess] = useState<string | null>(null);
  const [securityError, setSecurityError] = useState<string | null>(null);

  // Preferences tab state
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [accessRequestAlerts, setAccessRequestAlerts] = useState(true);
  const [documentShareAlerts, setDocumentShareAlerts] = useState(true);
  const [weeklyDigest, setWeeklyDigest] = useState(false);

  useEffect(() => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    if (user) {
      setFullName(user.fullName || '');
      setEmail(user.email || '');
    }
  }, [isAuthenticated, navigate, user]);

  const handleProfileSave = async () => {
    setProfileLoading(true);
    setProfileSuccess(null);
    setProfileError(null);
    try {
      await apiService.updateProfile({ fullName, email });
      await dispatch(fetchProfile());
      setProfileSuccess('Profile updated successfully.');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to update profile.';
      setProfileError(msg);
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordChange = async () => {
    setSecurityError(null);
    setSecuritySuccess(null);

    if (newPassword !== confirmPassword) {
      setSecurityError('New passwords do not match.');
      return;
    }
    if (newPassword.length < 6) {
      setSecurityError('New password must be at least 6 characters.');
      return;
    }

    setSecurityLoading(true);
    try {
      await apiService.changePassword({ currentPassword, newPassword });
      setSecuritySuccess('Password changed successfully. Please log in again with your new password.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      const msg = err?.response?.data?.error || 'Failed to change password.';
      setSecurityError(msg);
    } finally {
      setSecurityLoading(false);
    }
  };

  const avatarInitials = user?.fullName
    ? user.fullName.split(' ').map((n) => n[0]).join('').toUpperCase().slice(0, 2)
    : user?.username?.slice(0, 2).toUpperCase() || '??';

  const roleColor: Record<string, 'default' | 'primary' | 'warning'> = {
    admin: 'warning',
    manager: 'primary',
    user: 'default',
  };

  return (
    <Layout>
      <PageHeader
        title="Settings"
        subtitle="Manage your account, security, and notification preferences"
        breadcrumbs={[
          { label: 'Home', path: '/dashboard' },
          { label: 'Settings' },
        ]}
      />

      <Paper sx={{ p: 3, mb: 3 }}>
        <Stack direction="row" spacing={2} alignItems="center">
          <Avatar sx={{ width: 64, height: 64, bgcolor: 'primary.main', fontSize: '1.4rem', fontWeight: 700 }}>
            {avatarInitials}
          </Avatar>
          <Box>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {user?.fullName || user?.username}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              @{user?.username} · {user?.email}
            </Typography>
            <Chip
              label={user?.role}
              size="small"
              color={roleColor[user?.role || 'user']}
              sx={{ mt: 0.5, textTransform: 'capitalize' }}
            />
          </Box>
        </Stack>
      </Paper>

      <Paper sx={{ p: 3 }}>
        <Tabs value={tab} onChange={(_e, v) => setTab(v)}>
          <Tab icon={<PersonIcon />} iconPosition="start" label="Profile" />
          <Tab icon={<LockIcon />} iconPosition="start" label="Security" />
          <Tab icon={<NotificationsIcon />} iconPosition="start" label="Notifications" />
        </Tabs>

        {/* Profile Tab */}
        <TabPanel value={tab} index={0}>
          <Stack spacing={3} sx={{ maxWidth: 480 }}>
            {profileSuccess && <Alert severity="success" onClose={() => setProfileSuccess(null)}>{profileSuccess}</Alert>}
            {profileError && <Alert severity="error" onClose={() => setProfileError(null)}>{profileError}</Alert>}

            <TextField
              label="Full Name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              fullWidth
              helperText="Your display name across the platform"
            />
            <TextField
              label="Email Address"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              fullWidth
              helperText="Used for notifications and account recovery"
            />

            <Divider />

            <Stack spacing={1}>
              <Typography variant="caption" color="text.secondary" sx={{ textTransform: 'uppercase', letterSpacing: 1 }}>
                Read-only fields
              </Typography>
              <TextField
                label="Username"
                value={user?.username || ''}
                fullWidth
                disabled
                helperText="Username cannot be changed"
              />
              <TextField
                label="Role"
                value={user?.role || ''}
                fullWidth
                disabled
                helperText="Roles are assigned by administrators"
                sx={{ textTransform: 'capitalize' }}
              />
            </Stack>

            <Box>
              <Button
                variant="contained"
                startIcon={<SaveIcon />}
                onClick={handleProfileSave}
                disabled={profileLoading}
              >
                {profileLoading ? 'Saving…' : 'Save Changes'}
              </Button>
            </Box>
          </Stack>
        </TabPanel>

        {/* Security Tab */}
        <TabPanel value={tab} index={1}>
          <Stack spacing={3} sx={{ maxWidth: 480 }}>
            {securitySuccess && <Alert severity="success" onClose={() => setSecuritySuccess(null)}>{securitySuccess}</Alert>}
            {securityError && <Alert severity="error" onClose={() => setSecurityError(null)}>{securityError}</Alert>}

            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Change Password
            </Typography>

            <TextField
              label="Current Password"
              type={showCurrent ? 'text' : 'password'}
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              fullWidth
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowCurrent((v) => !v)}>
                      {showCurrent ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="New Password"
              type={showNew ? 'text' : 'password'}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              fullWidth
              helperText="Minimum 6 characters"
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowNew((v) => !v)}>
                      {showNew ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              label="Confirm New Password"
              type={showConfirm ? 'text' : 'password'}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              fullWidth
              error={confirmPassword.length > 0 && confirmPassword !== newPassword}
              helperText={
                confirmPassword.length > 0 && confirmPassword !== newPassword
                  ? 'Passwords do not match'
                  : ''
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setShowConfirm((v) => !v)}>
                      {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />

            <Box>
              <Button
                variant="contained"
                color="warning"
                onClick={handlePasswordChange}
                disabled={securityLoading || !currentPassword || !newPassword || !confirmPassword}
              >
                {securityLoading ? 'Updating…' : 'Update Password'}
              </Button>
            </Box>

            <Divider />

            <Box>
              <Typography variant="subtitle1" sx={{ fontWeight: 600, mb: 1 }}>
                Active Sessions
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Changing your password will invalidate all other active sessions and require re-login on other devices.
              </Typography>
            </Box>
          </Stack>
        </TabPanel>

        {/* Notifications Tab */}
        <TabPanel value={tab} index={2}>
          <Stack spacing={3} sx={{ maxWidth: 480 }}>
            <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
              Email Notifications
            </Typography>
            <Stack spacing={1}>
              <FormControlLabel
                control={
                  <Switch
                    checked={emailNotifications}
                    onChange={(e) => setEmailNotifications(e.target.checked)}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>All email notifications</Typography>
                    <Typography variant="caption" color="text.secondary">Master toggle for all email alerts</Typography>
                  </Box>
                }
              />
              <Divider />
              <FormControlLabel
                control={
                  <Switch
                    checked={accessRequestAlerts && emailNotifications}
                    onChange={(e) => setAccessRequestAlerts(e.target.checked)}
                    disabled={!emailNotifications}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Access request alerts</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Notified when someone requests access to your documents
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={documentShareAlerts && emailNotifications}
                    onChange={(e) => setDocumentShareAlerts(e.target.checked)}
                    disabled={!emailNotifications}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Document share alerts</Typography>
                    <Typography variant="caption" color="text.secondary">
                      Notified when a document is shared with you
                    </Typography>
                  </Box>
                }
              />
              <FormControlLabel
                control={
                  <Switch
                    checked={weeklyDigest && emailNotifications}
                    onChange={(e) => setWeeklyDigest(e.target.checked)}
                    disabled={!emailNotifications}
                    color="primary"
                  />
                }
                label={
                  <Box>
                    <Typography variant="body2" sx={{ fontWeight: 500 }}>Weekly activity digest</Typography>
                    <Typography variant="caption" color="text.secondary">
                      A weekly summary of your document activity
                    </Typography>
                  </Box>
                }
              />
            </Stack>

            <Alert severity="info" sx={{ mt: 1 }}>
              Email notification delivery is configured by your system administrator. These preferences are saved locally.
            </Alert>
          </Stack>
        </TabPanel>
      </Paper>
    </Layout>
  );
};

export default Settings;
