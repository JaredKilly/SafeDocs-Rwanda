import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import {
  Box,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  Stack,
  Link as MuiLink,
  InputAdornment,
  IconButton,
  LinearProgress,
  alpha,
} from '@mui/material';
import {
  Visibility,
  VisibilityOff,
  ArrowBack as ArrowBackIcon,
  HowToReg as RegisterIcon,
} from '@mui/icons-material';
import { register, clearError } from '../store/authSlice';
import { AppDispatch, RootState } from '../store';
import AuthLayout from '../components/AuthLayout';
import BrandLogo from '../components/BrandLogo';

const getPasswordStrength = (pw: string): { score: number; label: string; color: string } => {
  if (!pw) return { score: 0, label: '', color: 'transparent' };
  let score = 0;
  if (pw.length >= 8) score++;
  if (pw.length >= 12) score++;
  if (/[A-Z]/.test(pw)) score++;
  if (/[0-9]/.test(pw)) score++;
  if (/[^A-Za-z0-9]/.test(pw)) score++;
  if (score <= 1) return { score: 20, label: 'Weak', color: '#f44336' };
  if (score === 2) return { score: 40, label: 'Fair', color: '#ff9800' };
  if (score === 3) return { score: 60, label: 'Good', color: '#2196f3' };
  if (score === 4) return { score: 80, label: 'Strong', color: '#4caf50' };
  return { score: 100, label: 'Very strong', color: '#2e7d32' };
};

const Register: React.FC = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch<AppDispatch>();
  const { isAuthenticated, loading, error } = useSelector((state: RootState) => state.auth);

  const [formData, setFormData] = useState({
    username: '',
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [validationError, setValidationError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  useEffect(() => {
    if (isAuthenticated) navigate('/dashboard');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    return () => { dispatch(clearError()); };
  }, [dispatch]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationError('');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setValidationError('Passwords do not match.');
      return;
    }
    if (formData.password.length < 6) {
      setValidationError('Password must be at least 6 characters.');
      return;
    }
    const { confirmPassword, ...registerData } = formData;
    dispatch(register({ ...registerData, role: 'user' }));
  };

  const pwStrength = getPasswordStrength(formData.password);
  const passwordMismatch = formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword;

  return (
    <AuthLayout title="Create account" subtitle="Join SafeDocs Rwanda">
      <Box sx={{ width: '100%' }}>
        {/* Back to home */}
        <MuiLink
          component={Link}
          to="/"
          underline="hover"
          sx={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 0.5,
            color: 'text.secondary',
            fontSize: '0.85rem',
            mb: 3,
            '&:hover': { color: 'primary.main' },
          }}
        >
          <ArrowBackIcon sx={{ fontSize: 16 }} />
          Back to home
        </MuiLink>

        {/* Header */}
        <Stack direction="row" alignItems="center" spacing={1.5} sx={{ mb: 1 }}>
          <BrandLogo size={40} />
          <Box>
            <Typography variant="caption" color="text.secondary" sx={{ letterSpacing: 1, textTransform: 'uppercase' }}>
              SafeDocs Rwanda
            </Typography>
            <Typography variant="h5" sx={{ fontWeight: 700, lineHeight: 1.2 }}>
              Create your account
            </Typography>
          </Box>
        </Stack>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5 }}>
          Get started with secure document management. Free to try, no credit card required.
        </Typography>

        {/* Form */}
        <Box component="form" onSubmit={handleSubmit}>
          {(error || validationError) && (
            <Alert
              severity="error"
              sx={{ mb: 2 }}
              onClose={() => { dispatch(clearError()); setValidationError(''); }}
            >
              {error || validationError}
            </Alert>
          )}

          <Stack spacing={2.5}>
            <TextField
              required
              fullWidth
              id="fullName"
              label="Full name"
              name="fullName"
              autoComplete="name"
              autoFocus
              value={formData.fullName}
              onChange={handleChange}
              disabled={loading}
            />

            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                required
                fullWidth
                id="username"
                label="Username"
                name="username"
                autoComplete="username"
                value={formData.username}
                onChange={handleChange}
                disabled={loading}
                helperText="Letters, numbers, underscores"
              />
              <TextField
                required
                fullWidth
                id="email"
                label="Work email"
                name="email"
                type="email"
                autoComplete="email"
                value={formData.email}
                onChange={handleChange}
                disabled={loading}
              />
            </Stack>

            {/* Password with strength indicator */}
            <Box>
              <TextField
                required
                fullWidth
                name="password"
                label="Password"
                type={showPassword ? 'text' : 'password'}
                id="password"
                autoComplete="new-password"
                value={formData.password}
                onChange={handleChange}
                disabled={loading}
                slotProps={{
                  input: {
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton size="small" onClick={() => setShowPassword((v) => !v)} edge="end">
                          {showPassword ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                        </IconButton>
                      </InputAdornment>
                    ),
                  },
                }}
              />
              {formData.password.length > 0 && (
                <Box sx={{ mt: 1 }}>
                  <LinearProgress
                    variant="determinate"
                    value={pwStrength.score}
                    sx={{
                      height: 4,
                      borderRadius: 2,
                      bgcolor: 'action.hover',
                      '& .MuiLinearProgress-bar': {
                        bgcolor: pwStrength.color,
                        borderRadius: 2,
                        transition: 'width 0.4s ease',
                      },
                    }}
                  />
                  <Typography variant="caption" sx={{ color: pwStrength.color, mt: 0.5, display: 'block' }}>
                    {pwStrength.label}
                  </Typography>
                </Box>
              )}
            </Box>

            <TextField
              required
              fullWidth
              name="confirmPassword"
              label="Confirm password"
              type={showConfirm ? 'text' : 'password'}
              id="confirmPassword"
              autoComplete="new-password"
              value={formData.confirmPassword}
              onChange={handleChange}
              disabled={loading}
              error={passwordMismatch}
              helperText={passwordMismatch ? 'Passwords do not match' : ''}
              slotProps={{
                input: {
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton size="small" onClick={() => setShowConfirm((v) => !v)} edge="end">
                        {showConfirm ? <VisibilityOff fontSize="small" /> : <Visibility fontSize="small" />}
                      </IconButton>
                    </InputAdornment>
                  ),
                },
              }}
            />
          </Stack>

          <Button
            type="submit"
            fullWidth
            size="large"
            variant="contained"
            disabled={loading}
            startIcon={loading ? undefined : <RegisterIcon />}
            sx={{
              mt: 3,
              mb: 2.5,
              py: 1.4,
              fontWeight: 600,
              fontSize: '1rem',
              borderRadius: 2,
            }}
          >
            {loading ? <CircularProgress size={22} color="inherit" /> : 'Create Account'}
          </Button>

          <Box
            sx={{
              p: 2,
              borderRadius: 2,
              bgcolor: (t) => alpha(t.palette.primary.main, 0.06),
              border: '1px solid',
              borderColor: (t) => alpha(t.palette.primary.main, 0.15),
              textAlign: 'center',
            }}
          >
            <Typography variant="body2" color="text.secondary">
              Already have an account?{' '}
              <MuiLink component={Link} to="/login" underline="hover" fontWeight={600} color="primary">
                Sign in
              </MuiLink>
            </Typography>
          </Box>
        </Box>
      </Box>
    </AuthLayout>
  );
};

export default Register;
