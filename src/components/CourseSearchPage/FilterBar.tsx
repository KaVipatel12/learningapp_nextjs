"use client";

type Filters = {
  category?: string;
  price?: string;
  courseName?: string;
  educatorName?: string;
  page?: string;
};

type FilterBarProps = {
  filters: Filters;
  onFilterChange: (filters: Filters) => void;
};

export function FilterBar({ filters, onFilterChange }: FilterBarProps) {
  const categories = [
    "Programming",
    "Design",
    "Business",
    "Marketing",
    "Photography",
    "Music"
  ];

  const priceRanges = [
    { label: "All Prices", value: "" },
    { label: "Under ₹500", value: "500" },
    { label: "Under ₹1000", value: "1000" },
    { label: "Under ₹2000", value: "2000" },
    { label: "Under ₹5000", value: "5000" }
  ];

  const handleChange = (name: keyof Filters, value: string) => {
    onFilterChange({
      ...filters,
      [name]: value,
      page: "1" // Reset to first page when filter changes
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="flex-1 w-full">
          <label htmlFor="category-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Category
          </label>
          <select
            id="category-filter"
            value={filters.category || ""}
            onChange={(e) => handleChange("category", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">All Categories</option>
            {categories.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1 w-full">
          <label htmlFor="price-filter" className="block text-sm font-medium text-gray-700 mb-1">
            Price Range
          </label>
          <select
            id="price-filter"
            value={filters.price || ""}
            onChange={(e) => handleChange("price", e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
          >
            {priceRanges.map((range) => (
              <option key={range.value || "all"} value={range.value}>
                {range.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-none self-end mt-4 md:mt-0">
          <button
            onClick={() =>
              onFilterChange({
                courseName: "",
                educatorName: "",
                category: "",
                price: "",
                page: "1"
              })
            }
            className="px-4 py-2 bg-gray-100 rounded-md hover:bg-gray-200 text-gray-700 font-medium transition-colors flex items-center"
          >
            <svg className="w-4 h-4 mr-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            Reset All
          </button>
        </div>
      </div>
      
      {/* Active Filters Display */}
      {(filters.category || filters.price || filters.courseName || filters.educatorName) && (
        <div className="mt-3 flex flex-wrap gap-2">
          {filters.category && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Category: {filters.category}
              <button 
                onClick={() => handleChange("category", "")}
                className="ml-1 text-blue-500 hover:text-blue-700"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.price && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Under ₹{filters.price}
              <button 
                onClick={() => handleChange("price", "")}
                className="ml-1 text-green-500 hover:text-green-700"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.courseName && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
              Course: `{filters.courseName}`
              <button 
                onClick={() => handleChange("courseName", "")}
                className="ml-1 text-purple-500 hover:text-purple-700"
              >
                ×
              </button>
            </span>
          )}
          
          {filters.educatorName && (
            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
              Educator: `{filters.educatorName}`
              <button 
                onClick={() => handleChange("educatorName", "")}
                className="ml-1 text-yellow-500 hover:text-yellow-700"
              >
                ×
              </button>
            </span>
          )}
        </div>
      )}
    </div>
  );
}