"use client";

import { useRef, useCallback } from "react";
import { toast } from "@/components/ui/use-toast";

interface ToastOptions {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
}

/**
 * Safely show a toast notification without causing re-renders or infinite loops
 * when used in useEffect hooks.
 */
export function useSafeToast() {
  const hasFired = useRef(false);

  // Use useCallback to ensure the same function reference is returned
  // on every render, preventing unnecessary re-renders of components
  // that depend on this function
  const showToast = useCallback((options: ToastOptions) => {
    if (!hasFired.current) {
      hasFired.current = true;
      toast(options);
    }
  }, []);

  return showToast;
} 