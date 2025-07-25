// app/admin/layout.tsx
import Link from 'next/link';
import React from 'react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
 <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
  <header className="bg-white shadow-sm">
    <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
      <nav className="flex items-center space-x-8 mt-15">
        <h1 className="text-pink-600 hover:text-pink-800 font-bold text-xl">Admin Panel</h1>
        <div className="flex space-x-4">
          <Link href="/admin" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
          <Link href="/admin/users" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Users</Link>
          <Link href="/admin/reports" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Reports</Link>
          <Link href="/admin/courses" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Course Approval</Link>
        </div>
      </nav>
    </div>
  </header>
  <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
    {children}
  </main>
</div>

  );
}