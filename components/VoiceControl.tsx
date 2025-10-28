import React, { useState, useEffect, useRef } from 'react';
// FIX: Import Frequency to resolve missing property error.
import { Task, Status, Priority, Frequency } from '../types';
import { parseVoiceCommand } from '../services/geminiService';
import { Mic, MicOff } from 'lucide-react';
// FIX: Changed import from USERS to MOCK_INITIAL_USERS as USERS is not exported.
import { MOCK_INITIAL_USERS } from '../constants';

interface VoiceControlProps {
  setTasks: React.Dispatch<React.SetStateAction<Task[]>>;
}

const VoiceControl: React.FC<VoiceControlProps> = ({ setTasks }) => {
  const [isListening, setIsListening] = useState(false);
  const [feedback, setFeedback] = useState('Click the mic and speak a command');
  // Fix: Use 'any' for SpeechRecognition as its type is not globally available.
  const recognitionRef = useRef<any | null>(null);

  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onstart = () => {
        setIsListening(true);
        setFeedback('Listening...');
      };

      recognition.onend = () => {
        setIsListening(false);
        setFeedback('Click the mic and speak a command');
      };

      recognition.onerror = (event: any) => {
        console.error('Speech recognition error', event.error);
        setFeedback(`Error: ${event.error}`);
      };

      recognition.onresult = async (event: any) => {
        const transcript = event.results[0][0].transcript;
        setFeedback(`Processing: "${transcript}"`);
        try {
          const command = await parseVoiceCommand(transcript);
          
          if (command.action === 'error') {
            setFeedback(`Sorry, I didn't understand that.`);
            return;
          }

          setTasks(currentTasks => {
            if (command.action === 'add') {
              const newTask: Task = {
                id: `task-${Date.now()}`,
                title: command.payload.title,
                description: command.payload.description || '',
                status: Status.TODO,
                priority: command.payload.priority || Priority.MEDIUM,
                // FIX: Added missing 'frequency' property.
                frequency: Frequency.ONE_TIME,
                dueDate: command.payload.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
                // FIX: Used MOCK_INITIAL_USERS instead of the non-existent USERS.
                assignee: MOCK_INITIAL_USERS[0], // Default assignee
              };
              setFeedback(`Added task: "${newTask.title}"`);
              return [...currentTasks, newTask];
            } else if (command.action === 'delete') {
              const taskToDelete = currentTasks.find(t => t.title.toLowerCase().includes(command.payload.title.toLowerCase()));
              if (taskToDelete) {
                  setFeedback(`Deleted task: "${taskToDelete.title}"`);
                  return currentTasks.filter(t => t.id !== taskToDelete.id);
              } else {
                  setFeedback(`Could not find task to delete.`);
              }
            }
            return currentTasks;
          });

        } catch (error) {
          console.error('Error parsing voice command:', error);
          setFeedback('Could not process the command.');
        }
      };

      recognitionRef.current = recognition;
    } else {
      setFeedback('Speech recognition not supported in this browser.');
    }
  }, [setTasks]);

  const toggleListening = () => {
    if (!recognitionRef.current) return;

    if (isListening) {
      recognitionRef.current.stop();
    } else {
      recognitionRef.current.start();
    }
  };

  return (
    <div className="text-center">
      <button
        onClick={toggleListening}
        className={`relative w-16 h-16 rounded-full flex items-center justify-center transition-all duration-300 ${
          isListening ? 'bg-red-500 text-white animate-pulse' : 'bg-indigo-600 text-white hover:bg-indigo-500'
        } mx-auto`}
      >
        {isListening ? <MicOff size={28} /> : <Mic size={28} />}
      </button>
      <p className="text-sm text-slate-400 mt-2 h-4">{feedback}</p>
    </div>
  );
};

export default VoiceControl;