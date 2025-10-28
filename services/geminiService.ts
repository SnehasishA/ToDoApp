
import { GoogleGenAI, Type, Modality, Chat } from "@google/genai";
import { Task, ChatMessage, User, AccountType } from "../types";

const API_KEY = process.env.API_KEY;

const ai = new GoogleGenAI({ apiKey: API_KEY });

function escapeHtml(unsafe: string) {
    // A simple formatter to render markdown from the model as safe HTML
    let html = unsafe
         .replace(/&/g, "&amp;")
         .replace(/</g, "&lt;")
         .replace(/>/g, "&gt;")
         .replace(/"/g, "&quot;")
         .replace(/'/g, "&#039;");
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    // Italics
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    // List items
    html = html.replace(/^\s*[-*]\s+(.*)/gm, '<li>$1</li>');
    html = html.replace(/<\/li>\n<li>/g, '</li><li>'); // Join adjacent list items
    html = html.replace(/<li>.*<\/li>/gs, '<ul>$&</ul>'); // Wrap in ul

    return html;
}

export const generateSummary = async (tasks: Task[], period: 'daily' | 'weekly' | 'monthly'): Promise<string> => {
  const prompt = `
    Analyze the following list of tasks and provide a ${period} summary.
    The summary should be formatted in Markdown and include:
    - A brief overview of accomplishments (completed tasks).
    - A list of pending tasks, highlighting any that are overdue.
    - A productivity analysis or observation.

    Today's date is ${new Date().toISOString()}.

    Tasks:
    ${JSON.stringify(tasks, null, 2)}
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
    });
    return escapeHtml(response.text);
  } catch (error) {
    console.error("Error in generateSummary:", error);
    return "Failed to generate summary.";
  }
};


export const getOptimizationSuggestion = async (tasks: Task[], teamMembers: User[], currentUser: User): Promise<string> => {
  
  const teamContext = currentUser.accountType === AccountType.TEAM 
  ? `The user is part of a team. Here are the team members available for delegation: ${JSON.stringify(teamMembers.map(m => ({id: m.id, name: m.name, role: m.role})), null, 2)}`
  : `The user is working in an individual account.`;
  
  const prompt = `
    As an expert productivity coach, analyze the user's current tasks and provide personalized, actionable suggestions to optimize their schedule.
    The suggestions should be specific, insightful, and formatted in Markdown.

    **Context:**
    - Today's date is ${new Date().toISOString()}.
    - The request is coming from: ${JSON.stringify({id: currentUser.id, name: currentUser.name, role: currentUser.role})}.
    - ${teamContext}

    **Analysis requirements:**
    1.  **Task Prioritization & Ordering:** Recommend a specific order to tackle the tasks. Justify the order based on priority, due dates (urgency), and potential for quick wins.
    2.  **Conflict Detection:** Identify any potential scheduling conflicts, such as multiple high-priority tasks due on the same day or an unrealistic workload.
    3.  **Smart Delegation (if applicable):** If this is a team context, suggest delegating specific tasks to other team members. Justify why a particular person is a good fit for a task (e.g., balance workload, user role). Do not suggest delegation if it's an individual account.
    4.  **Task Batching:** Suggest grouping similar tasks together to improve focus and reduce context switching.
    
    **Current Tasks:**
    ${JSON.stringify(tasks, null, 2)}

    Provide a friendly but professional response.
  `;

  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt
    });
    return escapeHtml(response.text);
  } catch (error) {
    console.error("Error in getOptimizationSuggestion:", error);
    return "Failed to generate suggestions.";
  }
};

export const parseVoiceCommand = async (command: string): Promise<any> => {
  const prompt = `
    Parse the following voice command for a to-do list application.
    Today is ${new Date().toString()}.
    Extract the action ('add', 'delete', 'update', 'error') and its payload.
    For 'add', payload should include 'title', and optional 'priority' ('High', 'Medium', 'Low'), 'description', and 'dueDate'. The dueDate should be an ISO 8601 string.
    For example, if the command is "add a task to call mom tomorrow at 5pm", the dueDate should be a full ISO string for the upcoming 5 PM.
    For 'delete', payload should include 'title' of the task to remove.
    If the command is unclear, the action should be 'error'.

    Command: "${command}"

    Return ONLY a JSON object.
  `;
  
  try {
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: {
                type: Type.OBJECT,
                properties: {
                    action: { type: Type.STRING },
                    payload: {
                        type: Type.OBJECT,
                        properties: {
                           title: { type: Type.STRING },
                           description: { type: Type.STRING },
                           priority: { type: Type.STRING },
                           dueDate: { type: Type.STRING, description: "A valid ISO 8601 date string" },
                        }
                    }
                }
            }
        }
    });
    
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Error parsing voice command:", error);
    return { action: 'error', payload: { message: 'API parsing failed.' } };
  }
};

export const speakText = async (text: string): Promise<string> => {
    try {
        const response = await ai.models.generateContent({
            model: "gemini-2.5-flash-preview-tts",
            contents: [{ parts: [{ text: text }] }],
            config: {
                // Fix: Use Modality.AUDIO enum member as per the coding guidelines.
                responseModalities: [Modality.AUDIO],
                speechConfig: {
                    voiceConfig: {
                        prebuiltVoiceConfig: { voiceName: 'Kore' },
                    },
                },
            },
        });
        const base64Audio = response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
        if (base64Audio) {
            return base64Audio;
        }
        throw new Error("No audio data received");
    } catch (error) {
        console.error("TTS Error:", error);
        throw error;
    }
};

export const getChatbotResponse = async (history: ChatMessage[], newMessage: string): Promise<string> => {
    
    const chatHistory = history.map(msg => ({
        role: msg.role,
        parts: [{ text: msg.text }]
    }));

    // Fix: Add explicit Chat type for better type safety and to align with coding guidelines.
    const chat: Chat = ai.chats.create({
        model: 'gemini-2.5-flash',
        history: chatHistory
    });

    try {
        const response = await chat.sendMessage({ message: newMessage });
        return response.text;
    } catch (error) {
        console.error("Chatbot API error:", error);
        return "Sorry, I encountered an error. Please try again.";
    }
};
