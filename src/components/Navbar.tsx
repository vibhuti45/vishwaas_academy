"use client"; // This is required because we use "interactivity" (clicking the menu)
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname(); // Helps us highlight the active page

  const navLinks = [
    { name: "About", href: "/about" },
    { name: "Courses", href: "/courses" },
    { name: "Faculty", href: "/faculty" },
    { name: "Contact", href: "/contact" },
  ];

  return (
    <header className="w-full border-b border-gray-200 sticky top-0 bg-white/80 backdrop-blur-md z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* LOGO */}
        <div className="flex items-center gap-2">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/logo.jpg" alt="Vishwaas Logo" width={40} height={40} />
            <span className="text-xl font-bold text-blue-900 tracking-tight">Vishwaas Academy</span>
          </Link>
        </div>

        {/* DESKTOP MENU (Hidden on Mobile) */}
        <nav className="hidden md:flex gap-8 text-sm font-medium text-gray-600">
          {navLinks.map((link) => (
            <Link 
              key={link.name} 
              href={link.href} 
              className={`transition hover:text-blue-600 ${pathname === link.href ? "text-blue-600 font-bold" : ""}`}
            >
              {link.name}
            </Link>
          ))}
        </nav>

        {/* RIGHT SIDE: Login & Mobile Button */}
        <div className="flex items-center gap-4">
          <button className="hidden md:block bg-blue-600 text-white px-5 py-2 rounded-full text-sm font-medium hover:bg-blue-700 transition">
            Student Login
          </button>

          {/* HAMBURGER BUTTON (Visible ONLY on Mobile) */}
          <button 
            onClick={() => setIsOpen(!isOpen)} 
            className="md:hidden text-gray-700 focus:outline-none"
          >
            {/* Icon changes based on whether menu is open or closed */}
            {isOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" /></svg>
            )}
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN (Only visible when isOpen is true) */}
      {isOpen && (
        <div className="md:hidden bg-white border-t border-gray-100 absolute w-full left-0 shadow-lg">
          <div className="px-4 pt-2 pb-6 space-y-2">
            {navLinks.map((link) => (
              <Link 
                key={link.name} 
                href={link.href} 
                onClick={() => setIsOpen(false)} // Close menu when clicked
                className="block px-3 py-3 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-blue-50"
              >
                {link.name}
              </Link>
            ))}
            <button className="w-full mt-4 bg-blue-600 text-white px-5 py-3 rounded-lg text-sm font-medium hover:bg-blue-700 transition">
              Student Login
            </button>
          </div>
        </div>
      )}
    </header>
  );
}