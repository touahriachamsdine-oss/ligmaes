
'use client';
import { useState, useEffect, useRef } from 'react';
import { Scanner as QR } from '@yudiel/react-qr-scanner';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert';
import { useFirebase } from '@/firebase';
import { collection, addDoc, serverTimestamp, query, where, getDocs, limit } from 'firebase/firestore';
import { format } from 'date-fns';

export function QrScanner() {
  const { toast } = useToast();
  const { firestore, user } = useFirebase();
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const [isScanning, setIsScanning] = useState(true);


  useEffect(() => {
    const getCameraPermission = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
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

  // Function to get a time slot based on a 90-minute interval
  const getTimestampSlot = () => {
    const now = Date.now();
    const interval = 90 * 60 * 1000; // 90 minutes in milliseconds
    return Math.floor(now / interval);
  };


  const handleDecode = async (result: string) => {
    if (!isScanning) return;
    setIsScanning(false); // Prevent multiple scans

    try {
        const parts = result.split('|');
        if (parts.length !== 3 || parts[0] !== 'atprofit-clock-in') {
            throw new Error("Invalid QR code format.");
        }

        const employeeId = parts[1].split('=')[1];
        const timestampSlot = parseInt(parts[2].split('=')[1], 10);
        const currentTimestampSlot = getTimestampSlot();

        if (employeeId !== user?.uid) {
            throw new Error("This QR code is not for you.");
        }

        if (timestampSlot !== currentTimestampSlot) {
            throw new Error("The QR code has expired. Please request a new one.");
        }
        
        if (!firestore || !user) throw new Error("Authentication error.");

        // Check if user has already clocked in today
        const todayStr = format(new Date(), 'yyyy-MM-dd');
        const attendanceRef = collection(firestore, 'users', user.uid, 'attendance');
        const q = query(attendanceRef, where('date', '==', todayStr), limit(1));
        const querySnapshot = await getDocs(q);

        if (!querySnapshot.empty) {
            throw new Error("You have already clocked in today.");
        }

        // Record attendance
        await addDoc(attendanceRef, {
            date: todayStr,
            checkInTime: serverTimestamp(),
            status: 'Present', // Or determine 'Late' based on company policy
        });

        toast({
            title: "Clock-In Successful!",
            description: `You have successfully clocked in at ${new Date().toLocaleTimeString()}.`,
        });

    } catch (error: any) {
         toast({
            variant: "destructive",
            title: "Clock-In Failed",
            description: error.message || "An unexpected error occurred.",
        });
        // Re-enable scanning after a delay to allow user to read the message
        setTimeout(() => setIsScanning(true), 3000);
    }
  };

  const handleError = (error: any) => {
    console.error('QR Scanner Error:', error);
    if (isScanning) { // Only show toast if scanning is active
        toast({
            variant: "destructive",
            title: "QR Scan Error",
            description: error?.message || 'Failed to scan QR code.',
        });
    }
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
