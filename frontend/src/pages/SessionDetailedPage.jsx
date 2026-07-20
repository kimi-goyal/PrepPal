// import React, { useEffect, useState } from "react";
// import { useParams, Link } from "react-router-dom";
// import { axiosInstance } from "../utils/axios";
// import SessionAnalyticsPage from "./SessionAnalyticsPage";

// export default function SessionDetailedPage() {
//   const { sessionId } = useParams();
//   const [sessionDetails, setSessionDetails] = useState(null);
//   const [loading, setLoading] = useState(true);
//   const [activeTab, setActiveTab] = useState(0);
//   const [copied, setCopied] = useState(false);

//   useEffect(() => {
//     const fetchDetails = async () => {
//       try {
//         const res = await axiosInstance.get(`/dashboard/session/${sessionId}/details`);
//         setSessionDetails(res.data);
//       } catch (error) {
//         console.error("Error loading session details:", error);
//       } finally {
//         setLoading(false);
//       }
//     };
//     fetchDetails();
//   }, [sessionId]);

//   const copyToClipboard = (text) => {
//     if (!text) return;
//     navigator.clipboard.writeText(text);
//     setCopied(true);
//     setTimeout(() => setCopied(false), 2000);
//   };

//   if (loading) {
//     return (
//       <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-[#0B0F19] via-[#141625] to-[#0B0F19]">
//         <div className="text-center space-y-4">
//           <div className="w-16 h-16 border-4 border-t-[#FF5DA2] border-r-[#00F2E2] rounded-full animate-spin mx-auto"></div>
//           <p className="text-gray-300 text-lg">Loading session details...</p>
//         </div>
//       </div>
//     );
//   }

//   if (!sessionDetails) {
//     return (
//       <div className="min-h-screen flex flex-col items-center justify-center text-center text-white bg-gradient-to-br from-[#0B0F19] via-[#141625] to-[#0B0F19] p-6">
//         <h2 className="text-3xl font-bold text-[#FF5DA2]">Session Not Found</h2>
//         <p className="text-gray-400 mt-2">This session may have been deleted or doesn’t exist.</p>
//         <Link
//           to="/dashboard"
//           className="mt-6 px-6 py-3 rounded-xl font-bold text-white bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] hover:scale-105 transition"
//         >
//           Back to Dashboard
//         </Link>
//       </div>
//     );
//   }

//   const { session, responses, analytics } = sessionDetails;

//   return (
//     <div className="min-h-screen bg-gradient-to-br from-[#0B0F19] via-[#141625] to-[#0B0F19] text-white px-6 py-10 space-y-12">
//       {/* Header */}
//       <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
//         <div>
//           <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] bg-clip-text text-transparent">
//             Session from {new Date(session.createdAt).toLocaleDateString()}
//           </h1>
//           <p className="text-gray-400 mt-1">
//             {new Date(session.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//           </p>
//         </div>
//         <Link
//           to="/dashboard"
//           className="px-6 py-3 rounded-xl font-bold bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] hover:scale-105 transition"
//         >
//           Back to Dashboard
//         </Link>
//       </div>

//       {/* Session Overview */}
//       <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
//         <div className="p-4 bg-white/5 rounded-xl border border-white/10">
//           <p className="text-gray-400 text-sm">Job Description</p>
//           <h3 className="text-sm font-bold text-white line-clamp-3">{session.jobDescription}</h3>
//         </div>
//         <div className="p-4 bg-white/5 rounded-xl border border-white/10">
//           <p className="text-gray-400 text-sm">Interview Type</p>
//           <h3 className="text-lg font-bold text-white">{session.type}</h3>
//         </div>
//         <div className="p-4 bg-white/5 rounded-xl border border-white/10">
//           <p className="text-gray-400 text-sm">Total Questions</p>
//           <h3 className="text-lg font-bold text-white">{session.numQuestions}</h3>
//         </div>
//       </div>

//       {/* Analytics */}
//       <SessionAnalyticsPage analytics={analytics} />

//       {/* Question Responses */}
//       {responses && responses.length > 0 ? (
//         <div>
//           <h2 className="text-2xl font-bold mb-6 text-center bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] bg-clip-text text-transparent">
//             Question Responses
//           </h2>

//           {/* Tabs */}
//           <div className="flex flex-wrap justify-center gap-3 mb-8">
//             {responses.map((_, idx) => (
//               <button
//                 key={idx}
//                 onClick={() => setActiveTab(idx)}
//                 className={`px-4 py-2 rounded-xl font-bold transition-all ${
//                   activeTab === idx
//                     ? "bg-gradient-to-r from-[#FF5DA2] to-[#00F2E2] text-white shadow-md"
//                     : "bg-white/10 text-gray-300 hover:bg-[#2C2C3A]"
//                 }`}
//               >
//                 Q{idx + 1}
//               </button>
//             ))}
//           </div>

//           <div className="bg-white/5 border border-white/10 rounded-2xl p-6 md:p-8">
//             {/* Question Header */}
//             <div className="flex justify-between items-center mb-8 pb-4 border-b border-white/10">
//               <div className="flex items-center space-x-4">
//                 <div className="w-12 h-12 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-2xl flex items-center justify-center text-white font-bold text-lg shadow-lg">
//                   {activeTab + 1}
//                 </div>
//                 <div>
//                   <h3 className="text-xl font-bold text-white">Question {activeTab + 1}</h3>
//                   <p className="text-sm text-gray-400">Interactive Assessment</p>
//                 </div>
//               </div>
//               <div className="text-right">
//                 <div className="bg-slate-700/50 px-3 py-1 rounded-full text-xs text-gray-300 mb-1">
//                   Attempt {responses[activeTab].attempt || 1}
//                 </div>
//                 <div className="text-xs text-gray-500">
//                   {new Date(responses[activeTab].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
//                 </div>
//               </div>
//             </div>

//             {/* Question Text */}
//             <div className="mb-8">
//               <div className="flex items-center space-x-2 mb-3">
//                 <span className="text-lg">❓</span>
//                 <h4 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Question</h4>
//               </div>
//               <div className="bg-gradient-to-r from-slate-700/30 to-slate-600/30 p-6 rounded-2xl border border-white/10">
//                 <p className="text-lg text-white leading-relaxed">{responses[activeTab].questionText}</p>
//               </div>
//             </div>

//             {/* User Answer */}
//             <div className="mb-8">
//               <div className="flex items-center space-x-2 mb-3">
//                 <span className="text-lg">💭</span>
//                 <h4 className="text-sm font-semibold text-purple-400 uppercase tracking-wider">Your Answer</h4>
//               </div>
//               <div className="relative overflow-hidden bg-gradient-to-br from-purple-500/10 to-pink-500/10 p-6 rounded-2xl border border-purple-500/20">
//                 <p className="text-base text-white leading-relaxed relative z-10">
//                   {responses[activeTab].userAnswer || "No transcript available"}
//                 </p>
//                 <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-purple-500/5 to-transparent rounded-full blur-2xl"></div>
//               </div>
//             </div>

//             {/* AI Evaluation Grid */}
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
//               <div className="bg-gradient-to-br from-blue-500/10 to-purple-500/10 p-5 rounded-2xl border border-blue-500/20 hover:border-blue-500/40 transition-all duration-300">
//                 <div className="flex items-center space-x-2 mb-3">
//                   <span className="text-lg">📝</span>
//                   <h5 className="text-sm font-semibold text-blue-400 uppercase tracking-wider">Summary</h5>
//                 </div>
//                 <p className="text-white leading-relaxed">{responses[activeTab].evaluation?.summary || "N/A"}</p>
//               </div>

//               <div className="bg-gradient-to-br from-cyan-500/10 to-blue-500/10 p-5 rounded-2xl border border-cyan-500/20 hover:border-cyan-500/40 transition-all duration-300">
//                 <div className="flex items-center space-x-2 mb-3">
//                   <span className="text-lg">🎭</span>
//                   <h5 className="text-sm font-semibold text-cyan-400 uppercase tracking-wider">Tone</h5>
//                 </div>
//                 <p className="text-white leading-relaxed">{responses[activeTab].evaluation?.tone || "Neutral"}</p>
//               </div>

//               <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 p-5 rounded-2xl border border-green-500/20 hover:border-green-500/40 transition-all duration-300">
//                 <div className="flex items-center space-x-2 mb-3">
//                   <span className="text-lg">✨</span>
//                   <h5 className="text-sm font-semibold text-green-400 uppercase tracking-wider">Strengths</h5>
//                 </div>
//                 <p className="text-white leading-relaxed">
//                   {responses[activeTab].evaluation?.strengths?.length 
//                     ? responses[activeTab].evaluation.strengths.join(", ") 
//                     : "None identified"}
//                 </p>
//               </div>

//               <div className="bg-gradient-to-br from-red-500/10 to-pink-500/10 p-5 rounded-2xl border border-red-500/20 hover:border-red-500/40 transition-all duration-300">
//                 <div className="flex items-center space-x-2 mb-3">
//                   <span className="text-lg">🎯</span>
//                   <h5 className="text-sm font-semibold text-red-400 uppercase tracking-wider">Improvement Areas</h5>
//                 </div>
//                 <p className="text-white leading-relaxed">{responses[activeTab].evaluation?.improvement || "N/A"}</p>
//               </div>
//             </div>

//             {/* Ideal Answer with Copier micro-interaction */}
//             <div className="mb-6">
//               <div className="flex justify-between items-center mb-4">
//                 <div className="flex items-center space-x-2">
//                   <span className="text-lg">⭐</span>
//                   <h5 className="text-sm font-semibold text-yellow-400 uppercase tracking-wider">Ideal Answer</h5>
//                 </div>
//                 <button 
//                   onClick={() => copyToClipboard(responses[activeTab].evaluation?.idealAnswer)}
//                   className="text-xs text-gray-400 hover:text-white transition bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-lg border border-white/10"
//                 >
//                   {copied ? "Copied! ✓" : "Copy Reference"}
//                 </button>
//               </div>
//               <div className="relative overflow-hidden bg-gradient-to-br from-yellow-500/10 to-orange-500/10 p-6 rounded-2xl border border-yellow-500/20">
//                 <p className="text-white leading-relaxed relative z-10">
//                   {responses[activeTab].evaluation?.idealAnswer || "N/A"}
//                 </p>
//                 <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-yellow-500/5 to-transparent rounded-full blur-2xl"></div>
//               </div>
//             </div>

//             {/* Emotions */}
//             {responses[activeTab].emotions?.length > 0 && (
//               <div className="flex items-center space-x-3 text-sm pt-4 border-t border-white/10">
//                 <span className="text-purple-400 font-medium">Detected Emotions:</span>
//                 <div className="flex flex-wrap gap-2">
//                   {responses[activeTab].emotions.map((emotion, idx) => (
//                     <span 
//                       key={idx}
//                       className="px-3 py-1 bg-gradient-to-r from-purple-500/20 to-pink-500/20 text-purple-300 rounded-full text-xs border border-purple-500/30"
//                     >
//                       {emotion}
//                     </span>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       ) : (
//         <div className="text-center py-12 text-gray-400">
//           No question responses recorded for this session.
//         </div>
//       )}
//     </div>
//   );
// }
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { axiosInstance } from "../utils/axios";
import SessionAnalyticsPage from "./SessionAnalyticsPage";

const WaveMark = () => {
  const heights = [8, 14, 20, 12, 17, 9];
  return (
    <div className="flex items-end gap-[3px] h-6">
      {heights.map((h, i) => (
        <span key={i} className="w-[2.5px] rounded-full bg-[#1E5F53] animate-pulse" style={{ height: h, animationDelay: `${i * 90}ms` }} />
      ))}
    </div>
  );
};

export default function SessionDetailedPage() {
  const { sessionId } = useParams();
  const [sessionDetails, setSessionDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0);
  const [copied, setCopied] = useState(false);

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

  const copyToClipboard = (text) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F5F6F4] font-sans">
        <div className="text-center space-y-4">
          <div className="flex justify-center"><WaveMark /></div>
          <p className="text-[#6E6A62] text-sm">Loading session details…</p>
        </div>
      </div>
    );
  }

  if (!sessionDetails) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center text-center bg-[#F5F6F4] p-6 font-sans">
        <h2 className="text-2xl font-display font-medium text-[#171A21]">Session not found</h2>
        <p className="text-[#6E6A62] mt-2 text-sm">This session may have been deleted or doesn't exist.</p>
        <Link
          to="/dashboard"
          className="mt-6 px-6 py-3 rounded-lg font-medium text-white bg-[#171A21] hover:bg-[#1E5F53] transition-colors"
        >
          Back to dashboard
        </Link>
      </div>
    );
  }

  const { session, responses, analytics } = sessionDetails;

  return (
    <div className="min-h-screen bg-[#F5F6F4] text-[#171A21] px-6 py-10 space-y-12 font-sans">
      <div className="max-w-5xl mx-auto flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div>
          <h1 className="text-2xl md:text-3xl font-display font-medium text-[#171A21]">
            Session from {new Date(session.createdAt).toLocaleDateString()}
          </h1>
          <p className="text-[#6E6A62] mt-1 text-sm font-mono">
            {new Date(session.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
          </p>
        </div>
        <Link
          to="/dashboard"
          className="px-5 py-2.5 rounded-lg font-medium text-sm border border-[#E3E1DB] bg-white hover:border-[#1E5F53] transition-colors"
        >
          Back to dashboard
        </Link>
      </div>

      <div className="max-w-5xl mx-auto space-y-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          <div className="p-4 bg-white rounded-xl border border-[#E3E1DB]">
            <p className="text-[#6E6A62] text-xs uppercase tracking-wide">Job description</p>
            <h3 className="text-sm font-medium text-[#171A21] line-clamp-3 mt-1.5">{session.jobDescription}</h3>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E3E1DB]">
            <p className="text-[#6E6A62] text-xs uppercase tracking-wide">Interview type</p>
            <h3 className="text-base font-medium text-[#171A21] mt-1.5">{session.type}</h3>
          </div>
          <div className="p-4 bg-white rounded-xl border border-[#E3E1DB]">
            <p className="text-[#6E6A62] text-xs uppercase tracking-wide">Total questions</p>
            <h3 className="text-base font-mono font-medium text-[#171A21] mt-1.5">{session.numQuestions}</h3>
          </div>
        </div>

        <SessionAnalyticsPage analytics={analytics} />

        {responses && responses.length > 0 ? (
          <div>
            <h2 className="text-xl font-display font-medium mb-6 text-[#171A21]">
              Question responses
            </h2>

            <div className="flex flex-wrap gap-2 mb-6">
              {responses.map((_, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveTab(idx)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${activeTab === idx
                      ? "bg-[#171A21] text-white"
                      : "bg-white text-[#6E6A62] border border-[#E3E1DB] hover:border-[#1E5F53]"
                    }`}
                >
                  Q{idx + 1}
                </button>
              ))}
            </div>

            <div className="bg-white border border-[#E3E1DB] rounded-2xl p-6 md:p-8">
              <div className="flex justify-between items-center mb-8 pb-5 border-b border-[#E3E1DB]">
                <div className="flex items-center space-x-4">
                  <div className="w-11 h-11 bg-[#171A21] rounded-lg flex items-center justify-center text-white font-mono font-medium text-base">
                    {activeTab + 1}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-[#171A21]">Question {activeTab + 1}</h3>
                    <p className="text-sm text-[#6E6A62]">Interactive assessment</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="bg-[#F5F6F4] px-3 py-1 rounded-full text-xs text-[#6E6A62] mb-1 font-mono border border-[#E3E1DB]">
                    Attempt {responses[activeTab].attempt || 1}
                  </div>
                  <div className="text-xs text-[#9C988E] font-mono">
                    {new Date(responses[activeTab].createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-medium text-[#6E6A62] uppercase tracking-wide mb-3">Question</h4>
                <div className="bg-[#F5F6F4] p-6 rounded-xl border border-[#E3E1DB]">
                  <p className="text-base text-[#171A21] leading-relaxed font-display">{responses[activeTab].questionText}</p>
                </div>
              </div>

              <div className="mb-8">
                <h4 className="text-xs font-medium text-[#6E6A62] uppercase tracking-wide mb-3">Your answer</h4>
                <div className="bg-white p-6 rounded-xl border border-[#E3E1DB]">
                  <p className="text-[15px] text-[#171A21] leading-relaxed">
                    {responses[activeTab].userAnswer || "No transcript available"}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                <div className="p-5 rounded-xl border border-[#E3E1DB] bg-white">
                  <h5 className="text-xs font-medium text-[#6E6A62] uppercase tracking-wide mb-2.5">Summary</h5>
                  <p className="text-[#171A21] text-sm leading-relaxed">{responses[activeTab].evaluation?.summary || "N/A"}</p>
                </div>

                <div className="p-5 rounded-xl border border-[#E3E1DB] bg-white">
                  <h5 className="text-xs font-medium text-[#6E6A62] uppercase tracking-wide mb-2.5">Tone</h5>
                  <p className="text-[#171A21] text-sm leading-relaxed">{responses[activeTab].evaluation?.tone || "Neutral"}</p>
                </div>

                <div className="p-5 rounded-xl border border-[#DCEAE6] bg-[#DCEAE6]/40">
                  <h5 className="text-xs font-medium text-[#1E5F53] uppercase tracking-wide mb-2.5">Strengths</h5>
                  <p className="text-[#171A21] text-sm leading-relaxed">
                    {responses[activeTab].evaluation?.strengths?.length
                      ? responses[activeTab].evaluation.strengths.join(", ")
                      : "None identified"}
                  </p>
                </div>

                <div className="p-5 rounded-xl border border-[#F3E6D8] bg-[#F3E6D8]/40">
                  <h5 className="text-xs font-medium text-[#B8763F] uppercase tracking-wide mb-2.5">Improvement areas</h5>
                  <p className="text-[#171A21] text-sm leading-relaxed">{responses[activeTab].evaluation?.improvement || "N/A"}</p>
                </div>
              </div>

              <div className="mb-6">
                <div className="flex justify-between items-center mb-3">
                  <h5 className="text-xs font-medium text-[#6E6A62] uppercase tracking-wide">Ideal answer</h5>
                  <button
                    onClick={() => copyToClipboard(responses[activeTab].evaluation?.idealAnswer)}
                    className="text-xs text-[#6E6A62] hover:text-[#171A21] transition-colors bg-white hover:border-[#1E5F53] px-3 py-1.5 rounded-lg border border-[#E3E1DB]"
                  >
                    {copied ? "Copied ✓" : "Copy reference"}
                  </button>
                </div>
                <div className="bg-[#F5F6F4] p-6 rounded-xl border border-[#E3E1DB]">
                  <p className="text-[#171A21] text-sm leading-relaxed">
                    {responses[activeTab].evaluation?.idealAnswer || "N/A"}
                  </p>
                </div>
              </div>

              {responses[activeTab].emotions?.length > 0 && (
                <div className="flex items-center flex-wrap gap-2 text-sm pt-5 border-t border-[#E3E1DB]">
                  <span className="text-[#6E6A62] font-medium text-xs uppercase tracking-wide mr-1">
                    Vocal delivery:
                  </span>
                  {responses[activeTab].emotions.map((tag, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-[#F5F6F4] text-[#171A21] rounded-full text-xs border border-[#E3E1DB]"
                    >
                      {tag}
                    </span>
                  ))}
                  {responses[activeTab].vocalMetrics?.pace > 0 && (
                    <span className="text-[#9C988E] text-xs ml-1 font-mono">
                      {responses[activeTab].vocalMetrics.pace} wpm
                    </span>
                  )}
                </div>
              )}
            </div>
          </div>
        ) : (
          <div className="text-center py-12 text-[#6E6A62] text-sm">
            No question responses recorded for this session.
          </div>
        )}
      </div>
    </div>
  );
}