import { useState, useEffect } from 'react';
import ReactDOM from 'react-dom/client';
import './styles/globals.css';

import { CookieStatus, CookieImportModal, cookieManager } from './features/cookie-import';
import { PromptTextarea, CsvUploader } from './features/prompt-input';
import { QueueDashboard, queueManager } from './features/queue-status';
import { YoutubeDownloadTab } from './features/youtube-download';
import { AiChatTab } from './features/ai-chat';
import { QueueStatus, GenerationItem } from './shared/types';

type TabType = 'generator' | 'youtube' | 'ai-chat';

function App() {
    const [activeTab, setActiveTab] = useState<TabType>('generator');
    const [isImportModalOpen, setIsImportModalOpen] = useState(false);
    const [cookieValid, setCookieValid] = useState(false);
    const [prompts, setPrompts] = useState<string[]>([]);
    const [queueStatus, setQueueStatus] = useState<QueueStatus>(queueManager.getStatus());
    const [isGenerating, setIsGenerating] = useState(false);

    // Subscribe to queue updates
    useEffect(() => {
        const unsubscribe = queueManager.onUpdate((status) => {
            setQueueStatus(status);
            setIsGenerating(status.processing > 0);
        });
        return unsubscribe;
    }, []);

    const handleCookieImportSuccess = () => {
        setCookieValid(cookieManager.isSessionValid());
    };

    const handleRefreshCookies = () => {
        setCookieValid(cookieManager.isSessionValid());
    };

    const handleStartGeneration = () => {
        if (prompts.length === 0) return;

        queueManager.addPrompts(prompts);
        queueManager.start();
        setPrompts([]);
    };

    const handlePause = () => queueManager.pause();
    const handleResume = () => queueManager.resume();
    const handleClearCompleted = () => queueManager.clearCompleted();
    const handleRetryFailed = () => queueManager.retryFailed();

    const handleDownload = async (item: GenerationItem) => {
        if (item.videoPath) {
            const { ipcRenderer } = window.require('electron');
            const result = await ipcRenderer.invoke('video:download', item.videoPath);
            if (!result.success) {
                console.error('Failed to open video:', result.error);
            }
        }
    };

    const handleRetryItem = (item: GenerationItem) => {
        console.log('Retry item:', item.id);
    };

    const handlePromptsFromCsv = (csvPrompts: string[]) => {
        setPrompts((prev) => [...prev, ...csvPrompts]);
    };

    return (
        <div className="min-h-screen bg-hud-darker">
            {/* Header - HUD Style */}
            <header className="sticky top-0 z-40 hud-panel border-b border-cyan-500/20">
                <div className="max-w-6xl mx-auto px-6 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            {/* Logo with glow effect */}
                            <div className="relative w-12 h-12 flex items-center justify-center">
                                <div className="absolute inset-0 bg-cyan-500/20 blur-xl"></div>
                                <div className="relative w-10 h-10 border-2 border-cyan-400 flex items-center justify-center" style={{ clipPath: 'polygon(20% 0%, 80% 0%, 100% 20%, 100% 80%, 80% 100%, 20% 100%, 0% 80%, 0% 20%)' }}>
                                    <svg className="w-6 h-6 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                    </svg>
                                </div>
                            </div>
                            <div>
                                <h1 className="hud-title text-xl text-cyan-300" style={{ textShadow: '0 0 20px rgba(0, 255, 255, 0.5)' }}>VIDEO TOOLS</h1>
                                <p className="text-xs text-cyan-600 uppercase tracking-widest font-mono">SYSTEM v3.1 // ACTIVE</p>
                            </div>
                        </div>

                        <button className="btn-ghost" data-testid="config-button">
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                            CONFIG
                        </button>
                    </div>
                </div>
            </header>

            {/* Tab Navigation - HUD Style */}
            <nav className="max-w-6xl mx-auto px-6 pt-4">
                <div className="flex gap-2 border-b border-cyan-500/20 pb-px">
                    <button
                        onClick={() => setActiveTab('generator')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-200 cursor-pointer border-b-2 ${activeTab === 'generator'
                            ? 'border-cyan-400 text-cyan-300 bg-cyan-500/10'
                            : 'border-transparent text-cyan-700 hover:text-cyan-400 hover:border-cyan-700'
                            }`}
                        style={activeTab === 'generator' ? { boxShadow: '0 4px 15px rgba(0, 255, 255, 0.2)' } : {}}
                        data-testid="generator-tab"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                        Generator
                    </button>
                    <button
                        onClick={() => setActiveTab('youtube')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-200 cursor-pointer border-b-2 ${activeTab === 'youtube'
                            ? 'border-red-400 text-red-300 bg-red-500/10'
                            : 'border-transparent text-cyan-700 hover:text-red-400 hover:border-red-700'
                            }`}
                        style={activeTab === 'youtube' ? { boxShadow: '0 4px 15px rgba(255, 50, 50, 0.2)' } : {}}
                        data-testid="youtube-tab"
                    >
                        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
                        </svg>
                        YouTube
                    </button>
                    <button
                        onClick={() => setActiveTab('ai-chat')}
                        className={`flex items-center gap-2 px-4 py-2.5 text-xs font-mono uppercase tracking-widest transition-all duration-200 cursor-pointer border-b-2 ${activeTab === 'ai-chat'
                            ? 'border-green-400 text-green-300 bg-green-500/10'
                            : 'border-transparent text-cyan-700 hover:text-green-400 hover:border-green-700'
                            }`}
                        style={activeTab === 'ai-chat' ? { boxShadow: '0 4px 15px rgba(50, 255, 50, 0.2)' } : {}}
                        data-testid="ai-chat-tab"
                    >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                        </svg>
                        AI Chat
                    </button>
                </div>
            </nav>

            {/* Main content */}
            <main className="max-w-6xl mx-auto px-6 py-6 space-y-6">
                {activeTab === 'generator' ? (
                    <>
                        {/* Cookie Status */}
                        <CookieStatus
                            onRefresh={handleRefreshCookies}
                            onOpenImport={() => setIsImportModalOpen(true)}
                        />

                        {/* Prompt Input Section */}
                        <div className="card space-y-4">
                            <PromptTextarea
                                onPromptsChange={setPrompts}
                                disabled={isGenerating}
                            />

                            <div className="flex items-center justify-between">
                                <CsvUploader
                                    onPromptsLoaded={handlePromptsFromCsv}
                                    disabled={isGenerating}
                                />

                                <button
                                    onClick={handleStartGeneration}
                                    disabled={prompts.length === 0 || !cookieValid || isGenerating}
                                    className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                                    data-testid="start-generation"
                                >
                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    Start Generation ({prompts.length})
                                </button>
                            </div>
                        </div>

                        {/* Queue Dashboard */}
                        <div className="card">
                            <QueueDashboard
                                status={queueStatus}
                                onPause={handlePause}
                                onResume={handleResume}
                                onClearCompleted={handleClearCompleted}
                                onRetryFailed={handleRetryFailed}
                                onDownload={handleDownload}
                                onRetryItem={handleRetryItem}
                            />
                        </div>
                    </>
                ) : activeTab === 'youtube' ? (
                    <YoutubeDownloadTab />
                ) : (
                    <AiChatTab />
                )}
            </main>

            {/* Cookie Import Modal */}
            <CookieImportModal
                isOpen={isImportModalOpen}
                onClose={() => setIsImportModalOpen(false)}
                onSuccess={handleCookieImportSuccess}
            />
        </div>
    );
}

// Mount the app
const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);

