import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axios";

const SHOW_FEEDBACK_IMMEDIATELY = false;

function InterviewPage() {
  const { state } = useLocation();
  const { questions = [], sessionId } = state || {};
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null); // Local preview
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const currentQuestion = questions[current] || null;

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
    } catch (error) {
      console.error("Camera error:", error);
      alert("Unable to access camera/microphone");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
  };

  const startRecording = () => {
    if (!streamRef.current) {
      startCamera();
      return;
    }
    recordedChunksRef.current = [];
    const mediaRecorder = new MediaRecorder(streamRef.current, { mimeType: "video/webm" });
    mediaRecorderRef.current = mediaRecorder;

    mediaRecorder.ondataavailable = e => {
      if (e.data.size > 0) recordedChunksRef.current.push(e.data);
    };

    mediaRecorder.onstop = () => {
      const blob = new Blob(recordedChunksRef.current, { type: "video/webm" });
      const localUrl = URL.createObjectURL(blob);
      setVideoUrl(localUrl); // Immediate preview
      processRecording(blob);
    };

    mediaRecorder.start();
    setRecording(true);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording) {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const retryRecording = () => {
    setVideoUrl(null);
    setFeedback(null);
    stopCamera();
    startCamera();
  };

const processRecording = async (blob) => {
  setLoading(true);
  try {
    // Step 1: Transcribe + Evaluate (needs "audio")
    const formData = new FormData();
    formData.append("audio", blob, "response.webm");  // FIX: was "video"
    formData.append("question", currentQuestion?.questionText || "");

    const transcriptEvalRes = await axiosInstance.post("/session/transcribe-and-evaluate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { transcript, feedback } = transcriptEvalRes.data;

    // Step 2: Save Response (needs "video")
    const saveFormData = new FormData();
    saveFormData.append("video", blob, "response.webm");
    saveFormData.append("sessionId", sessionId);
    saveFormData.append("questionText", currentQuestion?.questionText || "");
    saveFormData.append("transcript", transcript);
    saveFormData.append("evaluation", JSON.stringify(feedback));

    await axiosInstance.post("/session/save-response", saveFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (SHOW_FEEDBACK_IMMEDIATELY) setFeedback(feedback);
  } catch (error) {
    console.error("Save error:", error);
    alert("Failed to process or save response. Check console.");
  } finally {
    setLoading(false);
  }
};


  const handleNext = () => {
    if (current + 1 < questions.length) {
      setCurrent(prev => prev + 1);
      setVideoUrl(null);
      setFeedback(null);
    } else {
      setCompleted(true);
      stopCamera();
    }
  };

  const handleFinish = () => {
    stopCamera();
    navigate("/dashboard");
  };

  if (!questions.length) {
    return <div className="text-center text-white mt-10">No questions available.</div>;
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen text-white">
        <h2 className="text-2xl mb-4">Interview Completed!</h2>
        <button
          onClick={handleFinish}
          className="bg-green-600 px-6 py-3 rounded-lg hover:bg-green-700"
        >
          Go to Dashboard
        </button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center min-h-screen bg-[#1C3334] text-white p-6">
      <h2 className="text-xl mb-4">
        Question {current + 1} of {questions.length}
      </h2>
      <p className="text-center max-w-2xl mb-6">{currentQuestion?.questionText}</p>

      {/* Live or Recorded Video */}
      <video
        ref={videoRef}
        className="w-[480px] h-[360px] rounded-lg border border-gray-500 mb-4"
        autoPlay
        muted
        playsInline
        controls={!!videoUrl}
        src={videoUrl || undefined}
      />

      {loading && <p className="text-pink-400 mb-4">Processing response...</p>}

      <div className="flex gap-4 mb-4">
        {!recording && (
          <button
            onClick={startRecording}
            className="bg-green-600 px-4 py-2 rounded-lg hover:bg-green-700"
          >
            Start Recording
          </button>
        )}
        {recording && (
          <button
            onClick={stopRecording}
            className="bg-red-600 px-4 py-2 rounded-lg hover:bg-red-700"
          >
            Stop
          </button>
        )}
        <button
          onClick={retryRecording}
          className="bg-yellow-600 px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          Retry
        </button>
      </div>

      {feedback && SHOW_FEEDBACK_IMMEDIATELY && (
        <div className="bg-gray-800 p-4 rounded-lg max-w-xl">
          <h3 className="text-lg font-semibold">Feedback</h3>
          <p>{feedback.summary}</p>
          <p className="mt-2">Tone: {feedback.tone}</p>
        </div>
      )}

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleNext}
          className="bg-blue-600 px-6 py-3 rounded-lg hover:bg-blue-700"
        >
          {current + 1 < questions.length ? "Next Question" : "Finish Interview"}
        </button>
      </div>
    </div>
  );
}

export default InterviewPage;
