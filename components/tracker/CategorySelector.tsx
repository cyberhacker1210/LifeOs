'use client';

import { useTrackerStore } from '@/stores/useTrackerStore';
import { DEFAULT_GROUPS } from '@/types/task';
import { cn } from '@/lib/utils';
import { Check } from 'lucide-react';

export function CategorySelector() {
    const { activeSession, setCategory } = useTrackerStore();

    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {DEFAULT_GROUPS.map((group) => {
                const isSelected = activeSession.group === group.name;
                return (
                    <button
                        key={group.id}
                        onClick={() => setCategory(group.name)}
                        className={cn(
                            "relative flex items-center justify-center p-4 rounded-lg border-2 transition-all hover:bg-muted/50",
                            isSelected
                                ? "border-primary bg-primary/5 ring-2 ring-primary/20"
                                : "border-transparent bg-card hover:border-border"
                        )}
                    >
                        <span className={cn(
                            "font-medium",
                            isSelected ? "text-primary" : "text-muted-foreground"
                        )}>
                            {group.name}
                        </span>
                        {isSelected && (
                            <div className="absolute top-2 right-2">
                                <Check className="h-3 w-3 text-primary" />
                            </div>
                        )}
                    </button>
                );
            })}
        </div>
    );
}
