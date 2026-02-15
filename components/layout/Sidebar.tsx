'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import {
    LayoutDashboard,
    CheckSquare,
    Timer,
    BarChart3,
    CalendarDays,
    Settings,
    LogOut
} from 'lucide-react';
import { useAuthStore } from '@/stores/useAuthStore';

const routes = [
    {
        label: 'Dashboard',
        icon: LayoutDashboard,
        href: '/',
        color: "text-sky-500",
    },
    {
        label: 'Tâches',
        icon: CheckSquare,
        href: '/tasks',
        color: "text-violet-500",
    },
    {
        label: 'Tracker',
        icon: Timer,
        href: '/tracker',
        color: "text-pink-700",
    },
    {
        label: 'Stats',
        icon: BarChart3,
        href: '/stats',
        color: "text-orange-700",
    },
    {
        label: 'Planner',
        icon: CalendarDays,
        href: '/planner',
        color: "text-emerald-500",
    },
    {
        label: 'Paramètres',
        icon: Settings,
        href: '/settings',
        color: "text-zinc-400",
    },
];

export function Sidebar({ className }: { className?: string }) {
    const pathname = usePathname();
    const { logout } = useAuthStore();

    return (
        <div className={cn("space-y-4 py-4 flex flex-col h-full bg-sidebar border-r border-border/50 text-white", className)}>
            <div className="px-3 py-2 flex-1">
                <Link href="/" className="flex items-center pl-3 mb-14">
                    <div className="relative w-8 h-8 mr-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-lg opacity-75 blur-sm animate-pulse" />
                        <div className="relative bg-black w-full h-full rounded-lg flex items-center justify-center border border-white/10">
                            <span className="font-bold text-xl bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400">L</span>
                        </div>
                    </div>
                    <h1 className="text-2xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
                        LifeOS
                    </h1>
                </Link>
                <div className="space-y-1">
                    {routes.map((route) => {
                        const isActive = pathname === route.href;
                        return (
                            <Link
                                key={route.href}
                                href={route.href}
                                className={cn(
                                    "relative text-sm group flex p-3 w-full justify-start font-medium cursor-pointer transition-colors z-10",
                                    isActive ? "text-white" : "text-zinc-400 hover:text-white"
                                )}
                            >
                                {isActive && (
                                    <motion.div
                                        layoutId="sidebar-active"
                                        className="absolute inset-0 bg-white/10 rounded-lg -z-10"
                                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                    />
                                )}
                                <div className="flex items-center flex-1">
                                    <route.icon className={cn("h-5 w-5 mr-3 transition-colors", route.color, isActive ? "text-white" : "")} />
                                    {route.label}
                                </div>
                            </Link>
                        );
                    })}
                </div>
            </div>
            <div className="px-3 py-2">
                <div onClick={() => logout()} className="text-sm group flex p-3 w-full justify-start font-medium cursor-pointer hover:text-white hover:bg-white/10 rounded-lg transition text-zinc-400">
                    <div className="flex items-center flex-1">
                        <LogOut className="h-5 w-5 mr-3 text-red-500" />
                        Déconnexion
                    </div>
                </div>
            </div>
        </div>
    );
}
