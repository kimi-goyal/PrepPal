import express from "express";
import multer from "multer";
import { registerSession, generateQuestions, evaluateResponse } from "../controllers/session.controller.js";
import { saveInterviewResponse, evaluateVideoResponse} from "../controllers/response.controller.js";
import { verifyToken } from "../middleware/verifyToken.js";

const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // keep in memory, then save manually
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
});

router.post("/session", verifyToken, upload.single("resumePdf"), registerSession);
router.post("/generate-questions/:sessionId", verifyToken, generateQuestions)
router.post("/save-response", upload.single("video"), saveInterviewResponse);
router.post("/evaluate-video", evaluateVideoResponse);

export default router;
