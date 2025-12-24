"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query, doc, getDoc } from "firebase/firestore";
import Link from "next/link";

export default function QuizResults({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  
  const [submissions, setSubmissions] = useState<any[]>([]);
  const [quizTitle, setQuizTitle] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1. Get Quiz Details (for the Title)
        const quizSnap = await getDoc(doc(db, "courses", courseId, "quizzes", quizId));
        if (quizSnap.exists()) {
            setQuizTitle(quizSnap.data().title);
        }

        // 2. Get Submissions (Sorted by Score High -> Low)
        // We use the new 'submissions' collection where detailed data is saved
        const q = query(collection(db, "courses", courseId, "quizzes", quizId, "submissions"), orderBy("score", "desc"));
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setSubmissions(list);
      } catch (error) {
        console.error("Error fetching results:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [courseId, quizId]);

  if (loading) return <div className="p-10 text-slate-500">Loading results...</div>;

  return (
    <div className="min-h-screen bg-slate-50 p-10 font-sans">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto mb-8">
        <Link href="/faculty/quizzes" className="text-slate-500 hover:text-blue-600 mb-2 inline-block text-sm">&larr; Back to Quiz Manager</Link>
        <div className="flex justify-between items-end">
            <div>
                <h1 className="text-3xl font-bold text-slate-900">Quiz Results</h1>
                <p className="text-slate-500 mt-1">Report for: <span className="font-bold text-slate-700">{quizTitle}</span></p>
            </div>
            <div className="bg-white px-4 py-2 rounded border border-slate-200 text-sm font-bold text-slate-600 shadow-sm">
                Total Attempts: {submissions.length}
            </div>
        </div>
      </div>

      {/* RESULTS TABLE */}
      <div className="max-w-6xl mx-auto bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left border-collapse">
            <thead className="bg-slate-100 text-slate-500 uppercase text-xs font-bold">
                <tr>
                    <th className="p-4 w-16">Rank</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4 text-center text-green-600">Correct</th>
                    <th className="p-4 text-center text-red-600">Wrong</th>
                    <th className="p-4 text-right">Marks Obtained</th>
                    <th className="p-4 text-right">Percentage</th>
                    <th className="p-4 text-right">Date</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-sm">
                {submissions.length === 0 ? (
                    <tr>
                        <td colSpan={7} className="p-10 text-center text-slate-400 italic">
                            No students have attempted this quiz yet.
                        </td>
                    </tr>
                ) : (
                    submissions.map((sub, index) => (
                        <tr key={sub.id} className="hover:bg-slate-50 transition">
                            <td className="p-4 text-slate-400 font-mono">#{index + 1}</td>
                            <td className="p-4">
                                <div className="font-bold text-slate-900">{sub.studentName}</div>
                                <div className="text-xs text-slate-500">{sub.studentEmail}</div>
                            </td>
                            
                            {/* Correct Count */}
                            <td className="p-4 text-center">
                                <span className="bg-green-100 text-green-700 font-bold px-2 py-1 rounded">
                                    {sub.correctCount}
                                </span>
                            </td>
                            
                            {/* Wrong Count */}
                            <td className="p-4 text-center">
                                <span className="bg-red-100 text-red-700 font-bold px-2 py-1 rounded">
                                    {sub.wrongCount}
                                </span>
                            </td>

                            {/* Total Marks */}
                            <td className="p-4 text-right font-bold text-blue-600">
                                {sub.score} <span className="text-slate-400 text-xs font-normal">/ {sub.maxScore}</span>
                            </td>

                            {/* Percentage Badge */}
                            <td className="p-4 text-right">
                                <span className={`px-2 py-1 rounded text-xs font-bold border ${
                                    Number(sub.percentage) >= 75 ? 'bg-green-50 text-green-700 border-green-200' : 
                                    Number(sub.percentage) >= 40 ? 'bg-yellow-50 text-yellow-700 border-yellow-200' : 
                                    'bg-red-50 text-red-700 border-red-200'
                                }`}>
                                    {sub.percentage}%
                                </span>
                            </td>

                            <td className="p-4 text-right text-slate-500 text-xs">
                                {sub.submittedAt ? new Date(sub.submittedAt.seconds * 1000).toLocaleDateString() : "-"}
                            </td>
                        </tr>
                    ))
                )}
            </tbody>
        </table>
      </div>
    </div>
  );
}