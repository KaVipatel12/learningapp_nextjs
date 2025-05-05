import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/components/NotificationContext';
import NotificationComponent from '@/components/NotificationComponent';
import { UserProvider } from '@/context/userContext';
import { EducatorProvider } from '@/context/educatorContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Learning Platform',
  description: 'A comprehensive learning platform for students and educators',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <NotificationProvider>
          <NotificationComponent />
          <UserProvider>
            <EducatorProvider>
          {children}
            </EducatorProvider>
          </UserProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}