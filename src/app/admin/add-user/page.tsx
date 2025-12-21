"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword } from "firebase/auth"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

// 1. We need your Firebase Config here explicitly to create a Secondary App
// (Copy this from your firebase.ts file or .env)
const firebaseConfig = {
    apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

export default function AddUser() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "", // You set the initial password
    role: "student", // or 'faculty'
    grade: "Class 10", // Only for students
    department: "Science", // Only for faculty
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let secondaryApp;
    try {
        // A. INITIALIZE SECONDARY APP (To avoid logging out Admin)
        // We check if a secondary app named "secondary" already exists, otherwise create it
        if (getApps().length > 1) {
             secondaryApp = getApps().find(app => app.name === "secondary");
             if(!secondaryApp) secondaryApp = initializeApp(firebaseConfig, "secondary");
        } else {
             secondaryApp = initializeApp(firebaseConfig, "secondary");
        }
        
        const secondaryAuth = getAuth(secondaryApp);

        // B. CREATE USER in Authentication
        const userCredential = await createUserWithEmailAndPassword(secondaryAuth, formData.email, formData.password);
        const newUser = userCredential.user;

        // C. CREATE DOCUMENT in Firestore (Using the MAIN db instance)
        await setDoc(doc(db, "users", newUser.uid), {
            name: formData.name,
            email: formData.email,
            role: formData.role,
            // Add extra fields based on role
            ...(formData.role === 'student' && { grade: formData.grade, enrolledCourseIds: [] }),
            ...(formData.role === 'faculty' && { department: formData.department }),
            createdAt: new Date(),
            createdByAdmin: true
        });

        alert(`✅ Account Created!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nShare these credentials with the user.`);
        
        // Reset Form
        setFormData({ ...formData, name: "", email: "", password: "" });

    } catch (error: any) {
        console.error("Error creating user:", error);
        alert("Failed: " + error.message);
    } finally {
        setLoading(false);
        // Note: We don't delete the secondary app here to keep it cached, 
        // but normally you might clean it up.
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-2xl w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">👤 Register New User</h1>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white text-sm">Cancel</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Role Selection */}
            <div className="grid grid-cols-2 gap-4 bg-slate-900 p-2 rounded-lg">
                <button type="button" 
                    onClick={() => setFormData({...formData, role: 'student'})}
                    className={`py-2 rounded-md font-bold transition ${formData.role === 'student' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    Student
                </button>
                <button type="button" 
                    onClick={() => setFormData({...formData, role: 'faculty'})}
                    className={`py-2 rounded-md font-bold transition ${formData.role === 'faculty' ? 'bg-purple-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}
                >
                    Faculty
                </button>
            </div>

            {/* Common Fields */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                    <input type="text" required 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input type="email" required 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
            </div>

            {/* Password */}
            <div>
                <label className="block text-sm text-slate-400 mb-1">Set Password</label>
                <input type="text" required minLength={6}
                    placeholder="Create a strong password..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none font-mono"
                    value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                />
            </div>

            {/* Conditional Fields based on Role */}
            {formData.role === 'student' ? (
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Assign Class/Grade</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 outline-none"
                        value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11 (Science)</option>
                        <option>Class 12 (Science)</option>
                    </select>
                </div>
            ) : (
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Department</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 outline-none"
                        value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                        <option>Science</option>
                        <option>Mathematics</option>
                        <option>English</option>
                        <option>Social Studies</option>
                    </select>
                </div>
            )}

            <button type="submit" disabled={loading} className="w-full bg-green-600 hover:bg-green-500 py-3 rounded-lg font-bold disabled:opacity-50">
                {loading ? "Creating Account..." : "Create User & Save"}
            </button>

        </form>
      </div>
    </div>
  );
}