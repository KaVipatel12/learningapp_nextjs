"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useNotification } from '@/components/NotificationContext';
import { PageLoading } from '@/components/PageLoading';

interface BioPageProps {
  initialBio?: string;
  maxLength?: number;
  handleSubmit: (bio: string) => Promise<void>;
  redirectPath: string;
  title?: string;
  description?: string;
}

const BioInput = ({
  initialBio = '',
  maxLength = 500,
  handleSubmit,
  redirectPath,
  title = 'Update Your Bio',
  description = 'Tell us about yourself'
}: BioPageProps) => {
  const [bio, setBio] = useState(initialBio);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  useEffect(() => {
    setBio(initialBio);
    setLoading(false);
  }, [initialBio]);

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await handleSubmit(bio);
      showNotification("Bio updated successfully!", "success");
      router.push(redirectPath);
    } catch (error) {
      showNotification("Failed to update bio. Please try again.", "error");
      console.error("Bio update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 rounded-t-xl text-white">
          <h1 className="text-2xl font-bold mt-13">{title}</h1>
          <p className="text-purple-100">{description}</p>
        </div>
        <div className="bg-white rounded-b-xl shadow-lg p-6 border border-gray-200">
          <form onSubmit={handleFormSubmit} className="space-y-6">
            <div>
              <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-2">
                About You
              </label>
              <textarea
                id="bio"
                name="bio"
                value={bio}
                onChange={(e) => setBio(e.target.value)}
                rows={8}
                maxLength={maxLength}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition resize-y min-h-[200px]"
                placeholder="Share something about yourself..."
              />
              <div className="text-right text-sm text-gray-500 mt-1">
                {bio.length}/{maxLength} characters
              </div>
            </div>

            <div className="flex justify-end gap-4 pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => router.back()}
                disabled={submitting}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting || bio === initialBio}
                className={`px-6 py-3 rounded-lg font-medium ${
                  !submitting && bio !== initialBio
                    ? 'bg-gradient-to-r from-purple-600 to-pink-500 text-white hover:from-purple-700 hover:to-pink-600 shadow-md hover:shadow-lg'
                    : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                }`}
              >
                {submitting ? 'Saving...' : 'Save Bio'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default BioInput;