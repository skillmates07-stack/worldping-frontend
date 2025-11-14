'use client'

import { Toaster } from 'react-hot-toast'

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1a1a1a',
            color: '#fff',
            border: '1px solid #3b82f6',
            borderRadius: '12px',
            fontSize: '14px',
            fontWeight: '500'
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </>
  )
}
