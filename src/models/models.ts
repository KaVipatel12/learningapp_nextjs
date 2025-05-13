// models/index.js (create this file)
import mongoose, { Schema } from 'mongoose';

// Video interface and schema (embedded in Chapter)
interface IVideo {
  title: string;
  videoUrl: string;
  videoPublicId: string;
  duration: number;
}

const VideoSchema = new mongoose.Schema<IVideo>({
  title: { 
    type: String, 
    required: [true, 'Video title is required'] 
  },
  videoUrl: { 
    type: String, 
    required: [true, 'Video URL is required'] 
  },
  videoPublicId: { 
    type: String, 
    required: [true, 'Video public ID is required'] 
  },
  duration: { 
    type: Number, 
    default: 0 
  }
});

// Chapter interface and schema
export interface IChapter extends mongoose.Document {
  title: string;
  description: string;
  duration: number;
  videos: IVideo[];
  courseId: mongoose.Types.ObjectId;
}

const ChapterSchema = new mongoose.Schema<IChapter>({
  title: { 
    type: String, 
    required: [true, 'Chapter title is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Chapter description is required'] 
  },
  duration: { 
    type: Number, 
    default: 0 
  },
  videos: { 
    type: [VideoSchema],
    required: [true, 'Videos are required'],
    validate: {
      validator: function(videos: IVideo[]) {
        return videos.length > 0;
      },
      message: 'At least one video is required per chapter'
    }
  },
  courseId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Course',
    required: [true, 'Course ID is required'] 
  }
}, {
  timestamps: true
});

export interface ICourse extends Document {
    _id: string;
    title: string;
    description: string;
    price: number;
    discount?: number;
    courseImage?: string;
    category: string;
    level: string;
    language?: string;
    duration: number;
    totalSections: number;
    totalLectures: number;
    totalQuizzes?: number;
    chapters: mongoose.Types.ObjectId[];
    educator: mongoose.Types.ObjectId | string;
    educatorName?: string;
    isPublished: boolean;
    totalEnrollment: number;
    certification?: boolean;
    learningOutcomes?: string;
    prerequisites?: string;
    welcomeMessage?: string;
    completionMessage?: string;
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
    date?: string;
    imageUrl? : string, 
    imagePublicId:  string, 
  }

const CourseSchema = new mongoose.Schema<ICourse>({
  title: { 
    type: String, 
    required: [true, 'Course title is required'] 
  },
  description: { 
    type: String, 
    required: [true, 'Course description is required'] 
  },
  price: { 
    type: Number, 
    required: [true, 'Course price is required'],
    min: [0, 'Price cannot be negative'] 
  },
  imageUrl: { 
    type: String
  },
  imagePublicId: { 
    type: String
  },
  category: { 
    type: String, 
    required: [true, 'Category is required'] 
  },
  level: { 
    type: String, 
    required: [true, 'Level is required'] 
  },
  duration: { 
    type: Number, 
    default: 0 
  },
  totalSections: { 
    type: Number, 
    default: 0 
  },
  totalLectures: { 
    type: Number, 
    default: 0 
  },
  chapters: [{ 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Chapter' 
  }],
  educator: { 
    type: Schema.Types.ObjectId, 
    ref: 'Educator',
    required: [true, 'Educator ID is required'] 
  },
  educatorName : {
    type : String, 
    required : true
  }, 
  isPublished: { 
    type: Boolean, 
    default: false 
  }, 
  totalEnrollment: {
    type: Number, 
    default: 0
  }
}, {
  timestamps: true
});


export interface IEducator extends Document {
    _id: string;
    username: string;
    mobile: string;
    email: string;
    password: string;
    role: string;
    date?: string;
    courses: ICourse[]; 
    createdAt: string;
    updatedAt: string;
  }

const EducatorSchema = new mongoose.Schema<IEducator>({
  username: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "educator",
  },
  courses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
  }],
}, {
  timestamps: true
});

// Create and export models using the Next.js pattern to prevent overwrite errors
export const Chapter = mongoose.models.Chapter || mongoose.model<IChapter>('Chapter', ChapterSchema);
export const Course = mongoose.models.Course || mongoose.model<ICourse>('Course', CourseSchema);
export const Educator = mongoose.models.Educator || mongoose.model<IEducator>('Educator', EducatorSchema);