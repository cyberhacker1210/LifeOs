'use client';

import { useEffect, useState, useRef } from 'react';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, AlertCircle, MessageSquare, Shield, Info, Sparkles } from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export function TimerDisplay() {
    const { activeSession, startTimer, pauseTimer, stopTimer, setType, setNotes } = useTrackerStore();
    const { user } = useAuthStore();
    const [displayTime, setDisplayTime] = useState(0);
    const requestRef = useRef<number | null>(null);

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const updateTime = () => {
        if (activeSession.isRunning && activeSession.startTime) {
            const now = Date.now();
            const currentElapsed = Math.floor((now - activeSession.startTime) / 1000);
            setDisplayTime((activeSession.elapsed || 0) + currentElapsed);
            requestRef.current = requestAnimationFrame(updateTime);
        } else {
            setDisplayTime(activeSession.elapsed || 0);
        }
    };

    useEffect(() => {
        requestRef.current = requestAnimationFrame(updateTime);
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [activeSession.isRunning, activeSession.startTime, activeSession.elapsed]);

    useEffect(() => {
        updateTime();
    }, []);

    const handleStart = () => {
        startTimer();
    };

    const handlePause = () => {
        pauseTimer();
    };

    const handleStop = async () => {
        if (!user) return;

        if (displayTime > 60 && !confirm("Arrêter et enregistrer la session ?")) {
            return;
        }

        const audio = new Audio('/sounds/pop.mp3');
        audio.volume = 0.5;
        audio.play().catch(() => { });

        await stopTimer(user.uid);
    };

    return (
        <div className="flex flex-col gap-6">
            <div className="flex flex-col items-center justify-center p-8 bg-card/50 backdrop-blur-sm rounded-2xl border border-white/10 shadow-xl relative overflow-hidden group">
                <div className={cn(
                    "absolute inset-0 bg-gradient-to-br opacity-5 transition-opacity duration-1000",
                    activeSession.type === 'productive' ? "from-primary to-transparent" :
                        activeSession.type === 'distraction' ? "from-red-500 to-transparent" :
                            "from-gray-500 to-transparent",
                    activeSession.isRunning ? "opacity-10" : "opacity-0"
                )} />

                <div className={cn(
                    "text-6xl font-mono font-bold tracking-wider mb-8 transition-colors",
                    activeSession.isRunning ? "text-primary" : "text-muted-foreground"
                )}>
                    {formatTime(displayTime)}
                </div>

                <div className="flex items-center gap-4 relative z-10">
                    {!activeSession.isRunning ? (
                        <Button size="lg" className="h-16 w-16 rounded-full shadow-lg hover:scale-105 transition-transform" onClick={handleStart}>
                            <Play className="h-8 w-8 ml-1" />
                        </Button>
                    ) : (
                        <Button size="lg" variant="outline" className="h-16 w-16 rounded-full bg-background/50 backdrop-blur-md" onClick={handlePause}>
                            <Pause className="h-8 w-8" />
                        </Button>
                    )}

                    <Button
                        size="lg"
                        variant="destructive"
                        className="h-16 w-16 rounded-full shadow-lg hover:scale-105 transition-transform"
                        onClick={handleStop}
                        disabled={displayTime === 0}
                    >
                        <Square className="h-6 w-6 fill-current" />
                    </Button>
                </div>

                <div className="mt-8 flex items-center gap-3 text-xs text-muted-foreground bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
                    <span className={cn(
                        "w-2 h-2 rounded-full",
                        activeSession.isRunning ? "bg-green-400 shadow-[0_0_8px_rgba(74,222,128,0.5)] animate-pulse" : "bg-gray-500"
                    )} />
                    {activeSession.isRunning ? "Session en cours" : "En pause"}
                    {activeSession.taskTitle && (
                        <>
                            <span className="h-3 w-[1px] bg-white/10 mx-1" />
                            <span className="truncate max-w-[150px]">{activeSession.taskTitle}</span>
                        </>
                    )}
                </div>
            </div>

            <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/10 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Type de session</h3>
                    </div>

                    <RadioGroup
                        value={activeSession.type}
                        onValueChange={(val) => setType(val as any)}
                        className="grid grid-cols-1 gap-2"
                    >
                        <div className="flex items-center space-x-2 rounded-lg border border-white/5 p-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <RadioGroupItem value="productive" id="productive" />
                            <Label htmlFor="productive" className="flex-1 cursor-pointer flex items-center justify-between">
                                <span className="font-medium">Productif</span>
                                <Shield className="h-4 w-4 text-green-400 opacity-50" />
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border border-white/5 p-3 hover:bg-white/5 transition-colors cursor-pointer">
                            <RadioGroupItem value="neutral" id="neutral" />
                            <Label htmlFor="neutral" className="flex-1 cursor-pointer flex items-center justify-between">
                                <span className="font-medium">Neutre</span>
                                <Info className="h-4 w-4 text-blue-400 opacity-50" />
                            </Label>
                        </div>
                        <div className="flex items-center space-x-2 rounded-lg border border-white/5 p-3 hover:bg-white/5 transition-colors cursor-pointer text-red-400">
                            <RadioGroupItem value="distraction" id="distraction" />
                            <Label htmlFor="distraction" className="flex-1 cursor-pointer flex items-center justify-between">
                                <span className="font-medium">Distraction</span>
                                <AlertCircle className="h-4 w-4 opacity-50" />
                            </Label>
                        </div>
                    </RadioGroup>
                </div>

                <div className="bg-card/50 backdrop-blur-sm rounded-xl border border-white/10 p-5 space-y-4">
                    <div className="flex items-center gap-2 mb-2">
                        <MessageSquare className="h-4 w-4 text-primary" />
                        <h3 className="text-sm font-medium">Notes de session</h3>
                    </div>

                    <Textarea
                        placeholder="Qu'avez-vous accompli ? (ou pourquoi cette distraction...)"
                        value={activeSession.notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="bg-black/20 border-white/10 min-h-[120px] focus-visible:ring-primary/20 resize-none"
                    />
                </div>
            </div>
        </div>
    );
}
