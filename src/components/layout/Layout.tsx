import React, { useState } from 'react';
import styled from 'styled-components';
import { Outlet } from 'react-router-dom';
import { theme } from '../../styles/theme';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Button } from '../ui';

interface LayoutProps {
  variant?: 'admin' | 'student' | 'teacher';
  title?: string;
  showBackButton?: boolean;
  onBackClick?: () => void;
  headerActions?: React.ReactNode;
}

const LayoutContainer = styled.div`
  display: flex;
  min-height: 100vh;
  background: ${theme.colors.background};
`;

const MainContent = styled.main<{ $hasSidebar: boolean; $sidebarOpen: boolean }>`
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  transition: margin-left ${theme.transitions.normal};
  
  ${({ $hasSidebar, $sidebarOpen }) => 
    $hasSidebar && $sidebarOpen && `
      @media (min-width: ${theme.breakpoints.md}) {
        margin-left: 280px;
      }
    `}
`;

const ContentArea = styled.div`
  flex: 1;
  padding: ${theme.spacing.lg};
  overflow-y: auto;
  
  @media (max-width: ${theme.breakpoints.sm}) {
    padding: ${theme.spacing.md};
  }
`;

const MenuButton = styled(Button)``;

const SidebarOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  width: 280px;
  height: 100vh;
  z-index: ${theme.zIndex.fixed};
`;

export const Layout: React.FC<LayoutProps> = ({
  variant = 'admin',
  title,
  showBackButton = false,
  onBackClick,
  headerActions,
}) => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const hasSidebar = variant === 'admin';

  const toggleSidebar = () => setSidebarOpen(!sidebarOpen);
  const closeSidebar = () => setSidebarOpen(false);

  const headerActionsWithMenu = (
    <>
      {hasSidebar && (
        <MenuButton
          variant="ghost"
          size="sm"
          onClick={toggleSidebar}
          icon={
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path
                d="M3 12h18M3 6h18M3 18h18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          Menu
        </MenuButton>
      )}
      {headerActions}
    </>
  );

  return (
    <LayoutContainer>
      {hasSidebar && (
        <>
          <SidebarOverlay $isOpen={sidebarOpen}>
            <Sidebar isOpen={sidebarOpen} onClose={closeSidebar} />
          </SidebarOverlay>
        </>
      )}
      
      <MainContent $hasSidebar={hasSidebar} $sidebarOpen={sidebarOpen}>
        <Header
          title={title}
          showBackButton={showBackButton}
          onBackClick={onBackClick}
          actions={headerActionsWithMenu}
        />
        
        <ContentArea>
          <Outlet />
        </ContentArea>
      </MainContent>
    </LayoutContainer>
  );
};