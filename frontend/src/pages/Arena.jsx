import React, { useState } from 'react';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import ModelSelection from '../components/ModelSelection';

const STEPS = [
  { id: 1, label: "Select Models" },
  { id: 2, label: "Choose Dataset" },
  { id: 3, label: "Live Battle" },
  { id: 4, label: "Report" }
];

export default function Arena() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // State for Wizard Form
  const [modelA, setModelA] = useState(null);
  const [modelB, setModelB] = useState(null);

  const handleNext = () => {
    if (currentStep < 4) setCurrentStep(currentStep + 1);
  };

  const handleBack = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  return (
    <div className="bg-white py-10 px-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-200px)] animate-in fade-in duration-500">
      {/* TOP STEP INDICATOR */}
      <div className="relative flex items-center justify-between w-full mb-16">
        {/* Thin gray line connecting all steps */}
        <div className="absolute left-0 right-0 top-5 h-[1px] bg-gray-200 z-0" />

        {STEPS.map((step) => {
          const isCompleted = step.id < currentStep;
          const isActive = step.id === currentStep;

          return (
            <div key={step.id} className="relative z-10 flex flex-col items-center bg-white px-4">
              {/* Circle */}
              <div 
                className={`w-10 h-10 rounded-full border flex items-center justify-center text-sm font-semibold select-none transition-all duration-200 ${
                  isCompleted 
                    ? 'bg-black border-black text-white' 
                    : isActive 
                    ? 'bg-black border-black text-white scale-105' 
                    : 'bg-white border-gray-200 text-gray-400'
                }`}
              >
                {isCompleted ? <Check className="w-5 h-5" /> : step.id}
              </div>

              {/* Label */}
              <span 
                className={`text-xs mt-3 transition-colors duration-200 ${
                  isActive 
                    ? 'font-bold text-black' 
                    : 'text-gray-400 font-medium'
                }`}
              >
                {step.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* STAGE CONTENT AREA */}
      <div className="flex-grow border border-gray-200 rounded-[12px] bg-white p-8 md:p-12 flex flex-col items-center justify-center min-h-[350px] mb-12">
        {currentStep === 1 && (
          <div className="w-full animate-in fade-in duration-300">
            <ModelSelection
              modelA={modelA}
              setModelA={setModelA}
              modelB={modelB}
              setModelB={setModelB}
              onSuccess={handleNext}
            />
          </div>
        )}
        {currentStep === 2 && (
          <div className="w-full text-center animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold text-black mb-2">Dataset Choice</h2>
            <p className="text-sm text-gray-500">Dataset Choice coming soon</p>
          </div>
        )}
        {currentStep === 3 && (
          <div className="w-full text-center animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold text-black mb-2">Live Battle</h2>
            <p className="text-sm text-gray-500">Live Battle coming soon</p>
          </div>
        )}
        {currentStep === 4 && (
          <div className="w-full text-center animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold text-black mb-2">Battle Report</h2>
            <p className="text-sm text-gray-500">Report coming soon</p>
          </div>
        )}
      </div>

      {/* NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between">
        <div>
          {currentStep > 1 && (
            <button 
              onClick={handleBack}
              className="h-10 px-5 border border-black text-black text-xs font-semibold rounded-md hover:bg-gray-50 transition-colors uppercase tracking-wider flex items-center gap-2"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          )}
        </div>
        <div>
          {currentStep > 1 && currentStep < 4 && (
            <button 
              onClick={handleNext}
              className="h-10 px-5 bg-black text-white text-xs font-semibold rounded-md hover:bg-black/90 transition-colors uppercase tracking-wider flex items-center gap-2"
            >
              Next <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
