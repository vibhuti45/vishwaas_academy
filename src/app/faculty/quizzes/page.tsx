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
  const [existingQuizzes, setExistingQuizzes] = useState<any[]>([]); // <--- NEW STATE
  
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [quizTitle, setQuizTitle] = useState("");
  const [duration, setDuration] = useState(30);
  const [loading, setLoading] = useState(false);

  // 1. Fetch Teacher's Courses & Quizzes
  useEffect(() => {
    const fetchData = async () => {
      if (user?.uid) {
        // A. Get Courses
        const q = query(collection(db, "courses"), where("assignedFacultyId", "==", user.uid));
        const snapshot = await getDocs(q);
        const coursesList: any[] = [];
        snapshot.forEach(doc => coursesList.push({ id: doc.id, ...doc.data() }));
        setMyCourses(coursesList);

        // B. Get Quizzes from those courses
        // (Since quizzes are subcollections, we iterate through courses to get them)
        let allQuizzes: any[] = [];
        for (const course of coursesList) {
            const quizQ = query(collection(db, "courses", course.id, "quizzes"), orderBy("createdAt", "desc"));
            const quizSnap = await getDocs(quizQ);
            quizSnap.forEach(doc => {
                allQuizzes.push({
                    id: doc.id,
                    courseId: course.id,      // Need this for links
                    courseTitle: course.title, // Need this for display
                    ...doc.data()
                });
            });
        }
        setExistingQuizzes(allQuizzes);
      }
    };
    fetchData();
  }, [user]);

  // 2. Create the Quiz Wrapper
  const handleCreateQuiz = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCourseId) {
        alert("Please select a course first.");
        return;
    }
    setLoading(true);

    try {
      const quizRef = await addDoc(collection(db, "courses", selectedCourseId, "quizzes"), {
        title: quizTitle,
        duration: parseInt(duration.toString()),
        createdAt: new Date(),
        published: false,
        questions: []
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
    <div className="min-h-screen bg-slate-50 flex">
      {/* SIDEBAR */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:block p-6">
        <h2 className="font-bold text-lg mb-6">Faculty Panel</h2>
        <nav className="space-y-2">
            <Link href="/faculty/dashboard" className="block text-slate-600 hover:text-blue-600">My Classes</Link>
            <Link href="/faculty/doubts" className="block text-slate-600 hover:text-blue-600">Student Doubts</Link>
            <div className="block font-bold text-blue-700 bg-blue-50 px-3 py-2 rounded">Quiz Manager</div>
        </nav>
      </aside>

      <main className="flex-grow p-10 overflow-y-auto">
        <h1 className="text-3xl font-bold mb-8">Quiz Manager</h1>

        {/* --- CREATE SECTION --- */}
        <div className="bg-white p-8 rounded-xl shadow-sm border border-slate-200 mb-10">
            <h2 className="text-xl font-bold mb-4">Create New Quiz</h2>
            <form onSubmit={handleCreateQuiz} className="grid md:grid-cols-4 gap-4 items-end">
                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Select Course</label>
                    <select 
                        required
                        className="w-full border p-2 rounded-lg bg-white"
                        value={selectedCourseId}
                        onChange={(e) => setSelectedCourseId(e.target.value)}
                    >
                        <option value="">-- Select --</option>
                        {myCourses.map(c => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Quiz Title</label>
                    <input 
                        type="text" required placeholder="e.g. Unit Test 1"
                        className="w-full border p-2 rounded-lg"
                        value={quizTitle} onChange={(e) => setQuizTitle(e.target.value)}
                    />
                </div>
                <div className="col-span-1">
                    <label className="block text-sm font-medium mb-1">Duration (Mins)</label>
                    <input 
                        type="number" required min="5"
                        className="w-full border p-2 rounded-lg"
                        value={duration} onChange={(e) => setDuration(parseInt(e.target.value))}
                    />
                </div>
                <div className="col-span-1">
                    <button disabled={loading} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700">
                        {loading ? "..." : "+ Create"}
                    </button>
                </div>
            </form>
        </div>

        {/* --- LIST SECTION (Updated for Step 3.1) --- */}
        <h2 className="text-xl font-bold mb-4">Your Existing Quizzes</h2>
        
        {existingQuizzes.length === 0 ? (
            <p className="text-slate-500 italic">No quizzes created yet.</p>
        ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-sm">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 text-xs uppercase text-slate-500 font-semibold">
                        <tr>
                            <th className="p-4">Quiz Title</th>
                            <th className="p-4">Course</th>
                            <th className="p-4">Status</th>
                            <th className="p-4 text-right">Actions</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {existingQuizzes.map((quiz) => (
                            <tr key={quiz.id} className="hover:bg-slate-50 transition">
                                <td className="p-4 font-medium text-slate-900">{quiz.title}</td>
                                <td className="p-4 text-sm text-slate-500">{quiz.courseTitle}</td>
                                <td className="p-4">
                                    {quiz.published ? (
                                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-bold">Published</span>
                                    ) : (
                                        <span className="bg-yellow-100 text-yellow-700 px-2 py-1 rounded text-xs font-bold">Draft</span>
                                    )}
                                </td>
                                <td className="p-4 flex gap-3 justify-end">
                                    {/* 1. Edit Button */}
                                    <Link href={`/faculty/quizzes/${quiz.courseId}/${quiz.id}`}>
                                        <button className="text-blue-600 hover:underline text-sm font-medium">Edit Questions</button>
                                    </Link>
                                    
                                    {/* 2. THE VIEW RESULTS BUTTON (Step 3.1) */}
                                    <Link href={`/faculty/quizzes/results/${quiz.courseId}/${quiz.id}`}>
                                        <button className="text-purple-600 hover:underline text-sm font-bold ml-2">
                                            📊 View Results
                                        </button>
                                    </Link>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        )}

      </main>
    </div>
  );
}