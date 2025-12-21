"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { db } from "@/lib/firebase";
import { collection, getDocs, orderBy, query } from "firebase/firestore";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function MyResults() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [results, setResults] = useState<any[]>([]);

  useEffect(() => {
    if (!loading && !user) router.push("/login");
    
    const fetchResults = async () => {
      if (user?.uid) {
        // Fetch from the user's personal results subcollection
        const q = query(collection(db, "users", user.uid, "results"), orderBy("date", "desc"));
        const snap = await getDocs(q);
        const list: any[] = [];
        snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
        setResults(list);
      }
    };
    fetchResults();
  }, [user, loading, router]);

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      <Link href="/dashboard" className="text-slate-500 hover:text-blue-600 mb-4 inline-block">&larr; Back to Dashboard</Link>
      <h1 className="text-3xl font-bold text-slate-900 mb-8">My Performance Report</h1>

      {results.length === 0 ? (
        <div className="bg-white p-10 rounded-xl shadow-sm text-center">
            <p className="text-slate-500">No tests taken yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
            {results.map((res) => (
                <div key={res.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 flex justify-between items-center">
                    <div>
                        <h3 className="font-bold text-lg text-slate-900">{res.quizTitle}</h3>
                        <p className="text-xs text-slate-500">
                             {res.date?.seconds ? new Date(res.date.seconds * 1000).toLocaleDateString() : 'Just now'}
                        </p>
                    </div>
                    <div className="text-right">
                        <span className={`text-2xl font-bold ${res.score >= 40 ? 'text-green-600' : 'text-red-600'}`}>
                            {res.score.toFixed(0)}%
                        </span>
                        <p className="text-xs text-slate-400 uppercase font-bold">{res.score >= 40 ? 'Passed' : 'Failed'}</p>
                    </div>
                </div>
            ))}
        </div>
      )}
    </div>
  );
}