"use client"

import { useCallback, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { MoreVertical, Trash2, Edit } from 'lucide-react';
import ReviewsSection from '@/components/course/ReviewSection';
import ChatBox from '@/components/course/ChatBox';
import { useNotification } from "@/components/NotificationContext";
import CourseDescription from '@/components/course/CourseDescription';
import { PageLoading } from '@/components/PageLoading';

interface IVideo {
  title: string;
  videoUrl: string;
  videoPublicId: string;
  duration: number;
  _id: string;
}

interface IChapter {
  _id: string;
  title: string;
  description: string;
  duration: number;
  videos: IVideo[];
  courseId: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}
interface DropdownMenuItemProps {
  className?: string;
  children: React.ReactNode;
  key: string;
  onClick?: () => void;
}
const Button = ({ 
  variant = 'default', 
  size = 'default', 
  className = '', 
  children, 
  onClick,
  ...props 
}: {
  variant?: 'default' | 'destructive' | 'outline' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children: React.ReactNode;
  key: string;
  onClick?: () => void;
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none ring-offset-background';
  
  const variantStyles = {
    default: 'bg-primary text-primary-foreground hover:bg-primary/90',
    destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
    outline: 'border border-input hover:bg-accent hover:text-accent-foreground',
    ghost: 'hover:bg-accent hover:text-accent-foreground',
    link: 'underline-offset-4 hover:underline text-primary',
  };

  const sizeStyles = {
    default: 'h-10 py-2 px-4',
    sm: 'h-9 px-3 rounded-md',
    lg: 'h-11 px-8 rounded-md',
    icon: 'h-10 w-10',
  };

  return (
    <button
      className={`${baseStyles} ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  );
};

// Dropdown Components
const DropdownMenu = ({ children }: { children: React.ReactNode }) => {
  return <div className="relative">{children}</div>;
};

const DropdownMenuTrigger = ({ asChild, children }: { asChild?: boolean, children: React.ReactNode }) => {
  return asChild ? children : <button>{children}</button>;
};

const DropdownMenuContent = ({ 
  align = 'center', 
  children 
}: { 
  align?: 'start' | 'center' | 'end', 
  children: React.ReactNode 
}) => {
  const alignment = {
    start: 'left-0',
    center: 'left-1/2 -translate-x-1/2',
    end: 'right-0',
  };

  return (
    <div className={`absolute ${alignment[align]} mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 focus:outline-none z-50`}>
      <div className="py-1">
        {children}
      </div>
    </div>
  );
};

const DropdownMenuItem = ({ 
  className = '', 
  children, 
  onClick,
  ...props 
}: DropdownMenuItemProps) => {
  return (
    <div 
      className={`${className} px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 cursor-pointer flex items-center`}
      onClick={onClick}
      {...props}
    >
      {children}
    </div>
  );
};

// Dialog Components
const Dialog = ({ 
  open, 
  onOpenChange, 
  children 
}: { 
  open: boolean, 
  onOpenChange: (open: boolean) => void, 
  children: React.ReactNode 
}) => {
  if (!open) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="fixed inset-0 bg-black/50" onClick={() => onOpenChange(false)} />
      {children}
    </div>
  );
};

const DialogContent = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="relative z-50 bg-white rounded-lg shadow-lg max-w-md w-full mx-4">
      {children}
    </div>
  );
};

const DialogHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-b px-6 py-4">
      {children}
    </div>
  );
};

const DialogTitle = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="text-lg font-semibold">{children}</h3>;
};

const DialogFooter = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="border-t px-6 py-4 flex justify-end gap-2">
      {children}
    </div>
  );
};

const ChapterPage = () => {
  const params = useParams();
  const { showNotification } = useNotification();
  const courseId = params.courseId as string; 
  const chapterId = params.chapterId as string; 
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const isOwner = true; // Hardcoded for now
  const [chapter, setChapter] = useState<IChapter | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchChapter = useCallback(async () => {
    try {
      const response = await fetch(`/api/course/${courseId}/chapters/${chapterId}`); 
      
      if (!response.ok) {
        throw new Error('Failed to fetch chapter');
      }

      const data = await response.json(); 
      setChapter(data.msg);
    } catch (error) {
      showNotification("There was an error fetching the chapter", "error");
      console.error(error);
    } finally {
      setLoading(false);
    }
  }, [chapterId, courseId]);

  useEffect(() => {
    fetchChapter(); 
  }, [fetchChapter]);

  // Hardcoded reviews data
  const reviews = [
    {
      id: 1,
      user: "John Smith",
      rating: 5,
      comment: "Excellent chapter! The instructor explains complex concepts very clearly.",
      date: "2 weeks ago"
    },
    {
      id: 2,
      user: "Alice Johnson",
      rating: 4,
      comment: "Very informative, but some sections could use more examples.",
      date: "1 month ago"
    }
  ];

  const handleDeleteChapter = () => {
    console.log("Deleting chapter:", chapterId);
    // API call would go here
    setShowDeleteModal(false);
  };

  if (loading) {
    return <PageLoading />;
  }

  if (!chapter) {
    return <div className="max-w-7xl mx-auto px-4 py-8">Chapter not found</div>;
  }

  // Get the first (and only) video
  const video = chapter.videos[0];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header with chapter title and options */}
      <div className="flex justify-between items-start mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">{chapter.title}</h1>
          <p className="text-gray-600 mt-2">{chapter.description.substring(0, 100)}...</p>
        </div>
        
        {isOwner && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button key='options' variant="ghost" size="icon">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem key='edit' className="flex items-center gap-2">
                <Edit className="h-4 w-4" />
                Edit chapter
              </DropdownMenuItem>
              <DropdownMenuItem key='delete'
                className="flex items-center gap-2 text-red-600"
                onClick={() => setShowDeleteModal(true)}
              >
                <Trash2 className="h-4 w-4" />
                Delete chapter
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-8">
          {/* Video Player */}
          <div className="bg-black rounded-xl overflow-hidden">
            {video && (
              <div className="w-full aspect-video flex items-center justify-center">
                <video 
                  src={video.videoUrl} 
                  controls 
                  className="w-full h-full"
                />
              </div>
            )}
          </div>

          {/* Chapter Description */}
          <CourseDescription
            title={chapter.title}
            instructor="Instructor Name" // Hardcoded for now
            description={chapter.description}
            rating={4.5} // Hardcoded for now
            students={120} // Hardcoded for now
            duration={`${chapter.duration} hours`}
            level="Intermediate" // Hardcoded for now
          />

          {/* Reviews Section */}
          <ReviewsSection reviews={reviews} />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Chat Box */}
          <ChatBox />
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Dialog open={showDeleteModal} onOpenChange={setShowDeleteModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete chapter</DialogTitle>
          </DialogHeader>
          <p className="text-gray-600">
            Are you sure you want to delete this chapter? This action cannot be undone.
          </p>
          <DialogFooter>
            <Button key='cancel' variant="outline" onClick={() => setShowDeleteModal(false)}>
              Cancel
            </Button>
            <Button key='confirm' variant="destructive" onClick={handleDeleteChapter}>
              Delete
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default ChapterPage;