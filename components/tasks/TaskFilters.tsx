'use client';

import { useState, useEffect } from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
    Search,
    Filter,
    X,
    Calendar as CalendarIcon,
    Flag,
    Tag,
    ChevronDown
} from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
    DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import { DEFAULT_GROUPS } from '@/types/task';
import { cn } from '@/lib/utils';

interface TaskFiltersProps {
    onSearchChange: (search: string) => void;
    onGroupChange: (groups: string[]) => void;
    onPriorityChange: (priorities: string[]) => void;
    onDateChange: (dateFilter: string | null) => void;
}

export function TaskFilters({
    onSearchChange,
    onGroupChange,
    onPriorityChange,
    onDateChange
}: TaskFiltersProps) {
    const [search, setSearch] = useState('');
    const [selectedGroups, setSelectedGroups] = useState<string[]>([]);
    const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
    const [dateFilter, setDateFilter] = useState<string | null>(null);

    useEffect(() => {
        onSearchChange(search);
    }, [search, onSearchChange]);

    useEffect(() => {
        onGroupChange(selectedGroups);
    }, [selectedGroups, onGroupChange]);

    useEffect(() => {
        onPriorityChange(selectedPriorities);
    }, [selectedPriorities, onPriorityChange]);

    useEffect(() => {
        onDateChange(dateFilter);
    }, [dateFilter, onDateChange]);

    const toggleGroup = (group: string) => {
        setSelectedGroups(prev =>
            prev.includes(group) ? prev.filter(g => g !== group) : [...prev, group]
        );
    };

    const togglePriority = (priority: string) => {
        setSelectedPriorities(prev =>
            prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
        );
    };

    const clearFilters = () => {
        setSearch('');
        setSelectedGroups([]);
        setSelectedPriorities([]);
        setDateFilter(null);
    };

    const hasActiveFilters = search || selectedGroups.length > 0 || selectedPriorities.length > 0 || dateFilter;

    return (
        <div className="flex flex-col gap-4 mb-6">
            <div className="flex items-center gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Rechercher une tâche..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        className="pl-9 bg-background/50 border-white/10"
                    />
                    {search && (
                        <button
                            onClick={() => setSearch('')}
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white"
                        >
                            <X className="h-4 w-4" />
                        </button>
                    )}
                </div>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-white/10 bg-background/50">
                            <Tag className="mr-2 h-4 w-4" />
                            Filtrer : Groupes
                            {selectedGroups.length > 0 && (
                                <span className="ml-2 px-1.5 py-0.5 rounded-full bg-primary text-[10px] font-bold">
                                    {selectedGroups.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover/90 backdrop-blur-md border-border">
                        <DropdownMenuLabel>Filtrer par groupe</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {DEFAULT_GROUPS.map(group => (
                            <DropdownMenuCheckboxItem
                                key={group.name}
                                checked={selectedGroups.includes(group.name)}
                                onCheckedChange={() => toggleGroup(group.name)}
                                className="cursor-pointer"
                            >
                                {group.name}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-white/10 bg-background/50">
                            <Flag className="mr-2 h-4 w-4" />
                            Filtrer : Priorité
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover/90 backdrop-blur-md border-border">
                        <DropdownMenuLabel>Filtrer par priorité</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        {['low', 'normal', 'high', 'urgent'].map(p => (
                            <DropdownMenuCheckboxItem
                                key={p}
                                checked={selectedPriorities.includes(p)}
                                onCheckedChange={() => togglePriority(p)}
                                className="cursor-pointer capitalize"
                            >
                                {p === 'low' ? 'Basse' : p === 'high' ? 'Haute' : p === 'urgent' ? 'Urgent' : 'Normale'}
                            </DropdownMenuCheckboxItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="outline" className="border-white/10 bg-background/50">
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            Filtrer : Date
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-popover/90 backdrop-blur-md border-border">
                        <DropdownMenuLabel>Échéance</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => setDateFilter(null)} className="cursor-pointer">Toutes</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDateFilter('today')} className="cursor-pointer">Aujourd'hui</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDateFilter('upcoming')} className="cursor-pointer">À venir</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => setDateFilter('overdue')} className="cursor-pointer text-red-400">En retard</DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {hasActiveFilters && (
                    <Button variant="ghost" size="icon" onClick={clearFilters} title="Réinitialiser">
                        <X className="h-4 w-4" />
                    </Button>
                )}
            </div>
        </div>
    );
}
