"use client"

// Adapted from shadcn/ui (https://ui.shadcn.com/docs/components/toast)
import { useState, useEffect, ReactNode } from "react"

export type ToastProps = {
  title?: string
  description?: string | ReactNode
  variant?: "default" | "destructive"
  action?: ReactNode
  duration?: number
}

const DEFAULT_TOAST_TIMEOUT = 5000 // 5 seconds

// Store for global toast state
type ToastStore = {
  toasts: ToastProps[]
  addToast: (props: ToastProps) => void
  dismissToast: (index: number) => void
}

// Create a simple global store for toasts
let listeners: Array<(store: ToastStore) => void> = []
let toastStore: ToastStore = {
  toasts: [],
  addToast: (props: ToastProps) => {
    toastStore = {
      ...toastStore,
      toasts: [...toastStore.toasts, props]
    }
    emitChange()
    
    // Auto dismiss after timeout
    setTimeout(() => {
      toastStore = {
        ...toastStore,
        toasts: toastStore.toasts.slice(1)
      }
      emitChange()
    }, props.duration || DEFAULT_TOAST_TIMEOUT)
  },
  dismissToast: (index: number) => {
    const newToasts = [...toastStore.toasts]
    newToasts.splice(index, 1)
    
    toastStore = {
      ...toastStore,
      toasts: newToasts
    }
    emitChange()
  }
}

function emitChange() {
  for (let listener of listeners) {
    listener(toastStore)
  }
}

// Hook to subscribe to toast store
export function useToast() {
  const [store, setStore] = useState<ToastStore>(toastStore)
  
  useEffect(() => {
    function handleChange(newStore: ToastStore) {
      setStore(newStore)
    }
    
    listeners.push(handleChange)
    return () => {
      listeners = listeners.filter(l => l !== handleChange)
    }
  }, [])
  
  return {
    toasts: store.toasts,
    toast: store.addToast,
    dismiss: store.dismissToast,
  }
}

// Export toast function for direct use
export const toast = (props: ToastProps) => {
  toastStore.addToast(props)
} 