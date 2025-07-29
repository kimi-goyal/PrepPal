import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  LineChart, Line, XAxis, YAxis, CartesianGrid, Legend
} from "recharts";

// Neon colors (consistent with Dashboard & SessionDetailedPage)
const COLORS = ["#FF5DA2", "#5F27CD", "#00F2E2", "#7C4DFF", "#2EF5D3"];

export default function SessionAnalyticsPage({ analytics }) {
  if (!analytics) return null;

  // Tone distribution pie chart data
  const toneData = Object.keys(analytics.toneDistribution || {}).map((tone, idx) => ({
    name: tone,
    value: analytics.toneDistribution[tone],
    color: COLORS[idx % COLORS.length],
  }));

  // Confidence trend per question (for line chart)
  const confidenceTrend = (analytics.questionAnalytics || []).map((q, idx) => ({
    name: `Q${idx + 1}`,
    confidence: q.confidence || 0,
  }));

  // Stats cards (dynamic values only)
  const stats = [
    { title: "Average Confidence", value: analytics.avgConfidence ? `${analytics.avgConfidence}%` : "N/A" },
    { title: "Avg Words per Answer", value: analytics.avgWordCount || "N/A" },
    { title: "Estimated Duration", value: analytics.totalDurationEstimate ? `${analytics.totalDurationEstimate}s` : "N/A" }
  ];

  return (
    <div className="space-y-8">
      {/* Dynamic Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat, idx) => (
          <div
            key={idx}
            className="bg-gradient-to-br from-[#141625] to-[#1E1E2F] border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md hover:shadow-[#5F27CD]/50 transition-shadow text-center"
          >
            <p className="text-gray-400 text-lg">{stat.title}</p>
            <h3 className="text-4xl font-bold mt-3 text-[#FF5DA2]">{stat.value}</h3>
          </div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Tone Distribution Pie Chart */}
        {toneData.length > 0 && (
          <div className="bg-gradient-to-br from-[#141625] to-[#1E1E2F] border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
            <h4 className="text-lg font-bold mb-4 text-[#00F2E2]">Tone Distribution</h4>
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
                    <Cell key={`cell-${idx}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E2F",
                    border: "1px solid #5F27CD",
                    color: "#fff",
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Confidence per Question Line Chart */}
        {confidenceTrend.length > 0 && (
          <div className="bg-gradient-to-br from-[#141625] to-[#1E1E2F] border border-white/10 backdrop-blur-lg p-6 rounded-2xl shadow-md">
            <h4 className="text-lg font-bold mb-4 text-[#00F2E2]">Confidence per Question</h4>
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={confidenceTrend}>
                <CartesianGrid strokeDasharray="3 3" stroke="#333" />
                <XAxis dataKey="name" stroke="#aaa" />
                <YAxis domain={[0, 100]} stroke="#aaa" />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#1E1E2F",
                    border: "1px solid #5F27CD",
                    color: "#fff",
                  }}
                />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="confidence"
                  stroke="#FF5DA2"
                  strokeWidth={3}
                  dot={{ r: 5 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* AI Tips (if present) */}
      {analytics.tips && (
        <div className="bg-gradient-to-br from-[#0E0F1A] to-[#1B1F3B] border border-white/10 backdrop-blur-lg p-4 rounded-2xl shadow-md text-center">
          <p className="text-gray-300 italic text-lg">{analytics.tips}</p>
        </div>
      )}
    </div>
  );
}
