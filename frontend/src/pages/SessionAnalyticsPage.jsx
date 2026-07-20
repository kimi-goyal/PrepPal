// import React from "react";
// import {
//   PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
//   LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
// } from "recharts";

// // Neon colors (consistent with Dashboard & SessionDetailedPage)
// const COLORS = ["#FF5DA2", "#5F27CD", "#00F2E2", "#7C4DFF", "#2EF5D3"];

// export default function SessionAnalyticsPage({ analytics }) {
//   if (!analytics) return null;

//   // Tone distribution pie chart data
//   const toneData = Object.keys(analytics.toneDistribution || {}).map((tone, idx) => ({
//     name: tone,
//     value: analytics.toneDistribution[tone],
//     color: COLORS[idx % COLORS.length],
//   }));

//   // Confidence trend per question (for line chart)
//   const confidenceTrend = (analytics.questionAnalytics || []).map((q, idx) => ({
//     name: `Q${idx + 1}`,
//     confidence: q.confidence || 0,
//   }));

//   // Stats cards (dynamic values only)
//   const stats = [
//     { title: "Average Confidence", value: analytics.avgConfidence ? `${analytics.avgConfidence}%` : "N/A" },
//     { title: "Avg Words per Answer", value: analytics.avgWordCount || "N/A" },
//     { title: "Estimated Duration", value: analytics.totalDurationEstimate ? `${analytics.totalDurationEstimate}s` : "N/A" }
//   ];

//   return (
//     <div className="space-y-8">
//       {/* Dynamic Stats Cards */}
//       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
//         {stats.map((stat, idx) => (
//           <div
//             key={idx}
//             className="bg-gradient-to-br from-[#141625] to-[#1E1E2F] border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-[#5F27CD]/50 transition-shadow text-center"
//           >
//             <p className="text-gray-400 text-lg">{stat.title}</p>
//             <h3 className="text-4xl font-bold mt-3 text-[#FF5DA2]">{stat.value}</h3>
//           </div>
//         ))}
//       </div>

//       {/* Charts */}
//       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//         {/* Tone Distribution Pie Chart */}
//         {toneData.length > 0 && (
//           <div className="bg-gradient-to-br from-[#141625] to-[#1E1E2F] border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
//             <h4 className="text-lg font-bold mb-4 text-[#00F2E2]">Tone Distribution</h4>
//             <ResponsiveContainer width="100%" height={250}>
//               <PieChart>
//                 <Pie
//                   data={toneData}
//                   cx="50%"
//                   cy="50%"
//                   outerRadius={90}
//                   dataKey="value"
//                   label={({ name, value }) => `${name}: ${value}`}
//                 >
//                   {toneData.map((entry, idx) => (
//                     <Cell key={`cell-${idx}`} fill={entry.color} />
//                   ))}
//                 </Pie>
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#1E1E2F",
//                     border: "1px solid #5F27CD",
//                     color: "#fff",
//                   }}
//                 />
//               </PieChart>
//             </ResponsiveContainer>
//           </div>
//         )}

//         {/* Confidence per Question Line Chart */}
//         {confidenceTrend.length > 0 && (
//           <div className="bg-gradient-to-br from-[#141625] to-[#1E1E2F] border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
//             <h4 className="text-lg font-bold mb-4 text-[#00F2E2]">Confidence per Question</h4>
//             <ResponsiveContainer width="100%" height={250}>
//               <LineChart data={confidenceTrend}>
//                 <CartesianGrid strokeDasharray="3 3" stroke="#333" />
//                 <XAxis dataKey="name" stroke="#aaa" />
//                 <YAxis domain={[0, 100]} stroke="#aaa" />
//                 <Tooltip
//                   contentStyle={{
//                     backgroundColor: "#1E1E2F",
//                     border: "1px solid #5F27CD",
//                     color: "#fff",
//                   }}
//                 />
//                 <Legend />
//                 <Line
//                   type="monotone"
//                   dataKey="confidence"
//                   stroke="#FF5DA2"
//                   strokeWidth={3}
//                   dot={{ r: 5 }}
//                 />
//               </LineChart>
//             </ResponsiveContainer>
//           </div>
//         )}
//       </div>

//       {/* AI Tips (if present) */}
//       {analytics.tips && (
//         <div className="bg-gradient-to-br from-[#0E0F1A] to-[#1B1F3B] border border-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-md text-center">
//           <p className="text-gray-300 italic text-lg">{analytics.tips}</p>
//         </div>
//       )}
//     </div>
//   );
// }
import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

const COLORS = ["#1E5F53", "#B8763F", "#5B7A99", "#8A9A5B", "#9C988E"];

const tooltipStyle = {
  backgroundColor: "#171A21",
  border: "1px solid #2A2E36",
  borderRadius: "8px",
  color: "#fff",
  fontSize: "13px",
};

export default function SessionAnalyticsPage({ analytics }) {
  if (!analytics) return null;

  const toneData = Object.keys(analytics.toneDistribution || {}).map((tone, idx) => ({
    name: tone,
    value: analytics.toneDistribution[tone],
    color: COLORS[idx % COLORS.length],
  }));

  const confidenceTrend = (analytics.questionAnalytics || []).map((q, idx) => ({
    name: `Q${idx + 1}`,
    confidence: q.confidence || 0,
  }));

  const stats = [
    { title: "Average confidence", value: analytics.avgConfidence ? `${analytics.avgConfidence}%` : "N/A" },
    { title: "Avg words per answer", value: analytics.avgWordCount || "N/A" },
    { title: "Estimated duration", value: analytics.totalDurationEstimate ? `${analytics.totalDurationEstimate}s` : "N/A" }
  ];

  return (
    <div className="space-y-8 font-sans">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-white border border-[#E3E1DB] p-6 rounded-2xl text-center"
          >
            <p className="text-[#6E6A62] text-xs uppercase tracking-wide">{stat.title}</p>
            <h3 className="text-3xl font-mono font-medium mt-2 text-[#171A21]">{stat.value}</h3>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        {toneData.length > 0 && (
          <div className="bg-white border border-[#E3E1DB] p-6 rounded-2xl">
            <h4 className="text-base font-display font-medium mb-4 text-[#171A21]">Tone distribution</h4>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={toneData}
                  cx="50%"
                  cy="50%"
                  outerRadius={90}
                  dataKey="value"
                  label={({ name, value }) => `${name}: ${value}`}
                >
                  {toneData.map((entry, idx) => (
                    <Cell key={`cell-${idx}`} fill={entry.color} stroke="#fff" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip contentStyle={tooltipStyle} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {confidenceTrend.length > 0 && (
          <div className="bg-white border border-[#E3E1DB] p-6 rounded-2xl">
            <h4 className="text-base font-display font-medium mb-4 text-[#171A21]">Confidence per question</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={confidenceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E3E1DB" vertical={false} />
                <XAxis dataKey="name" stroke="#9C988E" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[0, 100]} stroke="#9C988E" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={tooltipStyle} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#1E5F53"
                  strokeWidth={2.5}
                  dot={{ r: 4, stroke: "#1E5F53", strokeWidth: 2, fill: "#fff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {analytics.tips && (
        <div className="bg-[#DCEAE6]/50 border border-[#DCEAE6] p-5 rounded-2xl text-center">
          <p className="text-[#171A21] italic font-display text-base">{analytics.tips}</p>
        </div>
      )}
    </div>
  );
}