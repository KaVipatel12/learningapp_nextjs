"use client"

import React, { useEffect, useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import UserTable from './UserTable';

export default function AdminUsersPage (){


  const [ students , setStudents] = useState(null); 
  const [ educators , setEducators] = useState(null); 
  const [ restrictedUsers , setRestrictedUsers ] = useState(null); 

      const fetchUsers = async  () => {
        try{
            const response = await fetch(`/api/admin/users/fetchusers`);
            const data = await response.json(); 
            if(response.ok){
                setStudents(data.students)
                setEducators(data.educators)
                setRestrictedUsers(data.restrictedUsers)
            }
        }catch {
          console.log("There is some error")
        }
      }
  
      useEffect(() => {
        fetchUsers(); 
      }, [])


  return (
    <div className="p-4">
      <h2 className="text-xl font-bold text-pink-700 mb-6">User Management</h2>
      
      <Tabs defaultValue="students" className="w-full">
        <TabsList className="grid grid-cols-3 bg-pink-100 w-full overflow-x-auto">
          <TabsTrigger 
            value="students" 
            className="text-pink-600 data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap px-4 py-2 text-sm"
          >
            Students
          </TabsTrigger>
          <TabsTrigger 
            value="educators" 
            className="text-pink-600 data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap px-4 py-2 text-sm"
          >
            Educators
          </TabsTrigger>
          <TabsTrigger 
            value="restricted" 
            className="text-pink-600 data-[state=active]:bg-pink-500 data-[state=active]:text-white whitespace-nowrap px-4 py-2 text-sm"
          >
            Restricted
          </TabsTrigger>
        </TabsList>
        
        <div className="mt-4">
          <TabsContent value="students">
            <UserTable users={students!} type="student" fetchUsers={fetchUsers}/>
          </TabsContent>
          
          <TabsContent value="educators">
            <UserTable users={educators!} type="educator" fetchUsers={fetchUsers} />
          </TabsContent>
          
          <TabsContent value="restricted">
            <UserTable users={restrictedUsers!} type="restricted" fetchUsers={fetchUsers} />
          </TabsContent>
        </div>
      </Tabs>
    </div>
  );
};

