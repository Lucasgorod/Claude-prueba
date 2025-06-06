import React from 'react';
import styled, { css } from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import { NavLink, useLocation } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { slideRight } from '../../styles/animations';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

interface NavItem {
  path: string;
  label: string;
  icon: React.ReactNode;
}

const SidebarContainer = styled(motion.aside)`
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh;
  width: 280px;
  background: ${theme.colors.glass};
  border-right: 1px solid ${theme.colors.separator};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  z-index: ${theme.zIndex.fixed};
  display: flex;
  flex-direction: column;
  
  @media (max-width: ${theme.breakpoints.md}) {
    width: 100vw;
    max-width: 320px;
  }
`;

const SidebarHeader = styled.div`
  padding: ${theme.spacing.lg};
  border-bottom: 1px solid ${theme.colors.separator};
  display: flex;
  align-items: center;
  justify-content: space-between;
`;

const Logo = styled.div`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  font-size: ${theme.typography.fontSize.xl};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
`;

const LogoIcon = styled.div`
  width: 32px;
  height: 32px;
  background: ${theme.colors.primary};
  border-radius: ${theme.borderRadius.md};
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${theme.colors.textInverse};
  font-weight: ${theme.typography.fontWeight.bold};
`;

const CloseButton = styled(motion.button)`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.surface};
  border: 1px solid ${theme.colors.border};
  color: ${theme.colors.textSecondary};
  cursor: pointer;
  transition: all ${theme.transitions.fast};
  
  &:hover {
    background: ${theme.colors.surfaceSecondary};
    color: ${theme.colors.textPrimary};
  }
`;

const Navigation = styled.nav`
  flex: 1;
  padding: ${theme.spacing.md} 0;
  overflow-y: auto;
`;

const NavList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const NavItem = styled.li`
  margin: 0;
`;

const NavLinkStyled = styled(NavLink)<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  gap: ${theme.spacing.sm};
  padding: ${theme.spacing.sm} ${theme.spacing.lg};
  color: ${theme.colors.textSecondary};
  text-decoration: none;
  transition: all ${theme.transitions.fast};
  border-right: 3px solid transparent;
  
  &:hover {
    background: ${theme.colors.surface};
    color: ${theme.colors.textPrimary};
  }
  
  ${({ $isActive }) =>
    $isActive &&
    css`
      background: rgba(0, 122, 255, 0.1);
      color: ${theme.colors.primary};
      border-right-color: ${theme.colors.primary};
    `}
`;

const NavIcon = styled.div`
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
`;

const NavLabel = styled.span`
  font-size: ${theme.typography.fontSize.base};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const Backdrop = styled(motion.div)`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${theme.zIndex.modal};
`;

const adminNavItems: NavItem[] = [
  {
    path: '/admin',
    label: 'Dashboard',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    path: '/admin/quizzes',
    label: 'Quiz Builder',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M9 12l2 2 4-4M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    path: '/admin/sessions',
    label: 'Live Sessions',
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
        <path
          d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const location = useLocation();

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <Backdrop
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <SidebarContainer
            variants={slideRight}
            initial="initial"
            animate="animate"
            exit="exit"
          >
            <SidebarHeader>
              <Logo>
                <LogoIcon>Q</LogoIcon>
                Quiz App
              </Logo>
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
            </SidebarHeader>

            <Navigation>
              <NavList>
                {adminNavItems.map((item) => (
                  <NavItem key={item.path}>
                    <NavLinkStyled
                      to={item.path}
                      $isActive={location.pathname === item.path}
                      onClick={onClose}
                    >
                      <NavIcon>{item.icon}</NavIcon>
                      <NavLabel>{item.label}</NavLabel>
                    </NavLinkStyled>
                  </NavItem>
                ))}
              </NavList>
            </Navigation>
          </SidebarContainer>
        </>
      )}
    </AnimatePresence>
  );
};