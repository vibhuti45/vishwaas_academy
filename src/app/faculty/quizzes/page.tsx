"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, query, where, getDocs, addDoc, orderBy } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function QuizManager() {
  const { user } = useAuth();
  const router = useRouter();
  
  const [myCourses, setMyCourses] = useState<any[]>([]);
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([]);
  
  // Creation Form State
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false); 

  // 1. Fetch Teacher's Courses & Quizzes
  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        // A. Get Courses assigned to this Faculty
        const q = query(collection(db, "courses"), where("assignedFacultyId", "==", user.uid));
        const snapshot = await getDocs(q);
        const coursesList: any[] = [];
        snapshot.forEach(doc => coursesList.push({ id: doc.id, ...doc.data() }));
        setMyCourses(coursesList);

        // B. Get Quizzes from those courses
        let allQuizzes: any[] = [];
        for (const course of coursesList) {
            const quizQ = query(collection(db, "courses", course.id, "quizzes"), orderBy("createdAt", "desc"));
            const quizSnap = await getDocs(quizQ);
            quizSnap.forEach(doc => {
                allQuizzes.push({
                    id: doc.id,
                    courseId: course.id,
                    courseTitle: course.title,
                    ...doc.data()
                });
            });
        }
        setExistingQuizzes(allQuizzes);
      }
    };
    fetchData();
  }, [user]);

  // 2. Create Quiz Handler
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) return alert("Please select a course first.");
    
    setLoading(true);
    try {
      const quizRef = await addDoc(collection(db, "courses", selectedCourseId, "quizzes"), {
        title: quizTitle,
        duration: parseInt(duration.toString()),
        createdAt: new Date(),
        published: false,
        questions: [],
        marksPerQuestion: 1, 
        negativeMarks: 0     
      });

      router.push(`/faculty/quizzes/${selectedCourseId}/${quizRef.id}`);

    } catch (error) {
      console.error("Error creating quiz:", error);
      alert("Failed to create quiz.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-6 md:p-10 font-sans">
      
      <div className="max-w-6xl mx-auto">
        
        {/* --- BACK BUTTON ADDED HERE --- */}
        <div className="mb-6">
            <Link href="/faculty/dashboard" className="inline-flex items-center text-slate-500 hover:text-blue-600 transition font-medium text-sm">
                <span className="mr-2">←</span> Back to Dashboard
            </Link>
        </div>

        {/* HEADER */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Quiz Manager</h1>
                <p className="text-slate-500">Create assessments and track student performance.</p>
            </div>
            <button 
                onClick={() => setIsCreating(!isCreating)}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-bold shadow-lg hover:bg-blue-500 transition"
            >
                {isCreating ? "Cancel Creation" : "+ Create New Quiz"}
            </button>
        </div>

        {/* --- CREATE SECTION (Collapsible) --- */}
        {isCreating && (
            <div className="bg-white p-6 rounded-xl shadow-lg border border-blue-100 mb-10 animate-in slide-in-from-top-5">
                <h2 className="text-lg font-bold mb-4 text-blue-800">Draft New Quiz</h2>
                <form onSubmit={handleCreateQuiz} className="grid md:grid-cols-4 gap-4 items-end">
                    <div className="col-span-1">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Select Course</label>
                        <select 
                            required
                            className="w-full border p-3 rounded-lg bg-slate-50 outline-none focus:border-blue-500"
                            value={selectedCourseId}
                            onChange={(e) => setSelectedCourseId(e.target.value)}
                        >
                            <option value="">-- Choose Course --</option>
                            {myCourses.map(c => (
                                <option key={c.id} value={c.id}>{c.title}</option>
                            ))}
                        </select>
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Quiz Title</label>
                        <input 
                            type="text" required placeholder="e.g. Thermodynamics Test"
                            className="w-full border p-3 rounded-lg outline-none focus:border-blue-500"
                            value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)}
                        />
                    </div>
                    <div className="col-span-1">
                        <label className="block text-xs font-bold uppercase text-slate-500 mb-1">Duration (Mins)</label>
                        <input 
                            type="number" required min="5"
                            className="w-full border p-3 rounded-lg outline-none focus:border-blue-500"
                            value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                        />
                    </div>
                    <div className="col-span-1">
                        <button disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition">
                            {loading ? "Creating..." : "Start Building &rarr;"}
                        </button>
                    </div>
                </form>
            </div>
        )}

        {/* --- QUIZ LIST --- */}
        {existingQuizzes.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed border-slate-300">
                <p className="text-slate-400 italic">No quizzes created yet. Click "Create New Quiz" to start.</p>
            </div>
        ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {existingQuizzes.map((quiz) => (
                    <div key={quiz.id} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition flex flex-col justify-between">
                        
                        <div>
                            <div className="flex justify-between items-start mb-3">
                                <span className="text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-500 px-2 py-1 rounded">
                                    {quiz.courseTitle}
                                </span>
                                {quiz.published ? (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-green-600 bg-green-50 px-2 py-1 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-green-500"></span> Published
                                    </span>
                                ) : (
                                    <span className="flex items-center gap-1 text-[10px] font-bold uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
                                        <span className="w-2 h-2 rounded-full bg-amber-500"></span> Draft
                                    </span>
                                )}
                            </div>

                            <h3 className="text-xl font-bold text-slate-900 mb-2 truncate" title={quiz.title}>{quiz.title}</h3>
                            <div className="text-sm text-slate-500 mb-6 flex gap-4">
                                <span className="flex items-center gap-1">⏱ {quiz.duration} mins</span>
                                <span className="flex items-center gap-1">❓ {quiz.questions?.length || 0} Qs</span>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3 border-t border-slate-100 pt-4 mt-auto">
                            <Link href={`/faculty/quizzes/${quiz.courseId}/${quiz.id}`}>
                                <button className="w-full py-2 rounded-lg border border-slate-200 text-slate-600 font-bold text-sm hover:bg-slate-50 hover:text-blue-600 transition flex justify-center items-center gap-2">
                                    <span>✏️</span> Edit
                                </button>
                            </Link>
                            
                            <Link href={`/faculty/quizzes/results/${quiz.courseId}/${quiz.id}`}>
                                <button className="w-full py-2 rounded-lg bg-blue-50 text-blue-700 font-bold text-sm hover:bg-blue-100 border border-blue-100 transition flex justify-center items-center gap-2">
                                    <span>📊</span> Results
                                </button>
                            </Link>
                        </div>

                    </div>
                ))}
            </div>
        )}
      </div>

    </div>
  );
}