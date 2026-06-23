import React from 'react';
import { Toaster } from 'react-hot-toast';

export default function ToasterSetup() {
  return (
    <Toaster 
      position="top-right"
      toastOptions={{
        duration: 3000,
        style: {
          background: '#fff',
          color: '#333',
          padding: '16px',
          borderRadius: '8px',
          boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        },
        success: {
          style: {
            borderLeft: '4px solid #10B981',
          },
        },
        error: {
          duration: 5000,
          style: {
            borderLeft: '4px solid #EF4444',
          },
        },
      }}
    />
  );
}
