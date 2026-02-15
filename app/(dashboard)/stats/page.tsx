import { Metadata } from 'next';
import { OverviewCards } from '@/components/stats/OverviewCards';
import { WeeklyActivityChart } from '@/components/stats/WeeklyActivityChart';
import { TimeDistributionChart } from '@/components/stats/TimeDistributionChart';

export const metadata: Metadata = {
    title: "Statistiques | LifeOS",
    description: "Visualisez votre productivité",
};

export default function StatsPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold tracking-tight mb-2">Statistiques</h2>
                <p className="text-muted-foreground">
                    Analysez vos habitudes et suivez vos progrès.
                </p>
            </div>

            <OverviewCards />

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                <div className="col-span-4">
                    <WeeklyActivityChart />
                </div>
                <div className="col-span-3">
                    <TimeDistributionChart />
                </div>
            </div>
        </div>
    );
}
