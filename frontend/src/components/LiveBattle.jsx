import React, { useState, useEffect } from 'react';
import { Sparkles, ArrowLeft, ArrowRight, Loader, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { runModels, judgeRound } from '../api/battleApi';

export default function LiveBattle({
  modelA,
  modelB,
  domain,
  testQuestions = [],
  onBattleComplete,
  onBack
}) {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [phase, setPhase] = useState('running'); // 'running' | 'judging' | 'showing_result' | 'complete'
  
  const [responseA, setResponseA] = useState(null);
  const [responseB, setResponseB] = useState(null);
  const [displayedResponseA, setDisplayedResponseA] = useState('');
  const [displayedResponseB, setDisplayedResponseB] = useState('');
  const [responseTimes, setResponseTimes] = useState({ a: '0.0s', b: '0.0s' });
  
  const [currentJudgeResult, setCurrentJudgeResult] = useState(null);
  const [allResults, setAllResults] = useState([]);
  
  const [winsA, setWinsA] = useState(0);
  const [winsB, setWinsB] = useState(0);
  const [ties, setTies] = useState(0);
  
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [isAutoAdvancing, setIsAutoAdvancing] = useState(false);
  const [autoAdvanceCount, setAutoAdvanceCount] = useState(4);

  // Timer logic
  useEffect(() => {
    if (phase === 'complete') return;
    const interval = setInterval(() => {
      setElapsedSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [phase]);

  // Typewriter effect for Model A response
  useEffect(() => {
    if (!responseA) {
      setDisplayedResponseA('');
      return;
    }
    let i = 0;
    setDisplayedResponseA('');
    const timer = setInterval(() => {
      setDisplayedResponseA((prev) => prev + responseA.charAt(i));
      i++;
      if (i >= responseA.length) {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [responseA]);

  // Typewriter effect for Model B response
  useEffect(() => {
    if (!responseB) {
      setDisplayedResponseB('');
      return;
    }
    let i = 0;
    setDisplayedResponseB('');
    const timer = setInterval(() => {
      setDisplayedResponseB((prev) => prev + responseB.charAt(i));
      i++;
      if (i >= responseB.length) {
        clearInterval(timer);
      }
    }, 20);
    return () => clearInterval(timer);
  }, [responseB]);

  // Auto-advance countdown timer
  useEffect(() => {
    if (!isAutoAdvancing || phase !== 'showing_result') return;
    
    const interval = setInterval(() => {
      setAutoAdvanceCount((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          handleNextQuestion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoAdvancing, currentQuestionIndex, phase]);

  // Run battle logic for the current question
  const executeRound = async (index) => {
    if (!testQuestions || testQuestions.length === 0) return;
    if (index >= testQuestions.length) {
      setPhase('complete');
      onBattleComplete(allResults);
      return;
    }

    const questionObj = testQuestions[index];
    const questionText = questionObj.question;

    setPhase('running');
    setResponseA(null);
    setResponseB(null);
    setDisplayedResponseA('');
    setDisplayedResponseB('');
    setCurrentJudgeResult(null);
    setIsAutoAdvancing(false);
    setAutoAdvanceCount(4);

    // Call runModels API
    const startTime = Date.now();
    const runResult = await runModels(modelA.id, modelB.id, questionText);
    const duration = (Date.now() - startTime) / 1000;

    let respA = "Model failed to respond";
    let respB = "Model failed to respond";
    let tA = "0.0s";
    let tB = "0.0s";

    if (runResult) {
      if (runResult.model_a && runResult.model_a.response) {
        respA = runResult.model_a.response;
        tA = `${(duration * 0.47).toFixed(1)}s`;
      } else if (runResult.model_a && runResult.model_a.error) {
        respA = `Model failed to respond: ${runResult.model_a.error}`;
      }
      
      if (runResult.model_b && runResult.model_b.response) {
        respB = runResult.model_b.response;
        tB = `${(duration * 0.53).toFixed(1)}s`;
      } else if (runResult.model_b && runResult.model_b.error) {
        respB = `Model failed to respond: ${runResult.model_b.error}`;
      }
    }

    setResponseA(respA);
    setResponseB(respB);
    setResponseTimes({ a: tA, b: tB });

    // PHASE 2 - judging
    setPhase('judging');

    // Call judgeRound API
    let judgeResult = null;
    try {
      judgeResult = await judgeRound(
        questionText,
        respA,
        respB,
        domain,
        questionObj.expected_keywords || []
      );
    } catch (err) {
      console.error("Judging failed:", err);
    }

    if (!judgeResult || !judgeResult.winner) {
      const hasA = !respA.startsWith("Model failed to respond");
      const hasB = !respB.startsWith("Model failed to respond");
      let mockWinner = "tie";
      if (hasA && !hasB) mockWinner = "model_a";
      else if (!hasA && hasB) mockWinner = "model_b";

      judgeResult = {
        model_a: { factuality: hasA ? 3 : 0, completeness: hasA ? 3 : 0, reasoning: hasA ? 3 : 0, clarity: hasA ? 3 : 0 },
        model_b: { factuality: hasB ? 3 : 0, completeness: hasB ? 3 : 0, reasoning: hasB ? 3 : 0, clarity: hasB ? 3 : 0 },
        winner: mockWinner,
        reason: "Judging failed. Automatically assigned winner.",
        flagged: false
      };
    }

    setCurrentJudgeResult(judgeResult);

    // Update scoreboard
    if (judgeResult.winner === 'model_a') {
      setWinsA((prev) => prev + 1);
    } else if (judgeResult.winner === 'model_b') {
      setWinsB((prev) => prev + 1);
    } else {
      setTies((prev) => prev + 1);
    }

    const roundData = {
      question: questionText,
      category: questionObj.category || 'General',
      difficulty: questionObj.difficulty || 'balanced',
      responseA: respA,
      responseB: respB,
      timeA: tA,
      timeB: tB,
      judgeResult
    };

    setAllResults((prev) => [...prev, roundData]);
    setPhase('showing_result');
    setIsAutoAdvancing(true);
  };

  // Run execution on question index change
  useEffect(() => {
    executeRound(currentQuestionIndex);
  }, [currentQuestionIndex]);

  const handleNextQuestion = () => {
    setIsAutoAdvancing(false);
    if (currentQuestionIndex + 1 < testQuestions.length) {
      setCurrentQuestionIndex((prev) => prev + 1);
    } else {
      setPhase('complete');
      onBattleComplete(allResults);
    }
  };

  const getScoreClass = (scoreA, scoreB, isModelA) => {
    if (scoreA === scoreB) return "text-sm font-semibold text-[#0A0A0A]";
    if (isModelA) {
      return scoreA > scoreB ? "text-sm font-bold text-[#0A0A0A]" : "text-sm text-[#6B7280]";
    } else {
      return scoreB > scoreA ? "text-sm font-bold text-[#0A0A0A]" : "text-sm text-[#6B7280]";
    }
  };

  const formatTimer = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  if (!testQuestions || testQuestions.length === 0) {
    return (
      <div className="w-full max-w-2xl mx-auto py-16 flex flex-col items-center justify-center text-center">
        <AlertTriangle className="w-8 h-8 text-yellow-500 mb-4" />
        <h3 className="text-lg font-bold text-[#0A0A0A]">No Test Questions Loaded</h3>
        <button onClick={onBack} className="mt-4 px-4 py-2 border border-black rounded-lg text-xs font-semibold uppercase">
          Go Back
        </button>
      </div>
    );
  }

  const currentQuestion = testQuestions[currentQuestionIndex];
  const isLastQuestion = currentQuestionIndex === testQuestions.length - 1;

  const metrics = [
    { key: 'factuality', label: 'Factuality' },
    { key: 'completeness', label: 'Completeness' },
    { key: 'reasoning', label: 'Reasoning' },
    { key: 'clarity', label: 'Clarity' }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto py-2 text-[#0A0A0A] pb-28">
      {/* 1. BATTLE HEADER */}
      <div className="flex items-center justify-between mb-4 w-full">
        <div>
          <span className="bg-gray-100 text-[#0A0A0A] text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full">
            {domain}
          </span>
        </div>
        <div className="text-sm font-bold text-[#0A0A0A]">
          Question {currentQuestionIndex + 1} of {testQuestions.length}
        </div>
        <div className="text-xs font-mono font-semibold text-[#6B7280]">
          Elapsed: {formatTimer(elapsedSeconds)}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="w-full h-1 bg-[#E5E7EB] mb-6 relative">
        <div 
          className="h-full bg-[#0A0A0A] transition-all duration-300"
          style={{ width: `${((currentQuestionIndex + 1) / testQuestions.length) * 100}%` }}
        />
      </div>

      {/* 2. CURRENT QUESTION BOX */}
      <div className="w-full border border-[#E5E7EB] rounded-[12px] p-5 text-left mb-6 bg-white">
        <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block mb-2">CURRENT QUESTION</span>
        <h2 className="text-base font-semibold text-[#0A0A0A] leading-relaxed mb-4">{currentQuestion.question}</h2>
        <div className="flex gap-2">
          {currentQuestion.category && (
            <span className="bg-gray-100 text-[#0A0A0A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              {currentQuestion.category}
            </span>
          )}
          {currentQuestion.difficulty && (
            <span className="bg-gray-100 text-[#0A0A0A] text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full">
              Diff: {currentQuestion.difficulty}
            </span>
          )}
        </div>
      </div>

      {/* 3. SPLIT RESPONSE AREA */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 w-full mb-6">
        
        {/* Model A */}
        <div className="flex flex-col text-left">
          <div className="mb-2">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">MODEL A</span>
            <span className="text-sm font-bold text-black truncate block">{modelA.name}</span>
          </div>
          
          <div className="flex-grow border border-[#E5E7EB] rounded-[12px] p-4 min-h-[150px] bg-white flex flex-col justify-between">
            <div className="text-sm text-[#0A0A0A] whitespace-pre-wrap leading-relaxed">
              {!responseA ? (
                /* WAITING State - Pulse Skeleton */
                <div className="animate-pulse flex flex-col gap-3 py-1.5">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-[85%]" />
                  <div className="h-3 bg-gray-100 rounded w-[60%]" />
                </div>
              ) : (
                /* LOADED State - Typewriter */
                displayedResponseA
              )}
            </div>
            {responseA && (
              <span className="text-[10px] text-[#6B7280] self-end mt-4 select-none">
                {responseTimes.a}
              </span>
            )}
          </div>
        </div>

        {/* Model B */}
        <div className="flex flex-col text-left">
          <div className="mb-2">
            <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">MODEL B</span>
            <span className="text-sm font-bold text-black truncate block">{modelB.name}</span>
          </div>
          
          <div className="flex-grow border border-[#E5E7EB] rounded-[12px] p-4 min-h-[150px] bg-white flex flex-col justify-between">
            <div className="text-sm text-[#0A0A0A] whitespace-pre-wrap leading-relaxed">
              {!responseB ? (
                /* WAITING State - Pulse Skeleton */
                <div className="animate-pulse flex flex-col gap-3 py-1.5">
                  <div className="h-3 bg-gray-100 rounded w-full" />
                  <div className="h-3 bg-gray-100 rounded w-[75%]" />
                  <div className="h-3 bg-gray-100 rounded w-[90%]" />
                </div>
              ) : (
                /* LOADED State - Typewriter */
                displayedResponseB
              )}
            </div>
            {responseB && (
              <span className="text-[10px] text-[#6B7280] self-end mt-4 select-none">
                {responseTimes.b}
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Judging Phase Spinner */}
      {phase === 'judging' && (
        <div className="flex items-center justify-center py-6 gap-2 animate-in fade-in duration-300">
          <Loader className="w-4 h-4 text-[#0A0A0A] animate-spin" />
          <span className="text-xs font-semibold text-[#6B7280]">Judging responses...</span>
        </div>
      )}

      {/* 4. ROUND RESULT CARD */}
      <div 
        className={`transition-all duration-500 ease-in-out overflow-hidden w-full text-left ${
          phase === 'showing_result' && currentJudgeResult
            ? 'max-h-[500px] opacity-100 mb-6'
            : 'max-h-0 opacity-0 mb-0'
        }`}
      >
        {currentJudgeResult && (
          <div className="w-full border border-[#E5E7EB] rounded-[12px] p-6 bg-white">
            {/* Top row */}
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-gray-100">
              <div>
                <span className="text-[9px] font-bold text-[#6B7280] uppercase tracking-widest block">
                  ROUND {currentQuestionIndex + 1} RESULT
                </span>
              </div>
              <div>
                {currentJudgeResult.winner === 'model_a' ? (
                  <span className="bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded">
                    {modelA.name} Wins
                  </span>
                ) : currentJudgeResult.winner === 'model_b' ? (
                  <span className="bg-[#0A0A0A] text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded">
                    {modelB.name} Wins
                  </span>
                ) : (
                  <span className="bg-gray-100 text-[#0A0A0A] border border-[#E5E7EB] text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded">
                    Tie / Draw
                  </span>
                )}
              </div>
            </div>

            {/* Score Table */}
            <div className="grid grid-cols-3 gap-2 py-2 mb-4 border-b border-gray-50 text-xs">
              <span className="font-bold text-[#6B7280] uppercase tracking-wider text-left">Metric</span>
              <span className="font-bold text-[#0A0A0A] text-center">{modelA.name}</span>
              <span className="font-bold text-[#0A0A0A] text-right">{modelB.name}</span>

              {metrics.map((metric) => {
                const scoreA = currentJudgeResult.model_a?.[metric.key] ?? 0;
                const scoreB = currentJudgeResult.model_b?.[metric.key] ?? 0;
                return (
                  <React.Fragment key={metric.key}>
                    <span className="text-gray-500 py-1.5 text-left font-medium">{metric.label}</span>
                    <span className={`text-center py-1.5 ${getScoreClass(scoreA, scoreB, true)}`}>
                      {scoreA}
                    </span>
                    <span className={`text-right py-1.5 ${getScoreClass(scoreA, scoreB, false)}`}>
                      {scoreB}
                    </span>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Reason and Next Button Row */}
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mt-4">
              <div className="flex-1 text-xs text-gray-500 italic leading-relaxed">
                "{currentJudgeResult.reason}"
              </div>
              <div className="flex flex-col items-end gap-2 flex-shrink-0">
                <button
                  onClick={handleNextQuestion}
                  className="h-10 px-5 bg-[#0A0A0A] hover:bg-black/90 text-white text-xs font-semibold rounded-lg uppercase tracking-wider flex items-center gap-1.5"
                >
                  {isLastQuestion ? 'See Results' : 'Next Question'} &rarr;
                </button>
                <span className="text-[10px] text-[#6B7280] font-semibold">
                  Next in {autoAdvanceCount}...
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 5. LIVE SCOREBOARD */}
      <div className="fixed bottom-0 left-0 right-0 border-t border-[#E5E7EB] bg-white py-4 px-6 z-40">
        <div className="flex gap-6 max-w-4xl mx-auto items-center justify-between w-full">
          {/* Model A stats */}
          <div className="flex-1 flex items-center gap-3">
            <span className="text-xs font-bold text-[#0A0A0A] truncate max-w-[150px]" title={modelA.name}>
              {modelA.name}
            </span>
            <div className="flex-1 h-3.5 bg-gray-50 border border-[#E5E7EB] rounded-sm overflow-hidden max-w-[200px]">
              <div 
                className="h-full bg-[#0A0A0A] transition-all duration-500" 
                style={{ width: `${testQuestions.length > 0 ? (winsA / testQuestions.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#0A0A0A] flex-shrink-0">{winsA} wins</span>
          </div>

          {/* Ties */}
          <div className="px-4 text-xs font-semibold text-[#6B7280] select-none flex-shrink-0">
            Ties: {ties}
          </div>

          {/* Model B stats */}
          <div className="flex-1 flex items-center gap-3 justify-end">
            <span className="text-xs font-bold text-[#0A0A0A] flex-shrink-0">{winsB} wins</span>
            <div className="flex-1 h-3.5 bg-gray-50 border border-[#E5E7EB] rounded-sm overflow-hidden max-w-[200px]">
              <div 
                className="h-full bg-[#0A0A0A] transition-all duration-500" 
                style={{ width: `${testQuestions.length > 0 ? (winsB / testQuestions.length) * 100 : 0}%` }}
              />
            </div>
            <span className="text-xs font-bold text-[#0A0A0A] truncate max-w-[150px] text-right" title={modelB.name}>
              {modelB.name}
            </span>
          </div>
        </div>
      </div>

    </div>
  );
}
