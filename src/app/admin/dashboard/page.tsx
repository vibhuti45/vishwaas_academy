"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { db } from "@/lib/firebase";
import { collection, query, where, getCountFromServer, getDocs } from "firebase/firestore";

export default function AdminDashboard() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();

  const [stats, setStats] = useState({ students: 0, faculty: 0, courses: 0 });
  const [courseList, setCourseList] = useState<any[]>([]); // New State for list

  // 1. PROTECT ROUTE
  useEffect(() => {
    if (!loading) {
      if (!user) router.push("/login");
      else if (user.role !== "admin") router.push("/dashboard");
    }
  }, [user, loading, router]);

  // 2. FETCH STATS & COURSE LIST
  useEffect(() => {
    async function fetchData() {
      try {
        // A. Stats (Counts)
        const studentColl = collection(db, "users");
        const qStudents = query(studentColl, where("role", "==", "student"));
        const studentSnap = await getCountFromServer(qStudents);
        const qFaculty = query(studentColl, where("role", "==", "faculty"));
        const facultySnap = await getCountFromServer(qFaculty);
        const courseColl = collection(db, "courses");
        const courseCountSnap = await getCountFromServer(courseColl);

        setStats({
          students: studentSnap.data().count,
          faculty: facultySnap.data().count,
          courses: courseCountSnap.data().count
        });

        // B. Fetch Course List (for the table)
        const courseSnapshot = await getDocs(courseColl);
        const list: any[] = [];
        courseSnapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setCourseList(list);

      } catch (error) {
        console.error("Error fetching admin data:", error);
      }
    }

    if (user?.role === "admin") fetchData();
  }, [user]);

  if (loading || user?.role !== "admin") return <div className="p-10 text-center">Verifying Admin Access...</div>;

  return (
    <div className="min-h-screen bg-slate-900 flex text-white">
      
      {/* SIDEBAR */}
      <aside className="w-64 border-r border-slate-800 flex flex-col fixed h-full z-10 bg-slate-900">
        <div className="p-6 flex items-center gap-3 border-b border-slate-800">
           <Image src="/logo.svg" alt="Logo" width={32} height={32} className="invert" />
           <span className="font-bold tracking-tight text-white">Admin Panel</span>
        </div>
        <nav className="flex-grow p-4 space-y-2">
            <div className="px-4 py-3 bg-blue-600 rounded-lg font-medium cursor-pointer">📊 Dashboard Overview</div>
            <Link href="/admin/enroll" className="block px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition">🎓 Enroll Students</Link>
            <Link href="/admin/add-user" className="block px-4 py-3 text-slate-400 hover:bg-slate-800 rounded-lg font-medium transition">👤 Add User</Link>
        </nav>
        <div className="p-4 border-t border-slate-800">
            <button onClick={logout} className="flex items-center gap-3 px-4 py-3 text-red-400 hover:bg-red-900/20 w-full rounded-lg font-medium transition">🚪 Logout</button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-grow ml-64 p-10 bg-slate-950 min-h-screen">
        <h1 className="text-3xl font-bold mb-8">Admin Control Center</h1>

        {/* STATS GRID */}
        <div className="grid grid-cols-3 gap-6 mb-10">
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-slate-400 text-sm font-medium uppercase">Total Students</h3>
                <p className="text-4xl font-bold text-white mt-2">{stats.students}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-slate-400 text-sm font-medium uppercase">Total Courses</h3>
                <p className="text-4xl font-bold text-blue-400 mt-2">{stats.courses}</p>
            </div>
            <div className="bg-slate-900 p-6 rounded-xl border border-slate-800">
                <h3 className="text-slate-400 text-sm font-medium uppercase">Faculty Members</h3>
                <p className="text-4xl font-bold text-purple-400 mt-2">{stats.faculty}</p>
            </div>
        </div>

        {/* QUICK ACTIONS */}
        <div className="flex gap-4 mb-10">
            <Link href="/admin/create-course"><button className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-lg font-semibold transition">+ Create New Course</button></Link>
            <Link href="/admin/add-user"><button className="bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-lg font-semibold transition">+ Register User</button></Link>
            <Link href="/admin/enroll"><button className="bg-green-600 hover:bg-green-500 text-white px-6 py-3 rounded-lg font-semibold transition">+ Enroll Student</button></Link>
            <Link href="/admin/users">
                <button className="bg-slate-700 hover:bg-slate-600 text-white px-6 py-3 rounded-lg font-semibold transition flex items-center gap-2">
                    <span>👥</span> View All Users
                </button>
            </Link>
        </div>

        {/* RUNNING COURSES LIST */}
        <h2 className="text-xl font-bold mb-4">Running Courses</h2>
        <div className="bg-slate-900 rounded-xl border border-slate-800 overflow-hidden">
            <table className="w-full text-left">
                <thead className="bg-slate-800 text-slate-400 text-sm uppercase">
                    <tr>
                        <th className="p-4">Course Title</th>
                        <th className="p-4">Grade</th>
                        <th className="p-4">Subject</th>
                        <th className="p-4">Action</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                    {courseList.length === 0 ? (
                        <tr><td colSpan={4} className="p-6 text-center text-slate-500">No active courses found.</td></tr>
                    ) : (
                        courseList.map((course) => (
                            <tr key={course.id} className="hover:bg-slate-800/50 transition">
                                <td className="p-4 font-semibold text-white">{course.title}</td>
                                <td className="p-4">{course.grade}</td>
                                <td className="p-4">{course.subject}</td>
                                <td className="p-4">
                                    <Link href={`/admin/courses/${course.id}`}>
                                        <button className="text-sm bg-slate-700 hover:bg-blue-600 hover:text-white px-3 py-1.5 rounded transition">
                                            View Details &rarr;
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>

      </main>
    </div>
  );
}