"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, getDocs, collection, query, where, deleteDoc, updateDoc, arrayRemove, arrayUnion } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Image from "next/image";

export default function CourseDetailsAdmin({ params }: { params: Promise<{ courseId: string }> }) {
  const { courseId } = use(params);
  const router = useRouter();

  // Data State
  const [course, setCourse] = useState<any>(null);
  
  // FACULTY STATE (Array now)
  const [assignedFaculties, setAssignedFaculties] = useState<any[]>([]);
  const [allFaculty, setAllFaculty] = useState<any[]>([]); 
  const [selectedFacultyId, setSelectedFacultyId] = useState("");

  // STUDENT STATE
  const [enrolledStudents, setEnrolledStudents] = useState<any[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentSearchResults, setStudentSearchResults] = useState<any[]>([]);
  
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [courseId]);

  const fetchData = async () => {
      try {
        // 1. Fetch Course Info
        const courseSnap = await getDoc(doc(db, "courses", courseId));
        if (!courseSnap.exists()) return;
        const courseData = courseSnap.data();
        setCourse(courseData);

        // 2. Fetch Assigned Faculties (Handle Multiple)
        // We look for 'assignedFacultyIds' (Array). 
        // Backward compatibility: If array doesn't exist but string 'assignedFacultyId' does, use that.
        let facultyIds: string[] = courseData.assignedFacultyIds || [];
        
        if (facultyIds.length === 0 && courseData.assignedFacultyId) {
            facultyIds.push(courseData.assignedFacultyId);
        }

        if (facultyIds.length > 0) {
            // Fetch details for each faculty ID
            // (In production, use 'in' query in batches of 10, here we map promises for simplicity)
            const facultyPromises = facultyIds.map(id => getDoc(doc(db, "users", id)));
            const facultySnaps = await Promise.all(facultyPromises);
            
            const loadedFaculties = facultySnaps
                .filter(snap => snap.exists())
                .map(snap => ({ id: snap.id, ...snap.data() }));
            
            setAssignedFaculties(loadedFaculties);
        }

        // 3. Fetch Enrolled Students
        const qStudents = query(collection(db, "users"), where("enrolledCourseIds", "array-contains", courseId));
        const studentSnaps = await getDocs(qStudents);
        const studentList: any[] = [];
        studentSnaps.forEach(doc => studentList.push({ id: doc.id, ...doc.data() }));
        setEnrolledStudents(studentList);

        // 4. Fetch ALL Faculty (for Dropdown)
        const qAllFaculty = query(collection(db, "users"), where("role", "==", "faculty"));
        const allFacultySnap = await getDocs(qAllFaculty);
        const facultyList: any[] = [];
        allFacultySnap.forEach(doc => facultyList.push({ id: doc.id, ...doc.data() }));
        setAllFaculty(facultyList);

      } catch (error) {
        console.error("Error fetching details:", error);
      } finally {
        setLoading(false);
      }
  };

  // --- FACULTY ACTIONS (MULTIPLE) ---

  const handleAddFaculty = async () => {
    if (!selectedFacultyId) return;
    
    // Check if already added
    if (assignedFaculties.some(f => f.id === selectedFacultyId)) {
        alert("This faculty is already assigned.");
        return;
    }

    try {
        // Add to array in Firestore
        await updateDoc(doc(db, "courses", courseId), {
            assignedFacultyIds: arrayUnion(selectedFacultyId)
        });
        
        // Update UI
        const newFac = allFaculty.find(f => f.id === selectedFacultyId);
        setAssignedFaculties([...assignedFaculties, newFac]);
        setSelectedFacultyId(""); // Reset dropdown
    } catch (err) {
        console.error(err);
        alert("Failed to add faculty.");
    }
  };

  const handleRemoveFaculty = async (facultyId: string, facultyName: string) => {
    if (confirm(`Remove ${facultyName} from this course?`)) {
        try {
            // Remove from array in Firestore
            await updateDoc(doc(db, "courses", courseId), {
                assignedFacultyIds: arrayRemove(facultyId)
            });
            
            // Update UI
            setAssignedFaculties(assignedFaculties.filter(f => f.id !== facultyId));
        } catch (err) { console.error(err); }
    }
  };

  // --- STUDENT ACTIONS ---

  const handleSearchStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if(!studentSearchTerm) return;
    
    const q = query(collection(db, "users"), where("role", "==", "student")); 
    const querySnapshot = await getDocs(q);
    
    const results: any[] = [];
    querySnapshot.forEach((doc) => {
        const data = doc.data();
        const matchesTerm = data.name.toLowerCase().includes(studentSearchTerm.toLowerCase()) || 
                            data.email.toLowerCase().includes(studentSearchTerm.toLowerCase());
        const alreadyEnrolled = enrolledStudents.some(s => s.id === doc.id);
        
        if (matchesTerm && !alreadyEnrolled) {
            results.push({ id: doc.id, ...data });
        }
    });
    setStudentSearchResults(results);
  };

  const handleEnrollStudent = async (student: any) => {
    try {
        await updateDoc(doc(db, "users", student.id), {
            enrolledCourseIds: arrayUnion(courseId)
        });
        setEnrolledStudents([...enrolledStudents, student]);
        setStudentSearchResults(studentSearchResults.filter(s => s.id !== student.id));
    } catch (err) {
        console.error(err);
        alert("Failed to enroll.");
    }
  };

  const handleDropStudent = async (studentId: string, studentName: string) => {
    if (confirm(`Remove ${studentName} from this course?`)) {
        try {
            await updateDoc(doc(db, "users", studentId), {
                enrolledCourseIds: arrayRemove(courseId)
            });
            setEnrolledStudents(enrolledStudents.filter(s => s.id !== studentId));
        } catch (err) { console.error(err); }
    }
  };

  const handleDeleteCourse = async () => {
    if (confirm(`🚨 DANGER: Delete "${course.title}"?`)) {
        try {
            await deleteDoc(doc(db, "courses", courseId));
            router.push("/admin/dashboard");
        } catch (err) { console.error(err); }
    }
  };

  if (loading) return <div className="min-h-screen bg-slate-900 text-white p-10">Loading Data...</div>;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/admin/dashboard" className="text-slate-400 hover:text-white mb-4 inline-block">&larr; Back to Dashboard</Link>
        <div className="flex justify-between items-start">
            <div>
                <h1 className="text-3xl font-bold">{course?.title}</h1>
                <div className="flex gap-3 mt-4">
                    <span className="bg-blue-900 text-blue-200 px-3 py-1 rounded text-sm">{course?.grade}</span>
                    <span className="bg-slate-800 text-slate-300 px-3 py-1 rounded text-sm">{course?.subject}</span>
                </div>
            </div>
            <button onClick={handleDeleteCourse} className="bg-red-600 hover:bg-red-500 text-white px-4 py-2 rounded-lg font-bold text-sm">
                🗑️ Delete Course
            </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto grid md:grid-cols-2 gap-8">
        
        {/* --- LEFT: FACULTY MANAGEMENT --- */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 h-fit">
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">👨‍🏫 Assigned Faculties</h2>
                <span className="bg-purple-900 text-purple-300 px-2 py-1 rounded text-xs font-bold">{assignedFaculties.length} Teachers</span>
            </div>
            
            {/* ADD FACULTY SECTION */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-6">
                <p className="text-slate-400 mb-2 text-xs uppercase font-bold">Add Teacher</p>
                <div className="flex gap-2">
                    <select 
                        className="bg-slate-800 border border-slate-600 rounded px-2 py-2 text-sm w-full outline-none text-white focus:border-purple-500"
                        value={selectedFacultyId}
                        onChange={(e) => setSelectedFacultyId(e.target.value)}
                    >
                        <option value="">-- Select Faculty --</option>
                        {allFaculty.map(f => (
                            <option key={f.id} value={f.id}>{f.name} ({f.department})</option>
                        ))}
                    </select>
                    <button 
                        onClick={handleAddFaculty}
                        disabled={!selectedFacultyId}
                        className="bg-purple-600 hover:bg-purple-500 text-white px-4 py-2 rounded text-sm font-bold disabled:opacity-50"
                    >
                        Add
                    </button>
                </div>
            </div>

            {/* ASSIGNED FACULTY LIST */}
            <div className="space-y-3">
                {assignedFaculties.length === 0 ? (
                    <div className="text-center p-4 border border-dashed border-slate-600 rounded">
                        <p className="text-slate-500 italic">No faculty assigned yet.</p>
                    </div>
                ) : (
                    assignedFaculties.map((fac) => (
                        <div key={fac.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-purple-900/50 text-purple-200 rounded-full flex items-center justify-center font-bold text-lg">
                                    {fac.name ? fac.name.charAt(0) : "T"}
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">{fac.name}</p>
                                    <p className="text-slate-400 text-xs">{fac.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleRemoveFaculty(fac.id, fac.name)}
                                className="text-xs bg-red-900/20 text-red-400 hover:bg-red-900/40 border border-red-900/50 px-2 py-1 rounded transition"
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>

        {/* --- RIGHT: STUDENT MANAGEMENT --- */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold">🎓 Enrolled Students</h2>
                <span className="bg-green-900 text-green-300 px-2 py-1 rounded text-xs font-bold">Total: {enrolledStudents.length}</span>
            </div>

            {/* ADD STUDENT SEARCH */}
            <div className="bg-slate-900 p-4 rounded-lg border border-slate-700 mb-6">
                <p className="text-slate-400 mb-2 text-xs uppercase font-bold">Add Student</p>
                <form onSubmit={handleSearchStudent} className="flex gap-2 mb-2">
                    <input 
                        type="text" 
                        placeholder="Search name or email..." 
                        className="bg-slate-800 border border-slate-600 rounded px-3 py-2 text-sm w-full outline-none text-white focus:border-blue-500"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                    />
                    <button type="submit" className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded text-sm font-bold">
                        Search
                    </button>
                </form>
                
                {/* Search Results */}
                {studentSearchResults.length > 0 && (
                    <div className="mt-2 bg-slate-800 border border-slate-600 rounded max-h-40 overflow-y-auto custom-scrollbar">
                        {studentSearchResults.map(s => (
                            <div key={s.id} className="flex justify-between items-center p-2 hover:bg-slate-700 border-b border-slate-700 last:border-0">
                                <div>
                                    <p className="text-sm font-bold text-white">{s.name}</p>
                                    <p className="text-xs text-slate-400">{s.email}</p>
                                </div>
                                <button onClick={() => handleEnrollStudent(s)} className="text-xs bg-green-600 hover:bg-green-500 text-white px-2 py-1 rounded">
                                    + Add
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* STUDENT LIST */}
            <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                {enrolledStudents.length === 0 ? (
                    <p className="text-slate-500 text-center italic">No students enrolled yet.</p>
                ) : (
                    enrolledStudents.map((student) => (
                        <div key={student.id} className="flex items-center justify-between bg-slate-900 p-3 rounded-lg border border-slate-800 hover:border-slate-600 transition">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 bg-blue-900 rounded-full flex items-center justify-center text-xs font-bold">
                                    {student.name ? student.name.charAt(0) : "S"}
                                </div>
                                <div>
                                    <p className="font-semibold text-sm text-white">{student.name}</p>
                                    <p className="text-xs text-slate-500">{student.email}</p>
                                </div>
                            </div>
                            <button 
                                onClick={() => handleDropStudent(student.id, student.name)}
                                className="text-xs text-red-400 hover:text-red-300 hover:underline"
                            >
                                Remove
                            </button>
                        </div>
                    ))
                )}
            </div>
        </div>

      </div>
    </div>
  );
}