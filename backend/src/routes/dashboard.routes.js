import express from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import { getDashboardData, getSessionDetails } from "../controllers/dashboard.controller.js";

const router = express.Router();
router.get("/dashboard", verifyToken, getDashboardData);
router.get("/session/:sessionId/details", verifyToken, getSessionDetails);
export default router;