import { Session } from "../models/session.model.js";
import { SessionResponse } from "../models/sessionResponse.model.js";
import mongoose from "mongoose";

export const getDashboardData = async (req, res) => {
  try {
    const { userId } = req.params;

    const sessions = await Session.find({ user: req.userId }).sort({ createdAt: -1 }).lean();

    const responses = await SessionResponse.find({
      sessionId: { $in: sessions.map((s) => s._id) },
    }).lean();

    // Compute per-session confidence (mock for now)
    const sessionData = sessions.map((session) => {
      const sessionResponses = responses.filter(r => r.sessionId.toString() === session._id.toString());
      
      // Group by question to get unique questions count
      const uniqueQuestions = new Set(sessionResponses.map(r => r.questionText));
      
      const avgConfidence = sessionResponses.length
        ? Math.floor(Math.random() * 20) + 70
        : 0;

      return {
        _id: session._id,
        createdAt: session.createdAt,
        jobDescription: session.jobDescription,
        numQuestions: session.numQuestions,
        questionsAnswered: uniqueQuestions.size, // Use unique questions count
        confidence: avgConfidence,
      };
    });

    // Global averages
    const allConfidences = sessionData.map(s => s.confidence);
    const avgConfidence =
      allConfidences.reduce((acc, c) => acc + c, 0) / (allConfidences.length || 1);

    const strengths = responses.reduce(
      (acc, r) => acc + (r.evaluation?.strengths?.length || 0),
      0
    );
    const weaknesses = responses.reduce(
      (acc, r) => acc + (r.evaluation?.improvement ? 1 : 0),
      0
    );

    // Tone distribution across all responses
    const toneCounts = {};
    responses.forEach((r) => {
      const tone = r.evaluation?.tone || "Neutral";
      toneCounts[tone] = (toneCounts[tone] || 0) + 1;
    });

    res.json({
      sessions: sessionData,
      analytics: {
        avgConfidence: Math.round(avgConfidence),
        totalSessions: sessions.length,
        strengths,
        weaknesses,
        toneDistribution: toneCounts,
      },
      charts: {
        confidenceTrend: sessionData.map((s, idx) => ({
          name: `Session ${idx + 1}`,
          confidence: s.confidence,
        })),
        strengthsWeaknesses: [
          { name: "Strengths", value: strengths },
          { name: "Weaknesses", value: weaknesses },
        ],
      },
    });
  } catch (error) {
    console.error("Dashboard fetch error:", error);
    res.status(500).json({ message: "Failed to load dashboard data" });
  }
};

export const getSessionDetails = async (req, res) => {
  try {
    const { sessionId } = req.params;

    // Ensure sessionId is a valid ObjectId
    const sessionObjectId = new mongoose.Types.ObjectId(sessionId);

    const session = await Session.findById(sessionObjectId).lean();
    if (!session) {
      return res.status(404).json({ message: "Session not found" });
    }

    // Get all responses for this session
    const allResponses = await SessionResponse.find({ sessionId: sessionObjectId })
      .sort({ createdAt: 1 }) // Sort by creation time
      .lean();

    if (!allResponses.length) {
      return res.json({
        session,
        responses: [],
        analytics: {
          avgConfidence: 0,
          avgWordCount: 0,
          toneDistribution: {},
          emotionDistribution: {},
          totalDurationEstimate: 0,
          questionAnalytics: [],
          tips: "No responses recorded for this session yet.",
        },
      });
    }

    // Group responses by questionText to handle retakes
    const groupedResponses = {};
    
    allResponses.forEach((response) => {
      const questionText = response.questionText;
      
      if (!groupedResponses[questionText]) {
        groupedResponses[questionText] = [];
      }
      
      groupedResponses[questionText].push(response);
    });

    // Create structured responses with attempts
    const responses = [];
    let questionNumber = 1;
    
    Object.keys(groupedResponses).forEach((questionText) => {
      const questionResponses = groupedResponses[questionText];
      
      // Sort by creation time to get correct attempt order
      questionResponses.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
      
      questionResponses.forEach((response, attemptIndex) => {
        responses.push({
          ...response,
          questionNumber,
          attemptNumber: attemptIndex + 1,
          totalAttempts: questionResponses.length,
          isLatestAttempt: attemptIndex === questionResponses.length - 1
        });
      });
      
      questionNumber++;
    });

    // Calculate metrics using only the latest attempts
    const latestResponses = responses.filter(r => r.isLatestAttempt);
    
    const questionAnalytics = latestResponses.map((r) => {
      const wordCount = r.userAnswer ? r.userAnswer.split(" ").length : 0;
      const tone = r.evaluation?.tone || "Neutral";
      const confidence =
        tone === "Confident" ? 90 : tone === "Neutral" ? 80 : 70;

      return {
        questionNumber: r.questionNumber,
        question: r.questionText,
        tone,
        wordCount,
        confidence,
        totalAttempts: r.totalAttempts
      };
    });

    const avgConfidence =
      questionAnalytics.reduce((acc, q) => acc + q.confidence, 0) /
      (questionAnalytics.length || 1);

    const avgWordCount =
      questionAnalytics.reduce((acc, q) => acc + q.wordCount, 0) /
      (questionAnalytics.length || 1);

    const toneDistribution = questionAnalytics.reduce((acc, q) => {
      acc[q.tone] = (acc[q.tone] || 0) + 1;
      return acc;
    }, {});

    const emotionDistribution = latestResponses.reduce((acc, r) => {
      (r.emotions || []).forEach((e) => {
        acc[e] = (acc[e] || 0) + 1;
      });
      return acc;
    }, {});

    const totalDurationEstimate = avgWordCount * latestResponses.length * 0.4; // ~0.4 sec per word

    // Add analytics for retakes
    const retakeAnalytics = {
      totalRetakes: responses.length - latestResponses.length,
      questionsWithRetakes: questionAnalytics.filter(q => q.totalAttempts > 1).length,
      avgAttemptsPerQuestion: responses.length / latestResponses.length
    };

    res.json({
      session,
      responses, // All responses including retakes with structured data
      analytics: {
        avgConfidence: Math.round(avgConfidence),
        avgWordCount: Math.round(avgWordCount),
        toneDistribution,
        emotionDistribution,
        totalDurationEstimate: Math.round(totalDurationEstimate),
        questionAnalytics,
        retakeAnalytics,
        tips:
          avgConfidence < 75
            ? "Practice more structured responses (use STAR method)."
            : retakeAnalytics.totalRetakes > 0
            ? `Good confidence! You made ${retakeAnalytics.totalRetakes} retakes - keep practicing for consistency.`
            : "Excellent performance! Great confidence and consistency.",
      },
    });
  } catch (error) {
    console.error("Session Details Error:", error);
    res.status(500).json({ message: "Failed to load session details" });
  }
};