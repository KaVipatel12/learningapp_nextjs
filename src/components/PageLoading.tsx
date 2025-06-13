export function PageLoading() {
    return (
     <div className="mx-auto p-6 bg-white rounded-lg shadow-md w-full">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
          <div className="space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            {[1, 2].map((i) => (
              <div key={i} className="border border-gray-200 rounded-md p-4 space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                <div className="h-10 bg-gray-200 rounded"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
      );
  }