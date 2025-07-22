import { SessionResponse } from "../models/sessionResponse.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// Save interview response
export const saveInterviewResponse = async (req, res) => {
  try {
    const { sessionId, questionText, transcript, evaluation, attempt} = req.body;

    if (!sessionId || !questionText || !transcript) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let videoUrl = null;
    if (req.file) {
      const videoName = `${uuid()}.webm`;
      const uploadPath = path.join("uploads", videoName);
      if (!fs.existsSync("uploads")) fs.mkdirSync("uploads", { recursive: true });
      fs.writeFileSync(uploadPath, req.file.buffer);
      videoUrl = `/uploads/${videoName}`;
    }

    const parsedEval = typeof evaluation === "string" ? JSON.parse(evaluation) : evaluation;

    const saved = await SessionResponse.create({
      sessionId,
      questionText,
      userAnswer: transcript,
      videoUrl,
      evaluation: parsedEval,
      emotions: [], // Placeholder for later emotion analysis
        attempt: attempt ? Number(attempt) : 1,
    });

    res.status(201).json({ success: true, saved });
  } catch (err) {
    console.error("❌ Error saving interview response:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// Transcribe and evaluate (Gemini only, no Whisper)
export const transcribeAndEvaluate = async (req, res) => {
  try {
    const { question } = req.body;
    const audioFile = req.file;

    if (!audioFile || !question) {
      return res.status(400).json({ message: "Missing audio file or question" });
    }

    // Save audio temporarily for Gemini (if needed later)
    const tempDir = "temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    const tempAudioPath = path.join(tempDir, `${uuid()}.wav`);
    fs.writeFileSync(tempAudioPath, audioFile.buffer);

    // Gemini model
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    // Combine transcription + evaluation into one request
    const prompt = `
You are an AI interview assistant. You are given:
1. An interview question.
2. An audio file of the candidate's response.

First, transcribe the speech into text (ignore background noise).
Then, evaluate the response based on:
- Clarity and structure
- Content relevance
- Tone and confidence
- Areas of improvement

Return JSON:
{
  "transcript": "The transcribed text",
  "feedback": {
    "summary": "Brief 2-3 sentence overview",
    "strengths": ["Point 1", "Point 2"],
    "improvement": "Suggestions for better answers",
    "tone": "Confident / Nervous / Professional / etc",
    "idealAnswer": "Brief example of a strong response"
  }
}
`;

    const result = await model.generateContent([
      { text: prompt },
      { inlineData: { mimeType: "audio/wav", data: audioFile.buffer.toString("base64") } }
    ]);

    let rawText = result.response.text().replace(/```json|```/g, "").trim();

    let output;
    try {
      output = JSON.parse(rawText);
    } catch {
      console.warn("Gemini JSON parse failed, falling back to default output");
      output = {
        transcript: "Transcription unavailable",
        feedback: {
          summary: "Response processed, but structured output failed.",
          strengths: ["Spoke clearly"],
          improvement: "Practice more structured answers",
          tone: "Neutral",
          idealAnswer: "Use examples and concise structure"
        }
      };
    }

    fs.unlinkSync(tempAudioPath);
    res.json(output);
  } catch (error) {
    console.error("❌ Gemini Transcription/Evaluation Error:", error);
    res.status(500).json({ message: "Gemini transcription or evaluation failed", error: error.message });
  }
};

// Backward-compatible video evaluation
export const evaluateVideoResponse = async (req, res) => {
  try {
    const { transcript, question } = req.body;

    if (!transcript || !question) {
      return res.status(400).json({ message: "Missing transcript or question" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI interviewer. Evaluate this response.

Question: "${question}"
Transcript: "${transcript}"

Return JSON:
{
  "transcript": "${transcript}",
  "feedback": {
    "summary": "...",
    "strengths": ["...","..."],
    "improvement": "...",
    "tone": "...",
    "idealAnswer": "..."
  }
}`;

    const result = await model.generateContent(prompt);
    let rawText = result.response.text().replace(/```json|```/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(rawText);
    } catch {
      parsed = {
        transcript,
        feedback: {
          summary: "Processed but default output",
          strengths: ["Clear communication"],
          improvement: "Refine answers for depth",
          tone: "Neutral",
          idealAnswer: "Add more examples and structure"
        }
      };
    }

    res.json(parsed);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ message: "Evaluation failed" });
  }
};
