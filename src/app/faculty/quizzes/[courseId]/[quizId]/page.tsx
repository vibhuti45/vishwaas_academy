"use client";
import { useEffect, useState, use } from "react";
import { db } from "@/lib/firebase";
import { doc, getDoc, updateDoc, arrayUnion } from "firebase/firestore";
import Link from "next/link";

export default function QuizEditor({ params }: { params: Promise<{ courseId: string; quizId: string }> }) {
  const { courseId, quizId } = use(params);
  
  const [quiz, setQuiz] = useState<any>(null);
  const [questions, setQuestions] = useState<any[]>([]);
  
  // Scoring Configuration State
  const [marksPerQuestion, setMarksPerQuestion] = useState(1);
  const [negativeMarks, setNegativeMarks] = useState(0);

  // Form State for ONE question
  const [qText, setQText] = useState("");
  const [options, setOptions] = useState(["", "", "", ""]); 
  const [correctIdx, setCorrectIdx] = useState(0);

  // 1. Fetch Quiz Data
  useEffect(() => {
    const fetchQuiz = async () => {
      const docRef = doc(db, "courses", courseId, "quizzes", quizId);
      const snap = await getDoc(docRef);
      if (snap.exists()) {
        const data = snap.data();
        setQuiz(data);
        setQuestions(data.questions || []);
        
        // Load Marks Config (Default to +1 / 0 if not set)
        if (data.marksPerQuestion !== undefined) setMarksPerQuestion(data.marksPerQuestion);
        if (data.negativeMarks !== undefined) setNegativeMarks(data.negativeMarks);
      }
    };
    fetchQuiz();
  }, [courseId, quizId]);

  // 2. Save Marking Scheme
  const handleSaveSettings = async () => {
    try {
        const docRef = doc(db, "courses", courseId, "quizzes", quizId);
        await updateDoc(docRef, {
            marksPerQuestion: Number(marksPerQuestion),
            negativeMarks: Number(negativeMarks)
        });
        alert("⚙️ Marking Scheme Saved!");
    } catch (error) {
        console.error("Error saving settings:", error);
    }
  };

  // 3. Add Question to List
  const handleAddQuestion = async (e: React.FormEvent) => {
    e.preventDefault();
    if (options.some(o => o.trim() === "")) {
        alert("Please fill all 4 options.");
        return;
    }

    const newQuestion = {
        id: Date.now().toString(),
        text: qText,           // Standardized key name for Student View
        options: options,
        correctOption: correctIdx // Standardized key name for Student View
    };

    try {
        const docRef = doc(db, "courses", courseId, "quizzes", quizId);
        
        await updateDoc(docRef, {
            questions: arrayUnion(newQuestion)
        });

        setQuestions([...questions, newQuestion]);
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
    <div className="min-h-screen bg-slate-50 p-10 font-sans text-slate-900">
      
      {/* HEADER */}
      <div className="max-w-5xl mx-auto mb-6 flex justify-between items-center">
        <div>
            <Link href="/faculty/quizzes" className="text-sm text-slate-500 hover:underline">&larr; Back to Quiz Manager</Link>
            <h1 className="text-3xl font-bold mt-1">{quiz?.title || "Loading..."}</h1>
            <p className="text-slate-500">Configure settings & add questions</p>
        </div>
        <button onClick={handlePublish} className={`px-6 py-3 rounded-lg font-bold transition text-white ${quiz?.published ? 'bg-green-600 hover:bg-green-500' : 'bg-slate-800 hover:bg-slate-700'}`}>
            {quiz?.published ? "✅ Published" : "🚀 Publish Quiz"}
        </button>
      </div>

      <div className="max-w-5xl mx-auto space-y-8">
        
        {/* --- 1. MARKING SCHEME PANEL --- */}
        <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h2 className="font-bold text-lg mb-4 flex items-center gap-2">
                <span>⚙️</span> Marking Scheme
            </h2>
            <div className="flex flex-wrap items-end gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Marks for Correct (+)</label>
                    <input 
                        type="number" 
                        min="1"
                        className="border border-slate-300 p-2 rounded w-32 focus:border-blue-500 outline-none" 
                        value={marksPerQuestion} 
                        onChange={e => setMarksPerQuestion(Number(e.target.value))} 
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Negative Marks (-)</label>
                    <input 
                        type="number" 
                        step="0.25"
                        min="0"
                        className="border border-slate-300 p-2 rounded w-32 focus:border-red-500 outline-none" 
                        value={negativeMarks} 
                        onChange={e => setNegativeMarks(Number(e.target.value))} 
                    />
                </div>
                <button onClick={handleSaveSettings} className="bg-blue-600 text-white px-5 py-2 rounded font-bold hover:bg-blue-500 transition">
                    Save Configuration
                </button>
            </div>
            <p className="text-xs text-slate-400 mt-2">
                * Example: For JEE style, set Correct = 4 and Negative = 1.
            </p>
        </div>

        {/* --- 2. EDITOR AREA --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* LEFT: Add Question Form */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 h-fit">
                <h2 className="font-bold text-lg mb-4">Add New Question</h2>
                <form onSubmit={handleAddQuestion} className="space-y-4">
                    
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-1">Question Text</label>
                        <textarea 
                            required
                            className="w-full border p-2 rounded focus:border-blue-500 outline-none bg-slate-50"
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
                                    className="w-4 h-4 accent-green-600"
                                />
                                <input 
                                    type="text"
                                    required
                                    className={`flex-grow border p-2 rounded text-sm outline-none transition ${correctIdx === idx ? 'border-green-500 bg-green-50 ring-1 ring-green-200' : 'border-slate-300'}`}
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

                    <button type="submit" className="w-full bg-slate-900 text-white font-bold py-3 rounded-lg hover:bg-slate-800 transition">
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
                    <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 relative group shadow-sm hover:shadow-md transition">
                        <span className="absolute top-4 right-4 text-slate-200 font-bold text-4xl select-none">#{i + 1}</span>
                        {/* Support old 'question' key or new 'text' key for backward compatibility */}
                        <h3 className="font-bold text-slate-900 mb-3 pr-8">{q.text || q.question}</h3>
                        <div className="grid grid-cols-2 gap-2">
                            {q.options.map((opt: string, optIdx: number) => {
                                // Support old 'correctAnswer' key or new 'correctOption' key
                                const isCorrect = (q.correctOption !== undefined ? q.correctOption : q.correctAnswer) === optIdx;
                                return (
                                    <div key={optIdx} className={`text-sm p-2 rounded border ${isCorrect ? 'bg-green-100 border-green-300 text-green-900 font-bold' : 'bg-slate-50 border-slate-100 text-slate-500'}`}>
                                        {opt} {isCorrect && "✅"}
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                ))}
            </div>

        </div>
      </div>
    </div>
  );
}