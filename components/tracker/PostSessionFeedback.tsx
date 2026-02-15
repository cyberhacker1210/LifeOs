'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Star, Smile, Battery, Home, Briefcase, Book, Coffee, Music } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { useTrackerStore } from '@/stores/useTrackerStore';
import { SessionMetadata } from '@/types/tracker';
import { toast } from 'sonner';

export function PostSessionFeedback() {
    const { showFeedback, lastSavedSessionId, setShowFeedback, updateSessionMetadata } = useTrackerStore();

    const [metadata, setMetadata] = useState<SessionMetadata>({
        focus: 3,
        mood: 3,
        energy: 3,
        environment: 'home',
    });

    if (!showFeedback || !lastSavedSessionId) return null;

    const handleSave = async () => {
        await updateSessionMetadata(lastSavedSessionId, metadata);
        setShowFeedback(false);
        toast.success("Merci pour ton retour ! Le Coach IA l'analysera bientôt.");
    };

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-background/80 backdrop-blur-sm">
                <motion.div
                    initial={{ opacity: 0, scale: 0.9, y: 20 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: 20 }}
                    className="w-full max-w-md"
                >
                    <Card className="shadow-2xl border-primary/20">
                        <CardHeader className="text-center pb-2">
                            <div className="flex justify-center mb-2">
                                <div className="p-3 bg-primary/10 rounded-full">
                                    <Star className="w-6 h-6 text-primary fill-primary/20" />
                                </div>
                            </div>
                            <CardTitle>Session terminée !</CardTitle>
                            <CardDescription>Comment s'est passée cette session ? Tes réponses aident l'IA à mieux te connaître.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6 pt-4">
                            {/* Focus Score */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Star className="w-4 h-4 text-amber-500" />
                                    Niveau de concentration (1-5)
                                </Label>
                                <div className="flex justify-between gap-1">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <Button
                                            key={val}
                                            variant={metadata.focus === val ? "default" : "outline"}
                                            className="flex-1 h-10"
                                            onClick={() => setMetadata({ ...metadata, focus: val })}
                                        >
                                            {val}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Energy Score */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Battery className="w-4 h-4 text-green-500" />
                                    Niveau d'énergie
                                </Label>
                                <div className="flex justify-between gap-1">
                                    {[1, 2, 3, 4, 5].map((val) => (
                                        <Button
                                            key={val}
                                            variant={metadata.energy === val ? "default" : "outline"}
                                            className="flex-1 h-10"
                                            onClick={() => setMetadata({ ...metadata, energy: val })}
                                        >
                                            {val}
                                        </Button>
                                    ))}
                                </div>
                            </div>

                            {/* Environment Selector */}
                            <div className="space-y-3">
                                <Label className="flex items-center gap-2">
                                    <Home className="w-4 h-4 text-blue-500" />
                                    Environnement
                                </Label>
                                <div className="grid grid-cols-5 gap-2">
                                    <EnvButton
                                        icon={<Home className="w-4 h-4" />}
                                        active={metadata.environment === 'home'}
                                        onClick={() => setMetadata({ ...metadata, environment: 'home' })}
                                        label="Maison"
                                    />
                                    <EnvButton
                                        icon={<Briefcase className="w-4 h-4" />}
                                        active={metadata.environment === 'office'}
                                        onClick={() => setMetadata({ ...metadata, environment: 'office' })}
                                        label="Bureau"
                                    />
                                    <EnvButton
                                        icon={<Book className="w-4 h-4" />}
                                        active={metadata.environment === 'library'}
                                        onClick={() => setMetadata({ ...metadata, environment: 'library' })}
                                        label="BU"
                                    />
                                    <EnvButton
                                        icon={<Coffee className="w-4 h-4" />}
                                        active={metadata.environment === 'cafe'}
                                        onClick={() => setMetadata({ ...metadata, environment: 'cafe' })}
                                        label="Café"
                                    />
                                    <EnvButton
                                        icon={<Music className="w-4 h-4" />}
                                        active={metadata.environment === 'other'}
                                        onClick={() => setMetadata({ ...metadata, environment: 'other' })}
                                        label="Autre"
                                    />
                                </div>
                            </div>

                            <Button className="w-full h-12 text-lg font-semibold mt-4" onClick={handleSave}>
                                Enregistrer & Analyser
                            </Button>
                        </CardContent>
                    </Card>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}

function EnvButton({ icon, active, onClick, label }: { icon: React.ReactNode, active: boolean, onClick: () => void, label: string }) {
    return (
        <div className="flex flex-col items-center gap-1">
            <Button
                variant={active ? "default" : "outline"}
                size="icon"
                className="w-10 h-10 rounded-full"
                onClick={onClick}
                title={label}
            >
                {icon}
            </Button>
            <span className="text-[10px] text-muted-foreground uppercase">{label}</span>
        </div>
    );
}
