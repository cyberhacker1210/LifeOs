'use client';

import { useMemo } from 'react';
import { useTaskStore } from '@/stores/useTaskStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Sparkles, Play, CheckCircle2, ArrowRight, Flame } from 'lucide-react';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function DashboardActionCenter() {
    const { tasks, toggleTaskStatus } = useTaskStore();
    const { habits, completions, toggleHabitComplete } = useHabitStore();
    const { user } = useAuthStore();
    const today = format(new Date(), 'yyyy-MM-dd');

    const nextAction = useMemo(() => {
        // 1. Check for immediate tasks (with time assigned) that are not done
        const todayTasks = tasks.filter(t => t.date === today && t.status !== 'done');
        const timedTasks = todayTasks
            .filter(t => t.time)
            .sort((a, b) => (a.time || '').localeCompare(b.time || ''));

        if (timedTasks.length > 0) return { type: 'task', item: timedTasks[0] };

        // 2. Check for high priority tasks
        const highPriority = todayTasks.filter(t => t.priority === 'urgent' || t.priority === 'high');
        if (highPriority.length > 0) return { type: 'task', item: highPriority[0] };

        // 3. Fallback to any pending task
        if (todayTasks.length > 0) return { type: 'task', item: todayTasks[0] };

        // 4. Check for pending habits (non-check types first as they take more focus)
        const dayHabits = habits.filter(h => h.frequency === 'daily'); // Simplify
        const pendingHabits = dayHabits.filter(h => !completions.some(c => c.habitId === h.id && c.date === today));

        if (pendingHabits.length > 0) {
            const prioritizedHabit = pendingHabits.find(h => h.type !== 'check') || pendingHabits[0];
            return { type: 'habit', item: prioritizedHabit };
        }

        return null;
    }, [tasks, habits, completions, today]);

    if (!nextAction) return null;

    const { type, item } = nextAction;

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="col-span-full"
        >
            <Card className="glass-card border-primary/20 bg-primary/5 overflow-hidden relative group">
                {/* Decorative background element */}
                <div className="absolute -right-20 -top-20 w-64 h-64 bg-primary/10 rounded-full blur-3xl group-hover:bg-primary/20 transition-all duration-500" />

                <CardContent className="p-8 relative z-10">
                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                        <div className="space-y-4 text-center md:text-left">
                            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold uppercase tracking-widest">
                                <Sparkles className="w-3 h-3" />
                                Prochaine Action
                            </div>

                            <div>
                                <h3 className="text-3xl font-black tracking-tight mb-2">
                                    {type === 'task' ? (item as any).title : (item as any).name}
                                </h3>
                                <p className="text-muted-foreground text-lg max-w-xl">
                                    {type === 'task'
                                        ? ((item as any).notes || "C'est le moment idéal pour avancer sur cette tâche.")
                                        : ((item as any).description || "Prends quelques minutes pour ton rituel bien-être.")
                                    }
                                </p>
                            </div>

                            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                {type === 'task' && (item as any).time && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-sm">
                                        <span className="text-primary font-bold">{(item as any).time}</span>
                                        <span className="text-muted-foreground opacity-50">•</span>
                                        <span className="text-muted-foreground">{(item as any).duration || 60} min</span>
                                    </div>
                                )}
                                {type === 'habit' && (
                                    <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/5 border border-white/5 text-sm">
                                        <Flame className="w-4 h-4 text-orange-500" />
                                        <span className="font-bold">Série : {(item as any).currentStreak || 0}j</span>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-col gap-3 w-full md:w-auto min-w-[200px]">
                            <Button
                                className="h-14 rounded-2xl text-lg font-black shadow-xl shadow-primary/20 gap-3 group/btn"
                                onClick={() => {
                                    if (type === 'task') {
                                        // Logic to start focus mode if implemented, or just mark progress
                                        toast.success("Mode Focus activé ! 🎯");
                                    } else {
                                        // Open detail dialog via a global event or prop if needed,
                                        // for now let's just complete it
                                        user && toggleHabitComplete((item as any).id, user.uid, today);
                                    }
                                }}
                            >
                                <Play className="w-5 h-5 fill-current group-hover/btn:scale-110 transition-transform" />
                                {type === 'task' ? 'DÉMARRER FOCUS' : 'VALIDER RITUEL'}
                            </Button>

                            {type === 'task' && (
                                <Button
                                    variant="ghost"
                                    className="h-12 rounded-2xl font-bold gap-2 text-muted-foreground hover:text-primary transition-colors"
                                    onClick={() => toggleTaskStatus((item as any).id, 'todo')}
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    MARQUER COMME FAIT
                                </Button>
                            )}
                        </div>
                    </div>
                </CardContent>
            </Card>
        </motion.div>
    );
}
