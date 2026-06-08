"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (res.ok) {
      window.location.href = "/students";
    } else {
      toast.error("Incorrect password");
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: "#eeedfe" }}>
      <div className="bg-white rounded-xl shadow-lg p-8 w-full max-w-sm" style={{ border: "1px solid #afa9ec" }}>
        <div className="text-center mb-6">
          <h1 className="text-2xl font-extrabold mb-1" style={{ color: "#26215c", fontFamily: "var(--font-nunito), sans-serif" }}>
            Canley Vale HS
          </h1>
          <p className="text-sm font-semibold" style={{ color: "#534ab7" }}>Careers Hub — Staff Access</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Staff Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoFocus
              className="w-full border rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2"
              style={{ borderColor: "#afa9ec" }}
              placeholder="Enter password…"
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 text-sm font-bold text-white rounded-md disabled:opacity-60"
            style={{ backgroundColor: "#3d2c8d" }}
          >
            {loading ? "Signing in…" : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
