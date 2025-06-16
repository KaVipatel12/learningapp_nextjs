'use client';

import { useNotification } from '@/components/NotificationContext';
import { PageLoading } from '@/components/PageLoading';
import { useUser } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Check, Plus, X } from 'lucide-react';

interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

interface UserSelections {
  selectedCategories: string[];
}

interface CategoryUpdateProps {
  maxSelections?: number;
}

const CategoryUpdatePage: React.FC<CategoryUpdateProps> = ({
  maxSelections = 3
}) => {
  const { user, userLoading , fetchUserData } = useUser();
  const [selections, setSelections] = useState<UserSelections>({ selectedCategories: [] });
  const [pageLoading, setPageLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  // Initialize with user's current categories
  useEffect(() => {
    setPageLoading(userLoading); 
    if (user?.category) {
      setSelections({ selectedCategories: [...user.category] });
    }
  }, [user, userLoading]);

  const categories: Category[] = [
    { id: "Programming", name: 'Programming', icon: '💻' },
    { id: "Design", name: 'Design', icon: '🎨' },
    { id: "Business", name: 'Business', icon: '📈' },
    { id: "Marketing", name: 'Marketing', icon: '📢' },
    { id: "Photography", name: 'Photography', icon: '📷' },
    { id: "Music", name: 'Music', icon: '🎵' },
    { id: "Health", name: 'Health', icon: '❤️' },
    { id: "Language", name: 'Language', icon: '🗣️' },
  ];

  const handleCategoryToggle = (categoryId: string): void => {
    const currentIndex = selections.selectedCategories.indexOf(categoryId);
    const newSelectedCategories = [...selections.selectedCategories];
    
    if (currentIndex === -1) {
      if (newSelectedCategories.length < maxSelections) {
        newSelectedCategories.push(categoryId);
      } else {
        showNotification(`You can select maximum ${maxSelections} categories`, "info");
        return;
      }
    } else {
      newSelectedCategories.splice(currentIndex, 1);
    }

    setSelections({ selectedCategories: newSelectedCategories });
  };

  const handleSubmit = async () => {
    if (selections.selectedCategories.length === 0) {
      showNotification("Please select at least one category", "error");
      return;
    }

    setSubmitting(true);

    try {
      const res = await fetch("/api/user/category/updatecategory", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          categories: selections.selectedCategories
        })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
          return showNotification(data.msg, "error"); 
      }

      showNotification("Categories updated successfully!", "success");
      router.push("/user/bio");
      fetchUserData(); 
    } catch (error) {
      let errorMessage = "An unknown error occurred";
      
      if (error instanceof Error) {
        errorMessage = error.message;
        
        if (error.message.includes("already added")) {
          errorMessage = "You've already selected these categories";
        } else if (error.message.includes("Maximum 3 categories")) {
          errorMessage = `You can select maximum ${maxSelections} categories`;
        }
      }
      
      showNotification(errorMessage, "error");
      console.error("Category update error:", error);
    } finally {
      setSubmitting(false);
    }
  };

  const isSelected = (categoryId: string): boolean =>
    selections.selectedCategories.includes(categoryId);

  if(pageLoading){
    return <PageLoading />;
  }

  return (
    <div className="min-h-screen bg-white p-6">
      <div className="max-w-4xl mx-auto">
        <center>
        <h1 className="text-3xl font-bold text-purple-900 mb-8">{selections.selectedCategories.length > 0 ? "Update Your Interests" : "Select your Interests"} </h1>
        </center>
        {/* Selected Categories */}
        {selections.selectedCategories.length > 0 && (
          <div className="mb-8">
            <h2 className="text-xl font-semibold text-purple-800 mb-4">Your Selected Categories</h2>
            <div className="flex flex-wrap gap-3">
              {selections.selectedCategories.map(categoryId => {
                const category = categories.find(c => c.id === categoryId);
                return category ? (
                  <div 
                    key={category.id}
                    className="flex items-center gap-2 
                    -to-r from-pink-100 to-purple-100 text-purple-800 px-4 py-2 rounded-full shadow-sm"
                  >
                    <span>{category.name}</span>
                    <button 
                      onClick={() => handleCategoryToggle(category.id)}
                      className="text-pink-600 hover:text-pink-800"
                    >
                      <X size={16} />
                    </button>
                  </div>
                ) : null;
              })}
            </div>
          </div>
        )}

        {/* Categories Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map(category => {
            const selected = isSelected(category.id);
            return (
              <div
                key={category.id}
                onClick={() => handleCategoryToggle(category.id)}
                className={`p-4 rounded-lg border cursor-pointer transition-all ${
                  selected
                    ? 'border-purple-500 bg-gradient-to-r from-purple-50 to-pink-50 shadow-md'
                    : 'border-gray-200 bg-white hover:shadow-sm'
                } ${
                  selections.selectedCategories.length >= maxSelections && !selected
                    ? 'opacity-50 cursor-not-allowed'
                    : ''
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <span className="text-2xl mr-2">{category.icon}</span>
                    <h3 className="font-medium text-purple-900">{category.name}</h3>
                  </div>
                  {selected ? (
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
          {selections.selectedCategories.length} of {maxSelections} categories selected
        </div>

        {/* Action Buttons */}
        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || selections.selectedCategories.length === 0}
            className={`px-6 py-3 rounded-lg font-medium ${
              selections.selectedCategories.length > 0 && !submitting
                ? 'bg-gradient-to-r from-purple-600 to-pink-600 text-white hover:from-purple-700 hover:to-pink-700 shadow-lg'
                : 'bg-gray-200 text-gray-500 cursor-not-allowed'
            }`}
          >
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryUpdatePage;