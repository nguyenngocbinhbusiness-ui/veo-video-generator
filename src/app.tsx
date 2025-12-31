import React, { useState, useEffect } from 'react';
import { createRoot } from 'react-dom/client';
import { PromptTextarea, CsvUploader } from '@features/prompt-input';
import { QueueDashboard, queueManager } from '@features/queue-status';
import { CookieStatus, CookieImportModal, cookieManager } from '@features/cookie-import';
import { YoutubeDownloadTab } from '@features/youtube-download';
import { AiChatTab } from '@features/ai-chat';
import { QueueStatus as QueueStatusType, GenerationItem } from '@shared/types';
import './styles/globals.css';

function App() {
    const [activeTab, setActiveTab] = useState<'generator' | 'youtube' | 'chat'>('generator');
    const [queueStatus, setQueueStatus] = useState<QueueStatusType>(queueManager.getStatus());
    const [isCookieModalOpen, setIsCookieModalOpen] = useState(false);
    const [config, setConfig] = useState({
        maxConcurrent: 2,
        retryAttempts: 3,
        downloadFolder: 'C:\\Videos', // Default, should be loaded from env/config
    });

    useEffect(() => {
        // Subscribe to queue updates
        const unsubscribe = queueManager.onUpdate((status) => {
            setQueueStatus(status);
        });
        return unsubscribe;
    }, []);

    const handlePromptsLoaded = (prompts: string[]) => {
        queueManager.addPrompts(prompts);
    };

    const handlePromptsChange = (prompts: string[]) => {
        // This is for dynamic changes, maybe just add them on button click instead?
        // For now, let's assume the textarea manages its own state and we find a way to "Add to Queue"
    };

    // We need a way to trigger "Add to Queue" from the textarea
    // Modifying PromptTextarea to have an "Add to Queue" button or similar would be better
    // For now, let's assume prompts are added via CSV or we'll add a manual "Add" button
    // Actually, let's just make the textarea add prompts when user clicks "Queue Prompts"

    const [manualPrompts, setManualPrompts] = useState<string[]>([]);

    const handleQueueManualPrompts = () => {
        if (manualPrompts.length > 0) {
            queueManager.addPrompts(manualPrompts);
            setManualPrompts([]); // Clear after adding
            // Force clear textarea? We might need to lift state up more or use a ref
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 text-slate-200 font-sans selection:bg-primary-500/30">
            {/* HUD Overlay */}
            <div className="fixed inset-0 pointer-events-none z-50 bg-scanlines opacity-5" />
            <div className="fixed inset-0 pointer-events-none z-50 bg-vignette opacity-40" />

            <div className="relative z-10 container mx-auto p-6 max-w-7xl">
                {/* Header */}
                <header className="flex items-center justify-between mb-8 pb-6 border-b border-white/10">
                    <div className="flex items-center gap-4">
                        <div className="relative">
                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-500 to-cyan-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
                                <svg className="w-7 h-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                </svg>
                            </div>
                            <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-slate-900 flex items-center justify-center">
                                <div className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse" />
                            </div>
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold text-white tracking-tight">Veo Generator <span className="text-primary-400 text-lg font-normal">v3.1</span></h1>
                            <p className="text-slate-400 text-sm">Automated Video Production System</p>
                        </div>
                    </div>

                    <CookieStatus
                        onRefresh={() => { /* re-check cookies */ }}
                        onOpenImport={() => setIsCookieModalOpen(true)}
                    />
                </header>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'generator'
                            ? 'bg-primary-600 text-white shadow-lg shadow-primary-500/20'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.384-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                        </svg>
                        Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('youtube')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'youtube'
                            ? 'bg-red-600 text-white shadow-lg shadow-red-500/20'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        YouTube
                    </button>
                    <button
                        onClick={() => setActiveTab('chat')}
                        className={`px-6 py-3 rounded-xl font-medium transition-all duration-200 flex items-center gap-2 ${activeTab === 'chat'
                            ? 'bg-green-600 text-white shadow-lg shadow-green-500/20'
                            : 'bg-slate-800/50 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                            }`}
                    >
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        AI Assistant
                    </button>
                </div>

                {/* Main Content */}
                <main className="min-h-[600px]">
                    {activeTab === 'generator' && (
                        <div className="grid grid-cols-12 gap-8">
                            {/* Left Col: Inputs */}
                            <div className="col-span-12 lg:col-span-5 space-y-6">
                                <section className="card">
                                    <div className="flex items-center justify-between mb-4">
                                        <h3 className="text-lg font-semibold text-white">Input Prompts</h3>
                                        <CsvUploader onPromptsLoaded={handlePromptsLoaded} />
                                    </div>
                                    <PromptTextarea onPromptsChange={setManualPrompts} />
                                    <div className="mt-4 flex justify-end">
                                        <button
                                            onClick={handleQueueManualPrompts}
                                            disabled={manualPrompts.length === 0}
                                            className="btn-primary"
                                        >
                                            Add {manualPrompts.length > 0 ? manualPrompts.length : ''} Prompts to Queue
                                        </button>
                                    </div>
                                </section>

                                <section className="card bg-slate-800/30">
                                    <h3 className="text-sm font-semibold text-slate-300 mb-3">Settings</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Max Concurrent</label>
                                            <input
                                                type="number"
                                                value={config.maxConcurrent}
                                                onChange={e => setConfig({ ...config, maxConcurrent: parseInt(e.target.value) })}
                                                className="input w-full"
                                                min={1}
                                                max={5}
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 mb-1 block">Retry Attempts</label>
                                            <input
                                                type="number"
                                                value={config.retryAttempts}
                                                onChange={e => setConfig({ ...config, retryAttempts: parseInt(e.target.value) })}
                                                className="input w-full"
                                                min={0}
                                                max={5}
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>

                            {/* Right Col: Queue */}
                            <div className="col-span-12 lg:col-span-7">
                                <div className="card h-full">
                                    <QueueDashboard
                                        status={queueStatus}
                                        onPause={() => queueManager.pause()}
                                        onResume={() => queueManager.resume()}
                                        onClearCompleted={() => queueManager.clearCompleted()}
                                        onRetryFailed={() => queueManager.retryFailed()}
                                        onDownload={(item) => { /* handle download */ }}
                                        onRetryItem={(item) => { /* handle single retry */ }}
                                    />
                                </div>
                            </div>
                        </div>
                    )}

                    {activeTab === 'youtube' && (
                        <div className="max-w-3xl mx-auto">
                            <YoutubeDownloadTab />
                        </div>
                    )}

                    {activeTab === 'chat' && (
                        <div className="max-w-4xl mx-auto">
                            <AiChatTab />
                        </div>
                    )}
                </main>
            </div>

            {/* Modals */}
            <CookieImportModal
                isOpen={isCookieModalOpen}
                onClose={() => setIsCookieModalOpen(false)}
                onSuccess={() => {/* maybe show toast */ }}
            />
        </div>
    );
}

const root = createRoot(document.getElementById('root')!);
root.render(<App />);
