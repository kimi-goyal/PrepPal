import pdfParse from "pdf-parse";
import { Session } from "../models/session.model.js";
import { User } from "../models/user.model.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { getExperienceGuidance } from "../utils/interviewHelpers.js";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY);

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

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    // Rewritten so experience level is the PRIMARY constraint, stated up front and
    // reinforced, rather than a single trailing sentence after four paragraphs
    // demanding architectural/scenario-based questions. The old prompt made a
    // "Fresher" candidate get senior-style system-design questions because the
    // dominant instructions all pushed toward complexity regardless of level.
    const questionPrompt = `
You are an interviewer conducting a real ${level}-difficulty, ${type} interview for a "${experience}" candidate.

${getExperienceGuidance(experience)}

Generate exactly ${numQuestions} unique interview questions.
Focus Areas: ${JSON.parse(focus || "[]").join(", ") || "Core competencies aligned with the JD"}

RULES:
1. Ground every question in something concrete from the candidate's resume — a real technology, project, or responsibility they listed. Do not ask generic textbook definitions (e.g. "What is React state?").
2. Match the COMPLEXITY of the question to their stated experience level above — this matters more than matching every JD requirement. A fresher should sound like they're in a real fresher interview, not a staff engineer interview.
3. Only tie a resume item to a JD requirement if doing so does NOT push the question above the candidate's experience tier. If the JD wants something advanced but the candidate is a fresher, ask a scaled-down version ("what would you need to learn to move toward X") rather than assuming they can already design for it.
4. Vary question style: some should be "tell me about a time...", some "how would you approach...", some direct technical recall appropriate to their tier.

Context Documents:
- Job Description:
"""
${jd}
"""

- Candidate's Resume:
"""
${parsedResume}
"""
`.trim();

    // FORCE SPEED & NATIVE PARSING BY PROVIDING AN OUTPUT SCHEMA
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: questionPrompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "ARRAY",
          description: "List of interview questions matching the resume, job description, and candidate's experience tier.",
          items: {
            type: "STRING"
          }
        }
      }
    });

    const rawText = result.response.text().trim();
    let parsedQuestions = [];

    try {
      // The API returns guaranteed structural JSON array of strings
      const list = JSON.parse(rawText);
      parsedQuestions = list.map((q) => ({
        questionType: type,
        questionText: q,
      }));
    } catch (e) {
      console.error("Failed to parse native JSON response:", rawText);
      return res.status(500).json({
        success: false,
        message: "Failed to generate interview questions due to parsing issues.",
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
      message: "Interview session created quickly.",
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

    // Same experience-tier calibration applied here — this endpoint had NO
    // difficulty guidance at all before, just "tie resume to JD," which is
    // the most complexity-agnostic version of the bug.
    const prompt = `
You're an AI interview coach generating a single mock ${type} interview question for a "${experience}" candidate at "${level}" level.

${getExperienceGuidance(experience)}

Context:
- Job Description: """${jobDescription}"""
- Resume Summary: """${resume}"""
- Preferred Focus Areas: ${focus.join(", ") || "General"}

Generate exactly ONE question, grounded in the resume, calibrated to the candidate's actual experience tier above — not the JD's ideal candidate. No formatting, just the plain question string.
`.trim();

    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    const result = await model.generateContent(prompt);
    const raw = result.response.text().trim();

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


export const evaluateResponse = async (req, res) => {
  const { answer, question } = req.body;

  if (!answer || !question) {
    return res.status(400).json({
      success: false,
      message: "Both 'question' and 'answer' are required.",
    });
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });

    const prompt = `
You are an AI mock interview evaluator. Review the candidate's answer to the given question.
Question: "${question}"
Answer: "${answer}"
`;

    // Schema now includes confidence and weaknessSeverity as real numeric
    // fields, instead of forcing the dashboard to guess a number from
    // a free-text "tone" string after the fact.
    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: {
          type: "OBJECT",
          properties: {
            summary: { type: "STRING", description: "A short structured overall feedback summary." },
            strengths: {
              type: "ARRAY",
              items: { type: "STRING" },
              description: "Exactly 2 strengths identified in the answer."
            },
            improvement: { type: "STRING", description: "Exactly 1 actionable suggestion for improvement." },
            tone: { type: "STRING", description: "Detected tone (e.g. confident, hesitant, vague, enthusiastic)." },
            confidence: {
              type: "NUMBER",
              description: "Confidence score from 0-100 based on clarity, structure, and delivery of the answer."
            },
            weaknessSeverity: {
              type: "NUMBER",
              description: "0 = no notable weakness, 1 = minor, 2 = significant gap in the answer."
            }
          },
          required: ["summary", "strengths", "improvement", "tone", "confidence", "weaknessSeverity"]
        }
      }
    });

    const responseText = result.response.text();
    const structured = JSON.parse(responseText);

    res.json({ success: true, evaluation: structured });
  } catch (err) {
    console.error("Error in Gemini Evaluation:", err.message);
    res.status(500).json({
      success: false,
      message: "Failed to evaluate the answer.",
    });
  }
};