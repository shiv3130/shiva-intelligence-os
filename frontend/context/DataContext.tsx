import React, { createContext, useReducer, useContext, ReactNode } from 'react';
import { AppState, Action, JobApplication, ResumeData, AIInsights, ResumeDNA } from '../types';

const loadInitialState = (): AppState => {
  try {
    const savedResume = localStorage.getItem('SHIVA_RESUME_DATA');
    const savedResumeDNA = localStorage.getItem('SHIVA_RESUME_DNA');
    return {
      jobs: [],
      resume: savedResume ? JSON.parse(savedResume) : null,
      resumeDNA: savedResumeDNA ? JSON.parse(savedResumeDNA) : null,
      insights: null,
      isAnalyzing: false,
      lastUpdated: null,
    };
  } catch (e) {
    console.error("Failed to load data from local storage", e);
    return {
      jobs: [],
      resume: null,
      resumeDNA: null,
      insights: null,
      isAnalyzing: false,
      lastUpdated: null,
    };
  }
};

const initialState: AppState = loadInitialState();

function dataReducer(state: AppState, action: Action): AppState {
  switch (action.type) {
    case 'SET_JOBS':
      return { ...state, jobs: action.payload, lastUpdated: new Date().toISOString() };
    case 'SET_RESUME':
      localStorage.setItem('SHIVA_RESUME_DATA', JSON.stringify(action.payload));
      return { ...state, resume: action.payload };
    case 'SET_RESUME_DNA':
      localStorage.setItem('SHIVA_RESUME_DNA', JSON.stringify(action.payload));
      return { ...state, resumeDNA: action.payload };
    case 'SET_INSIGHTS':
      return { ...state, insights: action.payload, isAnalyzing: false };
    case 'SET_ANALYZING':
      return { ...state, isAnalyzing: action.payload };
    case 'RESET_DATA':
      localStorage.removeItem('SHIVA_RESUME_DATA');
      localStorage.removeItem('SHIVA_RESUME_DNA');
      return { 
        jobs: [],
        resume: null,
        resumeDNA: null,
        insights: null,
        isAnalyzing: false,
        lastUpdated: null,
      };
    default:
      return state;
  }
}

const DataContext = createContext<{
  state: AppState;
  dispatch: React.Dispatch<Action>;
}>({ state: initialState, dispatch: () => null });

export const DataProvider = ({ children }: { children: ReactNode }) => {
  const [state, dispatch] = useReducer(dataReducer, initialState);

  return (
    <DataContext.Provider value={{ state, dispatch }}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => useContext(DataContext);
