import { Schema, Document, Types, models, model } from 'mongoose';

// Updated Video interface
interface IVideo {
  title: string;  
  videoUrl: string;  
  videoPublicId: string;  
  previewLink?: string;
  duration: number;  
  createdAt?: Date; 
  updatedAt?: Date;  
}

// Updated Chapter interface extending Document
export interface IChapter extends Document {
  title: string;
  description: string;
  duration: number;  
  videos: IVideo[];
  comment: Types.ObjectId[];
  courseId: Types.ObjectId;
  order: number;  
  isPublished: boolean; 
  createdAt: Date;
  updatedAt: Date;
}

// Updated Chapter Schema
const chapterSchema = new Schema<IChapter>({
  title: { 
    type: String, 
    required: true,
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: { 
    type: String, 
    required: true,
    trim: true
  },
  duration: { 
    type: Number, 
    required: true,
    min: [0, 'Duration cannot be negative']
  },
  videos: [
    {
      title: { 
        type: String, 
        required: true,
        trim: true
      },
      videoUrl: { 
        type: String, 
        required: true
      },
      videoPublicId: {
        type: String,
        required: true
      },
      previewLink: { 
        type: String,
        trim: true
      },
      duration: { 
        type: Number, 
        required: true,
        min: [0, 'Duration cannot be negative']
      },
      createdAt: {
        type: Date,
        default: Date.now
      },
      updatedAt: {
        type: Date,
        default: Date.now
      }
    }
  ],
  comment: [
    { 
      type: Schema.Types.ObjectId, 
      ref: 'Comment' 
    }
  ],
  courseId: { 
    type: Schema.Types.ObjectId, 
    ref: 'Course', 
    required: true 
  },
  order: {
    type: Number,
    required: true,
    min: 0
  },
  isPublished: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true  // This will automatically add createdAt and updatedAt fields
});

interface ICourse extends Document {
  title: string;
  description: string;
  category: string;
  price: number;
  chapters: Types.ObjectId[];
  duration: number;
  level: string;
  language: string;
  prerequisites: string;
  learningOutcomes: string;
  certification: boolean;
  startDate: string;
  endDate: string;
  discount: number; 
  totalSections: number;
  totalLectures: number;
  totalQuizzes: number;
  welcomeMessage: string;
  completionMessage: string;
  courseImage?: string;
  educator: Types.ObjectId;
  educatorName: string;
  date: Date;
}

const courseSchema = new Schema<ICourse>({
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  price: { type: Number, required: true },
  duration: { type: Number, required: true },
  level: { type: String, required: true },
  language: { type: String, required: true },
  prerequisites: { type: String },
  learningOutcomes: { type: String },
  certification: { type: Boolean, default: false },
  startDate: { type: String },
  endDate: { type: String },
  discount: { type: Number, default: 0 },
  totalSections: { type: Number, default: 0 },
  totalLectures: { type: Number, default: 0 },
  totalQuizzes: { type: Number, default: 0 },
  welcomeMessage: { type: String },
  chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter'}],
  completionMessage: { type: String },
  courseImage: { type: String },
  educator: { type: Schema.Types.ObjectId, ref: 'Educator', required: true },
  educatorName: { type: String, required: true },
  date: { type: Date, default: Date.now }
}, { timestamps: true });

const Chapter = models.Chapter || model<IChapter>('Chapter', chapterSchema);
const Course = models.Course || model<ICourse>('Course', courseSchema);

export { Chapter, Course };