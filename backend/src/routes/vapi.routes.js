// src/routes/vapi.routes.js
import express from "express";
import fetch from "node-fetch"; // make sure it's v2.x

const router = express.Router();

router.post("/call", async (req, res) => {
  try {
    const { assistantId, question } = req.body;

    const payload = {
      assistant: {
        id: assistantId,
      },
      messages: [
        {
          role: "user",
          content: question || "Let's begin the interview.",
        },
      ],
    };

    const response = await fetch("https://api.vapi.ai/call/web", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.VAPI_WEB_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Vapi response error:", data);
      return res.status(response.status).json(data);
    }

    res.status(200).json(data);
  } catch (err) {
    console.error("Error calling Vapi:", err.message);
    res.status(500).json({ success: false, message: "Vapi call failed." });
  }
});

export default router;
