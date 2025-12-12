"use client";
import { useState } from "react";
import { signInWithEmailAndPassword } from "firebase/auth"; // Changed import
import { auth } from "@/lib/firebase";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleLogin = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      if (!user.emailVerified) {
        setError("Please verify your email address before logging in. Check your inbox.");
        // Optional: You can sign them out immediately if you want to be strict
        // await signOut(auth); 
        setLoading(false);
        return;
      }

      // If verified, go to dashboard
      router.push("/dashboard");

    } catch (err: any) {
      console.error(err);
      setError("Invalid email or password.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        
        <div className="text-center mb-8">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Login to your dashboard</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                />
            </div>

            <div className="text-right">
                <Link href="#" className="text-xs text-blue-600 hover:underline">Forgot Password?</Link>
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50">
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
            Don't have an account? <Link href="/signup" className="text-blue-600 font-bold hover:underline">Sign Up</Link>
        </p>

      </div>
    </div>
  );
}