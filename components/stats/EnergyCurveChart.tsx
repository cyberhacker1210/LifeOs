'use client';

import { Area, AreaChart, ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/useAuthStore';

export function EnergyCurveChart() {
    const { profile } = useAuthStore();

    if (!profile?.energyCurve || profile.energyCurve.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Courbe d'Énergie</CardTitle>
                    <CardDescription>Pas encore assez de données pour l'analyse.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <Card className="col-span-1 md:col-span-2">
            <CardHeader>
                <CardTitle>Ta Courbe d'Énergie Quotidienne</CardTitle>
                <CardDescription>Basée sur tes sessions productives. Profil identifié : {profile.chronotype === 'morning' ? 'Lève-tôt ☀️' : profile.chronotype === 'afternoon' ? 'Productif l\'aprem ⛅' : profile.chronotype === 'evening' ? 'Oiseau de nuit 🌙' : 'Mixte 🌓'}</CardDescription>
            </CardHeader>
            <CardContent>
                <div style={{ width: '100%', height: 300 }}>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={profile.energyCurve}>
                            <defs>
                                <linearGradient id="colorEnergy" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8} />
                                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#eee" />
                            <XAxis
                                dataKey="hour"
                                tickFormatter={(tick) => `${tick}h`}
                                stroke="#888888"
                                fontSize={12}
                            />
                            <YAxis hide domain={[0, 100]} />
                            <Tooltip
                                labelFormatter={(label) => `Heure : ${label}h`}
                                contentStyle={{ borderRadius: "8px", border: "none", boxShadow: "0 4px 12px rgba(0,0,0,0.1)" }}
                            />
                            <Area
                                type="monotone"
                                dataKey="level"
                                stroke="#8884d8"
                                fillOpacity={1}
                                fill="url(#colorEnergy)"
                                name="Énergie"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>
            </CardContent>
        </Card>
    );
}
