'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

export interface EducatorData {
  _id: string;
  username: string;
  mobile: string;
  email: string;
  password: string;
  role: string;
  date?: string;
  courses: Array<{
    _id: string;
    title: string;
    description: string;
    price: number;
    discount?: number;
    courseImage?: string;
    category: string;
    level: string;
    language?: string;
    duration: number;
    totalSections: number;
    totalLectures: number;
    totalQuizzes?: number;
    educator: string;
    educatorName?: string;
    isPublished: boolean;
    totalEnrollment: number;
    certification?: boolean;
    learningOutcomes?: string;
    prerequisites?: string;
    welcomeMessage?: string;
    completionMessage?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    date?: string;
  }>;
  createdAt: string;
  updatedAt: string;
  __v?: number;
}

interface EducatorContextType {
  educator:  EducatorData | null;
  educatorLoading: boolean;
  error: string | null;
  fetchEducatorData: () => Promise<void>;
}

const EducatorContext = createContext<EducatorContextType | undefined>(undefined);

export function EducatorProvider({ children }: { children: ReactNode }) {
  const [educator, setEducator] = useState< EducatorData | null>(null);
  const [educatorLoading, setLoading] = useState(true);
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
    <EducatorContext.Provider value={{ educator, educatorLoading, error, fetchEducatorData }}>
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