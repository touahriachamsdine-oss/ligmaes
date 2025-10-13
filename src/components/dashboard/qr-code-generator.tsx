
'use client';
import { useState, useEffect } from 'react';
import QRCode from 'qrcode.react';

export function QrCodeGenerator() {
  const [qrValue, setQrValue] = useState('');

  useEffect(() => {
    // Generate a value that is unique to the day to prevent reuse
    const today = new Date().toISOString().split('T')[0];
    setQrValue(`atprofit-qr-clock-in-${today}`);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      {qrValue ? (
        <QRCode
          value={qrValue}
          size={200}
          bgColor={"hsl(var(--background))"}
          fgColor={"hsl(var(--foreground))"}
          level={"H"}
          includeMargin={true}
        />
      ) : (
        <div className="h-[200px] w-[200px] flex items-center justify-center bg-muted rounded-md">
            <p>Generating QR Code...</p>
        </div>
      )}
      <p className="text-sm text-muted-foreground">
        Generated for: {new Date().toLocaleDateString()}
      </p>
    </div>
  );
}
