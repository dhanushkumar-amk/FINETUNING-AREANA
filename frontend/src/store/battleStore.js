import { create } from 'zustand';

const useBattleStore = create((set) => ({
  modelA: null,
  modelB: null,
  domain: null,
  battleConfig: null,
  testQuestions: [],
  battleResults: [],
  isLoading: false,
  loadingMessage: "",
  currentStage: 1,

  setModelA: (model) => set({ modelA: model }),
  setModelB: (model) => set({ modelB: model }),
  setDomain: (domain) => set({ domain: domain }),
  setBattleConfig: (config) => set({ battleConfig: config }),
  setTestQuestions: (questions) => set({ testQuestions: questions }),
  setBattleResults: (results) => set({ battleResults: results }),
  setLoading: (isLoading, loadingMessage = "") => set({ isLoading, loadingMessage }),
  setStage: (stage) => set({ currentStage: stage }),
  resetBattle: () => set({
    modelA: null,
    modelB: null,
    domain: null,
    battleConfig: null,
    testQuestions: [],
    battleResults: [],
    isLoading: false,
    loadingMessage: "",
    currentStage: 1
  })
}));

export default useBattleStore;
