"use client";

import { useUser } from '@/context/userContext';
import { PageLoading } from '@/components/PageLoading';
import BioInput from '@/components/bioPage/BioInput';
import { useNotification } from '@/components/NotificationContext';
import { useRouter } from 'next/navigation';

const UserBioPage = () => {
  const { user, userLoading } = useUser();
  const { showNotification } = useNotification(); 
  const router  = useRouter();

  if (userLoading) {
    return <PageLoading />;
  }

  const handleSubmit = async (bio: string) => {
    const response = await fetch('/api/user/bio', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bio }),
    });

    const data = await response.json();

    if (!response.ok) {
      return showNotification(data.msg || 'Failed to update bio', "error");
    }
    
    showNotification('Bio Updated successfully', "success");
    return router.push("/category")
  };


  return (
    <BioInput
      initialBio={user?.bio || ''}
      handleSubmit={handleSubmit}
      redirectPath="/user/profile"
      title="Your Profile Bio"
      description="Tell others about your interests and background"
    />
  );
};

export default UserBioPage;