"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

export default function FacultyDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  
  const [facultyData, setFacultyData] = useState({ name: "Faculty", department: "" });
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [dataLoading, setDataLoading] = useState(true);

  // 1. Protect Route
  useEffect(() => {
    if (!loading && (!user || user.role !== "faculty")) {
      router.push("/faculty/login");
    }
  }, [user, loading, router]);

  // 2. Fetch Profile & Courses
  useEffect(() => {
    const initData = async () => {
      if (user?.uid) {
        try {
          const docSnap = await getDoc(doc(db, "users", user.uid));
          if (docSnap.exists()) {
            setFacultyData({
              name: docSnap.data().name || "Faculty Member",
              department: docSnap.data().department || "General"
            });
          }

          const q = query(collection(db, "courses"), where("assignedFacultyId", "==", user.uid));
          const querySnapshot = await getDocs(q);
          
          const courses: any[] = [];
          querySnapshot.forEach((doc) => {
            courses.push({ id: doc.id, ...doc.data() });
          });
          setMyCourses(courses);

        } catch (error) {
          console.error("Error fetching data:", error);
        } finally {
          setDataLoading(false);
        }
      }
    };
    initData();
  }, [user]);

  if (loading || dataLoading) return <div className="p-10 text-blue-600 font-bold">Loading Portal...</div>;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full z-10">
        <div className="p-6 flex items-center gap-3 border-b border-slate-100">
           <Image src="/logo.svg" alt="Logo" width={32} height={32} />
           <span className="font-bold text-slate-900">Faculty Panel</span>
        </div>
        
        <div className="p-6 border-b border-slate-100 bg-slate-50">
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-xl mb-3">👨‍🏫</div>
            <h3 className="font-bold text-slate-900 text-sm">{facultyData.name}</h3>
            <p className="text-xs text-slate-500 uppercase font-semibold">{facultyData.department}</p>
        </div>

        <nav className="flex-grow p-4 space-y-2">
            <Link href="/faculty/dashboard">
                <div className="px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-medium cursor-pointer flex items-center gap-3">
                    <span>📚</span> My Classes
                </div>
            </Link>
            <Link href="/faculty/doubts">
                <div className="px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium cursor-pointer transition flex items-center gap-3">
                    <span>🙋‍♂️</span> Student Doubts
                </div>
            </Link>
            <Link href="/faculty/quizzes">
                <div className="px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg font-medium cursor-pointer transition flex items-center gap-3">
                    <span>⚡</span> Quiz Manager
                </div>
            </Link>
            <button onClick={logout} className="text-red-600 font-medium hover:bg-red-50 w-full text-left px-4 py-3 rounded-lg mt-auto flex items-center gap-3">
                <span>🚪</span> Logout
            </button>
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-grow md:ml-64 p-10">
        <h1 className="text-3xl font-bold text-slate-900 mb-2">My Assigned Courses</h1>
        <p className="text-slate-500 mb-8">Manage your syllabus, videos, and quizzes.</p>

        {myCourses.length === 0 ? (
          <div className="bg-white p-12 rounded-xl shadow-sm border border-slate-200 text-center">
            <span className="text-4xl">📭</span>
            <h3 className="text-xl font-bold text-slate-900 mt-4">No Classes Yet</h3>
            <p className="text-slate-500 mt-2">Contact the Admin to assign a subject to you.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {myCourses.map((course) => (
              <div key={course.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition group flex flex-col">
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
                   <div className="absolute top-2 right-2 bg-white/90 px-2 py-1 text-xs font-bold rounded shadow-sm">
                     {course.grade}
                   </div>
                </div>

                <div className="p-5 flex flex-col flex-grow">
                  <h3 className="font-bold text-lg text-slate-900 mb-1">{course.title}</h3>
                  <p className="text-sm text-slate-500 mb-4 truncate">{course.description}</p>
                  
                  {/* BUTTONS ROW */}
                  <div className="mt-auto grid grid-cols-2 gap-2">
                      <Link href={`/faculty/courses/${course.id}`} className="w-full">
                        <button className="w-full bg-slate-100 text-slate-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-slate-200 transition flex items-center justify-center gap-2">
                          <span>🎥</span> Content
                        </button>
                      </Link>
                      
                      <Link href="/faculty/quizzes" className="w-full">
                        <button className="w-full bg-blue-50 text-blue-700 text-sm font-semibold py-2.5 rounded-lg hover:bg-blue-100 transition flex items-center justify-center gap-2">
                          <span>⚡</span> Quiz
                        </button>
                      </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}