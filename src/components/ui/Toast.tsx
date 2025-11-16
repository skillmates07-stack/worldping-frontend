'use client'

import { useState, useEffect, createContext, useContext, ReactNode } from 'react'
import { Check, XCircle, Info } from 'lucide-react'

type ToastType = 'success' | 'error' | 'info'

interface ToastState {
  show: boolean
  type: ToastType
  message: string
}

const ToastContext = createContext<(msg: string, type?: ToastType) => void>(() => {})

export function useToast() {
  return useContext(ToastContext)
}

export default function ToastProvider({ children }: { children: ReactNode }) {
  const [toast, setToast] = useState<ToastState>({ show: false, type: 'info', message: '' })
  
  useEffect(() => {
    if (toast.show) {
      const t = setTimeout(() => setToast({ ...toast, show: false }), 3500)
      return () => clearTimeout(t)
    }
  }, [toast])
  
  const trigger = (message: string, type: ToastType = 'info') =>
    setToast({ show: true, message, type })

  return (
    <ToastContext.Provider value={trigger}>
      {children}
      {toast.show && (
        <div 
          className={`fixed bottom-4 right-4 z-[80] flex items-center gap-3 px-5 py-3 rounded-xl shadow-lg toast-notification
            ${toast.type === 'success' ? 'bg-green-600 text-white'
              : toast.type === 'error' ? 'bg-red-600 text-white'
                : 'bg-blue-700 text-white'}`}
        >
          {toast.type === 'success' ? <Check className="w-5 h-5" /> :
            toast.type === 'error' ? <XCircle className="w-5 h-5" /> :
            <Info className="w-5 h-5" />}
          <span className="font-medium">{toast.message}</span>
        </div>
      )}
    </ToastContext.Provider>
  )
}
