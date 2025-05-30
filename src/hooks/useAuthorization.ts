import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { authService } from '@/services/authService';
import { UserRole } from '@/types/user';
import { useSafeToast } from '@/components/SafeToast';

/**
 * @deprecated This hook causes infinite update loops. 
 * Instead, implement authorization checks directly in your component using useEffect.
 */
export function useAuthorization(allowedRoles: UserRole[], redirectPath: string = '/') {
  // Add console warning for deprecated hook
  console.warn(
    'useAuthorization is deprecated due to potential infinite render loops. ' +
    'Implement authorization directly in your component with useEffect instead.'
  );
  
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const hasRedirected = useRef(false);
  const showToast = useSafeToast();
  
  // Stable reference to the redirect function
  const redirectToLogin = useCallback(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    router.push('/login');
  }, [router]);
  
  // Stable reference to the unauthorized redirect function
  const redirectUnauthorized = useCallback(() => {
    if (hasRedirected.current) return;
    hasRedirected.current = true;
    router.push(redirectPath);
    showToast({
      title: "Access Denied",
      description: "You don't have permission to access this page.",
      variant: "destructive",
    });
  }, [router, redirectPath, showToast]);

  useEffect(() => {
    // Skip if we've already redirected to prevent loops
    if (hasRedirected.current) return;

    const user = authService.getCurrentUser();
    
    // If no user is logged in, redirect to login
    if (!user) {
      redirectToLogin();
      return;
    }
    
    // Check if user has one of the allowed roles
    if (!allowedRoles.includes(user.role)) {
      redirectUnauthorized();
      return;
    }
    
    // User is authorized
    setCurrentUser(user);
    setIsLoading(false);
  }, [allowedRoles, redirectToLogin, redirectUnauthorized]);

  return { isLoading, currentUser };
}

/**
 * @deprecated See useAuthorization for details on why this hook is deprecated
 */
export function useAdminOnly() {
  console.warn('useAdminOnly is deprecated. Implement authorization directly in your component.');
  return useAuthorization(['admin']);
}

/**
 * @deprecated See useAuthorization for details on why this hook is deprecated
 */
export function useAdminOrProviderOnly() {
  console.warn('useAdminOrProviderOnly is deprecated. Implement authorization directly in your component.');
  return useAuthorization(['admin', 'provider']);
}

/**
 * @deprecated See useAuthorization for details on why this hook is deprecated
 */
export function useConsumerOnly() {
  console.warn('useConsumerOnly is deprecated. Implement authorization directly in your component.');
  return useAuthorization(['consumer']);
} 