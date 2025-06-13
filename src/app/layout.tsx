import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/components/NotificationContext';
import NotificationComponent from '@/components/NotificationComponent';
import Footer from '@/components/Footer';
import { UserProvider } from '@/context/userContext';
import { EducatorProvider } from '@/context/educatorContext';
import UserNav from '@/components/Navbar/UserNav';

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
              <main >
                <UserNav />
                {children}
                <Footer />
                 </main>
            </EducatorProvider>
          </UserProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}