'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { useTaskStore } from '@/stores/useTaskStore';
import { useHabitStore } from '@/stores/useHabitStore';
import { OverviewCards } from '@/components/stats/OverviewCards';
import { EnergyCurveChart } from '@/components/stats/EnergyCurveChart';
import { InsightsSection } from '@/components/ai/InsightsSection';
import { DashboardActionCenter } from '@/components/dashboard/DashboardActionCenter';
import { MaJourneeList } from '@/components/dashboard/MaJourneeList';
import { DailyHabitList } from '@/components/habits/DailyHabitList';
import { motion } from 'framer-motion';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

export default function DashboardPage() {
    const { profile } = useAuthStore();
    const { tasks } = useTaskStore();
    const { habits, completions } = useHabitStore();
    const firstName = profile?.firstName || 'Utilisateur';
    const today = new Date();
    const dateStr = format(today, 'yyyy-MM-dd');

    // Calculate daily progress percentage
    const todayTasks = tasks.filter(t => t.date === dateStr);
    const completedTasks = todayTasks.filter(t => t.status === 'done').length;

    const dailyHabits = habits.filter(h => h.frequency === 'daily');
    const completedHabits = dailyHabits.filter(h => completions.some(c => c.habitId === h.id && c.date === dateStr)).length;

    const totalItems = todayTasks.length + dailyHabits.length;
    const completedItems = completedTasks + completedHabits;
    const globalProgress = totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

    return (
        <div className="space-y-8 pb-20">
            <header className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                    <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                    >
                        <h2 className="text-4xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/60">
                            Bonjour, {firstName} 👋
                        </h2>
                        <p className="text-muted-foreground text-lg mt-1 font-medium italic">
                            {globalProgress === 100
                                ? "Journée parfaite accomplie ! Incroyable. 🔥"
                                : "Prêt à conquérir ta journée ?"}
                        </p>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="flex items-center gap-4 bg-white/5 border border-white/5 px-6 py-3 rounded-2xl"
                >
                    <div className="text-right">
                        <p className="text-[10px] uppercase tracking-widest font-black text-muted-foreground">Progrès Global</p>
                        <p className="text-xl font-black text-primary">{Math.round(globalProgress)}%</p>
                    </div>
                    <div className="relative w-12 h-12">
                        <svg className="w-full h-full transform -rotate-90">
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="4"
                                className="text-white/5"
                            />
                            <circle
                                cx="24"
                                cy="24"
                                r="20"
                                fill="transparent"
                                stroke="currentColor"
                                strokeWidth="4"
                                strokeDasharray={125.6}
                                strokeDashoffset={125.6 - (125.6 * globalProgress) / 100}
                                className="text-primary transition-all duration-1000 ease-out"
                                strokeLinecap="round"
                            />
                        </svg>
                    </div>
                </motion.div>
            </header>

            <DashboardActionCenter />

            <div className="grid gap-8 lg:grid-cols-7">
                <div className="lg:col-span-4 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <MaJourneeList />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <div className="glass-card border-white/5 p-6 rounded-2xl">
                            <DailyHabitList date={today} />
                        </div>
                    </motion.div>
                </div>

                <div className="lg:col-span-3 space-y-8">
                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 }}
                    >
                        <OverviewCards />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.2 }}
                    >
                        <EnergyCurveChart />
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 }}
                    >
                        <InsightsSection />
                    </motion.div>
                </div>
            </div>
        </div>
    );
}
