"use client";

import { useNotification } from '@/components/NotificationContext';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

// Interface for Category
interface Category {
  id: string;
  name: string;
  icon: string;
  description?: string;
}

// Interface for User Selections
interface UserSelections {
  selectedCategories: string[];
}

// Props without onComplete
interface CategorySelectionProps {
  initialSelections?: UserSelections;
  maxSelections?: number;
}

const CategorySelectionPage: React.FC<CategorySelectionProps> = ({
  initialSelections = { selectedCategories: [] },
  maxSelections = 3
}) => {
  const [selections, setSelections] = useState<UserSelections>(initialSelections);
  const [submitting, setSubmitting] = useState(false);
  const router = useRouter(); 
  const { showNotification } = useNotification();
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
      }
    } else {
      newSelectedCategories.splice(currentIndex, 1);
    }

    setSelections({ selectedCategories: newSelectedCategories });
  };

  const handleSubmit = async () => {
  if (selections.selectedCategories.length === 0) return;

  setSubmitting(true);

  try {
    const res = await fetch("/api/user/category/addcategory", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        categories: selections.selectedCategories
      })
    });
    
    const data = await res.json();

    if (!res.ok) {
      if (res.status === 400 && data.message) {
       return showNotification(data.message, "error"); 
      }
      return showNotification(data.message || "Failed to save preferences", "error");
    }

    router.push("/")
  } catch (error) {
    let errorMessage = "An unknown error occurred";
    
    if (error instanceof Error) {
      errorMessage = error.message;
      
      // Handle specific error cases
      if (error.message.includes("already added")) {
        errorMessage = "You've already selected these categories";
      } else if (error.message.includes("Maximum 3 categories")) {
        errorMessage = "You can select maximum 3 categories";
      }
    }
    
    showNotification(errorMessage, "error");
    
    // For debugging
    console.error("Preferences save error:", error);
  } finally {
    setSubmitting(false);
  }
};

  const isSelected = (categoryId: string): boolean =>
    selections.selectedCategories.includes(categoryId);

  const isSelectionLimitReached = (): boolean =>
    selections.selectedCategories.length >= maxSelections;

  const canSelectCategory = (categoryId: string): boolean =>
    !isSelectionLimitReached() || isSelected(categoryId);

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            What are you interested in?
          </h1>
          <p className="text-lg text-gray-600">
            Select up to {maxSelections} categories to personalize your learning experience
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
              disabled={!canSelectCategory(category.id)}
              className={`flex flex-col items-center justify-center p-6 rounded-lg border-2 transition-all 
                ${isSelected(category.id) 
                  ? 'border-indigo-500 bg-indigo-50 text-indigo-700' 
                  : 'border-gray-200 hover:border-gray-300 bg-white text-gray-700'}
                ${!canSelectCategory(category.id) 
                  ? 'opacity-50 cursor-not-allowed' 
                  : 'cursor-pointer'}
              `}
              aria-label={`Select ${category.name} category`}
            >
              <span className="text-3xl mb-2">{category.icon}</span>
              <span className="font-medium">{category.name}</span>
            </button>
          ))}
        </div>
        <div className="text-center">
          <button
            onClick={handleSubmit}
            disabled={selections.selectedCategories.length === 0 || submitting}
            className={`px-8 py-3 rounded-md text-lg font-medium text-white 
              ${selections.selectedCategories.length > 0 && !submitting
                ? 'bg-indigo-600 hover:bg-indigo-700'
                : 'bg-gray-400 cursor-not-allowed'}
            `}
            aria-label="Continue to dashboard"
          >
            {submitting ? "Saving..." : "Continue to Dashboard"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default CategorySelectionPage;
