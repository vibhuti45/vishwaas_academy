"use client";
import { useEffect, useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore";
import { db } from "@/lib/firebase";
import Image from "next/image";
import Link from "next/link";

export default function FacultyDoubts() {
  const { user } = useAuth();
  const [doubts, setDoubts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [replyText, setReplyText] = useState("");
  const [activeDoubtId, setActiveDoubtId] = useState<string | null>(null);

  useEffect(() => {
    const fetchMyDoubts = async () => {
      if (!user) return;
      
      try {
        // 1. Get all courses assigned to this teacher
        const qCourses = query(collection(db, "courses"), where("assignedFacultyId", "==", user.uid));
        const courseSnap = await getDocs(qCourses);
        
        let allDoubts: any[] = [];

        // 2. Loop through each course and get its doubts
        // (Note: Firestore collection groups would be better for scaling, but this is fine for MVP)
        for (const courseDoc of courseSnap.docs) {
            const courseTitle = courseDoc.data().title;
            const qDoubts = query(collection(db, "courses", courseDoc.id, "doubts"), where("status", "==", "open"));
            const doubtSnap = await getDocs(qDoubts);
            
            doubtSnap.forEach(d => {
                allDoubts.push({
                    id: d.id,
                    courseId: courseDoc.id,
                    courseTitle: courseTitle,
                    ...d.data()
                });
            });
        }
        setDoubts(allDoubts);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchMyDoubts();
  }, [user]);

  const handleReply = async (courseId: string, doubtId: string) => {
    if (!replyText) return;
    
    try {
        const doubtRef = doc(db, "courses", courseId, "doubts", doubtId);
        await updateDoc(doubtRef, {
            reply: replyText,
            status: "resolved",
            repliedAt: new Date()
        });

        // Remove from list locally
        setDoubts(doubts.filter(d => d.id !== doubtId));
        setReplyText("");
        setActiveDoubtId(null);
        alert("Reply sent!");
    } catch (err) {
        console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Sidebar (Simplified) */}
      <aside className="w-64 bg-white border-r border-slate-200 hidden md:flex flex-col fixed h-full">
         <div className="p-6 border-b"><span className="font-bold">Faculty Panel</span></div>
         <nav className="p-4 space-y-2">
            <Link href="/faculty/dashboard" className="block px-4 py-3 text-slate-600 hover:bg-slate-50 rounded-lg">My Classes</Link>
            <div className="block px-4 py-3 bg-blue-50 text-blue-700 rounded-lg font-bold">Student Doubts</div>
         </nav>
      </aside>

      <main className="flex-grow md:ml-64 p-10">
        <h1 className="text-2xl font-bold mb-6">Pending Student Queries</h1>

        {loading ? <p>Loading queries...</p> : doubts.length === 0 ? (
            <div className="text-center py-20 bg-white rounded-xl border border-dashed">
                <span className="text-4xl">✅</span>
                <p className="mt-4 text-slate-500">All caught up! No pending doubts.</p>
            </div>
        ) : (
            <div className="grid gap-4">
                {doubts.map(doubt => (
                    <div key={doubt.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                        <div className="flex justify-between mb-2">
                            <span className="text-xs font-bold bg-blue-100 text-blue-700 px-2 py-1 rounded">{doubt.courseTitle}</span>
                            <span className="text-xs text-slate-400">Lesson: {doubt.lessonTitle}</span>
                        </div>
                        <h3 className="font-bold text-slate-900">{doubt.studentName} asks:</h3>
                        <p className="text-slate-600 my-2 italic">"{doubt.question}"</p>
                        
                        {activeDoubtId === doubt.id ? (
                            <div className="mt-4 animate-in fade-in">
                                <textarea 
                                    className="w-full border p-2 rounded mb-2" 
                                    rows={3}
                                    placeholder="Type your explanation here..."
                                    value={replyText}
                                    onChange={(e) => setReplyText(e.target.value)}
                                ></textarea>
                                <div className="flex gap-2">
                                    <button onClick={() => handleReply(doubt.courseId, doubt.id)} className="bg-green-600 text-white px-4 py-2 rounded text-sm font-bold">Send Reply</button>
                                    <button onClick={() => setActiveDoubtId(null)} className="text-slate-500 px-4 py-2 text-sm">Cancel</button>
                                </div>
                            </div>
                        ) : (
                            <button onClick={() => setActiveDoubtId(doubt.id)} className="mt-2 text-blue-600 font-semibold text-sm hover:underline">
                                ↩ Reply to Student
                            </button>
                        )}
                    </div>
                ))}
            </div>
        )}
      </main>
    </div>
  );
}