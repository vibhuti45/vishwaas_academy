"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, signOut } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function FacultyLogin() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleFacultyLogin = async (e: any) => {
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

      if (docSnap.exists() && docSnap.data().role === "faculty") {
        // Success! It's a verified teacher
        router.push("/faculty/dashboard");
      } else {
        // Login worked, BUT they are not a teacher
        await signOut(auth); 
        setError("Access Denied: You are not registered as Faculty.");
      }

    } catch (err: any) {
      console.error(err);
      setError("Invalid Faculty Credentials.");
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-200">
        
        <div className="text-center mb-8">
            <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-3xl">👨‍🏫</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900">Faculty Portal</h1>
            <p className="text-slate-500 text-sm">Please log in to manage your classes</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleFacultyLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Faculty Email</label>
                <input 
                  type="email" 
                  required 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  placeholder="teacher@vishwaas.com"
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
                  placeholder="••••••••"
                />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50 mt-4">
                {loading ? "Verifying..." : "Login to Dashboard"}
            </button>
        </form>

        <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition">
                &larr; Back to Home
            </Link>
        </div>

      </div>
    </div>
  );
}