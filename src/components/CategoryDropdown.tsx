'use client';

import { courseCategories } from '@/constants/categories';

interface CategoryDropdownProps {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  name?: string;
  id?: string;
  required?: boolean;
  className?: string;
}

const CategoryDropdown: React.FC<CategoryDropdownProps> = ({ value, onChange, name = "category", id = "category", required = true, className }) => {
  return (
    <select
      name={name}
      id={id}
      value={value}
      onChange={onChange}
      required={required}
      className={`w-full p-3 border border-gray-300 rounded-lg focus:ring-pink-500 focus:border-pink-500 transition duration-150 ease-in-out ${className}`}
    >
      <option value="" disabled>-- Select a Category --</option>
      {courseCategories.map((category) => (
        <option key={category.id} value={category.id}>{category.name}</option>
      ))}
    </select>
  );
};

export default CategoryDropdown;