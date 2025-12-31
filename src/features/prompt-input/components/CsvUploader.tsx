import React, { useRef } from 'react';
import { parsePromptsFromCsv } from '@shared/utils';

interface CsvUploaderProps {
    onPromptsLoaded: (prompts: string[]) => void;
    disabled?: boolean;
}

export function CsvUploader({ onPromptsLoaded, disabled }: CsvUploaderProps) {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const content = event.target?.result as string;
            const prompts = parsePromptsFromCsv(content);
            if (prompts.length > 0) {
                onPromptsLoaded(prompts);
            }
        };
        reader.readAsText(file);

        // Reset input so same file can be selected again
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    };

    return (
        <div>
            <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.txt"
                onChange={handleFileChange}
                disabled={disabled}
                className="hidden"
                id="csv-upload"
                data-testid="csv-uploader"
            />
            <label
                htmlFor="csv-upload"
                className={`btn-secondary inline-flex ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                data-testid="upload-csv-button"
            >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Upload CSV
            </label>
        </div>
    );
}
