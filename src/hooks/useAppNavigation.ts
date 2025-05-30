"use client";

import { useRouter } from "next/navigation";

export const useAppNavigation = () => {
  const router = useRouter();

  const navigateTo = (path: string) => {
    router.push(path);
  };

  return {
    navigateTo
  };
}; 