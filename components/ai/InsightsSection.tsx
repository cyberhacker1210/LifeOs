'use client';

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useAuthStore } from '@/stores/useAuthStore';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { motion } from 'framer-motion';

export function InsightsSection() {
    const { profile } = useAuthStore();

    if (!profile?.patterns || profile.patterns.length === 0) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Brain className="w-5 h-5 text-primary" />
                        Insights Comportementaux
                    </CardTitle>
                    <CardDescription>Analyse en cours... Continue de tracker tes sessions pour voir tes patterns émerger.</CardDescription>
                </CardHeader>
            </Card>
        );
    }

    return (
        <div className="space-y-4">
            <h3 className="text-lg font-semibold flex items-center gap-2 px-1">
                <Brain className="w-5 h-5 text-primary" />
                Découvertes de ton Coach IA
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {profile.patterns.map((pattern, index) => (
                    <motion.div
                        key={pattern.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                    >
                        <Card className="h-full border-l-4 border-l-primary/50">
                            <CardContent className="pt-6">
                                <div className="flex gap-4">
                                    <div className="mt-1">
                                        {pattern.impact > 0 ? (
                                            <TrendingUp className="w-5 h-5 text-green-500" />
                                        ) : pattern.impact < 0 ? (
                                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                                        ) : (
                                            <Lightbulb className="w-5 h-5 text-blue-500" />
                                        )}
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-sm font-medium leading-none">
                                            {pattern.type === 'productivity' ? 'Pattern de Productivité' :
                                                pattern.type === 'procrastination' ? 'Alerte Procrastination' : 'Habitude Détectée'}
                                        </p>
                                        <p className="text-sm text-muted-foreground">
                                            {pattern.description}
                                        </p>
                                        <div className="pt-2 flex items-center gap-2">
                                            <div className="h-1 w-16 bg-muted rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-primary"
                                                    style={{ width: `${pattern.confidence * 100}%` }}
                                                />
                                            </div>
                                            <span className="text-[10px] text-muted-foreground uppercase font-semibold">
                                                Confiance {Math.round(pattern.confidence * 100)}%
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </motion.div>
                ))}
            </div>
        </div>
    );
}
