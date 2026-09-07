"use client";

import { useState, useEffect, useCallback } from "react";

export default function Home() {
  const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://real-sahakar.onrender.com";
  const [loading, setLoading] = useState(true);
  const [healthData, setHealthData] = useState(null);
  const [error, setError] = useState(null);
  const [latency, setLatency] = useState(null);
  const [lastChecked, setLastChecked] = useState(null);

  const checkConnectivity = useCallback(async () => {
    setLoading(true);
    setError(null);
    const startTime = performance.now();

    try {
      // Remove trailing slash if any
      const normalizedBaseUrl = apiUrl.replace(/\/+$/, "");
      const res = await fetch(`${normalizedBaseUrl}/health`, {
        cache: "no-store",
      });

      const endTime = performance.now();
      setLatency(Math.round(endTime - startTime));

      if (!res.ok) {
        throw new Error(`Server returned HTTP ${res.status}: ${res.statusText}`);
      }

      const data = await res.json();
      setHealthData(data);
      setLastChecked(new Date().toLocaleTimeString());
    } catch (err) {
      setError(err.message || "Failed to reach backend server");
      setHealthData(null);
      setLastChecked(new Date().toLocaleTimeString());
    } finally {
      setLoading(false);
    }
  }, [apiUrl]);

  useEffect(() => {
    checkConnectivity();
  }, [checkConnectivity]);

  const isHealthy = healthData?.status === "ok";
  const isDbConnected = healthData?.database?.status === "connected" || healthData?.database?.stateCode === 1;

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      {/* Header / Nav */}
      <header className="border-b border-slate-800 bg-slate-900/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center font-bold text-slate-950 text-lg shadow-lg shadow-emerald-500/20">
              🤝
            </div>
            <div>
              <h1 className="font-bold text-lg text-white leading-tight">SahakarConnect</h1>
              <p className="text-xs text-emerald-400 font-medium tracking-wide">Cooperative Gig Platform</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
              Phase 1: Foundations
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 text-blue-400 border border-blue-500/30">
              Person 2 Track (Frontend)
            </span>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-10 w-full space-y-8 flex-1">
        {/* Banner Section */}
        <div className="bg-gradient-to-r from-emerald-950/40 via-slate-900 to-slate-900 border border-emerald-900/50 rounded-2xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-10 -top-10 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium bg-emerald-950 border border-emerald-800 text-emerald-300 mb-4">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Full-Stack Verification
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
              Backend Connectivity & Health Dashboard
            </h2>
            <p className="text-slate-400 mt-2 max-w-2xl text-sm sm:text-base">
              Testing live communication between Person 2 Frontend and Person 1 Backend running on Render, connected with MongoDB Atlas.
            </p>
          </div>
        </div>

        {/* Live Status Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Card 1: API Server Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Backend Service</span>
              <span className="text-lg">🌐</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  loading
                    ? "bg-amber-400 animate-ping"
                    : isHealthy
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                    : "bg-rose-500 shadow-lg shadow-rose-500/50"
                }`}
              />
              <span className="text-lg font-bold text-white">
                {loading ? "Checking..." : isHealthy ? "Online & Healthy" : "Offline / Unreachable"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2 truncate" title={apiUrl}>
              {apiUrl}
            </p>
          </div>

          {/* Card 2: MongoDB Status */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MongoDB Atlas</span>
              <span className="text-lg">🍃</span>
            </div>
            <div className="flex items-center gap-3">
              <div
                className={`w-3.5 h-3.5 rounded-full ${
                  loading
                    ? "bg-amber-400 animate-ping"
                    : isDbConnected
                    ? "bg-emerald-500 shadow-lg shadow-emerald-500/50"
                    : "bg-rose-500 shadow-lg shadow-rose-500/50"
                }`}
              />
              <span className="text-lg font-bold text-white">
                {loading
                  ? "Checking..."
                  : isDbConnected
                  ? "Connected"
                  : healthData?.database?.status || "Disconnected"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              ReadyState: {healthData?.database?.stateCode ?? (loading ? "..." : "0 (No Connection)")}
            </p>
          </div>

          {/* Card 3: Ping / Latency */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-lg relative overflow-hidden">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Latency</span>
              <span className="text-lg">⚡</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black text-emerald-400">
                {loading ? "--" : latency !== null ? `${latency} ms` : "N/A"}
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-2">
              Last checked: {lastChecked || "Initial load"}
            </p>
          </div>
        </div>

        {/* Detailed Health Diagnostic Panel */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <span>Diagnostic Telemetry & API Response</span>
              </h3>
              <p className="text-xs text-slate-400 mt-0.5">
                Target Endpoint: <code className="text-emerald-400 font-mono">{apiUrl}/health</code>
              </p>
            </div>
            <button
              onClick={checkConnectivity}
              disabled={loading}
              className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 disabled:opacity-50 text-white text-sm font-semibold rounded-lg shadow-md shadow-emerald-950 transition cursor-pointer"
            >
              <svg
                className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                />
              </svg>
              {loading ? "Testing Connection..." : "Retest Connectivity"}
            </button>
          </div>

          {error && (
            <div className="p-4 rounded-xl bg-rose-950/50 border border-rose-800/80 text-rose-300 text-sm flex items-start gap-3">
              <span className="text-lg">⚠️</span>
              <div>
                <strong className="block font-semibold">Connection Error:</strong>
                <span>{error}</span>
              </div>
            </div>
          )}

          {/* JSON Payload Display */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono">Payload from /health:</span>
              <span className="text-slate-500">JSON Format</span>
            </div>
            <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs sm:text-sm text-emerald-300 overflow-x-auto">
              {loading && !healthData
                ? "// Fetching telemetry from live backend..."
                : JSON.stringify(healthData || { error: error || "No response received" }, null, 2)}
            </pre>
          </div>
        </div>

        {/* Roadmap Next Steps Guide */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2">
          {/* Milestone 1 Checklist */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
              <span className="text-emerald-400">✅</span> Phase 1 Deliverables (Person 2)
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Scaffold Next.js client with Tailwind CSS
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Configure <code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">NEXT_PUBLIC_API_URL</code> to Render Backend
              </li>
              <li className="flex items-center gap-2">
                <span className="text-emerald-400">✓</span> Real-time connectivity test page with live health indicators
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-400">⚡</span> Ready for deployment to Vercel (Free Tier)
              </li>
            </ul>
          </div>

          {/* Up Next: Phase 2 */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5">
            <div className="flex items-center gap-2 text-sm font-bold text-white mb-3">
              <span className="text-blue-400">🚀</span> Up Next: Phase 2 (Core Booking & Admin)
            </div>
            <ul className="text-xs text-slate-300 space-y-2.5">
              <li className="flex items-center gap-2">
                <span className="text-slate-500">○</span> Firebase Client Authentication (Phone OTP + Email Admin)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500">○</span> Customer Booking Flow (<code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">/book/[serviceId]</code>)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500">○</span> Customer Bookings list (<code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">/my-bookings</code>)
              </li>
              <li className="flex items-center gap-2">
                <span className="text-slate-500">○</span> Admin Live Dashboard (<code className="text-slate-400 bg-slate-800 px-1 py-0.5 rounded">/admin</code>)
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        SahakarConnect — Empowering Gig Workers with Transparent Cooperative Tech
      </footer>
    </main>
  );
}
