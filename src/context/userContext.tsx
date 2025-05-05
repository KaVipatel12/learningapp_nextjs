// context/UserContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface UserData {
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

interface UserContextType {
  user: UserData | null;
  loading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUserData = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/fetchuserdata');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log(data)
      if (data.msg) {
        setUser(data.msg);
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
    fetchUserData();
  }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, fetchUserData }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}