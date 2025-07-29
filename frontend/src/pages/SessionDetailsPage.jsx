import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "axios";
import { Card, CardContent } from "@/components/ui/card";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { axiosInstance } from "../utils/axios";

export default function SessionDetailsPage() {
  const { sessionId } = useParams();
  const [data, setData] = useState(null);

  useEffect(() => {
    axiosInstance.get(`/${sessionId}/details`)
      .then((res) => setData(res.data))
      .catch((err) => console.error("Failed to fetch session details:", err));
  }, [sessionId]);

  if (!data) return <div className="text-white text-center p-10">Loading...</div>;

  const { session, responses, analytics } = data;

  return (
    <div className="p-6 bg-[#2F4454] min-h-screen text-white">
      <Link to="/dashboard" className="text-[#DA7B93] hover:underline mb-4 block">← Back to Dashboard</Link>
      
      {/* Session Summary */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold">{session.jobDescription}</h1>
        <p className="text-gray-300">
          {new Date(session.createdAt).toLocaleString()} — {session.numQuestions} Questions
        </p>
        <p className="mt-2 font-semibold text-[#DA7B93]">
          Average Confidence: {analytics.avgConfidence}%
        </p>
        <p className="text-sm italic mt-1">{analytics.tips}</p>
      </div>

      {/* Question Responses */}
      <div className="space-y-6">
        {responses.map((r, idx) => (
          <Card key={r.id} className="bg-[#1C3334] rounded-2xl shadow-md p-4">
            <CardContent>
              <h2 className="text-lg font-bold mb-2">Q{idx + 1}: {r.questionText}</h2>
              <video src={r.videoUrl} controls className="w-full rounded-md mb-3" />
              <p className="text-gray-300 mb-2">Transcript: {r.transcript || "N/A"}</p>
              <div className="text-sm">
                <p><span className="font-semibold">Summary:</span> {r.evaluation?.summary || "N/A"}</p>
                <p><span className="font-semibold">Strengths:</span> {r.evaluation?.strengths?.join(", ") || "N/A"}</p>
                <p><span className="font-semibold">Improvements:</span> {r.evaluation?.improvement || "N/A"}</p>
                <p><span className="font-semibold">Tone:</span> {r.evaluation?.tone || "Neutral"}</p>
                <p className="mt-2"><span className="font-semibold">Ideal Answer:</span> {r.evaluation?.idealAnswer || "N/A"}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Analytics Section */}
      <div className="mt-10">
        <h2 className="text-xl font-bold mb-4">Session Analytics</h2>
        <div className="grid md:grid-cols-2 gap-6">
          {/* Confidence Line Chart */}
          <Card className="bg-[#1C3334] rounded-2xl shadow-md p-4">
            <CardContent>
              <h3 className="mb-3 font-semibold">Confidence Trend</h3>
              <ResponsiveContainer width="100%" height={200}>
                <LineChart data={analytics.questionAnalytics}>
                  <XAxis dataKey="question" stroke="#DA7B93" />
                  <YAxis stroke="#DA7B93" />
                  <Tooltip />
                  <Line type="monotone" dataKey="confidence" stroke="#376E6F" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Strengths vs Weaknesses */}
          <Card className="bg-[#1C3334] rounded-2xl shadow-md p-4">
            <CardContent>
              <h3 className="mb-3 font-semibold">Strengths vs Weaknesses</h3>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.strengthsWeaknesses}>
                  <XAxis dataKey="name" stroke="#DA7B93" />
                  <YAxis stroke="#DA7B93" />
                  <Tooltip />
                  <Bar dataKey="value" fill="#DA7B93" radius={[10, 10, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
