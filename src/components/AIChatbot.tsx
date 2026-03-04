'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User, Sparkles, Trash2 } from 'lucide-react';
import { useData } from '@/context/DataContext';
import { calculateSummary, calculateMonthlyAmount, formatCurrency } from '@/lib/financial';

interface ChatMessage {
    id: string;
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
}

export function AIChatbot() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<ChatMessage[]>([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [hasGreeted, setHasGreeted] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const { transactions, banks, weeklyTransferAmount } = useData();

    const scrollToBottom = useCallback(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages, scrollToBottom]);

    useEffect(() => {
        if (isOpen && inputRef.current) {
            inputRef.current.focus();
        }
    }, [isOpen]);

    // Add greeting on first open
    useEffect(() => {
        if (isOpen && !hasGreeted) {
            setHasGreeted(true);
            setMessages([
                {
                    id: 'greeting',
                    role: 'assistant',
                    content: "Hey! 👋 I'm your AI financial assistant. I can see your transactions, income, expenses, and debts. Ask me anything — like *\"What's my monthly cashflow?\"* or *\"How can I save more?\"*",
                    timestamp: new Date(),
                },
            ]);
        }
    }, [isOpen, hasGreeted]);

    const buildFinancialContext = useCallback(() => {
        const getBankName = (bankId: string) =>
            banks.find((b) => b.id === bankId)?.name || 'Unknown Bank';

        const summary = calculateSummary(transactions);

        const totalExpenseAndDebt = transactions
            .filter((t) => t.type === 'expense' || (t.type === 'debt' && t.amount > 0))
            .reduce((sum, t) => sum + calculateMonthlyAmount(t.amount, t.frequency), 0);

        const netMonthlyCashflow = summary.monthlyIncome - totalExpenseAndDebt;

        const incomeItems = transactions
            .filter((t) => t.type === 'income')
            .map(
                (t) =>
                    `- ${t.title}: ${formatCurrency(t.amount)} (${t.frequency}) from ${getBankName(t.bankId)}`
            );

        const expenseItems = transactions
            .filter((t) => t.type === 'expense')
            .map(
                (t) =>
                    `- ${t.title}: ${formatCurrency(t.amount)} (${t.frequency}) [${t.category}] from ${getBankName(t.bankId)}`
            );

        const debtItems = transactions
            .filter((t) => t.type === 'debt')
            .map((t) => {
                let debtInfo = `- ${t.title}: ${formatCurrency(t.amount)} (${t.frequency}) from ${getBankName(t.bankId)}`;
                if (t.remainingBalance) {
                    debtInfo += ` | Remaining: ${formatCurrency(t.remainingBalance)}`;
                }
                if (t.monthlyInterest) {
                    debtInfo += ` | Monthly Interest: ${formatCurrency(t.monthlyInterest)}`;
                }
                return debtInfo;
            });

        const bankList = banks
            .map((b) => `- ${b.name} (${b.type})`)
            .join('\n');

        return `
SUMMARY:
- Total Monthly Income: ${formatCurrency(summary.monthlyIncome)}
- Total Monthly Expenses & Debt Payments: ${formatCurrency(totalExpenseAndDebt)}
- Net Monthly Cashflow: ${formatCurrency(netMonthlyCashflow)}
- Total Remaining Debt: ${formatCurrency(summary.totalDebt)}
- Weekly Income: ${formatCurrency(summary.weeklyIncome)}
- Weekly Transfer Amount (HSBC → Santander): ${formatCurrency(weeklyTransferAmount)}

BANKS:
${bankList || 'No banks configured'}

INCOME (${incomeItems.length} items):
${incomeItems.join('\n') || 'None'}

EXPENSES (${expenseItems.length} items):
${expenseItems.join('\n') || 'None'}

DEBTS (${debtItems.length} items):
${debtItems.join('\n') || 'None'}
`.trim();
    }, [transactions, banks, weeklyTransferAmount]);

    const handleSend = async () => {
        const trimmed = input.trim();
        if (!trimmed || isLoading) return;

        const userMessage: ChatMessage = {
            id: Date.now().toString(),
            role: 'user',
            content: trimmed,
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: trimmed,
                    financialContext: buildFinancialContext(),
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.error || 'Failed to get response');
            }

            const aiMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: data.response,
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, aiMessage]);
        } catch (error: any) {
            const errorMessage: ChatMessage = {
                id: (Date.now() + 1).toString(),
                role: 'assistant',
                content: `Sorry, I ran into an error: ${error.message}. Please try again.`,
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const handleClear = () => {
        setMessages([
            {
                id: 'greeting-reset',
                role: 'assistant',
                content: "Chat cleared! 🧹 I'm ready for new questions about your finances.",
                timestamp: new Date(),
            },
        ]);
    };

    const formatMessageContent = (content: string) => {
        // Simple markdown-like formatting
        return content
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code class="chatbot-code">$1</code>')
            .replace(/^- (.+)$/gm, '<span class="chatbot-list-item">• $1</span>')
            .replace(/\n/g, '<br />');
    };

    return (
        <>
            {/* Floating Action Button */}
            <button
                id="chatbot-fab"
                onClick={() => setIsOpen(!isOpen)}
                className={`chatbot-fab ${isOpen ? 'chatbot-fab-active' : ''}`}
                aria-label={isOpen ? 'Close chat' : 'Open AI assistant'}
            >
                <span className="chatbot-fab-icon">
                    {isOpen ? (
                        <X className="h-6 w-6" />
                    ) : (
                        <>
                            <Sparkles className="h-6 w-6" />
                            <span className="chatbot-fab-pulse" />
                        </>
                    )}
                </span>
            </button>

            {/* Chat Panel */}
            {isOpen && (
                <div className="chatbot-panel" role="dialog" aria-label="AI Financial Assistant">
                    {/* Header */}
                    <div className="chatbot-header">
                        <div className="chatbot-header-info">
                            <div className="chatbot-avatar">
                                <Bot className="h-5 w-5" />
                            </div>
                            <div>
                                <h3 className="chatbot-title">Finance AI</h3>
                                <p className="chatbot-subtitle">
                                    {isLoading ? 'Thinking...' : 'Online'}
                                </p>
                            </div>
                        </div>
                        <div className="chatbot-header-actions">
                            <button
                                onClick={handleClear}
                                className="chatbot-header-btn"
                                title="Clear chat"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                            <button
                                onClick={() => setIsOpen(false)}
                                className="chatbot-header-btn"
                                title="Close"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="chatbot-messages custom-scrollbar">
                        {messages.map((msg) => (
                            <div
                                key={msg.id}
                                className={`chatbot-message ${msg.role === 'user' ? 'chatbot-message-user' : 'chatbot-message-ai'
                                    }`}
                            >
                                <div
                                    className={`chatbot-message-icon ${msg.role === 'user' ? 'chatbot-icon-user' : 'chatbot-icon-ai'
                                        }`}
                                >
                                    {msg.role === 'user' ? (
                                        <User className="h-3.5 w-3.5" />
                                    ) : (
                                        <Bot className="h-3.5 w-3.5" />
                                    )}
                                </div>
                                <div
                                    className={`chatbot-bubble ${msg.role === 'user' ? 'chatbot-bubble-user' : 'chatbot-bubble-ai'
                                        }`}
                                    dangerouslySetInnerHTML={{
                                        __html: formatMessageContent(msg.content),
                                    }}
                                />
                            </div>
                        ))}

                        {isLoading && (
                            <div className="chatbot-message chatbot-message-ai">
                                <div className="chatbot-message-icon chatbot-icon-ai">
                                    <Bot className="h-3.5 w-3.5" />
                                </div>
                                <div className="chatbot-bubble chatbot-bubble-ai">
                                    <div className="chatbot-typing">
                                        <span />
                                        <span />
                                        <span />
                                    </div>
                                </div>
                            </div>
                        )}

                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Area */}
                    <div className="chatbot-input-area">
                        <div className="chatbot-input-wrapper">
                            <textarea
                                ref={inputRef}
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="Ask about your finances..."
                                className="chatbot-input custom-scrollbar"
                                rows={1}
                                disabled={isLoading}
                            />
                            <button
                                onClick={handleSend}
                                disabled={!input.trim() || isLoading}
                                className="chatbot-send-btn"
                                aria-label="Send message"
                            >
                                {isLoading ? (
                                    <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                    <Send className="h-4 w-4" />
                                )}
                            </button>
                        </div>
                        <p className="chatbot-disclaimer">
                            AI can make mistakes. Verify important financial decisions.
                        </p>
                    </div>
                </div>
            )}
        </>
    );
}
