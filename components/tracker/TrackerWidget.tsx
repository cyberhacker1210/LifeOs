'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { Play, Pause, Square, Timer } from 'lucide-react';
import { useEffect, useState, useRef } from 'react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export function TrackerWidget() {
    const pathname = usePathname();
    const router = useRouter();
    const { activeSession, pauseTimer, startTimer, stopTimer } = useTrackerStore();
    const { user } = useAuthStore();
    const [displayTime, setDisplayTime] = useState(0);
    const requestRef = useRef<number | null>(null);

    const isActive = activeSession.isRunning || activeSession.elapsed > 0;
    const isTrackerPage = pathname === '/tracker';

    const updateTime = () => {
        if (activeSession.isRunning && activeSession.startTime) {
            const now = Date.now();
            const currentElapsed = Math.floor((now - activeSession.startTime) / 1000);
            setDisplayTime(activeSession.elapsed + currentElapsed);
            requestRef.current = requestAnimationFrame(updateTime);
        } else {
            setDisplayTime(activeSession.elapsed);
        }
    };

    useEffect(() => {
        if (isActive) {
            requestRef.current = requestAnimationFrame(updateTime);
        }
        return () => {
            if (requestRef.current) cancelAnimationFrame(requestRef.current);
        };
    }, [activeSession.isRunning, activeSession.startTime, activeSession.elapsed, isActive]);

    // Don't show if on tracker page or no active session
    if (isTrackerPage || !isActive) return null;

    const formatTime = (seconds: number) => {
        const h = Math.floor(seconds / 3600);
        const m = Math.floor((seconds % 3600) / 60);
        const s = seconds % 60;
        return `${h}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const handleStop = async (e: React.MouseEvent) => {
        e.stopPropagation();
        if (!user) return;
        if (displayTime > 60 && !confirm("Arrêter et enregistrer la session ?")) return;
        await stopTimer(user.uid);
    };

    const toggleTimer = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (activeSession.isRunning) {
            pauseTimer();
        } else {
            startTimer();
        }
    };

    return (
        <div
            onClick={() => router.push('/tracker')}
            className={cn(
                "fixed bottom-6 right-6 z-50 flex items-center gap-3 p-3 rounded-full shadow-lg border cursor-pointer transition-all hover:scale-105 active:scale-95 animate-in slide-in-from-bottom-4",
                activeSession.isRunning ? "bg-primary text-primary-foreground" : "bg-card text-foreground"
            )}
        >
            <div className="flex items-center gap-2 px-2 font-mono font-bold text-lg">
                <Timer className={cn("h-4 w-4", activeSession.isRunning && "animate-pulse")} />
                {formatTime(displayTime)}
            </div>

            <div className="flex items-center gap-1 border-l pl-2 border-primary-foreground/20">
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-white/20"
                    onClick={toggleTimer}
                >
                    {activeSession.isRunning ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 ml-0.5" />}
                </Button>
                <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8 rounded-full hover:bg-white/20 hover:text-red-300"
                    onClick={handleStop}
                >
                    <Square className="h-3 w-3 fill-current" />
                </Button>
            </div>
        </div>
    );
}
