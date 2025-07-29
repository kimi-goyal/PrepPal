import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid, XAxis, YAxis, Legend,
  LineChart, Line
} from "recharts";
import { TrendingUp, Users, Award, AlertTriangle } from "lucide-react";

const COLORS = ["#EC4899", "#06B6D4", "#8B5CF6", "#10B981", "#F59E0B"];

export default function DashboardAnalytics({ analytics, charts }) {
  if (!analytics) return null;

  const toneData = Object.keys(analytics.toneDistribution || {}).map((tone, idx) => ({
    name: tone,
    value: analytics.toneDistribution[tone],
    color: COLORS[idx % COLORS.length],
  }));

  // --- Performance Calculations ---
  const confidenceTrend = charts?.confidenceTrend || [];
  const recent = confidenceTrend.slice(-5);
  const confidenceChange = recent.length >= 2
    ? recent[recent.length - 1].confidence - recent[0].confidence
    : 0;

  const maxSessionsTarget = 20; // can be adjusted or fetched dynamically
  const sessionsProgress = Math.min(
    (analytics.totalSessions / maxSessionsTarget) * 100,
    100
  );

  const strengthsCount = analytics.strengths || 0;
  const weaknessesCount = analytics.weaknesses || 0;
  const nervousTone = toneData.find(t => t.name.toLowerCase() === "nervous")?.value || 0;

  // --- Dynamic Insights ---
  const insights = [];
  if (confidenceChange > 5) {
    insights.push({
      title: "Confidence Trend",
      message: `Confidence increased by ${confidenceChange.toFixed(1)}% over the last 5 sessions.`,
      type: "positive"
    });
  } else if (confidenceChange < -5) {
    insights.push({
      title: "Confidence Trend",
      message: `Confidence decreased by ${Math.abs(confidenceChange).toFixed(1)}% over the last 5 sessions.`,
      type: "negative"
    });
  } else {
    insights.push({
      title: "Confidence Trend",
      message: "Confidence remained relatively stable over the last 5 sessions.",
      type: "neutral"
    });
  }

  if (strengthsCount >= weaknessesCount) {
    insights.push({
      title: "Performance Balance",
      message: `Strength areas (${strengthsCount}) are greater or equal to weaknesses (${weaknessesCount}).`,
      type: "neutral"
    });
  } else {
    insights.push({
      title: "Performance Balance",
      message: `Weakness areas (${weaknessesCount}) exceed strengths (${strengthsCount}).`,
      type: "warning"
    });
  }

  // --- Dynamic Recommendations ---
  const recommendations = [];
  if (analytics.avgConfidence < 50) {
    recommendations.push({
      title: "Confidence Focus",
      message: "Average confidence is below 50%. Additional practice sessions recommended."
    });
  }
  if (weaknessesCount > strengthsCount) {
    recommendations.push({
      title: "Skill Development",
      message: `Weaknesses (${weaknessesCount}) exceed strengths (${strengthsCount}). Focused practice advised.`
    });
  }
  if (nervousTone > 30) {
    recommendations.push({
      title: "Tone Adjustment",
      message: `Nervous tone detected in ${nervousTone}% of responses. Slower pacing and pauses recommended.`
    });
  }

  // --- Stats Config for Progress Bars ---
  const statConfig = [
    { 
      title: "Total Sessions", 
      value: analytics.totalSessions,
      barWidth: sessionsProgress,
      icon: Users,
      gradient: "from-pink-500 to-rose-400",
      bgGradient: "from-pink-500/10 to-rose-400/10",
      borderColor: "border-pink-500/20"
    },
    { 
      title: "Avg Confidence", 
      value: `${analytics.avgConfidence}%`,
      barWidth: analytics.avgConfidence,
      icon: TrendingUp,
      gradient: "from-cyan-500 to-blue-400",
      bgGradient: "from-cyan-500/10 to-blue-400/10",
      borderColor: "border-cyan-500/20"
    },
    { 
      title: "Strength Points", 
      value: strengthsCount,
      barWidth: strengthsCount ? 100 : 0,
      icon: Award,
      gradient: "from-green-500 to-emerald-400",
      bgGradient: "from-green-500/10 to-emerald-400/10",
      borderColor: "border-green-500/20"
    },
    { 
      title: "Improvement Areas", 
      value: weaknessesCount,
      barWidth: weaknessesCount ? 100 : 0,
      icon: AlertTriangle,
      gradient: "from-orange-500 to-red-400",
      bgGradient: "from-orange-500/10 to-red-400/10",
      borderColor: "border-orange-500/20"
    }
  ];

  return (
    <div className="space-y-12">
      {/* Dynamic Summary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statConfig.map((item, idx) => (
          <div key={idx} className="group relative">
            <div className={`absolute -inset-1 bg-gradient-to-r ${item.gradient} rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500`}></div>
            <div className={`relative bg-gradient-to-br ${item.bgGradient} backdrop-blur-xl p-6 rounded-2xl border ${item.borderColor} shadow-lg hover:scale-105 transition-all duration-300`}>
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 bg-gradient-to-r ${item.gradient} rounded-xl flex items-center justify-center shadow-lg`}>
                  <item.icon size={22} className="text-white" />
                </div>
                <div className="text-right">
                  <p className="text-gray-400 text-xs font-medium uppercase tracking-wider">{item.title}</p>
                  <h3 className={`text-3xl font-bold mt-1 bg-gradient-to-r ${item.gradient} bg-clip-text text-transparent`}>
                    {item.value}
                  </h3>
                </div>
              </div>
              <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
                <div
                  className={`h-full bg-gradient-to-r ${item.gradient} rounded-full transition-all duration-700`}
                  style={{ width: `${item.barWidth}%` }}
                ></div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Charts (kept same) */}
      {/* Confidence Trend, Tone Distribution, Strength vs Weakness — unchanged */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Confidence Trend */}
        <div className="lg:col-span-2 group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-400/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-cyan-400 rounded-2xl flex items-center justify-center">
                <TrendingUp size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-pink-500 to-cyan-400 bg-clip-text text-transparent">
                  Confidence Trend
                </h4>
                <p className="text-gray-400 text-sm">Performance across all sessions</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-6 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={charts.confidenceTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    domain={[0, 100]} 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1F2937", 
                      border: "1px solid #374151", 
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                    }} 
                  />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="confidence" 
                    stroke="url(#confidenceGradient)" 
                    strokeWidth={4} 
                    dot={{ r: 6, stroke: "#EC4899", strokeWidth: 2, fill: "#fff" }}
                    activeDot={{ r: 8, stroke: "#06B6D4", strokeWidth: 2, fill: "#fff" }}
                  />
                  <defs>
                    <linearGradient id="confidenceGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#EC4899" />
                      <stop offset="100%" stopColor="#06B6D4" />
                    </linearGradient>
                  </defs>
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>  <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/20 via-pink-500/20 to-orange-500/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-lg h-full">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-lg">🎭</span>
              </div>
              <div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent">
                  Tone Analysis
                </h4>
                <p className="text-gray-400 text-sm">Communication style breakdown</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-6 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height={350}>
                <PieChart>
                  <Pie
                    data={toneData}
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={60}
                    dataKey="value"
                    startAngle={90}
                    endAngle={450}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                    labelLine={false}
                  >
                    {toneData.map((entry, idx) => (
                      <Cell 
                        key={`cell-${idx}`} 
                        fill={entry.color}
                        stroke="#1F2937"
                        strokeWidth={2}
                      />
                    ))}
                  </Pie>
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1F2937", 
                      border: "1px solid #374151", 
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                    }} 
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Strength vs Weakness */}
        <div className="lg:col-span-3 group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-green-500/20 via-blue-500/20 to-purple-500/20 rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-8 rounded-3xl border border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-8">
              <div className="w-10 h-10 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center">
                <Award size={20} className="text-white" />
              </div>
              <div>
                <h4 className="text-2xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
                  Performance Analysis
                </h4>
                <p className="text-gray-400 text-sm">Strengths vs areas for improvement</p>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-slate-700/30 to-slate-800/30 p-6 rounded-2xl border border-white/10">
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={charts.strengthsWeaknesses} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="name" 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="#9CA3AF" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: "#1F2937", 
                      border: "1px solid #374151", 
                      borderRadius: "12px",
                      color: "#fff",
                      boxShadow: "0 10px 25px rgba(0,0,0,0.3)"
                    }} 
                  />
                  <Bar 
                    dataKey="value" 
                    fill="url(#barGradient)"
                    radius={[8, 8, 0, 0]}
                    stroke="#374151"
                    strokeWidth={1}
                  />
                  <defs>
                    <linearGradient id="barGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#10B981" />
                      <stop offset="100%" stopColor="#059669" />
                    </linearGradient>
                  </defs>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>


      {/* Dynamic Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-blue-500/20 to-purple-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
         
           <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-purple-500 rounded-2xl flex items-center justify-center">
                <span className="text-lg">💡</span>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-blue-500 to-purple-500 bg-clip-text text-transparent">
                Performance Insights
              </h4>
            </div>
            <div className="space-y-3">
              {insights.map((i, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-xl border border-blue-500/20 text-gray-300 text-sm">
                  <p className="font-semibold text-blue-400">{i.title}</p>
                  <p>{i.message}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Dynamic Recommendations */}
        <div className="group relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-orange-500/20 to-pink-500/20 rounded-2xl blur opacity-25 group-hover:opacity-40 transition duration-500"></div>
          <div className="relative bg-gradient-to-br from-slate-800/90 to-slate-900/90 backdrop-blur-xl p-6 rounded-2xl border border-white/10 shadow-lg">
            <div className="flex items-center space-x-3 mb-6">
              <div className="w-10 h-10 bg-gradient-to-r from-orange-500 to-pink-500 rounded-2xl flex items-center justify-center">
                <span className="text-lg">🎯</span>
              </div>
              <h4 className="text-xl font-bold bg-gradient-to-r from-orange-500 to-pink-500 bg-clip-text text-transparent">
                Recommendations
              </h4>
            </div>

            <div className="space-y-3">
              {recommendations.length ? recommendations.map((r, idx) => (
                <div key={idx} className="p-3 bg-gradient-to-r from-orange-500/10 to-pink-500/10 rounded-xl border border-orange-500/20 text-gray-300 text-sm">
                  <p className="font-semibold text-orange-400">{r.title}</p>
                  <p>{r.message}</p>
                </div>
              )) : (
                <p className="text-gray-400 text-sm">No specific recommendations at this time.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
