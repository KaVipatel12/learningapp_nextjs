'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface  EducatorData {
  name: string;
  email: string;
  avatar: string;
  coverImage: string;
  role: string;
  bio: string;
  phone: string;
  joinDate: string;
  stats: {
    coursesCompleted: number;
    hoursLearned: number;
    certificates: number;
  };
}

interface EducatorContextType {
  educator:  EducatorData | null;
  loading: boolean;
  error: string | null;
  fetchEducatorData: () => Promise<void>;
}

const EducatorContext = createContext<EducatorContextType | undefined>(undefined);

export function EducatorProvider({ children }: { children: ReactNode }) {
  const [educator, setEducator] = useState< EducatorData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEducatorData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/educator/fetcheducatordata');
      
      if (!response.ok) {
        throw new Error('Failed to fetch educator data');
      }

      const data = await response.json();
      console.log(data)
      if (data.msg) {
        setEducator(data.msg);
      } else {
        throw new Error('Invalid data format');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unknown error occurred');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEducatorData();
  }, []);

  return (
    <EducatorContext.Provider value={{ educator, loading, error, fetchEducatorData }}>
      {children}
    </EducatorContext.Provider>
  );
}

export function useEducator() {
  const context = useContext(EducatorContext);
  if (context === undefined) {
    throw new Error('useEducator must be used within a EducatorProvider');
  }
  return context;
}