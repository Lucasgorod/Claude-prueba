import React from 'react';
import styled, { css } from 'styled-components';
import { motion } from 'framer-motion';
import { theme } from '../../styles/theme';
import { cardHover } from '../../styles/animations';

interface CardProps {
  variant?: 'default' | 'elevated' | 'outlined' | 'glass';
  padding?: 'none' | 'sm' | 'md' | 'lg';
  interactive?: boolean;
  fullWidth?: boolean;
  children: React.ReactNode;
  onClick?: () => void;
  className?: string;
}

const getVariantStyles = (variant: string) => {
  switch (variant) {
    case 'elevated':
      return css`
        background: ${theme.colors.surface};
        border: 1px solid ${theme.colors.border};
        box-shadow: ${theme.shadows.lg};
      `;
    case 'outlined':
      return css`
        background: ${theme.colors.surface};
        border: 1px solid ${theme.colors.borderLight};
      `;
    case 'glass':
      return css`
        background: ${theme.colors.glass};
        border: 1px solid ${theme.colors.borderLight};
        backdrop-filter: blur(20px);
        -webkit-backdrop-filter: blur(20px);
      `;
    case 'default':
    default:
      return css`
        background: ${theme.colors.surface};
        border: 1px solid ${theme.colors.border};
      `;
  }
};

const getPaddingStyles = (padding: string) => {
  switch (padding) {
    case 'none':
      return css`padding: 0;`;
    case 'sm':
      return css`padding: ${theme.spacing.sm};`;
    case 'md':
      return css`padding: ${theme.spacing.md};`;
    case 'lg':
      return css`padding: ${theme.spacing.lg};`;
    default:
      return css`padding: ${theme.spacing.md};`;
  }
};

const StyledCard = styled(motion.div)<{
  $variant: string;
  $padding: string;
  $interactive: boolean;
  $fullWidth: boolean;
}>`
  border-radius: ${theme.borderRadius.lg};
  transition: all ${theme.transitions.normal};
  position: relative;
  overflow: hidden;
  
  ${({ $variant }) => getVariantStyles($variant)}
  ${({ $padding }) => getPaddingStyles($padding)}
  ${({ $fullWidth }) => $fullWidth && css`width: 100%;`}
  
  ${({ $interactive }) =>
    $interactive &&
    css`
      cursor: pointer;
      user-select: none;
      
      &:hover {
        border-color: ${theme.colors.primary};
      }
      
      &:active {
        transform: translateY(1px);
      }
    `}
`;

const CardHeader = styled.div`
  margin-bottom: ${theme.spacing.md};
  
  &:last-child {
    margin-bottom: 0;
  }
`;

const CardTitle = styled.h3`
  font-size: ${theme.typography.fontSize.lg};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin-bottom: ${theme.spacing.xs};
`;

const CardDescription = styled.p`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const CardContent = styled.div`
  flex: 1;
`;

const CardFooter = styled.div`
  margin-top: ${theme.spacing.md};
  padding-top: ${theme.spacing.md};
  border-top: 1px solid ${theme.colors.separator};
  
  &:first-child {
    margin-top: 0;
    padding-top: 0;
    border-top: none;
  }
`;

export const Card: React.FC<CardProps> & {
  Header: typeof CardHeader;
  Title: typeof CardTitle;
  Description: typeof CardDescription;
  Content: typeof CardContent;
  Footer: typeof CardFooter;
} = ({
  variant = 'default',
  padding = 'md',
  interactive = false,
  fullWidth = false,
  children,
  onClick,
  className,
  ...props
}) => {
  const motionProps = interactive
    ? {
        variants: cardHover,
        initial: 'initial',
        whileHover: 'hover',
        whileTap: { scale: 0.98 },
      }
    : {};

  return (
    <StyledCard
      $variant={variant}
      $padding={padding}
      $interactive={interactive}
      $fullWidth={fullWidth}
      onClick={onClick}
      className={className}
      {...motionProps}
      {...props}
    >
      {children}
    </StyledCard>
  );
};

Card.Header = CardHeader;
Card.Title = CardTitle;
Card.Description = CardDescription;
Card.Content = CardContent;
Card.Footer = CardFooter;