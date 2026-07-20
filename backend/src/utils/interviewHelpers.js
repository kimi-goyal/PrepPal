// utils/interviewHelpers.js

// Calibrates question difficulty/style to the candidate's actual experience level.
export const experienceGuidance = {
  "Fresher": "The candidate has no full-time professional experience — likely academic projects, internships, or personal projects only. Ask foundational conceptual questions and simple questions about their own projects (what they built, why they chose a tool, what they learned). Do NOT ask about scaling systems, production incidents, team leadership, or architectural trade-offs at company scale.",
  "1–2 Years": "The candidate has limited hands-on experience. Ask practical, applied questions grounded in their actual project work — debugging, choosing between two simple approaches, what they'd do differently. Keep scope small: single features or components, not whole-system design.",
  "3–5 Years": "The candidate has solid hands-on experience. Ask about trade-offs they made, ownership of features end-to-end, and how they'd extend their past work to meet a related JD requirement.",
  "5+ Years": "The candidate is senior. Architectural trade-offs, technical leadership, and system-scale design questions are appropriate here.",
};

export const getExperienceGuidance = (experience) =>
  experienceGuidance[experience] || experienceGuidance["Fresher"];

// Fallback confidence estimate from a tone string — used only for old
// responses saved before "confidence" existed on the evaluation object.
const toneToConfidence = (tone) => {
  const t = (tone || "neutral").toLowerCase();
  const toneMap = {
    confident: 90,
    assertive: 85,
    professional: 85,
    clear: 80,
    neutral: 75,
    casual: 70,
    hesitant: 60,
    nervous: 50,
    unclear: 45,
    confused: 40,
  };
  // substring match, not exact match — "confident and clear" still hits "confident"
  const found = Object.keys(toneMap).find((key) => t.includes(key));
  return found ? toneMap[found] : 70;
};

// Always prefer the real numeric confidence Gemini returns now.
// Falls back to the tone heuristic only for older documents that don't have it.
export const getConfidence = (evaluation) =>
  typeof evaluation?.confidence === "number"
    ? evaluation.confidence
    : toneToConfidence(evaluation?.tone);