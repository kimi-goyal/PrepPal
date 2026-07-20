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
    confidence: Number,
    weaknessSeverity: Number,
    idealAnswer: String,
  },
  attempt: { type: Number, default: 1 }, // Track retries

  emotions: [String], // Descriptive vocal-delivery tags (pace/pitch/energy based)
  vocalMetrics: {
    pace: Number,           // words per minute
    pitchVariance: Number,  // Hz standard deviation across voiced frames
    energyVariance: Number, // scaled RMS standard deviation
  },
  transcriptionAccuracy: { type: Number, default: 0 },
}, { timestamps: true });

export const SessionResponse = mongoose.model("SessionResponse", sessionResponseSchema);