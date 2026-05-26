import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Loader, AlertTriangle, RefreshCw, Layers } from 'lucide-react';

export default function LiveBattle({ modelA, modelB, datasetConfig, onNext, onBack, domain }) {
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Pagination states
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const fetchTestCases = () => {
    if (datasetConfig?.type === 'auto') {
      setLoading(true);
      setError(null);
      
      console.log("Fetching test cases from backend for domain:", domain, "Model A:", modelA?.id, "Model B:", modelB?.id);

      fetch('http://localhost:8000/api/battle/generate-tests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          domain: domain || 'General Text Tasks',
          count: datasetConfig.questionCount || 20,
          difficulty: datasetConfig.difficulty || 'balanced',
          question_types: datasetConfig.questionTypes || ['factual', 'reasoning', 'edge_cases'],
          model_a: modelA?.id || '',
          model_b: modelB?.id || ''
        })
      })
      .then(res => {
        if (!res.ok) {
          throw new Error(`Server returned status ${res.status}`);
        }
        return res.json();
      })
      .then(data => {
        if (data.success) {
          setQuestions(data.questions || []);
          setCurrentPage(1);
        } else {
          throw new Error(data.error || 'Failed to generate test cases');
        }
        setLoading(false);
      })
      .catch(err => {
        console.error("Error generating test cases:", err);
        setError(err.message || 'Failed to generate test cases. Make sure the backend is running and LLM API key is valid.');
        setLoading(false);
      });
    } else if (datasetConfig?.type === 'manual') {
      const formatted = (datasetConfig.questions || []).map((q, idx) => ({
        id: idx + 1,
        question: q,
        category: 'Manual',
        difficulty: 'Custom',
        expected_keywords: []
      }));
      setQuestions(formatted);
      setLoading(false);
    } else if (datasetConfig?.type === 'upload') {
      // Mock CSV parsing
      const mockCsv = Array.from({ length: 15 }, (_, idx) => ({
        id: idx + 1,
        question: `Sample imported question #${idx + 1} from '${datasetConfig.fileName || 'dataset.csv'}' addressing ${domain || 'General Domain'}.`,
        category: 'CSV Upload',
        difficulty: 'Imported',
        expected_keywords: ['csv', 'imported', 'keyword']
      }));
      setQuestions(mockCsv);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTestCases();
  }, [datasetConfig, domain]);

  const totalPages = Math.ceil(questions.length / itemsPerPage) || 1;
  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedQuestions = questions.slice(startIndex, startIndex + itemsPerPage);

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Loading Screen
  if (loading) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 flex flex-col items-center justify-center text-center">
        <div className="relative mb-6">
          <div className="w-12 h-12 rounded-full border border-gray-100 flex items-center justify-center bg-[#F9FAFB]">
            <Loader className="w-6 h-6 text-[#0A0A0A] animate-spin" />
          </div>
          <span className="absolute -top-1 -right-1 flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#0A0A0A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0A0A0A]"></span>
          </span>
        </div>
        <h3 className="text-lg font-bold text-[#0A0A0A] tracking-tight">Generating Test Cases...</h3>
        <p className="text-xs text-[#6B7280] mt-2 max-w-xs leading-relaxed">
          LLM is crafting domain-specific evaluation questions for your selected model comparison.
        </p>
      </div>
    );
  }

  // Error Screen
  if (error) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 rounded-full bg-red-50 border border-red-100 flex items-center justify-center mb-4 text-red-500">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <h3 className="text-lg font-bold text-[#0A0A0A] tracking-tight">Generation Failed</h3>
        <p className="text-xs text-red-600 mt-2 max-w-md leading-relaxed px-4">
          {error}
        </p>
        <button
          onClick={fetchTestCases}
          className="h-8 px-4 border border-[#E5E7EB] hover:border-[#0A0A0A] text-[#0A0A0A] text-xs font-semibold rounded-lg bg-white transition-all flex items-center gap-1.5 mt-6 hover:bg-[#F9FAFB]"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          Retry Generation
        </button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-2xl mx-auto py-2 text-[#0A0A0A]">
      {/* Header */}
      <div className="flex items-center justify-between pb-5 border-b border-[#E5E7EB] mb-6">
        <div className="text-left">
          <h2 className="text-xl font-bold tracking-tight text-[#0A0A0A]">Evaluation Test Cases</h2>
          <p className="text-xs text-[#6B7280] mt-0.5">
            Compare model performance across these generated questions
          </p>
        </div>
        <div className="flex items-center gap-2 bg-[#F9FAFB] border border-[#E5E7EB] px-3 py-1 rounded-full text-xs font-semibold text-[#0A0A0A]">
          <Layers className="w-3.5 h-3.5 text-[#6B7280]" />
          <span>{questions.length} total questions</span>
        </div>
      </div>

      {/* List */}
      <div className="flex flex-col border border-[#E5E7EB] bg-white rounded-[12px] divide-y divide-[#E5E7EB] overflow-hidden mb-6">
        {paginatedQuestions.map((item, idx) => {
          const absoluteIndex = startIndex + idx + 1;
          return (
            <div key={item.id || idx} className="p-5 flex gap-4 items-start hover:bg-[#F9FAFB] transition-colors">
              <span className="text-xs font-mono font-bold text-[#6B7280] select-none mt-0.5">
                {String(absoluteIndex).padStart(2, '0')}
              </span>
              <div className="flex-1 text-left min-w-0">
                <p className="text-sm font-semibold text-[#0A0A0A] leading-relaxed">
                  {item.question}
                </p>
                
                {/* Metadata row */}
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  {item.category && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280]">
                      {item.category}
                    </span>
                  )}
                  {item.difficulty && (
                    <span className="px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider bg-[#F9FAFB] border border-[#E5E7EB] text-[#6B7280]">
                      Diff: {item.difficulty}
                    </span>
                  )}
                  {item.expected_keywords && item.expected_keywords.length > 0 && (
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-wider">Keywords:</span>
                      {item.expected_keywords.slice(0, 3).map((kw, kIdx) => (
                        <span key={kIdx} className="px-1.5 py-0.5 rounded text-[9px] font-semibold bg-gray-50 border border-gray-100 text-[#0A0A0A] font-mono">
                          {kw}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between py-2 border-t border-[#E5E7EB] mb-8">
          <button
            onClick={handlePrevPage}
            disabled={currentPage === 1}
            className="h-8 px-3 border border-[#E5E7EB] hover:border-[#0A0A0A] text-[#0A0A0A] text-xs font-semibold rounded-lg bg-white transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Previous
          </button>
          <span className="text-xs text-[#6B7280] font-medium">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
            className="h-8 px-3 border border-[#E5E7EB] hover:border-[#0A0A0A] text-[#0A0A0A] text-xs font-semibold rounded-lg bg-white transition-all flex items-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-[#F9FAFB]"
          >
            Next <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Navigation Footer */}
      <div className="flex items-center justify-between border-t border-[#E5E7EB] pt-6 mt-6">
        <button
          onClick={onBack}
          className="h-10 px-5 border border-[#0A0A0A] text-[#0A0A0A] text-xs font-semibold rounded-md hover:bg-[#F9FAFB] transition-colors uppercase tracking-wider flex items-center gap-1.5"
        >
          <ArrowLeft className="w-4 h-4" /> Back
        </button>
        <button
          onClick={() => onNext(questions)}
          className="h-10 px-6 bg-[#0A0A0A] text-white hover:bg-black/90 text-xs font-semibold rounded-md uppercase tracking-wider transition-all duration-200 flex items-center gap-1.5 cursor-pointer"
        >
          Run Evaluation <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
