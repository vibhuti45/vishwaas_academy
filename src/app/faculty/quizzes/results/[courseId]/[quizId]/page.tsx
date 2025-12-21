"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";

export default function QuizResults({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    const fetchResults = async () => {
      // Query the specific quiz's results subcollection
      const q = query(collection(db, "courses", courseId, "quizzes", quizId, "results"), orderBy("score", "desc"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setResults(list);
    };
    fetchResults();
  }, [courseId, quizId]);

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <Link href="/faculty/quizzes" className="text-slate-500 hover:text-blue-600 mb-4 inline-block">&larr; Back to Quizzes</Link>
      <h1 className="text-3xl font-bold mb-6">Quiz Results</h1>

      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
        <table className="w-full text-left">
            <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                <tr>
                    <th className="p-4">Rank</th>
                    <th className="p-4">Student Name</th>
                    <th className="p-4">Email</th>
                    <th className="p-4">Score</th>
                </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
                {results.map((res, index) => (
                    <tr key={res.id}>
                        <td className="p-4 text-slate-400">#{index + 1}</td>
                        <td className="p-4 font-bold text-slate-900">{res.studentName}</td>
                        <td className="p-4 text-slate-500 text-sm">{res.studentEmail}</td>
                        <td className="p-4">
                            <span className={`px-2 py-1 rounded text-xs font-bold ${res.score >= 80 ? 'bg-green-100 text-green-700' : res.score >= 40 ? 'bg-yellow-100 text-yellow-700' : 'bg-red-100 text-red-700'}`}>
                                {res.score.toFixed(0)}%
                            </span>
                        </td>
                    </tr>
                ))}
            </tbody>
        </table>
      </div>
    </div>
  );
}