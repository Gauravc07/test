"use client"

import { useEffect } from "react"
import { CheckCircle2, AlertCircle, Info, AlertTriangle, X } from "lucide-react"
import { cn } from "@/lib/utils"

export type ToastType = "success" | "error" | "warning" | "info"

interface ToastNotificationProps {
  type: ToastType
  message: string
  description?: string
  duration?: number
  onClose: () => void
}

const toastConfig = {
  success: {
    icon: CheckCircle2,
    bgColor: "bg-green-50 dark:bg-green-950/20",
    borderColor: "border-green-200 dark:border-green-800",
    iconColor: "text-green-600 dark:text-green-400",
    textColor: "text-green-900 dark:text-green-100",
    duration: 3000,
  },
  error: {
    icon: AlertCircle,
    bgColor: "bg-red-50 dark:bg-red-950/20",
    borderColor: "border-red-200 dark:border-red-800",
    iconColor: "text-red-600 dark:text-red-400",
    textColor: "text-red-900 dark:text-red-100",
    duration: 0, // Persistent
  },
  warning: {
    icon: AlertTriangle,
    bgColor: "bg-yellow-50 dark:bg-yellow-950/20",
    borderColor: "border-yellow-200 dark:border-yellow-800",
    iconColor: "text-yellow-600 dark:text-yellow-400",
    textColor: "text-yellow-900 dark:text-yellow-100",
    duration: 5000,
  },
  info: {
    icon: Info,
    bgColor: "bg-blue-50 dark:bg-blue-950/20",
    borderColor: "border-blue-200 dark:border-blue-800",
    iconColor: "text-blue-600 dark:text-blue-400",
    textColor: "text-blue-900 dark:text-blue-100",
    duration: 4000,
  },
}

export default function ToastNotification({ type, message, description, duration, onClose }: ToastNotificationProps) {
  const config = toastConfig[type]
  const Icon = config.icon
  const autoDismiss = duration ?? config.duration

  useEffect(() => {
    if (autoDismiss > 0) {
      const timer = setTimeout(onClose, autoDismiss)
      return () => clearTimeout(timer)
    }
  }, [autoDismiss, onClose])

  return (
    <div
      role="alert"
      aria-live={type === "error" ? "assertive" : "polite"}
      className={cn(
        "pointer-events-auto w-full max-w-sm rounded-lg border p-4 shadow-lg transition-all",
        config.bgColor,
        config.borderColor,
        "animate-in slide-in-from-top-5 fade-in",
      )}
    >
      <div className="flex gap-3">
        <Icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", config.iconColor)} aria-hidden="true" />
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-semibold", config.textColor)}>{message}</p>
          {description && <p className={cn("text-sm mt-1 opacity-90", config.textColor)}>{description}</p>}
        </div>
        <button
          onClick={onClose}
          className={cn(
            "flex-shrink-0 rounded-md p-1 hover:bg-black/5 dark:hover:bg-white/5 transition-colors",
            config.textColor,
          )}
          aria-label="Close notification"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>
      </div>
    </div>
  )
}
