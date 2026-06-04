import React from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import { Sidebar } from './components/Sidebar';
import { ExecutiveBriefing } from './pages/ExecutiveBriefing';
import { ResumeDNA } from './pages/ResumeDNA';
import { MarketIntelligence } from './pages/MarketIntelligence';
import { Opportunities } from './pages/Opportunities';
import { SkillIntelligence } from './pages/SkillIntelligence';
import { RecruiterCRM } from './pages/RecruiterCRM';
import { DataIngestion } from './pages/DataIngestion';
import { DataProvider } from './context/DataContext';

const App: React.FC = () => {
  return (
    <DataProvider>
      <Router>
        <div className="flex h-screen w-screen bg-background text-textMain overflow-hidden font-sans">
          <Sidebar />
          <main className="flex-1 relative overflow-hidden bg-background">
            {/* Cyberpunk ambient lighting */}
            <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[150px] pointer-events-none"></div>
            <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] rounded-full bg-emerald-500/5 blur-[150px] pointer-events-none"></div>
            <div className="absolute top-[40%] left-[60%] w-[30%] h-[30%] rounded-full bg-purple-500/5 blur-[150px] pointer-events-none"></div>
            
            <div className="h-full w-full relative z-10">
              <Routes>
                <Route path="/" element={<ExecutiveBriefing />} />
                <Route path="/resume-dna" element={<ResumeDNA />} />
                <Route path="/market" element={<MarketIntelligence />} />
                <Route path="/opportunities" element={<Opportunities />} />
                <Route path="/skills" element={<SkillIntelligence />} />
                <Route path="/crm" element={<RecruiterCRM />} />
                <Route path="/ingestion" element={<DataIngestion />} />
              </Routes>
            </div>
          </main>
        </div>
      </Router>
    </DataProvider>
  );
};

export default App;
