import React from 'react';
import { Check, ArrowLeft, ArrowRight } from 'lucide-react';
import ModelSelection from '../components/ModelSelection';
import DatasetChoice from '../components/DatasetChoice';
import LiveBattle from '../components/LiveBattle';
import useBattleStore from '../store/battleStore';
import { generateTests } from '../api/battleApi';

const STEPS = [
  { id: 1, label: "Select Models" },
  { id: 2, label: "Choose Dataset" },
  { id: 3, label: "Live Battle" },
  { id: 4, label: "Report" }
];

export default function Arena() {
  const {
    currentStage,
    modelA,
    modelB,
    domain,
    battleConfig,
    testQuestions,
    isLoading,
    loadingMessage,
    setModelA,
    setModelB,
    setDomain,
    setBattleConfig,
    setTestQuestions,
    setLoading,
    setStage
  } = useBattleStore();

  const handleConnect = (selectedModelA, selectedModelB, selectedDomain) => {
    setModelA(selectedModelA);
    setModelB(selectedModelB);
    setDomain(selectedDomain);
    setStage(2);
  };

  const handleStartBattle = async (config) => {
    setBattleConfig(config);
    setLoading(true, "Generating test cases...");
    
    try {
      if (config.option === 'auto') {
        const mappedTypes = config.questionTypes.map(t => {
          if (t === 'factual') return 'Factual';
          if (t === 'reasoning') return 'Reasoning';
          if (t === 'edge_cases') return 'Edge Cases';
          return t;
        });

        const result = await generateTests(
          domain,
          config.questionCount,
          config.difficulty,
          mappedTypes
        );

        if (result && result.success) {
          setTestQuestions(result.questions);
          // Add this temporarily to verify questions loaded
          console.log("Test questions loaded:", result.questions);
          setStage(3);
        } else {
          alert(result?.error || "Failed to generate test cases. Please try again.");
        }
      } else if (config.option === 'manual') {
        const questionsList = config.manualQuestions
          .filter(q => q.trim() !== '')
          .map((q, idx) => ({
            id: idx + 1,
            question: q,
            category: 'Manual',
            difficulty: 'balanced',
            expected_keywords: []
          }));
        setTestQuestions(questionsList);
        console.log("Test questions loaded:", questionsList);
        setStage(3);
      } else {
        // Upload fallback
        const mockQuestions = [
          { 
            id: 1, 
            question: `Sample uploaded question from ${config.uploadedFile?.name || 'file'}`, 
            category: 'Upload', 
            difficulty: 'balanced', 
            expected_keywords: [] 
          }
        ];
        setTestQuestions(mockQuestions);
        console.log("Test questions loaded:", mockQuestions);
        setStage(3);
      }
    } catch (error) {
      console.error("Error generating test cases:", error);
      alert("An unexpected error occurred while generating test cases.");
    } finally {
      setLoading(false);
    }
  };

  const handleBack = () => {
    if (currentStage > 1) setStage(currentStage - 1);
  };

  const handleNext = () => {
    if (currentStage < 4) setStage(currentStage + 1);
  };

  return (
    <div className="bg-white py-10 px-4 max-w-4xl mx-auto flex flex-col min-h-[calc(100vh-200px)] animate-in fade-in duration-500 relative">
      {/* LOADING OVERLAY */}
      {isLoading && (
        <div className="fixed inset-0 bg-white/75 backdrop-blur-sm z-50 flex flex-col items-center justify-center pointer-events-auto">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin border-4 border-black border-t-transparent rounded-full w-12 h-12" />
            {loadingMessage && (
              <p className="text-sm font-medium text-gray-500">{loadingMessage}</p>
            )}
          </div>
        </div>
      )}

      {/* TOP STEP INDICATOR */}
      <div className="relative flex items-center justify-between w-full mb-16">
        {/* Thin gray line connecting all steps */}
        <div className="absolute left-0 right-0 top-5 h-[1px] bg-gray-200 z-0" />

        {STEPS.map((step) => {
          const isCompleted = step.id < currentStage;
          const isActive = step.id === currentStage;

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
        {currentStage === 1 && (
          <div className="w-full animate-in fade-in duration-300">
            <ModelSelection
              modelA={modelA}
              setModelA={setModelA}
              modelB={modelB}
              setModelB={setModelB}
              onConnect={handleConnect}
            />
          </div>
        )}
        {currentStage === 2 && (
          <div className="w-full animate-in fade-in duration-300">
            <DatasetChoice
              onStartBattle={handleStartBattle}
              onBack={handleBack}
              domain={domain || 'Text Generation'}
            />
          </div>
        )}
        {currentStage === 3 && (
          <div className="w-full animate-in fade-in duration-300">
            <LiveBattle
              modelA={modelA}
              modelB={modelB}
              datasetConfig={battleConfig}
              onNext={(questionsList) => {
                setTestQuestions(questionsList);
                setStage(4);
              }}
              onBack={handleBack}
              domain={domain || 'Text Generation'}
            />
          </div>
        )}
        {currentStage === 4 && (
          <div className="w-full text-center animate-in fade-in duration-300">
            <h2 className="text-xl font-semibold text-black mb-2">Battle Report</h2>
            <p className="text-sm text-gray-500">Report coming soon</p>
          </div>
        )}
      </div>

      {/* NAVIGATION BUTTONS */}
      {currentStage !== 1 && currentStage !== 2 && currentStage !== 3 && (
        <div className="flex items-center justify-between">
          <div>
            {currentStage > 1 && (
              <button 
                onClick={handleBack}
                className="h-10 px-5 border border-black text-black text-xs font-semibold rounded-md hover:bg-gray-50 transition-colors uppercase tracking-wider flex items-center gap-2"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
            )}
          </div>
          <div>
            {currentStage > 1 && currentStage < 4 && (
              <button 
                onClick={handleNext}
                className="h-10 px-5 bg-black text-white text-xs font-semibold rounded-md hover:bg-black/90 transition-colors uppercase tracking-wider flex items-center gap-2"
              >
                Next <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
