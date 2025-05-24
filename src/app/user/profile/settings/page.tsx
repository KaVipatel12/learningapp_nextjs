"use client";

import LoadingSpinner from '@/components/LoadingSpinner';
import { useNotification } from '@/components/NotificationContext';
import { PageLoading } from '@/components/PageLoading';
import { UserData, useUser } from '@/context/userContext';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { FiUser, FiLock, FiBook, FiArrowRight } from 'react-icons/fi';

type PasswordData = {
  current: string;
  new: string;
  confirm: string;
};

export default function UserSettingsPage() {
  const [activeTab, setActiveTab] = useState<'profile' | 'password' | 'goals'>('profile');
  const { user, userLoading } = useUser();
  const [userData, setUserData] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setLoading(userLoading);
      if (!userLoading && user) {
        setUserData(user);
      }
    }
  }, [user, userLoading]);

  if (loading) {
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="bg-gradient-to-r from-purple-600 to-pink-500 p-6 text-white">
            <h1 className="text-2xl font-bold">Account Settings</h1>
            <p className="text-purple-100">Manage your profile and preferences</p>
          </div>

          <div className="grid md:grid-cols-4">
            <div className="md:col-span-1 bg-gray-50 p-4 border-r">
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`flex items-center w-full p-3 rounded-lg font-medium transition ${activeTab === 'profile' ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'}`}
                >
                  <FiUser className="mr-3" /> Profile
                </button>
                <button
                  onClick={() => setActiveTab('password')}
                  className={`flex items-center w-full p-3 rounded-lg font-medium transition ${activeTab === 'password' ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'}`}
                >
                  <FiLock className="mr-3" /> Password
                </button>
                <button
                  onClick={() => setActiveTab('goals')}
                  className={`flex items-center w-full p-3 rounded-lg font-medium transition ${activeTab === 'goals' ? 'text-purple-700 bg-purple-50' : 'text-gray-600 hover:text-purple-700 hover:bg-purple-50'}`}
                >
                  <FiBook className="mr-3" /> Learning Goals
                </button>
              </nav>
            </div>

            <div className="md:col-span-3 p-6 md:p-8">
              {activeTab === 'profile' && (
                <ProfileSection userData={userData} setUserData={setUserData} />
              )}
              {activeTab === 'password' && <PasswordSection />}
              {activeTab === 'goals' && <GoalsSection />}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function ProfileSection({
  userData,
  setUserData
}: {
  userData: UserData;
  setUserData: React.Dispatch<React.SetStateAction<UserData | null>>;
}) {
  const [formData, setFormData] = useState({
    username: userData?.username || '',
    bio: userData?.bio || '',
  });
  
  const { showNotification } = useNotification(); 
  const [submitLoading, setSubmitLoading] = useState(false); 

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitLoading(true);
    
    try {
      const response = await fetch(`/api/user/editprofile`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          formData
        })
      }); 

      const data = await response.json(); 
      if(!response.ok) {
        return showNotification(data.msg, "error");
      }
      
      showNotification("Profile updated successfully", "success"); 
      setUserData(prev => (prev ? { ...prev, ...formData } : null));
    } catch {
      showNotification("There was an error updating your profile", "error"); 
    } finally {
      setSubmitLoading(false);
    }
  }

  return (
    <>
      {/* <UserNav /> */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FiUser className="mr-2 text-purple-600" /> Profile Information
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-1">
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              value={formData.username}
              onChange={handleInputChange}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div>
            <label htmlFor="bio" className="block text-sm font-medium text-gray-700 mb-1">
              Bio
            </label>
            <textarea
              id="bio"
              name="bio"
              value={formData.bio}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
            />
          </div>

          <div className="pt-4 border-t border-gray-200">
            {!submitLoading ? ( 
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
              >
                Update Profile
              </button>
            ) : (
              <button
                type="submit"
                className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
                disabled={true}
              >
                Updating...
              </button>
            )}
          </div>
        </form>
      </div>
    </>
  );
}

function PasswordSection() {
  const [showPasswordFields, setShowPasswordFields] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const {showNotification} = useNotification(); 

  const [passwords, setPasswords] = useState<PasswordData>({
    current: '',
    new: '',
    confirm: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswords(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (passwords.new !== passwords.confirm) {
      showNotification('New passwords do not match', "error");
      return;
    }

    setSubmitLoading(true);
    
    try {
      const response = await fetch(`/api/user/editprofile/editpassword`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          passwords 
        })
      }); 

      const data = await response.json(); 
      if(!response.ok) {
        return showNotification(data.msg, "error");
      }
      
      showNotification("Password updated successfully", "success"); 
      setPasswords({ current: '', new: '', confirm: '' });
      setShowPasswordFields(false);
    } catch {
      showNotification("There was an error updating your password", "error"); 
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <>
      {/* <UserNav /> */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FiLock className="mr-2 text-purple-600" /> Password Settings
        </h2>

        {!showPasswordFields ? (
          <div className="space-y-4">
            <button
              onClick={() => setShowPasswordFields(true)}
              className="w-full px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Update Password
            </button>

            <div className="text-center">
              <button className="text-purple-600 hover:text-purple-800 font-medium flex items-center justify-center mx-auto">
                Forgot Password? <FiArrowRight className="ml-1" />
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="current" className="block text-sm font-medium text-gray-700 mb-1">
                Current Password
              </label>
              <input
                type="password"
                id="current"
                name="current"
                value={passwords.current}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
              />
            </div>

            <div>
              <label htmlFor="new" className="block text-sm font-medium text-gray-700 mb-1">
                New Password
              </label>
              <input
                type="password"
                id="new"
                name="new"
                value={passwords.new}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
                minLength={7}
              />
            </div>

            <div>
              <label htmlFor="confirm" className="block text-sm font-medium text-gray-700 mb-1">
                Confirm New Password
              </label>
              <input
                type="password"
                id="confirm"
                name="confirm"
                value={passwords.confirm}
                onChange={handleChange}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent transition"
                required
                minLength={7}
              />
            </div>

            <div className="flex justify-between pt-4 border-t border-gray-200">
              <button
                type="button"
                onClick={() => {
                  setShowPasswordFields(false);
                }}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
              >
                Cancel
              </button>
              {!submitLoading ? (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
                >
                  Update Password
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
                  disabled={true}
                >
                  Updating password...
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </>
  );
}

function GoalsSection() {
  const { user, userLoading } = useUser(); 
  const [loading, setLoading] = useState(false);
  const [learningGoals, setLearningGoals] = useState<string[] | undefined | null>(null);

  useEffect(() => {
    if (user) {
      setLoading(userLoading);
      if (!userLoading && user) {
        setLearningGoals(user.category);
      }
    }
  }, [user, userLoading]);

  return (
    <>
      {/* <UserNav /> */}
      <div className="max-w-lg mx-auto">
        <h2 className="text-xl font-semibold text-gray-800 mb-6 flex items-center">
          <FiBook className="mr-2 text-purple-600" /> Learning Goals
        </h2>

        <div className="space-y-4 mb-8">
          {loading ? (
            <LoadingSpinner height='h-6' />
          ) : (
            learningGoals?.map((goal, index) => (
              <div key={index} className="flex items-start">
                <div className="flex items-center justify-center h-6 w-6 rounded-full bg-purple-100 text-purple-600 mr-3 mt-0.5 flex-shrink-0">
                  {index + 1}
                </div>
                <p className="text-gray-700">{goal}</p>
              </div>
            ))
          )}

          {!loading && (
            <Link
              href="/category"
              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-500 text-white rounded-lg hover:from-purple-700 hover:to-pink-600 transition-all shadow-md hover:shadow-lg font-medium"
            >
              Update Goals <FiArrowRight className="ml-2" />
            </Link>
          )}
        </div>
      </div>
    </>    
  );
}