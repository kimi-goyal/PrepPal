// import React, { useState, useEffect } from "react";
// import { axiosInstance } from "../utils/axios";
// import { useNavigate } from "react-router-dom";
// import {
//   Search,
//   Filter,
//   BarChart2,
//   Activity,
//   Settings,
//   TrendingUp,
//   Clock,
//   Target,
// } from "lucide-react";
// import DashboardAnalytics from "../pages/DashboardAnalytics";

// export default function DashboardPage() {
//   const [sessions, setSessions] = useState([]);
//   const [analytics, setAnalytics] = useState(null);
//   const [charts, setCharts] = useState(null);
//   const [search, setSearch] = useState("");
//   const [activeTab, setActiveTab] = useState("dashboard");

//   useEffect(() => {
//     const fetchDashboardData = async () => {
//       try {
//         const res = await axiosInstance.get(`/dashboard/dashboard`);
//         setSessions(res.data?.sessions || []);
//         setAnalytics(res.data?.analytics || {});
//         setCharts(res.data?.charts || {});
//       } catch (err) {
//         console.error("Error loading dashboard data", err);
//       }
//     };
//     fetchDashboardData();
//   }, []);

//   const navigate = useNavigate();
//   const startInterview = () => {
//     navigate("/start-interview");
//   }

//   const filtered = sessions.filter((s) =>
//     s.jobDescription?.toLowerCase().includes(search.toLowerCase())
//   );

//   return (
//     <div className="min-h-screen flex bg-gradient-to-br from-[#0B0F19] via-[#141625] to-[#0B0F19] text-white">
//       {/* Subtle animated glows */}
//       <div className="fixed inset-0 overflow-hidden pointer-events-none">
//         <div className="absolute -top-1/2 -left-1/2 w-2/3 h-2/3 bg-gradient-to-r from-[#5F27CD]/10 to-transparent rounded-full blur-3xl"></div>
//         <div className="absolute -bottom-1/2 -right-1/2 w-2/3 h-2/3 bg-gradient-to-l from-[#FF5DA2]/10 to-transparent rounded-full blur-3xl"></div>
//       </div>

//       {/* Sidebar (Compact) */}
//       <aside className="w-64 bg-[#141625]/90 backdrop-blur-xl p-6 flex flex-col justify-between border-r border-white/10 shadow-lg relative z-10">
//         <div>
//           <div className="flex items-center mb-8 gap-x-4">
//    <div className="w-12 h-12 bg-[#FF5DA2] rounded-2xl flex items-center justify-center shadow-lg transform rotate-45 animate-pulse ">
//                   <svg className="w-6 h-6 text-white transform -rotate-45" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//                   </svg>
//                 </div>         
//  <h1 className="text-3xl font-bold text-[#F4F4F5] mb-2 tracking-wide">
//               Prep<span className="text-[#FF5DA2]">Pal</span>
//             </h1>
//           </div>
            
          
//           <nav className="space-y-3 text-sm">
//             {[
//               { key: "dashboard", icon: Activity, label: "Overview" },
//               { key: "sessions", icon: BarChart2, label: "Sessions" },
//               { key: "analytics", icon: TrendingUp, label: "Analytics" },
//               { key: "settings", icon: Settings, label: "Settings" },
//             ].map((tab) => (
//               <button
//                 key={tab.key}
//                 onClick={() => setActiveTab(tab.key)}
//                 className={`flex items-center gap-3 w-full px-4 py-2.5 rounded-xl transition duration-300 ${
//                   activeTab === tab.key
//                     ? "bg-gradient-to-r from-[#5F27CD] to-[#00F2E2] text-white shadow-md"
//                     : "text-gray-400 hover:text-white hover:bg-white/5"
//                 }`}
//               >
//                 <tab.icon size={18} />
//                 {tab.label}
//               </button>
//             ))}
//           </nav>
//         </div>
//         <p className="text-center text-gray-500 text-xs">© 2025 PrepPal</p>
//       </aside>

//       {/* Main Content */}
//       <main className="flex-1 p-8 overflow-y-auto relative z-10">
//         {/* Dashboard */}
//         {activeTab === "dashboard" && (
//           <div className="space-y-8">
//             {/* Search Bar */}
//             <div className="flex justify-between items-center mb-8">
//               <div className="flex items-center bg-white/5 backdrop-blur-md px-4 py-2.5 rounded-xl w-full max-w-md border border-white/10">
//                 <Search className="mr-3 text-[#FF5DA2]" />
//                 <input
//                   className="bg-transparent outline-none flex-1 text-white placeholder-gray-400 text-sm"
//                   placeholder="Search sessions..."
//                   value={search}
//                   onChange={(e) => setSearch(e.target.value)}
//                 />
//               </div>
//               <button className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5F27CD] to-[#00F2E2] text-black text-sm font-semibold hover:opacity-80 shadow-md">
//                 <Filter size={16} /> Filter
//               </button>
//             </div>

//             {/* Quick Stats (Compact) */}
//             <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//               {[
//                 {
//                   title: "Total Sessions",
//                   value: sessions.length,
//                   icon: BarChart2,
//                   gradient: "from-[#5F27CD] to-[#00F2E2]",
//                 },
//                 {
//                   title: "Avg Confidence",
//                   value: `${Math.round(
//                     sessions.reduce((acc, s) => acc + (s.confidence || 0), 0) /
//                       (sessions.length || 1)
//                   )}%`,
//                   icon: TrendingUp,
//                   gradient: "from-[#00F2E2] to-[#5F27CD]",
//                 },
//                 {
//                   title: "Questions Answered",
//                   value: sessions.reduce(
//                     (acc, s) => acc + (s.questionsAnswered || 0),
//                     0
//                   ),
//                   icon: Target,
//                   gradient: "from-[#FF5DA2] to-[#5F27CD]",
//                 },
//               ].map((stat, idx) => (
//                 <div key={idx} className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-xl shadow-md hover:scale-105 transition">
//                   <div className="flex items-center justify-between mb-3">
//                     <div
//                       className={`w-10 h-10 bg-gradient-to-r ${stat.gradient} rounded-lg flex items-center justify-center`}
//                     >
//                       <stat.icon size={18} className="text-white" />
//                     </div>
//                     <div className="text-right">
//                       <h3 className="text-gray-400 text-xs">{stat.title}</h3>
//                       <p className={`text-2xl font-bold bg-gradient-to-r bg-clip-text text-transparent ${stat.gradient}`}>
//                         {stat.value}
//                       </p>
//                     </div>
//                   </div>
//                   <div className="w-full h-1.5 bg-white/10 rounded-full overflow-hidden">
//                     <div
//                       className={`h-full bg-gradient-to-r ${stat.gradient} rounded-full`}
//                       style={{
//                         width:
//                           stat.title === "Avg Confidence"
//                             ? stat.value
//                             : "100%",
//                       }}
//                     ></div>
//                   </div>
//                 </div>
//               ))}
//             </div>
//           </div>
//         )}

//         {/* Sessions Tab */}
//         {activeTab === "sessions" && (
//           <div className="space-y-6">
//             <div className="flex justify-between items-center mb-6">
//                <h2 className="text-3xl font-bold text-[#00F2E2]">Your Sessions</h2>
//              <button onClick={startInterview} className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-[#5F27CD] to-[#02d6c8] text-white text-md font-semibold hover:opacity-80 shadow-md">
//                    <Clock size={20} />
//                 Start New Session
            
//               </button>
//             </div>
           
//             <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
//               {filtered.map((session, idx) => {
//                 const sessionDate = new Date(session.createdAt);
//                 return (
//                   <div
//                     key={session._id}
//                     className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg hover:scale-105 transition shadow-md cursor-pointer"
//                     onClick={() => navigate(`/session/${session._id}`)}
//                   >
//                     <div className="flex justify-between items-center mb-3">
//                       <span className="text-sm text-gray-400">
//                         {sessionDate.toLocaleDateString()}{" "}
//                         {sessionDate.toLocaleTimeString([], {
//                           hour: "2-digit",
//                           minute: "2-digit",
//                         })}
//                       </span>
//                       <span className="text-[#FF5DA2] font-bold">
//                         {session.confidence || 0}% Confidence
//                       </span>
//                     </div>
//                     <h3 className="text-lg font-semibold text-white mb-2">
//                       Session {idx + 1}
//                     </h3>
//                     <p className="text-gray-400 text-sm line-clamp-2">
//                       {session.jobDescription}
//                     </p>
//                   </div>
//                 );
//               })}
//             </div>
//           </div>
//         )}

//         {/* Analytics Tab */}
//         {activeTab === "analytics" && (
//           <DashboardAnalytics analytics={analytics} charts={charts} />
//         )}

//         {/* Settings */}
//         {activeTab === "settings" && (
//           <div className="p-5 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-lg text-center shadow-md">
//             <h2 className="text-xl font-bold text-[#FF5DA2]">Settings</h2>
//             <p className="text-gray-400 text-sm">
//               Profile and preferences will be added soon.
//             </p>
//           </div>
//         )}
//       </main>
//     </div>
//   );
// }
import React, { useState, useEffect } from "react";
import { axiosInstance } from "../utils/axios";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  BarChart2,
  Activity,
  Settings,
  TrendingUp,
  Clock,
  Target,
  LogOut,
} from "lucide-react";
import DashboardAnalytics from "../pages/DashboardAnalytics";
import { useAuthStore } from "../store/authStore";

const WaveMark = () => {
  const heights = [8, 14, 20, 12, 17, 9];
  return (
    <div className="flex items-end gap-[3px] h-5">
      {heights.map((h, i) => (
        <span key={i} className="w-[2.5px] rounded-full bg-[#1E5F53]" style={{ height: h }} />
      ))}
    </div>
  );
};

export default function DashboardPage() {
  const [sessions, setSessions] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [charts, setCharts] = useState(null);
  const [search, setSearch] = useState("");
  const [activeTab, setActiveTab] = useState("dashboard");

  const navigate = useNavigate();
  const { logout } = useAuthStore();

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const res = await axiosInstance.get(`/dashboard/dashboard`);
        setSessions(res.data?.sessions || []);
        setAnalytics(res.data?.analytics || {});
        setCharts(res.data?.charts || {});
      } catch (err) {
        console.error("Error loading dashboard data", err);
      }
    };
    fetchDashboardData();
  }, []);

  const startInterview = () => {
    navigate("/start-interview");
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/login");
    } catch (err) {
      console.error("Error logging out", err);
    }
  };

  const filtered = sessions.filter((s) =>
    s.jobDescription?.toLowerCase().includes(search.toLowerCase())
  );

  const avgConfidence = Math.round(
    sessions.reduce((acc, s) => acc + (s.confidence || 0), 0) / (sessions.length || 1)
  );

  const navItems = [
    { key: "dashboard", icon: Activity, label: "Overview" },
    { key: "sessions", icon: BarChart2, label: "Sessions" },
    { key: "analytics", icon: TrendingUp, label: "Analytics" },
    { key: "settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="min-h-screen flex bg-[#F5F6F4] text-[#171A21] font-sans">
      {/* Sidebar */}
      <aside className="w-64 bg-[#171A21] p-6 flex flex-col justify-between shrink-0">
        <div>
          <div className="flex items-center gap-3 mb-10">
            <WaveMark />
            <h1 className="text-xl font-display font-medium text-white">
              Prep<span className="italic">Pal</span>
            </h1>
          </div>

          <nav className="space-y-1 text-sm">
            {navItems.map((tab) => (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                className={`flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg transition-colors ${
                  activeTab === tab.key
                    ? "bg-white/10 text-white"
                    : "text-[#9C988E] hover:text-white hover:bg-white/5"
                }`}
              >
                <tab.icon size={17} />
                {tab.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 w-full px-3.5 py-2.5 rounded-lg text-sm text-[#9C988E] hover:text-white hover:bg-white/5 transition-colors border-t border-white/10 pt-4"
          >
            <LogOut size={17} />
            Log out
          </button>
          <p className="text-[#6E6A62] text-xs px-3.5">© 2026 PrepPal</p>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {/* Dashboard */}
        {activeTab === "dashboard" && (
          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-display font-medium text-[#171A21]">Overview</h2>
              <p className="text-sm text-[#6E6A62] mt-1">Your practice, at a glance.</p>
            </div>

            {/* Search Bar */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex items-center bg-white px-3.5 py-2.5 rounded-lg w-full max-w-md border border-[#E3E1DB] focus-within:border-[#1E5F53] transition-colors">
                <Search size={16} className="mr-2.5 text-[#6E6A62]" />
                <input
                  className="bg-transparent outline-none flex-1 text-[#171A21] placeholder-[#9C988E] text-sm"
                  placeholder="Search sessions..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[#E3E1DB] bg-white text-sm font-medium text-[#171A21] hover:border-[#1E5F53] transition-colors">
                <Filter size={15} /> Filter
              </button>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                { title: "Total sessions", value: sessions.length, icon: BarChart2 },
                { title: "Avg confidence", value: `${avgConfidence}%`, icon: TrendingUp },
                {
                  title: "Questions answered",
                  value: sessions.reduce((acc, s) => acc + (s.questionsAnswered || 0), 0),
                  icon: Target,
                },
              ].map((stat, idx) => (
                <div key={idx} className="p-5 rounded-2xl bg-white border border-[#E3E1DB]">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 bg-[#DCEAE6] rounded-lg flex items-center justify-center">
                      <stat.icon size={16} className="text-[#1E5F53]" />
                    </div>
                    <p className="text-[#6E6A62] text-xs uppercase tracking-wide">{stat.title}</p>
                  </div>
                  <p className="text-3xl font-mono font-medium text-[#171A21]">{stat.value}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Sessions Tab */}
        {activeTab === "sessions" && (
          <div className="space-y-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-display font-medium text-[#171A21]">Your sessions</h2>
                <p className="text-sm text-[#6E6A62] mt-1">{sessions.length} recorded so far</p>
              </div>
              <button
                onClick={startInterview}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-[#171A21] text-white text-sm font-medium hover:bg-[#1E5F53] transition-colors"
              >
                <Clock size={16} />
                Start new session
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
              {filtered.map((session, idx) => {
                const sessionDate = new Date(session.createdAt);
                return (
                  <div
                    key={session._id}
                    className="p-5 rounded-2xl bg-white border border-[#E3E1DB] hover:border-[#1E5F53] transition-colors cursor-pointer"
                    onClick={() => navigate(`/session/${session._id}`)}
                  >
                    <div className="flex justify-between items-center mb-3">
                      <span className="text-xs font-mono text-[#6E6A62]">
                        {sessionDate.toLocaleDateString()}{" "}
                        {sessionDate.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="text-[#1E5F53] font-mono text-sm font-medium">
                        {session.confidence || 0}%
                      </span>
                    </div>
                    <h3 className="text-base font-medium text-[#171A21] mb-1.5">
                      Session {idx + 1}
                    </h3>
                    <p className="text-[#6E6A62] text-sm line-clamp-2">
                      {session.jobDescription}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Analytics Tab */}
        {activeTab === "analytics" && (
          <div className="space-y-2">
            <h2 className="text-2xl font-display font-medium text-[#171A21] mb-6">Analytics</h2>
            <DashboardAnalytics analytics={analytics} charts={charts} />
          </div>
        )}

        {/* Settings */}
        {activeTab === "settings" && (
          <div className="p-8 rounded-2xl bg-white border border-[#E3E1DB] text-center">
            <h2 className="text-lg font-display font-medium text-[#171A21]">Settings</h2>
            <p className="text-[#6E6A62] text-sm mt-1">
              Profile and preferences will be added soon.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}