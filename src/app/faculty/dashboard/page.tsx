"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc } from "firebase/firestore"; // Import database tools
import { db } from "@/lib/firebase";
import Image from "next/image";

export default function FacultyDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  
  // State to hold the specific teacher's details
  const [facultyData, setFacultyData] = useState({
    name: "Faculty Member",
    department: "General",
  });
  const [dataLoading, setDataLoading] = useState(true);

  // 1. Protect Route
  useEffect(() => {
    if (!loading && (!user || user.role !== "faculty")) {
      router.push("/faculty/login");
    }
  }, [user, loading, router]);

  // 2. Fetch Faculty Details
  useEffect(() => {
    const fetchFacultyDetails = async () => {
      if (user?.uid) {
        try {
          const docRef = doc(db, "users", user.uid);
          const docSnap = await getDoc(docRef);
          
          if (docSnap.exists()) {
            setFacultyData({
              name: docSnap.data().name || "Faculty Member",
              department: docSnap.data().department || "General Stream"
            });
          }
        } catch (error) {
          console.error("Error fetching faculty data:", error);
        } finally {
          setDataLoading(false);
        }
      }
    };

    fetchFacultyDetails();
  }, [user]);

  if (loading || dataLoading) return <div className="p-10 text-blue-600 font-bold">Loading Profile...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
           <Image src="/logo.svg" alt="Logo" width={32} height={32} />
           <span className="font-bold text-slate-900">Faculty Panel</span>
        </div>
        
        {/* PERSONALIZED PROFILE CARD IN SIDEBAR */}
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl mb-3">
                👨‍🏫
            </div>
            <h3 className="font-bold text-slate-900 text-sm">{facultyData.name}</h3>
            <p className="text-xs text-slate-500 uppercase tracking-wider font-semibold">{facultyData.department}</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
            <div className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer">
                My Classes
            </div>
            <div className="px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium cursor-pointer">
                Student Doubts
            </div>
        </nav>
        <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="text-red-600 font-medium hover:bg-red-50 w-full text-left px-4 py-2 rounded-lg">Logout</button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 p-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">Welcome back, {facultyData.name.split(" ")[0]}! 👋</h1>
        <p className="text-slate-500 mb-8">Department of <span className="font-semibold text-blue-600">{facultyData.department}</span></p>

        {/* Placeholder Content */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 text-center py-20">
            <span className="text-4xl">📚</span>
            <h3 className="text-xl font-bold text-slate-900 mt-4">Your Course List</h3>
            <p className="text-slate-500 mt-2 max-w-md mx-auto">
                Courses assigned to <strong>{facultyData.department}</strong> will appear here automatically once the Admin assigns them.
            </p>
        </div>
      </main>
    </div>
  );
}