import React, { useState, useEffect } from 'react';
import { Sparkles, Zap, BarChart2, FileText, Database, Heart, ArrowRight } from 'lucide-react';

export default function Landing() {
  const [particles, setParticles] = useState([]);
  const [mousePos, setMousePos] = useState({ x: -100, y: -100 });
  const [cursorHovered, setCursorHovered] = useState(false);
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    // Generate 25 floating particles with randomized attributes
    const generatedParticles = Array.from({ length: 25 }).map((_, i) => {
      const size = Math.random() * 3 + 2; // 2px to 5px
      const speed = Math.random() * 7 + 8; // 8s to 15s
      const delay = Math.random() * 5; // 0s to 5s
      const left = Math.random() * 100; // 0% to 100%

      return {
        id: i,
        style: {
          position: 'absolute',
          bottom: '-20px',
          left: `${left}%`,
          width: `${size}px`,
          height: `${size}px`,
          backgroundColor: '#D1D5DB', // subtle gray
          borderRadius: '50%',
          animationName: 'floatUp',
          animationDuration: `${speed}s`,
          animationTimingFunction: 'linear',
          animationDelay: `${delay}s`,
          animationIterationCount: 'infinite',
          animationFillMode: 'backwards',
          pointerEvents: 'none',
          zIndex: 0,
        }
      };
    });
    setParticles(generatedParticles);

    // Track mouse position for custom cursor
    const handleMouseMove = (e) => {
      setMousePos({ x: e.clientX, y: e.clientY });
    };

    // Track hover status over interactive elements
    const handleMouseOver = (e) => {
      if (e.target.closest('a, button, [role="button"]')) {
        setCursorHovered(true);
      } else {
        setCursorHovered(false);
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseover', handleMouseOver);

    // Scroll reveal observer
    const observerOptions = {
      root: null,
      rootMargin: '0px 0px -100px 0px', // trigger 100px before appearing
      threshold: 0.05,
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('revealed');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const elements = document.querySelectorAll('.reveal-on-scroll');
    elements.forEach((el) => observer.observe(el));

    // Fade in hero content shortly after mount
    const timer = setTimeout(() => setHeroVisible(true), 100);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseover', handleMouseOver);
      elements.forEach((el) => observer.unobserve(el));
      clearTimeout(timer);
    };
  }, []);

  const steps = [
    {
      id: 1,
      title: "Pick two models",
      desc: "Select local weights or remote fine-tuned models to benchmark."
    },
    {
      id: 2,
      title: "AI generates test cases",
      desc: "Custom prompts generated automatically to evaluate your use-case."
    },
    {
      id: 3,
      title: "Watch live battle",
      desc: "Compare streamed responses side-by-side in real-time."
    },
    {
      id: 4,
      title: "Get winner report",
      desc: "A plain English breakdown of strengths, weaknesses, and the winner."
    }
  ];

  const features = [
    {
      icon: <Sparkles className="w-5 h-5 text-black" />,
      title: "Auto Test Generation",
      desc: "AI creates domain-specific questions automatically tailored to your dataset."
    },
    {
      icon: <Zap className="w-5 h-5 text-black" />,
      title: "Live Battle",
      desc: "Watch models compete in real time side by side and see token generation speeds."
    },
    {
      icon: <BarChart2 className="w-5 h-5 text-black" />,
      title: "Weakness Map",
      desc: "Visual radar and bar charts showing exactly where and why each model fails."
    },
    {
      icon: <FileText className="w-5 h-5 text-black" />,
      title: "Plain English Report",
      desc: "No confusing academic metrics. Get clear reasoning on who won and why."
    },
    {
      icon: <Database className="w-5 h-5 text-black" />,
      title: "HuggingFace Integration",
      desc: "Browse, select, and evaluate any model directly from HuggingFace repository."
    },
    {
      icon: <Heart className="w-5 h-5 text-black" />,
      title: "Free Forever",
      desc: "100% free, MIT licensed, and fully self-hostable on your own hardware."
    }
  ];

  return (
    <div className="bg-white text-[#0A0A0A] relative">
      {/* CUSTOM CURSOR TRAILING RING */}
      <div 
        className={`hidden md:block fixed pointer-events-none z-[9999] rounded-full border border-black/35 -translate-x-1/2 -translate-y-1/2 transition-all duration-150 ease-out ${
          cursorHovered ? 'w-12 h-12 border-black bg-black/5' : 'w-7 h-7'
        }`}
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />
      <div 
        className="hidden md:block fixed pointer-events-none z-[9999] rounded-full bg-black w-1.5 h-1.5 -translate-x-1/2 -translate-y-1/2 transition-all duration-75 ease-out"
        style={{
          left: `${mousePos.x}px`,
          top: `${mousePos.y}px`,
        }}
      />

      {/* SECTION 1 - HERO */}
      <section className="relative overflow-hidden w-full py-20 md:py-28 text-center flex flex-col items-center border-b border-gray-100">
        {/* Local CSS Animations */}
        <style>{`
          @keyframes floatUp {
            0% {
              transform: translateY(0) scale(0.8);
              opacity: 0;
            }
            15% {
              opacity: 0.4;
            }
            85% {
              opacity: 0.4;
            }
            100% {
              transform: translateY(-550px) scale(1.2);
              opacity: 0;
            }
          }

          .reveal-on-scroll {
            opacity: 0;
            transform: translateY(24px);
            transition: opacity 0.8s cubic-bezier(0.16, 1, 0.3, 1), transform 0.8s cubic-bezier(0.16, 1, 0.3, 1);
          }

          .reveal-on-scroll.revealed {
            opacity: 1;
            transform: translateY(0);
          }
        `}</style>

        {/* Floating Particles Container */}
        <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
          {particles.map((p) => (
            <div key={p.id} style={p.style} />
          ))}
        </div>

        {/* Hero Content Wrapper */}
        <div className={`relative z-10 max-w-3xl mx-auto px-6 flex flex-col items-center transition-all duration-1000 ease-out ${
          heroVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          {/* Small badge top */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 border border-gray-200 rounded-full text-xs text-gray-500 font-medium mb-8 select-none">
            <span>Open Source</span>
            <span className="text-gray-300">·</span>
            <span>Free</span>
            <span className="text-gray-300">·</span>
            <span>No GPU needed</span>
          </div>

          {/* H1 large bold */}
          <h1 className="text-5xl md:text-7xl font-bold tracking-tight text-[#0A0A0A] leading-tight md:leading-none mb-6">
            Stop guessing.<br />Start knowing.
          </h1>

          {/* Subtitle gray text */}
          <p className="text-lg md:text-xl text-gray-500 leading-relaxed mb-10 max-w-xl">
            Compare finetuned models head to head in 5 minutes. Know exactly which one to ship.
          </p>

          {/* Two buttons side by side */}
          <div className="flex flex-col sm:flex-row gap-4 w-full sm:w-auto">
            <button className="h-11 px-8 bg-[#0A0A0A] text-white text-xs font-semibold rounded-md hover:bg-black/90 transition-colors uppercase tracking-wide">
              Start Battle
            </button>
            <button className="h-11 px-8 bg-white text-[#0A0A0A] border border-[#0A0A0A] text-xs font-semibold rounded-md hover:bg-gray-50 transition-colors uppercase tracking-wide">
              View on GitHub
            </button>
          </div>
        </div>
      </section>

      {/* SECTION 2 - STATS BAR */}
      <section className="reveal-on-scroll py-8 max-w-5xl mx-auto px-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 p-8 border border-gray-200 rounded-xl bg-gray-50 divide-y-0 divide-x-0 md:divide-x md:divide-gray-200">
          <div className="text-center flex flex-col items-center justify-center p-2">
            <span className="text-2xl md:text-3xl font-bold text-black">$0</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Cost</span>
          </div>
          <div className="text-center flex flex-col items-center justify-center p-2">
            <span className="text-2xl md:text-3xl font-bold text-black">5 min</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Battle</span>
          </div>
          <div className="text-center flex flex-col items-center justify-center p-2">
            <span className="text-2xl md:text-3xl font-bold text-black">0</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">GPU Needed</span>
          </div>
          <div className="text-center flex flex-col items-center justify-center p-2">
            <span className="text-2xl md:text-3xl font-bold text-black">Any</span>
            <span className="text-xs text-gray-500 mt-1 uppercase tracking-wider">Laptop</span>
          </div>
        </div>
      </section>

      {/* SECTION 3 - HOW IT WORKS */}
      <section className="py-24 max-w-6xl mx-auto px-6">
        <div className="reveal-on-scroll text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">How it works</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 relative">
          {steps.map((step, idx) => (
            <div 
              key={step.id} 
              className="reveal-on-scroll relative flex flex-col items-center text-center p-4"
              style={{ transitionDelay: `${idx * 150}ms` }}
            >
              {/* Number badge */}
              <div className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-sm font-semibold text-black bg-white mb-6">
                {step.id}
              </div>
              <h3 className="font-semibold text-black mb-3 text-base">{step.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed max-w-[220px]">{step.desc}</p>
              
              {/* Arrow divider */}
              {idx < 3 && (
                <div className="hidden md:block absolute top-9 left-[calc(100%-12px)] w-6 h-6 text-gray-300">
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 4 - FEATURES GRID */}
      <section className="py-24 max-w-6xl mx-auto px-6 border-t border-gray-100">
        <div className="reveal-on-scroll text-center mb-16">
          <h2 className="text-3xl font-bold tracking-tight text-[#0A0A0A]">Everything you need</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index}
              className="reveal-on-scroll p-8 border border-gray-200 rounded-[12px] bg-white hover:border-black transition-colors duration-200"
              style={{ transitionDelay: `${(index % 3) * 150}ms` }}
            >
              <div className="w-10 h-10 flex items-center justify-center border border-gray-200 rounded-lg bg-gray-50 mb-6">
                {feature.icon}
              </div>
              <h3 className="text-lg font-semibold text-black mb-3">{feature.title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* SECTION 5 - FOOTER */}
      <footer className="reveal-on-scroll py-12 mt-20 border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Logo and License */}
          <div className="flex flex-col items-center md:items-start gap-1">
            <span className="text-sm font-bold text-black">⚔️ FineTune Arena</span>
            <span className="text-xs text-gray-400">Open source. MIT License.</span>
          </div>

          {/* Links */}
          <div className="flex items-center gap-8 text-xs font-medium text-gray-500">
            <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="hover:text-black transition-colors">
              GitHub
            </a>
            <a href="#docs" className="hover:text-black transition-colors">
              Docs
            </a>
            <a href="#self-host" className="hover:text-black transition-colors">
              Self-host
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}
