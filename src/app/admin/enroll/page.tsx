"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, where, doc, updateDoc, arrayUnion } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function EnrollStudent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  
  // Data for Dropdowns
  const [students, setStudents] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);
  
  // Selection State
  const [selectedStudentId, setSelectedStudentId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // 1. Fetch Students & Courses on Load
  useEffect(() => {
    const fetchData = async () => {
      try {
        // A. Fetch only "Students"
        const qStudents = query(collection(db, "users"), where("role", "==", "student"));
        const studentSnap = await getDocs(qStudents);
        const studentList: any[] = [];
        studentSnap.forEach(doc => studentList.push({ id: doc.id, ...doc.data() }));
        setStudents(studentList);

        // B. Fetch All Courses
        const courseSnap = await getDocs(collection(db, "courses"));
        const courseList: any[] = [];
        courseSnap.forEach(doc => courseList.push({ id: doc.id, ...doc.data() }));
        setCourses(courseList);

      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };
    fetchData();
  }, []);

  // 2. Handle Enrollment
  const handleEnroll = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStudentId || !selectedCourseId) {
        alert("Please select both a student and a course.");
        return;
    }
    setLoading(true);

    try {
      // We add the 'courseId' to the student's 'enrolledCourseIds' array
      const studentRef = doc(db, "users", selectedStudentId);
      
      await updateDoc(studentRef, {
        enrolledCourseIds: arrayUnion(selectedCourseId)
      });

      alert("Student Enrolled Successfully! ✅");
      setSelectedStudentId(""); // Reset form
      setSelectedCourseId("");
    } catch (error) {
      console.error("Enrollment failed:", error);
      alert("Error enrolling student.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-4">
      <div className="max-w-xl w-full bg-slate-800 p-8 rounded-2xl border border-slate-700 shadow-xl">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">🎓 Enroll Student</h1>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white text-sm">Cancel</Link>
        </div>

        <form onSubmit={handleEnroll} className="space-y-6">
            
            {/* Student Dropdown */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Student</label>
                <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                >
                    <option value="">-- Choose Student --</option>
                    {students.map(s => (
                        <option key={s.id} value={s.id}>
                            {s.name} ({s.email}) - {s.grade}
                        </option>
                    ))}
                </select>
            </div>

            {/* Course Dropdown */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Select Course</label>
                <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    value={selectedCourseId}
                    onChange={(e) => setSelectedCourseId(e.target.value)}
                >
                    <option value="">-- Choose Course --</option>
                    {courses.map(c => (
                        <option key={c.id} value={c.id}>
                            {c.title} ({c.grade})
                        </option>
                    ))}
                </select>
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3 rounded-lg transition disabled:opacity-50 mt-4"
            >
                {loading ? "Processing..." : "Grant Access"}
            </button>
        </form>

      </div>
    </div>
  );
}