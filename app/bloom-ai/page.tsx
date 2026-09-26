'use client';

import React, { useState } from 'react';
import AppShell from '@/components/layout/AppShell';
import { GlassCard } from '@/components/ui/GlassCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Bot, Send, Sparkles, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionSuggestions?: string[];
}

const INITIAL_MESSAGES: Message[] = [
  {
    id: 'm1',
    sender: 'ai',
    text: "I'm here if you need a hand. What's on your mind?",
    timestamp: 'Just now',
    actionSuggestions: [
      'Help me break this into smaller steps',
      'Help me make room in my day',
      'Give me a moment to reflect',
      'Help me think this through',
    ],
  },
];

export default function BloomAIPage() {
  const [messages, setMessages] = useState<Message[]>(INITIAL_MESSAGES);
  const [inputValue, setInputValue] = useState('');
  const [isThinking, setIsThinking] = useState(false);

  const handleSend = (textToSend?: string) => {
    const text = textToSend || inputValue;
    if (!text.trim()) return;

    const userMsg: Message = {
      id: `u-${Date.now()}`,
      sender: 'user',
      text: text.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInputValue('');
    setIsThinking(true);

    // Mindful intelligent responses
    setTimeout(() => {
      let replyText = '';
      let suggestions: string[] | undefined = undefined;

      const lower = text.toLowerCase();
      if (lower.includes('break down') || lower.includes('project')) {
        replyText =
          "Here is a mindful breakdown for your project:\n\n1. **Grounding (10 mins)**: Clarify the core outcome without worrying about edge cases.\n2. **Structure (25 mins)**: Sketch the rough skeleton or outline.\n3. **Quick Win (20 mins)**: Implement the simplest, most rewarding component first.\n4. **Review & Breathe**: Pause, hydrate, and celebrate the initial momentum.\n\nWould you like me to convert these into actionable tasks in your Bloom Tasks list?";
        suggestions = ['Yes, add these to Tasks', 'Help me refine Step 2', 'Show another approach'];
      } else if (lower.includes('schedule') || lower.includes('focus')) {
        replyText =
          "To optimize your focus, protect a 90-minute morning window from 09:30 to 11:00 AM when your cognitive energy is peak. Pair it with phone airplane mode, and follow with a 15-minute nature or tea walk. Your nervous system will thank you.";
        suggestions = ['Block this in Calendar', 'Suggest hydration reminders'];
      } else if (lower.includes('evening') || lower.includes('decompression') || lower.includes('reflection')) {
        replyText =
          "Take a slow breath. Notice three things: 1) You showed up and gave your effort today. 2) Unfinished tasks are simply seeds waiting for tomorrow's light. 3) What is one small moment of ease you can savor right now before sleeping?";
        suggestions = ['Log this in my Journal', 'Play a 1-minute breathing exercise'];
      } else {
        replyText =
          `I love this intention. As you navigate "${text}", remember that sustainable progress comes from consistency and gentleness rather than force. Focus on taking just the next single clear step.`;
        suggestions = ['What should my next step be?', 'Help me structure this in a Space'];
      }

      const aiMsg: Message = {
        id: `ai-${Date.now()}`,
        sender: 'ai',
        text: replyText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        actionSuggestions: suggestions,
      };

      setMessages((prev) => [...prev, aiMsg]);
      setIsThinking(false);
    }, 750);
  };

  return (
    <AppShell>
      {/* Ambient background */}
      <div className="bloom-ambient">
        <div className="bloom-glow-pink" />
        <div className="bloom-glow-peach" />
        <div className="bloom-glow-lilac" />
      </div>

      <div className="sanctuary-bg relative min-h-[calc(100vh-64px)] p-6 lg:p-8">
        <div className="relative z-10 mx-auto max-w-4xl space-y-6">
          {/* Header */}
          <div className="flex items-center justify-between">
            <div>
              <p className="editorial-label mb-2 text-primary">A THOUGHTFUL ASSISTANT</p>
              <div className="flex items-center gap-3">
                <h1 className="text-3xl font-bold tracking-tight text-on-surface flex items-center gap-2">
                  Bloom AI Companion
                </h1>
                <Badge variant="primary" size="sm" dot>
                  Active
                </Badge>
              </div>
              <p className="text-xs sm:text-sm text-on-surface-variant mt-1">
                Empathetic, structured assistance for planning, focus, and mindful living.
              </p>
            </div>

            <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-[#5A1835] to-[#B85C7A] text-white flex items-center justify-center shadow-[0_4px_20px_rgba(90,24,53,0.20)]">
              <Bot className="w-5 h-5" />
            </div>
          </div>

          {/* Chat Container */}
          <GlassCard className="p-4 sm:p-6 min-h-[520px] flex flex-col justify-between shadow-[0_8px_32px_rgba(182,0,86,0.06)]">
            {/* Messages List */}
            <div className="space-y-4 overflow-y-auto max-h-[500px] pr-2 pb-4">
              {messages.map((m) => {
                const isAI = m.sender === 'ai';
                return (
                  <div
                    key={m.id}
                    className={cn('flex flex-col', isAI ? 'items-start' : 'items-end')}
                  >
                    <div
                      className={cn(
                        'max-w-[85%] sm:max-w-[75%] rounded-3xl p-4 text-xs sm:text-sm leading-relaxed whitespace-pre-wrap',
                        isAI
                          ? 'bg-white/85 border border-white text-on-surface shadow-sm rounded-tl-sm backdrop-blur-md'
                          : 'berry-button text-white rounded-tr-sm shadow-[0_4px_20px_rgba(182,0,86,0.25)]'
                      )}
                    >
                      {isAI && (
                        <div className="flex items-center gap-1.5 text-[11px] font-bold text-primary mb-1.5">
                          <Sparkles className="w-3.5 h-3.5" />
                          <span>Bloom AI</span>
                        </div>
                      )}
                      {m.text}
                    </div>

                    <span className="text-[10px] text-outline mt-1 px-1">
                      {m.timestamp}
                    </span>

                    {/* Quick Action Suggestions from AI */}
                    {isAI && m.actionSuggestions && (
                      <div className="flex flex-wrap gap-1.5 mt-2.5">
                        {m.actionSuggestions.map((sug) => (
                          <button
                            key={sug}
                            onClick={() => handleSend(sug)}
                            className="text-[11px] px-3 py-1.5 rounded-full bg-white/70 hover:bg-white text-primary border border-primary/20 font-medium transition-colors text-left shadow-sm hover:scale-[1.02]"
                          >
                            {sug}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

              {isThinking && (
                <div className="flex items-center gap-2 text-xs text-primary italic py-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-primary" />
                  <span>Bloom AI is reflecting...</span>
                </div>
              )}
            </div>

            {/* Input Form */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="pt-4 border-t border-white/60 flex items-center gap-2"
            >
              <input
                type="text"
                placeholder="Ask Bloom AI for schedule advice, calming affirmations, or task breakdowns..."
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                className="flex-1 px-4 py-3 rounded-2xl bg-white/70 border border-white/90 text-xs sm:text-sm text-on-surface placeholder:text-outline/70 focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
              <Button
                type="submit"
                variant="primary"
                size="md"
                disabled={!inputValue.trim() || isThinking}
                rightIcon={<Send className="w-4 h-4" />}
              >
                Send
              </Button>
            </form>
          </GlassCard>
        </div>
      </div>
    </AppShell>
  );
}
