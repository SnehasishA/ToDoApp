
import React, { useState, useCallback } from 'react';
import { Task, ChatMessage, User } from '../types';
import { generateSummary, getOptimizationSuggestion, speakText } from '../services/geminiService';
import { Sparkles, BrainCircuit, Mic, Volume2, Send, Mail } from 'lucide-react';
import Chatbot from './Chatbot';
import VoiceControl from './VoiceControl';

interface AiPanelProps {
  tasks: Task[];
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
  currentUser: User;
  teamMembers: User[];
}

const AiPanel: React.FC<AiPanelProps> = ({ tasks, setTasks, currentUser, teamMembers }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [summary, setSummary] = useState<{title: string, content: string} | null>(null);
  const [optimization, setOptimization] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'insights' | 'chat'>('insights');

  const handleGenerateSummary = async (period: 'daily' | 'weekly' | 'monthly') => {
    setIsLoading(true);
    setSummary(null);
    setOptimization(null);
    try {
      const result = await generateSummary(tasks, period);
      setSummary({ title: `${period.charAt(0).toUpperCase() + period.slice(1)} Summary`, content: result });
    } catch (error) {
      console.error('Error generating summary:', error);
      setSummary({ title: 'Error', content: 'Could not generate summary.' });
    }
    setIsLoading(false);
  };

  const handleOptimizeSchedule = async () => {
    setIsLoading(true);
    setSummary(null);
    setOptimization(null);
    try {
      const result = await getOptimizationSuggestion(tasks, teamMembers, currentUser);
      setOptimization(result);
    } catch (error) {
      console.error('Error optimizing schedule:', error);
      setOptimization('Could not generate optimization suggestions.');
    }
    setIsLoading(false);
  };
  
  const handleListen = async (text: string) => {
    setIsLoading(true);
    try {
      const audioData = await speakText(text);
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const decodedData = atob(audioData);
      const buffer = new ArrayBuffer(decodedData.length);
      const view = new Uint8Array(buffer);
      for (let i = 0; i < decodedData.length; i++) {
        view[i] = decodedData.charCodeAt(i);
      }
      
      const pcmData = new Int16Array(buffer);
      const float32Data = new Float32Array(pcmData.length);
      for (let i = 0; i < pcmData.length; i++) {
        float32Data[i] = pcmData[i] / 32768.0;
      }

      const audioBuffer = audioContext.createBuffer(1, float32Data.length, 24000);
      audioBuffer.getChannelData(0).set(float32Data);
      
      const source = audioContext.createBufferSource();
      source.buffer = audioBuffer;
      source.connect(audioContext.destination);
      source.start();
    } catch (error) {
      console.error("Error playing audio", error);
    } finally {
        setIsLoading(false);
    }
  };

  const handleSendEmail = () => {
    alert("Email sent (simulation)! In a real app, this would use a backend service to send the weekly summary to your registered email.");
  }

  return (
    <aside className="w-80 lg:w-96 bg-slate-900/80 backdrop-blur-sm border-l border-slate-700 flex flex-col p-4">
      <div className="flex items-center gap-3 mb-4">
        <Sparkles className="text-indigo-400" />
        <h2 className="text-xl font-bold">AI Assistant</h2>
      </div>
      
      <div className="flex border-b border-slate-700 mb-4">
          <button onClick={() => setActiveTab('insights')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'insights' ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-400'}`}>Insights</button>
          <button onClick={() => setActiveTab('chat')} className={`px-4 py-2 text-sm font-medium ${activeTab === 'chat' ? 'border-b-2 border-indigo-500 text-white' : 'text-slate-400'}`}>Chat</button>
      </div>

      {activeTab === 'insights' && (
        <>
          <div className="grid grid-cols-3 gap-2 mb-4">
            <button onClick={() => handleGenerateSummary('daily')} className="bg-slate-700 hover:bg-slate-600 text-sm p-2 rounded-md transition-colors">Daily Summary</button>
            <button onClick={() => handleGenerateSummary('weekly')} className="bg-slate-700 hover:bg-slate-600 text-sm p-2 rounded-md transition-colors">Weekly Summary</button>
            <button onClick={() => handleGenerateSummary('monthly')} className="bg-slate-700 hover:bg-slate-600 text-sm p-2 rounded-md transition-colors">Monthly Summary</button>
          </div>
          <button onClick={handleOptimizeSchedule} className="w-full flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-500 p-2 rounded-md transition-colors font-semibold mb-4">
            <BrainCircuit size={18} /> Optimize Schedule
          </button>
          
          <div className="flex-1 bg-slate-800/50 rounded-lg p-4 overflow-y-auto custom-scrollbar">
            {isLoading && <div className="flex justify-center items-center h-full"><div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-400"></div></div>}
            
            {summary && !isLoading && (
              <div>
                <h3 className="font-bold text-lg text-indigo-400 mb-2">{summary.title}</h3>
                <div className="prose prose-sm prose-invert text-slate-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: summary.content }}></div>
                <div className="mt-4 flex gap-2">
                    <button onClick={() => handleListen(summary.content)} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md">
                        <Volume2 size={16}/> Listen
                    </button>
                    {summary.title.includes('Weekly') && (
                        <button onClick={handleSendEmail} className="flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md">
                            <Mail size={16}/> Email Me
                        </button>
                    )}
                </div>
              </div>
            )}

            {optimization && !isLoading && (
              <div>
                <h3 className="font-bold text-lg text-indigo-400 mb-2">Optimization Suggestions</h3>
                <div className="prose prose-sm prose-invert text-slate-300 whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: optimization }}></div>
                <button onClick={() => handleListen(optimization)} className="mt-4 flex items-center gap-2 text-sm bg-slate-700 hover:bg-slate-600 px-3 py-1.5 rounded-md">
                    <Volume2 size={16}/> Listen
                </button>
              </div>
            )}

            {!summary && !optimization && !isLoading && (
              <div className="text-center text-slate-500 flex flex-col items-center justify-center h-full">
                <BrainCircuit size={40} className="mb-2"/>
                <p>Generate a summary or optimization suggestions to see AI insights here.</p>
              </div>
            )}
          </div>
        </>
      )}

      {activeTab === 'chat' && <Chatbot />}

      <div className="mt-4 pt-4 border-t border-slate-700">
        <VoiceControl setTasks={setTasks} />
      </div>
    </aside>
  );
};

export default AiPanel;
