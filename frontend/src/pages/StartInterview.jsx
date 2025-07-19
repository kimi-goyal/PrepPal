import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { axiosInstance } from "../utils/axios";
import useSessionStore from "../store/useSessionStore";

function StartInterview() {
  const [jobDescription, setJobDescription] = useState('');
  const [resumeText, setResumeText] = useState('');
  const [type, setType] = useState('technical');
  const [fileUpload, setFile] = useState(null);
  const [numQuestions, setNumQuestions] = useState(5);
  const [level, setLevel] = useState('Beginner');
  const [experience, setExperience] = useState('Fresher');
  const [focus, setFocus] = useState([]);
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const setSession = useSessionStore((state) => state.setSession);

  const handleFileUpload = (e) => setFile(e.target.files[0]);

  const handleFocusChange = (e) => {
    const { value, checked } = e.target;
    setFocus((prev) =>
      checked ? [...prev, value] : prev.filter((item) => item !== value)
    );
  };

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (loading) return;
  setLoading(true);

  const formData = new FormData();
  formData.append("jd", jobDescription);
  formData.append("resumeText", resumeText);
  formData.append("type", type);
  formData.append("numQuestions", numQuestions);
  formData.append("level", level);
  formData.append("experience", experience);
  formData.append("focus", JSON.stringify(focus));
  if (fileUpload) formData.append("resumePdf", fileUpload);

  try {
    const res = await axiosInstance.post(`/session/session`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const sessionId = res.data.sessionId;
    const questions = res.data.questions; // <-- 🟢 Make sure backend returns this

    setSession({
      sessionId,
      jobDescription,
      resume: resumeText,
      type,
      numQuestions,
      level,
      experience,
      focus,
    });

    navigate(`/interview/${sessionId}`, {
      state: {
        sessionId,
        questions,
        totalQuestions: questions.length,
      },
    });
  } catch (err) {
    console.error("Error starting session:", err);
    alert("Failed to start session.");
  } finally {
    setLoading(false);
  }
};


  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#4e013e] to-[#543254] p-6">
      <main className="rounded-3xl bg-[#161B22] shadow-2xl flex w-full max-w-5xl overflow-hidden text-[#F4F4F5]">
        {/* Sidebar */}
        <section className="bg-[#0D1117] w-80 p-6 rounded-l-3xl flex flex-col gap-6">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="w-16 h-16 bg-[#FF5DA2] rounded-2xl flex items-center justify-center shadow-lg transform rotate-12 animate-pulse">
                  <svg className="w-8 h-8 text-white transform -rotate-12" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                  </svg>
                </div>
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00F2E2] rounded-full animate-ping" />
                <div className="absolute -top-2 -right-2 w-6 h-6 bg-[#00F2E2] rounded-full" />
              </div>
            </div>
            <h1 className="text-3xl font-bold text-[#F4F4F5] mb-2 tracking-wide">
              Prep<span className="text-[#FF5DA2]">Pal</span> AI
            </h1>
            <p className="text-[#94A3B8] text-sm font-medium">Your Smart Interview Assistant</p>
            <div className="w-24 h-1 bg-[#FF5DA2] rounded-full mx-auto mt-3" />
          </div>

          <div>
            <h2 className="text-lg font-bold text-[#F4F4F5] mb-4">Getting Started</h2>
            <div className="space-y-4">
              {[
                { label: "Upload Details", desc: "Add resume and job description", color: "#FF5DA2" },
                { label: "Configure Settings", desc: "Choose difficulty and focus areas", color: "#00F2E2" },
                { label: "Start Practicing", desc: "Begin personalized interview", color: "#5F27CD" },
              ].map((step, i) => (
                <div key={i} className="flex items-start gap-3 group">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg transition-transform duration-300 group-hover:scale-110`} style={{ background: step.color }}>
                    {i + 1}
                  </div>
                  <div>
                    <h3 className="text-[#F4F4F5] font-semibold">{step.label}</h3>
                    <p className="text-[#94A3B8] text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* <div className="bg-white/10 rounded-2xl p-4 border border-white/20 backdrop-blur-sm">
            <h3 className="text-[#F4F4F5] font-semibold mb-3 flex items-center gap-2">
              <span className="animate-pulse">✨</span> AI-Powered Features
            </h3>
            <ul className="space-y-2 text-sm text-[#94A3B8]">
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#FF5DA2] rounded-full animate-pulse" /> Personalized questions</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#00F2E2] rounded-full animate-pulse delay-200" /> Real-time analysis</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#FEE440] rounded-full animate-pulse delay-400" /> Detailed feedback</li>
              <li className="flex items-center gap-2"><div className="w-2 h-2 bg-[#5F27CD] rounded-full animate-pulse delay-600" /> Multiple difficulty levels</li>
            </ul>
          </div> */}
        </section>

        {/* Form */}
        <section className="flex-grow p-8 overflow-y-auto">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="text-sm font-medium text-[#94A3B8]">Job Description</label>
              <textarea
                rows={1}
                value={jobDescription}
                onChange={(e) => setJobDescription(e.target.value)}
                placeholder="Paste job description here..."
                className="w-full mt-2 rounded-lg bg-[#1A1A1A] text-white border border-[#2D3748] p-3 focus:outline-none focus:ring-2 focus:ring-[#FF5DA2]"
              />
            </div>

  

            <div>
              <label className="text-sm font-medium text-[#94A3B8]">Upload PDF Resume</label>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="block mt-2 w-full text-sm text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:bg-[#FF5DA2] file:text-black hover:file:bg-[#FEE440]"
              />
              {fileUpload && (
                <p className="mt-1 text-xs text-[#00F2E2]">Selected file: {fileUpload.name}</p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium text-[#94A3B8]">Question Type</label>
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  className="w-full mt-2 rounded-lg bg-[#1A1A1A] text-white border border-[#2D3748] p-3"
                >
                  <option value="technical">Technical</option>
                  <option value="behavioural">Behavioural</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8]">Number of Questions</label>
                <input
                  type="number"
                  min={1}
                  max={10}
                  value={numQuestions}
                  onChange={(e) => setNumQuestions(e.target.value)}
                  className="w-full mt-2 rounded-lg bg-[#1A1A1A] text-white border border-[#2D3748] p-3"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8]">Interview Level</label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full mt-2 rounded-lg bg-[#1A1A1A] text-white border border-[#2D3748] p-3"
                >
                  <option>Beginner</option>
                  <option>Intermediate</option>
                  <option>Advanced</option>
                </select>
              </div>

              <div>
                <label className="text-sm font-medium text-[#94A3B8]">Experience Level</label>
                <select
                  value={experience}
                  onChange={(e) => setExperience(e.target.value)}
                  className="w-full mt-2 rounded-lg bg-[#1A1A1A] text-white border border-[#2D3748] p-3"
                >
                  <option>Fresher</option>
                  <option>1–2 Years</option>
                  <option>3–5 Years</option>
                  <option>5+ Years</option>
                </select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium text-[#94A3B8] mb-1">Focus Area</label>
              <div className="flex flex-wrap gap-3 mt-2">
                {["Behavioral", "Technical", "System Design", "Coding", "HR"].map((item) => (
                  <label
                    key={item}
                    className={`cursor-pointer px-4 py-2 rounded-full border ${
                      focus.includes(item)
                        ? "bg-[#00F2E2] text-black border-[#00F2E2]"
                        : "bg-[#1A1A1A] text-white border-[#2D3748] hover:border-[#FF5DA2]"
                    } transition-all text-sm`}
                  >
                    <input
                      type="checkbox"
                      value={item}
                      checked={focus.includes(item)}
                      onChange={handleFocusChange}
                      className="hidden"
                    />
                    {item}
                  </label>
                ))}
              </div>
            </div>

            <div className="text-right">
              <button
                type="submit"
                disabled={loading}
                className={`bg-[#FF5DA2] text-black font-semibold px-6 py-2 rounded-full transition-all ${
                  loading ? "opacity-50 cursor-not-allowed" : "hover:bg-[#FEE440]"
                }`}
              >
                {loading ? "Starting..." : "Start Interview"}
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}

export default StartInterview;
