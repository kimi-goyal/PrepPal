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

## 📦 Setup

```bash
# Frontend
cd frontend
npm install
npm run dev

# Backend
cd backend
npm install
npm run dev
