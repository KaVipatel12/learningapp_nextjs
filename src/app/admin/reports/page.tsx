"use client"

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import ReportTable from './ReportTable';

export default function AdminReportsPage(){
  
  const [courseReports  , setCourseReports  ] = useState(null)
  const [commentReports , setCommentReports ] = useState(null)
  const [ restrictedCourses , setRestrictedCourses ] = useState(null); 
  
      const fetchReportedCourses = async  () => {

        try{
            const response = await fetch(`/api/admin/report/fetchreportdata`);
            const data = await response.json(); 
            console.log(data)
            if(response.ok){
                setCourseReports(data.courseReports)
                setCommentReports(data.commentReports)
                setRestrictedCourses(data.restrictedCourses)
            }
        }catch {
          console.log("There is some error")
        }
    }

    useEffect(() => {
      fetchReportedCourses(); 
    }, [])

  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-pink-700 mb-6">Report Management</h2>
      
  <Tabs defaultValue="courses" className="w-full">
  <TabsList className="grid grid-cols-3 bg-pink-100 w-full overflow-x-auto">
    <TabsTrigger 
      value="courses" 
      className="text-pink-600 data-[state=active]:bg-pink-500 data-[state=active]:text-white px-2 py-2 text-xs sm:text-sm min-w-[100px] text-center truncate"
    >
      Course Reports
    </TabsTrigger>
    <TabsTrigger 
      value="comments" 
      className="text-pink-600 data-[state=active]:bg-pink-500 data-[state=active]:text-white px-2 py-2 text-xs sm:text-sm min-w-[100px] text-center truncate"
    >
      Comment Reports
    </TabsTrigger>
    <TabsTrigger 
      value="restricted" 
      className="text-pink-600 data-[state=active]:bg-pink-500 data-[state=active]:text-white px-2 py-2 text-xs sm:text-sm min-w-[100px] text-center truncate"
    >
      Restricted
    </TabsTrigger>
  </TabsList>
  
  <div className="mt-4">
    <TabsContent value="courses">
      <ReportTable items={courseReports!} setReportedCourses={setCourseReports} type="course" />
    </TabsContent>
    
    <TabsContent value="comments">
      <ReportTable items={commentReports!} setReportedComments={setCommentReports} type="comment" />
    </TabsContent>
    
    <TabsContent value="restricted">
      <ReportTable items={restrictedCourses!} setRestrictedCourses={setRestrictedCourses} type="restrictedCourse" />
    </TabsContent>
  </div>
</Tabs>
    </div>
  );
};

