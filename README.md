# PrepPal 🎤💼

AI-powered mock interview platform to simulate real interview experiences using video, transcription, emotion analysis, and AI-driven feedback.

## 🚀 Features

- 🎯 **Custom Interview Generator**: Based on job description, resume, experience level, and more.
- 📹 **Real-Time Video Interviews**: Record answers using your webcam and mic.
- ✍️ **AI Transcription**: Converts spoken answers into text using Gemini.
- 📊 **Smart Evaluation**: Gemini analyzes tone, strengths, and improvement areas.
- 😐 **Emotion Detection**: Uses face-api.js to detect confidence, nervousness, etc.
- 📁 **Session History**: Stores all responses, evaluations, and analytics in user dashboard.
- 🔐 **Authentication**: Email/password login, JWT, password reset flow.

## 🛠️ Tech Stack

- **Frontend**: React, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose)
- **AI Integration**: Gemini API (Google Generative AI)
- **Video & Emotion Analysis**: MediaRecorder API, face-api.js
- **Auth**: JWT + Nodemailer for password reset

## 📸 Screenshots

<img width="939" height="584" alt="image" src="https://github.com/user-attachments/assets/3b204c1e-5ea1-49c1-b590-f2401f18aa87" />
<img width="948" height="428" alt="image" src="https://github.com/user-attachments/assets/bafb794e-afdf-44a2-86a8-ea8942328fa5" />
<img width="954" height="423" alt="image" src="https://github.com/user-attachments/assets/9e673cb3-1afd-430f-9652-702d26eef6de" />

<img width="929" height="440" alt="image" src="https://github.com/user-attachments/assets/dd9412e0-357f-4972-ba11-caf4aded187b" />
<img width="944" height="362" alt="image" src="https://github.com/user-attachments/assets/3f8e154f-ab2d-4944-b3e8-f3ddfffb0d3a" />






## 🧠 What I Learned

- Handling webcam streams and recording with MediaRecorder
- Gemini-powered prompt design for real-time evaluation
- Creating a dashboard with dynamic analytics
- Integrating AI + emotion analysis in a user-friendly way

## 📦 Local Setup

```bash
# Backend
cd backend
cp .env.example .env   # Fill in your API keys
npm install
npm run dev

# Frontend (new terminal)
cd frontend
cp .env.example .env   # Fill in your tokens
npm install
npm run dev
```

## 🚀 Deploy to Render

This project is configured for deployment on [Render](https://render.com) with a **Blueprint** (`render.yaml`).

### Prerequisites

1. **MongoDB Atlas** — Create a free cluster at [mongodb.com/atlas](https://www.mongodb.com/atlas) and get your connection string.
2. **Render Account** — Sign up at [render.com](https://render.com).
3. **Push your code** to GitHub (make sure `.env` files are NOT committed).

### Deploy Steps

1. Go to [Render Dashboard](https://dashboard.render.com) → **New** → **Blueprint**
2. Connect your GitHub repo containing this project
3. Render will detect `render.yaml` and create two services:
   - **preppal-api** — Backend Node.js web service
   - **preppal** — Frontend static site

4. **Set environment variables** in the Render dashboard for each service:

   **Backend (`preppal-api`):**
   | Variable | Value |
   |----------|-------|
   | `MONGODB_URI` | Your MongoDB Atlas connection string |
   | `JWT_SECRET` | A strong random secret |
   | `GOOGLE_GEMINI_API_KEY` | Your Gemini API key |
   | `MAILTRAP_TOKEN` | Your Mailtrap token |
   | `VAPI_WEB_TOKEN` | Your Vapi token |
   | `OPENAI_API_KEY` | Your OpenAI key |
   | `CLIENT_URL` | Your frontend URL (e.g., `https://preppal.onrender.com`) |

   **Frontend (`preppal`):**
   | Variable | Value |
   |----------|-------|
   | `VITE_API_URL` | Your backend URL + `/api` (e.g., `https://preppal-api.onrender.com/api`) |
   | `VITE_VAPI_WEB_TOKEN` | Your Vapi web token |
   | `VITE_VAPI_ASSISTANT_ID` | Your Vapi assistant ID |

5. Click **Apply** — Render will build and deploy both services.

### Important Notes

- The backend uses a `/health` endpoint for Render's health checks.
- The frontend is a static site with SPA routing (all routes rewrite to `index.html`).
- `CLIENT_URL` in the backend must match your deployed frontend URL exactly (for CORS).
- Free Render instances spin down after inactivity — first request may take ~30s.
- File uploads (`/uploads`) are stored on the ephemeral filesystem — they'll be lost on redeploy. For persistent storage, consider using a cloud storage service (S3, Cloudinary, etc.).
