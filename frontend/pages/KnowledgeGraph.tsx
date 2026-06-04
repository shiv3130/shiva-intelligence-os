import React, { useMemo } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  Node, 
  Edge,
  MarkerType
} from 'reactflow';
import { useData } from '../context/DataContext';
import { Card } from '../components/ui/Card';

export const KnowledgeGraph: React.FC = () => {
  const { state } = useData();
  const { jobs, resume } = state;

  const { nodes, edges } = useMemo(() => {
    if (!jobs.length) return { nodes: [], edges: [] };

    const newNodes: Node[] = [];
    const newEdges: Edge[] = [];

    // Center Node (User)
    newNodes.push({
      id: 'user',
      position: { x: 400, y: 300 },
      data: { label: 'YOU' },
      style: { background: '#0f172a', color: '#f8fafc', border: '2px solid #06b6d4', borderRadius: '50%', width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }
    });

    // Skills Nodes (from resume)
    const skills = resume?.extractedSkills || ['React', 'TypeScript', 'Node.js']; // Fallback
    skills.forEach((skill, i) => {
      const id = `skill-${i}`;
      newNodes.push({
        id,
        position: { x: 200, y: 150 + (i * 80) },
        data: { label: skill },
        style: { background: '#1e293b', color: '#10b981', border: '1px solid #10b981', borderRadius: '8px', padding: '10px' }
      });
      newEdges.push({
        id: `e-user-${id}`,
        source: 'user',
        target: id,
        animated: true,
        style: { stroke: '#10b981' }
      });
    });

    // Top Companies Nodes
    const topCompanies = Array.from(new Set(jobs.map(j => j.company))).slice(0, 5);
    topCompanies.forEach((company, i) => {
      const id = `company-${i}`;
      newNodes.push({
        id,
        position: { x: 600, y: 100 + (i * 100) },
        data: { label: company },
        style: { background: '#1e293b', color: '#f8fafc', border: '1px solid #334155', borderRadius: '8px', padding: '10px' }
      });
      
      // Connect user to company
      newEdges.push({
        id: `e-user-${id}`,
        source: 'user',
        target: id,
        markerEnd: { type: MarkerType.ArrowClosed, color: '#475569' },
        style: { stroke: '#475569' }
      });
    });

    return { nodes: newNodes, edges: newEdges };
  }, [jobs, resume]);

  return (
    <div className="p-6 h-full flex flex-col">
      <header className="mb-6">
        <h1 className="text-3xl font-bold text-textMain tracking-tight">Knowledge Graph</h1>
        <p className="text-textMuted mt-1">Visual representation of your career network and skill mapping.</p>
      </header>

      <Card className="flex-1 p-0 overflow-hidden border-surfaceHighlight">
        {nodes.length > 0 ? (
          <ReactFlow 
            nodes={nodes} 
            edges={edges} 
            fitView
            className="bg-background"
          >
            <Background color="#1e293b" gap={16} />
            <Controls className="bg-surface border-surfaceHighlight fill-textMain" />
          </ReactFlow>
        ) : (
          <div className="h-full flex items-center justify-center text-textMuted">
            Upload data to generate graph.
          </div>
        )}
      </Card>
    </div>
  );
};
