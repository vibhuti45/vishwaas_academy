"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, getDocs, query, orderBy, where, limit } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

export default function StudentDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  
  // Profile & Data State
  const [studentName, setStudentName] = useState("");
  const [studentGrade, setStudentGrade] = useState("");
  const [enrolledCourses, setEnrolledCourses] = useState<any[]>([]);
  const [quizResults, setQuizResults] = useState<any[]>([]);
  
  // Announcements State
  const [announcements, setAnnouncements] = useState<any[]>([]);

  // UI State: Added "announcements" to the tab types
  const [activeTab, setActiveTab] = useState<"classroom" | "results" | "announcements">("classroom");

  // 1. PROTECT ROUTE
  useEffect(() => {
    if (!loading && !user) router.push("/login");
  }, [user, loading, router]);

  // 2. FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        // A. Fetch User Profile
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        
        let enrolledIds: string[] = [];

        if (docSnap.exists()) {
          const userData = docSnap.data();
          setStudentName(userData.name || user.displayName || "Student");
          setStudentGrade(userData.grade);
          enrolledIds = userData.enrolledCourseIds || [];

          // B. Fetch Enrolled Courses
          if (enrolledIds.length > 0) {
            const myCourses: any[] = [];
            for (const courseId of enrolledIds) {
                const courseDoc = await getDoc(doc(db, "courses", courseId));
                if (courseDoc.exists()) {
                    myCourses.push({ id: courseDoc.id, ...courseDoc.data() });
                }
            }
            setEnrolledCourses(myCourses);
          }
        }

        // C. Fetch Quiz Results
        try {
            const resultsRef = collection(db, "users", user.uid, "results");
            const q = query(resultsRef, orderBy("date", "desc"));
            const resSnap = await getDocs(q);
            const resList: any[] = [];
            resSnap.forEach(doc => resList.push({ id: doc.id, ...doc.data() }));
            setQuizResults(resList);
        } catch (err) { console.error(err); }

        // D. FETCH ANNOUNCEMENTS (Fixed)
        try {
            const notifs: any[] = [];
            
            // 1. General
            const qGeneral = query(collection(db, "announcements"), where("targetType", "==", "all"), limit(20));
            const snapGen = await getDocs(qGeneral);
            snapGen.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));

            // 2. Course Specific
            if (enrolledIds.length > 0) {
                const safeIds = enrolledIds.slice(0, 10); 
                const qCourse = query(collection(db, "announcements"), where("targetCourseId", "in", safeIds), limit(20));
                const snapCourse = await getDocs(qCourse);
                snapCourse.forEach(doc => notifs.push({ id: doc.id, ...doc.data() }));
            }

            // 3. Client Sort
            const sortedNotifs = notifs.sort((a, b) => {
                const dateA = a.createdAt?.seconds || 0;
                const dateB = b.createdAt?.seconds || 0;
                return dateB - dateA;
            });
            
            // 4. Unique Filter
            const uniqueNotifs = sortedNotifs.filter((v,i,a)=>a.findIndex(t=>(t.id === v.id))===i);
            setAnnouncements(uniqueNotifs);

        } catch (err) { console.error("Error fetching announcements:", err); }
      }
    };

    if (user) fetchData();
  }, [user]);

  if (loading) return <div className="min-h-screen flex items-center justify-center text-blue-600 font-bold">Loading...</div>;
  if (!user) return null; 

  return (
    <div className="min-h-screen bg-slate-50 flex font-sans">
      
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
           <Image src="/logo.svg" alt="Logo" width={32} height={32} />
           <span className="font-bold text-slate-900 tracking-tight">Vishwaas</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            
            {/* 1. Classroom Tab */}
            <button 
                onClick={() => setActiveTab("classroom")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === "classroom" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
                <span>📚</span> My Classroom
            </button>

            {/* 2. Notice Board Tab (NEW) */}
            <button 
                onClick={() => setActiveTab("announcements")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === "announcements" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
                <div className="flex items-center gap-3 w-full">
                    <span>🔔</span> Notice Board
                    {/* Notification Badge */}
                    {announcements.length > 0 && activeTab !== "announcements" && (
                        <span className="ml-auto bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">
                            {announcements.length}
                        </span>
                    )}
                </div>
            </button>
            
            {/* 3. Results Tab */}
            <button 
                onClick={() => setActiveTab("results")}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition ${activeTab === "results" ? "bg-blue-50 text-blue-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
                <span>🏆</span> Test Results
            </button>

            <button disabled className="w-full flex items-center gap-3 px-4 py-3 text-slate-400 cursor-not-allowed">
                <span>📝</span> Assignments (Soon)
            </button>
        </nav>
        <div className="p-4 border-t border-slate-100">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-600 hover:bg-red-50 w-full rounded-lg font-medium transition">
                <span>🚪</span> Logout
            </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow md:ml-64 min-h-screen">
        
        {/* Mobile Header */}
        <div className="md:hidden bg-white p-4 flex justify-between items-center border-b border-slate-200 sticky top-0 z-20">
            <span className="font-bold text-slate-900">Vishwaas Academy</span>
            <button onClick={logout} className="text-sm text-red-600 font-medium">Logout</button>
        </div>

        <div className="p-8">
            
            {/* --- TAB 1: CLASSROOM (Clean & Clutter-Free) --- */}
            {activeTab === "classroom" && (
                <div className="animate-in fade-in duration-500">
                    <div className="mb-8">
                        <h1 className="text-3xl font-bold text-slate-900">
                            Welcome back, {studentName.split(' ')[0]}! 👋
                        </h1>
                        <p className="text-slate-600 mt-1">You are studying in <span className="font-semibold text-blue-600">{studentGrade || "Class 10"}</span>.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-slate-500 text-sm font-medium uppercase">Enrolled Courses</h3>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{enrolledCourses.length}</p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-slate-500 text-sm font-medium uppercase">Active Notices</h3>
                            {/* Clicking this stat jumps to notices */}
                            <p onClick={() => setActiveTab("announcements")} className="text-3xl font-bold text-blue-600 mt-2 cursor-pointer hover:underline decoration-blue-300 decoration-2 underline-offset-4">
                                {announcements.length}
                            </p>
                        </div>
                        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                            <h3 className="text-slate-500 text-sm font-medium uppercase">Tests Taken</h3>
                            <p className="text-3xl font-bold text-slate-900 mt-2">{quizResults.length}</p>
                        </div>
                    </div>

                    <h2 className="text-xl font-bold text-slate-900 mb-6">Your Courses</h2>
                    
                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {enrolledCourses.length > 0 ? (
                            enrolledCourses.map((course) => (
                                <div key={course.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-md transition group cursor-pointer flex flex-col">
                                    <div className="h-40 bg-slate-200 relative">
                                        {course.thumbnail ? (
                                            <Image 
                                                src={course.thumbnail.startsWith("http") ? course.thumbnail : "https://placehold.co/600x400/png"} 
                                                alt={course.title} 
                                                fill 
                                                className="object-cover" 
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-blue-100 text-blue-300 text-4xl">📚</div>
                                        )}
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
                        <Link href="/courses" className="border-2 border-dashed border-slate-300 rounded-2xl flex flex-col items-center justify-center text-slate-400 p-6 hover:border-blue-400 hover:text-blue-500 transition min-h-[300px]">
                            <span className="text-4xl mb-4">+</span>
                            <span className="font-medium">Explore More Courses</span>
                        </Link>
                    </div>
                </div>
            )}

            {/* --- TAB 2: NOTICE BOARD (Dedicated View) --- */}
            {activeTab === "announcements" && (
                <div className="animate-in fade-in duration-500 max-w-4xl">
                    <h1 className="text-2xl font-bold text-slate-900 mb-2">🔔 Notice Board</h1>
                    <p className="text-slate-500 mb-8">Updates from your teachers and the academy.</p>

                    {announcements.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                            <div className="text-5xl mb-4">📭</div>
                            <h3 className="text-lg font-bold text-slate-700">All Caught Up!</h3>
                            <p className="text-slate-400">No new announcements at the moment.</p>
                        </div>
                    ) : (
                        <div className="space-y-4">
                            {announcements.map((notif) => (
                                <div key={notif.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col md:flex-row gap-4">
                                    {/* Icon / Type Indicator */}
                                    <div className="flex-shrink-0">
                                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-2xl ${notif.targetType === 'all' ? 'bg-purple-100 text-purple-600' : 'bg-blue-100 text-blue-600'}`}>
                                            {notif.targetType === 'all' ? '📢' : '📚'}
                                        </div>
                                    </div>
                                    
                                    {/* Content */}
                                    <div className="flex-grow">
                                        <div className="flex flex-col md:flex-row md:justify-between md:items-start mb-2">
                                            <h3 className="text-lg font-bold text-slate-900">{notif.title}</h3>
                                            <span className="text-xs text-slate-400 bg-slate-50 px-2 py-1 rounded">
                                                {notif.createdAt?.seconds ? new Date(notif.createdAt.seconds * 1000).toLocaleString() : "Just now"}
                                            </span>
                                        </div>
                                        
                                        <p className="text-slate-600 leading-relaxed">{notif.message}</p>
                                        
                                        {/* Tag */}
                                        <div className="mt-4">
                                            {notif.targetType === 'course' ? (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded">
                                                    📚 {notif.targetCourseName || "Course Update"}
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded">
                                                    🌍 General Announcement
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}

            {/* --- TAB 3: TEST RESULTS --- */}
            {activeTab === "results" && (
                <div className="animate-in fade-in duration-500">
                    <h1 className="text-2xl font-bold text-slate-900 mb-6">🏆 Your Performance Report</h1>
                    {quizResults.length === 0 ? (
                        <div className="bg-white p-12 rounded-2xl border border-dashed border-slate-300 text-center">
                            <p className="text-slate-400 mb-4">You haven't taken any tests yet.</p>
                            <button onClick={() => setActiveTab("classroom")} className="text-blue-600 font-bold hover:underline">Go to Classroom</button>
                        </div>
                    ) : (
                        <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                            <table className="w-full text-left">
                                <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-bold border-b border-slate-200">
                                    <tr>
                                        <th className="p-4">Quiz Title</th>
                                        <th className="p-4">Date Taken</th>
                                        <th className="p-4">Score</th>
                                        <th className="p-4">Percentage</th>
                                        <th className="p-4 text-right">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {quizResults.map((res) => (
                                        <tr key={res.id} className="hover:bg-slate-50 transition">
                                            <td className="p-4 font-bold text-slate-800">{res.quizTitle || "Untitled Quiz"}</td>
                                            <td className="p-4 text-sm text-slate-500">
                                                {res.date ? new Date(res.date.seconds * 1000).toLocaleDateString() : "-"}
                                            </td>
                                            <td className="p-4 font-mono text-blue-600 font-bold">
                                                {res.score?.toFixed(1)}
                                            </td>
                                            <td className="p-4">
                                                <span className={`px-2 py-1 rounded text-xs font-bold ${
                                                    parseFloat(res.percentage) >= 75 ? 'bg-green-100 text-green-700' :
                                                    parseFloat(res.percentage) >= 40 ? 'bg-yellow-100 text-yellow-700' :
                                                    'bg-red-100 text-red-700'
                                                }`}>
                                                    {res.percentage}%
                                                </span>
                                            </td>
                                            <td className="p-4 text-right">
                                                <Link href={`/classroom/${res.courseId}/quiz/${res.quizId}`}>
                                                    <button className="text-xs bg-slate-900 text-white px-3 py-1.5 rounded hover:bg-slate-700 transition">
                                                        View Analysis
                                                    </button>
                                                </Link>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            )}

        </div>
      </main>
    </div>
  );
}