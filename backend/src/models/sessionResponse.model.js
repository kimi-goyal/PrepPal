import mongoose from "mongoose";

const sessionResponseSchema = mongoose.Schema({
  sessionId: { type: mongoose.Schema.Types.ObjectId, ref: "Session", required: true },
  questionText: { type: String, required: true },
  userAnswer: String, // Whisper transcript
  videoUrl: String,
  evaluation: {
    summary: String,
    strengths: [String],
    improvement: String,
    tone: String,
    idealAnswer: String,
  },
  attempt: { type: Number, default: 1 }, // Track retries

  emotions: [String], // For future face analysis
  transcriptionAccuracy: { type: Number, default: 0 }, // Future confidence score
}, { timestamps: true });

export const SessionResponse = mongoose.model("SessionResponse", sessionResponseSchema);
