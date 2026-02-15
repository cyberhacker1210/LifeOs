'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/useAuthStore';
import { Sidebar } from '@/components/layout/Sidebar';
import { Header } from '@/components/layout/Header';
import { CommandPalette } from '@/components/shared/CommandPalette';
import { TrackerWidget } from '@/components/tracker/TrackerWidget';
import { Loader2 } from 'lucide-react';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, profile, loading, profileLoading } = useAuthStore();
    const router = useRouter();

    useEffect(() => {
        if (!loading && !user) {
            router.push('/login');
        } else if (!loading && !profileLoading && user && !profile?.onboardingCompleted) {
            router.push('/onboarding');
        }
    }, [user, profile, loading, profileLoading, router]);

    if (loading || (user && profileLoading)) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
        );
    }

    if (!user || !profile?.onboardingCompleted) {
        return null;
    }

    return (
        <div className="flex h-screen overflow-hidden bg-background">
            {/* Desktop Sidebar */}
            <div className="hidden md:flex md:w-56 md:flex-shrink-0 border-r">
                <Sidebar className="w-full" />
            </div>

            <div className="flex flex-1 flex-col min-w-0 overflow-y-auto">
                <Header />
                <CommandPalette />
                <main className="flex-1 w-full p-6">{children}</main>
                <TrackerWidget />
            </div>
        </div>
    );
}
