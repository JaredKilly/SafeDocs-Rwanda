import React from 'react';
import { Box, BoxProps } from '@mui/material';
import logo from '../logo.svg';

interface BrandLogoProps extends BoxProps {
  size?: number;
}

const BrandLogo: React.FC<BrandLogoProps> = ({ size = 48, ...rest }) => {
  return (
    <Box
      component="img"
      src={logo}
      alt="SafeDocs Rwanda logo"
      sx={{
        width: size,
        height: size,
        maxWidth: '100%',
        objectFit: 'contain',
        display: 'block',
      }}
      {...rest}
    />
  );
};

export default BrandLogo;
