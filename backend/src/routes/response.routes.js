// routes/session.routes.js or response.routes.js
import express from "express";
import multer from "multer";
import { saveInterviewResponse } from "../controllers/response.controller.js";
const router = express.Router();

const upload = multer({
  storage: multer.memoryStorage(), // keep in memory, then save manually
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB max file size
});

router.post("/session/save-response", upload.single("video"), saveInterviewResponse);





router.post("/session/save-response", upload.single("video"), saveInterviewResponse);

export default router;
