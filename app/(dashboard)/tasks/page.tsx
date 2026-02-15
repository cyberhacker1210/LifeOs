'use client';

import { SmartTaskInput } from '@/components/tasks/SmartTaskInput';
import { TaskList } from '@/components/tasks/TaskList';
import { TaskFilters } from '@/components/tasks/TaskFilters';
import { useState } from 'react';

export default function TasksPage() {
    const [search, setSearch] = useState('');
    const [groups, setGroups] = useState<string[]>([]);
    const [priorities, setPriorities] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<string | null>(null);

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Mes Tâches</h2>
                <p className="text-muted-foreground">
                    Organisez votre journée. Tapez naturellement pour ajouter une tâche.
                </p>
            </div>

            <div className="sticky top-0 z-10 bg-background/80 backdrop-blur-md pb-4 pt-2 space-y-4">
                <SmartTaskInput />
                <TaskFilters
                    onSearchChange={setSearch}
                    onGroupChange={setGroups}
                    onPriorityChange={setPriorities}
                    onDateChange={setDateFilter}
                />
            </div>

            <TaskList
                search={search}
                groups={groups}
                priorities={priorities}
                dateFilter={dateFilter}
            />
        </div>
    );
}
