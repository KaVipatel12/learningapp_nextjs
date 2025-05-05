export function PageLoading() {
    return (
        <div className="grid place-items-center h-full min-h-[200px]">
          <div 
            className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
            role="status"
          >
            <span className="sr-only">Loading...</span>
          </div>
        </div>
      );
  }