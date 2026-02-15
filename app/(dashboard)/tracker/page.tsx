import { Metadata } from 'next';
import { TimerDisplay } from '@/components/tracker/TimerDisplay';
import { CategorySelector } from '@/components/tracker/CategorySelector';
import { SessionList } from '@/components/tracker/SessionList';

export const metadata: Metadata = {
    title: "Tracker | LifeOS",
    description: "Suivez votre temps et restez productif",
};

export default function TrackerPage() {
    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Time Tracker</h2>
                <p className="text-muted-foreground">
                    Lancez un timer pour mesurer votre productivité. Sélectionnez une catégorie ci-dessous.
                </p>
            </div>

            <div className="grid gap-8 md:grid-cols-[2fr_1fr]">
                <div className="space-y-6">
                    <TimerDisplay />

                    <div className="bg-card rounded-lg border p-4 space-y-3">
                        <h3 className="text-sm font-medium text-muted-foreground">Catégorie active</h3>
                        <CategorySelector />
                    </div>
                </div>

                <div className="md:border-l md:pl-8">
                    <SessionList />
                </div>
            </div>
        </div>
    );
}
