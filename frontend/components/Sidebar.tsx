import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
  Activity, 
  Briefcase, 
  BrainCircuit, 
  Users, 
  Database,
  Settings,
  Fingerprint,
  LineChart,
  Compass
} from 'lucide-react';
import { cn } from '../lib/utils';

const navItems = [
  { icon: Compass, label: 'Career Copilot', path: '/' },
  { icon: Fingerprint, label: 'Resume DNA', path: '/resume-dna' },
  { icon: LineChart, label: 'Market Intelligence', path: '/market' },
  { icon: Briefcase, label: 'Opportunities', path: '/opportunities' },
  { icon: BrainCircuit, label: 'Skill Intelligence', path: '/skills' },
  { icon: Users, label: 'Recruiter CRM', path: '/crm' },
  { icon: Database, label: 'Data Ingestion', path: '/ingestion' },
];

export const Sidebar: React.FC = () => {
  return (
    <aside className="w-64 h-screen border-r border-surfaceHighlight bg-background/95 backdrop-blur-xl flex flex-col relative z-50">
      <div className="p-6 flex items-center gap-3 border-b border-surfaceHighlight/50">
        <div className="w-8 h-8 rounded bg-primary flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.5)]">
          <Activity className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="font-bold text-lg tracking-tight text-textMain leading-tight">SHIVA</h1>
          <p className="text-[9px] text-primary font-mono uppercase tracking-widest">Intelligence OS</p>
        </div>
      </div>

      <div className="px-4 py-3 overflow-y-auto custom-scrollbar">
        <p className="text-[10px] font-mono text-textMuted uppercase tracking-widest mb-2 px-2">Core Systems</p>
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group",
                isActive 
                  ? "bg-primary/10 text-primary border border-primary/20 shadow-[inset_0_0_10px_rgba(6,182,212,0.1)]" 
                  : "text-textMuted hover:bg-surfaceHighlight/50 hover:text-textMain border border-transparent"
              )}
            >
              <item.icon className={cn("w-4 h-4 transition-colors", "group-hover:text-primary")} />
              {item.label}
            </NavLink>
          ))}
        </nav>
      </div>

      <div className="mt-auto p-4 border-t border-surfaceHighlight/50">
        <div className="flex items-center gap-3 px-3 py-2 text-sm text-textMuted hover:text-textMain cursor-pointer rounded-lg hover:bg-surfaceHighlight/50 transition-colors">
          <Settings className="w-4 h-4" />
          System Config
        </div>
      </div>
    </aside>
  );
};
