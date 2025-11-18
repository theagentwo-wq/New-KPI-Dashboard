import React, { useState } from 'react';
import { Modal } from './Modal';
import { runWhatIfScenario } from '../services/geminiService';

interface ScenarioModelerProps {
  isOpen: boolean;
  onClose: () => void;
  data: any;
}

export const ScenarioModeler: React.FC<ScenarioModelerProps> = ({ isOpen, onClose, data }) => {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<{ analysis: string, args?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleRunScenario = async () => {
    if (!prompt.trim()) return;
    setIsLoading(true);
    setResult(null);
    const res = await runWhatIfScenario(data, prompt);
    setResult(res);
    setIsLoading(false);
  };
  
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Scenario Modeler">
      <div className="space-y-4">
        <p className="text-slate-300">Use natural language to model a scenario. For example: "What happens to SOP if food cost drops 0.5% for Heather's region?"</p>
        <div>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Enter your scenario here..."
            rows={3}
            className="w-full bg-slate-900 border border-slate-600 rounded-md p-2 text-white placeholder-slate-400 focus:ring-cyan-500 focus:border-cyan-500"
          />
        </div>
        <div className="flex justify-end">
          <button onClick={handleRunScenario} disabled={isLoading} className="bg-cyan-600 hover:bg-cyan-700 text-white font-bold py-2 px-4 rounded-md disabled:bg-slate-600">
            {isLoading ? 'Analyzing...' : 'Run Scenario'}
          </button>
        </div>
        {result && (
          <div className="mt-4 p-4 bg-slate-900 rounded-md border border-slate-700">
            <h4 className="text-lg font-bold text-cyan-400 mb-2">Scenario Result</h4>
            <p className="text-slate-200 whitespace-pre-wrap">{result.analysis}</p>
            {result.args && (
                <div className="mt-2 text-xs text-slate-400 bg-slate-800 p-2 rounded">
                    <p className="font-mono">Parsed Parameters: {JSON.stringify(result.args)}</p>
                </div>
            )}
          </div>
        )}
      </div>
    </Modal>
  );
};