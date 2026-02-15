'use client';

import { useState, useEffect, useRef } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { parseTaskInput } from '@/lib/task-parser';
import { useDebounce } from '@/hooks/useDebounce';
import { useTaskStore } from '@/stores/useTaskStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { ArrowUp, Calendar, Clock, AlertCircle, Hash, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TaskPriority } from '@/types/task';

interface SmartTaskInputProps {
    className?: string;
}

export function SmartTaskInput({ className }: SmartTaskInputProps) {
    const [input, setInput] = useState('');
    const [notes, setNotes] = useState('');
    const [showNotes, setShowNotes] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const debouncedInput = useDebounce(input, 300);
    const [preview, setPreview] = useState<ReturnType<typeof parseTaskInput> | null>(null);
    const [manualPriority, setManualPriority] = useState<TaskPriority | null>(null);
    const [manualDate, setManualDate] = useState<string | null>(null);
    const [manualGroup, setManualGroup] = useState<string | null>(null);

    const { addTask } = useTaskStore();
    const { user } = useAuthStore();
    const inputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        if (debouncedInput.trim()) {
            const parsed = parseTaskInput(debouncedInput);
            setPreview(parsed);
        } else {
            setPreview(null);
            if (!input.trim()) {
                setManualPriority(null);
                setManualDate(null);
                setManualGroup(null);
            }
        }
    }, [debouncedInput, input]);

    const handleKeyDown = async (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            await handleSubmit();
        }
    };

    const finalPriority = manualPriority || preview?.priority || 'normal';
    const finalDate = manualDate || preview?.date;
    const finalGroup = manualGroup || preview?.group || 'Perso';

    const handleSubmit = async () => {
        if (!input.trim() || !user) return;

        setIsSubmitting(true);
        try {
            await addTask({
                title: preview?.title || input,
                notes: notes.trim() || undefined,
                group: finalGroup,
                subGroup: preview?.subGroup,
                priority: finalPriority,
                status: 'todo',
                date: finalDate,
                time: preview?.time,
                duration: preview?.duration,
                subTasks: [],
            }, user.uid);

            setInput('');
            setNotes('');
            setShowNotes(false);
            setPreview(null);
            setManualPriority(null);
            setManualDate(null);
            setManualGroup(null);
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            inputRef.current?.focus();
        }
    };

    const getPriorityColor = (priority: TaskPriority) => {
        switch (priority) {
            case 'urgent': return 'bg-red-500 hover:bg-red-600 text-white';
            case 'high': return 'bg-orange-500 hover:bg-orange-600 text-white';
            case 'low': return 'bg-blue-500 hover:bg-blue-600 text-white';
            default: return 'bg-gray-500 hover:bg-gray-600 text-white';
        }
    };

    return (
        <div className={cn("space-y-3", className)}>
            <div className="relative space-y-2">
                <div className="relative flex items-center">
                    <Input
                        ref={inputRef}
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder="Nouvelle tâche..."
                        className="pr-12 py-7 text-lg shadow-md bg-card/50 backdrop-blur-sm border-white/10"
                        disabled={isSubmitting}
                    />
                    <Button
                        size="sm"
                        className="absolute right-2 h-10 w-10 rounded-xl bg-primary shadow-lg shadow-primary/20 hover:shadow-primary/40 transition-all"
                        onClick={handleSubmit}
                        disabled={!input.trim() || isSubmitting}
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <ArrowUp className="h-5 w-5" />}
                    </Button>
                </div>

                {showNotes ? (
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="Ajouter des notes détaillées..."
                        className="w-full min-h-[80px] p-3 rounded-xl bg-white/5 border border-white/10 text-sm focus:outline-none focus:ring-1 focus:ring-primary/50 transition-all animate-in slide-in-from-top-2"
                    />
                ) : (
                    <button
                        onClick={() => setShowNotes(true)}
                        className="text-[10px] text-muted-foreground/60 hover:text-primary transition-colors px-1"
                    >
                        + Ajouter des notes
                    </button>
                )}
            </div>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    className={cn(
                        "text-xs p-2 rounded-lg border border-white/10 bg-card/50 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary",
                        finalPriority !== 'normal' && getPriorityColor(finalPriority)
                    )}
                    value={finalPriority}
                    onChange={(e) => setManualPriority(e.target.value as TaskPriority)}
                >
                    <option value="normal">Priorité : Normale</option>
                    <option value="low">Basse</option>
                    <option value="high">Haute</option>
                    <option value="urgent">Urgent</option>
                </select>

                <select
                    className={cn(
                        "text-xs p-2 rounded-lg border border-white/10 bg-card/50 text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary",
                        finalDate && "bg-blue-500/10 text-blue-400 border-blue-500/20"
                    )}
                    value={finalDate || ''}
                    onChange={(e) => setManualDate(e.target.value || null)}
                >
                    <option value="">Pas de date</option>
                    <option value={new Date().toISOString().split('T')[0]}>Aujourd'hui</option>
                    <option value={new Date(Date.now() + 86400000).toISOString().split('T')[0]}>Demain</option>
                </select>

                <div className="flex gap-1 ml-auto">
                    {['Scolaire', 'Sport', 'Perso', 'Projets'].map(g => (
                        <button
                            key={g}
                            onClick={() => setManualGroup(g)}
                            className={cn(
                                "text-[10px] px-2 py-1 rounded-full border transition-all",
                                finalGroup === g
                                    ? "bg-primary/20 border-primary text-primary"
                                    : "bg-white/5 border-white/10 text-muted-foreground hover:bg-white/10"
                            )}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            </div>

            {preview && input.trim() && (
                <div className="flex items-center gap-2 text-[10px] text-muted-foreground animate-in fade-in slide-in-from-top-1 px-1">
                    <Hash className="h-3 w-3" />
                    Détecté : <span className="text-primary">{preview.title}</span>
                    {preview.duration && (
                        <>
                            <span className="mx-1">•</span>
                            <Clock className="h-3 w-3" />
                            {preview.duration}m
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
