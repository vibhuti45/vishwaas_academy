"use client";
import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs, query, doc, deleteDoc } from "firebase/firestore";
import Link from "next/link";

export default function UserDirectory() {
  const [activeTab, setActiveTab] = useState("student"); 
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const q = query(collection(db, "users")); 
      const snapshot = await getDocs(q);
      const list: any[] = [];
      snapshot.forEach(doc => list.push({ id: doc.id, ...doc.data() }));
      setUsers(list);
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- DELETE USER FUNCTION ---
  const handleDeleteUser = async (userId: string, userName: string) => {
    const confirmDelete = window.confirm(`⚠️ DANGER: Are you sure you want to delete "${userName}"?\n\nThis action cannot be undone. The user will lose access immediately.`);
    
    if (confirmDelete) {
        try {
            await deleteDoc(doc(db, "users", userId));
            // Remove from local list to update UI instantly
            setUsers(users.filter(u => u.id !== userId));
            alert(`${userName} has been deleted.`);
        } catch (error) {
            console.error("Error deleting user:", error);
            alert("Failed to delete user.");
        }
    }
  };

  // --- FILTER LOGIC ---
  const filteredUsers = users.filter(user => {
    const userRole = (user.role || "").toLowerCase().trim(); 
    const targetRole = activeTab.toLowerCase().trim();
    const matchesRole = userRole === targetRole;
    
    const searchLower = searchTerm.toLowerCase();
    const nameMatch = (user.name || "").toLowerCase().includes(searchLower);
    const emailMatch = (user.email || "").toLowerCase().includes(searchLower);
    
    return matchesRole && (nameMatch || emailMatch);
  });

  const studentCount = users.filter(u => (u.role || "").toLowerCase().trim() === 'student').length;
  const facultyCount = users.filter(u => (u.role || "").toLowerCase().trim() === 'faculty').length;

  return (
    <div className="min-h-screen bg-slate-900 text-white p-8">
      
      {/* HEADER */}
      <div className="max-w-6xl mx-auto flex justify-between items-center mb-8">
        <div>
            <Link href="/admin/dashboard" className="text-slate-400 hover:text-white mb-2 inline-block text-sm">&larr; Back to Dashboard</Link>
            <h1 className="text-3xl font-bold">User Directory</h1>
        </div>
        <div className="flex gap-2">
            <input 
                type="text" 
                placeholder="Search..." 
                className="bg-slate-800 border border-slate-700 rounded-lg px-4 py-2 text-sm outline-none w-64 text-white"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
      </div>

      <div className="max-w-6xl mx-auto">
        
        {/* TABS */}
        <div className="flex gap-4 mb-6 border-b border-slate-800 pb-1">
            <button onClick={() => setActiveTab("student")} className={`pb-3 px-2 font-medium transition relative ${activeTab === 'student' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-200'}`}>
                Students ({studentCount})
                {activeTab === 'student' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-400"></span>}
            </button>
            <button onClick={() => setActiveTab("faculty")} className={`pb-3 px-2 font-medium transition relative ${activeTab === 'faculty' ? 'text-purple-400' : 'text-slate-400 hover:text-slate-200'}`}>
                Faculty ({facultyCount})
                {activeTab === 'faculty' && <span className="absolute bottom-0 left-0 w-full h-0.5 bg-purple-400"></span>}
            </button>
        </div>

        {/* LIST */}
        <div className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead className="bg-slate-900/50 text-xs uppercase text-slate-400 font-semibold">
                    <tr>
                        <th className="p-4">Name & Email</th>
                        <th className="p-4">{activeTab === 'student' ? 'Grade/Class' : 'Department'}</th>
                        <th className="p-4">Joined On</th>
                        <th className="p-4 text-right">Actions</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-700/50 text-sm">
                    {loading ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">Loading...</td></tr>
                    ) : filteredUsers.length === 0 ? (
                        <tr><td colSpan={4} className="p-8 text-center text-slate-500">No {activeTab}s found.</td></tr>
                    ) : (
                        filteredUsers.map((user) => (
                            <tr key={user.id} className="hover:bg-slate-700/30 transition">
                                <td className="p-4">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-lg flex-shrink-0 ${
                                            (user.role || "").toLowerCase().trim() === 'student' ? 'bg-blue-900 text-blue-300' : 'bg-purple-900 text-purple-300'
                                        }`}>
                                            {user.name ? user.name.charAt(0).toUpperCase() : '?'}
                                        </div>
                                        <div>
                                            <p className="font-bold text-white">{user.name || "Unnamed"}</p>
                                            <p className="text-slate-400 text-xs">{user.email}</p>
                                        </div>
                                    </div>
                                </td>
                                <td className="p-4 text-slate-300">
                                    {(user.role || "").toLowerCase().trim() === 'student' ? (
                                        <span className="bg-slate-900 px-2 py-1 rounded text-xs">{user.grade || "N/A"}</span>
                                    ) : (
                                        <span className="bg-purple-900/30 text-purple-300 px-2 py-1 rounded text-xs">{user.department || "General"}</span>
                                    )}
                                </td>
                                <td className="p-4 text-slate-400">
                                    {user.createdAt?.seconds ? new Date(user.createdAt.seconds * 1000).toLocaleDateString() : '-'}
                                </td>
                                <td className="p-4 text-right">
                                    <button 
                                        onClick={() => handleDeleteUser(user.id, user.name)}
                                        className="bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded border border-red-900/50 transition text-xs font-bold"
                                    >
                                        🗑️ Delete
                                    </button>
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
}