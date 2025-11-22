export interface AppCategory {
  id: string; // Unique identifier (e.g., for API calls, keys)
  name: string; // Display name
  icon?: string; // Optional icon
}

export const courseCategories: AppCategory[] = [
  { id: "programming", name: "Programming", icon: "💻" },
  { id: "data-science", name: "Data Science", icon: "📊" },
  { id: "ai-ml", name: "AI & Machine Learning", icon: "🤖" },
  { id: "web-development", name: "Web Development", icon: "🌐" },
  { id: "mobile-development", name: "Mobile Development", icon: "📱" },
  { id: "design", name: "Design", icon: "🎨" },
  { id: "business", name: "Business", icon: "📈" },
  { id: "marketing", name: "Marketing", icon: "📢" },
  { id: "photography", name: "Photography", icon: "📷" },
  { id: "music", name: "Music", icon: "🎵" },
  { id: "language", name: "Language", icon: "🗣️" },
  { id: "communication", name: "Communication", icon: "💬" },
  { id: "science", name: "Science", icon: "🔬" },
  { id: "personal-development", name: "Personal Development", icon: "🌱" },
  { id: "health-fitness", name: "Health & Fitness", icon: "💪" },
  { id: "finance-accounting", name: "Finance & Accounting", icon: "💰" },
  { id: "it-software", name: "IT & Software", icon: "🖥️" },
  { id: "office-productivity", name: "Office Productivity", icon: "📎" },
];

/**
 * A simple array of category names, derived from the main list.
 * Useful for simple dropdowns where only the name is needed.
 */
export const categoryNames: string[] = courseCategories.map(
  (category) => category.name
);

/**
 * A map for quick lookups by ID.
 * Example: `categoryMap.get('data-science')` returns the Data Science category object.
 */
export const categoryMap = new Map<string, AppCategory>(
  courseCategories.map((category) => [category.id, category])
);

/**
 * A helper function to get a category name from its ID.
 * Returns the name or the ID itself if not found.
 */
export const getCategoryNameById = (id: string): string => {
  return categoryMap.get(id)?.name || id;
};