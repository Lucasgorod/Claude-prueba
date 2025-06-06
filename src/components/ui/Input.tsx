import React, { forwardRef } from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  label?: string;
  error?: string;
  helperText?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'filled' | 'outlined';
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
}

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return css`
        height: 32px;
        padding: 0 ${theme.spacing.xs};
        font-size: ${theme.typography.fontSize.sm};
      `;
    case 'md':
      return css`
        height: 40px;
        padding: 0 ${theme.spacing.sm};
        font-size: ${theme.typography.fontSize.base};
      `;
    case 'lg':
      return css`
        height: 48px;
        padding: 0 ${theme.spacing.md};
        font-size: ${theme.typography.fontSize.lg};
      `;
    default:
      return '';
  }
};

const getVariantStyles = (variant: string, hasError: boolean) => {
  const errorBorder = hasError ? theme.colors.error : theme.colors.border;
  const focusBorder = hasError ? theme.colors.error : theme.colors.primary;

  switch (variant) {
    case 'filled':
      return css`
        background: ${theme.colors.surfaceSecondary};
        border: 1px solid transparent;
        
        &:focus {
          background: ${theme.colors.surface};
          border-color: ${focusBorder};
        }
      `;
    case 'outlined':
      return css`
        background: transparent;
        border: 1px solid ${errorBorder};
        
        &:focus {
          border-color: ${focusBorder};
        }
      `;
    case 'default':
    default:
      return css`
        background: ${theme.colors.surface};
        border: 1px solid ${errorBorder};
        
        &:focus {
          border-color: ${focusBorder};
        }
      `;
  }
};

const InputContainer = styled.div<{ $fullWidth: boolean }>`
  display: flex;
  flex-direction: column;
  gap: ${theme.spacing.xs};
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
`;

const Label = styled.label`
  font-size: ${theme.typography.fontSize.sm};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const StyledInput = styled(motion.input)<{
  $size: string;
  $variant: string;
  $hasError: boolean;
  $hasIcon: boolean;
  $iconPosition: 'left' | 'right';
}>`
  width: 100%;
  border-radius: ${theme.borderRadius.md};
  font-family: ${theme.typography.fontFamily.system};
  color: ${theme.colors.textPrimary};
  transition: all ${theme.transitions.fast};
  outline: none;
  
  ${({ $size }) => getSizeStyles($size)}
  ${({ $variant, $hasError }) => getVariantStyles($variant, $hasError)}
  
  ${({ $hasIcon, $iconPosition, $size }) => {
    if (!$hasIcon) return '';
    const iconSpace = $size === 'sm' ? '32px' : $size === 'lg' ? '48px' : '40px';
    return $iconPosition === 'left'
      ? css`padding-left: ${iconSpace};`
      : css`padding-right: ${iconSpace};`;
  }}
  
  &::placeholder {
    color: ${theme.colors.textTertiary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
  
  &:focus {
    box-shadow: 0 0 0 2px rgba(0, 122, 255, 0.2);
  }
`;

const IconWrapper = styled.div<{
  $position: 'left' | 'right';
  $size: string;
}>`
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textSecondary};
  pointer-events: none;
  z-index: 1;
  
  ${({ $position }) => $position === 'left' ? css`left: 8px;` : css`right: 8px;`}
  
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return css`
          width: 16px;
          height: 16px;
        `;
      case 'lg':
        return css`
          width: 24px;
          height: 24px;
        `;
      default:
        return css`
          width: 20px;
          height: 20px;
        `;
    }
  }}
`;

const HelperText = styled.span<{ $isError: boolean }>`
  font-size: ${theme.typography.fontSize.xs};
  color: ${({ $isError }) => $isError ? theme.colors.error : theme.colors.textSecondary};
`;

export const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  size = 'md',
  variant = 'default',
  icon,
  iconPosition = 'left',
  fullWidth = false,
  className,
  ...props
}, ref) => {
  const hasError = Boolean(error);
  const hasIcon = Boolean(icon);

  return (
    <InputContainer $fullWidth={fullWidth} className={className}>
      {label && <Label>{label}</Label>}
      <InputWrapper>
        {hasIcon && (
          <IconWrapper $position={iconPosition} $size={size}>
            {icon}
          </IconWrapper>
        )}
        <StyledInput
          ref={ref}
          $size={size}
          $variant={variant}
          $hasError={hasError}
          $hasIcon={hasIcon}
          $iconPosition={iconPosition}
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
          {...props}
        />
      </InputWrapper>
      {(error || helperText) && (
        <HelperText $isError={hasError}>
          {error || helperText}
        </HelperText>
      )}
    </InputContainer>
  );
});