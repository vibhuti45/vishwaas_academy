"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where } from "firebase/firestore";
import Link from "next/link";

export default function CourseDetailsAdmin({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);

  const [course, setCourse] = useState<any>(null);
  const [faculty, setFaculty] = useState<any>(null);
  const [students, setStudents] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Fetch Course Info
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (!courseSnap.exists()) return;
        
        const courseData = courseSnap.data();
        setCourse(courseData);

        // 2. Fetch Assigned Faculty
        if (courseData.assignedFacultyId) {
            const facultySnap = await getDoc(doc(db, "users", courseData.assignedFacultyId));
            if (facultySnap.exists()) {
                setFaculty(facultySnap.data());
            }
        }

        // 3. Fetch Enrolled Students
        // Query: Find users where 'enrolledCourseIds' array contains this courseId
        const qStudents = query(
            collection(db, "users"), 
            where("enrolledCourseIds", "array-contains", courseId)
        );
        const studentSnaps = await getDocs(qStudents);
        
        const studentList: any[] = [];
        studentSnaps.forEach(doc => studentList.push({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [courseId]);

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-10">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-8">
        <Link href="/admin/dashboard" className="text-slate-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</Link>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{course?.title}</h1>
                <p className="text-slate-400 mt-2">{course?.description}</p>
                <div className="flex gap-3 mt-4">
                    <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-sm">{course?.grade}</span>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-sm">{course?.subject}</span>
                </div>
            </div>
            {/* Thumbnail Preview */}
            {course?.thumbnail && (
                <img src={course.thumbnail} alt="Course" className="w-32 h-20 object-cover rounded border border-slate-700" />
            )}
        </div>
      </div>

      <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* LEFT COLUMN: FACULTY INFO */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-fit">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                👨‍🏫 Assigned Faculty
            </h2>
            {faculty ? (
                <div className="flex items-center gap-4 bg-slate-900 p-4 rounded-lg">
                    <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center font-bold text-xl">
                        {faculty.name.charAt(0)}
                    </div>
                    <div>
                        <p className="font-bold text-lg">{faculty.name}</p>
                        <p className="text-slate-400 text-sm">{faculty.email}</p>
                        <p className="text-purple-400 text-xs mt-1 uppercase font-bold">{faculty.department}</p>
                    </div>
                </div>
            ) : (
                <p className="text-red-400 italic">No faculty assigned yet.</p>
            )}
        </div>

        {/* RIGHT COLUMN: STUDENTS LIST */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    🎓 Enrolled Students
                </h2>
                <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-bold">
                    Total: {students.length}
                </span>
            </div>

            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {students.length === 0 ? (
                    <div className="text-center py-8 text-slate-500 border border-dashed border-slate-700 rounded">
                        No students enrolled.
                    </div>
                ) : (
                    students.map((student) => (
                        <div key={student.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">
                                    {student.name ? student.name.charAt(0) : "S"}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-white">{student.name || "Unknown"}</p>
                                    <p className="text-xs text-slate-500">{student.email}</p>
                                </div>
                            </div>
                            <span className="text-xs text-slate-400">{student.grade}</span>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}