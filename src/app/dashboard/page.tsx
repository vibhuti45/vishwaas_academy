"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");

  // 1. PROTECT THE ROUTE
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Kick them out if not logged in
    }
  }, [user, loading, router]);

  // 2. FETCH EXTRA DETAILS (Name, Grade)
  useEffect(() => {
    if (user?.uid) {
      const fetchUserData = async () => {
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setStudentName(docSnap.data().name);
          setStudentGrade(docSnap.data().grade);
        }
      };
      fetchUserData();
    }
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Classroom...</div>;
  if (!user) return null; // Don't show anything while redirecting

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* --- SIDEBAR --- */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
           <Image src="/logo.svg" alt="Logo" width={32} height={32} />
           <span className="font-bold text-slate-900 tracking-tight">Vishwaas</span>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
            <Link href="/dashboard" className="flex items-center gap-3 px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium">
                <span>📚</span> My Classroom
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition">
                <span>📝</span> Assignments
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition">
                <span>🏆</span> Test Results
            </Link>
            <Link href="#" className="flex items-center gap-3 px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium transition">
                <span>⚙️</span> Settings
            </Link>
        </nav>

        <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-lg font-medium transition">
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-grow md:ml-64 min-h-screen">
        
        {/* Mobile Header (Only visible on phone) */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-20">
            <span className="font-bold text-slate-900">Vishwaas Academy</span>
            <button onClick={logout} className="text-sm text-red-600 font-medium">Logout</button>
        </div>

        <div className="p-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">Welcome back, {studentName}! 👋</h1>
                <p className="text-slate-600 mt-1">You are studying in <span className="font-semibold text-blue-600">{studentGrade}</span>.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Enrolled Courses</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">1</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Classes Watched</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Pending Tests</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">0</p>
                </div>
            </div>

            {/* Course List */}
            <h2 className="text-xl font-bold text-slate-900 mb-6">Your Courses</h2>
            
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                
                {/* --- DEMO COURSE CARD --- */}
                {/* Later we will map through real enrolled courses here */}
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer">
                    <div className="h-40 bg-blue-600 relative flex items-center justify-center">
                        <span className="text-4xl">📐</span>
                        {/* Overlay Play Button */}
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition flex items-center justify-center">
                            <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg">
                                <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                            </div>
                        </div>
                    </div>
                    <div className="p-6">
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{studentGrade}</span>
                        <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2">Foundation Mathematics</h3>
                        <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                            <div className="bg-green-500 w-[10%] h-full"></div>
                        </div>
                        <p className="text-xs text-slate-500 mt-2">10% Completed</p>
                        
                        <button className="w-full mt-6 bg-slate-900 text-white text-sm font-semibold py-3 rounded-lg hover:bg-blue-600 transition">
                            Continue Learning
                        </button>
                    </div>
                </div>

                {/* --- EMPTY STATE CARD (If they want to buy more) --- */}
                <Link href="/courses" className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 hover:border-blue-400 hover:text-blue-500 transition min-h-[300px]">
                    <span className="text-4xl mb-4">+</span>
                    <span className="font-medium">Explore More Courses</span>
                </Link>

            </div>

        </div>
      </main>
    </div>
  );
}