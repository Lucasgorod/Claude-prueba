import { createGlobalStyle } from 'styled-components';
import { theme } from './theme';

export const GlobalStyles = createGlobalStyle`
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  html {
    height: 100%;
    -webkit-text-size-adjust: 100%;
  }

  body {
    height: 100%;
    font-family: ${theme.typography.fontFamily.system};
    background-color: ${theme.colors.background};
    color: ${theme.colors.textPrimary};
    line-height: ${theme.typography.lineHeight.normal};
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    overflow-x: hidden;
  }

  #root {
    height: 100%;
    min-height: 100vh;
  }

  /* Scrollbar styling for webkit browsers */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: ${theme.colors.surface};
  }

  ::-webkit-scrollbar-thumb {
    background: ${theme.colors.textTertiary};
    border-radius: ${theme.borderRadius.full};
  }

  ::-webkit-scrollbar-thumb:hover {
    background: ${theme.colors.textSecondary};
  }

  /* Focus styles */
  :focus {
    outline: 2px solid ${theme.colors.primary};
    outline-offset: 2px;
  }

  :focus:not(:focus-visible) {
    outline: none;
  }

  /* Button reset */
  button {
    background: none;
    border: none;
    font-family: inherit;
    cursor: pointer;
    padding: 0;
  }

  /* Input reset */
  input, textarea, select {
    font-family: inherit;
    background: none;
    border: none;
    outline: none;
  }

  /* Link reset */
  a {
    color: inherit;
    text-decoration: none;
  }

  /* List reset */
  ul, ol {
    list-style: none;
  }

  /* Image reset */
  img {
    max-width: 100%;
    height: auto;
  }

  /* Table reset */
  table {
    border-collapse: collapse;
    border-spacing: 0;
  }

  /* iOS specific fixes */
  input[type="search"] {
    -webkit-appearance: none;
    border-radius: 0;
  }

  /* Touch action for better mobile interaction */
  .touch-action-manipulation {
    touch-action: manipulation;
  }

  /* Glassmorphism backdrop filter support */
  .backdrop-blur {
    backdrop-filter: blur(20px);
    -webkit-backdrop-filter: blur(20px);
  }

  /* Animation utilities */
  .animate-in {
    animation-duration: 150ms;
    animation-timing-function: ease-out;
    animation-fill-mode: forwards;
  }

  .animate-out {
    animation-duration: 150ms;
    animation-timing-function: ease-in;
    animation-fill-mode: forwards;
  }

  /* Safe area handling for iOS */
  .safe-area-inset-top {
    padding-top: env(safe-area-inset-top);
  }

  .safe-area-inset-bottom {
    padding-bottom: env(safe-area-inset-bottom);
  }

  .safe-area-inset-left {
    padding-left: env(safe-area-inset-left);
  }

  .safe-area-inset-right {
    padding-right: env(safe-area-inset-right);
  }
`;