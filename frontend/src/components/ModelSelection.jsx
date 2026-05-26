import React, { useState, useEffect } from 'react';
import { Cpu, Search, Globe, Code, ShieldAlert, Heart, HardDrive, AlertCircle, ArrowDown, ThumbsUp, Layers, CheckCircle } from 'lucide-react';

const CATEGORIES = [
  { id: '', label: 'All Tasks' },
  { id: 'text-generation', label: 'Text Gen' },
  { id: 'text2text-generation', label: 'Text2Text' },
  { id: 'fill-mask', label: 'Fill Mask' },
  { id: 'sentence-similarity', label: 'Embeddings' }
];



export default function ModelSelection({
  modelA, setModelA,
  modelB, setModelB,
  onSuccess
}) {
  // Track which slot is actively being configured ('A', 'B', or null)
  const [activeSlot, setActiveSlot] = useState(null);
  
  const [activeTab, setActiveTab] = useState('browse'); // 'browse' or 'paste'
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [popularModels, setPopularModels] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const [activeCategoryA, setActiveCategoryA] = useState('');
  const [activeCategoryB, setActiveCategoryB] = useState('');

  const [customId, setCustomId] = useState('');
  const [validationLoading, setValidationLoading] = useState(false);
  const [validationError, setValidationError] = useState('');

  const bothSelected = modelA && modelB;
  const connectEnabled = modelA && modelB;

  // Utility to parse license tag from HuggingFace tags list
  const parseLicense = (tags) => {
    if (!tags || !Array.isArray(tags)) return 'Unknown';
    const licenseTag = tags.find(tag => tag.startsWith('license:'));
    return licenseTag ? licenseTag.replace('license:', '').toUpperCase() : 'Unknown';
  };

  // Utility to format counts (e.g. 10.5M, 240K)
  const formatCount = (num) => {
    if (num === undefined || num === null) return '0';
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num.toLocaleString();
  };

  // Fetch initial popular models from HuggingFace on mount
  useEffect(() => {
    fetch('https://huggingface.co/api/models?limit=10&sort=downloads&direction=-1')
      .then(res => res.json())
      .then(data => {
        const models = data.map(m => ({
          id: m.id,
          name: m.id.split('/').pop(),
          author: m.id.split('/')[0] || 'HF',
          downloads: m.downloads || 0,
          likes: m.likes || 0,
          license: parseLicense(m.tags),
          pipeline: m.pipeline_tag || 'Unknown'
        }));
        setPopularModels(models);
      })
      .catch(err => console.error("Error fetching popular models:", err));
  }, []);

  // Fetch search & category results when search query or category filter changes
  useEffect(() => {
    if (!activeSlot) return;

    setIsLoading(true);
    const activeCategory = activeSlot === 'A' ? activeCategoryA : activeCategoryB;
    
    let url = `https://huggingface.co/api/models?limit=30&sort=downloads&direction=-1`;
    if (searchQuery.trim()) {
      url += `&search=${encodeURIComponent(searchQuery.trim())}`;
    }
    if (activeCategory) {
      url += `&filter=${activeCategory}`;
    }

    const timer = setTimeout(() => {
      fetch(url)
        .then(res => res.json())
        .then(data => {
          const models = data.map(m => ({
            id: m.id,
            name: m.id.split('/').pop(),
            author: m.id.split('/')[0] || 'HF',
            downloads: m.downloads || 0,
            likes: m.likes || 0,
            license: parseLicense(m.tags),
            pipeline: m.pipeline_tag || 'Unknown'
          }));
          setSearchResults(models);
          setIsLoading(false);
        })
        .catch(err => {
          console.error("Error searching models:", err);
          setIsLoading(false);
        });
    }, searchQuery.trim() ? 400 : 0);

    return () => clearTimeout(timer);
  }, [searchQuery, activeSlot, activeSlot === 'A' ? activeCategoryA : activeCategoryB]);

  const activeCategory = activeSlot === 'A' ? activeCategoryA : activeCategoryB;
  const setActiveCategory = activeSlot === 'A' ? setActiveCategoryA : setActiveCategoryB;

  // Validate custom pasted HuggingFace ID
  const handleValidateCustom = () => {
    if (!customId.trim()) return;
    setValidationLoading(true);
    setValidationError('');
    
    fetch(`https://huggingface.co/api/models/${customId.trim()}`)
      .then(res => {
        if (!res.ok) throw new Error("Model not found on HuggingFace");
        return res.json();
      })
      .then(data => {
        const modelObj = {
          id: data.id,
          name: data.id.split('/').pop(),
          author: data.id.split('/')[0] || 'HF',
          downloads: data.downloads || 0,
          likes: data.likes || 0,
          license: parseLicense(data.tags),
          pipeline: data.pipeline_tag || 'Unknown',
          domain: 'Custom'
        };
        
        if (activeSlot === 'A') {
          setModelA(modelObj);
        } else {
          setModelB(modelObj);
        }
        
        // Reset console state
        setActiveSlot(null);
        setCustomId('');
        setValidationError('');
        setValidationLoading(false);
      })
      .catch(err => {
        setValidationError(err.message);
        setValidationLoading(false);
      });
  };

  const handleSelectModel = (model) => {
    const modelObj = {
      id: model.id,
      name: model.name,
      author: model.author,
      downloads: model.downloads,
      likes: model.likes,
      license: model.license,
      pipeline: model.pipeline,
      domain: 'Preset'
    };

    if (activeSlot === 'A') {
      setModelA(modelObj);
    } else {
      setModelB(modelObj);
    }
    
    // Close console after selection
    setActiveSlot(null);
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-4xl mx-auto py-2 text-[#0A0A0A]">
      {/* CSS Keyframes for SVG Stroke Dash Offset animation (n8n-style flow) */}
      <style>{`
        @keyframes n8nFlowHorizontal {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        @keyframes n8nFlowVertical {
          from {
            stroke-dashoffset: 20;
          }
          to {
            stroke-dashoffset: 0;
          }
        }

        .n8n-flow-h {
          stroke-dasharray: 5 5;
          animation: n8nFlowHorizontal 0.8s linear infinite;
        }

        .n8n-flow-v {
          stroke-dasharray: 5 5;
          animation: n8nFlowVertical 0.8s linear infinite;
        }

        /* Custom scrollbar to keep layout premium */
        .custom-scroll::-webkit-scrollbar {
          width: 5px;
          height: 5px;
        }
        .custom-scroll::-webkit-scrollbar-track {
          background: #F9FAFB;
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb {
          background: #E5E7EB;
          border-radius: 4px;
        }
        .custom-scroll::-webkit-scrollbar-thumb:hover {
          background: #D1D5DB;
        }
      `}</style>

      {/* TWO MODEL CARDS + ANIMATED LINE */}
      <div className="flex flex-col md:flex-row items-stretch justify-between w-full gap-4 md:gap-0 mt-4">
        
        {/* MODEL CARD A */}
        {modelA ? (
          /* Selected State A */
          <div className="w-full md:w-[42%] min-h-[170px] border border-black ring-1 ring-black rounded-[16px] p-6 bg-white flex flex-col justify-between transition-all duration-300">
            <div className="w-full">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Model A Selected</span>
                <span className="inline-flex px-2 py-0.5 border border-gray-200 rounded-full text-[9px] font-medium text-gray-500 bg-gray-50">
                  {modelA.pipeline}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs uppercase font-mono flex-shrink-0">
                  {modelA.author.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#0A0A0A] leading-snug truncate" title={modelA.name}>
                    {modelA.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium block">by {modelA.author}</span>
                </div>
              </div>
              <code className="text-[10px] text-gray-500 font-mono block break-all bg-gray-50/50 p-2 border border-gray-100 rounded-md">
                {modelA.id}
              </code>
            </div>

            <button 
              onClick={() => {
                setModelA(null);
                setActiveSlot('A');
              }}
              className="text-xs font-semibold text-gray-400 hover:text-black transition-colors underline decoration-dotted underline-offset-4 mt-5 self-start"
            >
              Change Model
            </button>
          </div>
        ) : (
          /* Empty State A */
          <button
            onClick={() => setActiveSlot(activeSlot === 'A' ? null : 'A')}
            className={`w-full md:w-[42%] min-h-[170px] border rounded-[16px] p-6 bg-white flex flex-col items-center justify-center gap-3 transition-all duration-200 group ${
              activeSlot === 'A' 
                ? 'border-black ring-1 ring-black bg-gray-50/20' 
                : 'border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50/30'
            }`}
          >
            <div className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-black block">Select Model A</span>
              <span className="text-xs text-gray-400 block mt-0.5">Click to browse or paste repo ID</span>
            </div>
          </button>
        )}

        {/* CONNECTION AREA (CENTER) */}
        <div className="w-full md:w-[16%] flex md:flex-col items-center justify-center py-6 md:py-0 relative">
          
          {/* Desktop Connection Line SVG */}
          <div className="hidden md:block w-full relative h-[40px]">
            <svg className="w-full h-[6px] absolute top-1/2 left-0 -translate-y-1/2 overflow-visible" fill="none">
              <line
                x1="0"
                y1="3"
                x2="100%"
                y2="3"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              {bothSelected && (
                <line
                  x1="0"
                  y1="3"
                  x2="100%"
                  y2="3"
                  stroke="#0A0A0A"
                  strokeWidth="2"
                  className="n8n-flow-h"
                />
              )}
            </svg>
            
            {/* VS Badge */}
            {!bothSelected && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-xs font-bold text-gray-400 select-none">
                VS
              </div>
            )}
          </div>

          {/* Mobile Connection Line SVG */}
          <div className="md:hidden w-full relative h-[60px] flex items-center justify-center">
            <svg className="h-full w-[6px] absolute top-0 left-1/2 -translate-x-1/2 overflow-visible" fill="none">
              <line
                x1="3"
                y1="0"
                x2="3"
                y2="100%"
                stroke="#E5E7EB"
                strokeWidth="2"
              />
              {bothSelected && (
                <line
                  x1="3"
                  y1="0"
                  x2="3"
                  y2="100%"
                  stroke="#0A0A0A"
                  strokeWidth="2"
                  className="n8n-flow-v"
                />
              )}
            </svg>
            
            {/* VS Badge */}
            {!bothSelected && (
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full border border-gray-200 bg-white flex items-center justify-center text-xs font-bold text-gray-400 select-none">
                VS
              </div>
            )}
          </div>
        </div>

        {/* MODEL CARD B */}
        {modelB ? (
          /* Selected State B */
          <div className="w-full md:w-[42%] min-h-[170px] border border-black ring-1 ring-black rounded-[16px] p-6 bg-white flex flex-col justify-between transition-all duration-300">
            <div className="w-full">
              <div className="flex items-center justify-between mb-3.5">
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Model B Selected</span>
                <span className="inline-flex px-2 py-0.5 border border-gray-200 rounded-full text-[9px] font-medium text-gray-500 bg-gray-50">
                  {modelB.pipeline}
                </span>
              </div>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-8 h-8 rounded-lg bg-black text-white flex items-center justify-center font-bold text-xs uppercase font-mono flex-shrink-0">
                  {modelB.author.slice(0, 2)}
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#0A0A0A] leading-snug truncate" title={modelB.name}>
                    {modelB.name}
                  </h3>
                  <span className="text-[10px] text-gray-400 font-medium block">by {modelB.author}</span>
                </div>
              </div>
              <code className="text-[10px] text-gray-500 font-mono block break-all bg-gray-50/50 p-2 border border-gray-100 rounded-md">
                {modelB.id}
              </code>
            </div>

            <button 
              onClick={() => {
                setModelB(null);
                setActiveSlot('B');
              }}
              className="text-xs font-semibold text-gray-400 hover:text-black transition-colors underline decoration-dotted underline-offset-4 mt-5 self-start"
            >
              Change Model
            </button>
          </div>
        ) : (
          /* Empty State B */
          <button
            onClick={() => setActiveSlot(activeSlot === 'B' ? null : 'B')}
            className={`w-full md:w-[42%] min-h-[170px] border rounded-[16px] p-6 bg-white flex flex-col items-center justify-center gap-3 transition-all duration-200 group ${
              activeSlot === 'B' 
                ? 'border-black ring-1 ring-black bg-gray-50/20' 
                : 'border-dashed border-gray-200 hover:border-gray-400 hover:bg-gray-50/30'
            }`}
          >
            <div className="w-10 h-10 rounded-full border border-gray-100 bg-gray-50 flex items-center justify-center text-gray-400 group-hover:text-black transition-colors">
              <Cpu className="w-5 h-5" />
            </div>
            <div className="text-center">
              <span className="text-sm font-bold text-black block">Select Model B</span>
              <span className="text-xs text-gray-400 block mt-0.5">Click to browse or paste repo ID</span>
            </div>
          </button>
        )}

      </div>

      {/* DEDICATED SEARCH CONSOLE (POPS DOWN BELOW SLOTS ROW) */}
      {activeSlot && (
        <div className="w-full mt-8 border border-gray-200 rounded-[16px] bg-white p-6 animate-in fade-in slide-in-from-top-4 duration-300">
          {/* Header */}
          <div className="flex items-center justify-between mb-5 pb-4 border-b border-gray-100">
            <div>
              <h3 className="text-base font-bold text-black flex items-center gap-2">
                <span>Select Model for Slot {activeSlot}</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Browse our live trending repository list or paste a custom HuggingFace ID.
              </p>
            </div>
            <button 
              onClick={() => {
                setActiveSlot(null);
                setSearchQuery('');
                setCustomId('');
                setValidationError('');
              }}
              className="text-xs font-semibold text-gray-400 hover:text-black border border-gray-200 hover:border-black rounded-lg px-2.5 py-1 transition-all"
            >
              Close Panel [x]
            </button>
          </div>

          {/* Vercel-Style Segment Control tabs */}
          <div className="flex p-0.5 bg-gray-50 rounded-lg border border-gray-200/60 max-w-sm mb-6">
            <button
              onClick={() => {
                setActiveTab('browse');
                setValidationError('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'browse'
                  ? 'bg-white text-black shadow-sm border border-gray-200/30'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              Search HuggingFace
            </button>
            <button
              onClick={() => {
                setActiveTab('paste');
                setValidationError('');
              }}
              className={`flex-1 py-1.5 text-xs font-medium rounded-md transition-all ${
                activeTab === 'paste'
                  ? 'bg-white text-black shadow-sm border border-gray-200/30'
                  : 'text-gray-400 hover:text-black'
              }`}
            >
              HuggingFace ID
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'browse' ? (
            <div className="flex flex-col w-full">
              {/* Category pills */}
              <div className="flex gap-1.5 overflow-x-auto pb-3 mb-4 border-b border-gray-100 max-w-full custom-scroll">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setActiveCategory(cat.id)}
                    className={`px-3 py-1 text-[10px] font-bold uppercase rounded-full border transition-all flex-shrink-0 ${
                      activeCategory === cat.id
                        ? 'bg-black border-black text-white'
                        : 'bg-white border-gray-200 text-gray-400 hover:text-black hover:border-gray-300'
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>

              {/* Search bar */}
              <div className="relative w-full mb-5">
                <input
                  type="text"
                  placeholder="Type to search HuggingFace models..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-11 border border-gray-200 rounded-[12px] pl-10 pr-4 text-sm text-[#0A0A0A] bg-white focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                />
                <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400">
                  <Search className="w-4 h-4" />
                </div>
              </div>

              {/* Grid of Results */}
              <div className="max-h-[220px] overflow-y-auto pr-1 custom-scroll">
                {isLoading ? (
                  <div className="p-8 text-center text-xs text-gray-400 animate-pulse">
                    Fetching matching models from HuggingFace...
                  </div>
                ) : (searchQuery.trim() ? searchResults : popularModels).length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pb-2">
                    {(searchQuery.trim() ? searchResults : popularModels).map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectModel(m)}
                        className="text-left p-3.5 border border-gray-200 rounded-[12px] hover:border-black transition-all flex items-center justify-between gap-4 bg-white group cursor-pointer"
                      >
                        <div className="min-w-0 flex items-center gap-3">
                          <span className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-100 text-xs text-gray-500 font-bold uppercase font-mono flex items-center justify-center flex-shrink-0 group-hover:bg-black group-hover:text-white group-hover:border-black transition-colors">
                            {m.author.slice(0, 2)}
                          </span>
                          <div className="min-w-0">
                            <span className="text-sm font-bold text-black block truncate leading-tight">{m.name}</span>
                            <span className="text-[10px] text-gray-400 font-mono block truncate mt-0.5">{m.id}</span>
                          </div>
                        </div>
                        <div className="text-right flex-shrink-0 flex items-center gap-1 text-gray-400 text-xs">
                          <ArrowDown className="w-3.5 h-3.5" />
                          <span className="font-semibold">{formatCount(m.downloads)}</span>
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-gray-400 p-8 block text-center border border-dashed border-gray-100 rounded-lg">
                    No models found matching your query.
                  </span>
                )}
              </div>
            </div>
          ) : (
            /* Custom Paste HF ID */
            <div className="flex flex-col w-full max-w-xl">
              <div className="flex gap-2 w-full">
                <input
                  type="text"
                  placeholder="e.g. meta-llama/Llama-3-8B-Instruct"
                  value={customId}
                  onChange={(e) => setCustomId(e.target.value)}
                  className="flex-grow min-w-0 h-11 border border-gray-200 rounded-[12px] px-4 text-sm text-[#0A0A0A] focus:border-black focus:ring-1 focus:ring-black focus:outline-none transition-all"
                />
                <button
                  onClick={handleValidateCustom}
                  disabled={validationLoading}
                  className="h-11 px-5 border border-black text-black text-xs font-semibold rounded-[12px] hover:bg-gray-50 transition-colors uppercase tracking-wider flex-shrink-0 disabled:opacity-50"
                >
                  {validationLoading ? 'Validating...' : 'Validate ID'}
                </button>
              </div>
              {validationError && (
                <div className="text-[11px] text-red-500 mt-3 p-2 bg-red-50 rounded-lg border border-red-100/50 flex items-center gap-1.5">
                  <AlertCircle className="w-3.5 h-3.5" /> {validationError}
                </div>
              )}
              <span className="text-[10px] text-gray-400 mt-2.5">
                Paste any public HuggingFace model tag. The ID must be in the format: <code className="bg-gray-50 px-1 py-0.5 rounded font-mono">author/model-name</code>
              </span>
            </div>
          )}
        </div>
      )}

      {/* COMPARISON DETAILS SECTION */}
      {bothSelected && (
        <div className="w-full mt-10 border border-gray-200 rounded-[16px] bg-white p-6 animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-2 mb-5 pb-3 border-b border-gray-100">
            <Layers className="w-4 h-4 text-black" />
            <h3 className="text-sm font-bold text-black uppercase tracking-wider">
              Comparison Specifications
            </h3>
          </div>
          
          <div className="grid grid-cols-3 gap-4 text-center">
            {/* Headers */}
            <div className="text-left font-bold text-xs text-gray-400 uppercase tracking-wider">Metric</div>
            <div className="font-bold text-xs text-black uppercase tracking-wider truncate">{modelA.name}</div>
            <div className="font-bold text-xs text-black uppercase tracking-wider truncate">{modelB.name}</div>

            {/* Row: Author */}
            <div className="text-left text-xs font-semibold text-gray-400 border-t border-gray-50 py-3">Author</div>
            <div className="text-xs text-gray-700 border-t border-gray-50 py-3 truncate font-medium">{modelA.author}</div>
            <div className="text-xs text-gray-700 border-t border-gray-50 py-3 truncate font-medium">{modelB.author}</div>

            {/* Row: ID */}
            <div className="text-left text-xs font-semibold text-gray-400 border-t border-gray-50 py-3">Model ID</div>
            <div className="text-[11px] font-mono text-gray-500 border-t border-gray-50 py-3 break-all bg-gray-50/50 px-1 rounded truncate select-all" title={modelA.id}>{modelA.id}</div>
            <div className="text-[11px] font-mono text-gray-500 border-t border-gray-50 py-3 break-all bg-gray-50/50 px-1 rounded truncate select-all" title={modelB.id}>{modelB.id}</div>

            {/* Row: Downloads */}
            <div className="text-left text-xs font-semibold text-gray-400 border-t border-gray-50 py-3">Downloads</div>
            <div className="text-sm font-bold border-t border-gray-50 py-3 flex items-center justify-center gap-1.5">
              <span>{formatCount(modelA.downloads)}</span>
              {modelA.downloads > modelB.downloads && (
                <CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" title="Most downloaded" />
              )}
            </div>
            <div className="text-sm font-bold border-t border-gray-50 py-3 flex items-center justify-center gap-1.5">
              <span>{formatCount(modelB.downloads)}</span>
              {modelB.downloads > modelA.downloads && (
                <CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" title="Most downloaded" />
              )}
            </div>

            {/* Row: Likes */}
            <div className="text-left text-xs font-semibold text-gray-400 border-t border-gray-50 py-3">Likes</div>
            <div className="text-sm font-semibold border-t border-gray-50 py-3 flex items-center justify-center gap-1.5">
              <span className="text-gray-700">{formatCount(modelA.likes)}</span>
              {modelA.likes > modelB.likes && (
                <CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" title="Most liked" />
              )}
            </div>
            <div className="text-sm font-semibold border-t border-gray-50 py-3 flex items-center justify-center gap-1.5">
              <span className="text-gray-700">{formatCount(modelB.likes)}</span>
              {modelB.likes > modelA.likes && (
                <CheckCircle className="w-3.5 h-3.5 text-[#16a34a]" title="Most liked" />
              )}
            </div>

            {/* Row: License */}
            <div className="text-left text-xs font-semibold text-gray-400 border-t border-gray-50 py-3">License</div>
            <div className="text-xs font-semibold text-gray-600 border-t border-gray-50 py-3 uppercase">{modelA.license || 'N/A'}</div>
            <div className="text-xs font-semibold text-gray-600 border-t border-gray-50 py-3 uppercase">{modelB.license || 'N/A'}</div>

            {/* Row: Task Type */}
            <div className="text-left text-xs font-semibold text-gray-400 border-t border-gray-50 py-3">Task Type</div>
            <div className="text-xs text-gray-600 border-t border-gray-50 py-3 truncate max-w-[150px]" title={modelA.pipeline}>{modelA.pipeline || 'N/A'}</div>
            <div className="text-xs text-gray-600 border-t border-gray-50 py-3 truncate max-w-[150px]" title={modelB.pipeline}>{modelB.pipeline || 'N/A'}</div>
          </div>
        </div>
      )}



      {/* 4. CONNECT BUTTON */}
      <div className="flex justify-center mt-12">
        <button
          disabled={!connectEnabled}
          onClick={onSuccess}
          className={`h-11 w-[240px] text-xs font-semibold rounded-[12px] uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-1.5 ${
            connectEnabled 
              ? 'bg-[#0A0A0A] text-white hover:bg-black/90 cursor-pointer shadow-md' 
              : 'bg-gray-100 text-gray-400 border border-gray-200 cursor-not-allowed'
          }`}
        >
          Connect Models &rarr;
        </button>
      </div>
    </div>
  );
}
