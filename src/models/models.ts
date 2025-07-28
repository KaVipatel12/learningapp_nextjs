// models/index.js (create this file)
import mongoose, { Schema, Types } from "mongoose";

// Video interface and schema (embedded in Chapter)
interface IVideo {
  title: string;
  videoUrl: string;
  videoPublicId: string;
  duration: number;
}

// Chapter interface and schema
export interface IChapter extends Document {
  title: string;
  description: string;
  duration: number;
  videos: IVideo[];
  courseId: mongoose.Types.ObjectId;
}

export interface IReport extends Document {
  description: string;
  courseId: mongoose.Types.ObjectId;
  reporterId : mongoose.Types.ObjectId; 
  chapterId: mongoose.Types.ObjectId;
  commentId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
}

export interface ICourse extends Document {
   status : string;
  _id: string;
  title: string;
  description: string;
  price: number;
  discount?: number;
  imageUrl?: string;
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
  imagePublicId: string;
}

// Define a type for the purchaseCourse subdocument
export interface IPurchaseCourse {
  courseId: mongoose.Types.ObjectId;
  purchaseDate?: Date;
}

// Define the main User interface
export interface IUser extends Document {
  _id: string;
  username: string;
  warnings : number; 
  mobile: string;
  status : string;
  bio: string;
  isOAuth ? : boolean; 
  email: string;
  password: string;
  wishlist: Types.ObjectId[];
  controll: number; // 0 = user, 1 = admin, 2 = editor
  restriction: number;
  date: Date;
  role: string; // "student" | "educator" | "admin"
  category: string[];
  comment: Types.ObjectId[];
  purchaseCourse: IPurchaseCourse[];
  // Educator fields
  courses?: Types.ObjectId[];
  teachingFocus?: string[];
  profilePic ? : string; 
}

export interface IComment extends Document {
  comment: string;
  userId?: Types.ObjectId;
  chapterId: Types.ObjectId;
  courseId: Types.ObjectId;
  educatorId?: Types.ObjectId;
  createdAt?: Date;
  updatedAt?: Date;
}

// Define the Review interface
export interface IReview extends Document {
  courseId: mongoose.Schema.Types.ObjectId;
  userId: mongoose.Schema.Types.ObjectId;
  rating: number;
}

// Add an index for faster querying
// Define schema
const userSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  mobile: { type: String },
  email: { type: String, required: true },
  bio: { type: String },
  warnings : { type: Number , default : 0 },
  password: { type: String },
  isOAuth : { type : Boolean , default : false}, 
  profilePic : { type : String},
  wishlist: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      default: [],
    },
  ],
  controll: {
    type: Number,
    default: 0, // 0 = user, 1 = admin, 2 = editor
  },
  restriction: {
    type: Number,
    default: 0, // 0 = not restricted, 1 = restricted
  },
  courses: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
  ],
  teachingFocus: [
    {
      type: String,
    },
  ],
  date: {
    type: Date,
    default: Date.now,
  },
  role: {
    type: String,
    default: "student",
  },
  category: [
    {
      type: String,
    },
  ],
  comment: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
  ],
  purchaseCourse: [
    {
      courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course" },
      purchaseDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Prevent model overwrite in dev with hot reload
const CourseSchema = new mongoose.Schema<ICourse>(
  {

    status : {
      type : String, 
      required : true,
      default : "pending"    // pending => Not verified by admin , approved => serving live , rejected => restricted by admin , restricted   
    }, 
    title: {
      type: String,
      required: [true, "Course title is required"],
    },
    description: {
      type: String,
      required: [true, "Course description is required"],
    },
    price: {
      type: Number,
      required: [true, "Course price is required"],
      min: [0, "Price cannot be negative"],
    },
    imageUrl: {
      type: String,
    },
    imagePublicId: {
      type: String,
    },
    category: {
      type: String,
      required: [true, "Category is required"],
    },
    level: {
      type: String,
      required: [true, "Level is required"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    totalSections: {
      type: Number,
      default: 0,
    },
    totalLectures: {
      type: Number,
      default: 0,
    },
    chapters: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Chapter",
      },
    ],
    educator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "Educator ID is required"],
    },
    educatorName: {
      type: String,
      required: true,
    },
    learningOutcomes: {
      type: String,
      required: true,
    },
    prerequisites: {
      type: String,
      required: true,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    totalEnrollment: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const VideoSchema = new mongoose.Schema<IVideo>({
  title: {
    type: String,
    required: [true, "Video title is required"],
  },
  videoUrl: {
    type: String,
    required: [true, "Video URL is required"],
  },
  videoPublicId: {
    type: String,
    required: [true, "Video public ID is required"],
  },
  duration: {
    type: Number,
    default: 0,
  },
});

const ChapterSchema = new mongoose.Schema<IChapter>(
  {
    title: {
      type: String,
      required: [true, "Chapter title is required"],
    },
    description: {
      type: String,
      required: [true, "Chapter description is required"],
    },
    duration: {
      type: Number,
      default: 0,
    },
    videos: {
      type: [VideoSchema],
      required: [true, "Videos are required"],
      validate: {
        validator: function (videos: IVideo[]) {
          return videos.length > 0;
        },
        message: "At least one video is required per chapter",
      },
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: [true, "Course ID is required"],
    },
  },
  {
    timestamps: true,
  }
);

/* const EducatorSchema = new mongoose.Schema<IEducator>(
  {
    username: { type: String, required: true },
    mobile: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    bio: { type: String },
    password: { type: String, required: true },
    date: {
      type: Date,
      default: Date.now,
    },
    role: {
      type: String,
      default: "educator",
    },
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
    teachingFocus: [
      {
        type: String,
      },
    ],
    comment: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],
  },
  {
    timestamps: true,
  }
); */

const commentSchema = new mongoose.Schema<IComment>({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    req: true,
  },
  chapterId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Chapter",
    req: true,
  },
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    req: true,
  },
  educatorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  comment: {
    type: String,
    req: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const ReviewSchema = new mongoose.Schema<IReview>({
  courseId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Course",
    required: true,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
});

export interface IHistory extends Document {
  userId: mongoose.Types.ObjectId;
  courseId: mongoose.Types.ObjectId;
  chapterId: mongoose.Types.ObjectId;
  videoId: string; // video._id OR videoUrl if unique
  watchedTime: number; // in seconds
  totalDuration: number; // for percentage calculation
  lastWatchedAt: Date;
  completed?: boolean;
}

const HistorySchema = new mongoose.Schema<IHistory>({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
  videoId: { type: String, required: true },  
  watchedTime: { type: Number, required: true },
  totalDuration: { type: Number, required: true },
  lastWatchedAt: { type: Date, default: Date.now },
  completed: { type: Boolean, default: false },
});


const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctOptionIndex: { type: Number, required: true },
});

const CourseQuizSchema = new mongoose.Schema(
  {
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    title: { type: String, required: true },
    questions: [QuestionSchema],
  },
  { timestamps: true }
);

const UserQuizAttemptSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "CourseQuiz",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    score: { type: Number, required: true },
    total: { type: Number, required: true },
    submittedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const ReportSchema = new mongoose.Schema<IReport>(
  {
    reporterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    description : {
      type : String,
      req : true
    }
  },
  { timestamps: true }
);

const NotificationSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    chapterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Chapter",
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
    },
    commentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    message : {
      type : String,
      req : true
    }
  },
  { timestamps: true }
);



ReviewSchema.index({ courseId: 1, userId: 1 }, { unique: true });

// Create and export models using the Next.js pattern to prevent overwrite errors
export const User =
  mongoose.models.User || mongoose.model<IUser>("User", userSchema);
export const Chapter =
  mongoose.models.Chapter || mongoose.model<IChapter>("Chapter", ChapterSchema);
export const Course =
  mongoose.models.Course || mongoose.model<ICourse>("Course", CourseSchema);
  
export const Review =
  mongoose.models.Review || mongoose.model<IReview>("Review", ReviewSchema);
export const Comment =
  mongoose.models.Comment || mongoose.model<IComment>("Comment", commentSchema);

// 3. Export
export const History =
  mongoose.models.History || mongoose.model<IHistory>("History", HistorySchema);

// For UserQuizAttempt
export const UserQuizAttempt = 
  mongoose.models.UserQuizAttempt || 
  mongoose.model("UserQuizAttempt", UserQuizAttemptSchema);

// For CourseQuiz
export const CourseQuiz = 
  mongoose.models.CourseQuiz || 
  mongoose.model("CourseQuiz", CourseQuizSchema);

export const Report = 
mongoose.models.Report || 
mongoose.model<IReport>("Report", ReportSchema);

export const Notification = 
mongoose.models.Notification || 
mongoose.model("Notification", NotificationSchema);