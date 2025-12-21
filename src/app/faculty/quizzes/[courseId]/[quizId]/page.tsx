"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Link from "next/link";

export default function QuizEditor({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Form State for ONE question
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]); // 4 Options
  const [correctIdx, setCorrectIdx] = useState(0); // 0, 1, 2, or 3

  // 1. Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      const docRef = doc(db, "courses", courseId, "quizzes", quizId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        setQuiz(snap.data());
        setQuestions(snap.data().questions || []);
      }
    };
    fetchQuiz();
  }, [courseId, quizId]);

  // 2. Add Question to List
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => o.trim() === "")) {
        alert("Please fill all 4 options.");
        return;
    }

    const newQuestion = {
        id: Date.now().toString(), // Simple ID
        question: qText,
        options: options,
        correctAnswer: correctIdx
    };

    try {
        const docRef = doc(db, "courses", courseId, "quizzes", quizId);
        
        // Save to Firebase
        await updateDoc(docRef, {
            questions: arrayUnion(newQuestion)
        });

        // Update Local State
        setQuestions([...questions, newQuestion]);
        
        // Reset Form
        setQText("");
        setOptions(["", "", "", ""]);
        setCorrectIdx(0);
        
    } catch (error) {
        console.error("Error adding question:", error);
    }
  };

  const handlePublish = async () => {
    if (confirm("Are you sure? Students will be able to see this quiz immediately.")) {
        await updateDoc(doc(db, "courses", courseId, "quizzes", quizId), { published: true });
        alert("Quiz Published! 🚀");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-10">
      
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <div>
            <Link href="/faculty/quizzes" className="text-sm text-slate-500 hover:underline">&larr; Back to Quiz Manager</Link>
            <h1 className="text-3xl font-bold mt-1">{quiz?.title || "Loading..."}</h1>
            <p className="text-slate-500">Add questions to your quiz</p>
        </div>
        <button onClick={handlePublish} className="bg-green-600 text-white px-6 py-3 rounded-lg font-bold hover:bg-green-500 transition">
            ✅ Publish Quiz
        </button>
      </div>

      <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-8">
        
        {/* LEFT: Add Question Form */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
            <h2 className="font-bold text-lg mb-4">Add New Question</h2>
            <form onSubmit={handleAddQuestion} className="space-y-4">
                
                <div>
                    <label className="block text-sm font-bold text-slate-700 mb-1">Question Text</label>
                    <textarea 
                        required
                        className="w-full border p-2 rounded focus:border-blue-500 outline-none"
                        rows={3}
                        value={qText}
                        onChange={(e) => setQText(e.target.value)}
                        placeholder="e.g. What is the value of Pi?"
                    ></textarea>
                </div>

                <div className="space-y-2">
                    <label className="block text-sm font-bold text-slate-700">Options</label>
                    {options.map((opt, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                            <input 
                                type="radio" 
                                name="correct" 
                                checked={correctIdx === idx} 
                                onChange={() => setCorrectIdx(idx)}
                                className="w-4 h-4"
                            />
                            <input 
                                type="text"
                                required
                                className={`flex-grow border p-2 rounded text-sm ${correctIdx === idx ? 'border-green-500 bg-green-50' : ''}`}
                                placeholder={`Option ${idx + 1}`}
                                value={opt}
                                onChange={(e) => {
                                    const newOpts = [...options];
                                    newOpts[idx] = e.target.value;
                                    setOptions(newOpts);
                                }}
                            />
                        </div>
                    ))}
                    <p className="text-xs text-slate-400">* Select the radio button next to the correct answer.</p>
                </div>

                <button type="submit" className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700">
                    + Add Question
                </button>
            </form>
        </div>

        {/* RIGHT: Preview List */}
        <div className="space-y-4">
            {questions.length === 0 && (
                <div className="text-center p-10 border-2 border-dashed border-slate-300 rounded-xl text-slate-400">
                    No questions added yet.
                </div>
            )}
            
            {questions.map((q, i) => (
                <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 relative group">
                    <span className="absolute top-4 right-4 text-slate-300 font-bold text-4xl opacity-20">#{i + 1}</span>
                    <h3 className="font-bold text-slate-900 mb-3 pr-8">{q.question}</h3>
                    <div className="grid grid-cols-2 gap-2">
                        {q.options.map((opt: string, optIdx: number) => (
                            <div key={optIdx} className={`text-sm p-2 rounded border ${q.correctAnswer === optIdx ? 'bg-green-100 border-green-300 text-green-800 font-bold' : 'bg-slate-50 border-slate-100 text-slate-600'}`}>
                                {opt}
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>

      </div>
    </div>
  );
}