import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import './styles/globals.css';

function App() {
    const [activeTab, setActiveTab] = useState<'generator' | 'youtube' | 'chat'>('generator');
    const [manualPrompts, setManualPrompts] = useState<string[]>([]);
    const [config, setConfig] = useState({
        maxConcurrent: 2,
        retryAttempts: 3,
        downloadFolder: 'C:\\Videos',
    });

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans">
            <div className="relative z-10 container mx-auto p-6 max-w-7xl">
                <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-400 flex items-center justify-center">
                            <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                            </svg>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white">Veo Generator <span className="text-blue-400 text-lg">v3.1</span></h1>
                            <p className="text-slate-400 text-sm">Automated Video Production System</p>
                        </div>
                    </div>
                </header>

                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'generator' ? 'bg-blue-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
                    >
                        Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('youtube')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'youtube' ? 'bg-red-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
                    >
                        YouTube
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all ${activeTab === 'chat' ? 'bg-green-600 text-white' : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800'}`}
                    >
                        AI Assistant
                    </button>
                </div>

                <main className="min-h-[600px]">
                    {activeTab === 'generator' && (
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">Video Generator</h2>
                            <p className="text-slate-400">Enter prompts to generate videos using Veo 3.1</p>
                            <textarea
                                className="input w-full h-40 mt-4"
                                placeholder="Enter prompts, one per line..."
                                onChange={(e) => setManualPrompts(e.target.value.split('\n').filter(p => p.trim()))}
                            />
                            <div className="mt-4 flex justify-end">
                                <button className="btn-primary">Add to Queue</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'youtube' && (
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">YouTube Downloader</h2>
                            <p className="text-slate-400">Download videos from YouTube</p>
                            <input
                                type="text"
                                className="input w-full mt-4"
                                placeholder="Enter YouTube URL..."
                            />
                            <div className="mt-4 flex justify-end">
                                <button className="btn-primary">Download</button>
                            </div>
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="card">
                            <h2 className="text-xl font-bold mb-4">AI Assistant</h2>
                            <p className="text-slate-400">Chat with local LLM</p>
                            <div className="h-80 bg-slate-800/50 rounded-lg mb-4 p-4 overflow-y-auto">
                                <p className="text-slate-500">Start a conversation...</p>
                            </div>
                            <input
                                type="text"
                                className="input w-full"
                                placeholder="Type a message..."
                            />
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
