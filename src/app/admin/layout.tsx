// app/admin/layout.tsx
'use client'; // Needed for interactivity

import Link from 'next/link';
import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-b from-pink-50 to-pink-100">
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <h1 className="text-pink-600 hover:text-pink-800 font-bold text-xl">Admin Panel</h1>
          
          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden md:flex items-center space-x-8 mt-15">
            <div className="flex space-x-4">
              <Link href="/admin" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Dashboard</Link>
              <Link href="/admin/users" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Users</Link>
              <Link href="/admin/reports" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Reports</Link>
              <Link href="/admin/courses" className="text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-sm font-medium">Course Approval</Link>
            </div>
          </nav>

          {/* Mobile Menu Button - Visible only on mobile */}
          <button 
            className="md:hidden text-pink-600 hover:text-pink-800"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>

        {/* Mobile Navigation - Slides in from top */}
        <div className={`md:hidden ${isMenuOpen ? 'block' : 'hidden'} transition-all duration-300 ease-in-out`}>
          <nav className="px-2 pt-2 pb-4 space-y-1 bg-white border-t border-pink-100">
            <Link 
              href="/admin" 
              className="block text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Dashboard
            </Link>
            <Link 
              href="/admin/users" 
              className="block text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Users
            </Link>
            <Link 
              href="/admin/reports" 
              className="block text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Reports
            </Link>
            <Link 
              href="/admin/courses" 
              className="block text-pink-600 hover:text-pink-800 px-3 py-2 rounded-md text-base font-medium"
              onClick={() => setIsMenuOpen(false)}
            >
              Course Approval
            </Link>
          </nav>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
        {children}
      </main>
    </div>
  );
}