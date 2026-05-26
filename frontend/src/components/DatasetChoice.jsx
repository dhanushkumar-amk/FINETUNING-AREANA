import React, { useState } from 'react';
import { Sparkles, Upload, PenLine, Shield, Check, Plus, ArrowLeft, ArrowRight } from 'lucide-react';

export default function DatasetChoice({ onNext, onBack, domain }) {
  // Config state variables
  const [selectedOption, setSelectedOption] = useState('auto');
  
  // Option 1: Auto Gen states
  const [questionCount, setQuestionCount] = useState(20);
  const [difficulty, setDifficulty] = useState('balanced');
  const [questionTypes, setQuestionTypes] = useState(['factual', 'reasoning', 'edge_cases']);
  
  // Option 2: Upload states
  const [uploadedFile, setUploadedFile] = useState(null);
  
  // Option 3: Manual input states
  const [manualQuestions, setManualQuestions] = useState(['', '', '']);

  // Handle file select
  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      setUploadedFile(e.target.files[0]);
    }
  };

  // Toggle multi-select question types
  const handleToggleQuestionType = (type) => {
    if (questionTypes.includes(type)) {
      setQuestionTypes(questionTypes.filter((t) => t !== type));
    } else {
      setQuestionTypes([...questionTypes, type]);
    }
  };

  // Add empty manual question input
  const handleAddQuestion = () => {
    if (manualQuestions.length < 10) {
      setManualQuestions([...manualQuestions, '']);
    }
  };

  // Change manual question text
  const handleQuestionChange = (index, value) => {
    const updated = [...manualQuestions];
    updated[index] = value;
    setManualQuestions(updated);
  };

  // Filter out empty questions
  const validManualCount = manualQuestions.filter(q => q.trim() !== '').length;

  // Validation logic for start battle button
  const isValid = () => {
    if (selectedOption === 'auto') {
      return questionTypes.length > 0;
    }
    if (selectedOption === 'upload') {
      return uploadedFile !== null;
    }
    if (selectedOption === 'manual') {
      return validManualCount >= 3;
    }
    return false;
  };

  // Start battle - package settings and execute callback
  const handleStartBattle = () => {
    if (!isValid()) return;

    const config = {
      type: selectedOption,
      ...(selectedOption === 'auto' && {
        questionCount,
        difficulty,
        questionTypes
      }),
      ...(selectedOption === 'upload' && {
        fileName: uploadedFile.name,
        fileSize: uploadedFile.size
      }),
      ...(selectedOption === 'manual' && {
        questions: manualQuestions.filter((q) => q.trim() !== '')
      })
    };

    onNext(config);
  };

  return (
    <div className="w-full max-w-2xl mx-auto py-2 text-[#0A0A0A]">
      {/* 1. TITLE AREA */}
      <div className="text-center mb-10">
        <h2 className="text-3xl font-semibold tracking-tight text-[#0A0A0A] mb-2 font-sans">
          How do you want to test?
        </h2>
        <p className="text-sm text-[#6B7280]">
          Choose how to generate your test questions
        </p>
      </div>

      {/* 2. THREE OPTION CARDS */}
      <div className="flex flex-col gap-4 mb-8">
        
        {/* CARD 1 — AUTO GENERATE */}
        <div 
          onClick={() => setSelectedOption('auto')}
          className={`border rounded-[12px] p-6 transition-all duration-200 cursor-pointer ${
            selectedOption === 'auto' 
              ? 'border-[#0A0A0A] bg-[#F9FAFB]' 
              : 'border-[#E5E7EB] bg-white hover:border-[#6B7280]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-lg border transition-colors ${
              selectedOption === 'auto' ? 'border-[#0A0A0A] bg-white text-[#0A0A0A]' : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
            }`}>
              <Sparkles className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-[#0A0A0A] text-base leading-snug">Auto Generate</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-[#dcfce7] text-[#16a34a] uppercase tracking-wider select-none">
                  Recommended
                </span>
              </div>
              <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                AI creates domain-specific test questions based on your selected domain{domain ? ` (${domain})` : ''}
              </p>
            </div>
          </div>

          {/* Sub-options for Auto Gen */}
          <div 
            onClick={(e) => e.stopPropagation()} // prevent card selection toggle on pill click
            className={`transition-all duration-300 ease-in-out overflow-hidden text-left ${
              selectedOption === 'auto' 
                ? 'max-h-[500px] opacity-100 mt-6 pt-6 border-t border-[#E5E7EB]' 
                : 'max-h-0 opacity-0 mt-0 pt-0 border-t-0 border-transparent'
            }`}
          >
            <div className="flex flex-col gap-5">
              {/* Row 1: Number of questions */}
              <div>
                <span className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2.5">
                  Number of Questions
                </span>
                <div className="flex gap-2">
                  {[10, 20, 30].map((count) => (
                    <button
                      key={count}
                      onClick={() => setQuestionCount(count)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                        questionCount === count
                          ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                          : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] hover:border-[#6B7280]'
                      }`}
                    >
                      {count}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 2: Difficulty mix */}
              <div>
                <span className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2.5">
                  Difficulty Mix
                </span>
                <div className="flex gap-2">
                  {['easy', 'balanced', 'hard'].map((diff) => (
                    <button
                      key={diff}
                      onClick={() => setDifficulty(diff)}
                      className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all capitalize ${
                        difficulty === diff
                          ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                          : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] hover:border-[#6B7280]'
                      }`}
                    >
                      {diff}
                    </button>
                  ))}
                </div>
              </div>

              {/* Row 3: Question types */}
              <div>
                <span className="block text-[10px] font-bold text-[#6B7280] uppercase tracking-widest mb-2.5">
                  Question Types
                </span>
                <div className="flex gap-2">
                  {[
                    { id: 'factual', label: 'Factual' },
                    { id: 'reasoning', label: 'Reasoning' },
                    { id: 'edge_cases', label: 'Edge Cases' }
                  ].map((type) => {
                    const isSelected = questionTypes.includes(type.id);
                    return (
                      <button
                        key={type.id}
                        onClick={() => handleToggleQuestionType(type.id)}
                        className={`px-4 py-1.5 text-xs font-semibold rounded-lg border transition-all ${
                          isSelected
                            ? 'bg-[#0A0A0A] border-[#0A0A0A] text-white'
                            : 'bg-white border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] hover:border-[#6B7280]'
                        }`}
                      >
                        {type.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* CARD 2 — UPLOAD DATASET */}
        <div 
          onClick={() => setSelectedOption('upload')}
          className={`border rounded-[12px] p-6 transition-all duration-200 cursor-pointer ${
            selectedOption === 'upload' 
              ? 'border-[#0A0A0A] bg-[#F9FAFB]' 
              : 'border-[#E5E7EB] bg-white hover:border-[#6B7280]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-lg border transition-colors ${
              selectedOption === 'upload' ? 'border-[#0A0A0A] bg-white text-[#0A0A0A]' : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
            }`}>
              <Upload className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="font-bold text-[#0A0A0A] text-base leading-snug">Upload My Dataset</h3>
              <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                Use your own test questions from a CSV file
              </p>
            </div>
          </div>

          {/* Upload Area for Option 2 */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`transition-all duration-300 ease-in-out overflow-hidden text-center ${
              selectedOption === 'upload' 
                ? 'max-h-[300px] opacity-100 mt-6 pt-6 border-t border-[#E5E7EB]' 
                : 'max-h-0 opacity-0 mt-0 pt-0 border-t-0 border-transparent'
            }`}
          >
            <label className="border border-dashed border-[#E5E7EB] hover:border-[#0A0A0A] rounded-[12px] p-8 flex flex-col items-center justify-center cursor-pointer transition-colors w-full bg-white">
              <input 
                type="file" 
                accept=".csv"
                onChange={handleFileChange}
                className="hidden" 
              />
              {uploadedFile ? (
                <div className="flex items-center gap-2 text-sm text-[#16a34a] font-semibold animate-in zoom-in-95 duration-200">
                  <Check className="w-4 h-4 text-[#16a34a]" />
                  <span>{uploadedFile.name}</span>
                </div>
              ) : (
                <>
                  <Upload className="w-6 h-6 text-[#6B7280]/40 mb-3" />
                  <span className="text-sm font-semibold text-[#0A0A0A]">Drop your CSV file here</span>
                  <span className="text-xs text-[#6B7280] mt-1">or click to browse</span>
                  <span className="text-[10px] text-[#6B7280] mt-4 bg-[#F9FAFB] px-2.5 py-1 rounded-md border border-[#E5E7EB]">
                    Required column: <code className="font-mono text-[#0A0A0A] font-semibold">question</code> | Max 50 rows | Max 1MB
                  </span>
                </>
              )}
            </label>
          </div>
        </div>

        {/* CARD 3 — WRITE MY OWN */}
        <div 
          onClick={() => setSelectedOption('manual')}
          className={`border rounded-[12px] p-6 transition-all duration-200 cursor-pointer ${
            selectedOption === 'manual' 
              ? 'border-[#0A0A0A] bg-[#F9FAFB]' 
              : 'border-[#E5E7EB] bg-white hover:border-[#6B7280]'
          }`}
        >
          <div className="flex items-start gap-4">
            <div className={`p-2.5 rounded-lg border transition-colors ${
              selectedOption === 'manual' ? 'border-[#0A0A0A] bg-white text-[#0A0A0A]' : 'border-[#E5E7EB] bg-[#F9FAFB] text-[#6B7280]'
            }`}>
              <PenLine className="w-5 h-5" />
            </div>
            <div className="flex-1 text-left min-w-0">
              <h3 className="font-bold text-[#0A0A0A] text-base leading-snug">Write My Own</h3>
              <p className="text-sm text-[#6B7280] mt-1 leading-relaxed">
                Type your own test questions manually
              </p>
            </div>
          </div>

          {/* Manual input area for Option 3 */}
          <div 
            onClick={(e) => e.stopPropagation()} 
            className={`transition-all duration-300 ease-in-out overflow-hidden text-left ${
              selectedOption === 'manual' 
                ? 'max-h-[600px] opacity-100 mt-6 pt-6 border-t border-[#E5E7EB]' 
                : 'max-h-0 opacity-0 mt-0 pt-0 border-t-0 border-transparent'
            }`}
          >
            <div className="flex flex-col gap-3">
              {manualQuestions.map((question, index) => (
                <div key={index} className="flex flex-col w-full">
                  <input
                    type="text"
                    placeholder={`Question ${index + 1}...`}
                    value={question}
                    onChange={(e) => handleQuestionChange(index, e.target.value)}
                    className="w-full h-10 border border-[#E5E7EB] rounded-lg px-3 text-sm text-[#0A0A0A] focus:border-[#0A0A0A] focus:ring-1 focus:ring-[#0A0A0A] focus:outline-none transition-all"
                  />
                </div>
              ))}
              
              <div className="flex items-center justify-between mt-2 pt-2 border-t border-[#E5E7EB]">
                <button
                  onClick={handleAddQuestion}
                  disabled={manualQuestions.length >= 10}
                  className="h-8 px-4 border border-[#E5E7EB] text-[#6B7280] hover:text-[#0A0A0A] hover:border-[#6B7280] text-xs font-semibold rounded-lg bg-white transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  <Plus className="w-3.5 h-3.5" /> Add Question
                </button>
                <span className="text-[10px] font-bold text-[#6B7280] uppercase tracking-wide">
                  {validManualCount} questions added (min 3)
                </span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* 3. PRIVACY NOTICE */}
      <div className="border border-[#E5E7EB] rounded-lg bg-[#F9FAFB] p-4 mb-10 flex gap-3 text-left">
        <Shield className="w-5 h-5 text-[#6B7280] flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-[#6B7280] leading-relaxed font-medium">
            Your questions are sent to Groq and HuggingFace APIs for processing. Do not upload confidential data.
          </p>
          <a href="#self-host" className="inline-block text-[11px] font-semibold text-[#0A0A0A] hover:underline mt-2">
            Use self-hosted version &rarr;
          </a>
        </div>
      </div>

      {/* 4. NAVIGATION BUTTONS */}
      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6">
        <button
          onClick={onBack}
          className="h-10 px-5 border border-[#0A0A0A] text-[#0A0A0A] text-xs font-semibold rounded-md hover:bg-[#F9FAFB] transition-colors uppercase tracking-wider flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          disabled={!isValid()}
          onClick={handleStartBattle}
          className={`h-10 px-6 text-xs font-semibold rounded-md uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 ${
            isValid()
              ? 'bg-[#0A0A0A] text-white hover:bg-black/90 cursor-pointer'
              : 'bg-[#F9FAFB] text-gray-400 border border-[#E5E7EB] cursor-not-allowed'
          }`}
        >
          Start Battle <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
