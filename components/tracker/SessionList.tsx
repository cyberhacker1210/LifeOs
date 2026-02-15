'use client';

import { useEffect } from 'react';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { Clock, Hash } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Loader2 } from 'lucide-react';

export function SessionList() {
    const { sessions, loading } = useTrackerStore();
    const { user } = useAuthStore();

    // Data subscription handled by DataLoader in layout

    if (loading && sessions.length === 0) {
        return (
            <div className="flex justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
        );
    }

    if (sessions.length === 0) {
        return (
            <div className="text-center py-12 text-muted-foreground border-2 border-dashed rounded-lg bg-muted/20">
                <p>Aucune session enregistrée aujourd'hui.</p>
                <p className="text-sm">Lancez le timer pour commencer ! 🚀</p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold">Historique</h3>
            <div className="space-y-3">
                {sessions.map((session) => (
                    <div
                        key={session.id}
                        className="flex items-center justify-between p-4 rounded-lg bg-card border hover:shadow-sm transition-shadow"
                    >
                        <div className="flex flex-col gap-1">
                            <div className="flex items-center gap-2">
                                <span className={cn(
                                    "px-2 py-0.5 rounded text-xs font-medium uppercase tracking-wider",
                                    session.group === 'Scolaire' && "bg-indigo-100 text-indigo-700",
                                    session.group === 'Sport' && "bg-emerald-100 text-emerald-700",
                                    session.group === 'Perso' && "bg-amber-100 text-amber-700",
                                    session.group === 'Projets' && "bg-pink-100 text-pink-700",
                                )}>
                                    {session.group}
                                </span>
                                {session.taskTitle && (
                                    <span className="text-sm font-medium text-foreground truncate max-w-[200px]">
                                        {session.taskTitle}
                                    </span>
                                )}
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                                <Clock className="h-3 w-3" />
                                {format(session.startTime, 'HH:mm')} - {format(session.endTime, 'HH:mm')}
                            </div>
                        </div>

                        <div className="font-mono text-lg font-medium">
                            {Math.floor(session.duration / 60)} <span className="text-xs text-muted-foreground">min</span>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
