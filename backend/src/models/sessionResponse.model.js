import mongoose from "mongoose";

const sessionResponseSchema = mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  questionText: { type: String, required: true },
  userAnswer: String,   // Vapi transcript
  videoUrl: String,
  evaluation: {
    summary: String,
    strengths: [String],
    improvement: String,
    tone: String,
    idealAnswer: String, // Added field for model answer
  },
  emotions: [String],
}, { timestamps: true });

export const SessionResponse = mongoose.model("SessionResponse", sessionResponseSchema);
