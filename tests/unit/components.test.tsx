import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ChatInput } from '../../src/features/ai-chat/ChatInput';
import { ChatMessage } from '../../src/features/ai-chat/ChatMessage';
import { ChatMessage as ChatMessageType } from '../../src/features/ai-chat/types';
import { CookieStatus } from '../../src/features/cookie-import/components/CookieStatus';

describe('ChatInput', () => {
    it('renders input and send button', () => {
        render(<ChatInput onSend={() => { }} />);
        expect(screen.getByPlaceholderText(/Type your message/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Send/i })).toBeInTheDocument();
    });

    it('calls onSend when send button is clicked', () => {
        const handleSend = vi.fn();
        render(<ChatInput onSend={handleSend} />);

        const input = screen.getByPlaceholderText(/Type your message/i);
        fireEvent.change(input, { target: { value: 'Hello AI' } });

        const button = screen.getByRole('button', { name: /Send/i });
        fireEvent.click(button);

        expect(handleSend).toHaveBeenCalledWith('Hello AI');
    });

    it('calls onSend when Enter is pressed', () => {
        const handleSend = vi.fn();
        render(<ChatInput onSend={handleSend} />);

        const input = screen.getByPlaceholderText(/Type your message/i);
        fireEvent.change(input, { target: { value: 'Hello AI' } });
        fireEvent.keyDown(input, { key: 'Enter', code: 'Enter' });

        expect(handleSend).toHaveBeenCalledWith('Hello AI');
    });

    it('does not send empty message', () => {
        const handleSend = vi.fn();
        render(<ChatInput onSend={handleSend} />);

        const button = screen.getByRole('button', { name: /Send/i });
        fireEvent.click(button);

        expect(handleSend).not.toHaveBeenCalled();
    });
});

describe('ChatMessage', () => {
    const userMessage: ChatMessageType = {
        id: '1',
        role: 'user',
        content: 'User message',
        timestamp: new Date(),
    };

    const aiMessage: ChatMessageType = {
        id: '2',
        role: 'assistant',
        content: 'AI response',
        timestamp: new Date(),
    };

    it('renders user message correctly', () => {
        render(<ChatMessage message={userMessage} />);
        expect(screen.getByText('User message')).toBeInTheDocument();
        expect(screen.getByTestId('user-message')).toHaveClass('bg-primary-500');
    });

    it('renders AI message correctly', () => {
        render(<ChatMessage message={aiMessage} />);
        expect(screen.getByText('AI response')).toBeInTheDocument();
        expect(screen.getByTestId('assistant-message')).toHaveClass('glass');
    });
});

describe('CookieStatus', () => {
    it('renders cookie status', () => {
        render(<CookieStatus onRefresh={() => { }} onOpenImport={() => { }} />);
        expect(screen.getByText(/Cookie Status:/i)).toBeInTheDocument();
    });
});
