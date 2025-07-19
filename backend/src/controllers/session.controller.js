
import pdfParse from "pdf-parse";
import { Session } from "../models/session.model.js"; 
import {User} from "../models/user.model.js"
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

function cleanGeminiResponse(text) {
  const jsonStart = text.indexOf("[");
  const jsonEnd = text.lastIndexOf("]");
  if (jsonStart !== -1 && jsonEnd !== -1) {
    return text.slice(jsonStart, jsonEnd + 1);
  }
  return text; // fallback — might still throw
}


export const registerSession = async (req, res) => {
  try {
    const {
      jd,
      resumeText,
      type,
      numQuestions,
      level,
      experience,
      focus,
    } = req.body;

    let parsedResume = resumeText;

    // If resume uploaded as PDF
    if (req.file) {
      const pdfData = await pdfParse(req.file.buffer);
      parsedResume = pdfData.text;
    }

    // Generate all questions at once using Gemini
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const questionPrompt = `
You are an AI mock interview question generator.

Generate ${numQuestions} unique, professional-level interview questions of type "${type}" based on:

- Job Description: """${jd}"""
- Resume: """${parsedResume}"""
- Experience: ${experience}
- Level: ${level}
- Focus Areas: ${JSON.parse(focus || "[]").join(", ") || "General"}

Output format: A JSON array of plain strings. No explanation. No formatting.
    `.trim();

    const result = await model.generateContent(questionPrompt);
    const rawText = result.response.text().trim();
    const cleaned = cleanGeminiResponse(rawText);

    let parsedQuestions = [];
    try {
      const list = JSON.parse(cleaned);
      parsedQuestions = list.map((q) => ({
        questionType: type,
        questionText: q,
      }));
    } catch (e) {
      console.error("Failed to parse Gemini question JSON:", rawText);
      return res.status(500).json({
        success: false,
        message: "Failed to generate interview questions.",
      });
    }

    // Create and save session with questions
    const newSession = new Session({
      user: req.userId,
      jobDescription: jd,
      resume: parsedResume,
      type,
      numQuestions: Number(numQuestions),
      level,
      experience,
      focus: JSON.parse(focus || "[]"),
      questions: parsedQuestions,
    });

    await newSession.save();

    res.status(201).json({
      success: true,
      message: "Interview session created.",
      sessionId: newSession._id,
      questions: parsedQuestions,
    });
  } catch (error) {
    console.error("❌ Error in registerSession:", error);
    res.status(500).json({
      success: false,
      message: "Internal Server Error",
      error: error.message,
    });
  }
};


export const generateQuestions = async (req, res) => {
  try {
    const { sessionId } = req.params;
    const session = await Session.findById(sessionId);

    if (!session) {
      return res.status(404).json({ message: "Session not found. Please restart the session." });
    }


    const { jobDescription, resume, type, level, experience, focus = [] } = session;

const prompt = `
You're an AI interview coach generating a single mock ${type} interview question.

Context:
- Job Description: """${jobDescription}"""
- Resume Summary: """${resume}"""
- Candidate Experience: ${experience}
- Interview Level: ${level}
- Preferred Focus Areas: ${focus.join(", ") || "General"}

Guidelines:
- Tailor the question based on job level, skills, and domain.
- Match tone with a startup company unless otherwise stated.
- Focus on one of the areas: ${focus.join(", ") || "any common interview topic"}.

Generate **only one** ${type} question.
Do NOT add explanations or formatting.
`.trim();


    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

    console.log("📤 Gemini question generated:", raw);

    // Return one clean question
    res.status(200).json({
      questions: [
        {
          questionType: type,
          questionText: raw,
        },
      ],
    });

  } catch (error) {
    console.error("❌ Error generating single question:", error.message);
    return res.status(500).json({ success: false, message: "Server Error" });
  }
};
export const evaluateResponse = async(req,res)=>{
  const { answer, question } = req.body;

  if (!answer || !question) {
    return res.status(400).json({
      success: false,
      message: "Both 'question' and 'answer' are required.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
You are an AI mock interview evaluator. A candidate just gave the following answer to the question:

Question: "${question}"

Answer: "${answer}"

Give a short structured feedback including:
1. A brief overall evaluation.
2. 2 strengths in the answer.
3. 1 improvement suggestion.
4. Tone of the answer: (e.g., confident, hesitant, vague, enthusiastic, etc.)

Respond in plain JSON with keys: summary, strengths, improvement, tone.
`;

    const result = await model.generateContent(prompt);
    const response = await result.response.text();

    // Try to parse if it's valid JSON output
    let structured;
    try {
      structured = JSON.parse(response);
    } catch (e) {
      // fallback if Gemini didn't return clean JSON
      structured = {
        summary: response.slice(0, 250),
        strengths: [],
        improvement: "Could not extract improvement due to malformed response.",
        tone: "Unclear",
      };
    }

    res.json({ success: true, evaluation: structured });
  } catch (err) {
    console.error("Error in Gemini Evaluation:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate the answer.",
    });
  }

}