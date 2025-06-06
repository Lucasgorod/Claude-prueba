import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { motion } from 'framer-motion';
import QRCode from 'qrcode';
import { theme } from '../../styles/theme';
import { Button, Card } from '../ui';

interface QRGeneratorProps {
  sessionCode: string;
  sessionUrl?: string;
  size?: number;
  showDownload?: boolean;
  onClose?: () => void;
}

const QRContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  padding: ${theme.spacing.lg};
`;

const QRCanvas = styled.canvas`
  border-radius: ${theme.borderRadius.lg};
  box-shadow: ${theme.shadows.md};
  background: white;
  padding: ${theme.spacing.md};
`;

const SessionCodeDisplay = styled.div`
  text-align: center;
`;

const CodeLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const CodeText = styled.div`
  font-size: ${theme.typography.fontSize['3xl']};
  font-weight: ${theme.typography.fontWeight.bold};
  color: ${theme.colors.primary};
  font-family: ${theme.typography.fontFamily.mono};
  letter-spacing: 0.1em;
`;

const UrlDisplay = styled.div`
  text-align: center;
  max-width: 300px;
`;

const UrlLabel = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textSecondary};
  margin-bottom: ${theme.spacing.xs};
  font-weight: ${theme.typography.fontWeight.medium};
`;

const UrlText = styled.div`
  font-size: ${theme.typography.fontSize.sm};
  color: ${theme.colors.textPrimary};
  background: ${theme.colors.surface};
  padding: ${theme.spacing.sm};
  border-radius: ${theme.borderRadius.md};
  border: 1px solid ${theme.colors.border};
  word-break: break-all;
`;

const Instructions = styled.div`
  text-align: center;
  max-width: 400px;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  flex-wrap: wrap;
  justify-content: center;
`;

export const QRGenerator: React.FC<QRGeneratorProps> = ({
  sessionCode,
  sessionUrl,
  size = 200,
  showDownload = true,
  onClose,
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const qrDataUrl = useRef<string>('');

  // Generate the URL for the QR code
  const getQRUrl = () => {
    if (sessionUrl) return sessionUrl;
    // Default to current domain with student join path
    const baseUrl = window.location.origin;
    return `${baseUrl}/student?code=${sessionCode}`;
  };

  // Generate QR code
  useEffect(() => {
    const generateQR = async () => {
      if (!canvasRef.current) return;

      try {
        const qrUrl = getQRUrl();
        
        await QRCode.toCanvas(canvasRef.current, qrUrl, {
          width: size,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF',
          },
          errorCorrectionLevel: 'M',
        });

        // Store data URL for download
        qrDataUrl.current = canvasRef.current.toDataURL('image/png');
      } catch (error) {
        console.error('Error generating QR code:', error);
      }
    };

    generateQR();
  }, [sessionCode, sessionUrl, size]);

  const handleDownload = () => {
    if (!qrDataUrl.current) return;

    const link = document.createElement('a');
    link.download = `quiz-session-${sessionCode}.png`;
    link.href = qrDataUrl.current;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(sessionCode);
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(getQRUrl());
      // You could add a toast notification here
    } catch (error) {
      console.error('Failed to copy URL:', error);
    }
  };

  return (
    <QRContainer
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <QRCanvas
        ref={canvasRef}
        width={size}
        height={size}
      />

      <SessionCodeDisplay>
        <CodeLabel>Session Code</CodeLabel>
        <CodeText>{sessionCode}</CodeText>
      </SessionCodeDisplay>

      <UrlDisplay>
        <UrlLabel>Join URL</UrlLabel>
        <UrlText>{getQRUrl()}</UrlText>
      </UrlDisplay>

      <Instructions>
        Students can join this quiz session by:
        <br />
        • Scanning the QR code with their camera
        <br />
        • Entering the session code manually
        <br />
        • Visiting the join URL directly
      </Instructions>

      <Actions>
        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyCode}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <rect
                x="9"
                y="9"
                width="13"
                height="13"
                rx="2"
                ry="2"
                stroke="currentColor"
                strokeWidth="2"
              />
              <path
                d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          }
        >
          Copy Code
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={handleCopyUrl}
          icon={
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M10 13a5 5 0 007.54.54l3-3a5 5 0 00-7.07-7.07l-1.72 1.71"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M14 11a5 5 0 00-7.54-.54l-3 3a5 5 0 007.07 7.07l1.71-1.71"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          }
        >
          Copy URL
        </Button>

        {showDownload && (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDownload}
            icon={
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                <path
                  d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M7 10l5 5 5-5M12 15V3"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            }
          >
            Download
          </Button>
        )}

        {onClose && (
          <Button
            variant="primary"
            size="sm"
            onClick={onClose}
          >
            Close
          </Button>
        )}
      </Actions>
    </QRContainer>
  );
};