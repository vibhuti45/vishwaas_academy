"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  // 1. PROTECT THE ROUTE (Admins Only!)
  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push("/login");
      } else if (user.role !== "admin") {
        // If a student tries to sneak in here...
        alert("Access Denied: You are not an Admin!");
        router.push("/dashboard"); // Send them back to student dashboard
      }
    }
  }, [user, loading, router]);

  if (loading || user?.role !== "admin") return <div className="min-h-screen flex items-center justify-center text-red-600 font-bold">Verifying Admin Access...</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex text-white">
      
      {/* --- ADMIN SIDEBAR --- */}
      <aside className="w-64 border-r border-slate-800 flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
           <Image src="/logo.svg" alt="Logo" width={32} height={32} className="invert" /> {/* Invert makes logo white if it's black */}
           <span className="font-bold tracking-tight text-white">Admin Panel</span>
        </div>
        
        <nav className="flex-grow p-4 space-y-2">
            <div className="px-4 py-3 bg-blue-600 rounded-lg font-medium cursor-pointer">
                📊 Dashboard Overview
            </div>
            <div className="px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg font-medium cursor-pointer transition">
                👥 Manage Students
            </div>
            <div className="px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg font-medium cursor-pointer transition">
                🎥 Manage Courses
            </div>
            <div className="px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg font-medium cursor-pointer transition">
                👨‍🏫 Manage Faculty
            </div>
        </nav>

        <div className="p-4 border-t border-slate-800">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 w-full rounded-lg font-medium transition">
                🚪 Logout
            </button>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow ml-64 p-10 bg-slate-950 min-h-screen">
        
        <h1 className="text-3xl font-bold mb-8">Admin Control Center</h1>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-slate-400 text-sm font-medium uppercase">Total Students</h3>
                <p className="text-4xl font-bold text-white mt-2">1</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-slate-400 text-sm font-medium uppercase">Total Courses</h3>
                <p className="text-4xl font-bold text-blue-400 mt-2">0</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-slate-400 text-sm font-medium uppercase">Faculty Members</h3>
                <p className="text-4xl font-bold text-purple-400 mt-2">0</p>
            </div>
        </div>

        {/* Action Area */}
        <div className="bg-slate-900 rounded-xl border border-slate-800 p-8">
            <h2 className="text-xl font-bold mb-6">Quick Actions</h2>
            <div className="flex gap-4">
                <button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition">
                    + Create New Course
                </button>
                <button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition">
                    + Add Faculty
                </button>
            </div>
        </div>

      </main>
    </div>
  );
}