'use client';

import { useState, useEffect } from 'react';
import { useHabitStore } from '@/stores/useHabitStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import {
    Check,
    ChevronRight,
    RotateCcw,
    X,
    Timer,
    SkipForward,
    Play,
    Pause
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

export function RoutinePlayer() {
    const {
        habits,
        activeRoutineHabitId,
        nextRoutineHabit,
        stopRoutine,
        toggleHabitComplete,
        routines
    } = useHabitStore();
    const { user } = useAuthStore();

    const [timeLeft, setTimeLeft] = useState(0);
    const [isActive, setIsActive] = useState(false);
    const [progress, setProgress] = useState(0);

    const activeHabit = habits.find(h => h.id === activeRoutineHabitId);

    // Find active routine
    const activeRoutine = routines.find(r => r.habitIds.includes(activeRoutineHabitId || ''));

    useEffect(() => {
        if (activeHabit && activeHabit.type === 'timer' && activeHabit.durationMinutes) {
            setTimeLeft(activeHabit.durationMinutes * 60);
            setIsActive(true);
        } else {
            setTimeLeft(0);
            setIsActive(false);
        }
    }, [activeRoutineHabitId, activeHabit]);

    useEffect(() => {
        let interval: NodeJS.Timeout;
        if (isActive && timeLeft > 0) {
            interval = setInterval(() => {
                setTimeLeft(prev => prev - 1);
            }, 1000);
        } else if (timeLeft === 0 && isActive) {
            setIsActive(false);
        }
        return () => clearInterval(interval);
    }, [isActive, timeLeft]);

    if (!activeRoutineHabitId || !activeHabit) return null;

    const totalHabits = activeRoutine?.habitIds.length || 0;
    const currentIndex = activeRoutine?.habitIds.indexOf(activeRoutineHabitId) || 0;
    const overallProgress = ((currentIndex) / totalHabits) * 100;

    const handleComplete = () => {
        if (user) {
            const today = format(new Date(), 'yyyy-MM-dd');
            toggleHabitComplete(activeHabit.id, user.uid, today, activeHabit.type === 'timer' ? activeHabit.durationMinutes : undefined);
            nextRoutineHabit();
        }
    };

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
    };

    return (
        <div className="fixed inset-0 z-50 bg-background/95 backdrop-blur-xl flex flex-col items-center justify-center p-6 animate-in fade-in zoom-in duration-300">
            <Button
                variant="ghost"
                size="icon"
                className="absolute top-6 right-6"
                onClick={stopRoutine}
            >
                <X className="h-6 w-6" />
            </Button>

            <div className="w-full max-w-2xl space-y-8">
                <div className="text-center space-y-2">
                    <h2 className="text-muted-foreground font-medium uppercase tracking-widest text-sm">
                        {activeRoutine?.name || 'Routine en cours'}
                    </h2>
                    <div className="flex items-center justify-center gap-4">
                        <span className="text-4xl font-black">{activeHabit.name}</span>
                        <div className="p-2 rounded-xl bg-primary/10 text-primary">
                            {activeHabit.icon}
                        </div>
                    </div>
                    {activeHabit.description && (
                        <p className="text-xl text-muted-foreground/80">{activeHabit.description}</p>
                    )}
                </div>

                <Card className="glass-card border-2 border-primary/20 shadow-2xl shadow-primary/10 overflow-hidden">
                    <CardContent className="p-12 flex flex-col items-center gap-8">
                        {activeHabit.type === 'timer' ? (
                            <div className="relative flex items-center justify-center">
                                <svg className="w-64 h-64 -rotate-90">
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="120"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        className="text-muted/20"
                                    />
                                    <circle
                                        cx="128"
                                        cy="128"
                                        r="120"
                                        stroke="currentColor"
                                        strokeWidth="8"
                                        fill="transparent"
                                        strokeDasharray={754}
                                        strokeDashoffset={754 - (754 * (timeLeft / (activeHabit.durationMinutes! * 60)))}
                                        className="text-primary transition-all duration-1000 ease-linear"
                                        strokeLinecap="round"
                                    />
                                </svg>
                                <div className="absolute flex flex-col items-center">
                                    <span className="text-6xl font-black tabular-nums">{formatTime(timeLeft)}</span>
                                    <span className="text-sm font-medium text-muted-foreground">rester</span>
                                </div>
                            </div>
                        ) : (
                            <div className="py-12">
                                <div className="h-32 w-32 rounded-full bg-primary/10 flex items-center justify-center animate-pulse">
                                    <Check className="h-16 w-16 text-primary" />
                                </div>
                            </div>
                        )}

                        <div className="flex gap-4">
                            {activeHabit.type === 'timer' && (
                                <Button
                                    size="lg"
                                    variant="outline"
                                    className="h-16 w-16 rounded-full"
                                    onClick={() => setIsActive(!isActive)}
                                >
                                    {isActive ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6" />}
                                </Button>
                            )}
                            <Button
                                size="lg"
                                className="h-16 px-10 rounded-full text-lg font-bold shadow-xl shadow-primary/20"
                                onClick={handleComplete}
                            >
                                <Check className="mr-2 h-6 w-6" />
                                Terminé
                            </Button>
                            <Button
                                size="lg"
                                variant="ghost"
                                className="h-16 w-16 rounded-full"
                                onClick={nextRoutineHabit}
                            >
                                <SkipForward className="h-6 w-6" />
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                <div className="space-y-4">
                    <div className="flex justify-between text-sm font-medium">
                        <span className="text-muted-foreground">Progression de la routine</span>
                        <span>{Math.round(overallProgress)}%</span>
                    </div>
                    <Progress value={overallProgress} className="h-3 grow" />
                    <div className="flex justify-between items-center px-2">
                        <div className="flex flex-col gap-1 items-center">
                            <div className="w-1 h-1 rounded-full bg-primary" />
                            <span className="text-[10px] text-muted-foreground">DÉBUT</span>
                        </div>
                        <div className="flex gap-1">
                            {activeRoutine?.habitIds.map((id, i) => (
                                <div
                                    key={id}
                                    className={cn(
                                        "w-2 h-2 rounded-full transition-all",
                                        i < currentIndex ? "bg-primary" : i === currentIndex ? "bg-primary animate-pulse scale-150" : "bg-muted"
                                    )}
                                />
                            ))}
                        </div>
                        <div className="flex flex-col gap-1 items-center">
                            <div className="w-1 h-1 rounded-full bg-muted" />
                            <span className="text-[10px] text-muted-foreground">FIN</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
