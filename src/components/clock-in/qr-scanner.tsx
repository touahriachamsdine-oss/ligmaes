
'use client';
import { useState, useEffect, useRef } from 'react';
import { Scanner as QR } from '@yudiel/react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';

export function QrScanner() {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);

  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        // Stop the tracks immediately to free up the camera
        stream.getTracks().forEach(track => track.stop());
        setHasCameraPermission(true);
      } catch (error) {
        console.error('Error accessing camera:', error);
        setHasCameraPermission(false);
        toast({
          variant: 'destructive',
          title: 'Camera Access Denied',
          description: 'Please enable camera permissions in your browser settings to scan the QR code.',
        });
      }
    };

    getCameraPermission();
  }, [toast]);


  const handleDecode = (result: string) => {
    const today = new Date().toISOString().split('T')[0];
    if (result === `atprofit-qr-clock-in-${today}`) {
        toast({
            title: "Clock-In Successful!",
            description: `You have successfully clocked in at ${new Date().toLocaleTimeString()}.`,
        });
    } else {
        toast({
            variant: "destructive",
            title: "Invalid QR Code",
            description: "The scanned QR code is not valid for today's clock-in.",
        });
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
    toast({
        variant: "destructive",
        title: "QR Scan Error",
        description: error?.message || 'Failed to scan QR code.',
    });
  };

  if (hasCameraPermission === null) {
      return <div className="flex justify-center items-center h-48"><p>Checking camera permissions...</p></div>
  }

  return (
    <div className='relative w-full aspect-square max-w-sm mx-auto'>
      {hasCameraPermission ? (
         <QR
            onDecode={handleDecode}
            onError={handleError}
            constraints={{
                facingMode: 'environment'
            }}
            styles={{
                container: { width: '100%', paddingTop: '100%', position: 'relative' },
                video: { position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', objectFit: 'cover', borderRadius: 'var(--radius)' },
            }}
        />
      ) : (
        <Alert variant="destructive">
            <AlertTitle>Camera Access Required</AlertTitle>
            <AlertDescription>
                Please allow camera access to use the QR scanner.
            </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
