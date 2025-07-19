import React, { useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { axiosInstance } from "../utils/axios";
import vapi from "../utils/vapi.sdk";

function InterviewPage() {
  const { state } = useLocation();
  const { questions, sessionId } = state || {};

  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [feedback, setFeedback] = useState(null);

  const mediaRecorderRef = useRef(null);
  const chunks = useRef([]);
  const transcriptRef = useRef(""); // to hold transcript
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  useEffect(() => {
    // Start camera on mount
    (async () => {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    })();

    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const startRecording = () => {
    setFeedback(null);
    transcriptRef.current = ""; // reset transcript
    chunks.current = [];

    // Start Vapi real-time transcription
    vapi.start();

    const recorder = new MediaRecorder(streamRef.current);
    recorder.ondataavailable = (e) => chunks.current.push(e.data);
    recorder.onstop = () => stopAndProcess();
    recorder.start();
    mediaRecorderRef.current = recorder;
    setRecording(true);
  };

  const stopRecording = async () => {
    if (mediaRecorderRef.current) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
    // Turn camera off immediately
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }

    // Wait for Vapi to finalize transcript
    const finalTranscript = await vapi.stop(); // Ensure Vapi stops and returns text
    transcriptRef.current = finalTranscript || transcriptRef.current || "No transcript available";
  };

  const stopAndProcess = async () => {
    const blob = new Blob(chunks.current, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    setVideoUrl(url);

    try {
      // Send to Gemini for evaluation
      const { data } = await axiosInstance.post("/session/evaluate-video", {
        audio: null, // no audio, we already got transcript via Vapi
        question: questions[current].questionText,
        transcript: transcriptRef.current,
      });

      const evaluation = {
        summary: data.feedback?.summary || "No summary",
        strengths: data.feedback?.strengths || [],
        improvement: data.feedback?.improvement || "N/A",
        tone: data.feedback?.tone || "N/A",
      };

      setFeedback(evaluation);

      // Save everything in DB
      const formData = new FormData();
      formData.append("video", blob);
      formData.append("sessionId", sessionId || "");
      formData.append("questionText", questions[current].questionText || "");
      formData.append("transcript", transcriptRef.current || "No transcript");
      formData.append("evaluation", JSON.stringify(evaluation));

      await axiosInstance.post("/session/save-response", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
    } catch (err) {
      console.error("Save error:", err);
      setFeedback({ summary: "Failed to analyze", strengths: [], improvement: "Retry", tone: "Unknown" });
    }
  };

  const handleNext = () => {
    setVideoUrl(null);
    setFeedback(null);
    setCurrent((prev) => prev + 1);

    // Restart camera for next question
    navigator.mediaDevices.getUserMedia({ video: true, audio: true }).then((stream) => {
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    });
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-[#2F4454] text-white rounded-lg shadow-md">
      <h2 className="text-xl font-semibold mb-4 text-[#DA7B93]">
        Question {current + 1} of {questions?.length || 0}
      </h2>
      <p className="mb-4">{questions?.[current]?.questionText || "No question available"}</p>

      <video ref={videoRef} autoPlay muted className="w-full rounded mb-4" />

      {videoUrl && (
        <video src={videoUrl} controls className="w-full rounded mb-4" />
      )}

      <div className="flex gap-4 mb-4">
        {!recording ? (
          <button
            onClick={startRecording}
            className="bg-[#DA7B93] px-4 py-2 rounded shadow-md"
          >
            Start Answer
          </button>
        ) : (
          <button
            onClick={stopRecording}
            className="bg-red-600 px-4 py-2 rounded shadow-md"
          >
            Stop
          </button>
        )}

        {current < (questions?.length || 0) - 1 && (
          <button
            onClick={handleNext}
            className="bg-green-600 px-4 py-2 rounded shadow-md"
          >
            Next
          </button>
        )}
        {current === (questions?.length || 0) - 1 && (
          <button
            onClick={() => alert("Interview finished!")}
            className="bg-blue-600 px-4 py-2 rounded shadow-md"
          >
            Finish
          </button>
        )}
      </div>

      {feedback && (
        <div className="bg-[#1C3334] p-4 rounded shadow text-sm">
          <h3 className="font-bold mb-2">Feedback (Saved, not shown to user):</h3>
          <p><strong>Summary:</strong> {feedback.summary}</p>
          <p><strong>Strengths:</strong> {feedback.strengths?.join(", ")}</p>
          <p><strong>Improvement:</strong> {feedback.improvement}</p>
          <p><strong>Tone:</strong> {feedback.tone}</p>
        </div>
      )}
    </div>
  );
}

export default InterviewPage;

