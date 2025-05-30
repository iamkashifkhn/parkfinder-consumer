"use client"

import * as React from "react"
import { ToastProps, useToast } from "./use-toast"
import { cn } from "@/lib/utils"
import { X } from "lucide-react"

type ToastComponentProps = ToastProps & React.HTMLAttributes<HTMLDivElement>

export function Toast({ title, description, action, variant = "default", onClick, ...props }: ToastComponentProps) {
  return (
    <div
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md border p-6 pr-8 shadow-lg transition-all",
        variant === "destructive"
          ? "border-red-200 bg-red-50 text-red-900"
          : "border-gray-200 bg-white text-gray-900"
      )}
      {...props}
    >
      <div className="flex flex-col gap-1 w-full">
        {title && <div className="text-sm font-medium">{title}</div>}
        {description && <div className="text-sm opacity-90">{description}</div>}
        {action && <div className="mt-2">{action}</div>}
      </div>
      <button 
        className="absolute right-2 top-2 rounded-md p-1 text-foreground/50 opacity-0 transition-opacity hover:text-foreground focus:opacity-100 focus:outline-none focus:ring-2 group-hover:opacity-100"
        onClick={(e) => onClick && onClick(e as unknown as React.MouseEvent<HTMLDivElement>)}
      >
        <X className="h-4 w-4" />
        <span className="sr-only">Close</span>
      </button>
    </div>
  )
}

export function Toaster() {
  const { toasts, dismiss } = useToast()

  return (
    <div className="fixed bottom-0 right-0 z-50 flex flex-col gap-2 p-4 md:max-w-[420px]">
      {toasts.map((toast, index) => (
        <Toast key={index} {...toast} onClick={() => dismiss(index)} />
      ))}
    </div>
  )
}

// Added missing components for imports in toaster.tsx
export const ToastProvider = ({ children }: { children: React.ReactNode }) => {
  return <>{children}</>
}

export const ToastTitle = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-sm font-medium">{children}</div>
}

export const ToastDescription = ({ children }: { children: React.ReactNode }) => {
  return <div className="text-sm opacity-90">{children}</div>
}

export const ToastClose = () => {
  return null // This is handled inside the Toast component itself
}

export const ToastViewport = () => {
  return null // No additional viewport needed since Toaster handles positioning
}
