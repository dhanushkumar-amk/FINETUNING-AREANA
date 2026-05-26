import React, { useState } from 'react';
import { Cpu, Check } from 'lucide-react';

const MODELS_LIST = [
  // Medical
  { id: "medalpaca/medalpaca-7b", name: "MedAlpaca 7B", domain: "Medical" },
  { id: "microsoft/BiomedNLP-PubMedBERT-base", name: "PubMedBERT Base", domain: "Medical" },
  // Legal
  { id: "pile-of-law/legalbert-large", name: "LegalBERT Large", domain: "Legal" },
  { id: "nlpaueb/legal-bert-base-uncased", name: "Legal BERT Base", domain: "Legal" },
  // Coding
  { id: "bigcode/starcoder2-3b", name: "StarCoder2 3B", domain: "Coding" },
  { id: "Salesforce/codegen-350M-mono", name: "CodeGen 350M", domain: "Coding" },
  // General
  { id: "mistralai/Mistral-7B-v0.1", name: "Mistral 7B", domain: "General" },
  { id: "google/flan-t5-base", name: "Flan T5 Base", domain: "General" },
  { id: "facebook/opt-1.3b", name: "OPT 1.3B", domain: "General" },
  { id: "tiiuae/falcon-7b-instruct", name: "Falcon 7B", domain: "General" },
];

export default function ModelSelection({
  modelA, setModelA,
  modelB, setModelB,
  domain, setDomain,
  onSuccess
}) {
  // Local state for tabs and custom inputs
  const [activeTabA, setActiveTabA] = useState('browse');
  const [activeTabB, setActiveTabB] = useState('browse');
  const [customIdA, setCustomIdA] = useState('');
  const [customIdB, setCustomIdB] = useState('');

  const bothSelected = modelA && modelB;
  const connectEnabled = modelA && modelB && domain;

  // Validate custom HuggingFace ID for Model A
  const handleValidateA = () => {
    if (!customIdA.trim()) return;
    const cleanId = customIdA.trim();
    const parts = cleanId.split('/');
    const modelName = parts[parts.length - 1] || cleanId;
    
    setModelA({
      id: cleanId,
      name: modelName,
      domain: 'Custom'
    });
  };

  // Validate custom HuggingFace ID for Model B
  const handleValidateB = () => {
    if (!customIdB.trim()) return;
    const cleanId = customIdB.trim();
    const parts = cleanId.split('/');
    const modelName = parts[parts.length - 1] || cleanId;
    
    setModelB({
      id: cleanId,
      name: modelName,
      domain: 'Custom'
    });
  };

  // Quick select handlers for dropdown list
  const handleSelectA = (id) => {
    const selected = MODELS_LIST.find(m => m.id === id);
    if (selected) {
      setModelA(selected);
    }
  };

  const handleSelectB = (id) => {
    const selected = MODELS_LIST.find(m => m.id === id);
    if (selected) {
      setModelB(selected);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-4 text-[#0A0A0A]">
      {/* Local keyframes for flowing dots along connection line */}
      <style>{`
        @keyframes flowDotHorizontal {
          0% {
            left: 0%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            left: 100%;
            opacity: 0;
          }
        }

        @keyframes flowDotVertical {
          0% {
            top: 0%;
            opacity: 0;
          }
          15% {
            opacity: 1;
          }
          85% {
            opacity: 1;
          }
          100% {
            top: 100%;
            opacity: 0;
          }
        }

        .dot-h {
          position: absolute;
          top: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #0A0A0A;
          transform: translateY(-50%);
          animation: flowDotHorizontal 2s linear infinite;
        }

        .dot-v {
          position: absolute;
          left: 50%;
          width: 6px;
          height: 6px;
          border-radius: 50%;
          background-color: #0A0A0A;
          transform: translateX(-50%);
          animation: flowDotVertical 2s linear infinite;
        }
      `}</style>

      {/* 1. TITLE AREA */}
      <div className="text-center mb-12">
        <h2 className="text-3xl font-semibold text-[#0A0A0A] tracking-tight mb-2">
          Select Your Models
        </h2>
        <p className="text-sm text-gray-500">
          Choose two models to battle head to head
        </p>
      </div>

      {/* 2. TWO MODEL CARDS + ANIMATED LINE */}
      <div className="flex flex-col md:flex-row items-stretch justify-between w-full gap-4 md:gap-0">
        
        {/* MODEL CARD A */}
        <div 
          className={`w-full md:w-[42%] min-h-[240px] border rounded-[16px] p-6 bg-white flex flex-col justify-between transition-all duration-200 ${
            modelA ? 'border-[#0A0A0A]' : 'border-gray-200'
          }`}
        >
          {modelA ? (
            /* Selected State A */
            <div className="flex flex-col items-start h-full justify-between">
              <div className="w-full">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
                  Model A
                </span>
                <h3 className="text-xl font-bold text-[#0A0A0A] mb-1 leading-snug">
                  {modelA.name}
                </h3>
                <code className="text-[11px] text-gray-500 font-mono mb-4 block break-all bg-gray-50 p-2 border border-gray-100 rounded-md">
                  {modelA.id}
                </code>
                <span className="inline-flex px-2.5 py-0.5 border border-gray-200 rounded-full text-[10px] font-medium text-gray-500 bg-gray-50 mb-6">
                  {modelA.domain}
                </span>
              </div>
              <button 
                onClick={() => {
                  setModelA(null);
                  setCustomIdA('');
                }}
                className="text-xs font-semibold text-gray-400 hover:text-black transition-colors underline decoration-dotted underline-offset-4"
              >
                Change Model
              </button>
            </div>
          ) : (
            /* Config state (Tabs A) */
            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                  Model A
                </span>
                
                {/* Tabs A */}
                <div className="flex gap-1.5 mb-5 p-1 bg-gray-50 rounded-full border border-gray-100 max-w-max">
                  <button
                    onClick={() => setActiveTabA('browse')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                      activeTabA === 'browse'
                        ? 'bg-black text-white'
                        : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    Browse Models
                  </button>
                  <button
                    onClick={() => setActiveTabA('paste')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                      activeTabA === 'paste'
                        ? 'bg-black text-white'
                        : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    Paste HF ID
                  </button>
                </div>

                {/* Tab content A */}
                {activeTabA === 'browse' ? (
                  <select
                    onChange={(e) => handleSelectA(e.target.value)}
                    value=""
                    className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm text-[#0A0A0A] bg-white focus:border-black focus:outline-none transition-colors"
                  >
                    <option value="" disabled>Select a model...</option>
                    <optgroup label="Medical">
                      <option value="medalpaca/medalpaca-7b">MedAlpaca 7B (medalpaca/medalpaca-7b)</option>
                      <option value="microsoft/BiomedNLP-PubMedBERT-base">PubMedBERT Base (microsoft/BiomedNLP-PubMedBERT-base)</option>
                    </optgroup>
                    <optgroup label="Legal">
                      <option value="pile-of-law/legalbert-large">LegalBERT Large (pile-of-law/legalbert-large)</option>
                      <option value="nlpaueb/legal-bert-base-uncased">Legal BERT Base (nlpaueb/legal-bert-base-uncased)</option>
                    </optgroup>
                    <optgroup label="Coding">
                      <option value="bigcode/starcoder2-3b">StarCoder2 3B (bigcode/starcoder2-3b)</option>
                      <option value="Salesforce/codegen-350M-mono">CodeGen 350M (Salesforce/codegen-350M-mono)</option>
                    </optgroup>
                    <optgroup label="General">
                      <option value="mistralai/Mistral-7B-v0.1">Mistral 7B (mistralai/Mistral-7B-v0.1)</option>
                      <option value="google/flan-t5-base">Flan T5 Base (google/flan-t5-base)</option>
                      <option value="facebook/opt-1.3b">OPT 1.3B (facebook/opt-1.3b)</option>
                      <option value="tiiuae/falcon-7b-instruct">Falcon 7B (tiiuae/falcon-7b-instruct)</option>
                    </optgroup>
                  </select>
                ) : (
                  <div className="flex flex-col w-full">
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        placeholder="e.g. mistralai/Mistral-7B-v0.1"
                        value={customIdA}
                        onChange={(e) => setCustomIdA(e.target.value)}
                        className="flex-grow min-w-0 h-10 border border-gray-200 rounded-lg px-3 text-sm text-[#0A0A0A] focus:border-black focus:outline-none"
                      />
                      <button
                        onClick={handleValidateA}
                        className="h-10 px-3.5 border border-black text-black text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wider flex-shrink-0"
                      >
                        Validate
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2">
                      Paste any HuggingFace model ID
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* CONNECTION AREA (CENTER) */}
        <div className="w-full md:w-[16%] flex md:flex-col items-center justify-center py-6 md:py-0 relative">
          
          {/* Desktop Connection Line */}
          <div className="hidden md:block w-full relative h-[40px] flex items-center justify-center">
            {/* Line */}
            <div className={`w-full h-[2px] transition-all duration-300 ${bothSelected ? 'bg-gray-200' : 'bg-gray-200 border-t border-dashed'}`} />
            
            {/* Dots */}
            {bothSelected && (
              <>
                <div className="dot-h" style={{ animationDelay: '0s' }} />
                <div className="dot-h" style={{ animationDelay: '0.66s' }} />
                <div className="dot-h" style={{ animationDelay: '1.33s' }} />
              </>
            )}
            
            {/* VS Badge */}
            {!bothSelected && (
              <div className="absolute w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-xs font-bold text-gray-400 select-none">
                VS
              </div>
            )}

            {/* Connected Tag */}
            {bothSelected && (
              <div className="absolute top-8 text-center w-full">
                <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-wider">
                  Connected ✓
                </span>
              </div>
            )}
          </div>

          {/* Mobile Connection Line */}
          <div className="md:hidden w-full relative h-[60px] flex items-center justify-center">
            {/* Line */}
            <div className={`h-full w-[2px] transition-all duration-300 ${bothSelected ? 'bg-gray-200' : 'bg-gray-200 border-l border-dashed'}`} />
            
            {/* Dots */}
            {bothSelected && (
              <>
                <div className="dot-v" style={{ animationDelay: '0s' }} />
                <div className="dot-v" style={{ animationDelay: '0.66s' }} />
                <div className="dot-v" style={{ animationDelay: '1.33s' }} />
              </>
            )}
            
            {/* VS Badge */}
            {!bothSelected && (
              <div className="absolute w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-xs font-bold text-gray-400 select-none">
                VS
              </div>
            )}

            {/* Connected Tag */}
            {bothSelected && (
              <div className="absolute left-6 text-left">
                <span className="text-[9px] font-bold text-[#16a34a] uppercase tracking-wider">
                  Connected ✓
                </span>
              </div>
            )}
          </div>
        </div>

        {/* MODEL CARD B */}
        <div 
          className={`w-full md:w-[42%] min-h-[240px] border rounded-[16px] p-6 bg-white flex flex-col justify-between transition-all duration-200 ${
            modelB ? 'border-[#0A0A0A]' : 'border-gray-200'
          }`}
        >
          {modelB ? (
            /* Selected State B */
            <div className="flex flex-col items-start h-full justify-between">
              <div className="w-full">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-4">
                  Model B
                </span>
                <h3 className="text-xl font-bold text-[#0A0A0A] mb-1 leading-snug">
                  {modelB.name}
                </h3>
                <code className="text-[11px] text-gray-500 font-mono mb-4 block break-all bg-gray-50 p-2 border border-gray-100 rounded-md">
                  {modelB.id}
                </code>
                <span className="inline-flex px-2.5 py-0.5 border border-gray-200 rounded-full text-[10px] font-medium text-gray-500 bg-gray-50 mb-6">
                  {modelB.domain}
                </span>
              </div>
              <button 
                onClick={() => {
                  setModelB(null);
                  setCustomIdB('');
                }}
                className="text-xs font-semibold text-gray-400 hover:text-black transition-colors underline decoration-dotted underline-offset-4"
              >
                Change Model
              </button>
            </div>
          ) : (
            /* Config state (Tabs B) */
            <div className="flex flex-col h-full justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-3">
                  Model B
                </span>
                
                {/* Tabs B */}
                <div className="flex gap-1.5 mb-5 p-1 bg-gray-50 rounded-full border border-gray-100 max-w-max">
                  <button
                    onClick={() => setActiveTabB('browse')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                      activeTabB === 'browse'
                        ? 'bg-black text-white'
                        : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    Browse Models
                  </button>
                  <button
                    onClick={() => setActiveTabB('paste')}
                    className={`px-3 py-1 text-[11px] font-semibold rounded-full transition-all ${
                      activeTabB === 'paste'
                        ? 'bg-black text-white'
                        : 'text-gray-400 hover:text-black'
                    }`}
                  >
                    Paste HF ID
                  </button>
                </div>

                {/* Tab content B */}
                {activeTabB === 'browse' ? (
                  <select
                    onChange={(e) => handleSelectB(e.target.value)}
                    value=""
                    className="w-full h-10 border border-gray-200 rounded-lg px-2 text-sm text-[#0A0A0A] bg-white focus:border-black focus:outline-none transition-colors"
                  >
                    <option value="" disabled>Select a model...</option>
                    <optgroup label="Medical">
                      <option value="medalpaca/medalpaca-7b">MedAlpaca 7B (medalpaca/medalpaca-7b)</option>
                      <option value="microsoft/BiomedNLP-PubMedBERT-base">PubMedBERT Base (microsoft/BiomedNLP-PubMedBERT-base)</option>
                    </optgroup>
                    <optgroup label="Legal">
                      <option value="pile-of-law/legalbert-large">LegalBERT Large (pile-of-law/legalbert-large)</option>
                      <option value="nlpaueb/legal-bert-base-uncased">Legal BERT Base (nlpaueb/legal-bert-base-uncased)</option>
                    </optgroup>
                    <optgroup label="Coding">
                      <option value="bigcode/starcoder2-3b">StarCoder2 3B (bigcode/starcoder2-3b)</option>
                      <option value="Salesforce/codegen-350M-mono">CodeGen 350M (Salesforce/codegen-350M-mono)</option>
                    </optgroup>
                    <optgroup label="General">
                      <option value="mistralai/Mistral-7B-v0.1">Mistral 7B (mistralai/Mistral-7B-v0.1)</option>
                      <option value="google/flan-t5-base">Flan T5 Base (google/flan-t5-base)</option>
                      <option value="facebook/opt-1.3b">OPT 1.3B (facebook/opt-1.3b)</option>
                      <option value="tiiuae/falcon-7b-instruct">Falcon 7B (tiiuae/falcon-7b-instruct)</option>
                    </optgroup>
                  </select>
                ) : (
                  <div className="flex flex-col w-full">
                    <div className="flex gap-2 w-full">
                      <input
                        type="text"
                        placeholder="e.g. mistralai/Mistral-7B-v0.1"
                        value={customIdB}
                        onChange={(e) => setCustomIdB(e.target.value)}
                        className="flex-grow min-w-0 h-10 border border-gray-200 rounded-lg px-3 text-sm text-[#0A0A0A] focus:border-black focus:outline-none"
                      />
                      <button
                        onClick={handleValidateB}
                        className="h-10 px-3.5 border border-black text-black text-xs font-semibold rounded-lg hover:bg-gray-50 transition-colors uppercase tracking-wider flex-shrink-0"
                      >
                        Validate
                      </button>
                    </div>
                    <span className="text-[10px] text-gray-400 mt-2">
                      Paste any HuggingFace model ID
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

      </div>

      {/* 3. DOMAIN SELECTOR */}
      <div className="w-full mt-10">
        <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-3">
          What domain are you testing?
        </label>
        <select
          value={domain || ""}
          onChange={(e) => setDomain(e.target.value || null)}
          className="w-full h-11 px-3 border border-gray-200 rounded-lg bg-white text-[#0A0A0A] text-sm focus:border-black focus:outline-none transition-colors"
        >
          <option value="" disabled>Select testing domain...</option>
          <option value="Medical">Medical</option>
          <option value="Legal">Legal</option>
          <option value="Finance">Finance</option>
          <option value="Coding">Coding</option>
          <option value="Education">Education</option>
          <option value="HR">HR</option>
          <option value="General">General</option>
        </select>
      </div>

      {/* 4. CONNECT BUTTON */}
      <div className="flex justify-center mt-10">
        <button
          disabled={!connectEnabled}
          onClick={onSuccess}
          className={`h-11 w-[240px] text-xs font-semibold rounded-[12px] uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            connectEnabled 
              ? 'bg-[#0A0A0A] text-white hover:bg-black/90 cursor-pointer' 
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          Connect Models &rarr;
        </button>
      </div>
    </div>
  );
}
