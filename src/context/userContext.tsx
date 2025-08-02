'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

interface PopulatedCourse {
  _id: string;
  title: string;
  category: string;
  educatorName: string;
  averageRating: number;
  totalRatings: number;
  imageUrl: string;
  price: number;
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

export interface UserData {
  _id?: string;
  username: string;
  email: string;
  avatar?: string;
  coverImage?: string;
  role: string;
  restriction ? : number; 
  bio?: string;
  status ? : number; 
  mobile: string;
  date: string | Date;
  category: string[];
  purchaseCourse: PurchaseCourse[];
  stats?: {
    coursesCompleted: number;
    hoursLearned: number;
    certificates: number;
  };
  comment?: {
    comment: string;
  };
  wishlist?: WishList[];

  // Educator-specific fields
  teachingFocus?: string[];
  courses?: Array<{
    _id: string;
    id ? : string;
    title: string;
    description: string;
    price: number;
    discount?: number;
    imageUrl?: string;
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
  createdAt?: string;
  updatedAt?: string;
  __v?: number;
}

export interface Course {
  id: string;
  _id?: string;
  title: string;
  description ? : string;
  date? : Date;
  instructor: string;
  price: number;
  category?: string;
  imageUrl?: string;
  progress?: number;
  discountedPrice?: number;
  rating?: number;
  averageRating?: number;
  totalRatings?: number;
  educatorName: string;
}

interface UserContextType {
  user: UserData | null;
  userLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  purchasedCoursesIds: string[];
  purchasedCourses: Course[];
  isEducator: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserData | null>(null);
  const [userLoading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [purchasedCoursesIds, setPurchasedCoursesIds] = useState<string[]>([]);
  const [purchasedCourses, setPurchasedCourses] = useState<Course[]>([]);

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
    if (userLoading || !user) return;

    // Extract purchased course IDs
    const purchasedIds: string[] = [];
    user.purchaseCourse?.forEach(item => {
      if (!item || !item.courseId) return;
      if (typeof item.courseId === 'object') {
        purchasedIds.push(item.courseId._id);
      } else {
        purchasedIds.push(item.courseId);
      }
    });
    setPurchasedCoursesIds(purchasedIds);
  }, [user, userLoading]);

  useEffect(() => {
    if (userLoading || !user) return;

    const formattedPurchasedCourses: Course[] = [];
    user.purchaseCourse?.forEach(item => {
      if (!item || !item.courseId) return;

      let courseData: Course;

      if (typeof item.courseId === 'object') {
        const course = item.courseId as PopulatedCourse;
        courseData = {
          id: course._id,
          imageUrl: course.imageUrl || '/default-course.jpg',
          title: course.title || item.title || "",
          instructor: course.educatorName || 'Unknown Instructor',
          price: course.price || 0,
          progress: 0,
          educatorName: course.educatorName || '',
          rating: course.averageRating,
          category: course.category || item.category,
        };
      } else {
        courseData = {
          id: item.courseId,
          imageUrl: '/default-course.jpg',
          title: item.title || '',
          instructor: 'Unknown Instructor',
          price: 0,
          progress: 0,
          educatorName: '',
          category: item.category,
        };
      }

      formattedPurchasedCourses.push(courseData);
    });

    setPurchasedCourses(formattedPurchasedCourses);
  }, [user, userLoading]);

  const isEducator = user?.role === 'educator';

  return (
    <UserContext.Provider
      value={{
        user,
        userLoading,
        error,
        fetchUserData,
        purchasedCoursesIds,
        purchasedCourses,
        isEducator,
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (!context) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
