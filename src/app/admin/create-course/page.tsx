"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [facultyList, setFacultyList] = useState<any[]>([]);
  
  // Form State
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    grade: "Class 10",
    subject: "Mathematics",
    assignedFacultyId: "", // We will store the UID of the teacher
    thumbnail: "https://placehold.co/600x400/png", // Default placeholder image
  });

  // 1. Fetch Faculty Members for the Dropdown
  useEffect(() => {
    const fetchFaculty = async () => {
      // Query: Find users where role == 'faculty'
      const q = query(collection(db, "users"), where("role", "==", "faculty"));
      const querySnapshot = await getDocs(q);
      
      const teachers: any[] = [];
      querySnapshot.forEach((doc) => {
        teachers.push({ id: doc.id, ...doc.data() });
      });
      setFacultyList(teachers);
    };

    fetchFaculty();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // 2. Add Course to "courses" collection
      await addDoc(collection(db, "courses"), {
        title: formData.title,
        description: formData.description,
        grade: formData.grade,
        subject: formData.subject,
        assignedFacultyId: formData.assignedFacultyId, 
        thumbnail: formData.thumbnail,
        createdAt: new Date(),
        studentsEnrolled: [] // Start with 0 students
      });

      alert("Course Created Successfully! 🎉");
      router.push("/admin/dashboard");
    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white p-10 flex justify-center">
      <div className="max-w-2xl w-full">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-3xl font-bold">Create New Course</h1>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white">
                ✕ Cancel
            </Link>
        </div>

        <form onSubmit={handleSubmit} className="bg-slate-800 p-8 rounded-xl border border-slate-700 space-y-6">
            
            {/* Title */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Course Title</label>
                <input 
                    type="text" 
                    required 
                    placeholder="e.g. Master Algebra for Class 10"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, title: e.target.value})}
                />
            </div>

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Description</label>
                <textarea 
                    rows={3}
                    required 
                    placeholder="What will students learn?"
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                />
            </div>

            {/* Grade & Subject */}
            <div className="grid grid-cols-2 gap-6">
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Grade</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, grade: e.target.value})}
                        value={formData.grade}
                    >
                        <option>Class 9</option>
                        <option>Class 10</option>
                        <option>Class 11 (Science)</option>
                        <option>Class 12 (Science)</option>
                    </select>
                </div>
                <div>
                    <label className="block text-sm font-medium text-slate-400 mb-2">Subject</label>
                    <select 
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                        onChange={(e) => setFormData({...formData, subject: e.target.value})}
                        value={formData.subject}
                    >
                        <option>Mathematics</option>
                        <option>Physics</option>
                        <option>Chemistry</option>
                        <option>Biology</option>
                        <option>English</option>
                    </select>
                </div>
            </div>

            {/* Assign Faculty */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Assign Teacher</label>
                <select 
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, assignedFacultyId: e.target.value})}
                    required
                >
                    <option value="">-- Select a Teacher --</option>
                    {facultyList.length === 0 ? (
                        <option disabled>No faculty found. Create one first!</option>
                    ) : (
                        facultyList.map((teacher) => (
                            <option key={teacher.id} value={teacher.id}>
                                {teacher.name || teacher.email} ({teacher.department || "General"})
                            </option>
                        ))
                    )}
                </select>
                <p className="text-xs text-slate-500 mt-2">
                    * Only users with 'faculty' role appear here.
                </p>
            </div>

            {/* Thumbnail URL (Simple Text for now) */}
            <div>
                <label className="block text-sm font-medium text-slate-400 mb-2">Thumbnail Image URL</label>
                <input 
                    type="text" 
                    placeholder="https://example.com/image.png"
                    defaultValue={formData.thumbnail}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 outline-none"
                    onChange={(e) => setFormData({...formData, thumbnail: e.target.value})}
                />
            </div>

            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg transition disabled:opacity-50"
            >
                {loading ? "Creating..." : "🚀 Launch Course"}
            </button>

        </form>
      </div>
    </div>
  );
}