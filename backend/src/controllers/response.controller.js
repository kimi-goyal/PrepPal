// controllers/response.controller.js
import { SessionResponse } from "../models/sessionResponse.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);


export const saveInterviewResponse = async (req, res) => {
  try {
    const { sessionId, questionText, transcript } = req.body;

    if (!sessionId || !questionText || !transcript) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    let videoUrl = null;

    if (req.file) {
      const videoName = `${uuid()}.webm`;
      const uploadPath = path.join("uploads", videoName);
      fs.writeFileSync(uploadPath, req.file.buffer);
      videoUrl = `/uploads/${videoName}`;
    }

    // Call Gemini for evaluation (but don’t send result to user now)
    const prompt = `
You're an AI interview coach. The candidate answered:

Q: "${questionText}"
A: "${transcript}"

Evaluate the response and provide:
- A short summary (1-2 sentences)
- 2 strengths
- 1 area for improvement
- Tone (Confident, Nervous, etc.)
- An ideal model answer for this question

Return JSON:
{
  "summary": "...",
  "strengths": ["...", "..."],
  "improvement": "...",
  "tone": "...",
  "idealAnswer": "..."
}
    `.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    let evaluation;

    try {
      evaluation = JSON.parse(result.response.text());
    } catch (err) {
      evaluation = {
        summary: "Could not parse evaluation",
        strengths: [],
        improvement: "N/A",
        tone: "Unknown",
        idealAnswer: "N/A",
      };
    }

    const saved = await SessionResponse.create({
      sessionId,
      questionText,
      userAnswer: transcript,
      videoUrl,
      evaluation,
      emotions: [], // will be filled later (face-api.js)
    });

    res.status(201).json({ success: true, saved });
  } catch (err) {
    console.error("❌ Error saving interview response:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const evaluateVideoResponse = async (req, res) => {
  try {
    const { audio, question } = req.body;

    if (!audio || !question) {
      return res.status(400).json({ message: "Missing audio or question" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const prompt = `
You are an AI interviewer. Transcribe this audio response and evaluate the candidate's answer for the following question:
"${question}"

Return a JSON object like:
{
  "transcript": "...",
  "feedback": {
    "summary": "...",
    "strengths": ["...","..."],
    "improvement": "...",
    "tone": "..."
  }
}
    `;

    // Gemini expects base64 audio in the parts array, not inlineData
    const result = await model.generateContent([
      { text: prompt },
      {
        inlineData: {
          mimeType: "audio/webm",
          data: audio, // Already base64
        },
      },
    ]);

    const text = result.response.text();
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (err) {
      console.error("Gemini returned non-JSON:", text);
      parsed = {
        transcript: "Could not parse transcript",
        feedback: {
          summary: "Response could not be analyzed",
          strengths: [],
          improvement: "Please retry",
          tone: "Unknown",
        },
      };
    }

    res.json(parsed);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(500).json({ message: "Evaluation failed" });
  }
};


