import express from "express";
import multer from "multer";
import {
  registerSession,
  generateQuestions,
  evaluateResponse
} from "../controllers/session.controller.js";
import {
  saveInterviewResponse,
  evaluateVideoResponse,
  transcribeAndEvaluate
} from "../controllers/response.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max
});

router.post("/session", verifyToken, upload.single("resumePdf"), registerSession);
router.post("/generate-questions/:sessionId", verifyToken, generateQuestions);
router.post("/save-response", upload.single("video"), saveInterviewResponse);
router.post("/evaluate-video", evaluateVideoResponse);
router.post("/transcribe-and-evaluate", upload.single("audio"), transcribeAndEvaluate);


export default router;
