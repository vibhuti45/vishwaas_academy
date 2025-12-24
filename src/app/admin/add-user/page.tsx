"use client";
import { useState } from "react";
import { db } from "@/lib/firebase";
import { doc, setDoc } from "firebase/firestore";
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "firebase/auth"; 
import { useRouter } from "next/navigation";
import Link from "next/link";

// 1. Firebase Config (Explicitly needed for Secondary App)
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
  
  // 2. Updated State with Phone and Address
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",       // <--- NEW
    address: "",     // <--- NEW
    role: "student",
    grade: "Class 10",
    department: "Math",
  });

  // 3. Updated Dropdown Lists
  const gradeOptions = [
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11 (JEE)", "Class 11 (NEET)",
    "Class 12 (JEE)", "Class 12 (NEET)"
  ];

  const departmentOptions = [
    "Math", "Science", "Social Science", "English",
    "Physics", "Chemistry", "Biology"
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    let secondaryApp;
    try {
        // A. INITIALIZE SECONDARY APP
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
        
        // (Optional) Update the Auth Profile Name immediately
        await updateProfile(newUser, { displayName: formData.name });

        // C. CREATE DOCUMENT in Firestore (Adding Phone & Address)
        await setDoc(doc(db, "users", newUser.uid), {
            uid: newUser.uid,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,      // <--- Saved
            address: formData.address,  // <--- Saved
            role: formData.role,
            
            // Add extra fields based on role
            ...(formData.role === 'student' && { grade: formData.grade, enrolledCourseIds: [] }),
            ...(formData.role === 'faculty' && { department: formData.department }),
            
            createdAt: new Date(),
            createdByAdmin: true
        });

        alert(`✅ Account Created!\n\nEmail: ${formData.email}\nPassword: ${formData.password}\n\nShare these credentials with the user.`);
        
        // Reset Form
        setFormData({ 
            name: "", email: "", password: "", phone: "", address: "", 
            role: "student", grade: "Class 10", department: "Math" 
        });

    } catch (error: any) {
        console.error("Error creating user:", error);
        alert("Failed: " + error.message);
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-3xl w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        
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

            {/* Row 1: Name & Phone */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Full Name</label>
                    <input type="text" required 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none"
                        value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Phone Number</label>
                    <input type="tel" required 
                        placeholder="e.g. 98765 43210"
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none"
                        value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})}
                    />
                </div>
            </div>

            {/* Row 2: Email & Password */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Email</label>
                    <input type="email" required 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none"
                        value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})}
                    />
                </div>
                <div>
                    <label className="block text-sm text-slate-400 mb-1">Set Password</label>
                    <input type="text" required minLength={6}
                        placeholder="Create a strong password..."
                        className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none font-mono"
                        value={formData.password} onChange={e => setFormData({...formData, password: e.target.value})}
                    />
                </div>
            </div>

            {/* Row 3: Address (Full Width) */}
            <div>
                <label className="block text-sm text-slate-400 mb-1">Residential Address</label>
                <textarea required rows={2}
                    placeholder="Flat No, Street, City, State..."
                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 focus:border-blue-500 outline-none resize-none"
                    value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})}
                />
            </div>

            {/* Conditional Fields based on Role with UPDATED DROPDOWNS */}
            {formData.role === 'student' ? (
                <div>
                    <label className="block text-sm text-blue-400 mb-1 font-bold">Assign Class/Grade</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 outline-none"
                        value={formData.grade} onChange={e => setFormData({...formData, grade: e.target.value})}
                    >
                        {gradeOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            ) : (
                <div>
                    <label className="block text-sm text-purple-400 mb-1 font-bold">Department</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded p-3 outline-none"
                        value={formData.department} onChange={e => setFormData({...formData, department: e.target.value})}
                    >
                        {departmentOptions.map(opt => (
                            <option key={opt} value={opt}>{opt}</option>
                        ))}
                    </select>
                </div>
            )}

            <button type="submit" disabled={loading} className={`w-full py-4 rounded-lg font-bold shadow-lg mt-4 disabled:opacity-50 transition ${formData.role === 'student' ? 'bg-blue-600 hover:bg-blue-500' : 'bg-purple-600 hover:bg-purple-500'}`}>
                {loading ? "Creating Account..." : `Create ${formData.role === 'student' ? 'Student' : 'Faculty'} Account`}
            </button>

        </form>
      </div>
    </div>
  );
}