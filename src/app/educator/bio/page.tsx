"use client";

import { useEducator } from '@/context/educatorContext';
import { PageLoading } from '@/components/PageLoading';
import BioInput from '@/components/bioPage/BioInput';

const EducatorBioPage = () => {
  const { educator, educatorLoading } = useEducator();

  if (educatorLoading) {
    return <PageLoading />;
  }

  const handleSubmit = async (bio: string) => {
    const response = await fetch('/api/educator/bio', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ bio }),
    });

    const data = await response.json(); 
    if (!response.ok) {
      throw new Error(data.msg || 'Failed to update bio');
    }
  };

  return (
    <BioInput
      initialBio={educator?.bio || ''}
      handleSubmit={handleSubmit}
      redirectPath="/educator/profile"
      title="Educator Profile Bio"
      description="Tell students about your teaching experience and approach"
    />
  );
};

export default EducatorBioPage;