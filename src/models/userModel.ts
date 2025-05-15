import mongoose, { Schema, Document, Model } from "mongoose";

// Define a type for the purchaseCourse subdocument
interface IPurchaseCourse {
  courseId: mongoose.Types.ObjectId;
  purchaseDate?: Date;
}

// Define the main User interface
export interface IUser extends Document {
  username: string;
  mobile: string;
  email: string;
  password: string;
  cart: mongoose.Types.ObjectId;
  controll: number; // 0 = user, 1 = admin, 2 = editor
  restriction: number; // 0 = not restricted, 1 = restricted
  date: Date;
  role: string;
  category: string[];
  comment: mongoose.Types.ObjectId[];
  purchaseCourse: IPurchaseCourse[];
}

// Define schema
const userSchema: Schema<IUser> = new Schema({
  username: { type: String, required: true },
  mobile: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  cart: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Cart",
  },
  controll: {
    type: Number,
    default: 0, // 0 = user, 1 = admin, 2 = editor
  },
  restriction: {
    type: Number,
    default: 0, // 0 = not restricted, 1 = restricted
  },
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
      courseId: { type: mongoose.Schema.Types.ObjectId , ref : "Course"},
      purchaseDate: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

// Prevent model overwrite in dev with hot reload
const User: Model<IUser> = mongoose.models.User || mongoose.model<IUser>("User", userSchema);

export default User;
