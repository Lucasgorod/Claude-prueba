import React, { useEffect } from 'react';
import { createPortal } from 'react-dom';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { theme } from '../../styles/theme';
import { modalBackdrop, modalContent } from '../../styles/animations';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  closeOnBackdropClick?: boolean;
  closeOnEscape?: boolean;
  children: React.ReactNode;
}

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: ${theme.spacing.md};
  z-index: ${theme.zIndex.modal};
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
`;

const ModalContainer = styled(motion.div)<{ $size: string }>`
  background: ${theme.colors.glass};
  border: 1px solid ${theme.colors.borderLight};
  border-radius: ${theme.borderRadius.xl};
  box-shadow: ${theme.shadows.xl};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  max-height: 90vh;
  overflow-y: auto;
  position: relative;
  
  ${({ $size }) => {
    switch ($size) {
      case 'sm':
        return `
          width: 100%;
          max-width: 400px;
        `;
      case 'md':
        return `
          width: 100%;
          max-width: 500px;
        `;
      case 'lg':
        return `
          width: 100%;
          max-width: 700px;
        `;
      case 'xl':
        return `
          width: 100%;
          max-width: 900px;
        `;
      case 'full':
        return `
          width: 95vw;
          height: 90vh;
        `;
      default:
        return `
          width: 100%;
          max-width: 500px;
        `;
    }
  }}
  
  /* Custom scrollbar for modal content */
  &::-webkit-scrollbar {
    width: 6px;
  }
  
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  
  &::-webkit-scrollbar-thumb {
    background: ${theme.colors.textTertiary};
    border-radius: ${theme.borderRadius.full};
  }
`;

const ModalHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.separator};
`;

const ModalTitle = styled.h2`
  font-size: ${theme.typography.fontSize['2xl']};
  font-weight: ${theme.typography.fontWeight.semibold};
  color: ${theme.colors.textPrimary};
  margin: 0;
`;

const CloseButton = styled(motion.button)`
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.surfaceSecondary};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.surfaceTertiary};
    color: ${theme.colors.textPrimary};
  }
  
  &:focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }
`;

const ModalBody = styled.div`
  padding: ${theme.spacing.lg};
`;

const ModalFooter = styled.div`
  padding: ${theme.spacing.lg};
  border-top: 1px solid ${theme.colors.separator};
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: flex-end;
`;

export const Modal: React.FC<ModalProps> & {
  Header: typeof ModalHeader;
  Title: typeof ModalTitle;
  Body: typeof ModalBody;
  Footer: typeof ModalFooter;
} = ({
  isOpen,
  onClose,
  title,
  size = 'md',
  closeOnBackdropClick = true,
  closeOnEscape = true,
  children,
}) => {
  useEffect(() => {
    if (!closeOnEscape) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
      document.body.style.overflow = 'hidden';
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
      document.body.style.overflow = 'unset';
    };
  }, [isOpen, closeOnEscape, onClose]);

  const handleBackdropClick = (event: React.MouseEvent) => {
    if (closeOnBackdropClick && event.target === event.currentTarget) {
      onClose();
    }
  };

  if (typeof window === 'undefined') return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <Backdrop
          variants={modalBackdrop}
          initial="initial"
          animate="animate"
          exit="exit"
          onClick={handleBackdropClick}
        >
          <ModalContainer
            $size={size}
            variants={modalContent}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            {title && (
              <ModalHeader>
                <ModalTitle>{title}</ModalTitle>
                <CloseButton
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M18 6L6 18M6 6l12 12"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </CloseButton>
              </ModalHeader>
            )}
            {children}
          </ModalContainer>
        </Backdrop>
      )}
    </AnimatePresence>,
    document.body
  );
};

Modal.Header = ModalHeader;
Modal.Title = ModalTitle;
Modal.Body = ModalBody;
Modal.Footer = ModalFooter;