import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { axiosInstance } from "../utils/axios";
import SessionAnalyticsPage from "./SessionAnalyticsPage";

export default function SessionDetailedPage() {
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const res = await axiosInstance.get(`/dashboard/session/${sessionId}/details`);
        setSessionDetails(res.data);
      } catch (error) {
        console.error("Error loading session details:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [sessionId]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0E0F1A] via-[#1B1F3B] to-[#0E0F1A]">
        <div className="text-center space-y-4">
          <div className="w-16 h-16 border-4 border-t-[#FF5DA2] border-r-[#00F2E2] rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-300 text-lg">Loading session details...</p>
        </div>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center text-white bg-gradient-to-br from-[#0E0F1A] via-[#1B1F3B] to-[#0E0F1A] p-6">
        <h2 className="text-3xl font-bold text-[#FF5DA2]">Session Not Found</h2>
        <p className="text-gray-400 mt-2">This session may have been deleted or doesn’t exist.</p>
        <Link
          to="/dashboard"
          className="mt-6 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] hover:scale-105 transition"
        >
        Back to Dashboard
        </Link>
      </div>
    );
  }

  const { session, responses, analytics } = sessionDetails;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0E0F1A] via-[#1B1F3B] to-[#0E0F1A] text-white px-6 py-10 space-y-12">
      {/* Header */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] bg-clip-text text-transparent">
            Session from {new Date(session.createdAt).toLocaleDateString()}
          </h1>
          <p className="text-gray-400 mt-1">
            {new Date(session.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>  ````
        <Link
          to="/dashboard"
          className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] hover:scale-105 transition"
        >
          Back to Dashboard
        </Link>
      </div>

      {/* Session Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="p-4 bg-[#141625] rounded-xl border border-[#5F27CD]/30">
          <p className="text-gray-400 text-sm">Job Description</p>
          <h3 className="text-lg font-bold text-white">{session.jobDescription}</h3>
        </div>
        <div className="p-4 bg-[#141625] rounded-xl border border-[#5F27CD]/30">
          <p className="text-gray-400 text-sm">Interview Type</p>
          <h3 className="text-lg font-bold text-white">{session.type}</h3>
        </div>
        <div className="p-4 bg-[#141625] rounded-xl border border-[#00F2E2]/30">
          <p className="text-gray-400 text-sm">Total Questions</p>
          <h3 className="text-lg font-bold text-white">{session.numQuestions}</h3>
        </div>
      </div>

      {/* Analytics */}
      <SessionAnalyticsPage analytics={analytics} />

      {/* Question Responses */}
      <div>
        <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] bg-clip-text text-transparent">
          Question Responses
        </h2>

        {/* Tabs */}
        <div className="flex flex-wrap justify-center gap-3 mb-8">
          {responses.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 rounded-xl font-bold transition-all ${
                activeTab === idx
                  ? "bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] text-white shadow-md"
                  : "bg-[#1E1E2F] text-gray-300 hover:bg-[#2C2C3A]"
              }`}
            >
              Q{idx + 1}
            </button>
          ))}
        </div>

        {/* Question Header */}
                   <div className="flex justify-between items-center mb-8 pb-4 border-b border-gradient-to-r from-pink-500/20 to-cyan-400/20">
                     <div className="flex items-center space-x-4">
                       <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg animate-pulse">
                         {activeTab + 1}
                       </div>
                       <div>
                         <h3 className="text-xl font-bold text-white">Question {activeTab + 1}</h3>
                         <p className="text-sm text-gray-400">Interactive Assessment</p>
                       </div>
                     </div>
                     <div className="text-right">
                       <div className="bg-slate-700/50 px-3 py-1 rounded-full text-xs text-gray-300 mb-1">
                         Attempt {responses[activeTab].attempt}
                       </div>
                       <div className="text-xs text-gray-500">
                         {new Date(responses[activeTab].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                       </div>
                     </div>
                   </div>

                   {/* Question Text */}
                   <div className="mb-8">
                     <div className="flex items-center space-x-2 mb-3">
                       <span className="text-lg">❓</span>
                       <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Question</h4>
                     </div>
                     <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 p-6 rounded-2xl border border-white/10">
                       <p className="text-lg text-white leading-relaxed">{responses[activeTab].questionText}</p>
                     </div>
                   </div>

                   {/* User Answer */}
                   <div className="mb-8">
                     <div className="flex items-center space-x-2 mb-3">
                       <span className="text-lg">💭</span>
                       <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Your Answer</h4>
                     </div>
                     <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20">
                       <p className="text-base text-white leading-relaxed relative z-10">
                         {responses[activeTab].userAnswer || "No transcript available"}
                       </p>
                       <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
                     </div>
                   </div>

                   {/* AI Evaluation Grid */}
                   <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                     <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300 group/eval">
                       <div className="flex items-center space-x-2 mb-3">
                         <span className="text-lg group-hover/eval:scale-110 transition-transform duration-300">📝</span>
                         <h5 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Summary</h5>
                       </div>
                       <p className="text-white leading-relaxed">{responses[activeTab].evaluation?.summary || "N/A"}</p>
                     </div>

                     <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300 group/eval">
                       <div className="flex items-center space-x-2 mb-3">
                         <span className="text-lg group-hover/eval:scale-110 transition-transform duration-300">🎭</span>
                         <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Tone</h5>
                       </div>
                       <p className="text-white leading-relaxed">{responses[activeTab].evaluation?.tone || "Neutral"}</p>
                     </div>

                     <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-5 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300 group/eval">
                       <div className="flex items-center space-x-2 mb-3">
                         <span className="text-lg group-hover/eval:scale-110 transition-transform duration-300">✨</span>
                         <h5 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Strengths</h5>
                       </div>
                       <p className="text-white leading-relaxed">
                         {responses[activeTab].evaluation?.strengths?.length ? responses[activeTab].evaluation.strengths.join(", ") : "None identified"}
                       </p>
                     </div>

                     <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 p-5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300 group/eval">
                       <div className="flex items-center space-x-2 mb-3">
                         <span className="text-lg group-hover/eval:scale-110 transition-transform duration-300">🎯</span>
                         <h5 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Improvement Areas</h5>
                       </div>
                       <p className="text-white leading-relaxed">{responses[activeTab].evaluation?.improvement || "N/A"}</p>
                     </div>
                   </div>

                   {/* Ideal Answer */}
                   <div className="mb-6">
                     <div className="flex items-center space-x-2 mb-4">
                       <span className="text-lg">⭐</span>
                       <h5 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Ideal Answer</h5>
                     </div>
                     <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20">
                       <p className="text-white leading-relaxed relative z-10">
                         {responses[activeTab].evaluation?.idealAnswer || "N/A"}
                       </p>
                       <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-full blur-2xl"></div>
                     </div>
                   </div>

                   {/* Emotions */}
                   {responses[activeTab].emotions?.length > 0 && (
                     <div className="flex items-center space-x-3 text-sm">
                       <span className="text-purple-400 font-medium">Detected Emotions:</span>
                       <div className="flex flex-wrap gap-2">
                         {responses[activeTab].emotions.map((emotion, idx) => (
                           <span 
                             key={idx}
                             className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30"
                           >
                             {emotion}
                           </span>
                         ))}
                       </div>
                     </div>
                   )}
                 </div>
               </div>
             )}
      




