import React, { useState } from 'react';
import { parsePrompts } from '@shared/utils';

interface PromptTextareaProps {
    onPromptsChange: (prompts: string[]) => void;
    disabled?: boolean;
}

export function PromptTextarea({ onPromptsChange, disabled }: PromptTextareaProps) {
    const [text, setText] = useState('');
    const promptCount = parsePrompts(text).length;

    const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const newText = e.target.value;
        setText(newText);
        onPromptsChange(parsePrompts(newText));
    };

    const handleClear = () => {
        setText('');
        onPromptsChange([]);
    };

    return (
        <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-slate-300">
                    Enter prompts (one per line)
                </label>
                {promptCount > 0 && (
                    <span className="text-xs text-slate-400" data-testid="prompt-count">
                        {promptCount} prompt{promptCount !== 1 ? 's' : ''}
                    </span>
                )}
            </div>

            <textarea
                value={text}
                onChange={handleChange}
                disabled={disabled}
                placeholder="A cinematic shot of sunset over mountains with dramatic clouds...
A futuristic city at night with neon lights and flying cars...
An underwater scene with colorful coral reefs and tropical fish..."
                className="textarea h-48 font-mono text-sm leading-relaxed disabled:opacity-50 disabled:cursor-not-allowed"
                data-testid="prompt-textarea"
            />

            {text && (
                <div className="flex justify-end">
                    <button
                        onClick={handleClear}
                        disabled={disabled}
                        className="text-sm text-slate-400 hover:text-white transition-colors cursor-pointer disabled:opacity-50"
                        data-testid="clear-prompts"
                    >
                        Clear all
                    </button>
                </div>
            )}
        </div>
    );
}
