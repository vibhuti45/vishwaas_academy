"use client";
import { useState } from "react";
import { signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // 1. CREDENTIAL LOGIN (For Admin-created accounts)
  const handleLogin = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // Check Role to Redirect Properly
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        
        if (userData.role === "admin") router.push("/admin/dashboard");
        else if (userData.role === "faculty") router.push("/faculty/dashboard");
        else router.push("/dashboard"); // Student
      } else {
        // Fallback if no doc exists yet
        router.push("/dashboard");
      }

    } catch (err: any) {
      console.error(err);
      setError("Invalid Email or Password.");
      setLoading(false);
    }
  };

  // 2. GOOGLE LOGIN (Optional Backup)
  const handleGoogleLogin = async () => {
    try {
      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      const userRef = doc(db, "users", user.uid);
      const userSnap = await getDoc(userRef);

      if (!userSnap.exists()) {
        await setDoc(userRef, {
          email: user.email,
          name: user.displayName,
          role: "student", // Default to student
          createdAt: new Date(),
        });
        router.push("/onboarding");
      } else {
        const data = userSnap.data();
        if (data.role === "admin") router.push("/admin/dashboard");
        else if (data.role === "faculty") router.push("/faculty/dashboard");
        else if (data.grade) router.push("/dashboard");
        else router.push("/onboarding");
      }
    } catch (err: any) {
      setError("Google Login Failed.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        
        <div className="text-center mb-8">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Login with your credentials</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center">{error}</p>}

        {/* EMAIL LOGIN FORM */}
        <form onSubmit={handleLogin} className="space-y-4">
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                <input 
                  type="email" required 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  value={email} onChange={(e) => setEmail(e.target.value)}
                />
            </div>
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input 
                  type="password" required 
                  className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" 
                  value={password} onChange={(e) => setPassword(e.target.value)}
                />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50">
                {loading ? "Logging in..." : "Login"}
            </button>
        </form>

        {/* <div className="relative my-6">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-slate-200"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-white text-slate-500">Back to Home</span></div>
        </div> */}

        <div className="mt-6 text-center">
            <Link href="/" className="text-sm text-slate-500 hover:text-blue-600 transition">
                &larr; Back to Home
            </Link>
        </div>

      </div>
    </div>
  );
}