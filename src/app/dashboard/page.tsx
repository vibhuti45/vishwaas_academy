"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]); // New state for courses

  // 1. PROTECT THE ROUTE
  useEffect(() => {
    if (!loading && !user) {
      router.push("/login"); // Kick them out if not logged in
    }
  }, [user, loading, router]);

  // 2. FETCH USER DETAILS & COURSES
  // ... inside StudentDashboard component

  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        // A. Fetch User Profile to get 'enrolledCourseIds'
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const userData = docSnap.data();
          setStudentName(userData.name || user.displayName || "Student");
          setStudentGrade(userData.grade);

          // B. CHECK ENROLLMENT
          const enrolledIds = userData.enrolledCourseIds || []; // e.g. ["courseA", "courseB"]

          if (enrolledIds.length > 0) {
            // Fetch ONLY the courses present in that list
            // (Note: Firestore 'in' query supports max 10 items. For loops are safer for MVP)
            const myCourses: any[] = [];
            for (const courseId of enrolledIds) {
                const courseDoc = await getDoc(doc(db, "courses", courseId));
                if (courseDoc.exists()) {
                    myCourses.push({ id: courseDoc.id, ...courseDoc.data() });
                }
            }
            setEnrolledCourses(myCourses);
          } else {
            setEnrolledCourses([]); // No enrollments
          }
        }
      }
    };

    if (user) fetchData();
  }, [user]);

  
  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading Classroom...</div>;
  if (!user) return null; 

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
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-20">
            <span className="font-bold text-slate-900">Vishwaas Academy</span>
            <button onClick={logout} className="text-sm text-red-600 font-medium">Logout</button>
        </div>

        <div className="p-8">
            {/* Welcome Header */}
            <div className="mb-8">
                <h1 className="text-3xl font-bold text-slate-900">
                    Welcome back, {studentName.split(' ')[0]}! 👋
                </h1>
                <p className="text-slate-600 mt-1">You are studying in <span className="font-semibold text-blue-600">{studentGrade || "Class 10"}</span>.</p>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h3 className="text-slate-500 text-sm font-medium uppercase">Enrolled Courses</h3>
                    <p className="text-3xl font-bold text-slate-900 mt-2">{enrolledCourses.length}</p>
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
                
                {/* --- REAL FETCHED COURSES --- */}
                {enrolledCourses.length > 0 ? (
                    enrolledCourses.map((course) => (
                        <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer flex flex-col">
{/* Thumbnail Area */}
                            <div className="h-40 bg-slate-200 relative">
                                {course.thumbnail ? (
                                    <Image 
                                        // FIX: Safety check. If path is local (C:\...), use placeholder instead.
                                        src={course.thumbnail.startsWith("http") ? course.thumbnail : "https://placehold.co/600x400/png"} 
                                        alt={course.title} 
                                        fill 
                                        className="object-cover" 
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-300 text-4xl">📚</div>
                                )}
                                {/* Overlay Play Button */}
                                <Link href={`/classroom/${course.id}`} className="absolute inset-0 bg-black/10 group-hover:bg-black/20 transition flex items-center justify-center">
                                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center pl-1 shadow-lg transform group-hover:scale-110 transition">
                                        <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 24 24"><path d="M8 5v14l11-7z"/></svg>
                                    </div>
                                </Link>
                            </div>

                            <div className="p-6 flex flex-col flex-grow">
                                <div>
                                    <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded uppercase tracking-wider">{course.grade}</span>
                                    <h3 className="text-lg font-bold text-slate-900 mt-3 mb-2 line-clamp-1">{course.title}</h3>
                                    <p className="text-sm text-slate-500 line-clamp-2 mb-4">{course.description}</p>
                                </div>
                                
                                <div className="mt-auto">
                                    <Link href={`/classroom/${course.id}`}>
                                        <button className="w-full bg-slate-900 text-white text-sm font-semibold py-3 rounded-lg hover:bg-blue-600 transition">
                                            Continue Learning
                                        </button>
                                    </Link>
                                </div>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-full text-center py-10 text-slate-500">
                        No courses found. Wait for Admin to add one!
                    </div>
                )}

                {/* --- EXPLORE MORE CARD --- */}
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