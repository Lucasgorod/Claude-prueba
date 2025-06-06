import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  description?: string;
}

const getSizeStyles = (size: string) => {
  switch (size) {
    case 'sm':
      return {
        width: 36,
        height: 20,
        padding: 2,
        thumbSize: 16,
      };
    case 'lg':
      return {
        width: 56,
        height: 32,
        padding: 3,
        thumbSize: 26,
      };
    case 'md':
    default:
      return {
        width: 44,
        height: 24,
        padding: 2,
        thumbSize: 20,
      };
  }
};

const SwitchContainer = styled.div`
  display: flex;
  align-items: flex-start;
  gap: ${theme.spacing.sm};
`;

const SwitchTrack = styled(motion.button)<{
  $checked: boolean;
  $disabled: boolean;
  $size: string;
}>`
  position: relative;
  border: none;
  border-radius: ${theme.borderRadius.full};
  cursor: ${({ $disabled }) => $disabled ? 'not-allowed' : 'pointer'};
  transition: all ${theme.transitions.fast};
  flex-shrink: 0;
  
  ${({ $size }) => {
    const { width, height } = getSizeStyles($size);
    return css`
      width: ${width}px;
      height: ${height}px;
    `;
  }}
  
  ${({ $checked, $disabled }) => {
    if ($disabled) {
      return css`
        background: ${theme.colors.surfaceSecondary};
        opacity: 0.5;
      `;
    }
    
    return css`
      background: ${$checked ? theme.colors.primary : theme.colors.surfaceSecondary};
      
      &:hover {
        background: ${$checked ? theme.colors.primaryHover : theme.colors.surfaceTertiary};
      }
      
      &:focus {
        outline: 2px solid ${theme.colors.primary};
        outline-offset: 2px;
      }
    `;
  }}
`;

const SwitchThumb = styled(motion.div)<{
  $checked: boolean;
  $size: string;
}>`
  position: absolute;
  top: 50%;
  background: ${theme.colors.textInverse};
  border-radius: ${theme.borderRadius.full};
  box-shadow: ${theme.shadows.sm};
  
  ${({ $size }) => {
    const { padding, thumbSize } = getSizeStyles($size);
    return css`
      width: ${thumbSize}px;
      height: ${thumbSize}px;
      margin-top: -${thumbSize / 2}px;
    `;
  }}
`;

const SwitchContent = styled.div`
  flex: 1;
`;

const SwitchLabel = styled.label`
  display: block;
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
  color: ${theme.colors.textPrimary};
  cursor: pointer;
  margin-bottom: ${theme.spacing.xs};
`;

const SwitchDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.typography.lineHeight.relaxed};
  margin: 0;
`;

export const Switch: React.FC<SwitchProps> = ({
  checked,
  onChange,
  disabled = false,
  size = 'md',
  label,
  description,
}) => {
  const { width, padding, thumbSize } = getSizeStyles(size);
  const thumbOffset = checked ? width - thumbSize - padding : padding;

  const handleToggle = () => {
    if (!disabled) {
      onChange(!checked);
    }
  };

  const switchElement = (
    <SwitchTrack
      $checked={checked}
      $disabled={disabled}
      $size={size}
      onClick={handleToggle}
      whileTap={!disabled ? { scale: 0.95 } : undefined}
      type="button"
      role="switch"
      aria-checked={checked}
      aria-disabled={disabled}
    >
      <SwitchThumb
        $checked={checked}
        $size={size}
        animate={{
          x: thumbOffset,
        }}
        transition={{
          type: 'spring',
          stiffness: 500,
          damping: 30,
        }}
      />
    </SwitchTrack>
  );

  if (label || description) {
    return (
      <SwitchContainer>
        {switchElement}
        <SwitchContent>
          {label && (
            <SwitchLabel onClick={handleToggle}>
              {label}
            </SwitchLabel>
          )}
          {description && (
            <SwitchDescription>
              {description}
            </SwitchDescription>
          )}
        </SwitchContent>
      </SwitchContainer>
    );
  }

  return switchElement;
};