import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { NotificationProvider } from '@/components/NotificationContext';
import NotificationComponent from '@/components/NotificationComponent';
import Footer from '@/components/Footer';
import { UserProvider } from '@/context/userContext';
import UserNav from '@/components/Navbar/UserNav';
import RestrictionWrapper from '@/components/RestrictionWrapper';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Learnify - Your Smart Learning Platform',
  description: 'An engaging platform for students and educators to grow and learn together.',
  icons: {
    icon: '/favicon.ico'
  }
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        {/* Favicon */}
        <link rel="icon" href="/favicon.ico" />
        {/* Manifest for PWA (optional) */}
        <link rel="manifest" href="/manifest.json" />
        {/* Apple Touch Icon */}
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        {/* Meta Tags for SEO & Social Sharing */}
        <meta property="og:title" content="Learnify - Your Smart Learning Platform" />
        <meta property="og:description" content="Interactive courses, notes, and tools for modern learning." />
        <meta name="theme-color" content="#ff69b4" />
      </head>

      <body className={inter.className}>
        <NotificationProvider>
          <NotificationComponent />
          <UserProvider>
            <RestrictionWrapper>
              <main>
                <UserNav />
                {children}
                <Footer />
              </main>
            </RestrictionWrapper>
          </UserProvider>
        </NotificationProvider>
      </body>
    </html>
  );
}