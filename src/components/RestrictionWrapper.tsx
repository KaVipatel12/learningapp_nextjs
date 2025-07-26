'use client';

import { useUser } from '@/context/userContext';
import { usePathname, useRouter } from 'next/navigation';
import { useEffect, ReactNode } from 'react';

export default function RestrictionWrapper({ children }: { children: ReactNode }) {
  const { user, userLoading } = useUser();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Skip check if user data is loading or not logged in
    if (userLoading || !user) return;

    // If user is restricted and not already on the restricted page
    if (user.restriction === 1 && !pathname.startsWith('/userrestricted')) {
      router.push('/userrestricted');
    }
  }, [user, userLoading, pathname, router]);

  // If user is restricted, return null (will be redirected)
  if (user?.restriction === 1) {
    return null;
  }

  return <>{children}</>;
}