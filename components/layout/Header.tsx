'use client';

import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/components/ui/button';
import { LogOut } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { signOut } from 'firebase/auth';
import { useRouter, usePathname } from 'next/navigation';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { MobileSidebar } from './MobileSidebar';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

const pageTitles: Record<string, string> = {
    '/': 'Tableau de bord',
    '/tasks': 'Tâches',
    '/tracker': 'Tracker',
    '/stats': 'Statistiques',
    '/planner': 'Planner',
};

export function Header() {
    const { user } = useAuthStore();
    const router = useRouter();
    const pathname = usePathname();

    const pageTitle = pageTitles[pathname] || 'LifeOS';

    const handleLogout = async () => {
        await signOut(auth);
        router.push('/login');
    };

    return (
        <header className="flex h-16 items-center justify-between border-b bg-background px-6">
            <div className="flex items-center">
                <MobileSidebar />
                <h2 className="text-lg font-semibold md:hidden">LifeOS</h2>
                <h2 className="text-lg font-semibold hidden md:block">{pageTitle}</h2>
            </div>
            <div className="flex items-center gap-4">
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                            <Avatar className="h-8 w-8">
                                <AvatarImage src={user?.photoURL || ''} alt={user?.displayName || ''} />
                                <AvatarFallback>{user?.displayName?.[0] || 'U'}</AvatarFallback>
                            </Avatar>
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end" forceMount>
                        <DropdownMenuLabel className="font-normal">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-medium leading-none">{user?.displayName || 'Utilisateur'}</p>
                                <p className="text-xs leading-none text-muted-foreground">
                                    {user?.email}
                                </p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={handleLogout}>
                            <LogOut className="mr-2 h-4 w-4" />
                            <span>Se déconnecter</span>
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
