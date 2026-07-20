import React, { useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { axiosInstance } from "../utils/axios";
import { analyzeVocalDelivery } from "../utils/vocalAnalysis";
const SHOW_FEEDBACK_IMMEDIATELY = false;

// Signature mark — logo/idle state, six static bars.
const WaveMark = () => {
  const heights = [10, 18, 26, 16, 22, 12];
  return (
    <div className="flex items-end gap-[3px] h-7">
      {heights.map((h, i) => (
        <span key={i} className="w-[3px] rounded-full bg-[#1E5F53]" style={{ height: h }} />
      ))}
    </div>
  );
};

// Live audio meter — driven by real mic input via AnalyserNode.
const AudioMeter = ({ levels, active }) => (
  <div className="flex items-end gap-[3px] h-8">
    {levels.map((h, i) => (
      <span
        key={i}
        className="w-[4px] rounded-full transition-all duration-75"
        style={{
          height: `${h}px`,
          backgroundColor: active ? "#FF6B5E" : "#4B5563",
        }}
      />
    ))}
  </div>
);
const processRecording = async (blob) => {
  setLoading(true);
  setIsProcessing(true);

  try {
    // Step 1: Transcribe + Evaluate (needs "audio")
    const formData = new FormData();
    formData.append("audio", blob, "response.webm");
    formData.append("question", currentQuestion?.questionText || "");

    const transcriptEvalRes = await axiosInstance.post("/session/transcribe-and-evaluate", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const { transcript, feedback } = transcriptEvalRes.data;

    // NEW: analyze the actual recording for pace/pitch/energy — a real,
    // explainable signal, not a placeholder.
    const wordCount = transcript ? transcript.trim().split(/\s+/).length : 0;
    const { tags: vocalTags, metrics: vocalMetrics } = await analyzeVocalDelivery(blob, wordCount);

    // Step 2: Save Response (needs "video")
    const saveFormData = new FormData();
    saveFormData.append("video", blob, "response.webm");
    saveFormData.append("sessionId", sessionId);
    saveFormData.append("questionText", currentQuestion?.questionText || "");
    saveFormData.append("transcript", transcript);
    saveFormData.append("evaluation", JSON.stringify(feedback));
    saveFormData.append("emotions", JSON.stringify(vocalTags));
    saveFormData.append("vocalMetrics", JSON.stringify(vocalMetrics || {}));

    await axiosInstance.post("/session/save-response", saveFormData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    if (SHOW_FEEDBACK_IMMEDIATELY) setFeedback(feedback);
  } catch (error) {
    console.error("Save error:", error);
    alert("Failed to process or save response. Check console.");
  } finally {
    setLoading(false);
    setIsProcessing(false);
  }
};

function formatTime(seconds) {
  const m = Math.floor(seconds / 60).toString().padStart(2, "0");
  const s = (seconds % 60).toString().padStart(2, "0");
  return `${m}:${s}`;
}

function InterviewPage() {
  const { state } = useLocation();
  const { questions = [], sessionId } = state || {};
  const navigate = useNavigate();

  const [current, setCurrent] = useState(0);
  const [recording, setRecording] = useState(false);
  const [videoUrl, setVideoUrl] = useState(null);
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [completed, setCompleted] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  // --- New: live audio meter + recording timer state ---
  const [levels, setLevels] = useState(Array(8).fill(4));
  const [elapsed, setElapsed] = useState(0);
  const [cameraReady, setCameraReady] = useState(false);

  const mediaRecorderRef = useRef(null);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const recordedChunksRef = useRef([]);

  const audioCtxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(null);
  const timerRef = useRef(null);

  const currentQuestion = questions[current] || null;

  useEffect(() => {
    startCamera();
    return () => stopCamera();
  }, []);

  // --- Live audio level analysis (real mic data, not decorative) ---
  const setupAudioAnalyser = (stream) => {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();
      const source = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 64;
      source.connect(analyser);
      audioCtxRef.current = ctx;
      analyserRef.current = analyser;
      tickAudioLevels();
    } catch (err) {
      console.error("Audio analyser error:", err);
    }
  };

  const tickAudioLevels = () => {
    const analyser = analyserRef.current;
    if (!analyser) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    const bars = 8;
    const chunk = Math.max(1, Math.floor(data.length / bars));
    const newLevels = Array.from({ length: bars }, (_, i) => {
      const slice = data.slice(i * chunk, (i + 1) * chunk);
      const avg = slice.reduce((a, b) => a + b, 0) / (slice.length || 1);
      return Math.max(4, Math.min(32, (avg / 255) * 32));
    });
    setLevels(newLevels);
    rafRef.current = requestAnimationFrame(tickAudioLevels);
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setCameraReady(true);
      setupAudioAnalyser(stream);
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
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    if (audioCtxRef.current) {
      audioCtxRef.current.close().catch(() => {});
      audioCtxRef.current = null;
    }
    analyserRef.current = null;
    setCameraReady(false);
    setLevels(Array(8).fill(4));
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
      setVideoUrl(localUrl);

      if (videoRef.current) {
        videoRef.current.srcObject = null;
        videoRef.current.src = localUrl;
      }

      processRecording(blob);
    };

    mediaRecorder.start();
    setRecording(true);

    // recording timer
    setElapsed(0);
    timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recording && mediaRecorderRef.current.state === "recording") {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  };

  const retryRecording = () => {
    setVideoUrl(null);
    setFeedback(null);
    setElapsed(0);

    if (videoRef.current) {
      videoRef.current.src = "";
      videoRef.current.srcObject = streamRef.current;
    }

    if (!streamRef.current) {
      startCamera();
    }
  };

  const processRecording = async (blob) => {
    setLoading(true);
    setIsProcessing(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "response.webm");
      formData.append("question", currentQuestion?.questionText || "");

      const transcriptEvalRes = await axiosInstance.post("/session/transcribe-and-evaluate", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const { transcript, feedback } = transcriptEvalRes.data;

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
      setIsProcessing(false);
    }
  };

  const handleNext = () => {
    if (isProcessing) return;

    if (current + 1 < questions.length) {
      setCurrent(prev => prev + 1);
      setVideoUrl(null);
      setFeedback(null);
      setElapsed(0);

      if (videoRef.current) {
        videoRef.current.src = "";
        videoRef.current.srcObject = streamRef.current;
      }
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
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F4] font-sans">
        <p className="text-[#6E6A62]">No questions available.</p>
      </div>
    );
  }

  if (completed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F5F6F4] p-6 font-sans">
        <div className="bg-white border border-[#E3E1DB] p-10 rounded-2xl text-center max-w-sm shadow-[0_1px_2px_rgba(23,26,33,0.04)]">
          <div className="flex justify-center mb-5">
            <WaveMark />
          </div>
          <h2 className="text-2xl font-display font-medium text-[#171A21] mb-2">
            Interview completed
          </h2>
          <p className="text-sm text-[#6E6A62] mb-6">
            Nice work — {questions.length} question{questions.length > 1 ? "s" : ""} answered.
          </p>
          <button
            onClick={handleFinish}
            className="bg-[#171A21] text-white rounded-lg px-6 py-3 text-sm font-medium hover:bg-[#1E5F53] transition-colors"
          >
            Go to dashboard
          </button>
        </div>
      </div>
    );
  }

  const isDisabled = recording || loading || isProcessing;

  return (
    <div className="min-h-screen bg-[#F5F6F4] font-sans">
      {/* Processing Overlay */}
      {isProcessing && (
        <div className="fixed inset-0 bg-[#171A21]/60 flex items-center justify-center z-50">
          <div className="bg-white border border-[#E3E1DB] p-7 rounded-2xl text-center">
            <div className="flex justify-center mb-4">
              <AudioMeter levels={[18, 26, 14, 30, 20, 24, 12, 22]} active />
            </div>
            <p className="text-[#171A21] text-sm font-medium">Processing your response…</p>
            <p className="text-[#6E6A62] text-xs mt-1.5">Please wait, don't navigate away</p>
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header: logo + step dots */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-2.5">
            <WaveMark />
            <span className="text-sm font-display font-medium text-[#171A21]">
              Prep<span className="italic">Pal</span>
            </span>
          </div>
          <div className="flex items-center gap-2">
            {questions.map((_, idx) => (
              <span
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === current ? "w-6 bg-[#1E5F53]" : idx < current ? "w-1.5 bg-[#1E5F53]" : "w-1.5 bg-[#E3E1DB]"
                }`}
              />
            ))}
          </div>
          <span className="text-xs font-mono text-[#6E6A62]">
            {current + 1} / {questions.length}
          </span>
        </div>

        {/* Two-column stage */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Video stage */}
          <div className="lg:col-span-3">
            <div className="relative rounded-2xl overflow-hidden bg-[#0D0F13] border border-[#E3E1DB] aspect-[4/3]">
              <video
                ref={videoRef}
                className="w-full h-full object-cover"
                autoPlay
                muted
                playsInline
                controls={!!videoUrl}
                src={videoUrl || undefined}
              />

              {/* LIVE badge */}
              {cameraReady && !recording && !videoUrl && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#1E5F53]" />
                  <span className="text-[11px] font-mono text-white tracking-wide">LIVE</span>
                </div>
              )}

              {/* REC badge + timer */}
              {recording && (
                <div className="absolute top-4 left-4 flex items-center gap-1.5 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#FF6B5E] animate-pulse" />
                  <span className="text-[11px] font-mono text-white tracking-wide">REC {formatTime(elapsed)}</span>
                </div>
              )}

              {/* Live audio meter overlay */}
              {cameraReady && !videoUrl && (
                <div className="absolute bottom-4 left-4 bg-black/50 backdrop-blur-sm px-3 py-2 rounded-xl">
                  <AudioMeter levels={levels} active={recording} />
                </div>
              )}
            </div>
          </div>

          {/* Question + controls panel */}
          <div className="lg:col-span-2 flex flex-col">
            <div className="bg-white border border-[#E3E1DB] rounded-2xl p-6 flex-1 flex flex-col">
              <span className="text-xs font-mono uppercase tracking-wide text-[#6E6A62] mb-3">
                Question {current + 1}
              </span>
              <p className="text-xl font-display font-medium text-[#171A21] leading-snug mb-6">
                {currentQuestion?.questionText}
              </p>

              {loading && (
                <div className="flex items-center gap-2 mb-4">
                  <AudioMeter levels={[10, 16, 8, 20, 12]} active />
                  <p className="text-[#6E6A62] text-sm">Processing response…</p>
                </div>
              )}

              <div className="mt-auto space-y-3">
                <div className="flex gap-2">
                  {!recording && !videoUrl && (
                    <button
                      onClick={startRecording}
                      disabled={isDisabled}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        isDisabled
                          ? "bg-[#E3E1DB] text-[#9C988E] cursor-not-allowed"
                          : "bg-[#171A21] text-white hover:bg-[#1E5F53]"
                      }`}
                    >
                      Start recording
                    </button>
                  )}

                  {recording && (
                    <button
                      onClick={stopRecording}
                      disabled={loading || isProcessing}
                      className={`flex-1 px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        (loading || isProcessing)
                          ? "bg-[#E3E1DB] text-[#9C988E] cursor-not-allowed"
                          : "bg-[#A6423A] text-white hover:bg-[#8C3730]"
                      }`}
                    >
                      Stop recording
                    </button>
                  )}

                  <button
                    onClick={retryRecording}
                    disabled={recording || loading || isProcessing}
                    className={`px-4 py-3 rounded-lg text-sm font-medium border transition-colors ${
                      isDisabled
                        ? "border-[#E3E1DB] text-[#9C988E] cursor-not-allowed"
                        : "border-[#E3E1DB] text-[#171A21] bg-white hover:border-[#1E5F53]"
                    }`}
                  >
                    {videoUrl ? "Redo" : "Retry"}
                  </button>
                </div>

                {feedback && SHOW_FEEDBACK_IMMEDIATELY && (
                  <div className="bg-[#F5F6F4] border border-[#E3E1DB] p-4 rounded-xl">
                    <h3 className="text-sm font-semibold text-[#171A21]">Feedback</h3>
                    <p className="text-[#6E6A62] text-sm mt-1">{feedback.summary}</p>
                    <p className="mt-2 text-[#6E6A62] text-sm">Tone: {feedback.tone}</p>
                  </div>
                )}

                <button
                  onClick={handleNext}
                  disabled={isDisabled || !videoUrl}
                  className={`w-full px-6 py-3 rounded-lg text-sm font-medium transition-colors ${
                    (isDisabled || !videoUrl)
                      ? "bg-[#E3E1DB] text-[#9C988E] cursor-not-allowed"
                      : "bg-[#1E5F53] text-white hover:bg-[#174B41]"
                  }`}
                >
                  {current + 1 < questions.length ? "Next question" : "Finish interview"}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default InterviewPage;