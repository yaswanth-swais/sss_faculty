"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/auth/LoginForm";

const features = [
  { icon: "🧠", title: "AI-Assisted Notes", desc: "Voice dictation, handwriting recognition, and smart content organization." },
  { icon: "📊", title: "Smart Analytics", desc: "Real-time student performance insights powered by intelligent data." },
  { icon: "🎙️", title: "Voice-to-Parent", desc: "Auto-convert your notes into voice updates for parents via AWS Polly." },
];

function LoginPageContent() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.push("/dashboard");
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center" style={{ background: "#0F172A" }}>
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-2xl ai-gradient flex items-center justify-center text-white font-bold text-xl pulse-glow">S</div>
          <div className="w-6 h-6 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
        </div>
      </div>
    );
  }

  if (isAuthenticated) return null;

  return (
    <div className="flex-1 flex min-h-screen">
      <div className="hidden lg:flex lg:w-[58%] flex-col justify-between p-12 relative overflow-hidden" style={{ background: "#0F172A" }}>
        <div className="absolute inset-0 animate-gradient" style={{ background: "linear-gradient(135deg, #0F172A 0%, #1E1B4B 30%, #0F172A 60%, #0C1A2E 100%)", backgroundSize: "300% 300%" }} />
        <div className="absolute top-20 left-20 w-64 h-64 rounded-full animate-float" style={{ background: "radial-gradient(circle, rgba(99,102,241,0.18) 0%, transparent 70%)" }} />
        <div className="absolute bottom-32 right-10 w-80 h-80 rounded-full animate-float-slow" style={{ background: "radial-gradient(circle, rgba(139,92,246,0.14) 0%, transparent 70%)" }} />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full animate-float-fast" style={{ background: "radial-gradient(circle, rgba(6,182,212,0.08) 0%, transparent 70%)" }} />
        <div className="absolute inset-0 dot-grid opacity-40" />
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-16">
            <div className="w-11 h-11 rounded-xl ai-gradient flex items-center justify-center text-white font-bold text-xl shadow-lg pulse-glow">S</div>
            <div>
              <p className="text-lg font-bold ai-gradient-text tracking-tight">SWAIS</p>
              <p className="text-[11px]" style={{ color: "#475569" }}>Saraswathi Intelligence</p>
            </div>
          </div>
          <h1 className="text-4xl xl:text-5xl font-bold leading-tight mb-5" style={{ color: "#F8FAFC" }}>
            Bringing <span className="ai-gradient-text">AI</span> into<br />every classroom.
          </h1>
          <p className="text-base leading-relaxed mb-12" style={{ color: "#64748B", maxWidth: "440px" }}>
            Empower teachers with intelligent tools — from AI-assisted note-taking to real-time student analytics delivered directly to parents.
          </p>
          <div className="space-y-4">
            {features.map((f) => (
              <div key={f.title} className="flex items-start gap-4 p-4 rounded-2xl" style={{ background: "rgba(255,255,255,0.04)", border: "1px solid rgba(255,255,255,0.06)" }}>
                <span className="text-xl mt-0.5">{f.icon}</span>
                <div>
                  <p className="text-sm font-semibold mb-0.5" style={{ color: "#E2E8F0" }}>{f.title}</p>
                  <p className="text-xs leading-relaxed" style={{ color: "#64748B" }}>{f.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="relative z-10">
          <p className="text-xs italic" style={{ color: "#334155" }}>"Education is the passport to the future — AI is the vehicle."</p>
          <p className="text-[10px] mt-1" style={{ color: "#1E293B" }}>— SWAIS International Academy</p>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-6 sm:p-10 relative" style={{ background: "#F8FAFC" }}>
        <div className="absolute top-6 left-6 flex items-center gap-2 lg:hidden">
          <div className="w-8 h-8 rounded-xl ai-gradient flex items-center justify-center text-white font-bold text-sm">S</div>
          <span className="text-sm font-bold ai-gradient-text">SWAIS</span>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <LoginPageContent />
    </AuthProvider>
  );
}
