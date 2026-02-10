import React from 'react';
import { Stack, Button, SvgIconProps } from '@mui/material';
import GoogleIcon from '@mui/icons-material/Google';
import MicrosoftIcon from '@mui/icons-material/Window';
import { SxProps, Theme } from '@mui/material/styles';

interface SocialProvider {
  label: string;
  icon: React.ReactElement<SvgIconProps>;
  onClick?: () => void;
}

const providers: SocialProvider[] = [
  {
    label: 'Continue with Google Workspace',
    icon: <GoogleIcon />,
  },
  {
    label: 'Continue with Microsoft Entra ID',
    icon: <MicrosoftIcon />,
  },
];

interface SocialAuthButtonsProps {
  variant?: 'signin' | 'signup';
  sx?: SxProps<Theme>;
}

export const SocialAuthButtons: React.FC<SocialAuthButtonsProps> = ({ variant = 'signin', sx }) => {
  return (
    <Stack spacing={1.5} sx={sx}>
      {providers.map((provider) => (
        <Button
          key={provider.label}
          fullWidth
          variant="outlined"
          startIcon={provider.icon}
          size="large"
          sx={{
            borderRadius: 999,
            borderColor: 'grey.300',
            color: 'text.primary',
            fontWeight: 600,
            justifyContent: 'flex-start',
            gap: 1,
          }}
          onClick={provider.onClick}
        >
          {variant === 'signin' ? provider.label : provider.label.replace('Continue', 'Sign up')}
        </Button>
      ))}
    </Stack>
  );
};

export default SocialAuthButtons;
