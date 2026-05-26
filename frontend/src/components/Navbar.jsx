import React, { useState } from 'react';
import { Menu, X } from 'lucide-react';

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <nav className="h-[60px] bg-white border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto h-full px-6 flex items-center justify-between">
        {/* Left Side: Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-lg font-bold text-black tracking-tight select-none">
            ⚔️ FineTune Arena
          </span>
        </div>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex items-center space-x-8">
          <a href="#features" className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200">
            Features
          </a>
          <a href="#docs" className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200">
            Docs
          </a>
          <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-sm font-medium text-gray-600 hover:text-black transition-colors duration-200">
            GitHub
          </a>
        </div>

        {/* Desktop CTA Button */}
        <div className="hidden md:block">
          <button className="h-9 px-4 text-xs font-semibold bg-black text-white rounded-md hover:bg-gray-900 transition-all duration-200 tracking-wide uppercase">
            Start Battle
          </button>
        </div>

        {/* Mobile Menu Button */}
        <div className="md:hidden flex items-center">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-black focus:outline-none p-1"
            aria-label="Toggle menu"
          >
            {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Dropdown */}
      {isOpen && (
        <div className="md:hidden absolute top-[60px] left-0 w-full bg-white border-b border-gray-200 px-6 py-4 flex flex-col space-y-4 animate-in fade-in duration-200">
          <a
            href="#features"
            onClick={() => setIsOpen(false)}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Features
          </a>
          <a
            href="#docs"
            onClick={() => setIsOpen(false)}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            Docs
          </a>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            onClick={() => setIsOpen(false)}
            className="text-sm font-medium text-gray-600 hover:text-black transition-colors"
          >
            GitHub
          </a>
          <button
            onClick={() => setIsOpen(false)}
            className="h-10 w-full text-xs font-semibold bg-black text-white rounded-md hover:bg-gray-900 transition-colors uppercase tracking-wide"
          >
            Start Battle
          </button>
        </div>
      )}
    </nav>
  );
}
