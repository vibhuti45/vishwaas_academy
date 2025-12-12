"use client";
import { useState } from "react";
import { createUserWithEmailAndPassword, sendEmailVerification, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function Signup() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    grade: "Class 9", // Default selection
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (e: any) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSignup = async (e: any) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      // 1. Create User in Firebase Auth
      const userCredential = await createUserWithEmailAndPassword(auth, formData.email, formData.password);
      const user = userCredential.user;

      // 2. Send Verification Email
      await sendEmailVerification(user);

      // 3. Save Extra Details (Phone, Class) to Database
      await setDoc(doc(db, "users", user.uid), {
        uid: user.uid,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        grade: formData.grade,
        role: "student",
        createdAt: new Date(),
        isVerified: false // Will update this later
      });

      // 4. Update Display Name in Auth Profile
      await updateProfile(user, { displayName: formData.name });

      // 5. Success! Redirect to Login page with a message
      alert("Account created! We have sent a verification link to your email.\n\nNOTE: Please check your SPAM or PROMOTIONS folder if you don't see it in your Inbox.");
      router.push("/login");

    } catch (err: any) {
      console.error(err);
      if (err.code === "auth/email-already-in-use") {
        setError("This email is already registered.");
      } else if (err.code === "auth/weak-password") {
        setError("Password should be at least 6 characters.");
      } else {
        setError("Failed to create account. Try again.");
      }
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 px-4 py-12">
      <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-lg border border-slate-100">
        
        <div className="text-center mb-8">
            <Image src="/logo.svg" alt="Logo" width={40} height={40} className="mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-slate-900">Create Student Account</h1>
            <p className="text-slate-500 text-sm">Join Vishwaas Academy today</p>
        </div>

        {error && <p className="bg-red-50 text-red-600 p-3 rounded text-sm mb-4 text-center">{error}</p>}

        <form onSubmit={handleSignup} className="space-y-4">
            
            {/* Full Name */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                <input name="name" type="text" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="Aditya Kumar" />
            </div>

            {/* Phone & Class Row */}
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                    <input name="phone" type="tel" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="9876543210" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Class/Grade</label>
                    <select name="grade" onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none">
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11 (Science)</option>
                        <option>Class 12 (Science)</option>
                        <option>Olympiad Prep</option>
                    </select>
                </div>
            </div>

            {/* Email */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                <input name="email" type="email" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="student@example.com" />
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
                <input name="password" type="password" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="******" />
            </div>

            {/* Confirm Password */}
            <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
                <input name="confirmPassword" type="password" required onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-600 outline-none" placeholder="******" />
            </div>

            <button disabled={loading} type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/30 disabled:opacity-50">
                {loading ? "Creating Account..." : "Sign Up"}
            </button>
        </form>

        <p className="mt-6 text-center text-sm text-slate-600">
            Already have an account? <Link href="/login" className="text-blue-600 font-bold hover:underline">Log in</Link>
        </p>

      </div>
    </div>
  );
}