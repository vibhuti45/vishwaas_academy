"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, orderBy, query, serverTimestamp, deleteDoc, doc } from "firebase/firestore";
import Link from "next/link";

export default function AdminAnnouncements() {
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState<any[]>([]);
  const [courses, setCourses] = useState<any[]>([]);

  // Form State
  const [title, setTitle] = useState("");
  const [message, setMessage] = useState("");
  const [targetType, setTargetType] = useState("all"); // 'all' or 'course'
  const [selectedCourseId, setSelectedCourseId] = useState("");

  // 1. Fetch History & Courses
  useEffect(() => {
    const init = async () => {
      // A. Fetch Past Announcements
      const q = query(collection(db, "announcements"), orderBy("createdAt", "desc"));
      const snap = await getDocs(q);
      setHistory(snap.docs.map(d => ({ id: d.id, ...d.data() })));

      // B. Fetch Courses (for dropdown)
      const cSnap = await getDocs(collection(db, "courses"));
      setCourses(cSnap.docs.map(d => ({ id: d.id, title: d.data().title })));
    };
    init();
  }, []);

  // 2. Send Announcement
  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !message) return alert("Please fill all fields");
    if (targetType === "course" && !selectedCourseId) return alert("Select a course");

    setLoading(true);
    try {
      // We save specific details so the frontend knows who to show it to
      const newAnnouncement = {
        title,
        message,
        targetType, // 'all' or 'course'
        targetCourseId: targetType === 'course' ? selectedCourseId : null,
        targetCourseName: targetType === 'course' ? courses.find(c => c.id === selectedCourseId)?.title : "General",
        createdAt: serverTimestamp(),
        createdBy: "Admin"
      };

      const ref = await addDoc(collection(db, "announcements"), newAnnouncement);
      
      // Update UI immediately
      setHistory([{ id: ref.id, ...newAnnouncement, createdAt: new Date() }, ...history]);
      
      // Reset Form
      setTitle("");
      setMessage("");
      setTargetType("all");
      alert("📢 Announcement Broadcasted!");

    } catch (error) {
      console.error(error);
      alert("Failed to send.");
    } finally {
      setLoading(false);
    }
  };

  // 3. Delete Announcement
  const handleDelete = async (id: string) => {
    if(!confirm("Delete this announcement?")) return;
    await deleteDoc(doc(db, "announcements", id));
    setHistory(history.filter(h => h.id !== id));
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex justify-center">
      <div className="max-w-4xl w-full">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">📢 Announcement Center</h1>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white">✕ Close</Link>
        </div>

        {/* --- COMPOSE BOX --- */}
        <div className="bg-slate-800 p-6 rounded-xl border border-slate-700 mb-10 shadow-lg">
            <h2 className="font-bold text-lg mb-4 text-blue-400">Compose New Broadcast</h2>
            <form onSubmit={handleSend} className="space-y-4">
                
                <div className="grid md:grid-cols-2 gap-4">
                    <div>
                        <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Title</label>
                        <input 
                            type="text" required 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 outline-none focus:border-blue-500"
                            placeholder="e.g. Exam Schedule Update"
                            value={title} onChange={e => setTitle(e.target.value)}
                        />
                    </div>
                    <div>
                        <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Target Audience</label>
                        <select 
                            className="w-full bg-slate-900 border border-slate-600 rounded p-2 outline-none focus:border-blue-500"
                            value={targetType} onChange={e => setTargetType(e.target.value)}
                        >
                            <option value="all">🌍 All Students (General)</option>
                            <option value="course">📚 Specific Course Batch</option>
                        </select>
                    </div>
                </div>

                {targetType === "course" && (
                    <div className="animate-in slide-in-from-top-2">
                        <label className="block text-xs uppercase font-bold text-blue-400 mb-1">Select Course</label>
                        <select 
                            className="w-full bg-slate-900 border border-blue-500 rounded p-2 outline-none"
                            value={selectedCourseId} onChange={e => setSelectedCourseId(e.target.value)}
                        >
                            <option value="">-- Choose Course --</option>
                            {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                        </select>
                    </div>
                )}

                <div>
                    <label className="block text-xs uppercase font-bold text-slate-500 mb-1">Message</label>
                    <textarea 
                        required rows={3}
                        className="w-full bg-slate-900 border border-slate-600 rounded p-2 outline-none focus:border-blue-500"
                        placeholder="Type your announcement here..."
                        value={message} onChange={e => setMessage(e.target.value)}
                    />
                </div>

                <button disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 py-3 rounded font-bold shadow-lg transition disabled:opacity-50">
                    {loading ? "Sending..." : "🚀 Broadcast Announcement"}
                </button>
            </form>
        </div>

        {/* --- HISTORY LIST --- */}
        <h3 className="text-xl font-bold mb-4">Previous Broadcasts</h3>
        <div className="space-y-4">
            {history.length === 0 ? (
                <p className="text-slate-500 italic">No announcements sent yet.</p>
            ) : (
                history.map((item) => (
                    <div key={item.id} className="bg-slate-800 p-4 rounded-lg border border-slate-700 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-1">
                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${item.targetType === 'all' ? 'bg-purple-900 text-purple-200' : 'bg-blue-900 text-blue-200'}`}>
                                    {item.targetType === 'all' ? "General" : "Course"}
                                </span>
                                {item.targetType === 'course' && <span className="text-xs text-slate-400">({item.targetCourseName})</span>}
                                <span className="text-xs text-slate-500">• {item.createdAt?.seconds ? new Date(item.createdAt.seconds * 1000).toLocaleDateString() : "Just now"}</span>
                            </div>
                            <h4 className="font-bold text-white">{item.title}</h4>
                            <p className="text-sm text-slate-400 mt-1">{item.message}</p>
                        </div>
                        <button onClick={() => handleDelete(item.id)} className="text-slate-600 hover:text-red-500 font-bold px-2">×</button>
                    </div>
                ))
            )}
        </div>

      </div>
    </div>
  );
}