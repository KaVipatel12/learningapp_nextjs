// context/UserContext.tsx
'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

// Define PopulatedCourse interface since it's imported
interface PopulatedCourse {
  _id: string;
  title: string;
  category: string;
  educatorName : string; 
  averageRating : number; 
  totalRatings : number; 
  imageUrl : string; 
  price : number;
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

export interface UserData {
  _id ? : string;
  username: string;
  email: string;
  avatar ? : string;
  coverImage ? : string;
  role: string;
  bio ? : string;
  mobile : string;
  date: string | Date;
  category: string[];
  purchaseCourse: PurchaseCourse[];
  stats ? : {
    coursesCompleted: number;
    hoursLearned: number;
    certificates: number;
  };
  comment ? : {
    comment : string
  };
  wishlist ? : WishList[];
}

interface UserContextType {
  user: UserData | null;
  userLoading: boolean;
  error: string | null;
  fetchUserData: () => Promise<void>;
  purchasedCoursesIds: string[];
  purchasedCourses : Course[];
}


export interface Course {
  id: string;
  _id?: string;
  imageUrl: string;
  title: string;
  instructor: string;
  price: number;
  category?: string;
  progress?: number;
  discountedPrice?: number;
  rating?: number;
  averageRating? : number;
  totalRatings?: number;
  educatorName: string;
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

      console.log("Purchased IDs")
      console.log(purchasedIds)
      setPurchasedCoursesIds(purchasedIds);
    }
  }, [user, userLoading]);

  useEffect(() => {
    if (userLoading) return;
  
    if (!userLoading && user && Array.isArray(user.purchaseCourse)) {
      // Transform the data from the API format to the Course format
      const formattedPurchasedCourses: Course[] = [];
      user.purchaseCourse.forEach(item => {
        if (!item || !item.courseId) return;
  
        let courseData: Course;
  
        // Handle case when courseId is an object (populated)
        if (typeof item.courseId === 'object' && item.courseId !== null) {
          const course = item.courseId as PopulatedCourse;
          courseData = {
            id: course._id,
            imageUrl: course.imageUrl || '/default-course.jpg',
            title: course.title || item.title,
            instructor: course.educatorName || 'Unknown Instructor',
            price: course.price || 0,
            progress: 0,
            educatorName: course.educatorName || '',
            rating : course.averageRating ,
            category: course.category || item.category,
          };
        } 
        // Handle case when courseId is a string (not populated)
        else {
          courseData = {
            id: item.courseId as string,
            imageUrl: '/default-course.jpg',
            title: item.title,
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
    }
  
    // if (user?.wishlist) {
    //   const userWishlist = user.wishlist.map(id => id);
    //   setUserWishList(userWishlist); 
    // }
  }, [user, userLoading]);

  return (
    <UserContext.Provider 
      value={{
        user,
        userLoading,
        error,
        fetchUserData,
        purchasedCoursesIds, 
        purchasedCourses
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