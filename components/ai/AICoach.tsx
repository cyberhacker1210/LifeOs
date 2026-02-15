'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Brain, X, Send, Sparkles, MessageCircle, PlusCircle, Calendar, Zap, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { getCoachResponse } from '@/lib/ai';
import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useHabitStore } from '@/stores/useHabitStore';
import ReactMarkdown from 'react-markdown';
import { toast } from 'sonner';

interface AICoachAction {
    type: 'ADD_TASK' | 'ADD_HABIT' | 'PLAN_TASK';
    payload: string;
    subTasks?: string[];
    originalMatch: string;
}

export function AICoach() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<{ role: 'user' | 'ai', content: string, actions?: AICoachAction[] }[]>([
        { role: 'ai', content: 'Salut ! Je suis ton Coach LifeOS. Comment puis-je t\'aider à être plus productif aujourd\'hui ?' }
    ]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);
    const { profile, user } = useAuthStore();
    const { addTask, updateTaskDate } = useTaskStore();
    const { addHabit } = useHabitStore();

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages]);

    const parseActions = (text: string): { cleanText: string, actions: AICoachAction[] } => {
        const actions: AICoachAction[] = [];
        let cleanText = text;

        const regex = /\[(ADD_TASK|ADD_HABIT|PLAN_TASK):\s*([^\]]+)\]/g;
        let match;

        while ((match = regex.exec(text)) !== null) {
            let payload = match[2].trim();
            let subTasks: string[] | undefined;

            if (match[1] === 'ADD_TASK' && payload.includes('|')) {
                const parts = payload.split('|');
                payload = parts[0].trim();
                subTasks = parts[1].split(',').map(s => s.trim()).filter(Boolean);
            }

            actions.push({
                type: match[1] as any,
                payload,
                subTasks,
                originalMatch: match[0]
            });
            cleanText = cleanText.replace(match[0], '');
        }

        return { cleanText: cleanText.trim(), actions };
    };

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg = input;
        setInput('');
        setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
        setIsLoading(true);

        try {
            const context = {
                chronotype: profile?.chronotype,
                patterns: profile?.patterns,
                optimalDurations: profile?.optimalSessionDurations
            };
            const aiRawMsg = await getCoachResponse(userMsg, context);

            if (aiRawMsg) {
                const { cleanText, actions } = parseActions(aiRawMsg);
                setMessages(prev => [...prev, { role: 'ai', content: cleanText, actions }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', content: "Désolé, je rencontre une petite difficulté technique." }]);
            }
        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'ai', content: "Une erreur est survenue. Vérifie ta connexion." }]);
        } finally {
            setIsLoading(false);
        }
    };

    const applyAction = async (action: AICoachAction, msgIndex: number) => {
        if (!user) return;

        try {
            switch (action.type) {
                case 'ADD_TASK':
                    await addTask({
                        title: action.payload,
                        description: '',
                        priority: 'normal',
                        status: 'todo',
                        group: 'IA Suggestion',
                        subTasks: action.subTasks?.map(st => ({
                            id: Math.random().toString(36).substr(2, 9),
                            title: st,
                            completed: false
                        })) || []
                    }, user.uid);
                    break;
                case 'ADD_HABIT':
                    await addHabit({
                        name: action.payload,
                        description: 'Suggéré par ton coach IA',
                        icon: '✨',
                        color: '#8B5CF6',
                        type: 'check',
                        frequency: 'daily',
                        userId: user.uid,
                        moment: 'anytime',
                        order: 0,
                        importanceScore: 50,
                        productivityImpact: 50,
                        isActive: true
                    });
                    break;
                case 'PLAN_TASK':
                    const [id, time] = action.payload.split(',').map(s => s.trim());
                    // This is a bit simplified, ideally we find the task by title if ID is not stable in AI context
                    // For now, let's assume the AI gives a title or specific hint
                    toast.info(`Planification suggérée : ${action.payload}`);
                    break;
            }

            // Remove action from message after applying
            setMessages(prev => prev.map((m, i) =>
                i === msgIndex ? { ...m, actions: m.actions?.filter(a => a !== action) } : m
            ));
        } catch (err) {
            console.error(err);
            toast.error("Erreur lors de l'application de l'action");
        }
    };

    return (
        <div className="fixed bottom-6 right-6 z-50">
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        className="mb-4 w-80 md:w-96"
                    >
                        <Card className="shadow-2xl border-white/10 bg-[#0A0A0B]/95 backdrop-blur-xl overflow-hidden">
                            <CardHeader className="flex flex-row items-center justify-between py-4 px-6 border-b border-white/5 bg-white/[0.02]">
                                <CardTitle className="text-sm font-black flex items-center gap-2 uppercase tracking-widest text-primary">
                                    <Brain className="w-4 h-4" />
                                    Coach LifeOS
                                </CardTitle>
                                <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-white" onClick={() => setIsOpen(false)}>
                                    <X className="w-4 h-4" />
                                </Button>
                            </CardHeader>
                            <CardContent className="p-0">
                                <div
                                    ref={scrollRef}
                                    className="h-[450px] overflow-y-auto p-6 space-y-6 scroll-smooth"
                                >
                                    {messages.map((m, i) => (
                                        <div
                                            key={i}
                                            className={`flex flex-col ${m.role === 'user' ? 'items-end' : 'items-start'} gap-2`}
                                        >
                                            <div
                                                className={`max-w-[90%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm ${m.role === 'user'
                                                    ? 'bg-primary text-primary-foreground rounded-tr-none font-bold'
                                                    : 'glass-card border-white/5 bg-white/5 rounded-tl-none text-muted-foreground'
                                                    }`}
                                            >
                                                {m.role === 'ai' ? (
                                                    <div className="prose prose-invert prose-sm max-w-none">
                                                        <ReactMarkdown>{m.content}</ReactMarkdown>
                                                    </div>
                                                ) : m.content}
                                            </div>

                                            {/* Action Suggestions */}
                                            {m.actions && m.actions.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-1 w-full max-w-[90%]">
                                                    {m.actions.map((action, ai) => (
                                                        <motion.div
                                                            key={ai}
                                                            initial={{ opacity: 0, y: 10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            className="w-full"
                                                        >
                                                            <div className="bg-primary/10 border border-primary/20 rounded-xl p-3 flex items-center justify-between gap-3 group hover:bg-primary/20 transition-colors">
                                                                <div className="flex items-center gap-2 overflow-hidden">
                                                                    <div className="p-1.5 rounded-lg bg-primary/20 text-primary shrink-0">
                                                                        {action.type === 'ADD_TASK' && <PlusCircle className="w-4 h-4" />}
                                                                        {action.type === 'ADD_HABIT' && <Zap className="w-4 h-4" />}
                                                                        {action.type === 'PLAN_TASK' && <Calendar className="w-4 h-4" />}
                                                                    </div>
                                                                    <div className="truncate">
                                                                        <p className="text-[10px] font-black uppercase tracking-tighter text-primary/70">
                                                                            {action.type === 'ADD_TASK' ? 'Nouvelle Tâche' :
                                                                                action.type === 'ADD_HABIT' ? 'Nouvelle Habitude' : 'Planification'}
                                                                        </p>
                                                                        <p className="text-xs font-bold truncate text-white">{action.payload}</p>
                                                                    </div>
                                                                </div>
                                                                <Button
                                                                    size="sm"
                                                                    className="h-8 rounded-lg font-black text-[10px] gap-1 px-3 shadow-lg shadow-primary/20"
                                                                    onClick={() => applyAction(action, i)}
                                                                >
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    APPLIQUER
                                                                </Button>
                                                            </div>
                                                        </motion.div>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex justify-start">
                                            <div className="glass-card border-white/5 bg-white/5 rounded-2xl rounded-tl-none px-4 py-3 text-sm text-muted-foreground flex items-center gap-2">
                                                <Sparkles className="w-4 h-4 animate-pulse text-primary" />
                                                <span className="italic font-medium">Réflexion stratégique...</span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                <div className="p-4 border-t border-white/5 bg-white/[0.01] flex gap-2">
                                    <Input
                                        placeholder="Pose ta question..."
                                        value={input}
                                        onChange={(e) => setInput(e.target.value)}
                                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                        className="h-11 bg-white/5 border-white/10 rounded-xl focus:ring-primary focus:border-primary transition-all"
                                    />
                                    <Button size="icon" className="h-11 w-11 shrink-0 rounded-xl shadow-xl shadow-primary/20" onClick={handleSend} disabled={isLoading}>
                                        <Send className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                className="bg-primary text-primary-foreground w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:bg-primary/90 transition-all group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                {isOpen ? <X className="w-6 h-6 relative z-10" /> : <MessageCircle className="w-6 h-6 relative z-10" />}
            </motion.button>
        </div>
    );
}
