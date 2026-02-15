'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useStats } from '@/hooks/useStats';

const COLORS = {
    'Scolaire': '#4f46e5', // Indigo
    'Sport': '#10b981',    // Emerald
    'Perso': '#f59e0b',    // Amber
    'Projets': '#ec4899',  // Pink
    'Other': '#6b7280'     // Gray
};

export function TimeDistributionChart() {
    const { timeDistribution } = useStats();

    // Transform seconds to minutes for display
    const data = timeDistribution.map(item => ({
        ...item,
        minutes: Math.round(item.value / 60)
    })).filter(item => item.value > 0);

    if (data.length === 0) {
        return (
            <Card className="flex items-center justify-center p-8 text-muted-foreground">
                Pas assez de données pour afficher le graphique.
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>Répartition du Temps</CardTitle>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={data}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                paddingAngle={5}
                                dataKey="minutes"
                            >
                                {data.map((entry, index) => (
                                    <Cell
                                        key={`cell-${index}`}
                                        fill={(COLORS as any)[entry.name] || COLORS.Other}
                                    />
                                ))}
                            </Pie>
                            <Tooltip formatter={(value) => `${value} min`} />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
