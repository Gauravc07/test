"use client"

import { createContext, useContext, useState, useCallback, type ReactNode } from "react"
import ToastNotification, { type ToastType } from "./toast-notification"

interface Toast {
  id: string
  type: ToastType
  message: string
  description?: string
  duration?: number
}

interface ToastContextType {
  showToast: (type: ToastType, message: string, description?: string, duration?: number) => void
  success: (message: string, description?: string) => void
  error: (message: string, description?: string) => void
  warning: (message: string, description?: string) => void
  info: (message: string, description?: string) => void
}

const ToastContext = createContext<ToastContextType | undefined>(undefined)

export function useToast() {
  const context = useContext(ToastContext)
  if (!context) {
    throw new Error("useToast must be used within ToastProvider")
  }
  return context
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const showToast = useCallback((type: ToastType, message: string, description?: string, duration?: number) => {
    const id = Math.random().toString(36).substring(7)
    setToasts((prev) => [...prev, { id, type, message, description, duration }])
  }, [])

  const success = useCallback(
    (message: string, description?: string) => {
      showToast("success", message, description)
    },
    [showToast],
  )

  const error = useCallback(
    (message: string, description?: string) => {
      showToast("error", message, description)
    },
    [showToast],
  )

  const warning = useCallback(
    (message: string, description?: string) => {
      showToast("warning", message, description)
    },
    [showToast],
  )

  const info = useCallback(
    (message: string, description?: string) => {
      showToast("info", message, description)
    },
    [showToast],
  )

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast, success, error, warning, info }}>
      {children}
      <div
        className="fixed top-4 right-4 z-50 flex flex-col gap-2 pointer-events-none"
        aria-live="polite"
        aria-atomic="true"
      >
        {toasts.map((toast) => (
          <ToastNotification
            key={toast.id}
            type={toast.type}
            message={toast.message}
            description={toast.description}
            duration={toast.duration}
            onClose={() => removeToast(toast.id)}
          />
        ))}
      </div>
    </ToastContext.Provider>
  )
}
