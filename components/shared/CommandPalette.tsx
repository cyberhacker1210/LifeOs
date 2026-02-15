'use client';

import * as React from "react"
import {
    Calendar,
    Settings,
    PlusCircle,
    LogOut,
    LayoutDashboard,
    CheckSquare,
    Timer as Clock,
    BarChart2
} from "lucide-react"

import {
    CommandDialog,
    CommandEmpty,
    CommandGroup,
    CommandInput,
    CommandItem,
    CommandList,
    CommandSeparator,
    CommandShortcut,
} from "@/components/ui/command"
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/useAuthStore";
import { useTrackerStore } from "@/stores/useTrackerStore";
import { signOut } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { toast } from "sonner";

export function CommandPalette() {
    const [open, setOpen] = React.useState(false)
    const router = useRouter();
    const { user } = useAuthStore();
    const { activeSession, startTimer, pauseTimer, stopTimer } = useTrackerStore();

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    const toggleTimer = React.useCallback(async () => {
        if (!user) return;
        if (activeSession.isRunning) {
            pauseTimer();
            toast.info("Timer en pause");
        } else {
            startTimer();
            toast.success("Timer démarré");
        }
    }, [activeSession.isRunning, startTimer, pauseTimer, user]);

    React.useEffect(() => {
        const down = (e: KeyboardEvent) => {
            // Palette toggle (Cmd+K)
            if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                setOpen((open) => !open)
            }

            // New Task (Cmd+N)
            if (e.key === "n" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                router.push('/tasks')
            }

            // Toggle Timer (Cmd+Space)
            if (e.code === "Space" && (e.metaKey || e.ctrlKey)) {
                e.preventDefault()
                toggleTimer()
            }

            // Navigation shortcuts (Cmd+1-5)
            if (e.metaKey || e.ctrlKey) {
                switch (e.key) {
                    case "1": e.preventDefault(); router.push('/'); break;
                    case "2": e.preventDefault(); router.push('/tasks'); break;
                    case "3": e.preventDefault(); router.push('/tracker'); break;
                    case "4": e.preventDefault(); router.push('/planner'); break;
                    case "5": e.preventDefault(); router.push('/stats'); break;
                }
            }
        }

        document.addEventListener("keydown", down)
        return () => document.removeEventListener("keydown", down)
    }, [router, toggleTimer])

    const runCommand = React.useCallback((command: () => unknown) => {
        setOpen(false)
        command()
    }, [])

    return (
        <CommandDialog open={open} onOpenChange={setOpen}>
            <CommandInput placeholder="Tapez une commande ou recherchez..." />
            <CommandList>
                <CommandEmpty>Aucun résultat trouvé.</CommandEmpty>
                <CommandGroup heading="Actions">
                    <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
                        <PlusCircle className="mr-2 h-4 w-4" />
                        <span>Nouvelle tâche</span>
                        <CommandShortcut>⌘N</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(toggleTimer)}>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>{activeSession.isRunning ? 'Mettre en pause' : 'Démarrer Timer'}</span>
                        <CommandShortcut>⌘Space</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandGroup heading="Navigation">
                    <CommandItem onSelect={() => runCommand(() => router.push('/'))}>
                        <LayoutDashboard className="mr-2 h-4 w-4" />
                        <span>Dashboard</span>
                        <CommandShortcut>⌘1</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/tasks'))}>
                        <CheckSquare className="mr-2 h-4 w-4" />
                        <span>Tâches</span>
                        <CommandShortcut>⌘2</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/tracker'))}>
                        <Clock className="mr-2 h-4 w-4" />
                        <span>Tracker</span>
                        <CommandShortcut>⌘3</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/planner'))}>
                        <Calendar className="mr-2 h-4 w-4" />
                        <span>Planning</span>
                        <CommandShortcut>⌘4</CommandShortcut>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(() => router.push('/stats'))}>
                        <BarChart2 className="mr-2 h-4 w-4" />
                        <span>Statistiques</span>
                        <CommandShortcut>⌘5</CommandShortcut>
                    </CommandItem>
                </CommandGroup>
                <CommandSeparator />
                <CommandGroup heading="Compte">
                    <CommandItem onSelect={() => runCommand(() => router.push('/settings'))}>
                        <Settings className="mr-2 h-4 w-4" />
                        <span>Paramètres</span>
                    </CommandItem>
                    <CommandItem onSelect={() => runCommand(handleLogout)}>
                        <LogOut className="mr-2 h-4 w-4" />
                        <span>Se déconnecter</span>
                    </CommandItem>
                </CommandGroup>
            </CommandList>
        </CommandDialog>
    )
}
