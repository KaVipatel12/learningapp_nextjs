"use client"

// app/admin/courses/page.tsx
import React, { useEffect, useState } from 'react';
import CourseApprovalTable from './CourseApprovalTable';
import { Course } from '@/context/userContext';

export default function AdminCoursesPage(){
    
    const [pendingCourses , setPendingCourses] = useState<Course[]>([])

    const fetchPendingCourses = async  () => {

        try{

            const response = await fetch(`/api/course/fetchCoursesByStatus`);
            const data = await response.json(); 
            if(response.ok){
                setPendingCourses(data.courses)
                console.log(data.courses)
            }
        }catch {
            console.log("There is some error")
        }
    }

    useEffect(() => {
      fetchPendingCourses()
    }, [])

  return (
    <div className="p-6">
      <h2 className="text-2xl font-bold text-pink-700 mb-6">Course Approval Queue</h2>
      <CourseApprovalTable courses={pendingCourses} fetchPendingCourses={fetchPendingCourses}/>
    </div>
  );
};

