"use client"; // <--- This line is crucial for interactivity
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import Navbar from "@/components/Navbar";

export default function Contact() {
  // State to handle form status
  const [result, setResult] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (event: any) => {
    event.preventDefault();
    setIsSubmitting(true);
    setResult("Sending....");

    const formData = new FormData(event.target);

    // --- PASTE YOUR KEY HERE BELOW ---
    formData.append("access_key", "d99ecf04-da76-400a-a196-bdd1bf0ccac8");

    const response = await fetch("https://api.web3forms.com/submit", {
      method: "POST",
      body: formData
    });

    const data = await response.json();

    if (data.success) {
      setResult("Message Sent Successfully!");
      event.target.reset();
    } else {
      console.log("Error", data);
      setResult(data.message);
    }
    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-gray-900 font-sans">
      
    <Navbar />

      {/* --- MAIN CONTENT --- */}
      <main className="flex-grow py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h1 className="text-4xl font-bold text-slate-900">Get in Touch</h1>
                <p className="text-slate-600 mt-4 text-lg">Have questions? We are here to help you.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 bg-white rounded-2xl shadow-sm overflow-hidden border border-slate-100">
                
                {/* Left Side: Contact Info */}
                <div className="p-10 bg-blue-600 text-white flex flex-col justify-center">
                    <h2 className="text-2xl font-bold mb-6">Contact Information</h2>
                    <div className="space-y-6">
                        <div className="flex items-start gap-4">
                            <span className="text-2xl">📍</span>
                            <p>Vishwaas Academy Headquarters<br/>Rambagh Campus, Darbhanga, Bihar, India</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">📧</span>
                            <p>vishwaasacademy@gmail.com</p>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className="text-2xl">📞</span>
                            <p>+91 7324962717, +91 6202834185</p>
                        </div>
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="p-10">
                    <form onSubmit={onSubmit} className="space-y-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Your Name</label>
                            <input type="text" name="name" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition" placeholder="John Doe" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Email Address</label>
                            <input type="email" name="email" required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition" placeholder="john@example.com" />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">Message</label>
                            <textarea name="message" rows={4} required className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:ring-2 focus:ring-blue-600 focus:border-transparent outline-none transition" placeholder="How can we help you?"></textarea>
                        </div>

                        {/* Result Message */}
                        {result && (
                            <div className={`text-center text-sm font-semibold ${result.includes("Success") ? "text-green-600" : "text-red-600"}`}>
                                {result}
                            </div>
                        )}

                        <button 
                            type="submit" 
                            disabled={isSubmitting}
                            className="w-full bg-blue-600 text-white font-semibold py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
                        >
                            {isSubmitting ? "Sending..." : "Send Message"}
                        </button>
                    </form>
                </div>

            </div>
        </div>
      </main>

      {/* --- FOOTER --- */}
      <footer className="bg-white border-t border-slate-200 py-12">
        <div className="max-w-7xl mx-auto px-4 text-center text-slate-500 text-sm">
          <p>&copy; {new Date().getFullYear()} Vishwaas Academy. All rights reserved.</p>
        </div>
      </footer>

    </div>
  );
}