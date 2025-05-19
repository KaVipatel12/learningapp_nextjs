// context/UserContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define PopulatedCourse interface since it's imported
interface PopulatedCourse {
  _id: string;
  title: string;
  category: string;
  // Add other properties as needed
}

interface PurchaseCourse {
  courseId: string | PopulatedCourse;
  _id: string;
  title?: string;
  category?: string;
  purchaseDate?: string;
  enrollment?: Date;
}

interface WishList {
  id: string;
}

interface UserData {
  _id ? : string;
  name: string;
  email: string;
  avatar: string;
  coverImage: string;
  role: string;
  bio: string;
  phone: string;
  joinDate: string;
  category: string[];
  purchaseCourse: PurchaseCourse[];
  stats: {
    coursesCompleted: number;
    hoursLearned: number;
    certificates: number;
  };
  wishlist: WishList[];
}

interface UserContextType {
  user: UserData | null;
  userLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  purchasedCoursesIds: string[];
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedCoursesIds, setPurchasedCoursesIds] = useState<string[]>([]);

  const fetchUserData = async (): Promise<void> => {
    try {
      setLoading(true);
      const response = await fetch('/api/user/fetchuserdata');
      
      if (!response.ok) {
        throw new Error('Failed to fetch user data');
      }

      const data = await response.json();
      console.log(data);
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

  useEffect(() => {
    if (userLoading) return;
  
    if (!userLoading && user && Array.isArray(user.purchaseCourse)) {
      const purchasedIds: string[] = [];
  
      user.purchaseCourse.forEach(item => {
        if (!item || !item.courseId) return;
  
        let courseId: string;
  
        if (typeof item.courseId === 'object' && item.courseId !== null) {
          const course = item.courseId as PopulatedCourse;
          courseId = course._id;
        }
        else {
          courseId = item.courseId as string;
        }
        purchasedIds.push(courseId);
      });
  
      setPurchasedCoursesIds(purchasedIds);
    }
  }, [user, userLoading]);

  return (
    <UserContext.Provider 
      value={{ 
        user, 
        userLoading, 
        error, 
        fetchUserData, 
        purchasedCoursesIds 
      }}
    >
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