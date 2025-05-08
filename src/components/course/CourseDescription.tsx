const CourseDescription = ({
    instructor,
    description,
    rating,
    students,
    duration,
    level
  }: {
    title: string;
    instructor: string;
    description: string;
    rating: number;
    students: number;
    duration: string;
    level: string;
  }) => {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-xl font-bold mb-4">About This Course</h2>
        <p className="text-gray-700 mb-6">{description}</p>
        
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div>
            <p className="text-sm text-gray-500">Instructor</p>
            <p className="font-medium">{instructor}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Rating</p>
            <p className="font-medium">{rating}/5</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Students</p>
            <p className="font-medium">{students.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Duration</p>
            <p className="font-medium">{duration}</p>
          </div>
          <div>
            <p className="text-sm text-gray-500">Level</p>
            <p className="font-medium">{level}</p>
          </div>
        </div>
      </div>
    );
  };
  
  export default CourseDescription;