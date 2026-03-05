"use client";

import { useState } from "react";
import { supabase } from "@/lib/supabase";

export default function LoginPage({ onAuth }: { onAuth: () => void }) {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [isSignUp, setIsSignUp] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [successMsg, setSuccessMsg] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setSuccessMsg("");

        try {
            if (isSignUp) {
                const { error } = await supabase.auth.signUp({ email, password });
                if (error) throw error;
                setSuccessMsg("Check your email for the confirmation link!");
            } else {
                const { error } = await supabase.auth.signInWithPassword({
                    email,
                    password,
                });
                if (error) throw error;
                onAuth();
            }
        } catch (err: any) {
            setError(err.message || "Authentication failed");
        } finally {
            setLoading(false);
        }
    };

    const handleGoogleSignIn = async () => {
        setLoading(true);
        setError("");
        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: { redirectTo: window.location.origin },
        });
        if (error) setError(error.message);
        setLoading(false);
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-vexis-bg)] relative overflow-hidden">
            {/* Ambient orbs */}
            <div className="orb orb-gold" />
            <div className="orb orb-cyan" />

            <div className="relative z-10 w-full max-w-md px-6">
                {/* Logo */}
                <div className="text-center mb-10 reveal reveal-1">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[var(--color-vexis-accent)] to-[#c49a3a] flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[var(--color-vexis-accent)]/20">
                        <span className="text-[var(--color-vexis-bg)] font-bold text-2xl font-display">V</span>
                    </div>
                    <h1 className="font-display font-extrabold text-3xl text-white tracking-tight">
                        VEXIS
                    </h1>
                    <p className="text-sm text-[var(--color-vexis-text-muted)] mt-1">
                        AI Automation Command Center
                    </p>
                </div>

                {/* Auth card */}
                <div className="glass rounded-3xl p-8 glow-gold reveal reveal-2">
                    <h2 className="font-display font-bold text-xl text-white mb-6 text-center">
                        {isSignUp ? "Create Account" : "Welcome Back"}
                    </h2>

                    {/* Google login */}
                    <button
                        onClick={handleGoogleSignIn}
                        disabled={loading}
                        className="w-full flex items-center justify-center gap-3 px-4 py-3.5 rounded-xl bg-white text-[#1a1a2e] font-semibold text-sm hover:bg-gray-100 transition-all mb-5 disabled:opacity-50"
                    >
                        <svg width="18" height="18" viewBox="0 0 18 18">
                            <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" />
                            <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" />
                            <path fill="#FBBC05" d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.997 8.997 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" />
                            <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 7.29C4.672 5.163 6.656 3.58 9 3.58z" />
                        </svg>
                        Continue with Google
                    </button>

                    <div className="flex items-center gap-3 mb-5">
                        <div className="flex-1 h-px bg-[var(--color-vexis-border)]" />
                        <span className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-widest">or</span>
                        <div className="flex-1 h-px bg-[var(--color-vexis-border)]" />
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-1.5 block">Email</label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="you@example.com"
                                required
                                className="input-obsidian w-full px-4 py-3 rounded-xl text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] text-[var(--color-vexis-text-muted)] uppercase tracking-wider mb-1.5 block">Password</label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="••••••••"
                                required
                                minLength={6}
                                className="input-obsidian w-full px-4 py-3 rounded-xl text-sm"
                            />
                        </div>

                        {error && (
                            <p className="text-sm text-[var(--color-vexis-red)] bg-[var(--color-vexis-red)]/10 px-4 py-2 rounded-lg">
                                {error}
                            </p>
                        )}
                        {successMsg && (
                            <p className="text-sm text-[var(--color-vexis-green)] bg-[var(--color-vexis-green)]/10 px-4 py-2 rounded-lg">
                                {successMsg}
                            </p>
                        )}

                        <button
                            type="submit"
                            disabled={loading}
                            className="btn-gold w-full py-3.5 rounded-xl text-sm font-display font-bold disabled:opacity-50"
                        >
                            {loading ? "Processing..." : isSignUp ? "Create Account" : "Sign In"}
                        </button>
                    </form>

                    <p className="text-center text-sm text-[var(--color-vexis-text-muted)] mt-5">
                        {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
                        <button
                            onClick={() => { setIsSignUp(!isSignUp); setError(""); setSuccessMsg(""); }}
                            className="text-[var(--color-vexis-accent)] hover:underline font-medium"
                        >
                            {isSignUp ? "Sign in" : "Create one"}
                        </button>
                    </p>
                </div>

                <p className="text-center text-[9px] text-[var(--color-vexis-text-muted)] mt-6 tracking-wider uppercase">
                    Secured by Supabase · Powered by Groq
                </p>
            </div>
        </div>
    );
}
