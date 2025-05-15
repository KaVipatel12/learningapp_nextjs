"use client";

import { useNotification } from '@/components/NotificationContext';
import { PageLoading } from '@/components/PageLoading';
import { useUser } from '@/context/userContext';
import { useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';

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
  const { user , userLoading } = useUser();
  const [selections, setSelections] = useState<UserSelections>({ selectedCategories: [] });
  const [ pageLoading, setPageLoading] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter();
  const { showNotification } = useNotification();

  // Initialize with user's current categories
  useEffect(() => {

    setPageLoading(userLoading); 
    if (user?.category) {
      setSelections({ selectedCategories: [...user.category] });
    }
  }, [user , userLoading]);

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
      router.push("/user/profile");
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
    return(
        <PageLoading></PageLoading>
    )
  }
  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Update Your Interests
          </h1>
          <p className="text-lg text-gray-600">
            {user?.category?.length ? 
              "Modify your selected categories" : 
              "Select categories to personalize your experience"
            }
          </p>
          <div className="mt-2">
            <span className="text-sm text-gray-500">
              {selections.selectedCategories.length}/{maxSelections} selected
            </span>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4 mb-12">
          {categories.map((category) => (
            <button
              key={category.id}
              onClick={() => handleCategoryToggle(category.id)}
              disabled={selections.selectedCategories.length >= maxSelections && !isSelected(category.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all 
                ${isSelected(category.id) 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'}
                ${selections.selectedCategories.length >= maxSelections && !isSelected(category.id) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'}
              `}
              aria-label={`${isSelected(category.id) ? 'Deselect' : 'Select'} ${category.name} category`}
            >
              <span className="text-3xl mb-2">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <button
            onClick={() => router.back()}
            disabled={submitting}
            className="px-6 py-2 rounded-md font-medium text-gray-700 bg-white border border-gray-300 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={submitting || JSON.stringify(selections.selectedCategories.sort()) === 
              JSON.stringify(user?.category?.sort() || [])}
            className={`px-6 py-2 rounded-md font-medium text-white 
              ${!submitting ? 'bg-indigo-600 hover:bg-indigo-700' : 'bg-indigo-400'}
              ${JSON.stringify(selections.selectedCategories.sort()) === 
                JSON.stringify(user?.category?.sort() || []) 
                ? 'opacity-50 cursor-not-allowed' : ''}
            `}
          >
            {submitting ? (
              <span className="flex items-center justify-center">
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                Updating...
              </span>
            ) : (
              'Save Changes'
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategoryUpdatePage;