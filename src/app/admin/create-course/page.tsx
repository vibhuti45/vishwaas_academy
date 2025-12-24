"use client";
import { useState, useEffect } from "react";
import { db } from "@/lib/firebase";
import { collection, addDoc, getDocs, query, where, serverTimestamp } from "firebase/firestore";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateCourse() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // --- FORM STATE ---
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [grade, setGrade] = useState("Class 10");
  const [thumbnail, setThumbnail] = useState("");
  
  // Multi-Select States
  const [selectedSubjects, setSelectedSubjects] = useState<string[]>([]);
  const [currentSubject, setCurrentSubject] = useState("Math"); // Temp holder for dropdown selection

  const [selectedFacultyIds, setSelectedFacultyIds] = useState<string[]>([]);
  const [currentFacultyId, setCurrentFacultyId] = useState(""); // Temp holder for dropdown selection

  // Data Source
  const [allFaculty, setAllFaculty] = useState<any[]>([]);

  // --- OPTIONS ---
  const gradeOptions = [
    "Class 6", "Class 7", "Class 8", "Class 9", "Class 10",
    "Class 11 (JEE)", "Class 11 (NEET)",
    "Class 12 (JEE)", "Class 12 (NEET)"
  ];

  const subjectOptions = [
    "Math", "Science", "Social Science", "English",
    "Physics", "Chemistry", "Biology", "Computer Science",
    "History", "Geography", "Economics"
  ];

  // --- FETCH FACULTY ON LOAD ---
  useEffect(() => {
    const fetchFaculty = async () => {
      const q = query(collection(db, "users"), where("role", "==", "faculty"));
      const snap = await getDocs(q);
      const list: any[] = [];
      snap.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setAllFaculty(list);
    };
    fetchFaculty();
  }, []);

  // --- HANDLERS ---

  // 1. Add/Remove Subject
  const handleAddSubject = () => {
    if (!selectedSubjects.includes(currentSubject)) {
      setSelectedSubjects([...selectedSubjects, currentSubject]);
    }
  };
  const handleRemoveSubject = (sub: string) => {
    setSelectedSubjects(selectedSubjects.filter(s => s !== sub));
  };

  // 2. Add/Remove Faculty
  const handleAddFaculty = () => {
    if (currentFacultyId && !selectedFacultyIds.includes(currentFacultyId)) {
      setSelectedFacultyIds([...selectedFacultyIds, currentFacultyId]);
      setCurrentFacultyId("");
    }
  };
  const handleRemoveFaculty = (id: string) => {
    setSelectedFacultyIds(selectedFacultyIds.filter(f => f !== id));
  };

  // 3. Submit
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedSubjects.length === 0) {
        alert("Please select at least one subject.");
        return;
    }
    
    setLoading(true);
    try {
      await addDoc(collection(db, "courses"), {
        title,
        description,
        grade,
        thumbnail: thumbnail || "https://placehold.co/600x400/png",
        
        // SAVE ARRAYS (New Structure)
        subjects: selectedSubjects, 
        subject: selectedSubjects[0], // Keep primary subject for backward compatibility
        
        assignedFacultyIds: selectedFacultyIds,
        assignedFacultyId: selectedFacultyIds.length > 0 ? selectedFacultyIds[0] : null, // Backward compatibility

        createdAt: serverTimestamp(),
        published: true,
        studentsEnrolled: []
      });

      alert("✅ Course Created Successfully!");
      router.push("/admin/dashboard");

    } catch (error) {
      console.error("Error creating course:", error);
      alert("Failed to create course.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-900 text-white flex items-center justify-center p-6">
      <div className="max-w-3xl w-full bg-slate-800 p-8 rounded-xl border border-slate-700 shadow-2xl">
        
        <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold">Create New Course</h1>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white text-sm">Cancel</Link>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Title & Grade */}
            <div className="grid md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Course Title</label>
                    <input required type="text" className="w-full bg-slate-900 border border-slate-600 rounded p-3 outline-none focus:border-blue-500" 
                        placeholder="e.g. Master Algebra" value={title} onChange={e => setTitle(e.target.value)} />
                </div>
                <div>
                    <label className="block text-xs uppercase font-bold text-blue-400 mb-1">Target Grade</label>
                    <select className="w-full bg-slate-900 border border-slate-600 rounded p-3 outline-none" 
                        value={grade} onChange={e => setGrade(e.target.value)}>
                        {gradeOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                </div>
            </div>

            {/* Description */}
            <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Description</label>
                <textarea required rows={3} className="w-full bg-slate-900 border border-slate-600 rounded p-3 outline-none focus:border-blue-500" 
                    placeholder="What will students learn?" value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            {/* Thumbnail */}
            <div>
                <label className="block text-xs uppercase font-bold text-slate-400 mb-1">Thumbnail URL (Optional)</label>
                <input type="url" className="w-full bg-slate-900 border border-slate-600 rounded p-3 outline-none focus:border-blue-500" 
                    placeholder="https://..." value={thumbnail} onChange={e => setThumbnail(e.target.value)} />
            </div>

            <hr className="border-slate-700" />

            {/* --- MULTI-SELECT SUBJECTS --- */}
            <div>
                <label className="block text-xs uppercase font-bold text-green-400 mb-2">Select Subjects (Multi-select)</label>
                <div className="flex gap-2 mb-3">
                    <select className="flex-grow bg-slate-900 border border-slate-600 rounded p-3 outline-none" 
                        value={currentSubject} onChange={e => setCurrentSubject(e.target.value)}>
                        {subjectOptions.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                    </select>
                    <button type="button" onClick={handleAddSubject} className="bg-green-600 hover:bg-green-500 px-4 rounded font-bold text-sm">
                        + Add
                    </button>
                </div>
                {/* Selected Tags Display */}
                <div className="flex flex-wrap gap-2">
                    {selectedSubjects.map(sub => (
                        <span key={sub} className="bg-green-900/30 text-green-300 border border-green-900/50 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                            {sub}
                            <button type="button" onClick={() => handleRemoveSubject(sub)} className="hover:text-white font-bold px-1">×</button>
                        </span>
                    ))}
                    {selectedSubjects.length === 0 && <span className="text-slate-500 text-sm italic">No subjects selected.</span>}
                </div>
            </div>

            {/* --- MULTI-SELECT FACULTY --- */}
            <div>
                <label className="block text-xs uppercase font-bold text-purple-400 mb-2">Assign Teachers (Multi-select)</label>
                <div className="flex gap-2 mb-3">
                    <select className="flex-grow bg-slate-900 border border-slate-600 rounded p-3 outline-none" 
                        value={currentFacultyId} onChange={e => setCurrentFacultyId(e.target.value)}>
                        <option value="">-- Select Faculty --</option>
                        {allFaculty.map(f => <option key={f.id} value={f.id}>{f.name} ({f.department})</option>)}
                    </select>
                    <button type="button" onClick={handleAddFaculty} disabled={!currentFacultyId} className="bg-purple-600 hover:bg-purple-500 px-4 rounded font-bold text-sm disabled:opacity-50">
                        + Add
                    </button>
                </div>
                {/* Selected Tags Display */}
                <div className="flex flex-wrap gap-2">
                    {selectedFacultyIds.map(id => {
                        const fac = allFaculty.find(f => f.id === id);
                        return (
                            <span key={id} className="bg-purple-900/30 text-purple-300 border border-purple-900/50 px-3 py-1 rounded-full text-sm flex items-center gap-2">
                                {fac?.name || "Unknown"}
                                <button type="button" onClick={() => handleRemoveFaculty(id)} className="hover:text-white font-bold px-1">×</button>
                            </span>
                        );
                    })}
                    {selectedFacultyIds.length === 0 && <span className="text-slate-500 text-sm italic">No teachers assigned yet.</span>}
                </div>
            </div>

            <button type="submit" disabled={loading} className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-lg shadow-lg mt-4 disabled:opacity-50">
                {loading ? "Creating..." : "🚀 Launch Course"}
            </button>

        </form>
      </div>
    </div>
  );
}