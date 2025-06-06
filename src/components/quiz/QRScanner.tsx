import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import { motion, AnimatePresence } from 'framer-motion';
import QrScanner from 'qr-scanner';
import { theme } from '../../styles/theme';
import { Button, Card } from '../ui';

interface QRScannerProps {
  onScan: (code: string) => void;
  onError?: (error: string) => void;
  onClose: () => void;
}

const ScannerContainer = styled(motion.div)`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: ${theme.spacing.lg};
  max-width: 400px;
  margin: 0 auto;
`;

const VideoContainer = styled.div`
  position: relative;
  width: 300px;
  height: 300px;
  border-radius: ${theme.borderRadius.xl};
  overflow: hidden;
  background: ${theme.colors.surface};
  border: 2px solid ${theme.colors.border};
`;

const Video = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
`;

const ScannerOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  pointer-events: none;
`;

const ScanningFrame = styled(motion.div)`
  width: 200px;
  height: 200px;
  border: 2px solid ${theme.colors.primary};
  border-radius: ${theme.borderRadius.lg};
  position: relative;
  
  &::before,
  &::after {
    content: '';
    position: absolute;
    width: 20px;
    height: 20px;
    border: 3px solid ${theme.colors.primary};
    border-radius: 3px;
  }
  
  &::before {
    top: -3px;
    left: -3px;
    border-right: none;
    border-bottom: none;
  }
  
  &::after {
    bottom: -3px;
    right: -3px;
    border-left: none;
    border-top: none;
  }
`;

const ScanningLine = styled(motion.div)`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 2px;
  background: linear-gradient(90deg, transparent, ${theme.colors.primary}, transparent);
`;

const Instructions = styled.div`
  text-align: center;
  color: ${theme.colors.textSecondary};
  font-size: ${theme.typography.fontSize.sm};
  line-height: ${theme.typography.lineHeight.relaxed};
  max-width: 300px;
`;

const ErrorMessage = styled(motion.div)`
  color: ${theme.colors.error};
  font-size: ${theme.typography.fontSize.sm};
  text-align: center;
  padding: ${theme.spacing.sm};
  background: rgba(255, 59, 48, 0.1);
  border-radius: ${theme.borderRadius.md};
  border: 1px solid rgba(255, 59, 48, 0.2);
`;

const PermissionCard = styled(Card)`
  text-align: center;
  max-width: 350px;
`;

const CameraIcon = styled.div`
  width: 64px;
  height: 64px;
  border-radius: ${theme.borderRadius.full};
  background: ${theme.colors.surface};
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto ${theme.spacing.md};
  color: ${theme.colors.textSecondary};
`;

const Actions = styled.div`
  display: flex;
  gap: ${theme.spacing.sm};
  justify-content: center;
`;

export const QRScanner: React.FC<QRScannerProps> = ({
  onScan,
  onError,
  onClose,
}) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const scannerRef = useRef<QrScanner | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [error, setError] = useState<string>('');
  const [isScanning, setIsScanning] = useState(false);

  useEffect(() => {
    initializeScanner();
    
    return () => {
      cleanup();
    };
  }, []);

  const initializeScanner = async () => {
    if (!videoRef.current) return;

    try {
      // Check if camera is supported
      if (!QrScanner.hasCamera()) {
        setError('No camera found on this device');
        setHasPermission(false);
        return;
      }

      // Create scanner instance
      scannerRef.current = new QrScanner(
        videoRef.current,
        (result) => {
          if (result?.data) {
            handleScanSuccess(result.data);
          }
        },
        {
          onDecodeError: () => {
            // Ignore decode errors (normal when no QR code is visible)
          },
          highlightScanRegion: false,
          highlightCodeOutline: false,
          preferredCamera: 'environment', // Use back camera on mobile
        }
      );

      // Start scanning
      await scannerRef.current.start();
      setHasPermission(true);
      setIsScanning(true);
      setError('');
      
    } catch (error: any) {
      console.error('Scanner initialization error:', error);
      
      if (error.name === 'NotAllowedError') {
        setError('Camera permission denied. Please allow camera access and try again.');
      } else if (error.name === 'NotFoundError') {
        setError('No camera found on this device.');
      } else if (error.name === 'NotSupportedError') {
        setError('Camera not supported on this device.');
      } else {
        setError('Failed to access camera. Please try again.');
      }
      
      setHasPermission(false);
      
      if (onError) {
        onError(error.message);
      }
    }
  };

  const handleScanSuccess = (data: string) => {
    setIsScanning(false);
    
    // Extract session code from URL or use data directly
    let sessionCode = '';
    
    try {
      const url = new URL(data);
      const codeParam = url.searchParams.get('code');
      if (codeParam) {
        sessionCode = codeParam.toUpperCase();
      }
    } catch {
      // Not a URL, might be a direct session code
      if (/^[A-Z0-9]{6}$/i.test(data.trim())) {
        sessionCode = data.trim().toUpperCase();
      }
    }
    
    if (sessionCode) {
      onScan(sessionCode);
    } else {
      setError('Invalid QR code. Please scan a valid quiz session QR code.');
      setIsScanning(true);
    }
  };

  const cleanup = () => {
    if (scannerRef.current) {
      scannerRef.current.stop();
      scannerRef.current.destroy();
      scannerRef.current = null;
    }
  };

  const handleRetry = () => {
    setError('');
    setHasPermission(null);
    initializeScanner();
  };

  // Show permission request or error state
  if (hasPermission === false) {
    return (
      <ScannerContainer
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <PermissionCard variant="glass" padding="lg">
          <CameraIcon>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
              <path
                d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle
                cx="12"
                cy="13"
                r="4"
                stroke="currentColor"
                strokeWidth="2"
              />
            </svg>
          </CameraIcon>
          
          <h3 style={{ color: theme.colors.textPrimary, marginBottom: theme.spacing.sm }}>
            Camera Access Required
          </h3>
          
          <p style={{ color: theme.colors.textSecondary, marginBottom: theme.spacing.lg }}>
            Please allow camera access to scan QR codes
          </p>
          
          {error && (
            <ErrorMessage
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
            >
              {error}
            </ErrorMessage>
          )}
          
          <Actions style={{ marginTop: theme.spacing.lg }}>
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button variant="primary" onClick={handleRetry}>
              Try Again
            </Button>
          </Actions>
        </PermissionCard>
      </ScannerContainer>
    );
  }

  // Show scanner interface
  return (
    <ScannerContainer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <VideoContainer>
        <Video
          ref={videoRef}
          playsInline
          muted
        />
        
        <ScannerOverlay>
          <ScanningFrame>
            <AnimatePresence>
              {isScanning && (
                <ScanningLine
                  initial={{ y: 0 }}
                  animate={{ y: 196 }}
                  exit={{ opacity: 0 }}
                  transition={{
                    duration: 2,
                    repeat: Infinity,
                    ease: "linear",
                  }}
                />
              )}
            </AnimatePresence>
          </ScanningFrame>
        </ScannerOverlay>
      </VideoContainer>

      <Instructions>
        Point your camera at a QR code to automatically scan and join the quiz session.
      </Instructions>

      <AnimatePresence>
        {error && (
          <ErrorMessage
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
          >
            {error}
          </ErrorMessage>
        )}
      </AnimatePresence>

      <Actions>
        <Button variant="outline" onClick={onClose}>
          Cancel
        </Button>
      </Actions>
    </ScannerContainer>
  );
};