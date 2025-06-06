import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';
import { buttonTap, buttonHover } from '../../styles/animations';

interface ButtonProps {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  disabled?: boolean;
  loading?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  children: React.ReactNode;
  onClick?: () => void;
  type?: 'button' | 'submit' | 'reset';
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'primary':
      return css`
        background: ${theme.colors.primary};
        color: ${theme.colors.textInverse};
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.primaryHover};
          border-color: ${theme.colors.primaryHover};
        }
        
        &:active:not(:disabled) {
          background: ${theme.colors.primaryPressed};
          border-color: ${theme.colors.primaryPressed};
        }
      `;
    case 'secondary':
      return css`
        background: ${theme.colors.surface};
        color: ${theme.colors.textPrimary};
        border: 1px solid ${theme.colors.border};
        
        &:hover:not(:disabled) {
          background: ${theme.colors.surfaceSecondary};
        }
      `;
    case 'outline':
      return css`
        background: transparent;
        color: ${theme.colors.primary};
        border: 1px solid ${theme.colors.primary};
        
        &:hover:not(:disabled) {
          background: rgba(0, 122, 255, 0.1);
        }
      `;
    case 'ghost':
      return css`
        background: transparent;
        color: ${theme.colors.textPrimary};
        border: 1px solid transparent;
        
        &:hover:not(:disabled) {
          background: ${theme.colors.surface};
        }
      `;
    case 'danger':
      return css`
        background: ${theme.colors.error};
        color: ${theme.colors.textInverse};
        border: 1px solid ${theme.colors.error};
        
        &:hover:not(:disabled) {
          background: #D70015;
          border-color: #D70015;
        }
      `;
    default:
      return '';
  }
};

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        padding: ${theme.spacing.xs} ${theme.spacing.sm};
        font-size: ${theme.typography.fontSize.sm};
        min-height: 32px;
      `;
    case 'md':
      return css`
        padding: ${theme.spacing.sm} ${theme.spacing.md};
        font-size: ${theme.typography.fontSize.base};
        min-height: 40px;
      `;
    case 'lg':
      return css`
        padding: ${theme.spacing.md} ${theme.spacing.lg};
        font-size: ${theme.typography.fontSize.lg};
        min-height: 48px;
      `;
    default:
      return '';
  }
};

const StyledButton = styled(motion.button)<{
  $variant: string;
  $size: string;
  $fullWidth: boolean;
}>`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${theme.spacing.xs};
  font-family: ${theme.typography.fontFamily.system};
  font-weight: ${theme.typography.fontWeight.medium};
  border-radius: ${theme.borderRadius.md};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  position: relative;
  overflow: hidden;
  user-select: none;
  touch-action: manipulation;
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $size }) => getSizeStyles($size)}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    pointer-events: none;
  }
  
  &:focus-visible {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

const IconWrapper = styled.span<{ $position: 'left' | 'right' }>`
  display: flex;
  align-items: center;
  ${({ $position }) => $position === 'right' && css`order: 1;`}
`;

const LoadingSpinner = styled(motion.div)`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
`;

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  children,
  onClick,
  type = 'button',
  ...props
}) => {
  return (
    <StyledButton
      $variant={variant}
      $size={size}
      $fullWidth={fullWidth}
      disabled={disabled || loading}
      onClick={onClick}
      type={type}
      whileHover={!disabled && !loading ? buttonHover : undefined}
      whileTap={!disabled && !loading ? buttonTap : undefined}
      {...props}
    >
      {loading ? (
        <LoadingSpinner
          animate={{ rotate: 360 }}
          transition={{
            duration: 1,
            repeat: Infinity,
            ease: 'linear',
          }}
        />
      ) : (
        <>
          {icon && (
            <IconWrapper $position={iconPosition}>
              {icon}
            </IconWrapper>
          )}
          {children}
        </>
      )}
    </StyledButton>
  );
};