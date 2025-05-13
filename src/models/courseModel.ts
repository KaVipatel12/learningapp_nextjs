import { model, models } from 'mongoose';
import { Schema, Document, Types } from 'mongoose';

// Video interface
interface IVideo {
  title: string;
  videoUrl: string;
  videoPublicId: string;
  duration: number;
}

// Video schema
const VideoSchema = new Schema<IVideo>({
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

// Chapter interface
export interface IChapter extends Document {
  title: string;
  description: string;
  duration: number;
  videos: IVideo[];
  courseId: Types.ObjectId;
}

// Chapter schema
const chapterSchema = new Schema<IChapter>({
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
    type: Schema.Types.ObjectId, 
    ref: 'Course',
    required: [true, 'Course ID is required'] 
  }
}, {
  timestamps: true
});

// Course interface
export interface ICourse extends Document {
  title: string;
  description: string;
  price: number;
  imageUrl?: string;
  imagePublicId?: string;
  category: string;
  level: string;
  duration: number;
  totalSections: number;
  totalLectures: number;
  chapters: Types.ObjectId[];
  educator: Types.ObjectId;
  educatorName : string; 
  isPublished: boolean;
  totalEnrollment : number; 
  prerequisites: string , 
  learningOutcomes: string
}

// Course schema
const courseSchema = new Schema<ICourse>({
  title: { 
    type: String, 
    required: [true, 'Course title is required'] 
  },
  prerequisites: {
    type : String
  }, 
  learningOutcomes: {
    type : String
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
    type: Schema.Types.ObjectId, 
    ref: 'Chapter' 
  }],
  educator: { 
    type: Schema.Types.ObjectId, 
    ref: 'Educator',
    required: [true, 'Educator ID is required'] 
  },
  isPublished: { 
    type: Boolean, 
    default: false 
  }, 
  totalEnrollment : {
    type : Number, 
    default : 0
  }
}, {
  timestamps: true
});

const Chapter = models.Chapter || model<IChapter>('Chapter', chapterSchema);
const Course = models.Course || model<ICourse>('Course', courseSchema);

export { Chapter, Course };