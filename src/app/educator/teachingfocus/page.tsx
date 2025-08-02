'use client';

import { useState, useEffect, useCallback } from 'react';
import { Check, Plus, X } from 'lucide-react';
import { useNotification } from '@/components/NotificationContext';
import { PageLoading } from '@/components/PageLoading';
import { useUser } from '@/context/userContext';

// All available focus areas
const allFocusAreas = [
  'Quality Education',
  'Student Success',
  'Practical Skills',
  'Interactive Learning',
  'Career Advancement',
  'Technology Integration',
  'Creative Thinking',
  'Research-Based Methods',
  'Inclusive Education',
  'Project-Based Learning',
  'Critical Thinking',
  'Collaborative Learning'
];

// Categories for tabs
const categories = {
  all: allFocusAreas,
  teaching: ['Quality Education', 'Student Success', 'Inclusive Education'],
  methods: ['Practical Skills', 'Project-Based Learning', 'Research-Based Methods'],
  skills: ['Critical Thinking', 'Creative Thinking', 'Collaborative Learning'],
  tech: ['Technology Integration', 'Career Advancement']
};

const TeachingFocusPage = () => {
  const [selectedFocus, setSelectedFocus] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState('all');
  const [loading, setLoading] = useState(true);
  const [submitLoading, setSubmitLoading] = useState(false);
  const { showNotification } = useNotification();
  const { fetchUserData } = useUser()
  // Fetch teaching focus from API
  const fetchTeachingFocus = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/educator/teachingfocus');
      
      const data = await response.json();
      
      if(!response.ok){
        return;
      }

      if (Array.isArray(data.teachingFocus)) {
        const validFocus = data.teachingFocus.filter((focus: string) => 
          allFocusAreas.includes(focus)
        );
        setSelectedFocus(validFocus);
      }
    } catch {
      console.log("There is some error")
    } finally {
      setLoading(false);
    }
  }, []);

  // Save teaching focus to API
  const saveTeachingFocus = async () => {
    setSubmitLoading(true)
    try {
      const response = await fetch('/api/educator/teachingfocus', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          teachingFocus: selectedFocus
        })
      });

      const data = await response.json();

      if (!response.ok) {
        showNotification(data.msg || "Fail to save", "error")
      }
      
      showNotification("Saved Successfully", "success");
      fetchUserData(); 
      window.location.href = '/user/profile'  // There were glitch in loading educator data so i am using it
    } catch {
      showNotification("There is some error", "error");
    }finally{
      setSubmitLoading(false)
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchTeachingFocus();
  }, [fetchTeachingFocus]);

  // Toggle focus area selection
  const toggleFocusArea = (focus: string) => {
    setSelectedFocus(prev => {
      if (prev.includes(focus)) {
        return prev.filter(f => f !== focus);
      } else if (prev.length < 5) {
        return [...prev, focus];
      }
      return prev;
    });
  };

  // Filter focus areas based on active tab
  const filteredFocusAreas = activeTab === 'all' 
    ? allFocusAreas 
    : categories[activeTab as keyof typeof categories];

  if (loading) {
    return (
      <PageLoading></PageLoading>
    );
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-purple-900 mb-8">Teaching Focus Areas</h1>
        
        {/* Selected Focus Areas */}
        {selectedFocus.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">Your Selected Focus Areas</h2>
            <div className="flex flex-wrap gap-3">
              {selectedFocus.map(focus => (
                <div 
                  key={focus}
                  className="flex items-center gap-2 bg-gradient-to-r from-pink-100 to-purple-100 text-purple-800 px-4 py-2 rounded-full shadow-sm"
                >
                  <span>{focus}</span>
                  <button 
                    onClick={() => toggleFocusArea(focus)}
                    className="text-pink-600 hover:text-pink-800"
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Category Tabs */}
        <div className="flex overflow-x-auto pb-2 mb-6 gap-1">
          {Object.keys(categories).map(category => (
            <button
              key={category}
              onClick={() => setActiveTab(category)}
              className={`px-4 py-2 rounded-md whitespace-nowrap capitalize ${
                activeTab === category
                  ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {/* Focus Areas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredFocusAreas.map(focus => {
            const isSelected = selectedFocus.includes(focus);
            return (
              <div
                key={focus}
                onClick={() => toggleFocusArea(focus)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  isSelected
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md'
                    : 'border-gray-200 bg-white hover:shadow-sm'
                }`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-medium text-purple-900">{focus}</h3>
                  {isSelected ? (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-r from-purple-600 to-pink-600 flex items-center justify-center text-white">
                      <Check size={16} />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full border border-gray-300 flex items-center justify-center text-gray-400">
                      <Plus size={16} />
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Selection Counter */}
        <div className="mt-8 text-center text-gray-600">
          {selectedFocus.length} of 5 focus areas selected
        </div>

        {/* Save Button */}
        <div className="mt-8 flex justify-center">
          {
            !submitLoading ?
            (<button
            onClick={saveTeachingFocus}
            className={`px-6 py-3 rounded-lg font-medium ${
              selectedFocus.length > 0
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
            disabled={selectedFocus.length === 0}
          >
            Save Focus Areas
          </button>) : 
          (<button
            className={`px-6 py-3 rounded-lg font-medium ${
              selectedFocus.length > 0
              ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
              : 'bg-gray-200 text-gray-500 cursor-not-allowed'
              }`}
              disabled={true}
              >
            submitting
          </button>)
          }
        </div>
      </div>
    </div>
  );
};

export default TeachingFocusPage;