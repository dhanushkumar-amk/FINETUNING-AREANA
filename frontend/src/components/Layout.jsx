import React from 'react';
import Navbar from './Navbar';

export default function Layout({ children }) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Top Navbar */}
      <Navbar />

      {/* Main Content Area */}
      <main className="flex-grow w-full max-w-7xl mx-auto px-6 py-12 bg-white">
        {children}
      </main>
    </div>
  );
}
