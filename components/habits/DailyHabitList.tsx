'use client';

import { useState } from 'react';
import { useHabitStore } from '@/stores/useHabitStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Plus, Check, Hash, Timer, BarChart3, Flame, Settings, Trophy, Calendar as CalendarIcon, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Progress } from '@/components/ui/progress';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Habit } from '@/types/habit';

interface DailyHabitListProps {
    date: Date;
    className?: string;
    onViewHabits?: () => void;
}

export function DailyHabitList({ date, className, onViewHabits }: DailyHabitListProps) {
    const { habits, completions, toggleHabitComplete } = useHabitStore();
    const { user } = useAuthStore();
    const [selectedHabit, setSelectedHabit] = useState<Habit | null>(null);
    const dateStr = format(date, 'yyyy-MM-dd');

    const dailyHabits = habits.filter(habit => {
        if (habit.frequency === 'daily') return true;
        return true;
    });

    const completedToday = dailyHabits.filter(h =>
        completions.some(c => c.habitId === h.id && c.date === dateStr)
    ).length;

    const progress = dailyHabits.length > 0 ? (completedToday / dailyHabits.length) * 100 : 0;

    return (
        <div className={cn("space-y-4", className)}>
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="font-black text-sm uppercase tracking-wider text-muted-foreground/80">
                        Habitudes du Jour
                    </h3>
                    <p className="text-[10px] text-muted-foreground">
                        {completedToday} sur {dailyHabits.length} complétées
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 hover:bg-white/5"
                        onClick={onViewHabits}
                        title="Gérer les habitudes"
                    >
                        <Settings className="h-4 w-4 opacity-40 hover:opacity-100 transition-opacity" />
                    </Button>
                    <div className="flex items-center gap-1 text-orange-500 text-xs font-bold bg-orange-500/10 px-2 py-1 rounded-full">
                        <Flame className="h-3 w-3 fill-current" />
                        <span>{dailyHabits[0]?.currentStreak || 0}</span>
                    </div>
                </div>
            </div>

            <Progress value={progress} className="h-1 bg-white/5" />

            <div className="space-y-2">
                {dailyHabits.map((habit) => {
                    const isCompleted = completions.some(c => c.habitId === habit.id && c.date === dateStr);

                    return (
                        <div
                            key={habit.id}
                            className={cn(
                                "group flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer",
                                isCompleted
                                    ? "glass-card border-primary/30 bg-primary/5"
                                    : "glass-card border-white/5 hover:border-white/10"
                            )}
                            onClick={() => setSelectedHabit(habit)}
                        >
                            <div className="flex items-center gap-3">
                                <div
                                    className={cn(
                                        "w-8 h-8 rounded-lg flex items-center justify-center text-lg",
                                        isCompleted ? "opacity-100" : "opacity-70 group-hover:opacity-100"
                                    )}
                                    style={{ backgroundColor: `${habit.color}15` }}
                                >
                                    {habit.icon}
                                </div>
                                <div>
                                    <p className={cn(
                                        "text-sm font-bold truncate max-w-[120px]",
                                        isCompleted && "line-through opacity-50 font-normal"
                                    )}>
                                        {habit.name}
                                    </p>
                                    <div className="flex items-center gap-2 mt-0.5">
                                        {habit.type === 'timer' && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Timer className="h-3 w-3" /> {habit.durationMinutes}m
                                            </span>
                                        )}
                                        {habit.type === 'counter' && (
                                            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                                                <Hash className="h-3 w-3" /> {habit.goal} {habit.unit}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    user && toggleHabitComplete(habit.id, user.uid, dateStr);
                                }}
                                className={cn(
                                    "w-6 h-6 rounded-full border-2 flex items-center justify-center transition-all",
                                    isCompleted
                                        ? "bg-primary border-primary text-primary-foreground scale-110 shadow-lg shadow-primary/20"
                                        : "border-white/10 group-hover:border-primary/50"
                                )}
                            >
                                {isCompleted && <Check className="h-3.5 w-3.5" />}
                            </button>
                        </div>
                    );
                })}

                {dailyHabits.length === 0 && (
                    <p className="text-center py-4 text-[10px] text-muted-foreground uppercase tracking-widest leading-loose">
                        Aucune habitude <br /> pour aujourd'hui
                    </p>
                )}
            </div>

            <Dialog open={!!selectedHabit} onOpenChange={() => setSelectedHabit(null)}>
                <DialogContent className="glass-card border-white/10 max-w-md">
                    {selectedHabit && (
                        <>
                            <DialogHeader>
                                <div className="flex items-center gap-4 mb-4">
                                    <div
                                        className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl"
                                        style={{ backgroundColor: `${selectedHabit.color}20` }}
                                    >
                                        {selectedHabit.icon}
                                    </div>
                                    <div>
                                        <DialogTitle className="text-xl font-black">{selectedHabit.name}</DialogTitle>
                                        <p className="text-xs text-muted-foreground uppercase tracking-widest">{selectedHabit.type}</p>
                                    </div>
                                </div>
                            </DialogHeader>

                            <div className="space-y-6">
                                {selectedHabit.description && (
                                    <p className="text-sm text-muted-foreground leading-relaxed italic">
                                        "{selectedHabit.description}"
                                    </p>
                                )}

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 overflow-hidden">
                                        <div className="flex items-center gap-2 text-orange-500 font-bold text-xs uppercase tracking-tighter">
                                            <Flame className="h-3 w-3 fill-current" />
                                            Série Actuelle
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black">{selectedHabit.currentStreak || 0}</span>
                                            <span className="text-[10px] text-muted-foreground opacity-60">jours</span>
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/5 border border-white/5 flex flex-col gap-1 overflow-hidden">
                                        <div className="flex items-center gap-2 text-yellow-500 font-bold text-xs uppercase tracking-tighter">
                                            <Trophy className="h-3 w-3 fill-current" />
                                            Record
                                        </div>
                                        <div className="flex items-baseline gap-1">
                                            <span className="text-3xl font-black">{selectedHabit.bestStreak || 0}</span>
                                            <span className="text-[10px] text-muted-foreground opacity-60">jours</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-4 pt-2">
                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <CalendarIcon className="h-3.5 w-3.5" />
                                            Fréquence
                                        </div>
                                        <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 uppercase text-[10px] tracking-widest">
                                            {selectedHabit.frequency === 'daily' ? 'Quotidien' : 'Personnalisé'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <Clock className="h-3.5 w-3.5" />
                                            Objectif
                                        </div>
                                        <span className="font-bold">
                                            {selectedHabit.type === 'timer' && `${selectedHabit.durationMinutes} minutes`}
                                            {selectedHabit.type === 'counter' && `${selectedHabit.goal} ${selectedHabit.unit}`}
                                            {selectedHabit.type === 'check' && 'Validation simple'}
                                        </span>
                                    </div>

                                    <div className="flex items-center justify-between text-xs font-medium">
                                        <div className="flex items-center gap-2 text-muted-foreground">
                                            <BarChart3 className="h-3.5 w-3.5" />
                                            Total complété
                                        </div>
                                        <span className="font-bold text-primary">{selectedHabit.totalCompletions || 0} fois</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        variant="outline"
                                        className="flex-1 h-12 rounded-xl font-bold border-white/5 hover:bg-white/5"
                                        onClick={() => setSelectedHabit(null)}
                                    >
                                        Fermer
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        className="h-12 w-12 rounded-xl text-muted-foreground/40 hover:text-destructive hover:bg-destructive/10 transition-colors"
                                        onClick={() => {
                                            if (confirm(`Supprimer l'habitude "${selectedHabit.name}" ?`)) {
                                                useHabitStore.getState().deleteHabit(selectedHabit.id);
                                                setSelectedHabit(null);
                                            }
                                        }}
                                        title="Supprimer l'habitude"
                                    >
                                        <Plus className="h-5 w-5 rotate-45" />
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}
