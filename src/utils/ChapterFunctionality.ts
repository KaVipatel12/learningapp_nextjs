export const chapterActions = {
    update: async (courseId: string, data: unknown) => {
      try {
        const response = await fetch(`/api/courses/${courseId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(data)
        });
        return await response.json();
      } catch {
        return { success: false, message: 'Update failed' };
      }
    },
  
    delete: async (courseId: string , chapterIds : string[]) => {
      try {
        const response = await fetch(`/api/educator/deletechapter/${courseId}`, {
            method: 'DELETE',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ courseId , chapterIds }),
          });

        return await response.json();
      } catch {
        return { success: false, message: 'Delete failed' };
      }
    }
  };