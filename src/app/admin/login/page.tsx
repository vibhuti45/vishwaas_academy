"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleAdminLogin = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      // 1. Try to Login
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Check Database Role
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists() && docSnap.data().role === "admin") {
        // Success! It's a real admin
        router.push("/admin/dashboard");
      } else {
        // Login worked, BUT they are just a student/stranger
        await signOut(auth); // Kick them out immediately
        setError("Access Denied: You do not have Admin permissions.");
      }

    } catch (err: any) {
      console.error(err);
      setError("Invalid Admin Credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-900 px-4">
      <div className="max-w-md w-full bg-slate-800 p-8 rounded-2xl shadow-2xl border border-slate-700">
        
        <div className="text-center mb-8">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} className="mx-auto mb-4 invert" />
            <h1 className="text-2xl font-bold text-white">Admin Portal</h1>
            <p className="text-slate-400 text-sm">Restricted Access Only</p>
        </div>

        {error && <p className="bg-red-900/50 border border-red-800 text-red-200 p-3 rounded text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleAdminLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Admin Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="admin@vishwaas.com"
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-300 mb-1">Password</label>
                <input 
                  type="password" 
                  required 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-white focus:ring-2 focus:ring-blue-500 outline-none" 
                  placeholder="••••••••"
                />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-500 transition disabled:opacity-50 mt-4">
                {loading ? "Verifying..." : "Access Dashboard"}
            </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-slate-300 transition">
                &larr; Return to Website
            </Link>
        </div>

      </div>
    </div>
  );
}