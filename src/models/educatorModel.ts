import mongoose, { Schema, Document, models, model } from "mongoose";

export interface IEducator extends Document {
  username: string;
  mobile: string;
  email: string;
  password: string;
  date?: Date;
  role: string;
  courses: mongoose.Types.ObjectId[];
}

const educatorSchema = new Schema<IEducator>(
  {
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
    courses: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Course",
      },
    ],
  },
  { timestamps: true }
);

// Prevent model overwrite error in Next.js hot reload
const Educator = models.Educator || model<IEducator>("Educator", educatorSchema);;

export default Educator;
