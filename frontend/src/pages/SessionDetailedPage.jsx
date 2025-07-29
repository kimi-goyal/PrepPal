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
        </div>
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
      




//  import React, { useEffect, useState } from "react";
//  import { useParams, Link } from "react-router-dom";
//  import { axiosInstance } from "../utils/axios";
//  import SessionAnalyticsPage from "./SessionAnalyticsPage";

//  export default function SessionDetailedPage() {
//    const { sessionId } = useParams();
//    const [sessionDetails, setSessionDetails] = useState(null);
//    const [loading, setLoading] = useState(true);
//    const [activeTab, setActiveTab] = useState(0);

//    useEffect(() => {
//      const fetchDetails = async () => {
//        try {
//          const res = await axiosInstance.get(`/dashboard/session/${sessionId}/details`);
//          setSessionDetails(res.data);
//        } catch (error) {
//          console.error("Error loading session details:", error);
//        } finally {
//          setLoading(false);
//        }
//      };
//      fetchDetails();
//    }, [sessionId]);

//    if (loading) {
//      return (
//        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//          <div className="relative">
//            <div className="w-20 h-20 border-4 border-transparent border-t-pink-500 border-r-cyan-400 rounded-full animate-spin"></div>
//            <div className="absolute inset-0 w-16 h-16 m-2 border-4 border-transparent border-b-purple-500 border-l-pink-400 rounded-full animate-spin animate-reverse"></div>
//            <div className="mt-8 text-center">
//              <p className="text-white text-lg font-medium">Loading session details...</p>
//              <div className="flex justify-center mt-2 space-x-1">
//                <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce"></div>
//                <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
//                <div className="w-2 h-2 bg-purple-500 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
//              </div>
//            </div>
//          </div>
//        </div>
//      );
//    }

//    if (!sessionDetails) {
//      return (
//        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
//          <div className="text-center">
//            <div className="w-24 h-24 mx-auto mb-6 rounded-full bg-gradient-to-r from-pink-500/20 to-cyan-400/20 flex items-center justify-center border border-white/10">
//              <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 12h6m-6-4h6m2 5.291A7.962 7.962 0 0112 15c-2.137 0-4.146-.832-5.636-2.364M6.343 7.343A7.963 7.963 0 0112 5c4.418 0 8 3.582 8 8a7.963 7.963 0 01-2.343 5.657" />
//              </svg>
//            </div>
//            <h2 className="text-2xl font-bold text-white mb-2">Session Not Found</h2>
//            <p className="text-gray-400 mb-6">The session you're looking for doesn't exist or has been removed.</p>
//            <Link
//              to="/dashboard"
//              className="inline-flex items-center px-6 py-3 bg-gradient-to-r from-pink-500 to-cyan-400 text-white font-medium rounded-full hover:shadow-lg hover:shadow-pink-500/25 transition-all duration-300 transform hover:scale-105"
//            >
//              Return to Dashboard
//            </Link>
//          </div>
//        </div>
//      );
//    }

//    const { session, responses, analytics } = sessionDetails;

//    return (
//      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 text-white">
//        {/* Animated background elements */}
//        <div className="fixed inset-0 overflow-hidden pointer-events-none">
//          <div className="absolute -top-1/2 -left-1/2 w-full h-full bg-gradient-to-r from-pink-500/5 to-transparent rounded-full blur-3xl animate-pulse"></div>
//          <div className="absolute -bottom-1/2 -right-1/2 w-full h-full bg-gradient-to-l from-cyan-400/5 to-transparent rounded-full blur-3xl animate-pulse" style={{animationDelay: '2s'}}></div>
//        </div>

//        <div className="relative z-10 px-4 md:px-8 py-8 space-y-12">
//          {/* Enhanced Header */}
//          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//            <div className="space-y-2">
//              <div className="flex items-center space-x-3 mb-2">
//                <div className="w-3 h-3 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full animate-pulse"></div>
//                <span className="text-sm font-medium text-cyan-400 uppercase tracking-wider">Session Review</span>
//              </div>
//              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black bg-gradient-to-r from-pink-500 via-purple-500 to-cyan-400 bg-clip-text text-transparent leading-tight">
//                {new Date(session.createdAt).toLocaleDateString('en-US', { 
//                  weekday: 'long', 
//                  year: 'numeric', 
//                  month: 'long', 
//                  day: 'numeric' 
//                })}
//              </h1>
//              <p className="text-gray-400 text-lg">
//                {new Date(session.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//              </p>
//            </div>
//            <Link
//              to="/dashboard"
//              className="group relative overflow-hidden bg-gradient-to-r from-pink-500 to-cyan-400 px-8 py-4 rounded-2xl font-bold text-white shadow-2xl shadow-pink-500/25 hover:shadow-cyan-400/25 transition-all duration-500 transform hover:scale-105 hover:-rotate-1"
//            >
//              <span className="relative z-10 flex items-center space-x-2">
//                <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
//                </svg>
//                <span>Back to Dashboard</span>
//              </span>
//              <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
//            </Link>
//          </div>

//          {/* Enhanced Session Overview */}
//          <div className="relative group">
//            <div className="absolute -inset-1 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
//            <div className="relative bg-slate-800/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10">
//              <div className="flex items-center space-x-3 mb-6">
//                <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-full flex items-center justify-center">
//                  <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                  </svg>
//                </div>
//                <h2 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
//                  Session Overview
//                </h2>
//              </div>
            
//              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
//                {[
//                  { label: "Job", value: session.jobDescription, icon: "💼" },
//                  { label: "Type", value: session.type, icon: "🎯" },
//                  { label: "Level", value: session.level, icon: "📊" },
//                  { label: "Experience", value: session.experience, icon: "⚡" },
//                  { label: "Questions", value: session.numQuestions, icon: "❓" },
//                  { label: "Avg Confidence", value: `${analytics.avgConfidence}%`, icon: "📈" }
//                ].map((item, idx) => (
//                  <div key={idx} className="group/stat relative overflow-hidden bg-gradient-to-br from-slate-700/50 to-slate-800/50 p-4 rounded-2xl border border-white/10 hover:border-pink-500/30 transition-all duration-300 hover:scale-105">
//                    <div className="flex items-center space-x-3">
//                      <span className="text-2xl group-hover/stat:scale-110 transition-transform duration-300">{item.icon}</span>
//                      <div>
//                        <p className="text-xs font-medium text-cyan-400 uppercase tracking-wider">{item.label}</p>
//                        <p className="text-lg font-bold text-white">{item.value}</p>
//                      </div>
//                    </div>
//                    <div className="absolute inset-0 bg-gradient-to-r from-pink-500/10 to-cyan-400/10 opacity-0 group-hover/stat:opacity-100 transition-opacity duration-300"></div>
//                  </div>
//                ))}
//              </div>
            
//              <div className="relative bg-gradient-to-r from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20">
//                <div className="flex items-start space-x-3">
//                  <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
//                    <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
//                    </svg>
//                  </div>
//                  <div>
//                    <h4 className="text-sm font-semibold text-purple-400 mb-2">AI Tips & Insights</h4>
//                    <p className="text-gray-300 leading-relaxed">{analytics.tips}</p>
//                  </div>
//                </div>
//              </div>
//            </div>
//          </div>

//          {/* Analytics Section */}
//          <SessionAnalyticsPage analytics={analytics} />

//          {/* Enhanced Question Navigation Section */}
//          <div className="space-y-8">
//            <div className="text-center mb-12">
//              <h2 className="text-3xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent mb-4">
//                Question Responses
//              </h2>
//              <div className="w-24 h-1 bg-gradient-to-r from-pink-500 to-cyan-400 mx-auto rounded-full"></div>
//            </div>

//            {/* Tab Navigation */}
//            <div className="relative">
//              {/* Tab Buttons */}
//              <div className="flex flex-wrap justify-center gap-2 mb-8 p-4 bg-slate-800/50 backdrop-blur-xl rounded-3xl border border-white/10">
//                {responses.map((_, idx) => (
//                  <button
//                    key={idx}
//                    onClick={() => setActiveTab(idx)}
//                    className={`relative group px-4 py-3 rounded-2xl font-bold text-sm transition-all duration-300 transform hover:scale-105 ${
//                      activeTab === idx
//                        ? 'bg-gradient-to-r from-pink-500 to-cyan-400 text-white shadow-lg shadow-pink-500/25'
//                        : 'bg-slate-700/50 text-gray-300 hover:bg-slate-600/50 hover:text-white'
//                    }`}
//                  >
//                    <span className="relative z-10 flex items-center space-x-2">
//                      <span>{idx + 1}</span>
//                      {activeTab === idx && (
//                        <svg className="w-4 h-4 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
//                        </svg>
//                      )}
//                    </span>
//                    {activeTab === idx && (
//                      <div className="absolute inset-0 bg-gradient-to-r from-cyan-400 to-pink-500 opacity-0 group-hover:opacity-20 rounded-2xl transition-opacity duration-300"></div>
//                    )}
//                  </button>
//                ))}
//              </div>

//              {/* Navigation Buttons */}
//              <div className="flex justify-between items-center mb-8">
//                <button
//                  onClick={() => setActiveTab(Math.max(0, activeTab - 1))}
//                  disabled={activeTab === 0}
//                  className={`group flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
//                    activeTab === 0
//                      ? 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
//                      : 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-lg shadow-purple-500/25 hover:shadow-pink-500/25'
//                  }`}
//                >
//                  <svg className={`w-5 h-5 transition-transform duration-300 ${activeTab > 0 ? 'group-hover:-translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
//                  </svg>
//                  <span>Previous</span>
//                </button>

//                <div className="text-center">
//                  <div className="text-sm text-gray-400 mb-1">Question</div>
//                  <div className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
//                    {activeTab + 1} of {responses.length}
//                  </div>
//                </div>

//                <button
//                  onClick={() => setActiveTab(Math.min(responses.length - 1, activeTab + 1))}
//                  disabled={activeTab === responses.length - 1}
//                  className={`group flex items-center space-x-2 px-6 py-3 rounded-2xl font-semibold transition-all duration-300 transform hover:scale-105 ${
//                    activeTab === responses.length - 1
//                      ? 'bg-slate-700/30 text-gray-500 cursor-not-allowed'
//                      : 'bg-gradient-to-r from-cyan-500 to-blue-500 text-white shadow-lg shadow-cyan-500/25 hover:shadow-blue-500/25'
//                  }`}
//                >
//                  <span>Next</span>
//                  <svg className={`w-5 h-5 transition-transform duration-300 ${activeTab < responses.length - 1 ? 'group-hover:translate-x-1' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
//                  </svg>
//                </button>
//              </div>

//              {/* Active Question Content */}
//              {responses[activeTab] && (
//                <div className="group relative">
//                  {/* Glowing border effect */}
//                  <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-400/20 rounded-3xl blur opacity-75 animate-pulse"></div>
                
//                  <div className="relative bg-gradient-to-br from-slate-800/90 via-slate-800/95 to-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/20 transform transition-all duration-500">
                  
                   
//      </div>
//    );
//  }
