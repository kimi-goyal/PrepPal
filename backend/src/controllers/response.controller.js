import { SessionResponse } from "../models/sessionResponse.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import fs from "fs";
import path from "path";
import { v4 as uuid } from "uuid";

// Initialize Gemini SDK with your API key
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

// 1. Save interview response to the database
export const saveInterviewResponse = async (req, res) => {
  try {
    const { sessionId, questionText, transcript, evaluation, attempt, emotions, vocalMetrics } = req.body;

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
    const parsedEmotions = typeof emotions === "string" ? JSON.parse(emotions) : (emotions || []);
    const parsedVocalMetrics = typeof vocalMetrics === "string" ? JSON.parse(vocalMetrics) : (vocalMetrics || {});

    const saved = await SessionResponse.create({
      sessionId,
      questionText,
      userAnswer: transcript,
      videoUrl,
      evaluation: parsedEval,
      emotions: parsedEmotions,
      vocalMetrics: parsedVocalMetrics,
      attempt: attempt ? Number(attempt) : 1,
    });

    res.status(201).json({ success: true, saved });
  } catch (err) {
    console.error("❌ Error saving interview response:", err);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

// 2. Transcribe and evaluate (Using Gemini Free-Tier Model)
export const transcribeAndEvaluate = async (req, res) => {
  let tempAudioPath = null;
  try {
    const { question } = req.body;
    const audioFile = req.file;

    if (!audioFile || !question) {
      return res.status(400).json({ message: "Missing audio file or question" });
    }

    // Save audio temporarily for Gemini
    const tempDir = "temp";
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });
    tempAudioPath = path.join(tempDir, `${uuid()}.wav`);
    fs.writeFileSync(tempAudioPath, audioFile.buffer);

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Combine transcription + evaluation into one request.
    // Now explicitly asks for a numeric confidence and a weakness-severity score,
    // instead of relying on a "tone" word to be guessed into a confidence number later.
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
    "confidence": <a number from 0 to 100, based on clarity, structure, and delivery of the answer — NOT just a copy of the tone label>,
    "weaknessSeverity": <0 if there is no notable weakness, 1 for a minor issue, 2 for a significant gap in the answer>,
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
      console.warn("Gemini JSON parse failed, falling back to default structured output");
      output = {
        transcript: "Transcription unavailable",
        feedback: {
          summary: "Response processed, but structured output failed.",
          strengths: ["Spoke clearly"],
          improvement: "Practice more structured answers",
          tone: "Neutral",
          confidence: 70,
          weaknessSeverity: 1,
          idealAnswer: "Use examples and concise structure"
        }
      };
    }

    // Clean up temp audio file
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath);
    }

    res.json(output);
  } catch (error) {
    console.error("❌ Gemini Transcription/Evaluation Error:", error);

    // Safe cleanup in case of error mid-execution
    if (tempAudioPath && fs.existsSync(tempAudioPath)) {
      fs.unlinkSync(tempAudioPath);
    }

    // Safe fallback in case you hit the free tier rate limits (15 RPM / 1500 RPD)
    res.status(200).json({
      transcript: "[Free-tier API limit reached or service interrupted]",
      feedback: {
        summary: "The audio processing failed. This is likely because you hit the free-tier API rate limits.",
        strengths: ["Audio uploaded to backend successfully"],
        improvement: "Please wait 60 seconds and try again, or check your API key status.",
        tone: "System Notice",
        confidence: 0,
        weaknessSeverity: 0,
        idealAnswer: "N/A"
      }
    });
  }
};

// 3. Evaluate Text Responses (Using Gemini Free-Tier Model)
export const evaluateVideoResponse = async (req, res) => {
  try {
    const { transcript, question } = req.body;

    if (!transcript || !question) {
      return res.status(400).json({ message: "Missing transcript or question" });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

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
    "confidence": <a number from 0 to 100 based on clarity, structure, and delivery>,
    "weaknessSeverity": <0 = none, 1 = minor, 2 = significant>,
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
          confidence: 70,
          weaknessSeverity: 1,
          idealAnswer: "Add more examples and structure"
        }
      };
    }

    res.json(parsed);
  } catch (error) {
    console.error("Gemini Error:", error);
    res.status(200).json({
      transcript: transcript,
      feedback: {
        summary: "Could not evaluate this response due to free tier limit restrictions.",
        strengths: ["No system action taken"],
        improvement: "Wait a minute and hit submit again.",
        tone: "System Notice",
        confidence: 0,
        weaknessSeverity: 0,
        idealAnswer: "N/A"
      }
    });
  }
};