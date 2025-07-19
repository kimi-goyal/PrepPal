import mongoose from "mongoose";

const sessionSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  jobDescription: {
    type: String,
    required: true,
  },
  resume: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['technical', 'behavioural'],
    default: 'technical',
  },
  numQuestions: {
    type: Number,
    default: 5,
  },
  level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced'],
    default: 'Beginner',
  },
  
  
  experience: {
    type: String,
    enum: ['Fresher', '1–2 Years', '3–5 Years', '5+ Years'],
    default: 'Fresher',
  },
  focus: {
    type: [String],
    default: [],
  },
  questions: [
  {
    questionType: { type: String },
    questionText: { type: String, required: true },
  },
],

  createdAt: {
    type: Date,
    default: Date.now,
  },
  
}, { timestamps: true });

export const Session = mongoose.model("Session", sessionSchema);
