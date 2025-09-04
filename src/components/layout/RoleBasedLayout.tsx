import { ReactNode } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { AppLayout } from './AppLayout';
import { EmployeeLayout } from './EmployeeLayout';
import { SimpleLayout } from './SimpleLayout';

interface RoleBasedLayoutProps {
  children: ReactNode;
}

export const RoleBasedLayout = ({ children }: RoleBasedLayoutProps) => {
  const { userProfile } = useAuth();
  
  // Use EmployeeLayout for employees, SimpleLayout for individuals, AppLayout for others
  if (userProfile?.role === 'EMPLOYEE') {
    return <EmployeeLayout>{children}</EmployeeLayout>;
  }
  
  if (userProfile?.role === 'INDIVIDUAL') {
    return <SimpleLayout>{children}</SimpleLayout>;
  }
  
  return <AppLayout>{children}</AppLayout>;
};