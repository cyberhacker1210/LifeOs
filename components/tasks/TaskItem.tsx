'use client';

import { Task, SubTask } from '@/types/task';
import { useTaskStore } from '@/stores/useTaskStore';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Trash2, MoreVertical, Calendar, Clock, ChevronDown, ListTodo, Plus, X } from 'lucide-react';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';
import { useState } from 'react';
import useSound from 'use-sound';
import { motion, AnimatePresence } from 'framer-motion';

interface TaskItemProps {
    task: Task;
}

export function TaskItem({ task }: TaskItemProps) {
    const {
        toggleTaskStatus,
        deleteTask,
        addTask,
        updateTask,
        updateTaskDate,
        addSubTask,
        updateSubTask,
        deleteSubTask
    } = useTaskStore();
    const [playOn] = useSound('/sounds/pop.mp3', { volume: 0.5 });
    const [playOff] = useSound('/sounds/pop.mp3', { volume: 0.25, playbackRate: 0.8 });

    const [isExpanded, setIsExpanded] = useState(false);
    const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

    const handleToggle = () => {
        if (task.status !== 'done') {
            playOn();
        } else {
            playOff();
        }
        toggleTaskStatus(task.id, task.status);
    };

    const handleDelete = () => {
        deleteTask(task.id);
    };

    const handleAddSubTask = (e: React.FormEvent) => {
        e.preventDefault();
        if (!newSubTaskTitle.trim()) return;
        addSubTask(task.id, newSubTaskTitle.trim());
        setNewSubTaskTitle('');
    };

    const isDone = task.status === 'done';
    const hasSubTasks = task.subTasks && task.subTasks.length > 0;
    const completedSubTasks = task.subTasks?.filter(st => st.completed).length || 0;
    const subTaskProgress = hasSubTasks ? (completedSubTasks / task.subTasks.length) * 100 : 0;

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className={cn(
                "group flex flex-col rounded-xl border bg-card/60 backdrop-blur-sm transition-all hover:bg-card/80 hover:shadow-md hover:border-primary/20",
                isDone && "bg-muted/30 border-transparent opacity-70"
            )}
        >
            <div className="flex items-center justify-between p-4">
                <div className="flex items-start gap-3 overflow-hidden">
                    <motion.div whileTap={{ scale: 0.9 }}>
                        <Checkbox
                            checked={isDone}
                            onCheckedChange={handleToggle}
                            className="mt-1 transition-all data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground border-primary/50"
                        />
                    </motion.div>

                    <div className="flex flex-col gap-1 min-w-0">
                        <span className="relative font-medium truncate transition-all">
                            {task.title}
                            {isDone && (
                                <motion.div
                                    initial={{ width: 0 }}
                                    animate={{ width: "100%" }}
                                    className="absolute top-1/2 left-0 h-[2px] bg-muted-foreground/50 -translate-y-1/2"
                                />
                            )}
                        </span>
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <span className={cn(
                                "px-2 py-0.5 rounded-full font-medium text-[10px] uppercase tracking-wider border",
                                task.group === 'Scolaire' && "text-indigo-400 bg-indigo-500/10 border-indigo-500/20",
                                task.group === 'Sport' && "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
                                task.group === 'Perso' && "text-amber-400 bg-amber-500/10 border-amber-500/20",
                                task.group === 'Projets' && "text-pink-400 bg-pink-500/10 border-pink-500/20",
                            )}>
                                {task.group} {task.subGroup && `> ${task.subGroup}`}
                            </span>

                            {task.date && (
                                <span className="flex items-center gap-1">
                                    <Calendar className="h-3 w-3" />
                                    {format(new Date(task.date), 'dd MMM', { locale: fr })}
                                </span>
                            )}
                            {task.duration && (
                                <span className="flex items-center gap-1">
                                    <Clock className="h-3 w-3" />
                                    {task.duration}m
                                </span>
                            )}
                            {hasSubTasks && (
                                <span className="flex items-center gap-1 text-primary">
                                    <ListTodo className="h-3 w-3" />
                                    {completedSubTasks}/{task.subTasks.length}
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    {task.priority !== 'normal' && (
                        <motion.span
                            animate={task.priority === 'urgent' ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className={cn(
                                "text-[10px] font-bold px-2 py-0.5 rounded-full border uppercase tracking-tighter",
                                task.priority === 'urgent' && "text-red-400 border-red-500/30 bg-red-500/10",
                                task.priority === 'high' && "text-orange-400 border-orange-500/30 bg-orange-500/10",
                                task.priority === 'low' && "text-blue-400 border-blue-500/30 bg-blue-500/10",
                            )}
                        >
                            {task.priority === 'urgent' ? 'Urgent' : task.priority === 'high' ? 'Haut' : 'Bas'}
                        </motion.span>
                    )}

                    <Button
                        variant="ghost"
                        size="icon"
                        className={cn("h-8 w-8 hover:bg-white/10 transition-transform", isExpanded && "rotate-180")}
                        onClick={() => setIsExpanded(!isExpanded)}
                    >
                        <ChevronDown className="h-4 w-4" />
                    </Button>

                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/10">
                                <MoreVertical className="h-4 w-4" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48 bg-popover/90 backdrop-blur-md border-border">
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Priorité</div>
                            <DropdownMenuItem onClick={() => updateTask(task.id, { priority: 'urgent' })}>Urgent</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTask(task.id, { priority: 'high' })}>Haute</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTask(task.id, { priority: 'normal' })}>Normale</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTask(task.id, { priority: 'low' })}>Basse</DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <div className="px-2 py-1.5 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Échéance</div>
                            <DropdownMenuItem onClick={() => updateTaskDate(task.id, new Date().toISOString().split('T')[0])}>Aujourd'hui</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTaskDate(task.id, new Date(Date.now() + 86400000).toISOString().split('T')[0])}>Demain</DropdownMenuItem>
                            <DropdownMenuItem onClick={() => updateTaskDate(task.id, '')}>Pas de date</DropdownMenuItem>

                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-400 focus:text-red-400 cursor-pointer focus:bg-red-500/10" onClick={handleDelete}>
                                <Trash2 className="mr-2 h-4 w-4" />
                                Supprimer
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </div>

            {/* Subtasks Progress Bar */}
            {hasSubTasks && (
                <div className="w-full h-1 bg-white/5 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${subTaskProgress}%` }}
                        className="h-full bg-primary/50"
                    />
                </div>
            )}

            {/* Subtasks Expansion */}
            <AnimatePresence>
                {isExpanded && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden border-t border-white/5 bg-white/5"
                    >
                        <div className="p-4 space-y-3">
                            {task.subTasks?.map((st) => (
                                <div key={st.id} className="flex items-center justify-between pl-7 group/st">
                                    <div className="flex items-center gap-3">
                                        <Checkbox
                                            checked={st.completed}
                                            onCheckedChange={(checked) => updateSubTask(task.id, st.id, !!checked)}
                                            className="h-3.5 w-3.5"
                                        />
                                        <span className={cn(
                                            "text-sm",
                                            st.completed && "text-muted-foreground line-through"
                                        )}>
                                            {st.title}
                                        </span>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-6 w-6 opacity-0 group-hover/st:opacity-100 transition-opacity"
                                        onClick={() => deleteSubTask(task.id, st.id)}
                                    >
                                        <X className="h-3 w-3" />
                                    </Button>
                                </div>
                            ))}

                            <form onSubmit={handleAddSubTask} className="flex items-center gap-2 pl-7">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                                <Input
                                    placeholder="Ajouter une sous-tâche..."
                                    value={newSubTaskTitle}
                                    onChange={(e) => setNewSubTaskTitle(e.target.value)}
                                    className="h-8 bg-transparent border-none focus-visible:ring-0 px-0 text-sm"
                                />
                                {newSubTaskTitle && (
                                    <Button type="submit" size="sm" variant="ghost" className="h-7 px-2">
                                        Ajouter
                                    </Button>
                                )}
                            </form>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
}
